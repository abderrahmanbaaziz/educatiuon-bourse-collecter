import { RemoteTable } from "@/components/data-table";
export default function Page(){return <><header className="heading"><div><span className="eyebrow">Scholarship explorer</span><h1>Extracted opportunities</h1><p>AI-extracted records remain reviewable until deterministic or human verification.</p></div></header><RemoteTable endpoint="/api/scholarships" kind="scholarships"/></>}
