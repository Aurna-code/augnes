import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";

import { genericCliBuilderInputFixture } from "@/fixtures/vnext/protocol/task-context-packet-v0-1";
import { createCodexAppServerAdapterV01, type CodexAppServerAdapterOptionsV01 } from "@/lib/vnext/native-host/codex-app-server-adapter";
import { assertCodexScopedTaskCurrentV01, createCodexScopedTaskV01, createCodexFeasibilityWindowV01, prepareScopedCodexLaunchV01 } from "@/lib/vnext/native-host/codex-scoped-task";
import { inspectNativeHostPhysicalRootIdentityV01 } from "@/lib/vnext/native-host/project-root-identity";
import { resolveCodexProductionRuntimeV01 } from "@/lib/vnext/native-host/codex-production-runtime";
import { stopOwnedProcessTreeV01 } from "@/lib/vnext/native-host/owned-process-tree";
import { LiveNativeHostRunServiceV01 } from "@/lib/vnext/runtime/live-native-host-run-service";
import { scheduleNativeHostTimeoutV01 } from "@/lib/vnext/runtime/direct-native-host-round-trip";
import {
  createProtocolSha256V01,
} from "@/lib/vnext/protocol-primitives";
import { buildTaskContextPacketV01 } from "@/lib/vnext/task-context-packet";
import { createRecordedCodexAppServerAdapterV01 } from "./codex-app-server-observation-recorder";
import type { ExternalRefV01 } from "@/types/vnext/external-ref";
import type {
  NativeHostLifecycleEventV01,
  NativeHostRequestV01,
} from "@/types/vnext/native-host-adapter";

async function main(): Promise<void> {
  const testRoot = realpathSync(
    mkdtempSync(path.join(tmpdir(), "augnes-codex-sandbox-test-")),
  );
  try {
  await failedTerminalDiagnosticCaptureV01(testRoot);
  if (process.argv.includes("--failed-terminal-diagnostic-only")) return;
  const runtimeRoot = path.join(testRoot, "runtime");
  const userHome = path.join(testRoot, "home");
  mkdirSync(runtimeRoot, { recursive: true, mode: 0o700 });
  mkdirSync(userHome, { recursive: true, mode: 0o700 });
  const tracePath = path.join(runtimeRoot, "trace.jsonl");
  const cleanupPath = path.join(runtimeRoot, "cleanup.marker");
  const networkPath = path.join(runtimeRoot, "network-count.txt");
  const request = requestV01(testRoot);
  const lifecycle: NativeHostLifecycleEventV01[] = [];
  const adapter = createCodexAppServerAdapterV01({
    launch: {
      command: process.execPath,
      prefix_args: [
        path.join(
          process.cwd(),
          "scripts",
          "fixtures",
          "fake-codex-app-server.mjs",
        ),
      ],
      environment: {
        NODE_ENV: "test",
        HOME: userHome,
        TMPDIR: runtimeRoot,
        PATH: process.env.PATH,
        FAKE_CODEX_SCENARIO: "success",
        FAKE_CODEX_TRACE_PATH: tracePath,
        FAKE_CODEX_CLEANUP_MARKER_PATH: cleanupPath,
        FAKE_CODEX_NETWORK_COUNT_PATH: networkPath,
      },
    },
  });
  const invocation = adapter.invoke(request, {
    cancellation_signal: new AbortController().signal,
    timeout_ms: 10_000,
    stop_settle_timeout_ms: 3_000,
    lifecycle_sink: {
      async report_event(event) {
        lifecycle.push(event);
      },
      async request_approval() {
        throw new Error("sandbox_projection_unexpected_approval");
      },
    },
    resume_binding: null,
  });
  const result = await invocation.result;
  await invocation.settled;
  assert.equal(result.outcome, "completed");
  assert.equal(
    lifecycle.some((event) => event.event_kind === "turn_started"),
    true,
  );
  const trace = readFileSync(tracePath, "utf8")
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line) as {
      kind: string;
      value: Record<string, unknown>;
    });
  const threadStart = trace.find(
    (entry) =>
      entry.kind === "received" && entry.value.method === "thread/start",
  );
  const turnStart = trace.find(
    (entry) =>
      entry.kind === "received" && entry.value.method === "turn/start",
  );
  assert(threadStart);
  assert(turnStart);
  assert.equal(threadStart.value.sandbox, "read-only");
  assert.deepEqual(turnStart.value.sandbox_policy, {
    type: "readOnly",
    networkAccess: false,
  });
  assert.equal(JSON.stringify(threadStart).includes("danger-full-access"), false);
  assert.equal(JSON.stringify(turnStart).includes("dangerFullAccess"), false);
  assert.equal(trace.some(entry => entry.kind === "received" && entry.value.method === "command/exec"), false,
    "The default route must not acquire the scoped environment check");
  assert.equal(readFileSync(networkPath, "utf8"), "0\n");
  assert.equal(readFileSync(cleanupPath, "utf8"), "settled\n");
  console.log("codex app-server sandbox projection: passed");
  await scopedProjectionV01(testRoot);
  } finally {
    rmSync(testRoot, { recursive: true, force: true });
  }
}

