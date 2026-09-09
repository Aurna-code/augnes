# P5.1 scoped native-host execution card amendment

**Issue #1234: BLOCKED / live study `not_run` / study model calls 0.**
This is the implementation amendment authorized by
[review 5582629291](https://github.com/hynk-studio/augnes/issues/1234#issuecomment-5582629291).
PR review and separate authorization of the exact retained card are still
required before the first live start. This document does not authorize it.

The shell-environment correction follows
[review 5590309782](https://github.com/hynk-studio/augnes/issues/1234#issuecomment-5590309782).
Merged #1235 remains accepted. The new correction has its own source/evidence
binding and Draft review; it does not reopen that acceptance or transfer its
receipt. The retained prepared DB, initial packet and packet-derived GuideBrief
are reused when current-source admission confirms them.

The original execution card, six frozen task artifacts, information cutoff,
evaluation criteria, preflight report, cleanup evidence, boundary design and
route freeze remain immutable. Their initial freeze is
`2026-09-08T08:28:00.830829+00:00`. Original card SHA-256:
`51df134c08edb0ac9163c79172dc07327d10559c80809d36e53582f9f3364129`;
original manifest:
`b809d2eec9cf1c37352a7fe198c50b5c62ba006aeec2d0943abdee264a6e24fb`;
boundary freeze:
`f932011819b2f034e9d185fcfe4450b98a989a21a3849f88158fb93174041586`.
Only changed route material and implementation evidence are appended locally.
The source head and selected deciding receipt belong to that append-only
inventory and the Draft PR; neither transfers to another head.

## Selected route and controls, redacted

| Boundary | Implemented opt-in and remaining limitation |
| --- | --- |
| Application | `hynk-studio/augnes`, canonical checkout. The shell correction uses `codex/p51-scoped-shell-environment`, base `66cd51c34f1e71ffce0eae1a005fbad14168054d`. Original branch/base and later instance bindings remain in the immutable local appendices. No historical checkout or reset is used. |
| Host identity | Existing managed, pinned Codex **0.152.1**, darwin-arm64, `ordinary_chatgpt_auth`; executable suffix `codex-rust-v0.152.1-darwin-arm64--19cd28a2d576036d4b3e6a59d99a37fad94378b76f17e89531db554ce906b052/bin/codex`, native SHA-256 `8194ea3181f330e63023b234b0b231855e5874e0331c5ef7cbc490591497a7bf`. The opt-in selects the existing installed artifact; it does not install, change login, renew qualification or update last-known-good evidence. |
| Compatibility | Pinned upstream protocol source `5adb68a49933ae446bf11935662c83dba55a0804`. The extension explicitly negotiates `initialize.capabilities.experimentalApi=true`. Named `permissions` is mandatory at both new thread and turn. No legacy `sandbox`/`sandboxPolicy` is sent with it, and no fallback or resume is available. Historical qualification remains an ordinary-route disposition, not extension attestation. |
| Caller → consumer | Trusted disposable operator → `createCodexScopedTaskV01` and one shared `createCodexFeasibilityWindowV01` → `LiveNativeHostRunServiceV01({scoped_task:{scope,window}})` → authenticated `start` → existing controller and `runDirectNativeHostRoundTripV01` admission/launch gate → branded `createCodexAppServerAdapterV01({scoped_task:scope})` → exact executable `app-server --stdio` → initialize/configuration/MCP checks → fixed model-free `command/exec` environment predicate → account check → fresh thread → structured turn. A supplied adapter factory must preserve the exact scope binding. No HTTP body, worker/browser profile, global setting or desktop Start control enables this option. |
| Model/auth | Explicit `gpt-6-astra`, effort `max`, built-in `openai`; observable configuration, thread/settings and identity contradictions refuse. `allowProviderModelFallback=false`. Actual backend serving identity remains **unknown**. Ordinary ChatGPT login, host HOME and child environment allowlist/exclusions are unchanged. `OPENAI_API_KEY` is excluded; there is no Responses executor or credential transfer. |
| Immutable data | An opaque, source-owned scope binds stage, admitted physical root, packet ID/fingerprint, GuideBrief fingerprint, exact flat file inventory and SHA-256 hashes, plus approved generic instruction hashes. No symlink, hard-link alias, directory, extra file, stale hash or arbitrary structural copy is admitted. The scope is consumed once and rechecked before spawn, thread and turn. Only the three original initial-worker files are staged for worker 1. Clarification, B, evaluator material, execution card and evidence stay outside its scope. |
| Successor data | After settlement and normal reviewed Transition, actual compiler/preparation produces a fresh packet. Add only the frozen B artifact to the same disposable physical task root. Create a new stage-2 scope over that exact inventory, fresh packet and fresh GuideBrief, using the **same window**. Stage 2 requires Transition lineage. The running stage-1 profile is never widened; the clarification reaches worker 2 through accepted source-bound successor preparation. |
| Host access versus task access | Host/auth/runtime files remain available to the ordinary host process where necessary. The worker's fixed named profile retains the pinned `:minimal` OS startup/syscall mechanics and system command/library/device reads, but explicitly denies its `/etc`, `/private/etc`, `/var/db`, `/private/var/db`, `/Library/Preferences`, NetFS plugin, Homebrew/local library and terminal data exceptions. Only exact approved synthetic task files are added. The unmodified preset is not the boundary. Generic host instructions and explicitly hash-approved host AGENTS instructions remain disclosed confounds. This is not cold isolation, a separate OS account or Strict support. Staged files must remain unchanged during execution. |
| Ambient suppression | CLI overrides exist before process startup. They disable memory use/generation and imports, Chronicle, host skill discovery/injection, local and orchestrator MCP, plugins/apps/connectors, web/browser/computer tools, subagents/goals, code-mode discovery/prewarm, shell snapshots/login-shell loading and unapproved background/discovery features. Every inherited MCP name is explicitly disabled; empty map overlays are not relied upon. Custom instruction/catalog/profile/provider/telemetry material or unknown managed/configuration provenance refuses. Configuration is hashed and checked, not copied into durable evidence. |
| Observable provenance | Strict configuration readback, selected permission profile, model/effort/root, zero callable MCP tools/resources, approved instruction-source paths and runtime notifications are checked. Disabled MCP entries may remain catalog rows with no runtime, tools or resources; absence of rows is not the proof. Known pinned null defaults are normalized; non-null policy additions and unknown fields still refuse. |
| Shell environment | The opt-in fixes `inherit=none`, default exclusions, `set.PATH=/usr/bin:/bin:/usr/sbin:/sbin`, final `include_only=["PATH"]`, `exclude=[]`, and `experimental_use_profile=false`. Pinned merge replaces the arrays and displaces inherited keyed filters. Other well-formed set entries may remain in private host configuration; the final filter removes them from commands after set application. No private value is copied into arguments, evidence, prompts or a replacement config. Source/effective `Path`/`path` aliases, unknown/malformed policy, broad effective filters and source drift refuse. Equivalent canonical keyed readback is accepted only for the exact closed filter. |
| Actual command check | Before account/thread/turn, the same App Server executes a fixed `/usr/bin/awk` predicate through `command/exec`, with the scope's named permission profile and cwd, no client env override, a 10,000 ms RPC/command bound and 128-byte output cap. It returns one constant success line or a generic refusal, never environment names/values. It checks fixed PATH and only specifically sourced optional sandbox/apply-patch runtime flags. Unknown metadata or ignored policy refuses; no `CODEX_*` wildcard or fallback exists. The existing execution/window/abort/settlement owners bound this extra model-free command; it is not a provider request or an added study host attempt. |
| Permissions and output | Read/check commands and native bounded JSON result only. Permission/escalation requests are refused (`approvalPolicy=never`) within this opt-in. Semantic user review is unchanged. File-change events or returned changed files/artifacts refuse; they cannot become a successful scoped result. The ordinary native result schema and its 128 KiB bound remain; existing command/check array bounds are 128. These are result/evidence bounds, not an independently metered provider-call/token budget. |
| Deadlines | Configured execution ceiling **180,000 ms**, retaining smaller service limits; RPC **10,000 ms**; stop settlement **10,000 ms**, retaining smaller settlement limits. One **600,000 ms** monotonic window starts at the first attempted start, before admission, and includes startup, review and settlement. Each active timer is capped by remaining window minus settlement reserve and the per-run ceiling. The existing scheduler/abort/stop owners enforce it. There is no second runtime timer system. |
| Expiration | At 589,999 ms with a 10,000 ms reserve, a second start can have at most 1 ms, and it is refused if that allowance expires during admission. At 590,000 ms it cannot start. Review does not reset the window. Snapshot reads expose remaining time; failure, cancellation or timeout closes further admission. At most two sequential attempts, no overlap, replay, retry, replacement, subagent or evaluator-model invocation. |
| Stop/cleanup | Existing direct round trip aborts and calls `request_stop`; existing RPC/transport and `stopOwnedProcessTreeV01` settle the child. Failed settlement retains paused/reconciliation outcomes and no fabricated terminal receipt. Disposable service `shutdown`, DB close and the existing disposable cleanup owner remain responsible even after the study window closes. Local cancellation does **not** prove remote generation or billing stopped. |
| Usage/billing | Ordinary subscription route; **$0 additional pay-as-you-go authorized**. No key, billing, purchase, quota reset or production configuration change. Retained quota observation (weekly 8% used/92% remaining, purchased credits 0) is historical/shared and not reserved. Record current read-only quota before authorization; stop for exhausted quota or paid continuation. Two host executions are not necessarily two provider requests: internal rounds/retries and exact provider usage/cost remain unobservable where the host does not expose them. |
| Burden | Proposed setup ≤15 minutes, live window ≤10 minutes including human review, cleanup target ≤5 minutes: ≤30 minutes planned total. Record actual setup, execution, inter-run review, settlement and cleanup separately without double counting review inside the live window. Cleanup failure remains work to reconcile, not permission to abandon owned resources or silently increase execution allowance. Implementation/test time is not live-study burden. |

## Exact proposed operator flow

1. After PR review, retain the original artifacts and verify their hashes. Reuse
   the existing disposable DB, root, initial work and selected synthetic notes
   through current-source admission and real local operator-session owners;
   do not repeat onboarding. Do not use the unauthenticated test option. Freeze the
   actual prepared packet, packet-derived GuideBrief and scope fingerprints
   before execution authorization; never invent runtime/run/proof identities.
   A fresh normal factory observation is new evidence, never reconstruction of
   the released handle's missing historical fingerprint.
2. Construct one window in the disposable caller. Construct stage 1 from the
   frozen initial manifest, actual physical root and prepared packet/GuideBrief.
   Supply it only through the service constructor shown above. Read the
   capability contract and the window snapshot; retain the smaller applicable
   limits. No production activation or desktop control is implied.
3. On separate exact-card authorization, call authenticated `service.start`
   once. Preserve actual X command/check observations and the normal returned
   result, RunReceipt and proposal. If execution or eligible proposal admission
   fails, stop. Do not create a substitute result, receipt or candidate.
4. Present the **new user-declared clarification** through normal source-bound
   candidate revision, human ReviewDecision, confirmation and Transition.
   Preserve the X observation, uncertainty and Y's deferred/untested meaning.
   If the first response was cautious, classify this as clarification; do not
   claim an error was corrected. Review time remains in the shared window.
5. Read/reconstruct through the existing compiler and fresh preparation owner.
   Require actual successor packet/Transition lineage. Expose only frozen B
   in the new stage-2 inventory, construct its fresh scope, and create a second
   disposable service using the same window. Check remaining time and source
   bindings, then submit at most once. Do not restart the window after a failure
   or re-create a service to evade its attempt count.
6. Require an actual completed B artifact read/check bound to the second native
   result/receipt. Expected wording alone is insufficient. Y remains untested;
   following the supplied B check is not autonomous discovery. The retained
   model-free/human evaluator applies the frozen criteria, outside worker 1's
   context, with no evaluator-model call. Shut down/settle and clean up through
   the existing owners; retain bounded evidence locally.

## Evaluation and compatibility evidence

Success requires the complete actual X → native result/proposal → reviewed
clarification/Transition → fresh preparation → actual B chain, retained meaning,
source binding and settled cleanup. Partial means a supported prefix completed
but a later step did not. Blocked means admission, policy, source, runtime or
eligible review prerequisites prevent that step. Stop includes deadline,
cancellation, quota/billing change, unauthorized data/capability, source drift,
contradictory effective model/policy or failed settlement. These classifications
do not create semantic acceptance or declare usefulness/causal benefit.

Focused model-free checks use the existing sandbox-projection fixture and
project-work native path. They cover default wire parity, named negotiation,
ignored/conflicting controls, scope/GuideBrief/root drift, tool/effect refusal,
cancellation, near-expiry/smaller clock allowances, normal authenticated native
receipt/proposal persistence and refusal without host/receipt/proposal effects.
The retained deterministic executed-reviewed-successor case checks the normal
review/Transition/compiler consumers; it is not a live model producer.

The explicit `--pinned-host-sandbox` check uses the managed executable with
synthetic HOME/config and a file-only empty credential store for the diagnostic
only. An outer macOS network denial encloses its initialize/configuration/MCP
readback; it sends no account, thread or turn RPC. Synthetic inherited MCP
startup markers remain absent. Its `command/exec` check exercises the actual
pinned environment constructor after both legacy-array and keyed-filter
inheritance, with synthetic set/PATH/secret-like/ordinary/profile sentinels.
Because macOS refuses nested seatbelt installation, this diagnostic alone
declares `externalSandbox` for that command and retains the already-installed
outer OS sandbox/network denial. Effective named configuration readback is
checked separately in the same binary. Production sends only the scoped named
profile and never adopts that diagnostic override. The initial nested-sandbox
exit-71 refusal is retained; no environment assertion was relaxed to pass it.
The actual Codex sandbox permits approved reads
and denies held reads, writes, command network and symlink escapes after policy
installation. The diagnostic does not support `--strict-config`; App Server
does, and that stricter launch is checked separately.

The pinned diagnostic canonicalizes a pre-existing selected-file symlink while
constructing its OS policy. Such a file is ineligible at the adapter's real
hash/identity gate; the after-installation OS test also denies an external swap.
This distinction and the development test-wiring failures are retained locally.
Removing the platform preset entirely prevented macOS command startup; its
necessary syscall/IPC mechanics are retained with explicit data-path denials.
Standard OS metadata, device and local logging IPC remain host confounds; the
tested network denial concerns command TCP access, not removal of all OS IPC.
There is no claim of protection from a malicious concurrent host administrator.

### Pinned environment consumer and evidence limits

At upstream `5adb68a49933ae446bf11935662c83dba55a0804`,
`protocol/src/shell_environment.rs` applies inheritance/exclusions, then set,
then case-insensitive final inclusion. `config/src/merge.rs` replaces arrays
and switches the keyed/legacy representation without merging their filters.
`app-server/src/request_processors/command_exec_processor.rs` calls that
constructor before sandbox selection. Its optional client env override occurs
later; the trusted adapter's fixed request contains no such field.

The model's local `exec_command` consumer in
`core/src/unified_exec/process_manager.rs` also starts with `create_env`.
It subsequently adds actual thread/session/profile identifiers and fixed
terminal/locale/pager metadata. `core/src/exec_env.rs` and the sandbox add
specific runtime flags. These are host-generated, not permissions or arbitrary
configured `CODEX_*` grants. The diagnostic has no thread/session and therefore
does not accept those identifiers as command-check exceptions. The final
worker process is not claimed to contain literally only PATH.

Unified execution can apply runtime-owned package/shell PATH prepends and
restore explicit set values after a shell snapshot. The selected standalone
managed host retains its runtime ownership; snapshots and login shells remain
disabled from launch, and profile use is now explicitly false. Shell startup
cannot obtain configured BASH_ENV/ENV/HOME values through the final filter;
the existing filesystem scope still applies to shell reads. No remote executor,
snapshot restoration, profile startup or client environment override is added.

The synthetic TypeScript tests prove adapter policy/refusal, default parity,
and absence of private-value propagation. Pinned-source inspection establishes
consumer order and later runtime metadata; it is not a Rust unit-test run.
Live-binary configuration readback and actual credential-free `command/exec`
predicate evidence are separate from the existing OS sandbox checks and from
any future authenticated worker execution. Original synthetic config/auth
files are byte-unchanged after the diagnostic. Real configuration/keyring are
not replaced or used by this test. Fresh production-shaped pre-launch hashes
may be observed model-free, but its account/thread/turn and effective command
readback remain unrun until separate execution authorization.

Final deciding verification uses the repository planner's selected owner set
for the clean exact base/head, once, including its existing lifecycle and
failed-settlement owners. Its receipt, cleanup and same-Companion restoration
must validate before closeout. No default Full Canonical, predecessor matrix,
qualification renewal or receipt transfer is requested by this card.

Default callers retain their existing launch, permissions, authentication,
resume and approval behavior. The opt-in adds no Core/wire schema, migration,
authority owner, API executor or persistent configuration. Rollback is to stop
using/revert the opt-in connection; this study then remains blocked. It must
never fall back to the broader default profile.

**Recommendation: review the bounded implementation; keep live execution
BLOCKED/not_run.** P1/P5.1a closeouts, #1209/#1215 open status, #1221,
qualification/HOLD, #1130/RW1B and CW1 dispositions remain unchanged.

## Prospective failed-terminal diagnostic (#1234)

The preparation and `not_run` language above is historical. The separately
authorized attempt is consumed and terminal: one submitted turn, a settled
`codex_turn_failed`, unknown backend usage, no completed X/B or Transition.
The accepted postmortem is C: specific error information was not retained.
This diagnostic connection neither reconstructs that error nor authorizes
another attempt or use of its unused second slot. Original local artifacts,
cutoff, receipts, terminal freeze and separate postmortem freeze stay unchanged.

The adapter projects only after `finishFromTerminal` accepts a failed terminal,
after the existing same-batch notification/conflict and stop checks. It carries
one `failed_terminal_diagnostic` on the existing final `settled` observation.
The earlier `terminal_observed` event is unchanged; it can precede a conflict
and must not be interpreted as accepted diagnosis. A diagnostic is not proof of
successful cleanup: `settlement_failed` and the actual settlement promise still
own that result. Completed/interrupted turns have no failed-terminal diagnostic.

Retained fields are:

- `phase=accepted_failed_terminal`; exact source `turn/completed`, `thread/read`
  or `thread/resume`, according to the existing terminal producer;
- the existing request source binding (request ID plus request, packet-ref,
  packet, physical-root-scope and operation-shape fingerprints), joined to the
  observer's actual run/process/thread/turn IDs and time;
- `error_field`: absent, null, object or malformed;
- `category_disposition`: unavailable, absent, null, recognized, unrecognized
  or malformed, with a closed recognized category or null;
- `http_status_disposition`: not_applicable, absent, null, valid or invalid,
  with an integer 100–599 only from a defined tagged HTTP variant, or null.

The source is pinned upstream `5adb68a49933ae446bf11935662c83dba55a0804`,
`app-server-protocol/schema/typescript/v2/TurnError.ts` and `CodexErrorInfo.ts`.
Both string and tagged-object categories are supported. For example, synthetic
`unauthorized` yields recognized/unauthorized and no HTTP status; synthetic
`{httpConnectionFailed:{httpStatusCode:429}}` yields recognized/
httpConnectionFailed and valid/429. These are host-reported categories, not
root-cause findings. Legitimate `other` remains recognized/other; an unknown
variant yields unrecognized/null without retaining its name. A string `"429"`
is invalid status, not coerced. Missing terminal error information says nothing
about whether an earlier standalone error notification occurred.

No error message, additionalDetails, misalignment explanation, payload, prompt,
stack, header, URL, credentials, arbitrary keys or hashes of discarded private
values enter the projection. Extraction failure produces only the separate
constant `failed_terminal_diagnostic_capture_failure=projection_failed`, with
no change to the accepted failure. Existing terminal fingerprints and generic
result/receipt, optional standalone error notifications, registry, qualification,
cancellation, settlement and retry semantics are unchanged.

### Local consumer connection and cleanup

The executed local operator's recorder used
`event('adapter', {stage, ...observation})` and synchronous JSONL append. Its
frozen script is historical evidence and is not edited. The reviewed reusable
connection is now `createRecordedCodexAppServerAdapterV01` in
`scripts/codex-app-server-observation-recorder.ts`. It connects that same
observation-to-JSONL shape directly to the adapter. It is an optional local
collector, not a new desktop Start control or automatic production activation.

For a separately authorized future disposable invocation, the existing service
factory supplies the actual scope to this connection:

```ts
adapter_factory: (actualScope) => {
  const capture = createRecordedCodexAppServerAdapterV01({
    directory: freshInvocationEvidenceDirectory,
    stage,
    adapter_options: {
      scoped_task: actualScope,
      observe: existingOperatorObservationHandler,
    },
  });
  captures.push(capture);
  return capture.adapter;
}
```

Use a fresh operator-owned capture directory per invocation, outside the worker
scope. Complete the existing service shutdown/settlement in `try/finally`, then
call `closeCapture()` even if shutdown failed. Include its returned status in
the local terminal report separately from host cleanup. Read back `events.jsonl`
and `adapter-capture-status.json` after shutdown; the recorder does not create
a run, authorize Start, close a DB or attest cleanup. No historical directory,
authorization or execution window can be reused by this example.

The collector retains at most 64 observations of at most 16 KiB each; the
diagnostic appears at most once per invocation. It creates files exclusively
and never overwrites an existing attempt. Create/write/size/count failures
stop capture with a closed public reason, not a private exception string.
Status-artifact write failure is returned explicitly and must be reported by
the caller; no artifact is claimed when writing failed. The operator's own
observer remains outside the recorder's I/O catch and keeps its existing policy.

Model-free evidence uses the existing fake host and finite adapter lifecycle:
projection → observer → this collector → settled shutdown → disk readback,
including secret-like exclusions and malformed/foreign/conflicting/duplicate
cases. The normal live-service test owner additionally exercises two synthetic
failures through persisted generic receipt, shutdown and capture readback. These
are repository tests, not authenticated study executions or reproductions of
the historical cause. Focused capture checks are available through
`test-codex-app-server-sandbox-projection.ts --failed-terminal-diagnostic-only`;
the default suite retains all its original sandbox responsibilities.

Compatibility is an additive internal observation field and optional local
recorder. No dependency, Core/wire schema, migration, auth/configuration,
runtime selection, sandbox, smol-toml or packaging change is involved. Rollback
removes this diagnostic/collector connection while preserving already written
local evidence; generic failed-turn behavior remains available. Missing,
unrecognized or `other` diagnostics can still leave the cause unresolved.
Any future live execution requires separate authorization and distinct evidence.

## Incident message connection (#1234)

Both live work-loop attempts are consumed and terminal. The later incident
inspection stopped before launch because no supported message observer existed;
its allowance was not consumed. This implementation does not resume that task,
recover either discarded message, or authorize a call. After review, an explicit
later dispatch can return to the already defined single-turn incident diagnostic.
It cannot use this connection to restart X → B, retry, change model/auth/runtime,
or expand the existing execution limits.

The default-off `incident_message` adapter option runs synchronously only in
`finishFromTerminal`'s accepted failed branch, after the existing identity,
duplicate/conflict, same-batch notification and stop checks. It is refused in
the isolated-auth and candidate-canary lanes. Ordinary default behavior and the
scoped permission/currentness checks are unchanged. There is no transport
export, RPC/standalone-error observation, remote flag, worker tool, UI control,
new receipt field or execution authority.

The callback receives detached, deeply frozen run/process/thread/turn/time
bindings, the existing closed diagnostic and request-source fingerprints, and
only the terminal's `error.message`. Its disposition distinguishes unavailable
error objects, absent messages, null, non-string and text. At most 8,192 UTF-8
bytes are supplied, without splitting a code point; a separate flag reports
truncation. No arbitrary error property, additionalDetails, request/terminal
object, prompt, stream or private-value hash crosses this boundary. The existing
terminal fingerprints and generic `codex_turn_failed` result remain unchanged.
New projection/hook failures produce only a closed incident capture status on
the settled observation. The general observer retains its original exception
policy. This trusted synchronous callback is not a sandbox or a preemptible
plugin; no watchdog or secure-erasure claim is made.

`scripts/codex-incident-message-recorder.ts` completes the optional local path.
`createIncidentRecordedCodexAppServerAdapterV01` composes the category recorder
with a synchronous incident sanitizer. Setup uses exclusive files and refuses
before returning an adapter if either capture cannot be created. Cache the
returned adapter for the exact supplied scope: service capability reads can
call the factory more than once without creating another invocation.

```ts
let capture: ReturnType<typeof createIncidentRecordedCodexAppServerAdapterV01>;
const service = new LiveNativeHostRunServiceV01({
  scoped_task: { scope, window }, // genuine fresh factory scope and existing clock
  timeout_ms: 180_000,
  stop_settle_timeout_ms: 10_000,
  adapter_factory(actualScope) {
    if (actualScope !== scope) throw new Error("incident_scope_conflict");
    capture ??= createIncidentRecordedCodexAppServerAdapterV01({
      directory: freshInvocationEvidenceDirectory, stage: 1,
      adapter_options: { scoped_task: actualScope, observe: existingOperatorObserver },
    });
    return capture.adapter;
  },
});
service.readCapabilityContractV01(); // capture setup only, no host/start/warm-up
// After separately authorized authenticated Start, follow normal settlement.
// In finally, even if shutdown fails:
try { await service.shutdown(); }
finally {
  capture?.closeCapture();
  capture?.closeIncidentCapture();
}
const readback = capture?.readIncidentCapture(); // actual artifact/status disk read
```

The ordinary Start, request/packet admission, invocation, deadline, cancellation
and shutdown owners remain required. This example is consumer wiring, not a
standalone executor or execution authorization. The incident ceiling is one
host attempt and one turn submission, with existing smaller deadlines and
settlement reserve retained. Capture closure does not attest host settlement,
remote generation/billing cessation or successful cleanup. Record those results
separately; never start a replacement to compensate for failed capture.

The sanitizer recognizes complete, narrow diagnostic sentence forms and emits
only fixed explanations with closed public parameter names. It never returns a
free-text substring after regex replacement. For example, synthetic category
`other` plus `Unsupported parameter: 'temperature'.` becomes “The host reports
that the temperature parameter is unsupported.” A recognized schema complaint
can retain the requirement for `additionalProperties=false`. These examples
are fixtures, not messages from either historical failure. Model/auth, effort,
context-window, rate-limit and overload sentence forms have similarly bounded
wording; their recognition is a host-report interpretation, not a root-cause
attestation or authority to retry.

Unknown names/suffixes, echoed request/configuration content, headers, account
identifiers, paths/URLs and other unrecognized free text are withheld. Truncated
input is always withheld, even when its prefix looks harmless. Missing/malformed
messages remain unavailable; sanitizer exceptions yield only `sanitizer_failed`.
This deliberately conservative vocabulary may withhold useful unfamiliar
messages and is not universal redaction. There is no model/network call,
asynchronous raw retention, console output, raw file or message hash. JavaScript
strings are released normally without a secure-erasure promise.

The consumer writes at most one `sanitized-incident.json` artifact, bounded to
16 KiB including provenance and at most 1,024 UTF-8 explanation bytes, plus
`incident-capture-status.json`. Raw text never enters category `events.jsonl`,
Core, receipts or the public observer. After ordinary shutdown and capture
closure, disk readback checks the exact sanitized artifact/status bytes and
reports a separate closed readback failure on corruption/missing material.
Empty artifacts and status distinguish no accepted failed terminal from capture
failure; they must not be reported as a diagnosis. Keep these files in a fresh
exclusive local evidence directory outside worker access.

Focused proof uses the existing sandbox/projection fake host and native-service
DB/lifecycle owner, including actual persisted generic failure, both capture
closures and artifact/status readback. Synthetic checks cover recognizable
`other`, excluded secret/header/account/path/URL/request/config values, unknown
and truncated text, UTF-8 bounds, missing/malformed messages, mutation attempts,
default/completed/interrupted/foreign/conflicting/duplicate parity and separate
hook/sanitizer/I/O failures. The general-observer exception test retains its
existing settlement failure, without declaring capture closure to be cleanup.
The focused projection entry is `--incident-message-only`; the default test
owner includes it as well. No authenticated diagnostic or study runs in these
tests. Rollback removes this opt-in hook/helper while preserving local evidence
and the prior category-only route. No dependency, auth/config/runtime selection,
sandbox, registry, qualification, packaging or Core/schema change is required.
# Managed-runtime candidate compatibility addendum (#1234)

The [reviewed 0.153.4 re-entry](https://github.com/hynk-studio/augnes/issues/1234#issuecomment-5600880587)
is separate from every historical study and the pending post-adoption incident.
The original task material, cutoff, packet/GuideBrief preparation and consumed
attempts are unchanged. No new scope, X result, successor or B exposure follows
from this addendum.

The scoped extension admits two closed artifact tuples, not a semver range:

| Version | Native SHA-256 | Tagged source |
| --- | --- | --- |
| 0.152.1 | `8194ea3181f330e63023b234b0b231855e5874e0331c5ef7cbc490591497a7bf` | `5adb68a49933ae446bf11935662c83dba55a0804` |
| 0.153.4 | `b973d440acac501fd2594a43e7ca9ce41e0a65b9dfb28d0d7a7837c99e1261e3` | `3d2ee51ca2d5db578f328aa75e20aa22c0197c9a` |

Both require the unchanged implemented compatibility profile
`sha256:a4cfb0e38fd6a2af0d29a467c2c5db2579cdc784e93a820f3482fa2c8a1d663a`.
The actual ordinary adapter must additionally select an eligible qualified
managed artifact through its existing owner. Extension compatibility does not
qualify a candidate or make a candidate grant usable as a scoped-task grant.
Thread readback must match the selected tuple's exact CLI version.

The 0.152.1 launch projection is unchanged. For 0.153.4 only, the two newly
introduced features `context_management` and `mcp_oauth_refresh_coordination`
are explicitly disabled before startup and checked in effective readback.
Upstream initialize/thread-start/turn-start/error/config-read schemas, shell
filter/merge/command-environment and macOS seatbelt files are unchanged at the
two source commits. Changed permission-context materialization and thread model
readback were reviewed; actual 0.153.4 credential-free checks covered named
permissions, final filtering, approved reads, denied held reads, symlink escape,
writes, command network and finite cleanup. This is not cold isolation, Strict
qualification or evidence of an actual scoped model task.

**Current disposition: HOLD / not_run.** On 2026-09-09 the candidate broker's
supported file-backed source was absent while ordinary storage was configured
as keyring. The new candidate canary and retained incident were not executed.
No new qualification or registry/production-selection change is prepared on
the strength of model-free checks alone. The separate authentication-contract
boundary must be reviewed before using that candidate allowance. Production
remains managed 0.152.1. Its retained rollback eligibility does not promise
restored Astra compatibility.

After the required candidate evidence and reviewed adoption, the pending
one-turn incident must bind the then-current exact source, managed executable,
configuration and fresh normal scope. It continues to request `gpt-6-astra` /
`max`, use the developer-readable incident consumer, and retain the 180,000 ms
ceiling, smaller RPC/settlement limits, no retry and no X-to-B progression.
This task does not execute or renew that allowance. No historical fingerprint
is rewritten or transferred to the new source.
