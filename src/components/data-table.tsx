"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    fetch(endpoint)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Unavailable")))
      .then(setItems)
      .catch((cause) => setError(cause.message));
  }, [endpoint]);

  async function transition(id: string, status: string) {
    const reason = prompt(`Reason for ${status.toLowerCase()} status:`);
    if (!reason) return;
    const response = await fetch(`/api/scholarships/${id}/status`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status, reason }),
    });
    const result = await response.json();
    if (!response.ok) {
      alert([result.error, ...(result.reasons ?? [])].join("\n"));
      return;
    }
    setItems(items.map((item) => item.id === id ? { ...item, status: result.status } : item));
  }

  if (error) return <div className="notice">{error}</div>;
  if (!items.length) return <div className="panel empty">No records yet.</div>;

  if (kind === "scholarships") return <section className="panel"><div className="table-wrap"><table className="table">
    <thead><tr><th>Opportunity</th><th>Country</th><th>Funding</th><th>Deadline</th><th>Status</th><th>Evidence</th><th>Review</th></tr></thead>
    <tbody>{items.map((item) => <tr key={item.id}>
      <td>{item.title}<br /><small>{item.provider}</small></td>
      <td>{item.hostCountry ?? "Unknown"}</td><td>{item.fundingCategory}</td>
      <td>{item.deadline ? dateFormat.format(new Date(item.deadline)) : "Unknown"}</td>
      <td><span className={badgeClass(item.status)}>{statusLabel(item.status)}</span></td><td>{item._count.evidence}</td>
      <td>{item.status === "NEEDS_REVIEW" && <><button className="button" onClick={() => void transition(item.id, "VERIFIED")}>Verify</button><button className="button button-danger" onClick={() => void transition(item.id, "REJECTED")}>Reject</button></>}{item.status === "VERIFIED" && <button className="button button-secondary" onClick={() => void transition(item.id, "NEEDS_REVIEW")}>Reopen</button>}</td>
    </tr>)}</tbody>
  </table></div></section>;

  if (kind === "crawls") return <section className="panel"><div className="table-wrap"><table className="table">
    <thead><tr><th>Source</th><th>Root URL</th><th>Status</th><th>Visited</th><th>Frontier</th><th>Error</th></tr></thead>
    <tbody>{items.map((item) => <tr key={item.id}>
      <td>{item.source?.providerName ?? "—"}</td><td>{item.rootUrl}</td><td><span className={badgeClass(item.status)}>{statusLabel(item.status)}</span></td><td>{item.visitedCount}</td><td>{item._count.frontier}</td><td>{item.error ?? "—"}</td>
    </tr>)}</tbody>
  </table></div></section>;

  return <section className="panel"><div className="table-wrap"><table className="table">
    <thead><tr><th>Task</th><th>Model</th><th>Status</th><th>Tokens</th><th>Time</th></tr></thead>
    <tbody>{items.map((item) => <tr key={item.id}>
      <td>{statusLabel(item.task)}</td><td>{item.model}</td><td><span className={badgeClass(item.status)}>{statusLabel(item.status)}</span></td><td>{(item.promptTokens ?? 0) + (item.completionTokens ?? 0)}</td><td>{dateTimeFormat.format(new Date(item.createdAt))}</td>
    </tr>)}</tbody>
  </table></div></section>;
}