async function failedTerminalDiagnosticCaptureV01(testRoot: string): Promise<void> {
  const cases: Array<[string, string, string | null, string, number | null, string?]> = [
    ["string", "recognized", "unauthorized", "not_applicable", null],
    ["http", "recognized", "httpConnectionFailed", "valid", 429],
    ["other", "recognized", "other", "not_applicable", null],
    ["missing", "absent", null, "not_applicable", null],
    ["null", "null", null, "not_applicable", null],
    ["unknown", "unrecognized", null, "not_applicable", null],
    ["unknown_tag", "unrecognized", null, "not_applicable", null],
    ["malformed", "malformed", null, "not_applicable", null],
    ["multiple_tags", "malformed", null, "not_applicable", null],
    ["wrong_string_shape", "malformed", null, "not_applicable", null],
    ["wrong_object_shape", "malformed", null, "not_applicable", null],
    ["invalid_status", "recognized", "responseStreamDisconnected", "invalid", null],
    ["invalid_range", "recognized", "responseStreamDisconnected", "invalid", null],
    ["invalid_fraction", "recognized", "responseStreamDisconnected", "invalid", null],
    ["status_null", "recognized", "responseTooManyFailedAttempts", "null", null],
    ["status_missing", "recognized", "responseStreamConnectionFailed", "absent", null],
    ["malformed_tag", "malformed", null, "not_applicable", null],
    ["active_turn", "recognized", "activeTurnNotSteerable", "not_applicable", null],
    ["malformed_active_turn", "malformed", null, "not_applicable", null],
    ["error_absent", "unavailable", null, "not_applicable", null, "absent"],
    ["error_null", "unavailable", null, "not_applicable", null, "null"],
    ["error_malformed", "unavailable", null, "not_applicable", null, "malformed"],
    ["ignored_notification", "null", null, "not_applicable", null],
    ["duplicate", "recognized", "unauthorized", "not_applicable", null],
  ];
  for (const [name, disposition, category, statusDisposition, status, errorField] of cases) {
    const captured = await runCapturedDiagnosticV01(testRoot, name);
    const diagnostics = captured.rows.filter(row => row.failed_terminal_diagnostic);
    assert.equal(diagnostics.length, 1, name);
    const observation = diagnostics[0];
    const diagnostic = observation.failed_terminal_diagnostic;
    assert.equal(observation.kind, "settled");
    assert.equal(observation.run_id, captured.request.run_id);
    assert.equal(observation.thread_id, "01900000-0000-7000-8000-000000000001");
    assert.equal(observation.turn_id, "01900000-0000-7000-8000-000000000003");
    assert.equal(diagnostic.phase, "accepted_failed_terminal");
    assert.equal(diagnostic.source, "turn/completed");
    assert.equal(diagnostic.error_field, errorField ?? "object", name);
    assert.equal(diagnostic.category_disposition, disposition, name);
    assert.equal(diagnostic.category, category, name);
    assert.equal(diagnostic.http_status_disposition, statusDisposition, name);
    assert.equal(diagnostic.http_status, status, name);
    const started = captured.lifecycle.find(event => event.event_kind === "turn_started")!;
    for (const [key, value] of Object.entries(diagnostic.request_source_binding)) {
      assert.equal(value, started.bounded_metadata[key === "binding_version" ? "request_source_binding_version" : key], name);
    }
    assert.equal(diagnostic.request_source_binding.task_context_packet_fingerprint, captured.request.packet.integrity.fingerprint);
    assert.equal(diagnostic.request_source_binding.request_id, captured.request.request_id);
    assert.equal(captured.result?.outcome, "failed");
    assert.equal(captured.result?.public_stop_reason, "codex_turn_failed");
    assert.equal(captured.result?.summary, "The local Codex App Server run did not complete successfully.");
    assert.equal(JSON.stringify(captured.result).includes("failed_terminal_diagnostic"), false);
    assert.equal(captured.captureStatus.capture_failure, null);
    assert.equal(captured.captureStatus.failed_terminal_diagnostic_written, true);
  }
  for (const name of ["foreign_thread", "foreign_turn", "conflict", "success", "cancel", "timeout", "no_observer", "capture_failure"]) {
    const captured = await runCapturedDiagnosticV01(testRoot, name);
    assert.equal(captured.rows.some(row => row.failed_terminal_diagnostic), false, name);
    if (["foreign_thread", "foreign_turn", "conflict"].includes(name)) {
      assert.equal(captured.result, null, name);
      assert.match(captured.failureCode!, /codex_(thread_identity_mismatch|turn_identity_mismatch|turn_completion_conflict)/);
    } else if (name === "success") assert.equal(captured.result?.outcome, "completed");
    else if (name === "cancel" || name === "timeout") {
      assert.equal(captured.result?.outcome, "cancelled");
      assert.equal(captured.result?.public_stop_reason, name === "timeout" ? "native_host_timeout" : "native_host_cancelled");
    } else {
      assert.equal(captured.result?.public_stop_reason, "codex_turn_failed");
      if (name === "capture_failure") {
        assert.equal(captured.captureStatus.capture_failure, "artifact_write_failed");
        assert.equal(captured.captureStatus.failed_terminal_diagnostic_written, false);
      }
    }
  }
  console.log("failed-terminal diagnostic: 32 finite fake-host capture/readback cases passed; source binding, privacy, generic results, conflict, cancellation and cleanup preserved; zero network");
}

