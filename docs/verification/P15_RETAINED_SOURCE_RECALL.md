# P1.5 bounded retained-source recall

Implementation issue #1228 under #1210; integrated plan #1209. This report
distinguishes the first recall path from broader retention policy and live utility.

## Source audit and chosen boundary

The P1.4 selected-note helper reads only its supplied packet. The existing
pre-execution revision inspector already validates the complete bounded chain,
including immutable packet envelopes, fingerprints, operator provenance, order,
currentness and history eligibility. It now exposes those already validated
snapshots to an invocation-local read projection. No index or additional store
is needed.

The authenticated Inspector can read exact historical Core records. Semantic
review/history and PC2/PC3/GuideBrief serve proposal, decision, revisit and bounded
relationship responsibilities. The older project-history intake store retains
candidate records under its own scope; its writer explicitly excludes next-work
effects. None supplies this selected-note question-to-reselection connection.
P1.2's persisted semantic compiler separately owns sparse accepted-state
selection and applied retraction. Those records are not imported into a note
search or relabeled as reviewed memory.

The path is **Revise work definition → Selected source notes → Find notes from
earlier work revisions → words/source cue → Select for comparison → Compare with
current work → Save revision → persisted native-host preparation/request**.
Lookup and comparison use the existing authenticated project-continuity route;
save uses its existing explicit revision writer. The current unstarted work,
active project/selection, exact retained packet and excerpt are rechecked before
use. Historical packets never become the current packet by retrieval.

The lookup returns exact packet/excerpt fingerprints, original source locator,
trust, source time, first recorded time, last packet occurrence, full text, and
factual current-selection status. Repeated exact copies are one excerpt, not
independent evidence. Similar source labels and version-like wording establish
no supersession. Query words use bounded case-insensitive substring matching;
this is not arbitrary natural-language understanding.

## Deterministic acceptance inventory (established before verification)

- Condition-specific observation, rejected general explanation, user correction,
  unresolved anomaly and defer/revisit condition share a realistic source cue.
- Remove them from current selection; after 1/3/5 further selection boundaries,
  cold-read the actual validated chain, retrieve by words, deliberately save
  through the writer, and consume via fresh production preparation. Exercise
  one real native-host request with the deterministic adapter.
- Add unrelated newer notes and a genuinely changed condition/version. Verify
  chronology, irrelevant query/input permutation, exact replay and repeated-copy
  grouping without duplicate semantic or execution effects.
- Compare task-only omission with explicit UI exclusion. Neither is automatic
  cooling or source retirement. Check missing/tampered/foreign historical sources
  and stale work/selection/refusal without writes. No external deletion owner is
  fabricated.
- Exercise query, result-count/result-byte, source-selection and mandatory packet
  limits; preserve whole notes and report omissions. Reads/refusals are zero-write;
  save has only the existing packet/session effects.
- Preserve all historical packet bytes, then run representative recovery and
  portable validation at the fixture end. Keep #1221 separate.
- Exercise the real UI lookup, selection, comparison, exclusion/reselection and
  save route in the existing disposable native-host Browser owner.

## Authority, lifecycle and compatibility

Only note snapshots in the current eligible pre-execution chain are searched
(existing maximum 32 revisions). The query has at most 160 characters/eight
words; results have at most eight complete rows/20,000 canonical UTF-8 bytes.
The existing selected-note and packet budgets remain unchanged. Read metadata
reports searched packets/occurrences/serialized entry bytes, distinct/matched/
returned/omitted notes and cutoff. These are not disk I/O or token counts;
full lineage validation performs additional reads.

Lookup is zero-write, including counters and last-used state. Selection is
deliberate; saving does not accept meaning, create a Decision/Transition, or
start execution. Request-only retained-source bindings are verified against
the fresh chain; original packet entries are persisted unchanged. Their original
excerpt fingerprints and all prior-packet lineage remain available to the
production consumer. The local route has an additive lookup action and
request-only retained-source fields. Durable Core/TaskContextPacket and
NativeHostRequest formats and versions remain unchanged. No migration,
provider, credential, configuration or authority owner is added.

