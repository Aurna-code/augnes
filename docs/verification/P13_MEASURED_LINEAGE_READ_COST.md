# P1.3 measured compiler and lineage read cost

Issue #1222, parent #1210, integrated plan #1209. This is bounded diagnostic
evidence for one compiler change, not a production incident or an asymptotic
complexity claim. The baseline is merged #1220 at
`21d35d25d911e6f3011f057ff5b805d0eb6e5d17` in `hynk-studio/augnes`.

The compiler now reuses the existing source-validation session for one
synchronous invocation, before its packet insertion. Paired width-five
controls reduced source validations from nine to five while retaining all five
full-chain checks and identical packet/database fingerprints. Reader and
recovery owners are unchanged. This differs from #1220, which already reused
sources within a reader's receipt candidate set; none of that earlier gain is
counted here.

## Scope and method

The initial predeclared diagnostic was one sweep of small depth/width controls,
with no larger points, no limit increases and no repeated full reconstruction
at every point. It completed 15 points. After repeated compiler reads were
observed, three paired repetitions per selection mode used independently
rebuilt equivalent disposable fixtures, fixed clocks and identical IDs,
fingerprints, budgets and semantic shapes. One subsequent sweep confirmed all
15 after-patch points. Each diagnostic used the existing child/environment and
cleanup owners, Node 24.18.0, zero provider/network calls and a 300,000 ms bound.
One complete reconstruction diagnostic separately retained its existing
600,000 ms bound. These diagnostics are non-deciding.

Fixtures reuse `durable-local-closed-loop-v0-1`, the semantic proposal/decision
builders and the normal preview, authorization, Transition and packet writers
from the existing durable semantic smoke. They contain no user data or sessions.
The compiler clock reads are fixed relative to `2026-07-10T14:00:00.000Z`.
Each target namespace is `p13-target-N`; revision summaries retain the explicit
condition X and leave other conditions undecided.

- Replacement depth: three independently accepted states remain current; one
  target receives five valid replacements. Points 1/3/5 mean replacement
  boundaries, total compiler packet depths 4/6/8 and target revisions 2/4/6.
- Reselection depth: three unchanged current states, explicit selected budget
  two; each step selects an actually omitted state. Points 1/3/5 have packet
  depths 4/6/8 and target revision one. Ambiguous unchanged reselection is not
  positive benchmark material.
- Width: one/three/five current states at packet depth five, using replacement
  steps to hold packet depth fixed. Maximum target revisions differ (5/3/1),
  so this separates packet depth from width but is not a perfectly orthogonal
  Transition-history experiment.
- Complete controls retain the original selected-entry budget; sparse controls
  explicitly set `max_selected_entries=2`. No other limits change.

Fixture writes and initial packet construction are outside measured compile
calls. Initial construction (including fixture assertions and unmeasured setup
compiles) ranged 48–410 ms before and 48–347 ms after. Separately timed
replacement-writer calls totalled 752/730 ms before/after. Those setup times
are not claimed as compiler improvement.

Temporary counters measured SQL get/all/iterate calls, returned rows and
`payload_json` UTF-8 bytes, JSON parsing, recursive canonicalization calls,
reference normalization, hashes, state rebuilds, packet and full-chain
validation, source-validation requests and successful cache hits. Counter
overhead is included. CPU uses `process.cpuUsage`; elapsed uses a monotonic
clock. Recursive canonicalization counts include nested calls and are not
independent validations. Timing categories are not an exhaustive additive
breakdown.

Returned records are not SQLite internal visited rows. Returned payload bytes
are not disk I/O; serialized UTF-8 bytes are not characters or model tokens.
No real disk I/O, model tokenization, production latency, concurrent writers,
longer histories, maximum cache capacity or explicit packet-limit boundary was
measured. Every matrix point fit existing bounds. Full recovery was sampled
only at the two replacement endpoints in each sweep.

## Matrix

`C` is complete and `S2` is sparse budget two. `R` is replacement depth,
`S` is useful sparse reselection and `W` is width at packet depth five.
Selected/excluded and packet bytes were identical before/after. Source refs
retain all historical material and type/provenance checks.

