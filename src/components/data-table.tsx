"use client";

import { useEffect, useState } from "react";
import { ScholarshipReviewDialog } from "@/components/scholarship-review-dialog";

function badgeClass(status: string) {
  if (["SUCCEEDED", "VERIFIED", "COMPLETED"].includes(status)) return "badge good";
  if (["FAILED", "REJECTED", "NEEDS_REVIEW"].includes(status)) return "badge warn";
  return "badge";
}

function statusLabel(status: string) {
  const label = status.replaceAll("_", " ").toLowerCase();
  return label.charAt(0).toUpperCase() + label.slice(1);
}

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const dateTimeFormat = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function RemoteTable({ endpoint, kind }: { endpoint: string; kind: "scholarships" | "crawls" | "ai" }) {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [selectedScholarshipId, setSelectedScholarshipId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetch(endpoint)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Unavailable")))
      .then(setItems)
      .catch((cause) => setError(cause.message));
  }, [endpoint]);

  async function stopCrawl(id: string) {
    if (!window.confirm("Stop this crawl now? Remaining pages will be skipped.")) return;
    setBusyId(id);
    const response = await fetch(`/api/crawl-jobs/${id}/cancel`, { method: "POST" });
    const result = await response.json();
    if (response.ok) setItems((current) => current.map((item) => item.id === id ? { ...item, status: "CANCELLED", error: result.error } : item));
    else setError(result.error ?? "Could not stop crawl");
    setBusyId(null);
  }

  if (error) return <div className="notice">{error}</div>;
  if (!items.length) return <div className="panel empty">No records yet.</div>;

  if (kind === "scholarships") return <><section className="panel"><div className="table-wrap"><table className="table">
    <thead><tr><th>Opportunity</th><th>Country</th><th>Funding</th><th>Deadline</th><th>Status</th><th>Evidence</th><th>Review</th></tr></thead>
    <tbody>{items.map((item) => <tr key={item.id}>
      <td>{item.title}<br /><small>{item.provider}</small></td>
      <td>{item.hostCountry ?? "Unknown"}</td><td>{item.fundingCategory}</td>
      <td>{item.deadline ? dateFormat.format(new Date(item.deadline)) : "Unknown"}</td>
      <td><span className={badgeClass(item.status)}>{statusLabel(item.status)}</span></td><td>{item._count.evidence}</td>
      <td><button className={item.status === "NEEDS_REVIEW" ? "button" : "button button-secondary"} type="button" onClick={() => setSelectedScholarshipId(item.id)}>{item.status === "NEEDS_REVIEW" ? "Review" : "View details"}</button></td>
    </tr>)}</tbody>
  </table></div></section><ScholarshipReviewDialog scholarshipId={selectedScholarshipId} onClose={() => setSelectedScholarshipId(null)} onStatusChange={(id, status) => setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item))}/></>;

  if (kind === "crawls") return <section className="panel"><div className="table-wrap"><table className="table">
    <thead><tr><th>Source</th><th>Root URL</th><th>Status</th><th>Visited</th><th>Frontier</th><th>Error</th><th>Action</th></tr></thead>
    <tbody>{items.map((item) => <tr key={item.id}>
      <td>{item.source?.providerName ?? "—"}</td><td><a href={item.rootUrl} target="_blank" rel="noreferrer">{item.rootUrl}</a></td><td><span className={badgeClass(item.status)}>{statusLabel(item.status)}</span></td><td>{item.visitedCount}</td><td>{item._count.frontier}</td><td>{item.error ?? "—"}</td><td>{["QUEUED", "ACTIVE", "PAUSED"].includes(item.status) ? <button className="button button-danger" disabled={busyId === item.id} onClick={() => void stopCrawl(item.id)}>{busyId === item.id ? "Stopping…" : "Stop"}</button> : "—"}</td>
    </tr>)}</tbody>
  </table></div></section>;

  return <section className="panel"><div className="table-wrap"><table className="table">
    <thead><tr><th>Task</th><th>Model</th><th>Status</th><th>Tokens</th><th>Time</th></tr></thead>
    <tbody>{items.map((item) => <tr key={item.id}>
      <td>{statusLabel(item.task)}</td><td>{item.model}</td><td><span className={badgeClass(item.status)}>{statusLabel(item.status)}</span></td><td>{(item.promptTokens ?? 0) + (item.completionTokens ?? 0)}</td><td>{dateTimeFormat.format(new Date(item.createdAt))}</td>
    </tr>)}</tbody>
  </table></div></section>;
}