async function runCapturedDiagnosticV01(testRoot: string, name: string) {
  const directory = path.join(testRoot, `diagnostic-${name}`);
  mkdirSync(directory);
  const home = path.join(directory, "home"); mkdirSync(home);
  const request = requestV01(directory);
  request.request_id += `-${name}`; request.run_id += `-${name}`;
  const lifecycle: NativeHostLifecycleEventV01[] = [];
  const cancellation = new AbortController();
  const eventsPath = path.join(directory, "events.jsonl");
  const cleanupPath = path.join(directory, "cleanup.marker");
  const networkPath = path.join(directory, "network-count.txt");
  const scenario = name === "success" ? "success" :
    name === "cancel" || name === "timeout" ? "terminal_diagnostic_wait" :
    name === "no_observer" || name === "capture_failure" ? "terminal_diagnostic_string" : `terminal_diagnostic_${name}`;
  const options: CodexAppServerAdapterOptionsV01 = {
    launch: { command: process.execPath,
      prefix_args: [path.join(process.cwd(), "scripts/fixtures/fake-codex-app-server.mjs")],
      environment: { NODE_ENV: "test", HOME: home, TMPDIR: directory, PATH: process.env.PATH,
        FAKE_CODEX_SCENARIO: scenario, FAKE_CODEX_CLEANUP_MARKER_PATH: cleanupPath, FAKE_CODEX_NETWORK_COUNT_PATH: networkPath } },
    observe: (observation: { kind: string }) => {
      if (observation.kind !== "turn_started") return;
      if (name === "capture_failure") { rmSync(eventsPath); mkdirSync(eventsPath); }
      if (name === "cancel" || name === "timeout") {
        cancellation.abort("synthetic_stop");
        void invocation.request_stop({ reason: name === "timeout" ? "timeout" : "cancellation_requested" });
      }
    },
  };
  const recorder = createRecordedCodexAppServerAdapterV01({ directory, stage: 1, adapter_options: options });
  const adapter = name === "no_observer" ? createCodexAppServerAdapterV01({ launch: options.launch }) : recorder.adapter;
  const invocation = adapter.invoke(request, { cancellation_signal: cancellation.signal,
    timeout_ms: 5_000, stop_settle_timeout_ms: 2_000, resume_binding: null,
    lifecycle_sink: { async report_event(event) { lifecycle.push(event); }, async request_approval() { throw new Error("unexpected_approval"); } } });
  let deadlineExpired = false;
  const clearDeadline = scheduleNativeHostTimeoutV01({ timeout_ms: 5_000, on_timeout() {
    deadlineExpired = true; cancellation.abort("test_deadline"); void invocation.request_stop({ reason: "timeout" });
  } });
  let result = null, failureCode: string | null = null;
  try { result = await invocation.result; }
  catch (error) { failureCode = (error as { code: string }).code; }
  finally {
    try { await invocation.settled; }
    finally { clearDeadline(); recorder.closeCapture(); }
  }
  assert.equal(deadlineExpired, false, name);
  assert.equal(readFileSync(cleanupPath, "utf8"), "settled\n", name);
  assert.equal(readFileSync(networkPath, "utf8"), "0\n", name);
  const captureStatus = JSON.parse(readFileSync(path.join(directory, "adapter-capture-status.json"), "utf8"));
  assert.deepEqual(captureStatus, recorder.readCaptureStatus());
  assert.equal(captureStatus.closed, true);
  assert.equal(captureStatus.status_write_failed, false);
  const text = name === "capture_failure" ? "" : readFileSync(eventsPath, "utf8");
  assert.equal(text.includes("SYNTHETIC_DIAGNOSTIC_SECRET_DO_NOT_CAPTURE"), false, name);
  assert.equal(text.includes(createHash("sha256").update("SYNTHETIC_DIAGNOSTIC_SECRET_DO_NOT_CAPTURE").digest("hex")), false, name);
  const rows = text.trim() ? text.trim().split("\n").map(line => JSON.parse(line)) : [];
  assert(rows.length <= 64);
  return { request, lifecycle, result, failureCode, rows, captureStatus };
}

