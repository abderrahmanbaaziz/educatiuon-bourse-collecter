"use client";

import { useEffect, useState } from "react";

type Setting = { key: string; value: unknown; description: string | null };
const dateTimeFormat = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function statusLabel(status: string) {
  const label = status.replaceAll("_", " ").toLowerCase();
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function Settings() {
  const [items, setItems] = useState<Setting[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => { fetch("/api/settings").then((response) => response.json()).then(setItems); }, []);

  async function toggle(item: Setting) {
    const value = !Boolean(item.value);
    const response = await fetch("/api/settings", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: item.key, value }) });
    if (response.ok) setItems(items.map((current) => current.key === item.key ? { ...current, value } : current));
  }

  async function testTelegram() {
    if (!confirm("Send one Telegram test message now?")) return;
    setMessage("Queueing Telegram test...");
    const response = await fetch("/api/notifications/telegram/test", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ confirm: true }) });
    const result = await response.json();
    setMessage(response.ok ? "Test queued. Check Telegram and the delivery history below." : result.error);
  }

  const booleanKeys = new Set(["discovery.paused", "notifications.telegram.enabled", "notifications.telegram.verifiedScholarships", "notifications.telegram.crawlFailures"]);

  return <>
    <section className="panel"><h2>Runtime controls</h2><div className="table-wrap"><table className="table">
      <thead><tr><th>Setting</th><th>Value</th><th>Description</th><th>Action</th></tr></thead>
      <tbody>{items.map((item) => <tr key={item.key}><td>{item.key}</td><td>{String(item.value)}</td><td>{item.description}</td><td>{booleanKeys.has(item.key) && <button className="button button-secondary" onClick={() => void toggle(item)}>{item.value ? "Disable" : "Enable"}</button>}</td></tr>)}</tbody>
    </table></div></section>
    <section className="panel"><h2>Telegram connection</h2><p>Credentials remain in the server environment. Testing sends exactly one queued message.</p><div className="panel-actions"><button className="button" onClick={() => void testTelegram()}>Send test message</button>{message && <span className="inline-message" role="status">{message}</span>}</div><NotificationHistory /></section>
  </>;
}

function NotificationHistory() {
  const [items, setItems] = useState<any[]>([]);
  const load = () => fetch("/api/notifications").then((response) => response.json()).then(setItems);
  useEffect(() => { void load(); const timer = setInterval(load, 5000); return () => clearInterval(timer); }, []);
  async function retry(id: string) { await fetch(`/api/notifications/${id}/retry`, { method: "POST" }); await load(); }

  return items.length ? <div className="table-wrap"><table className="table">
    <thead><tr><th>Event</th><th>Status</th><th>Attempts</th><th>Time</th><th>Error</th><th>Action</th></tr></thead>
    <tbody>{items.slice(0, 20).map((item) => <tr key={item.id}><td>{statusLabel(item.eventType)}</td><td><span className={item.status === "SENT" ? "badge good" : item.status === "FAILED" ? "badge warn" : "badge"}>{statusLabel(item.status)}</span></td><td>{item.attempts}</td><td>{dateTimeFormat.format(new Date(item.createdAt))}</td><td>{item.error ?? "—"}</td><td>{item.status === "FAILED" && <button className="button button-secondary" onClick={() => void retry(item.id)}>Retry</button>}</td></tr>)}</tbody>
  </table></div> : <div className="empty">No notification deliveries yet.</div>;
}
