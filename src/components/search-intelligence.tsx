"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type DomainPerformance = { domain: string; results: number; queued: number; crawled: number; candidates: number; rejected: number };
type UrlOutcome = { id: string; title: string | null; url: string; domain: string; position: number | null; isNew: boolean; outcome: string; crawlStatus: string | null; reason: string | null; scholarships: Array<{ title: string; status: string; rejectionReason: string | null; applicationUrl: string | null }> };
type SearchRun = {
  id: string; query: string; language: string | null; account: string; status: string; error: string | null; executedAt: string;
  trigger: string; requestLabel: string | null; trackingAvailable: boolean; resultCount: number; newUrlCount: number;
  uniqueDomainCount: number; queuedUrlCount: number; skippedUrlCount: number; candidateCount: number; rejectedCount: number;
  domains: DomainPerformance[];
  results: UrlOutcome[];
};

function statusLabel(status: string) {
  const label = status.replaceAll("_", " ").toLowerCase();
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function outcomeClass(outcome: string) {
  if (outcome === "VALID") return "badge good";
  if (["REJECTED", "CRAWL_FAILED"].includes(outcome)) return "badge warn";
  return "badge";
}

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function SearchIntelligence() {
  const [runs, setRuns] = useState<SearchRun[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/search-runs");
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Search history is unavailable");
      setRuns(body);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Search history is unavailable"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const totals = useMemo(() => runs.reduce((sum, run) => ({
    results: sum.results + run.resultCount,
    domains: sum.domains + run.uniqueDomainCount,
    queued: sum.queued + run.queuedUrlCount,
    candidates: sum.candidates + run.candidateCount,
  }), { results: 0, domains: 0, queued: 0, candidates: 0 }), [runs]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!window.confirm("This performs one paid SerpAPI search. Continue?")) return;
    const form = new FormData(event.currentTarget);
    setSubmitting(true); setMessage("Running paid search…"); setError("");
    try {
      const response = await fetch("/api/search-runs", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: form.get("query"), language: form.get("language"), confirmPaidRequest: true }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Search failed");
      setMessage(`${result.resultCount} results across ${result.uniqueDomainCount} websites; ${result.queuedUrlCount} new crawler jobs queued.`);
      await load();
    } catch (cause) { setMessage(""); setError(cause instanceof Error ? cause.message : "Search failed"); }
    finally { setSubmitting(false); }
  }

  return <>
    <div className="notice"><strong>How to read this:</strong> one table row equals one paid SerpAPI request. A Telegram discovery command creates three rows. “Results” are Google pages; “websites” are unique domains; “queued” means a new crawler job was actually created.</div>

    <section className="panel">
      <h2>Run one exact query</h2>
      <form className="form-grid" onSubmit={submit}>
        <label className="wide">Search query<input name="query" required placeholder={'"computer science" scholarship Algeria master 2027 apply'} /></label>
        <label>Language<input name="language" defaultValue="en" /></label>
        <div className="form-submit"><button className="button" disabled={submitting}>{submitting ? "Searching…" : "Run paid search"}</button></div>
      </form>
      {message && <p className="form-message" role="status">{message}</p>}
    </section>

    <section className="query-metrics" aria-label="Totals for loaded query history">
      <div><span>Result pages</span><strong>{totals.results}</strong><small>Google results returned</small></div>
      <div><span>Website appearances</span><strong>{totals.domains}</strong><small>Unique domains per query</small></div>
      <div><span>New crawler jobs</span><strong>{totals.queued}</strong><small>Actually added to the queue</small></div>
      <div><span>Strict candidates</span><strong>{totals.candidates}</strong><small>Passed Algeria/action gates</small></div>
    </section>

    <section className="panel">
      <div className="panel-heading"><div><h2>Query history</h2><p>Open a generated query to inspect every collected website and URL outcome.</p></div><button className="button button-secondary" type="button" disabled={loading} onClick={() => void load()}>{loading ? "Refreshing…" : "Refresh"}</button></div>
      {error && <div className="query-error" role="alert">{error}</div>}
      {loading && !runs.length ? <div className="empty" role="status">Loading query history…</div> : runs.length ? <div className="table-wrap"><table className="table query-table">
        <thead><tr><th>Generated query</th><th>Origin</th><th>Status</th><th>Results</th><th>Websites</th><th>New</th><th>Queued</th><th>Candidates</th><th>Run at</th></tr></thead>
        <tbody>{runs.map((run) => <tr key={run.id}>
          <td className="query-cell"><details><summary>{run.query}</summary><div className="domain-breakdown">
            {!run.trackingAvailable && <p className="legacy-note">This run predates detailed crawler tracking; returned domains are shown, but queue outcomes are unavailable.</p>}
            {run.domains.length ? <table><thead><tr><th>Website</th><th>Pages</th><th>Linked crawls</th><th>Completed</th><th>Candidates</th><th>Rejected</th></tr></thead><tbody>{run.domains.map((domain) => <tr key={domain.domain}><td>{domain.domain}</td><td>{domain.results}</td><td>{domain.queued}</td><td>{domain.crawled}</td><td>{domain.candidates}</td><td>{domain.rejected}</td></tr>)}</tbody></table> : <p>No valid website results were returned.</p>}
            <div className="url-outcome-heading"><h3>Collected URLs</h3><span>{run.results.length} results</span></div>
            <div className="url-outcome-list">{run.results.map((result) => <article className="url-outcome" key={result.id}>
              <div><a href={result.url} target="_blank" rel="noreferrer">{result.title ?? result.url}</a><small>{result.domain}{result.position ? ` · Result #${result.position}` : ""}{result.isNew ? " · First seen" : " · Seen before"}</small></div>
              <span className={outcomeClass(result.outcome)}>{statusLabel(result.outcome)}</span>
              {result.reason && <p>{result.reason}</p>}
              {result.scholarships.map((scholarship) => <p className="url-scholarship" key={`${result.id}-${scholarship.title}`}>{scholarship.status === "REJECTED" ? "Rejected record" : "Candidate"}: {scholarship.title}{scholarship.applicationUrl && <> · <a href={scholarship.applicationUrl} target="_blank" rel="noreferrer">Application</a></>}</p>)}
            </article>)}</div>
          </div></details>{run.requestLabel && run.requestLabel !== run.query && <small>Request: {run.requestLabel}</small>}</td>
          <td>{statusLabel(run.trigger)}</td>
          <td><span className={run.status === "SUCCEEDED" ? "badge good" : run.status === "FAILED" ? "badge warn" : "badge"}>{statusLabel(run.status)}</span>{run.error && <small className="query-run-error">{run.error}</small>}</td>
          <td>{run.resultCount}</td><td>{run.uniqueDomainCount}</td><td>{run.newUrlCount}</td><td>{run.trackingAvailable ? run.queuedUrlCount : "—"}</td><td>{run.trackingAvailable ? run.candidateCount : "—"}</td><td><time dateTime={run.executedAt}>{dateFormat.format(new Date(run.executedAt))}</time></td>
        </tr>)}</tbody>
      </table></div> : <div className="empty">No paid searches have run yet.</div>}
    </section>
  </>;
}