async function scopedProjectionV01(testRoot: string): Promise<void> {
  const stage = path.join(testRoot, "stage");
  const codexHome = path.join(testRoot, "synthetic-codex-home");
  mkdirSync(stage); mkdirSync(codexHome);
  writeFileSync(path.join(stage, "TASK.txt"), "Synthetic approved read only.\n");
  const held = path.join(testRoot, "held.txt");
  writeFileSync(held, "Synthetic held material.\n");
  const hash = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");
  const request = requestV01(stage);
  request.root_scope.physical_root_identity = await inspectNativeHostPhysicalRootIdentityV01(stage);
  const scopeFor = (stageNumber: 1 | 2 = 1, packet = request.packet) => createCodexScopedTaskV01({
    stage: stageNumber, canonical_root: stage, packet_id: packet.packet_id, packet_fingerprint: packet.integrity.fingerprint,
    guide_brief_fingerprint: createProtocolSha256V01("null"),
    files: [{ relative_path: "TASK.txt", sha256: hash(path.join(stage, "TASK.txt")) }],
  });
  const environment: NodeJS.ProcessEnv = { NODE_ENV: "test", HOME: path.join(testRoot, "home"), CODEX_HOME: codexHome, TMPDIR: path.join(testRoot, "runtime"), PATH: "/usr/bin:/bin:/usr/sbin:/sbin" };
  const configFile = path.join(codexHome, "config.toml");
  writeFileSync(configFile, '[shell_environment_policy.set]\nPATH="/synthetic/unapproved"\nSYNTHETIC_SECRET="secret-like-sentinel"\nORDINARY_SENTINEL="ordinary-sentinel"\n[shell_environment_policy.filters]\n"*"="include"\n[features]\nmemories=true\nchronicle=true\nplugins=true\n[mcp_servers.inherited]\ncommand="synthetic-must-not-start"\nenabled=true\n[mcp_servers."quoted.server"]\ncommand="synthetic-must-not-start"\n[permissions.old.filesystem]\n"/"="read"\n');
  const scenarios = ["scoped_success", "scoped_unsupported_capability", "scoped_ignored_memory", "scoped_ignored_mcp", "scoped_ignored_permissions", "scoped_ignored_environment_filter", "scoped_command_environment_mismatch", "scoped_mcp_tool", "scoped_profile_mismatch", "scoped_model_mismatch", "scoped_effort_mismatch", "scoped_approval", "scoped_effect", "scoped_settings_drift", "scoped_result_effect", "scoped_cancel"];
  for (const scenario of scenarios) {
    const scope = await scopeFor();
    const tracePath = path.join(testRoot, `${scenario}.jsonl`);
    const cleanupPath = path.join(testRoot, `${scenario}.cleanup`);
    const networkPath = path.join(testRoot, `${scenario}.network`);
    const cancellation = new AbortController();
    const adapter = createCodexAppServerAdapterV01({ scoped_task: scope,
      observe: observation => {
        if (scenario === "scoped_cancel" && observation.kind === "turn_started") {
          cancellation.abort("synthetic_cancellation");
          // Match the existing direct-round-trip cancellation owner: abort
          // and request_stop are separate parts of the adapter contract.
          void invocation.request_stop({ reason: "cancellation_requested" });
        }
      },
      launch: {
      command: process.execPath, prefix_args: [path.join(process.cwd(), "scripts/fixtures/fake-codex-app-server.mjs")],
      environment: { ...environment, FAKE_CODEX_SCENARIO: scenario, FAKE_CODEX_TRACE_PATH: tracePath,
        FAKE_CODEX_CLEANUP_MARKER_PATH: cleanupPath, FAKE_CODEX_NETWORK_COUNT_PATH: networkPath },
    } });
    let approvals = 0;
    const invocation = adapter.invoke(request, { cancellation_signal: cancellation.signal, timeout_ms: 10_000,
      stop_settle_timeout_ms: 3_000, resume_binding: null, lifecycle_sink: {
        async report_event() {}, async request_approval() { approvals++; throw new Error("unexpected_approval"); },
      } });
    let testDeadlineExpired = false;
    const clearDeadline = scheduleNativeHostTimeoutV01({ timeout_ms: 10_000, on_timeout() {
      testDeadlineExpired = true; cancellation.abort("synthetic_test_deadline");
      void invocation.request_stop({ reason: "timeout" });
    } });
    let result;
    try { result = await invocation.result.catch(() => null); await invocation.settled; }
    finally { clearDeadline(); }
    assert.equal(testDeadlineExpired, false, scenario);
    if (scenario === "scoped_success") assert.equal(result?.outcome, "completed");
    else assert.notEqual(result?.outcome, "completed", scenario);
    assert.equal(approvals, 0, scenario);
    assert.equal(readFileSync(cleanupPath, "utf8"), "settled\n", scenario);
    assert.equal(readFileSync(networkPath, "utf8"), "0\n", scenario);
    const trace = readFileSync(tracePath, "utf8").trim().split("\n").map(line => JSON.parse(line));
    const received = trace.filter(entry => entry.kind === "received").map(entry => entry.value);
    assert.deepEqual(received.find(v => v.method === "initialize").capabilities, { experimentalApi: true });
    assert.equal(received.filter(v => v.method === "thread/resume").length, 0);
    assert(received.filter(v => v.method === "thread/start").length <= 1);
    assert(received.filter(v => v.method === "turn/start").length <= 1);
    for (const v of received.filter(v => ["thread/start", "turn/start"].includes(v.method))) {
      assert.equal(v.permissions, `augnes_synthetic_${scope.fingerprint.slice(7)}`);
      assert.equal(v.legacy_policy_present, false);
      assert.equal(v.model, "gpt-6-astra");
      assert.equal(v.approval_policy, "never");
    }
    if (scenario === "scoped_success") {
      assert.equal(received.filter(v => v.method === "command/exec").length, 1);
      assert(received.findIndex(v => v.method === "command/exec") < received.findIndex(v => v.method === "thread/start"));
      assert.equal(received.filter(v => v.method === "turn/start").length, 1);
      for (const entry of trace.filter(entry => entry.kind === "scoped_launch_controls"))
        assert.deepEqual(entry.value, { strict_config: true, ambient_disabled: true, inherited_mcp_disabled: true, synthetic_background_started: false });
    } else if (!['scoped_approval', 'scoped_effect', 'scoped_settings_drift', 'scoped_result_effect', 'scoped_cancel'].includes(scenario)) {
      assert.equal(received.filter(v => v.method === "turn/start").length, 0, scenario);
    }
    if (scenario === "scoped_command_environment_mismatch")
      assert.equal(received.filter(v => v.method === "account/read" || v.method === "thread/start").length, 0);
  }
  const scope = await scopeFor();
  await assert.rejects(assertCodexScopedTaskCurrentV01({ ...scope }, request), /not_source_owned/);
  await assert.rejects(assertCodexScopedTaskCurrentV01(scope, { ...request, packet: { ...request.packet, packet_id: "wrong" } }), /binding_mismatch/);
  const launch = prepareScopedCodexLaunchV01(scope, environment);
  writeFileSync(configFile, '[shell_environment_policy.set]\nUNAPPROVED="synthetic-only"\n');
  assert.throws(() => launch.assert_sources_current(), /configuration_changed/);
  scopedShellEnvironmentV01(scope, environment, configFile);
  writeFileSync(configFile, 'developer_instructions="synthetic private text"\n');
  assert.throws(() => prepareScopedCodexLaunchV01(scope, environment), /unapproved_configuration_material/);
  writeFileSync(configFile, "");
  writeFileSync(path.join(codexHome, "AGENTS.md"), "Synthetic unapproved instructions.\n");
  assert.throws(() => prepareScopedCodexLaunchV01(scope, environment), /unapproved_instructions/);
  rmSync(path.join(codexHome, "AGENTS.md"));
  symlinkSync(held, path.join(stage, "escape.txt"));
  await assert.rejects(assertCodexScopedTaskCurrentV01(scope), /stage_inventory_changed/);
  rmSync(path.join(stage, "escape.txt"));
  const original = readFileSync(path.join(stage, "TASK.txt"));
  rmSync(path.join(stage, "TASK.txt")); symlinkSync(held, path.join(stage, "TASK.txt"));
  await assert.rejects(assertCodexScopedTaskCurrentV01(scope), /file_unavailable_or_changed/);
  rmSync(path.join(stage, "TASK.txt")); writeFileSync(path.join(stage, "TASK.txt"), original);
  await clockBoundaryV01(scopeFor, request);
  if (process.argv.includes("--pinned-host-sandbox")) await pinnedSandboxV01(testRoot, stage, held, environment, await scopeFor());
  console.log(`codex scoped projection: ${scenarios.length} fake-host scenarios; source/ambient/clock refusals passed; study calls=0`);
}

