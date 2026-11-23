"use client";
import { useEffect, useState } from "react";

type Overview = { total:number; verified:number; discoveredToday:number; active:number; sources:number; pages:number; recentJobs:Array<{id:string;status:string;visitedCount:number;rootUrl:string;source:{providerName:string}|null}> };
export function Dashboard() {
  const [data,setData]=useState<Overview|null>(null); const [error,setError]=useState("");
  useEffect(()=>{fetch("/api/overview").then(r=>r.ok?r.json():Promise.reject(new Error("Stack is not ready"))).then(setData).catch(e=>setError(e.message))},[]);
  if(error) return <div className="notice">{error}. Start PostgreSQL and Redis with Docker Compose.</div>;
  const cards=[["Total scholarships",data?.total],["Verified",data?.verified],["Discovered today",data?.discoveredToday],["Active investigations",data?.active]];
  return <><div className="grid">{cards.map(([label,value])=><div className="card" key={label}><span className="label">{label}</span><strong>{value??"—"}</strong><small>Live database</small></div>)}</div>
    <div className="split"><section className="panel"><h2>Recent crawl activity</h2>{data?.recentJobs.length?<table className="table"><thead><tr><th>Source</th><th>Status</th><th>Pages</th></tr></thead><tbody>{data.recentJobs.map(j=><tr key={j.id}><td>{j.source?.providerName??new URL(j.rootUrl).hostname}</td><td><span className={`badge ${j.status==="SUCCEEDED"?"good":j.status==="FAILED"?"warn":""}`}>{j.status}</span></td><td>{j.visitedCount}</td></tr>)}</tbody></table>:<div className="empty">No crawls yet. Add a trusted source to begin.</div>}</section>
    <section className="panel"><h2>Collection footprint</h2><div className="card"><span className="label">Enabled sources</span><strong>{data?.sources??"—"}</strong></div><div className="card" style={{marginTop:12}}><span className="label">Pages retained</span><strong>{data?.pages??"—"}</strong></div></section></div></>;
}
