/** Explicit credential-free extension of the sandbox-projection fixture.
 * As in pinned upstream app-server/tests/suite/v2/code_mode_host.rs, only the
 * Responses producer is fixed local SSE. Router, helper, ExecCommandHandler,
 * permission/environment projection and OS sandbox are the real native code.
 * This is not an authenticated model-selected dispatch or a native RunReceipt.
 */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import {
  assertCodexManagedRuntimeSelectionUnchangedV01, CODEX_SCOPED_CODE_MODE_HOST_V01,
  ensurePinnedCodexManagedRuntimeV01, ensurePinnedCodexScopedManagedRuntimeV01,
  selectCodexManagedRuntimeV01,
} from "@/lib/vnext/native-host/codex-managed-runtime-store";
import { createCodexScopedTaskV01, prepareScopedCodexLaunchV01, readCodexScopedSnapshotV01, releaseCodexScopedTaskV01, assertCodexScopedTaskCurrentV01, assertCodexScopedSnapshotCurrentV01 } from "@/lib/vnext/native-host/codex-scoped-task";
import { listOwnedDescendantProcessIdsV01, stopOwnedProcessTreeV01 } from "@/lib/vnext/native-host/owned-process-tree";
import { scheduleNativeHostTimeoutV01 } from "@/lib/vnext/runtime/direct-native-host-round-trip";

type Json = Record<string, any>; // Synthetic protocol fixtures only, never user payloads.
const hash = (bytes: string | Buffer) => createHash("sha256").update(bytes).digest("hex");
const safePath = "/usr/bin:/bin:/usr/sbin:/sbin";
const text = "SYNTHETIC_APPROVED_READ\n";
const packetHash = `sha256:${hash("offline-code-mode-fixture")}`;