function scopedShellEnvironmentV01(scope: Awaited<ReturnType<typeof createCodexScopedTaskV01>>, environment: NodeJS.ProcessEnv, configFile: string): void {
  const safePath = "/usr/bin:/bin:/usr/sbin:/sbin";
  for (const filter of ['include_only=["*"]\nexclude=["PATH"]', '[shell_environment_policy.filters]\n"*"="include"']) {
    writeFileSync(configFile, `[shell_environment_policy]\ninherit="all"\nexperimental_use_profile=true\n${filter}\n[shell_environment_policy.set]\nPATH="/synthetic/unapproved"\nSYNTHETIC_SECRET="secret-like-sentinel"\nORDINARY_SENTINEL="ordinary-sentinel"\n`);
    const original = readFileSync(configFile);
    const launch = prepareScopedCodexLaunchV01(scope, environment);
    const projected = JSON.stringify({ args: launch.args, settings: launch.settings, check: launch.command_environment_check });
    for (const sentinel of ["secret-like-sentinel", "ordinary-sentinel", "/synthetic/unapproved"])
      assert.equal(projected.includes(sentinel), false, "Private set values must not enter launch or diagnostic material");
    assert.deepEqual(launch.settings.shell_environment_policy, { inherit: "none", ignore_default_excludes: false,
      set: { PATH: safePath }, include_only: ["PATH"], exclude: [], experimental_use_profile: false });
    const response = { config: structuredClone(launch.settings), layers: [{ name: { type: "user", file: configFile } }, { name: { type: "sessionFlags" } }] };
    const policy = response.config.shell_environment_policy as Record<string, unknown>;
    policy.set = { PATH: safePath, SYNTHETIC_SECRET: "secret-like-sentinel", ORDINARY_SENTINEL: "ordinary-sentinel" };
    launch.assert_configuration(response);
    for (const mutation of [
      { include_only: ["*"] }, { inherit: "all" }, { ignore_default_excludes: true }, { experimental_use_profile: true },
      { set: { PATH: "/synthetic/unapproved" } }, { set: { PATH: safePath, Path: "alias-sentinel" } },
      { include_only: null, filters: { PATH: "include", "*": "include" } }, { unknown_policy: true },
    ]) assert.throws(() => launch.assert_configuration({ ...response, config: { ...response.config,
      shell_environment_policy: { ...policy, ...mutation } } }), /shell_environment/);
    policy.include_only = null; policy.exclude = null; policy.filters = { path: "include" };
    launch.assert_configuration(response); // Pinned canonical filter representation.
    launch.assert_command_environment({ exitCode: 0, stdout: "augnes-scoped-environment-ok\n", stderr: "" });
    assert.throws(() => launch.assert_command_environment({ exitCode: 61, stdout: "", stderr: "" }), /command_environment_mismatch/);
    assert.throws(() => launch.assert_command_environment({ exitCode: 0, stdout: "unexpected-sentinel\n", stderr: "" }), /command_environment_mismatch/);
    assert.deepEqual(readFileSync(configFile), original);
  }
  for (const source of [
    '[shell_environment_policy.set]\npath="alias-sentinel"',
    '[shell_environment_policy.set]\nPath="alias-sentinel"',
    '[shell_environment_policy.set]\nVALUE=12',
    '[shell_environment_policy]\nunknown_policy=true',
    '[shell_environment_policy]\ninherit=["none"]',
    '[shell_environment_policy]\ninclude_only="PATH"',
    '[shell_environment_policy]\ninclude_only=["PATH"]\n[shell_environment_policy.filters]\nPATH="include"',
    '[shell_environment_policy.filters]\nPATH="include"\npath="exclude"',
    '[shell_environment_policy.filters]\nPATH="unknown"',
  ]) {
    writeFileSync(configFile, source);
    assert.throws(() => prepareScopedCodexLaunchV01(scope, environment), /shell_environment/);
  }
  console.log("scoped shell environment: closed final filter, source/effective aliases and malformed policies refused, private values absent from projection, default route unchanged");
}

