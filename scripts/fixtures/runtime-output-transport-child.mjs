import assert from "node:assert/strict";
import { once } from "node:events";
import { closeSync, fstatSync, writeSync } from "node:fs";
import { forwardRuntimeChildOutput } from "../augnes-runtime-supervisor-core.mjs";

// A separate process owns fd 2. fd 3 carries only bounded test observations;
// it is independent of the optional diagnostic pipe the parent closes.
const runtime = {};
const record = { outputTail: "" };
const otherErrorListener = () => { throw new Error("unrelated_stderr_listener"); };
if (process.argv[2] === "coexisting") process.stderr.on("error", otherErrorListener);
const listeners = process.stderr.rawListeners("error");
const report = (value) => writeSync(3, `${JSON.stringify(value)}\n`);
process.on("uncaughtExceptionMonitor", (error) => {
  report({ event: "uncaught", code: error.code ?? null });
});
process.on("message", async (command) => {
  if (command === "forward") {
    forwardRuntimeChildOutput(runtime, record, "ui", "attached-marker\n");
    runtime.childOutputTransport?.once("error", (error) => {
      if (error.code === "EPIPE") report({ event: "lost", code: error.code });
    });
  } else if (command === "unrelated-stderr") {
    process.stderr.write("outside optional forwarding\n");
  } else if (command === "invalid-descriptor") {
    closeSync(2);
    forwardRuntimeChildOutput(runtime, record, "ui", "unexpected-error\n");
  } else if (command === "after-loss") {
    // A retry would now be EBADF, not another ignorable EPIPE.
    closeSync(2);
    for (let index = 0; index < 512; index += 1) {
      forwardRuntimeChildOutput(runtime, record, "bridge", "x".repeat(65536));
    }
    assert.equal(record.outputTail, "x".repeat(32768));
    assert.deepEqual(process.stderr.rawListeners("error"), listeners);
    report({ event: "continued", tail_characters: record.outputTail.length });
  } else if (command === "burst") {
    for (let index = 0; index < 128; index += 1) {
      forwardRuntimeChildOutput(runtime, record, "ui", "x".repeat(65536));
    }
    assert.equal(record.outputTail, "x".repeat(32768));
    report({ event: "bounded", pending_bytes: runtime.childOutputTransport?.writableLength });
  } else if (command === "finish") {
    const output = runtime.childOutputTransport;
    if (output?.errored) {
      output.end();
    } else if (output) {
      const finished = once(output, "finish");
      output.end();
      await finished;
      assert.ok(fstatSync(2)); // Finished forwarding must not close borrowed fd 2.
    }
    assert.deepEqual(process.stderr.rawListeners("error"), listeners);
    process.stderr.removeListener("error", otherErrorListener);
    process.disconnect();
  } else {
    throw new Error("unexpected_test_command");
  }
});
report({ event: "armed" });
