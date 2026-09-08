import assert from "node:assert/strict";
import { once } from "node:events";
import { closeSync, fstatSync, writeSync } from "node:fs";
import { createRequire } from "node:module";
import { setTimeout as delay } from "node:timers/promises";
import { forwardRuntimeChildOutput } from "../augnes-runtime-supervisor-core.mjs";

// A separate process owns fd 2. fd 3 carries only bounded test observations;
// it is independent of the optional diagnostic pipe the parent pauses/closes.
const runtime = {};
const record = { outputTail: "" };
const pressureScenario = process.argv[3]?.startsWith("reader-paused") === true;
const observeDescriptor = pressureScenario
  ? createRequire(import.meta.url)(process.argv[4]).observeStderr : null;
const descriptorBefore = observeDescriptor?.();
const pressureProgress = { inputs: 0, peak_pending_bytes: 0 };
const otherErrorListener = () => { throw new Error("unrelated_stderr_listener"); };
let listeners;
if (!pressureScenario) initializeStderr();
const report = (value) => writeSync(3, `${JSON.stringify(value)}\n`);
process.on("uncaughtExceptionMonitor", (error) => {
  report({ event: "uncaught", code: error.code ?? null,
    descriptor: observeDescriptor?.(),
    ...(pressureScenario ? pressureProgress : {}),
    fs_stream_origin: String(error.stack).includes("internal/fs/streams") });
});
process.on("message", async (command) => {
  if (command === "initialize-stderr") {
    initializeStderr();
    const afterGetter = observeDescriptor();
    const warmup = "shared-stderr-initialization\n";
    process.stderr.write(warmup, () => {
      report({ event: "armed", descriptor_after_getter: afterGetter,
        descriptor: observeDescriptor(), stderr_type: process.stderr.constructor.name,
        shared_bytes: Buffer.byteLength(warmup) });
    });
  } else if (command === "paused-input") {
    for (let index = 0; index < 1024; index += 1) {
      forwardRuntimeChildOutput(runtime, record, "ui", "x".repeat(32768));
      pressureProgress.inputs += 1;
      pressureProgress.peak_pending_bytes = Math.max(
        pressureProgress.peak_pending_bytes, runtime.childOutputTransport.writableLength,
      );
      // Finite fresh input across event-loop turns, not a write retry loop.
      await delay(1);
    }
    report({ event: "input-complete", ...pressureProgress,
      accepted_bytes: runtime.childOutputTransport.bytesWritten,
      dropped_bytes: runtime.childOutputTransport.droppedBytes,
      backpressure_errors: runtime.childOutputTransport.backpressureErrors,
      descriptor: observeDescriptor(), tail_characters: record.outputTail.length });
  } else if (command === "inspect-drained") {
    const output = runtime.childOutputTransport;
    if (output.writableLength > 0) {
      assert.equal(output.writableNeedDrain, true);
      await once(output, "drain");
    }
    assert.equal(output.writableLength, 0);
    report({ event: "drained", accepted_bytes: output.bytesWritten,
      dropped_bytes: output.droppedBytes, backpressure_errors: output.backpressureErrors });
  } else if (command === "forward") {
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
    // Packaged recovery re-enters with a new runtime object in this process.
    // It still has the failed inherited descriptor, not a reattached reader.
    const reenteredRecord = { outputTail: "" };
    forwardRuntimeChildOutput({}, reenteredRecord, "ui", "reentered-after-loss\n");
    assert.equal(reenteredRecord.outputTail, "reentered-after-loss\n");
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
      if (pressureScenario) {
        await new Promise((resolve, reject) => {
          process.stderr.write("shared-after-optional-finish\n", (error) => {
            if (error) reject(error); else resolve();
          });
        });
      }
    }
    assert.deepEqual(process.stderr.rawListeners("error"), listeners);
    process.stderr.removeListener("error", otherErrorListener);
    process.disconnect();
  } else {
    throw new Error("unexpected_test_command");
  }
});
report({ event: pressureScenario ? "before-stderr" : "armed",
  node: process.version, platform: process.platform, arch: process.arch, descriptor: descriptorBefore });

function initializeStderr() {
  if (process.argv[2] === "coexisting") process.stderr.on("error", otherErrorListener);
  listeners = process.stderr.rawListeners("error");
}