Historical/not-selected is factual: the packet owner does not retain the user's
reason for every selection omission, so lookup invents neither a cooling status
nor an exclusion rationale. P1.4 explicit exclusion remains effective until a
new deliberate selection/comparison/save. Missing or modified retained packets
fail existing lineage/source validation; no copied result bypasses that check.
Original external source availability, withdrawal/deletion and external
currentness are still unverified. Reading now never refreshes those facts.

The lookup and request additions can be removed without rewriting durable
records; saved packets use the P1.4 reader/compiler format. P1.4's requirement
to retain note-aware reader/compiler support for note-bearing chains remains.
No historical packet is resealed, deleted or migrated.

## Focused evidence

All focused commands used the repository's Node 24.18.0/npm 11.16.0 toolchain
with the provider API key removed from the child environment:

- `npm run test:project-work-initialization`: PASS, final observed wall time
  26.10 seconds. Existing initialization/revision, P1.4, scope/currentness,
  source-integrity, replay, 32-revision refusal and portability assertions stay
  enabled. The new fixture uses one representative full recovery check after
  the actual deterministic native-host request and a portable export/import
  check at its other branch's end, not at every handoff.
- `npm run typecheck`: PASS for the final TypeScript product/test changes.
- `npm run test:operator-execution-effect-ledger`: PASS, including rejection of
  an extra or missing packet. The native-host fixture now expects exactly six
  inserted packets and 20 Core records because two explicit revisions were
  added; all other effect counts, bindings and forbidden effects are unchanged.
- `node scripts/run-canonical-test-suite.mjs e2e-operator-native-host-execution`:
  PASS, 155.005 seconds. All four workflow phases, exact effects, five existing
  viewport sizes, bounded lifecycle and cleanup passed. Remaining owned
  processes/listeners: zero. The owner completed Companion maintenance release.
- `git diff --check`: PASS before commit.

Development failures are retained as development evidence, not deciding runs.
The fixture first reached a byte limit before its intended count-limit assertion;
small and large notes now test those bounds separately. Fault injection initially
hit the real immutable-record trigger and fingerprint CHECK; it now first proves
ordinary mutation is refused, then injects corruption only in a disposable
savepoint and reinstates the exact triggers before validation. Portable import
initially refused a missing destination directory; the fixture now creates its
owned destination through the existing setup pattern. No product guard changed.

The first Browser attempt timed out awaiting lookup after an unsynchronized
search click. The fixture now waits for the enabled search control and reports
a visible result/error. The second passed all workflow phases but the exact
effect ledger correctly refused the two newly added packet effects. Updating
only the fixture's exact expected counts and adding under/over-count refusals
produced the final passing run. No timeout, assertion, planner, receipt policy,
production data or recovery validation was relaxed.

## Matched deterministic observations

The same permitted revision chain and recorded cutoff feed the lookup and
direct-read/good-note baseline. The query is `valve leak` (12 characters and
12 UTF-8 bytes), not a hidden record ID. Five condition/correction/anomaly notes
are absent from active context at every boundary. A sixth, genuinely changed
condition is also recalled at boundaries 3 and 5. New unrelated display notes
remain separate. Repeated source copies count as one excerpt.

| Boundary | Retained packets / note occurrences | Active notes before | Recalled notes absent before | Lookup ms | Comparison ms | Writer ms | Fresh consumer ms | Direct read ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 4 / 12 | 2 | 5 | 16.891 | 1.266 | 66.666 | 156.142 | 17.860 |
| 3 | 6 / 17 | 2 | 6 | 23.274 | 1.302 | 96.247 | 283.506 | 24.660 |
| 5 | 8 / 21 | 2 | 6 | 31.782 | 1.416 | 157.880 | 452.777 | 33.099 |

Initial fixture/source preparation: 87.902 ms. Cumulative preparation of later
handoffs: 50.689/203.658/403.607 ms; memory snapshot/connection setup:
0.977/1.137/1.817 ms. Lookup measures fresh lineage inspection plus deterministic
projection; API authentication/eligibility and UI latency are not included.
Comparison includes resolving exact retained sources from that inspected chain.
Writer timings exclude exact replay; each writer adds one packet and only the
existing operator-session effects. Consumer timing is the real fresh persisted
native-host admission. The boundary-5 request subsequently carries the exact
selected source entries and external refs through the production request builder.