export async function scopedCodeModeNativeV01(testRoot: string, nativeArchive: string, helperArchive: string): Promise<void> {
  assert.equal(process.platform, "darwin"); assert.equal(process.arch, "arm64");
  const root = path.join(testRoot, "code-mode"), store = path.join(root, "store"), home = path.join(root, "install-home");
  for (const d of [root, store, home]) mkdirSync(d, { mode: 0o700 });
  const environment: NodeJS.ProcessEnv = { NODE_ENV: "test", HOME: home, PATH: safePath, LANG: "en_US.UTF-8" };
  try {
  const nativeBytes = readFileSync(nativeArchive), helperBytes = readFileSync(helperArchive);
  const nativeOnly = await ensurePinnedCodexManagedRuntimeV01({ root: store, reviewed_archive_bytes: nativeBytes, environment });
  const oldManifest = path.join(path.dirname(path.dirname(nativeOnly.canonical_native_executable)), "store.json");
  const oldBytes = readFileSync(oldManifest);
  assert.throws(() => selectCodexManagedRuntimeV01({ root: store, environment, scoped_code_mode: true }), /absent/);
  await assert.rejects(ensurePinnedCodexScopedManagedRuntimeV01({ root: store, environment,
    reviewed_archive_bytes: nativeBytes, reviewed_helper_archive_bytes: Buffer.from("wrong") }), /helper_archive_identity_mismatch/);
  const paired = await ensurePinnedCodexScopedManagedRuntimeV01({ root: store, environment,
    reviewed_archive_bytes: nativeBytes, reviewed_helper_archive_bytes: helperBytes });
  assert(paired.scoped_code_mode);
  assert.notEqual(paired.canonical_native_executable, nativeOnly.canonical_native_executable);
  assert.equal(hash(readFileSync(paired.canonical_native_executable)), hash(readFileSync(nativeOnly.canonical_native_executable)));
  assert.notEqual(lstatSync(paired.canonical_native_executable).ino, lstatSync(nativeOnly.canonical_native_executable).ino);
  assert.equal(lstatSync(paired.canonical_native_executable).nlink, 1);
  assert.deepEqual(readFileSync(oldManifest), oldBytes);
  assert.equal(selectCodexManagedRuntimeV01({ root: store, environment }).store_manifest_fingerprint, nativeOnly.store_manifest_fingerprint);
  const helper = paired.scoped_code_mode.canonical_helper_executable, original = readFileSync(helper);
  assert.equal(`sha256:${hash(original)}`, CODEX_SCOPED_CODE_MODE_HOST_V01.executable_sha256);
  assert.equal(original.length, CODEX_SCOPED_CODE_MODE_HOST_V01.executable_bytes);
  assert.equal(lstatSync(helper).nlink, 1);
  assertCodexManagedRuntimeSelectionUnchangedV01(paired, { root: store, environment });
  const bin = path.dirname(helper);
  chmodSync(bin, 0o700); rmSync(helper);
  assert.throws(() => selectCodexManagedRuntimeV01({ root: store, environment, scoped_code_mode: true }), /corrupt/);
  symlinkSync(nativeOnly.canonical_native_executable, helper);
  assert.throws(() => assertCodexManagedRuntimeSelectionUnchangedV01(paired, { root: store, environment }), /identity_changed/);
  rmSync(helper); writeFileSync(helper, Buffer.from("wrong"), { mode: 0o555 });
  assert.throws(() => selectCodexManagedRuntimeV01({ root: store, environment, scoped_code_mode: true }), /corrupt/);
  rmSync(helper); writeFileSync(helper, original, { mode: 0o555 }); chmodSync(bin, 0o555);
  assertCodexManagedRuntimeSelectionUnchangedV01(paired, { root: store, environment });
  const results: Json[] = [];
  const failures: Error[] = [];
    for (const scenario of ["permissions", "import", "cancel", "deadline"] as const) {
      const result: Json = { scenario };
      try { await runNativeFixture(root, paired.canonical_native_executable, scenario, result); }
      catch (error) {
        result.failed_check = error instanceof Error ? error.message : "fixture_check_failed";
        failures.push(Error(`${scenario}: ${result.failed_check}`));
      }
      results.push(result);
    }
    assert.deepEqual(readFileSync(oldManifest), oldBytes);
    assert.equal(selectCodexManagedRuntimeV01({ root: store, environment }).store_manifest_fingerprint, nativeOnly.store_manifest_fingerprint);
    console.log(JSON.stringify({ check: "scoped_code_mode_native", passed: failures.length === 0,
      helper: CODEX_SCOPED_CODE_MODE_HOST_V01, paired_manifest: paired.store_manifest_fingerprint,
      native_only_manifest_unchanged: nativeOnly.store_manifest_fingerprint,
      route: "fixed loopback Responses -> native code-mode router -> exact stdio helper -> production nested command consumer",
      model_calls: 0, results }));
    if (failures.length) throw new AggregateError(failures, "scoped_code_mode_native_checks_failed");
  } finally {
    // Published store directories are sealed. Only this exclusively owned test
    // tree is made writable for removal by the sandbox fixture's outer finally.
    makeOwnedWritable(root);
  }
}

function makeOwnedWritable(root: string): void {
  const stat = lstatSync(root); if (stat.isSymbolicLink()) return;
  chmodSync(root, stat.isDirectory() ? 0o700 : 0o600);
  if (stat.isDirectory()) for (const entry of readdirSync(root)) makeOwnedWritable(path.join(root, entry));
}