async function clockBoundaryV01(scopeFor: (stage?: 1 | 2, packet?: NativeHostRequestV01["packet"]) => ReturnType<typeof createCodexScopedTaskV01>, request: NativeHostRequestV01): Promise<void> {
  const successorPacket = { ...request.packet, packet_id: "packet:synthetic-successor", integrity: { ...request.packet.integrity, fingerprint: createProtocolSha256V01("synthetic-successor") } };
  const scope1 = await scopeFor(), scope2 = await scopeFor(2, successorPacket);
  const successor = { ...request, packet: successorPacket, task_context_packet_ref: refV01("task_context_packet", successorPacket.packet_id) };
  let time = 0;
  const window = createCodexFeasibilityWindowV01(() => time);
  assert.deepEqual(window.snapshot(), { attempts: 0, active: false, stopped: false, remaining_window_ms: null });
  const first = window.begin(scope1, 999_999, 10_000);
  assert.equal(first.timeout_ms, 180_000);
  first.finish(true);
  time = 589_999;
  const second = window.begin(scope2, 180_000, 10_000);
  assert.equal(second.timeout_ms, 1);
  await second.before_invoke(successor);
  let scheduled = 0, expired = false;
  second.schedule(input => { scheduled = input.timeout_ms; return () => {}; })({ timeout_ms: 180_000, on_timeout() {} });
  assert.equal(scheduled, 1);
  time = 590_000;
  second.schedule(() => { throw new Error("expired timer should not be scheduled"); })({ timeout_ms: 180_000, on_timeout() { expired = true; } });
  assert(expired);
  await assert.rejects(second.before_invoke(successor), /window_expired/);
  second.finish(false);
  assert.throws(() => window.begin(scope2, 180_000, 10_000), /window_start_refused/);
  for (const delay of [590_000, 600_001]) {
    time = 0; const w = createCodexFeasibilityWindowV01(() => time);
    w.begin(scope1, 180_000, 10_000).finish(true); time = delay;
    assert.throws(() => w.begin(scope2, 180_000, 10_000), /window_expired/);
  }
  time = 0;
  const smaller = createCodexFeasibilityWindowV01(() => time).begin(scope1, 5_000, 2_000);
  assert.equal(smaller.timeout_ms, 5_000); assert.equal(smaller.stop_settle_timeout_ms, 2_000);
  const failed = createCodexFeasibilityWindowV01(() => time);
  failed.begin(scope1, 180_000, 10_000).finish(false);
  assert.throws(() => failed.begin(scope2, 180_000, 10_000), /window_start_refused/);
  const service = new LiveNativeHostRunServiceV01({ scoped_task: { scope: scope1, window: createCodexFeasibilityWindowV01() }, timeout_ms: 200_000, stop_settle_timeout_ms: 20_000 });
  assert.equal(service.readCapabilityContractV01().timeout_ms, 180_000);
  assert.equal(service.readCapabilityContractV01().stop_settle_timeout_ms, 10_000);
  assert.equal(service.readCapabilityContractV01().resumable_after_detach, false);
  const wrongAdapter = new LiveNativeHostRunServiceV01({ scoped_task: { scope: scope1, window: createCodexFeasibilityWindowV01() }, adapter_factory: () => createCodexAppServerAdapterV01() });
  assert.throws(() => wrongAdapter.readCapabilityContractV01(), /adapter_binding_missing/);
}

async function pinnedSandboxV01(testRoot: string, stage: string, held: string, environment: NodeJS.ProcessEnv, scope: Awaited<ReturnType<typeof createCodexScopedTaskV01>>): Promise<void> {
  assert.equal(process.platform, "darwin", "This explicit check requires the pinned macOS host");
  const identity = resolveCodexProductionRuntimeV01(); // Read-only selection; no install, login, qualification, or model turn.
  const startupMarker = path.join(testRoot, "unapproved-mcp-started");
  const configFile = path.join(environment.CODEX_HOME!, "config.toml");
  const authFile = path.join(environment.CODEX_HOME!, "auth.json");
  writeFileSync(authFile, "{}\n"); // Empty synthetic file store; never copy production auth.
  const authBefore = readFileSync(authFile);
  for (const filter of ['include_only=["*"]\nexclude=["PATH"]', '[shell_environment_policy.filters]\n"*"="include"']) {
    writeFileSync(configFile, `[shell_environment_policy]\ninherit="all"\nexperimental_use_profile=true\n${filter}\n[shell_environment_policy.set]\nPATH="/synthetic/unapproved"\nSYNTHETIC_SECRET="secret-like-sentinel"\nORDINARY_SENTINEL="ordinary-sentinel"\nBASH_ENV="/synthetic/no-profile"\nCODEX_UNAPPROVED="not-runtime-metadata"\n[features]\nmemories=true\nchronicle=true\nplugins=true\n[mcp_servers.inherited]\ncommand="/usr/bin/touch"\nargs=[${JSON.stringify(startupMarker)}]\nenabled=true\n`);
    const original = readFileSync(configFile);
    await pinnedConfigurationV01(identity.canonical_native_executable, prepareScopedCodexLaunchV01(scope, environment), environment, stage, testRoot);
    assert.deepEqual(readFileSync(configFile), original, "Diagnostic must leave original synthetic config unchanged");
    assert.deepEqual(readFileSync(authFile), authBefore, "Diagnostic must leave original synthetic auth unchanged");
  }
  const launch = prepareScopedCodexLaunchV01(scope, environment);
  assert.equal(statExistsV01(startupMarker), false, "Inherited MCP must be disabled before process startup");
  // The pinned diagnostic subcommand explicitly does not support strict-config.
  // Its named permission/profile projection is the same; App Server retains
  // strict-config and its separate configuration/handshake refusal checks.
  const command = (args: string[], afterPolicyInstalled?: () => void) => boundedCommandV01(identity.canonical_native_executable, [...launch.args.filter(arg => arg !== "--strict-config"), "sandbox", "--permission-profile", launch.profile_name, "--cd", stage, "--", ...args], environment, stage, afterPolicyInstalled);
  const allowed = await command(["/bin/cat", path.join(stage, "TASK.txt")]);
  assert.equal(allowed.code, 0, allowed.stderr);
  assert.equal(allowed.stdout, "Synthetic approved read only.\n");
  const denied = await command(["/bin/cat", held]);
  assert.notEqual(denied.code, 0); assert.equal(denied.stdout, ""); assert.match(denied.stderr, /Operation not permitted|Permission denied/);
  symlinkSync(held, path.join(stage, "escape.txt"));
  const escape = await command(["/bin/cat", path.join(stage, "escape.txt")]);
  rmSync(path.join(stage, "escape.txt"));
  assert.notEqual(escape.code, 0); assert.equal(escape.stdout, ""); assert.match(escape.stderr, /Operation not permitted|Permission denied/);
  const write = await command(["/bin/sh", "-c", 'printf forbidden > TASK.txt']);
  assert.notEqual(write.code, 0);
  assert.equal(readFileSync(path.join(stage, "TASK.txt"), "utf8"), "Synthetic approved read only.\n");
  // Pre-existing selected symlinks are refused by the real source/hash gate
  // above. The pinned diagnostic canonicalizes them before compiling policy.
  // Test the OS boundary after policy installation, including an external
  // swap the read-only worker itself cannot perform.
  const selectedEscape = await command(["/bin/sh", "-c", 'printf "POLICY_READY\\n"; read token; /bin/cat TASK.txt'], () => {
    rmSync(path.join(stage, "TASK.txt")); symlinkSync(held, path.join(stage, "TASK.txt"));
  });
  rmSync(path.join(stage, "TASK.txt")); writeFileSync(path.join(stage, "TASK.txt"), "Synthetic approved read only.\n");
  assert.notEqual(selectedEscape.code, 0); assert.equal(selectedEscape.stdout, "POLICY_READY\n");
  assert.match(selectedEscape.stderr, /Operation not permitted|Permission denied/);
  let requests = 0;
  const server = createServer((_req, res) => { requests++; res.end("synthetic\n"); });
  try {
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    const address = server.address(); assert(address && typeof address !== "string");
    const args = ["--noproxy", "*", "--connect-timeout", "1", "--max-time", "2", `http://127.0.0.1:${address.port}/`];
    const control = await boundedCommandV01("/usr/bin/curl", args, environment, stage);
    assert.equal(control.code, 0); assert.equal(requests, 1);
    const network = await command(["/usr/bin/curl", ...args]);
    assert.notEqual(network.code, 0); assert.equal(requests, 1);
  } finally { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
  assert.equal(statExistsV01(startupMarker), false);
  console.log("pinned 0.152.1 macOS sandbox: approved read allowed; held read, symlink, write, loopback command network denied; credential-free; model turns=0; cleanup settled");
}

function statExistsV01(filename: string): boolean {
  try { statSync(filename); return true; } catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return false; throw error; }
}

