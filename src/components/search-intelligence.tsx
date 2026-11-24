"use client";

import { FormEvent, useEffect, useState } from "react";

function statusLabel(status: string) {
  const label = status.replaceAll("_", " ").toLowerCase();
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function SearchIntelligence() {
  const [runs, setRuns] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const load = () => fetch("/api/search-runs").then((response) => response.json()).then(setRuns);

  useEffect(() => { void load(); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!confirm("This performs one paid SerpAPI request. Continue?")) return;
    const form = new FormData(event.currentTarget);
    setMessage("Searching…");
    const response = await fetch("/api/search-runs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: form.get("query"), language: form.get("language"), confirmPaidRequest: true }),
    });
    const result = await response.json();
    setMessage(response.ok ? `Found ${result.resultCount} results; ${result.newUrlCount} new URLs queued.` : result.error);
    if (response.ok) await load();
  }

  return <>
    <div className="notice">Scheduled discovery rotates through registered source domains twice daily. This form performs one additional paid search after confirmation.</div>
    <section className="panel">
      <h2>Run a targeted query</h2>
      <form className="form-grid" onSubmit={submit}>
        <label className="wide">Search query<input name="query" required placeholder={'"Erasmus Mundus" applications 2027'} /></label>
        <label>Language<input name="language" defaultValue="en" /></label>
        <div className="form-submit"><button className="button">Run search</button></div>
      </form>
      {message && <p className="form-message" role="status">{message}</p>}
    </section>
    <section className="panel">
      <h2>Recent searches</h2>
      {runs.length ? <div className="table-wrap"><table className="table">
        <thead><tr><th>Query</th><th>Account</th><th>Status</th><th>Results</th><th>New</th></tr></thead>
        <tbody>{runs.map((run) => <tr key={run.id}><td>{run.searchQuery.query}</td><td>{run.account}</td><td><span className={run.status === "SUCCEEDED" ? "badge good" : run.status === "FAILED" ? "badge warn" : "badge"}>{statusLabel(run.status)}</span></td><td>{run.resultCount}</td><td>{run.newUrlCount}</td></tr>)}</tbody>
      </table></div> : <div className="empty">No search experiments have run yet.</div>}
    </section>
  </>;
}