| Case | Point | Packet depth | Max target revision | Current states | Selected / excluded | Source refs | Packet UTF-8 bytes |
|---|---:|---:|---:|---:|---:|---:|---:|
| R-C-w3 | 1 | 4 | 2 | 3 | 3 / 0 | 10 | 13,625 |
| R-C-w3 | 3 | 6 | 4 | 3 | 3 / 0 | 14 | 15,123 |
| R-C-w3 | 5 | 8 | 6 | 3 | 3 / 0 | 18 | 16,621 |
| R-S2-w3 | 1 | 4 | 2 | 3 | 2 / 1 | 10 | 13,023 |
| R-S2-w3 | 3 | 6 | 4 | 3 | 2 / 1 | 14 | 14,521 |
| R-S2-w3 | 5 | 8 | 6 | 3 | 2 / 1 | 18 | 16,019 |
| S-S2-w3 | 1 | 4 | 1 | 3 | 2 / 1 | 9 | 12,645 |
| S-S2-w3 | 3 | 6 | 1 | 3 | 2 / 1 | 11 | 13,387 |
| S-S2-w3 | 5 | 8 | 1 | 3 | 2 / 1 | 13 | 14,129 |
| W-C-w1 | 5 | 5 | 5 | 1 | 1 / 0 | 12 | 10,762 |
| W-C-w3 | 5 | 5 | 3 | 3 | 3 / 0 | 12 | 14,374 |
| W-C-w5 | 5 | 5 | 1 | 5 | 5 / 0 | 12 | 17,986 |
| W-S2-w1 | 5 | 5 | 5 | 1 | 1 / 0 | 12 | 10,762 |
| W-S2-w3 | 5 | 5 | 3 | 3 | 2 / 1 | 12 | 13,772 |
| W-S2-w5 | 5 | 5 | 1 | 5 | 2 / 3 | 12 | 16,184 |

Replacement source-ref types at points 1/3/5: task packet 4/6/8,
Transition receipt 4/6/8, plus one `host_process` and one `worker_process`
ref. Reselection keeps three Transition receipts and increases task-packet refs
4/6/8. Width controls have five task-packet and five Transition-receipt refs
plus the same two fixture refs. The aggregate data below preserves the actual
ref-type strings in the per-point identity material.

| Case / point | Compile SQL calls before → after | Source validations before → after | Full-chain checks, both | Compile ms before → after | Lineage ms before → after |
|---|---:|---:|---:|---:|---:|
| R-C-w3 / 1 | 121 → 101 | 6 → 4 | 4 | 107.1 → 88.3 | 124.2 → 120.2 |
| R-C-w3 / 3 | 151 → 131 | 8 → 6 | 6 | 146.0 → 126.8 | 170.6 → 175.4 |
| R-C-w3 / 5 | 181 → 161 | 10 → 8 | 8 | 187.9 → 172.3 | 203.9 → 215.2 |
| R-S2-w3 / 1 | 121 → 101 | 6 → 4 | 4 | 102.3 → 81.8 | 117.1 → 114.6 |
| R-S2-w3 / 3 | 151 → 131 | 8 → 6 | 6 | 148.1 → 122.9 | 155.9 → 155.7 |
| R-S2-w3 / 5 | 181 → 161 | 10 → 8 | 8 | 184.2 → 163.5 | 199.4 → 199.5 |
| S-S2-w3 / 1 | 106 → 86 | 5 → 3 | 3 | 82.2 → 59.6 | 97.4 → 92.8 |
| S-S2-w3 / 3 | 106 → 86 | 5 → 3 | 3 | 84.5 → 61.7 | 97.5 → 95.1 |
| S-S2-w3 / 5 | 106 → 86 | 5 → 3 | 3 | 84.7 → 62.4 | 99.9 → 97.4 |
| W-C-w1 / 5 | 102 → 112 | 5 → 5 | 5 | 102.2 → 99.3 | 123.7 → 110.9 |
| W-C-w3 / 5 | 136 → 116 | 7 → 5 | 5 | 124.9 → 102.4 | 135.6 → 133.4 |
| W-C-w5 / 5 | 170 → 120 | 9 → 5 | 5 | 146.4 → 103.4 | 159.0 → 156.7 |
| W-S2-w1 / 5 | 102 → 112 | 5 → 5 | 5 | 97.5 → 104.0 | 111.1 → 112.5 |
| W-S2-w3 / 5 | 136 → 116 | 7 → 5 | 5 | 120.1 → 101.2 | 133.1 → 135.7 |
| W-S2-w5 / 5 | 170 → 120 | 9 → 5 | 5 | 145.9 → 101.7 | 159.2 → 155.1 |

Lineage counts are unchanged; timing differences there are local variation.
At width one the new session adds ten schema queries without a source cache
hit. This bounded setup overhead is retained rather than adding a conditional
policy to optimize a control that showed no source reuse.