async function pinnedConfigurationV01(executable: string, launch: ReturnType<typeof prepareScopedCodexLaunchV01>, environment: NodeJS.ProcessEnv, stage: string, testRoot: string): Promise<void> {
  // Credential-free protocol/configuration check, with an outer OS network
  // denial even if a launch suppression regresses. Never start a thread/turn.
  // The diagnostic's synthetic HOME and file-only store cannot select the
  // user's ordinary keyring. These are test controls, not product auth changes.
  const outerProfile = `permissions.protocol_test={filesystem={":minimal"="read",${JSON.stringify(testRoot)}="write",${JSON.stringify(executable)}="read"},network={enabled=false}}`;
  const args = ["-c", outerProfile, "-c", 'shell_environment_policy.inherit="all"', "sandbox", "--permission-profile", "protocol_test", "--cd", stage, "--", executable,
    ...launch.args, "-c", 'cli_auth_credentials_store="file"', "app-server", "--stdio"];
  const child = spawn(executable, args, { cwd: stage, env: environment, stdio: ["pipe", "pipe", "pipe"] });
  let pending = "", stderr = "", completed = false;
  child.stderr.on("data", data => { stderr += data; });
  const timer = setTimeout(() => { void stopOwnedProcessTreeV01(child, { graceful_timeout_ms: 500, forced_timeout_ms: 2_000 }); }, 10_000);
  const send = (message: unknown) => child.stdin.write(`${JSON.stringify(message)}\n`);
  try {
    await new Promise<void>((resolve, reject) => {
      child.once("error", reject);
      child.once("close", code => { if (!completed) reject(new Error(`scoped_pinned_configuration_closed:${code}:${stderr.slice(0, 600)}`)); });
      child.stdout.on("data", data => {
        pending += data;
        try {
          for (;;) {
            const index = pending.indexOf("\n"); if (index < 0) break;
            const line = pending.slice(0, index); pending = pending.slice(index + 1);
            if (!line.trim()) continue;
            const message = JSON.parse(line);
            if (message.error) throw new Error("scoped_pinned_rpc_refused");
            if (message.id === 1) {
              assert.match(message.result.userAgent, /0\.152\.1/);
              send({ method: "initialized", params: {} });
              send({ id: 2, method: "config/read", params: { includeLayers: true } });
            } else if (message.id === 2) {
              launch.assert_configuration(message.result);
              send({ id: 3, method: "mcpServerStatus/list", params: {} });
            } else if (message.id === 3) {
              launch.assert_mcp_catalog(message.result);
              // macOS refuses a second seatbelt installation in this already
              // sandboxed diagnostic. The outer profile remains the OS owner.
              // command/exec builds its environment before sandbox selection;
              // this exercises that real consumer, not a replacement env_clear.
              // Production always uses the named profile, never this override.
              const { permissionProfile: _profile, ...check } = launch.command_environment_check;
              send({ id: 4, method: "command/exec", params: { ...check,
                sandboxPolicy: { type: "externalSandbox", networkAccess: "restricted" } } });
            } else if (message.id === 4) {
              try { launch.assert_command_environment(message.result); }
              catch {
                throw new Error(`pinned_command_environment_refused:${JSON.stringify({ exit_code: message.result.exitCode,
                  stdout_matches: message.result.stdout === "augnes-scoped-environment-ok\n", stderr_empty: message.result.stderr === "",
                  sandbox_denial: /Operation not permitted|Permission denied/.test(message.result.stderr ?? "") })}`);
              }
              completed = true; child.stdin.end(); resolve();
            } else if (message.method && /mcpServer\/startup|model\/|hook\//.test(message.method)) {
              throw new Error("scoped_pinned_unexpected_startup_capability");
            }
          }
        } catch (error) { reject(error); }
      });
      send({ id: 1, method: "initialize", params: { clientInfo: { name: "augnes", version: "scoped-model-free-test" }, capabilities: { experimentalApi: true } } });
    });
  } finally {
    clearTimeout(timer); child.stdin.destroy();
    assert.equal((await stopOwnedProcessTreeV01(child, { graceful_timeout_ms: 1_000, forced_timeout_ms: 2_000 })).settled, true);
  }
  console.log("pinned App Server: strict launch, effective closed shell filter and actual command/exec environment predicate passed; inherited PATH replaced, secret-like/ordinary/profile/CODEX sentinels excluded; zero callable MCP; externalSandbox command uses existing outer OS network denial; no account/thread/turn RPC");
}

