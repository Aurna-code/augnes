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
