"use client";
import { FormEvent, useEffect, useState } from "react";

type Source = { id:string; providerName:string; scholarshipUrl:string; category:string; trustLevel:string; enabled:boolean; _count:{pages:number;crawlJobs:number} };

export function SourceManager() {
  const [items, setItems] = useState<Source[]>([]);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const load = () => fetch("/api/sources").then((response) => response.json()).then(setItems);
  useEffect(() => { void load(); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("Adding source...");
    const form = new FormData(event.currentTarget);
    const body = { providerName:form.get("providerName"), homepage:form.get("homepage"), scholarshipUrl:form.get("scholarshipUrl"), category:form.get("category"), trustLevel:form.get("trustLevel"), languages:String(form.get("languages")||"").split(",").map((value)=>value.trim()).filter(Boolean), priority:50, startCrawl:true };
    const response = await fetch("/api/sources", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error ?? "Could not add source"); return; }
    setMessage("Source saved and persistent crawl queued."); event.currentTarget.reset(); await load();
  }

  async function importFile(file: File) {
    setMessage("Importing sources...");
    const format = file.name.toLowerCase().endsWith(".csv") ? "csv" : file.name.toLowerCase().endsWith(".md") ? "markdown" : "json";
    const response = await fetch("/api/sources/import", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({ content:await file.text(), format, startCrawls:false }) });
    const result = await response.json();
    setMessage(response.ok || response.status === 207 ? `Imported ${result.created}; ${result.duplicates} duplicates; ${result.failed.length} failed. Start selected crawls below.` : result.error);
    await load();
  }

  async function startCrawl(id:string){setMessage("Queueing crawl...");const response=await fetch(`/api/sources/${id}/crawl`,{method:"POST"});const result=await response.json();setMessage(response.ok?`Crawl ${result.id} queued.`:result.error);await load()}

  async function toggleSource(source: Source) {
    if (source.enabled && !window.confirm(`Stop all active crawls and disable ${source.providerName}? It will remain disabled until you enable it again.`)) return;
    setBusyId(source.id); setMessage(source.enabled ? "Stopping crawler and disabling website…" : "Enabling website…");
    const response = await fetch(`/api/sources/${source.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ enabled: !source.enabled }) });
    const result = await response.json();
    setMessage(response.ok ? (source.enabled ? `${source.providerName} is disabled and its active crawls were stopped.` : `${source.providerName} is enabled again.`) : result.error);
    setBusyId(null); await load();
  }

  return <>
    <section className="panel"><h2>Add a trusted source</h2><form className="form-grid" onSubmit={submit}>
      <label>Provider name<input name="providerName" required placeholder="University or programme"/></label><label>Homepage<input name="homepage" type="url" required placeholder="https://example.edu"/></label>
      <label className="wide">Scholarship section URL<input name="scholarshipUrl" type="url" required placeholder="https://example.edu/scholarships"/></label>
      <label>Category<select name="category"><option>UNIVERSITY</option><option>GOVERNMENT</option><option>PROGRAM</option><option>PORTAL</option><option>NGO</option><option>OTHER</option></select></label>
      <label>Trust<select name="trustLevel"><option>UNVERIFIED</option><option>TRUSTED</option><option>OFFICIAL</option></select></label>
      <label className="wide">Languages (comma separated)<input name="languages" placeholder="en, fr, ar"/></label>
      <div className="wide form-action"><button className="button">Save and crawl</button>{message && <span className="inline-message" role="status">{message}</span>}</div>
    </form></section>
    <section className="panel"><h2>Bulk import</h2><p>Upload Markdown link registries, JSON, or CSV. Imported sources remain unverified and crawls require explicit activation.</p><input type="file" accept=".md,.json,.csv,text/markdown,application/json,text/csv" onChange={(event)=>{const file=event.target.files?.[0];if(file)void importFile(file)}}/></section>
    <section className="panel"><h2>Sources</h2>{items.length ? <div className="table-wrap"><table className="table"><thead><tr><th>Provider</th><th>Category</th><th>Trust</th><th>Status</th><th>Pages</th><th>Crawls</th><th>Actions</th></tr></thead><tbody>{items.map((source)=><tr key={source.id}><td><a href={source.scholarshipUrl} target="_blank" rel="noreferrer">{source.providerName}</a></td><td>{source.category}</td><td><span className="badge">{source.trustLevel}</span></td><td><span className={source.enabled ? "badge good" : "badge warn"}>{source.enabled ? "Active" : "Disabled"}</span></td><td>{source._count.pages}</td><td>{source._count.crawlJobs}</td><td><div className="source-actions"><button className="button" disabled={!source.enabled || busyId === source.id} onClick={()=>void startCrawl(source.id)}>Start crawl</button><button className={source.enabled ? "button button-danger" : "button button-secondary"} disabled={busyId === source.id} onClick={()=>void toggleSource(source)}>{busyId === source.id ? "Working…" : source.enabled ? "Stop & disable" : "Enable"}</button></div></td></tr>)}</tbody></table></div> : <div className="empty">No sources configured.</div>}</section>
  </>;
}
