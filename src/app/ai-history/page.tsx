import { RemoteTable } from "@/components/data-table";
export default function Page(){return <><header className="heading"><div><span className="eyebrow">AI decision history</span><h1>Validated reasoning calls</h1><p>Provider responses are recorded only after schema validation.</p></div></header><RemoteTable endpoint="/api/ai-invocations" kind="ai"/></>}
