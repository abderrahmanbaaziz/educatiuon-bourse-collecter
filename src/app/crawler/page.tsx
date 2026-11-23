import { RemoteTable } from "@/components/data-table";
export default function Page(){return <><header className="heading"><div><span className="eyebrow">Crawler monitor</span><h1>Persistent investigations</h1><p>Queue state, crawl progress, and recoverable errors.</p></div></header><RemoteTable endpoint="/api/crawl-jobs" kind="crawls"/></>}