async function runNativeFixture(parent: string, executable: string, scenario: "permissions" | "import" | "cancel" | "deadline", result: Json): Promise<void> {
  const root = path.join(parent, scenario), stage = path.join(root, "stage"), home = path.join(root, "home"), codexHome = path.join(home, ".codex"), runtime = path.join(root, "runtime");
  for (const d of [stage, codexHome, runtime]) mkdirSync(d, { recursive: true, mode: 0o700 });
  const held = path.join(root, "B-held.txt"), evaluator = path.join(root, "evaluator.txt"), outside = path.join(root, "outside.txt");
  for (const f of [held, evaluator, outside]) writeFileSync(f, "SYNTHETIC_FORBIDDEN_CONTENT\n");
  const files = ["TASK.txt", "A.json", "X.json"].map(relative_path => {
    writeFileSync(path.join(stage, relative_path), text); return { relative_path, sha256: hash(text) };
  });
  const marker = path.join(root, "ambient-started");
  const configFile = path.join(codexHome, "config.toml"), auth = path.join(codexHome, "auth.json");
  // Typed inherited host/fallback and broad env values are synthetic only.
  const config = `[features.code_mode_host]\nenabled=false\ndisable_in_process_fallback=false\n[features.code_mode]\nenabled=false\ndefault_exec_yield_time_ms=999999\nexcluded_tool_namespaces=["functions"]\ndirect_only_tool_namespaces=["functions"]\n[features]\nmemories=true\nchronicle=true\nplugins=true\n[shell_environment_policy]\ninherit="all"\ninclude_only=["*"]\nexperimental_use_profile=true\n[shell_environment_policy.set]\nPATH="/synthetic/unapproved"\nSYNTHETIC_SECRET="DO_NOT_PROPAGATE"\nORDINARY_SENTINEL="DO_NOT_PROPAGATE"\nBASH_ENV="/synthetic/private-profile"\n[mcp_servers.inherited]\ncommand="/usr/bin/touch"\nargs=[${JSON.stringify(marker)}]\nenabled=true\n`;
  writeFileSync(configFile, config); writeFileSync(auth, "{}\n");
  const preparationStarted = performance.now();
  const scope = await createCodexScopedTaskV01({ stage: 1, canonical_root: stage, files,
    packet_id: "synthetic-offline-only", packet_fingerprint: packetHash, guide_brief_fingerprint: packetHash });
  const snapshot = readCodexScopedSnapshotV01(scope), executionRoot = snapshot.root;
  result.snapshot_prepare_validate_ms = performance.now() - preparationStarted;
  const environment: NodeJS.ProcessEnv = { NODE_ENV: "test", HOME: home, CODEX_HOME: codexHome, TMPDIR: runtime, PATH: safePath, LANG: "en_US.UTF-8", NO_COLOR: "1" };
  const launch = prepareScopedCodexLaunchV01(scope, environment);
  Object.assign(result, { scenario, scope: scope.fingerprint, configuration: launch.configuration_fingerprint,
    snapshot: snapshot.fingerprint, execution_root_distinct: executionRoot !== stage, model_calls: 0, synthetic_responses: 0, command_events: [], tool_outputs: [], owned_pids: [] });
  const executionStarted = performance.now();
  const responseServer = createServer(), networkServer = createServer(); let networkRequests = 0;
  networkServer.on("request", (_req, res) => { networkRequests++; res.end("forbidden\n"); });
  let child: ReturnType<typeof spawn> | undefined, clearDeadline: (() => void) | undefined;
  const owned = new Set<number>(); let fixtureFailure: Error | undefined;
  let resolveTerminal!: (value: Json) => void, rejectTerminal!: (error: Error) => void;
  const terminal = new Promise<Json>((resolve, reject) => { resolveTerminal = resolve; rejectTerminal = reject; });
  void terminal.catch(() => {});
  const calls = new Map<number, { resolve: (v: Json) => void; reject: (e: Error) => void; clear: () => void }>();
  let nextId = 0, pending = "", threadId = "", turnId = "", interrupt: Promise<Json> | undefined;
  const request = (method: string, params: Json) => new Promise<Json>((resolve, reject) => {
    const id = ++nextId;
    const clear = scheduleNativeHostTimeoutV01({ timeout_ms: 10_000, on_timeout() { calls.delete(id); reject(Error(`fixture_rpc_timeout:${method}`)); } });
    calls.set(id, { resolve, reject, clear }); child!.stdin!.write(JSON.stringify({ id, method, params }) + "\n");
  });
  const rememberChildren = () => { if (child?.pid) for (const pid of listOwnedDescendantProcessIdsV01(child.pid)) owned.add(pid); };
  const complete = (id: string) => ({ type: "response.completed", response: { id,
    usage: { input_tokens: 0, input_tokens_details: null, output_tokens: 0, output_tokens_details: null, total_tokens: 0 } } });
  try {
    await new Promise<void>(r => networkServer.listen(0, "127.0.0.1", r));
    const networkAddress = networkServer.address(); assert(networkAddress && typeof networkAddress !== "string");
    assert.equal(await (await fetch(`http://127.0.0.1:${networkAddress.port}/positive-control`)).text(), "forbidden\n");
    result.network_positive_control_requests = networkRequests; assert.equal(networkRequests, 1); networkRequests = 0;
    responseServer.on("request", (req, res) => {
      let raw = "";
      req.on("data", d => { raw += d; if (raw.length > 2 * 1024 * 1024) req.destroy(); });
      req.on("end", () => { let phase = "method"; try {
        assert.equal(req.headers.authorization, undefined);
        if (req.method === "GET") {
          assert.match(req.url!, /^\/v1\/models(?:\?|$)/); result.catalog = "loopback empty fixture; bundled metadata retained";
          res.writeHead(200, { "content-type": "application/json" }); res.end('{"models":[]}'); return;
        }
        assert.equal(req.method, "POST"); assert.equal(req.url, "/v1/responses");
        const body: Json = JSON.parse(raw); raw = ""; phase = "model_effort";
        assert.equal(body.model, "gpt-6-astra"); assert.equal(body.reasoning.effort, "max");
        const toolSpecs = body.tools ?? body.input.find((i: Json) => i.type === "additional_tools")?.tools;
        phase = "tool_registration";
        assert(Array.isArray(toolSpecs), "actual native request must expose tools");
        result.model_visible_tools = toolSpecs.flatMap((t: Json) => t.tools ? t.tools.map((n: Json) => `${t.name}.${n.name}`) : [t.name ?? t.type]);
        phase = `tool_names:${JSON.stringify(result.model_visible_tools)}`;
        // Input-request tools already belong to this native route; unexpected
        // server requests still refuse. No collaboration/MCP/ambient namespace.
        assert.deepEqual([...result.model_visible_tools].sort(),
          ["functions.exec", "functions.request_user_input", "functions.request_user_input_async", "functions.wait"]);
        phase = "fixture_sequence";
        result.tool_outputs.push(...body.input.filter((i: Json) => /tool_call_output/.test(i.type)).map((i: Json) => i.output));
        rememberChildren(); const ordinal = ++result.synthetic_responses; assert(ordinal <= 3);
        const call = (code: string) => ({ type: "response.output_item.done", item: { type: "custom_tool_call", call_id: `synthetic-${ordinal}`, name: "exec", input: code } });
        let events: Json[];
        if (ordinal === 1) {
          let code: string;
          if (scenario === "permissions") {
            const commands = [
              ["allowed", "/bin/cat TASK.txt A.json X.json"],
              ["source", `/bin/cat '${path.join(stage, "TASK.txt")}'`],
              ["replace", "rm TASK.txt; ln -s /etc/passwd TASK.txt"],
              ["chmod", "chmod 600 TASK.txt"],
              ["held", `/bin/cat '${held}'`], ["evaluator", `/bin/cat '${evaluator}'`], ["outside", `/bin/cat '${outside}'`],
              ["write", "printf forbidden > TASK.txt"],
              ["network", `/usr/bin/curl --noproxy '*' --connect-timeout 1 --max-time 2 http://127.0.0.1:${networkAddress.port}/`],
              ["environment", `/usr/bin/awk 'BEGIN { if (ENVIRON["PATH"] != "${safePath}" || ENVIRON["SYNTHETIC_SECRET"] != "" || ENVIRON["ORDINARY_SENTINEL"] != "" || ENVIRON["BASH_ENV"] != "" || ENVIRON["CODEX_SANDBOX"] != "seatbelt" || ENVIRON["CODEX_SANDBOX_NETWORK_DISABLED"] != "1") exit 61; print "SYNTHETIC_COMMAND_ENVIRONMENT_OK" }'`],
            ];
            code = `text({nested_tools:ALL_TOOLS.map(t=>t.name),globals:{process:typeof process,require:typeof require,fetch:typeof fetch}});` +
              `for(const [check,cmd] of ${JSON.stringify(commands)})text({check,result:await tools.exec_command({cmd,login:false,max_output_tokens:800,yield_time_ms:3000})});` +
              `text({check:'source_workdir',result:await tools.exec_command({cmd:'/bin/cat TASK.txt',workdir:${JSON.stringify(stage)},login:false,max_output_tokens:200})});` +
              `try { text({check:'foreign_session',result:await tools.write_stdin({session_id:2147483647,chars:'synthetic'})}); } catch { text({check:'foreign_session',denied:true}); }` +
              `try { text({check:'escalation',result:await tools.exec_command({cmd:'/bin/cat ${held}',sandbox_permissions:'require_escalated',login:false})}); } catch { text({check:'escalation',denied:true}); }` +
              `try { await tools.apply_patch('*** Begin Patch\\n*** Add File: forbidden.txt\\n+forbidden\\n*** End Patch'); text({check:'patch',denied:false}); } catch { text({check:'patch',denied:true}); }`;
          } else if (scenario === "import") code = "await import('node:fs'); text('IMPORT_MUST_NOT_SUCCEED');";
          else code = "text(await tools.exec_command({cmd:'/bin/sleep 30',login:false,yield_time_ms:1000}));";
          events = [{ type: "response.created", response: { id: "fixture-1" } }, call(code), complete("fixture-1")];
        } else if (ordinal === 2 && scenario === "permissions") {
          // External synthetic race after admission: the read-only worker cannot
          // perform this swap. Verify the actual nested OS path resolution.
          rmSync(path.join(stage, "TASK.txt")); symlinkSync(held, path.join(stage, "TASK.txt"));
          rmSync(path.join(stage, "A.json")); writeFileSync(path.join(stage, "A.json"), "SYNTHETIC_FORBIDDEN_CONTENT\n");
          writeFileSync(path.join(stage, "X.json"), "SYNTHETIC_FORBIDDEN_CONTENT\n");
          events = [call("text({check:'symlink',result:await tools.exec_command({cmd:'/bin/sleep 0.2; /bin/cat TASK.txt A.json X.json',login:false,yield_time_ms:3000,max_output_tokens:200})});"), complete("fixture-2")];
        } else {
          events = [{ type: "response.output_item.done", item: { type: "message", role: "assistant", id: "synthetic-final", content: [{ type: "output_text", text: "Synthetic fixture complete." }] } }, complete("fixture-final")];
        }
        res.writeHead(200, { "content-type": "text/event-stream" }); res.end(events.map(e => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`).join(""));
      } catch { fixtureFailure = Error(`offline_responses_contract_failed:${phase}`); res.writeHead(500); res.end("fixture refused"); rejectTerminal(fixtureFailure); } });
    });
    await new Promise<void>(r => responseServer.listen(0, "127.0.0.1", r));
    const address = responseServer.address(); assert(address && typeof address !== "string");
    // Only the test transport/auth source differs. No inherited environment,
    // real auth/catalog/state, config copy, wrapper or alternate task executor.
    const args = [...launch.args, "-c", 'cli_auth_credentials_store="file"', "-c", 'model_provider="mock_provider"', "-c",
      `model_providers.mock_provider={name="Offline fixed fixture",base_url="http://127.0.0.1:${address.port}/v1",wire_api="responses",request_max_retries=0,stream_max_retries=0,requires_openai_auth=false,supports_websockets=false}`, "app-server", "--stdio"];
    child = spawn(executable, args, { env: environment, cwd: executionRoot, stdio: ["pipe", "pipe", "pipe"] });
    child.stderr!.on("data", () => {});
    child.on("error", () => rejectTerminal(Error("fixture_process_error")));
    child.on("close", () => { for (const c of calls.values()) { c.clear(); c.reject(Error("fixture_process_closed")); } calls.clear(); rejectTerminal(Error("fixture_closed_before_terminal")); });
    child.stdout!.on("data", d => { pending += d; try {
      assert(pending.length < 4 * 1024 * 1024);
      for (;;) {
        const n = pending.indexOf("\n"); if (n < 0) break;
        const line = pending.slice(0, n); pending = pending.slice(n + 1); if (!line.trim()) continue;
        const m = JSON.parse(line);
        if (m.id !== undefined && calls.has(m.id)) {
          const c = calls.get(m.id)!; calls.delete(m.id); c.clear();
          if (m.error) c.reject(Error("fixture_rpc_refused")); else c.resolve(m.result);
        } else if (m.id !== undefined && m.method) throw Error("unexpected_approval_or_server_request");
        else if (m.method === "turn/completed") resolveTerminal(m.params);
        else if (m.method === "item/started" && m.params.item?.type === "commandExecution") {
          rememberChildren();
          if (scenario === "permissions" && result.synthetic_responses === 2) {
            // Notification is only a fixture timing marker, never a production
            // authorization interlock. The selected snapshot is unchanged even
            // when the original is written after dispatch and before delayed open.
            writeFileSync(path.join(stage, "X.json"), "SYNTHETIC_FORBIDDEN_CONTENT_AFTER_DISPATCH\n");
            result.source_mutated_during_delayed_command = true;
          }
          if (scenario === "cancel" && !interrupt) interrupt = request("turn/interrupt", { threadId, turnId });
          if (scenario === "deadline" && !interrupt) {
            interrupt = Promise.resolve({}); clearDeadline?.();
            clearDeadline = scheduleNativeHostTimeoutV01({ timeout_ms: 100, on_timeout() {
              rememberChildren(); result.deadline_expired = true;
              void stopOwnedProcessTreeV01(child!, { graceful_timeout_ms: 1000, forced_timeout_ms: 2000, additional_owned_pids: owned })
                .then(() => rejectTerminal(Error("expected_fixture_deadline")), rejectTerminal);
            } });
          }
        } else if (m.method === "item/completed" && m.params.item?.type === "commandExecution")
          result.command_events.push({ status: m.params.item.status, exit_code: m.params.item.exitCode });
      }
    } catch { rejectTerminal(Error("fixture_protocol_failed")); } });
    clearDeadline = scheduleNativeHostTimeoutV01({ timeout_ms: 60_000, on_timeout() { rejectTerminal(Error("fixture_deadline")); } });
    await request("initialize", { clientInfo: { name: "augnes", version: "offline-test" }, capabilities: { experimentalApi: true } });
    child.stdin!.write(JSON.stringify({ method: "initialized", params: {} }) + "\n");
    const configRead = await request("config/read", { includeLayers: true });
    assert.deepEqual(configRead.config.features.code_mode_host, { enabled: true, disable_in_process_fallback: true });
    // Run the production readback validator after removing only the explicitly
    // declared fixture provider. Its observation is kept distinct from live auth.
    const taskConfig = structuredClone(configRead); taskConfig.config.model_provider = "openai"; delete taskConfig.config.model_providers;
    launch.assert_configuration(taskConfig);
    const catalog = await request("mcpServerStatus/list", {}); launch.assert_mcp_catalog(catalog);
    const thread = await request("thread/start", { cwd: executionRoot, model: "gpt-6-astra", modelProvider: "mock_provider",
      permissions: launch.profile_name, approvalPolicy: "never", approvalsReviewer: "user", ephemeral: true, allowProviderModelFallback: false });
    threadId = thread.thread.id;
    assert.equal(thread.activePermissionProfile.id, launch.profile_name); assert.deepEqual(thread.thread.turns, []);
    const turn = await request("turn/start", { threadId, cwd: executionRoot, permissions: launch.profile_name, approvalPolicy: "never",
      approvalsReviewer: "user", model: "gpt-6-astra", effort: "max", input: [{ type: "text", text: "Run the fixed offline fixture.", text_elements: [] }] });
    turnId = turn.turn.id;
    let terminalResult: Json | undefined;
    try { terminalResult = await terminal; } catch (error) { if (scenario !== "deadline" || !result.deadline_expired) throw error; }
    if (interrupt) await interrupt;
    if (fixtureFailure) throw fixtureFailure;
    result.terminal = terminalResult?.turn.status ?? "deadline_stopped";
    if (scenario === "permissions") {
      assert.equal(result.terminal, "completed");
      // Native command events are not emitted for every denied attempt. Require
      // the real successful command event AND each actual nested-tool result.
      assert(result.command_events.some((c: Json) => c.status === "completed" && c.exit_code === 0));
      const records = result.tool_outputs.flatMap((blocks: Json[]) => blocks.flatMap(block => {
        if (typeof block.text !== "string" || !block.text.startsWith("{")) return [];
        return [JSON.parse(block.text)];
      }));
      const find = (check: string) => { const item = records.find((r: Json) => r.check === check); assert(item, `nested_result_missing:${check}`); return item; };
      assert.deepEqual(records.find((r: Json) => r.nested_tools)?.nested_tools, ["apply_patch", "clock__curr_time", "exec_command", "write_stdin"]);
      assert.deepEqual(records.find((r: Json) => r.globals)?.globals, { process: "undefined", require: "undefined", fetch: "undefined" });
      result.nested_checks = Object.fromEntries(["allowed", "source", "replace", "chmod", "held", "evaluator", "outside", "write", "network", "environment", "symlink"].map(check => [check, find(check).result.exit_code]));
      assert.equal(find("allowed").result.output, text.repeat(3)); assert.equal(find("allowed").result.exit_code, 0);
      for (const check of ["source", "replace", "chmod", "held", "evaluator", "outside", "write", "network"]) assert.notEqual(find(check).result.exit_code, 0, `nested_denial:${check}`);
      assert.equal(find("environment").result.output, "SYNTHETIC_COMMAND_ENVIRONMENT_OK\n"); assert.equal(find("environment").result.exit_code, 0);
      assert.equal(find("patch").denied, true);
      assert.notEqual(find("source_workdir").result.exit_code, 0);
      assert.match(JSON.stringify(find("foreign_session")), /denied|not found|not exist|Unknown|unknown|No process|no process/);
      assert.match(JSON.stringify(find("escalation")), /denied|never|reject|not allowed|not permitted/);
      assert.equal(find("symlink").result.exit_code, 0);
      assert.equal(find("symlink").result.output, text.repeat(3), "post_admission_source_replacement_must_not_change_snapshot_reads");
      await assert.rejects(assertCodexScopedTaskCurrentV01(scope), /file_unavailable_or_changed|stage_hash_changed/);
      await assertCodexScopedSnapshotCurrentV01(scope);
      result.source_drift_refused = true;
      assert.equal(result.source_mutated_during_delayed_command, true);
      const outputs = JSON.stringify(result.tool_outputs);
      assert(outputs.includes("SYNTHETIC_APPROVED_READ")); assert(!outputs.includes("SYNTHETIC_FORBIDDEN_CONTENT"));
      assert(!outputs.includes("DO_NOT_PROPAGATE")); assert(!existsSync(path.join(stage, "forbidden.txt")));
      for (const filename of files) assert.equal(readFileSync(path.join(executionRoot, filename.relative_path), "utf8"), text);
      assert.equal(networkRequests, 0);
    } else if (scenario === "import") {
      assert.equal(result.terminal, "completed"); assert.equal(result.command_events.length, 0);
      assert(!JSON.stringify(result.tool_outputs).includes("IMPORT_MUST_NOT_SUCCEED"));
      assert.match(JSON.stringify(result.tool_outputs), /import|module/i);
    } else if (scenario === "cancel") assert.equal(result.terminal, "interrupted");
    rememberChildren(); assert(owned.size > 0, "actual helper child required");
    assert.equal(existsSync(marker), false); assert.equal(readFileSync(auth, "utf8"), "{}\n"); assert.equal(readFileSync(configFile, "utf8"), config);
    result.passed = true;
  } finally {
    result.fixture_execution_ms = performance.now() - executionStarted;
    const cleanupStarted = performance.now();
    clearDeadline?.(); for (const c of calls.values()) c.clear(); calls.clear();
    rememberChildren();
    if (child) { child.stdin!.end(); result.cleanup = await stopOwnedProcessTreeV01(child, { graceful_timeout_ms: 1000, forced_timeout_ms: 2000, additional_owned_pids: owned }); assert.equal(result.cleanup.settled, true); }
    result.owned_pids = [...owned];
    for (const pid of owned) { let alive = false; try { process.kill(pid, 0); alive = true; } catch {} assert.equal(alive, false, `owned child ${pid} must settle`); }
    for (const server of [responseServer, networkServer]) await new Promise<void>(r => server.close(() => r()));
    result.network_requests = networkRequests;
    const releaseStarted = performance.now();
    await releaseCodexScopedTaskV01(scope);
    result.snapshot_release_ms = performance.now() - releaseStarted;
    result.cleanup_ms = performance.now() - cleanupStarted;
    result.snapshot_removed = !existsSync(executionRoot); assert.equal(result.snapshot_removed, true);
  }
}
