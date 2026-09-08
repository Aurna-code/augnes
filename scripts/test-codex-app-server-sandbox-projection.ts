import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";

import { genericCliBuilderInputFixture } from "@/fixtures/vnext/protocol/task-context-packet-v0-1";
import { createCodexAppServerAdapterV01 } from "@/lib/vnext/native-host/codex-app-server-adapter";
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
  assert.equal(readFileSync(networkPath, "utf8"), "0\n");
  assert.equal(readFileSync(cleanupPath, "utf8"), "settled\n");
  console.log("codex app-server sandbox projection: passed");
  await scopedProjectionV01(testRoot);
  } finally {
    rmSync(testRoot, { recursive: true, force: true });
  }
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
  writeFileSync(configFile, '[features]\nmemories=true\nchronicle=true\nplugins=true\n[mcp_servers.inherited]\ncommand="synthetic-must-not-start"\nenabled=true\n[mcp_servers."quoted.server"]\ncommand="synthetic-must-not-start"\n[permissions.old.filesystem]\n"/"="read"\n');
  const scenarios = ["scoped_success", "scoped_unsupported_capability", "scoped_ignored_memory", "scoped_ignored_mcp", "scoped_ignored_permissions", "scoped_mcp_tool", "scoped_profile_mismatch", "scoped_model_mismatch", "scoped_effort_mismatch", "scoped_approval", "scoped_effect", "scoped_settings_drift", "scoped_result_effect", "scoped_cancel"];
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
      assert.equal(received.filter(v => v.method === "turn/start").length, 1);
      for (const entry of trace.filter(entry => entry.kind === "scoped_launch_controls"))
        assert.deepEqual(entry.value, { strict_config: true, ambient_disabled: true, inherited_mcp_disabled: true, synthetic_background_started: false });
    } else if (!['scoped_approval', 'scoped_effect', 'scoped_settings_drift', 'scoped_result_effect', 'scoped_cancel'].includes(scenario)) {
      assert.equal(received.filter(v => v.method === "turn/start").length, 0, scenario);
    }
  }
  const scope = await scopeFor();
  await assert.rejects(assertCodexScopedTaskCurrentV01({ ...scope }, request), /not_source_owned/);
  await assert.rejects(assertCodexScopedTaskCurrentV01(scope, { ...request, packet: { ...request.packet, packet_id: "wrong" } }), /binding_mismatch/);
  const launch = prepareScopedCodexLaunchV01(scope, environment);
  writeFileSync(configFile, '[shell_environment_policy.set]\nUNAPPROVED="synthetic-only"\n');
  assert.throws(() => launch.assert_sources_current(), /configuration_changed/);
  assert.throws(() => prepareScopedCodexLaunchV01(scope, environment), /unapproved_configuration_material/);
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
  writeFileSync(path.join(environment.CODEX_HOME!, "config.toml"), `[features]\nmemories=true\nchronicle=true\nplugins=true\n[mcp_servers.inherited]\ncommand="/usr/bin/touch"\nargs=[${JSON.stringify(startupMarker)}]\nenabled=true\n`);
  const launch = prepareScopedCodexLaunchV01(scope, environment);
  await pinnedConfigurationV01(identity.canonical_native_executable, launch, environment, stage, testRoot);
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
  console.log("pinned App Server: strict launch, experimental initialize, effective named policy and zero callable MCP capabilities verified; outer OS network denial; no account/thread/turn RPC");
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
