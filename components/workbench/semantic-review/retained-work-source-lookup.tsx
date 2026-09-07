"use client";

import { useRef, useState } from "react";
import type { recallRetainedWorkSources, RetainedWorkSourceHit } from "@/lib/intake/retained-work-source-recall";
import type { ProjectWorkInitializationV01 } from "@/types/vnext/project-work-initialization";
import styles from "./semantic-review.module.css";

type Recall = ReturnType<typeof recallRetainedWorkSources>;

export function RetainedWorkSourceLookup({ initialization, disabled, selectionFull, isSelected, onSelect }: {
  initialization: ProjectWorkInitializationV01;
  disabled: boolean;
  selectionFull: boolean;
  isSelected: (hit: RetainedWorkSourceHit) => boolean;
  onSelect: (hit: RetainedWorkSourceHit) => void;
}) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Recall | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  async function search() {
    const packet = initialization.current_packet;
    if (!packet) return;
    const id = ++requestId.current;
    setSearching(true); setResult(null); setError(null);
    try {
      const response = await fetch("/api/vnext/operator/project-continuity", {
        method: "POST", cache: "no-store", credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "lookup_retained_work_sources", query,
          expected_current_packet_id: packet.packet_id, expected_current_packet_fingerprint: packet.packet_fingerprint,
          expected_active_project_id: initialization.active_project_id,
          expected_active_selection_revision: initialization.active_selection_revision }),
      });
      const body = await response.json() as { status?: string; recall?: Recall };
      if (id !== requestId.current) return;
      if (!response.ok || body.status !== "retained_source_recall" || !body.recall) throw new Error("Retained notes are unavailable for this comparison. Check the query bounds or reload current work before searching again.");
      setResult(body.recall);
    } catch (failure) {
      if (id === requestId.current) setError(failure instanceof Error ? failure.message : "Retained notes unavailable.");
    } finally { setSearching(false); }
  }

  return <details data-retained-work-sources>
    <summary>Find notes from earlier work revisions</summary>
    <p className={styles.copy}>Search saved note snapshots in this unstarted work’s revision history, including notes excluded from current preparation. Searching selects and saves nothing.</p>
    <label htmlFor="retained-source-query">Words from the question, note or source</label>
    <input id="retained-source-query" value={query} maxLength={160} placeholder="valve bench cold start" onChange={(event) => {
      requestId.current += 1; setQuery(event.target.value); setResult(null); setError(null);
    }} />
    <p className={styles.muted}>All words must occur in the note or source label; case is ignored. Up to 160 characters and eight words. Other projects, transcripts and external sources are outside this search.</p>
    <button type="button" data-retained-source-action="search" className={styles.secondaryButton} disabled={disabled || searching || !query.trim()} onClick={() => void search()}>
      {searching ? "Searching…" : "Search retained notes"}
    </button>
    {error ? <p role="alert" className={styles.error}>{error}</p> : null}
    {result ? <div data-retained-source-results>
      <p role="status">{result.returned_entries} of {result.matching_entries} matching notes returned from {result.scanned_packets} packets through {result.cutoff_recorded_at}. {result.scanned_entry_occurrences} note occurrences scanned ({result.scanned_entry_utf8_bytes} UTF-8 bytes); {result.unique_entries} exact distinct notes.</p>
      <p className={styles.muted}>This chain is bounded to {result.limits.packets} packets, {result.limits.note_occurrences} note occurrences and {result.limits.scanned_entry_utf8_bytes} serialized note bytes. Source validation also reads lineage; these sizes are not disk I/O.</p>
      <p className={styles.muted}>Results: {result.result_utf8_bytes} UTF-8 bytes; at most {result.limits.results} notes and {result.limits.result_utf8_bytes} bytes. {result.omitted_matching_entries} matching notes omitted at these bounds. No note is clipped. No match here does not establish absence elsewhere.</p>
      {result.results.map((hit) => <div key={hit.entry.entry_id} className={styles.panel} data-retained-source-hit={hit.entry.entry_id}>
        <strong>{hit.entry.why_included}</strong>
        <p>{hit.entry.compatibility_source_ref!.external_id} · {hit.entry.trust_class.replaceAll("_", " ")}</p>
        <p>{hit.selection === "currently_selected" ? "Currently selected" : "Historical — not selected in current work"}. Source time: {hit.entry.external_ref?.observed_at ?? "unknown"}. First saved: {hit.first_recorded_at}.</p>
        <p style={{ whiteSpace: "pre-wrap" }}>{hit.entry.bounded_summary}</p>
        <p className={styles.muted}>{hit.packet_occurrences} packet occurrence(s), treated as one exact excerpt, not independent evidence. Original external availability and currentness remain unverified. Reading now does not refresh the source.</p>
        <details><summary>Exact saved source</summary><p style={{ overflowWrap: "anywhere" }}>Packet: {hit.source.packet_id}<br />Packet fingerprint: {hit.source.packet_fingerprint}<br />Excerpt: {hit.source.entry_id}<br />Excerpt fingerprint: {hit.source.source_fingerprint}<br />Last selected: {hit.last_selected_at}</p></details>
        <button type="button" data-retained-source-action="select" className={styles.secondaryButton} disabled={disabled || selectionFull || isSelected(hit)} onClick={() => onSelect(hit)}>{isSelected(hit) ? "Already selected" : "Select for comparison"}</button>
      </div>)}
      <p className={styles.muted}>Historical does not mean rejected, deleted or automatically cooled. Earlier exclusions still apply until you deliberately select, compare and save a revision. Labels do not establish accepted meaning.</p>
      {selectionFull ? <p>Eight notes are selected. Exclude a note from this revision before selecting another.</p> : null}
    </div> : null}
  </details>;
}