Across the 15 initial compile points, SQL execution took 10.6 ms and JSON
parsing 27.1 ms of 1,864.2 ms elapsed. The counters identify repeated source and
protocol work; they do not attribute all remaining time to one normalization
function. Current-state projection reads returned one/three/five states in
0.039–0.090 ms before and 0.038–0.080 ms after. Their full returned-object UTF-8
sizes are included in the identity material; SQL payload-json bytes are zero
for these projection rows, not zero returned data.

## Paired compiler result

Three independent same-shape width-five runs per mode, not a single faster
wall-clock observation:

| Measurement | Complete before → after | Sparse before → after |
|---|---:|---:|
| SQL calls, each run | 170 → 120 | 170 → 120 |
| Returned core records, each run | 50 → 30 | 50 → 30 |
| Unique returned core records | 25 → 25 | 25 → 25 |
| Repeated core returns | 25 → 5 | 25 → 5 |
| Returned payload UTF-8 bytes | 415,635 → 236,035 | 415,635 → 236,035 |
| Source validations / successful hits | 9 / 0 → 5 / 4 | 9 / 0 → 5 / 4 |
| Full-chain validations | 5 → 5 | 5 → 5 |
| Recursive canonicalization calls | 244,329 → 177,065 | 235,732 → 168,468 |
| Median elapsed ms | 148.15 → 105.58 | 143.51 → 102.61 |

All six paired point objects (including packet ID/fingerprint and logical
database fingerprint) matched exactly. All 15 sweep points also matched. No
historical packet changed. Compiler writes added only the expected packet;
projection/head snapshots were unchanged. Real lineage consumers resolved the
expected immediate prior and unique receipt and reported current projections.

## Smallest changed boundary and lifetime

Only `persisted-semantic-context-compiler.ts` changes product behavior. The
compiler creates the existing DB/project-bound source-validation session after
the caller clock and perspective selection, shares it among current-state
source checks, lifecycle source checks and carried receipt candidates, then
stops using it before packet insertion. It is local to the synchronous
invocation, not to the lifetime of the surrounding transaction. There are no
intervening writes, async yields or caller callbacks in this interval.

Both the standalone immediate-transaction entry and the authenticated operator
entry continue through the same compiler owner. Returned values cannot expose
the session. Mutable projection/head checks still execute. The existing
256-successful-source capacity and uncached fallback are unchanged; capacity
is not a lifetime history limit.

The existing smoke owner adds valid replay → missing-gate/head-revision
mutation → fresh refusal → rollback → valid replay checks inside one outer
transaction. A checkpointed copy with identical IDs/fingerprints is opened on
another connection, validated, mutated and freshly refused while the original
remains valid. Logical snapshots prove zero writes for replay and refusals.
The first focused attempt exposed `SQLITE_CANTOPEN` in the new test's serialized
WAL copy; that attempt is preserved. The test now uses checkpoint plus a
disposable file copy, with both databases and side files cleaned up.

No schema, wire, semantic, migration, persistent index, provider, runtime,
credential or authority contract changes. No cache is shared across project,
connection, mutation, rollback, import, restore or a later invocation. Reverting
the compiler change restores repeated validation work without data rollback.

## Consumer evidence and limits

The 49-record packet-history full-recovery controls pass and are immutable.
Both have 865 SQL calls, 301 returned core rows, 44 source validations and 36
full-chain checks before/after. Complete elapsed: 896.4/883.4 ms; sparse:
868.8/870.5 ms. Returned payload bytes: 2,742,560 complete and 2,738,948 sparse.
These unchanged counts earn no recovery speedup claim.

One full existing portable test passed with all assertions and cleanup. Its
27-record supported control exported in 17.8 ms (341,386 bytes), validated in
2,176.9 ms and imported with recovery in 4,486.5 ms. Validation returned 587
core rows / 6,757,831 payload bytes; import returned 1,174 / 13,515,662.
Import/replay and negative-case times include nested full validation. No
direct-probe record was rewritten or deleted to manufacture recovery success.

The separate #1221 direct context-use-probe ref mismatch is not fixed or claimed
as passing generic recovery. P1.4, P1.5, P2/P3 and other excluded work are absent.
Parent #1210 remains open. No Ready, merge, auto-merge, deployment or release
authority follows from this report.

## Local reproduction and artifact boundary

Temporary diagnostic sources, generators, counters and lifecycle summaries
are retained locally under `.augnes-local-verification/p13/`; none enters
default verification. Raw logs, private paths, real data and machine identifiers
are not committed or uploaded. The following are the actual local commands;
the temporary generators require that retained local bundle and are not
claimed to be installed commands of a clean clone:

```sh
node .augnes-local-verification/p13/generate.mjs
node .augnes-local-verification/p13/instrument.mjs
node .augnes-local-verification/p13/run-child.mjs baseline-1
node .augnes-local-verification/p13/run-child.mjs paired-before scripts/.p13-diagnostic.ts 300000 --paired
# Apply only the compiler patch, retaining equivalent fixture construction.
node .augnes-local-verification/p13/run-child.mjs paired-after scripts/.p13-diagnostic.ts 300000 --paired
node .augnes-local-verification/p13/run-child.mjs matrix-after
node .augnes-local-verification/p13/instrument.mjs --undo
```

Each command used the repository-local Node 24.18.0 bin directory on PATH.
Artifact labels are exclusive-create; reproductions must use fresh labels and
must not overwrite the preserved attempts. `generate-profile.mjs` applies only
temporary call wrappers to a copy of the existing portable or reconstruction
test. The original assertions, normal writers and lifecycle owners remain.
The standalone production owners are reproducible through the existing
Canonical suite, including `durable-semantic-loop`, `reconstruction-conformance`
and the focused recovery validator; no private diagnostic bundle is required
to run those regressions.

## Per-point identity and returned material

The source-ref type strings are `task_context_packet`,
`state_transition_receipt`, `host_process` and `worker_process`. These fixtures
serialize as ASCII, so the measured character counts equal their UTF-8 byte
counts; this equality is specific to this sample. Current-state returned-object
bytes are 1,622 / 4,864 / 8,106 for width 1/3/5.

The complete 15-point identity objects, including packet IDs/fingerprints and
full logical database fingerprints, were compared exactly before/after. Their
canonical sorted-JSON aggregate SHA-256 is given below. The full synthetic
aggregate is retained locally as `points.json`; it contains no raw database
rows. Representative width-five identities make the fixture binding reviewable.

Aggregate identity: `sha256:dd60d0d8d12ded4c8b3a7d23d9604379c5439873bc9f4ee1f6735ea3f8a091a1`.

- W-C-w5 packet: `task-context-packet:87fbf9a31fcd8d228b4970f`; fingerprint `sha256:ccb92c0152f775c456cbb974c905f704da27cad000da179e38b6dcc12c14e173`; logical database `sha256:d3c74f566e58b9e7ea849905b7c04319cc6c996f1df581f11bce9de463443283`.
- W-S2-w5 packet: `task-context-packet:07a17e486f8e807944473db`; fingerprint `sha256:709e38409c02e4b69ba54b70bc5e84f250dce2aec7cce75e87345187163c8ed2`; logical database `sha256:7842ba0fb4c2a998a467ca987d160f7e8fc84093758008aaa9a33d125f66e477`.

| Case / point | Compile core returns before → after | Returned payload bytes before → after | Compile CPU user + system ms before → after |
|---|---:|---:|---:|
| R-C-w3 / 1 | 33 → 23 | 279,266 → 189,466 | 116.4 → 105.9 |
| R-C-w3 / 3 | 43 → 33 | 374,956 → 285,156 | 159.8 → 134.9 |
| R-C-w3 / 5 | 53 → 43 | 470,646 → 380,846 | 202.8 → 182.2 |
| R-S2-w3 / 1 | 33 → 23 | 279,266 → 189,466 | 104.2 → 82.9 |
| R-S2-w3 / 3 | 43 → 33 | 374,956 → 285,156 | 153.3 → 126.0 |
| R-S2-w3 / 5 | 53 → 43 | 470,646 → 380,846 | 191.0 → 165.3 |
| S-S2-w3 / 1 | 28 → 18 | 231,421 → 141,621 | 82.6 → 60.1 |
| S-S2-w3 / 3 | 28 → 18 | 231,421 → 141,621 | 84.7 → 61.7 |
| S-S2-w3 / 5 | 28 → 18 | 231,421 → 141,621 | 100.0 → 68.5 |
| W-C-w1 / 5 | 26 → 26 | 238,587 → 238,587 | 109.2 → 102.7 |
| W-C-w3 / 5 | 38 → 28 | 327,111 → 237,311 | 124.8 → 104.7 |
| W-C-w5 / 5 | 50 → 30 | 415,635 → 236,035 | 147.5 → 104.2 |
| W-S2-w1 / 5 | 26 → 26 | 238,587 → 238,587 | 98.2 → 104.5 |
| W-S2-w3 / 5 | 38 → 28 | 327,111 → 237,311 | 123.6 → 101.4 |
| W-S2-w5 / 5 | 50 → 30 | 415,635 → 236,035 | 147.2 → 102.3 |

## Full reconstruction diagnostic