async function boundedCommandV01(command: string, args: string[], environment: NodeJS.ProcessEnv, cwd: string, afterPolicyInstalled?: () => void): Promise<{ code: number | null; stdout: string; stderr: string }> {
  const child = spawn(command, args, { cwd, env: environment, stdio: ["pipe", "pipe", "pipe"] });
  let stdout = "", stderr = "";
  let released = false;
  child.stdout.on("data", data => {
    stdout += data;
    if (afterPolicyInstalled && !released && stdout.includes("POLICY_READY\n")) {
      released = true; afterPolicyInstalled(); child.stdin.end("continue\n");
    }
  }); child.stderr.on("data", data => { stderr += data; });
  if (!afterPolicyInstalled) child.stdin.end();
  const timer = setTimeout(() => { void stopOwnedProcessTreeV01(child, { graceful_timeout_ms: 500, forced_timeout_ms: 2_000 }); }, 10_000);
  try {
    const code = await new Promise<number | null>((resolve, reject) => { child.once("error", reject); child.once("close", resolve); });
    return { code, stdout, stderr };
  } finally {
    clearTimeout(timer);
    assert.equal((await stopOwnedProcessTreeV01(child, { graceful_timeout_ms: 500, forced_timeout_ms: 2_000 })).settled, true);
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

function requestV01(root: string): NativeHostRequestV01 {
  const packet = buildTaskContextPacketV01(
    structuredClone(genericCliBuilderInputFixture),
  );
  const canonicalRoot = realpathSync(root);
  const stat = statSync(canonicalRoot, { bigint: true });
  const fingerprint = createProtocolSha256V01(`sandbox-root:${canonicalRoot}`);
  return {
    request_version: "native_host_request.v0.1",
    request_id: "host-request:codex-sandbox-projection",
    run_id: "host-run:codex-sandbox-projection",
    idempotency_key: createProtocolSha256V01("codex-sandbox-projection"),
    workspace_id: packet.workspace_id,
    project_id: packet.project_id,
    work_ref: refV01("work", "work:codex-sandbox-projection"),
    task_ref: refV01("task", "task:codex-sandbox-projection"),
    task_context_packet_ref: refV01("task_context_packet", packet.packet_id),
    packet,
    packet_lineage: {
      source_transition_receipt_ref: refV01(
        "state_transition_receipt",
        "transition:codex-sandbox-projection",
      ),
      packet_source_refs: [],
      selected_context_refs: [],
    },
    mode: "interactive",
    root_scope: {
      canonical_root: canonicalRoot,
      path_flavor: "posix",
      root_kind: "plain_folder",
      root_fingerprint: fingerprint,
      physical_root_identity: {
        identity_version: "native_host_physical_root_identity.v0.1",
        canonical_realpath_fingerprint: fingerprint,
        device: String(stat.dev),
        inode: String(stat.ino),
      },
      root_scope_ref: refV01("project_root_scope", "sandbox-projection-root"),
      repository_ref: null,
      selected_worktree_ref: null,
    },
    requested_capability: "project_scoped_structured_task_round_trip.v0.1",
    allowed_operation_categories: [
      "read_validated_task_context",
      "return_bounded_structured_result",
    ],
    forbidden_operation_categories: [
      "filesystem_outside_selected_project_root",
      "external_state_mutation",
    ],
    packet_capability_grant: null,
    execution_grant_ref: null,
    automation_context: null,
    repository_delegation_context: null,
    policy: {
      filesystem: "selected_project_root_only",
      network: "exact_grant_only",
      commands: "approval_required",
      model: "native_host_managed",
      host_egress: "explicit_interactive_start",
      max_changed_files: 8,
      max_artifacts: 8,
      max_commands: 8,
      max_checks: 16,
      timeout_ms: 10_000,
      stop_settle_timeout_ms: 3_000,
      stop_conditions: ["timeout", "cancellation_requested"],
    },
    result_return: {
      return_version: "native_host_result_return.v0.1",
      structured_result_required: true,
      legacy_result_text_allowed: false,
      raw_output_allowed: false,
      max_result_bytes: 128 * 1024,
    },
  };
}

function refV01(refType: string, externalId: string): ExternalRefV01 {
  return {
    ref_version: "external_ref.v0.1",
    ref_type: refType,
    external_id: externalId,
    observed_at: "2026-09-03T00:00:00.000Z",
    trust_class: "direct_local_observation",
  };
}
