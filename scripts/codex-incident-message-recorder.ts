import { appendFileSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { CodexAppServerAdapterOptionsV01, CodexIncidentMessageV01 } from "../lib/vnext/native-host/codex-app-server-adapter";
import { createRecordedCodexAppServerAdapterV01 } from "./codex-app-server-observation-recorder";

const MAX_ARTIFACT_BYTES = 16_384;
const PARAMETERS = ["model", "effort", "reasoning.effort", "reasoning_effort", "temperature", "top_p", "max_output_tokens", "response_format", "text.format", "outputSchema", "permissions"] as const;
type Parameter = typeof PARAMETERS[number];
interface SanitizedIncidentV01 {
  status: "recognized" | "withheld" | "unavailable" | "failed";
  reason: "recognized_sentence" | "message_unavailable" | "truncated_input" | "unrecognized_or_sensitive" | "input_bound_invalid" | "sanitizer_failed";
  explanation: string | null;
  parameter: Parameter | null;
}

/** An incident-only recognizer, not free-text regex redaction. Only complete
 * known sentence forms produce fixed explanations/closed parameter names.
 * Unknown suffixes, echoed config/request data and truncated input withhold.
 * A match reports what the host said; it does not attest a root cause. */
export function sanitizeCodexIncidentMessageV01(input: Pick<CodexIncidentMessageV01,
  "message" | "message_disposition" | "message_utf8_bytes" | "message_truncated"
>): SanitizedIncidentV01 {
  const withheld = (reason: SanitizedIncidentV01["reason"], status: SanitizedIncidentV01["status"] = "withheld"): SanitizedIncidentV01 =>
    ({ status, reason, explanation: null, parameter: null });
  try {
    if (input.message_disposition !== "text") return withheld("message_unavailable", "unavailable");
    if (input.message_truncated) return withheld("truncated_input");
    if (typeof input.message !== "string" || input.message.length > 8_192 ||
        Buffer.byteLength(input.message, "utf8") > 8_192 ||
        Buffer.byteLength(input.message, "utf8") !== input.message_utf8_bytes)
      return withheld("input_bound_invalid");
    const text = input.message.trim();
    // No free-text output. Even a secret that happens to match a diagnostic
    // sentence can produce only one of these public constant explanations.
    let explanation: string | null = null, parameter: Parameter | null = null;
    const unsupported = /^Unsupported parameter: ['"]([A-Za-z_.]+)['"]\.?$/u.exec(text);
    if (unsupported) {
      parameter = PARAMETERS.find(value => value === unsupported[1]) ?? null;
      if (parameter) explanation = `The host reports that the ${parameter} parameter is unsupported.`;
    } else if (/^Invalid schema for response_format: ['"]additionalProperties['"] must be false\.?$/u.test(text)) {
      parameter = "response_format";
      explanation = "The host reports that the response format schema requires additionalProperties to be false.";
    } else if (/^The ['"]gpt-6-astra['"] model is not supported when using Codex with a ChatGPT account\.?$/u.test(text)) {
      parameter = "model";
      explanation = "The host reports that the requested model is unsupported with ChatGPT authentication.";
    } else if (/^Reasoning effort ['"]max['"] is not supported (?:by|for) (?:this|the selected) model\.?$/u.test(text)) {
      parameter = "reasoning.effort";
      explanation = "The host reports that maximum reasoning effort is unsupported by the selected model.";
    } else if (/^Your input exceeds the context window of this model\. Please adjust your input and try again\.$/u.test(text)) {
      explanation = "The host reports that the input exceeds the model context window.";
    } else if (/^Rate limit exceeded\.?$/u.test(text)) {
      explanation = "The host reports a rate limit.";
    } else if (/^The server is temporarily overloaded\. Please try again later\.$/u.test(text)) {
      explanation = "The host reports temporary server overload.";
    }
    if (!explanation) return withheld("unrecognized_or_sensitive");
    if (Buffer.byteLength(explanation, "utf8") > 1_024) return withheld("sanitizer_failed", "failed");
    return { status: "recognized", reason: "recognized_sentence", explanation, parameter };
  } catch {
    return withheld("sanitizer_failed", "failed");
  }
}

/** One fresh local invocation. Compose inside service.adapter_factory(scope),
 * cache the returned adapter for that exact scope, check both setup statuses
 * before Start, then shutdown service, close both captures and read back.
 * No raw closure, async callback, network/model call or raw-message hash. */
export function createIncidentRecordedCodexAppServerAdapterV01(input: {
  directory: string;
  stage: 1;
  adapter_options?: Omit<CodexAppServerAdapterOptionsV01, "incident_message">;
}) {
  if (input.adapter_options && Object.hasOwn(input.adapter_options, "incident_message"))
    throw new Error("codex_incident_parallel_hook_refused");
  const artifactPath = path.join(input.directory, "sanitized-incident.json");
  const statusPath = path.join(input.directory, "incident-capture-status.json");
  let closed = false, observed = false, artifactWritten = false, statusWriteFailed = false;
  let captureFailure: "artifact_create_failed" | "artifact_write_failed" | "artifact_too_large" | "observation_limit" | "capture_closed" | null = null;
  let hookStatus: "not_observed" | "delivered" | "projection_failed" | "hook_failed" = "not_observed";
  let sanitizerStatus: SanitizedIncidentV01["status"] | "not_observed" = "not_observed";
  // This is sanitized output only, retained for exact disk readback comparison.
  let expectedArtifact = "";
  try { writeFileSync(artifactPath, "", { flag: "wx", mode: 0o600 }); }
  catch { throw new Error("codex_incident_artifact_create_failed"); }
  const recorder = createRecordedCodexAppServerAdapterV01({ ...input, adapter_options: {
    ...input.adapter_options,
    incident_message(incident) {
      if (captureFailure) return;
      if (closed) { captureFailure = "capture_closed"; return; }
      if (observed) { captureFailure = "observation_limit"; return; }
      observed = true;
      const sanitized = sanitizeCodexIncidentMessageV01(incident);
      sanitizerStatus = sanitized.status;
      // Explicit projection, never spread/stringify the incident input.
      const artifact = {
        stage: input.stage, run_id: incident.run_id, process_id: incident.process_id,
        thread_id: incident.thread_id, turn_id: incident.turn_id, observed_at_ms: incident.observed_at_ms,
        diagnostic: incident.diagnostic,
        message_disposition: incident.message_disposition,
        message_utf8_bytes: incident.message_utf8_bytes, message_truncated: incident.message_truncated,
        sanitized, authority: "non_authoritative_local_diagnostic",
      };
      try {
        const text = JSON.stringify(artifact) + "\n";
        if (Buffer.byteLength(text, "utf8") > MAX_ARTIFACT_BYTES) { captureFailure = "artifact_too_large"; return; }
        appendFileSync(artifactPath, text, { mode: 0o600 });
        expectedArtifact = text; artifactWritten = true;
      } catch { captureFailure = "artifact_write_failed"; }
    },
    observe(observation) {
      if (observation.incident_message_capture_status) hookStatus = observation.incident_message_capture_status;
      // Preserve the original general observer's exception/control policy.
      input.adapter_options?.observe?.(observation);
    },
  } });
  if (recorder.readCaptureStatus().capture_failure)
    throw new Error("codex_incident_category_capture_create_failed");
  function readIncidentCaptureStatus() {
    return { closed, observed, artifact_written: artifactWritten, hook_status: hookStatus,
      sanitizer_status: sanitizerStatus, capture_failure: captureFailure, status_write_failed: statusWriteFailed };
  }
  return {
    ...recorder,
    readIncidentCaptureStatus,
    closeIncidentCapture() {
      if (!closed) {
        closed = true;
        try { writeFileSync(statusPath, JSON.stringify(readIncidentCaptureStatus()) + "\n", { flag: "wx", mode: 0o600 }); }
        catch { statusWriteFailed = true; }
      }
      return readIncidentCaptureStatus();
    },
    readIncidentCapture() {
      if (!closed) throw new Error("codex_incident_readback_before_close");
      try {
        if (statSync(artifactPath).size > MAX_ARTIFACT_BYTES || statSync(statusPath).size > 4_096)
          throw new Error("bounded_readback");
        const text = readFileSync(artifactPath, "utf8"), statusText = readFileSync(statusPath, "utf8");
        if (text !== expectedArtifact || statusText !== JSON.stringify(readIncidentCaptureStatus()) + "\n")
          throw new Error("readback_mismatch");
        return { artifact: text ? JSON.parse(text) : null, status: JSON.parse(statusText), readback_failure: null };
      } catch {
        return { artifact: null, status: readIncidentCaptureStatus(), readback_failure: "artifact_readback_failed" as const };
      }
    },
  };
}