One complete source-owned reconstruction test passed naturally in 549,148 ms
under its unchanged 600,000 ms deadline, with all 21 checks, 62 source records
and 441 normalized relations. No required assertion was removed. This is a
representative after-patch consumer observation, not a paired claim of improved
reconstruction speed. The relation count is specific to this local diagnostic;
it does not substitute for the final exact-head Canonical report.

Only phase/query wrappers remained in this diagnostic; fine protocol counters
were removed before it ran. Source and reconstructed reader/database
immutability, disconnected-tip ambiguity, exact source/currentness negatives,
sparse current-state continuity and portable reconstruction remained covered.
Provider/network calls and owned process/listener residue were zero. The
original test source is unchanged. Phases are inclusive of nested calls and
should not be summed with their inner compiler measurements.

| Phase | Elapsed ms | CPU user + system ms | SQL calls | Returned core rows | Returned payload UTF-8 bytes |
|---|---:|---:|---:|---:|---:|
| `buildVNextOperatorBrowserFixtureV01:196` | 2189.9 | 2556.3 | 3,408 | 615 | 6,366,386 |
| `augmentRc1SourceLifecycleV01:231` | 97697.5 | 100345.1 | 50,571 | 16,195 | 211,223,755 |
| `assertProjectHomeCompatibilityV01:273` | 21891.4 | 22330.1 | 11,483 | 3,767 | 49,405,414 |
| `verifyProjectHomeLifecycleLineageRefusalV01:278` | 32067.8 | 32584.9 | 16,905 | 5,532 | 72,617,394 |
| `readCurrentOwnersV01:317` | 86335.8 | 87495.3 | 46,822 | 15,742 | 204,011,055 |
| `exportActivePortableProjectV01:323` | 30.0 | 45.1 | 66 | 62 | 924,452 |
| `importPortableProjectV01:376` | 185745.4 | 188024.5 | 98,767 | 32,334 | 418,444,600 |
| `readCurrentOwnersV01:401` | 90178.7 | 91238.9 | 46,816 | 15,742 | 204,009,819 |
| `assertProjectHomeCompatibilityV01:407` | 22300.4 | 22536.5 | 11,480 | 3,767 | 49,404,796 |
| `exportActivePortableProjectV01:412` | 29.0 | 32.7 | 66 | 62 | 924,452 |

Authenticated fixture compiler calls returned 34/76/129/157 core rows,
467,055/998,363/1,597,352/2,015,599 payload bytes and took
252.2/497.7/755.2/975.3 ms. These are nested fixture-construction observations,
not additional depth-matrix points. Source loading, full validation and repeated
current-owner reconstruction remain substantial costs beyond the selected
compiler boundary.

The small before/after measurements used fixed before-then-after order on one
shared Mac, without a randomized crossover or a production workload. Work-count
reduction and preserved exact semantics justify this bounded change; elapsed
times alone do not establish general throughput or user-outcome improvement.

## Focused regression commands

Each final uninstrumented owner ran sequentially as `node --import tsx <script>`
through the existing canonical child/environment owners with an isolated
HOME, database and temporary root. Every listed run exited naturally, closed
its streams and completed cleanup with zero remaining owned processes.

| Script | Result | Child duration ms |
|---|---|---:|
| `scripts/smoke-vnext-durable-semantic-loop-v0-1.ts` | pass | 9,359 |
| `scripts/vnext-protocol-conformance.ts` | pass | 4,344 |
| `scripts/test-vnext-project-controls.ts` | pass | 2,059 |
| `scripts/test-vnext-project-work-initialization.ts` | pass | 13,882 |
| `scripts/test-recovery-canonical-record-validator.ts` | pass | 103,289 |

The semantic owner preserves the eleven sparse integrity negatives, mandatory
overflow, missing unselected projection/head/gate, foreign/malformed/missing
sources, fingerprint conflicts, stale/replay/retired selection, immutable
historical packets, useful reselection and ambiguous-no-op pre-write refusal.
Read-only lineage and recovery checks preserve database snapshots separately
from the compiler refusal checks. The focused recovery validator retains its
30-record, 13-supported-kind production-shaped fixture, real Home/Workbench/
Inspector consumers and integrity negatives.

No heavy scale matrix was added to default verification. The final exact-head
Local Canonical planner and deciding receipt are reported separately in the
Draft PR; these focused and diagnostic observations are not deciding receipts.

`npm run typecheck` (including Next route type generation) and
`git diff --check` passed on the final source. Their standalone elapsed times
were not separately recorded. The reconstruction, portable, recovery-validator,
direct-probe, verification-planner and receipt-policy source files are unchanged
from the baseline.
