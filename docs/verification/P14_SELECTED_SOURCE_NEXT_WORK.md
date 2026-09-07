# P1.4 selected-source notes in next-work preparation

Implementation issue: #1226. Parent phase: #1210. Integrated plan: #1209.
This is a bounded intake path for the existing unstarted-work revision surface.
It does not reopen P1.3 or establish live model utility.

## Current-source choice and production path

The selected-session digest intake and ingest-contract modules remain previews.
Their false authority flags and temporary-database contracts are unchanged.
The current PC3 selected-work relationships and PC4 GuideBrief explain work and
provenance; neither was an existing writer for these selected excerpts.

The missing connection was between user-selected free text and the exact
persisted context read by native-host work preparation. The implementation uses
the existing **Revise work definition** form and append-only revision owner:

1. Open an eligible unstarted work's revision form and **Selected source notes
   for this work**. Enter the selected excerpt, source/revision, provenance and
   review label; optionally supply a known source time. Add the note.
2. **Compare with current work** calls the existing project-continuity endpoint
   with the exact current packet identity. It reads the validated revision
   chain and returns a deterministic, read-only comparison.
3. **Save revision** uses `revisePreExecutionProjectWorkV01`, its existing local
   operator transaction, active-project checks, compare-and-set, normal packet
   compiler, validators and append-only persistence.
4. A subsequent `admitPersistedHostTaskContextPacketV01` reads the saved packet
   and its complete current lineage. `buildNativeHostRequest` carries that
   packet and the selected source references into the existing native-host
   request. Saving alone does not start execution.

Production owners are in `components/workbench/semantic-review`, the existing
`app/api/vnext/operator/project-continuity/route.ts`,
`lib/vnext/runtime/project-work-revision.ts`,
`lib/vnext/runtime/pre-execution-project-work-revision.ts` and
`lib/vnext/runtime/direct-native-host-round-trip.ts`. The new deterministic
presentation helper is `lib/intake/selected-work-source-comparison.ts`.

## Meaning, provenance and currentness

The selected excerpt stays free text. Review labels expose changed assumptions
or user corrections, new candidates, rejection reasons, deferral/revisit
conditions, open questions, next checks and unclassified material. The comparison
identifies exact reconfirmation of previously selected material or an entire
current goal/criterion/non-goal, changed material at an identical source locator,
and other new source material requiring review. It does not infer general
semantic equivalence, contradictions or acceptance from text similarity.

User declaration, model interpretation and unverified source report remain
distinct trust classes. A user correction remains the source for what the user
said, including when a model summary disagrees. Neither becomes accepted state.
Quoted instructions, including fake approval wording, grant no authority.

The excerpt identity binds workspace, project, source locator/revision, exact
trimmed text, label, provenance and normalized optional time. Exact duplicates
are deduplicated; input-list permutation is immaterial. Known source times order
the entries chronologically, with stable identity ordering for ties or unknown
times. Changed time, revision, source or conditions remain distinguishable.

Comparison binds the exact current packet ID and fingerprint plus the selected
entries. Save rechecks this binding within the normal writer transaction. Stale
work or modified selected material requires a fresh comparison. Exact successor
replay still requires the existing zero-history eligibility checks. Omitting
the optional selection from an existing revision request preserves its current
notes; an explicit empty selection withdraws them from subsequent preparation.

Original conversation completeness, source availability and external currentness
are **unknown**. This path stores user-selected snapshots, does not fetch sources,
and does not detect later deletion at an external source. Explicit exclusion
removes a note from the current revision and consumer context. Historical packets
remain immutable; an old packet cannot be admitted as current to resurrect the
note. This is not a new deletion or retention policy.

## Effects, compatibility and rollback

Comparison performs no database writes. Save may append one existing
`TaskContextPacket` and rotate the existing operator action credential. Exact
replay appends no packet. Selection and Save create no ReviewDecision,
Transition, applied semantic state, capability grant or execution.

Persistence uses existing `selected_context` source entries and `ExternalRef`
fields. There is no new durable Core record type, protocol field, table, migration
or authority owner. The local revision request and read projection gain optional
selected-context fields. The selected-excerpt reference convention is reconstructed
and validated by the same revision lineage owner. Old packets retain their
existing fingerprints and remain readable by the new code.

A rollback can remove the new entry UI while retaining the reader/compiler
support for already saved notes. A complete downgrade to the pre-P1.4 reader
cannot validate note-bearing revision chains and must not be represented as
data-compatible. Do not delete those packets to make a downgrade pass; any
database restore remains with the existing separately authorized recovery owner.

All explicitly selected notes are mandatory: at most eight inputs, 2,000 Unicode
code points per excerpt, and 12,000 UTF-8 bytes for the canonical selected entries
including provenance. Oversized selection is refused without clipping or writes.
The four existing revision provenance entries and the overall packet budget
remain mandatory. Non-selection is not rejection, refutation or deletion.
P1.2's separate semantic-state sparse-selection/exclusion owner is unchanged.