| Material | Boundary 1 characters / UTF-8 bytes | Boundary 3 | Boundary 5 |
|---|---:|---:|---:|
| Direct-read retained packets | 86,490 / 90,090 | 132,936 / 143,736 | 177,662 / 195,662 |
| Active note entries | 4,876 / 8,476 | 4,876 / 8,476 | 4,876 / 8,476 |
| Lookup result rows | 11,014 / 11,014 | 13,251 / 13,251 | 13,251 / 13,251 |
| Good-note material | 8,589 / 8,589 | 10,309 / 10,309 | 10,309 / 10,309 |
| Next-consumer packet | 26,023 / 26,023 | 27,743 / 27,743 | 27,743 / 27,743 |

Scanned note-entry bytes: 25,319/43,984/60,930. Good-note preparation:
0.152/0.124/0.128 ms. Consumer estimated tokens: 6,480/6,910/6,910; selected
entries including mandatory provenance: 9/10/10. These are serialized material
counts, not billed tokens or disk I/O. The broad count-limited query reports
eight omitted matches; the large-note query reports three byte-bound omissions
and returns only complete notes.

Manual actions for lookup are entering a cue, searching, selecting results,
comparing and saving. Direct reading requires inspecting permitted packets,
finding applicable notes/source bindings, preparing good notes, comparing and
saving. These are workflow descriptions, not measured human actions or burden.
The good-note baseline measures direct reading and note preparation, not a
second timed writer/host invocation. Full validation SQL/physical disk I/O,
browser-route latency, human effort and live model outcomes are unmeasured.
Live provider calls/billed tokens in these fixtures: zero. No speed, compression,
model-benefit or biological-mechanism claim follows from these observations.

## Dispositions and deciding evidence

- `implemented`: bounded question/source-cue lookup, historical/current
  presentation, deliberate source-bound comparison/reselection, writer
  revalidation and fresh production next-work use.
- `no_change_needed_with_evidence`: immutable historical packet formats,
  existing semantic acceptance/retraction owners, P1.4 note format and native
  request consumer, and normal portable/recovery owners remain sufficient for
  this slice. Focused regressions validate the affected path.
- `narrowed`: only eligible unstarted work and retained selected-note snapshots;
  no general history search, inferred lifecycle status or semantic equivalence.
- `blocked`: no required implementation dependency identified. #1221 remains a
  separate probe-bearing generic recovery incompatibility and is not exercised
  or fixed by this native-host path.
- `not_run`: live model/utility study, external source availability/deletion
  verification, broader retention execution and later phases.

The exact clean-base/head planner, its one selected deciding run, receipt
validation and final Companion restoration are recorded in the Draft PR after
this source commit. This file does not preclaim their outcome or import a
predecessor receipt. Implementation, deciding verification, PR acceptance and
live utility are separate outcomes. Fresh task-start Companion continuity was
exact `no_current_work` / `no_run`; no work binding or runtime completion proof
was manufactured.

Broader cross-work/post-execution history recall, external deletion propagation,
retention/expiry/archive policy and relation views are narrowed/deferred here.
The cognitive-map research amendment remains intact. No cache, decay, timer,
background compaction, deletion engine, graph, model extraction or later phase
is started. Deterministic conformance will not establish live model benefit,
reduced human burden, compression gains or a biological memory mechanism.
This bounded path does not declare all P1.5 or P1 complete. #1210 stays open.

## Changed owners

Product changes are in the selected-note editor and its retained lookup child;
the project-continuity local route; selected-source comparison and retained
recall helpers; the pre-execution chain inspection and revision writer; and
request-only revision types. Verification changes are in the existing
project-work-initialization and native-host Browser owners plus the Browser
effect ledger and its direct regression. This report records the bounded
source audit, measurements and remaining questions. Active doctrine, protocol,
sequence/evaluation owners, production runtime settings and P1.1–P1.4 historical
reports remain unchanged.