## Focused evidence and observations

`npm run test:project-work-initialization` uses normal writers, validators,
operator sessions and disposable production-shaped databases. It covers seven
notes containing a correction, conditional rejection, exception, deferred item,
revisit condition, unresolved question, next check and conflicting model summary.
Fresh SQLite connections at boundaries 1/3/5 call the actual persisted native-host
preparation reader, preserve every excerpt and source, and perform zero writes.
Exact replay creates no extra packet. Source/project/fingerprint errors,
chronology, changed conditions, stale work/source comparison, mandatory count and
byte overflow, explicit withdrawal, stale-packet refusal, and one end-of-fixture
recovery validation are checked. A normal deterministic native-host round trip
also proves that the actual request carries the selected excerpt and source ref.

`node scripts/run-canonical-test-suite.mjs e2e-operator-native-host-execution`
passed through the existing headless Chrome/CDP owner. The added UI case proves
comparison leaves the disposable database byte-for-byte unchanged and a fresh
production page read returns the saved note and provenance. The open editor was
checked at 390, 430, 768, 1280 and 1440 pixels without horizontal overflow. The
complete child exited naturally in 156,578 ms, with zero owned process/listener
residue, zero provider/external requests and restoration of the prior live
Companion. These are DOM, interaction and network observations, not a pixel
design review or a real provider run.

The pre-browser `npm run typecheck` passed. A subsequent invocation reported
seven TS2344 errors in generated `.next/dev/types` route validators concerning
existing exported handler factories (automation-cycle, host-round-trip,
inspector, project-continuity, run-results, semantic-review and session).
No handler export, assertion or verification policy was changed to suppress
these diagnostics. The deciding executor's existing generated-state cleanup
and fresh typecheck determine the final result; the post-browser failure remains
separate development evidence.

One focused local observation on Node 24.18.0/npm 11.16.0, macOS arm64:

| Handoff boundary | Revision write ms | Fresh consumer read ms | Packet code points | Packet UTF-8 bytes | Estimated tokens | Returned entries | Project packet records |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 32.31 | 39.18 | 28,602 | 28,602 | 7,125 | 11 | 2 |
| 3 | 59.60 | 125.23 | 28,602 | 28,602 | 7,125 | 11 | 4 |
| 5 | 102.43 | 261.09 | 28,602 | 28,602 | 7,125 | 11 | 6 |

Seven excerpts contained 722 code points / 722 UTF-8 bytes before provenance.
Deterministic entry preparation took 0.448 ms; comparison took 0.726 ms. A direct
production read of the initial packet took 9.585 ms and returned 12,124 packet
bytes. A good-note baseline using that same current work and all seven notes,
labels, source locators, provenance and times serialized to 2,065 code points /
2,065 bytes in 0.056 ms. It provides the same selected information without the
persistent association, replay checks and validated lineage of this path.
These are different operations, not a controlled speed or compression win.

The 11 returned entries are seven notes plus four mandatory provenance entries.
Record counts are not SQL read counts or disk I/O. Token values are the existing
packet estimator, not a tokenizer or billed usage. Disk I/O, actual model tokens,
retrieval quality, real user preparation time and human burden were not measured.
The repeated fixture creates five revisions; a later source change and withdrawal
bring the final packet count to eight, with no other Core record kinds.

Manual operations for the product path are excerpt selection/source entry,
Add, Compare and Save inside the existing revision form; execution remains a
separate existing action. Later revisions inherit selected notes without retyping.
The good-note baseline requires reading current work and supplying the selected
note with provenance to the next consumer manually. No observed reduction in
manual effort or live model performance is claimed.

## Dispositions and limits

- `implemented`: one selected-note entry, current-work comparison, existing
  explicit revision writer and actual native-host preparation/request consumer.
- `no_change_needed_with_evidence`: the old preview authority flags, current
  PC3/PC4 owners and existing TaskContextPacket wire schema remain unchanged;
  focused legacy revision, portability and recovery checks continue to pass.
- `narrowed`: eligible unstarted work only; user-selected excerpts rather than
  broad transcript import; exact structural comparison rather than semantic
  matching. The optional relation view is deferred because the source-linked
  notes suffice for this consumer. The cognitive-map research amendment remains
  intact; no graph, scheduler or research execution is added.
- `blocked`: no implementation dependency on #1221 was encountered. Its generic
  probe-bearing recovery mismatch remains separate and was not corrected or
  claimed as passing by this slice.
- `not_run`: live model/provider calls, real-user ingestion, live utility study,
  external source-deletion propagation, P1.5 and later phases. Runtime continuity
  resolved exactly to `no_current_work` / `no_run`; no work binding or
  `CODEX_WORK_ID` was obtained, so no runtime completion proof was fabricated.

Final exact-head planner selection, deciding receipt and Draft PR acceptance are
reported separately in the PR. This source report is focused development
evidence, not a deciding receipt or approval. Parent #1210 stays open.
