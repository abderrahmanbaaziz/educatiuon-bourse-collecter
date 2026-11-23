import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = { title: "Bourse Collector", description: "AI-guided scholarship discovery operations" };

const nav = [
  ["/", "Overview"], ["/scholarships", "Scholarships"], ["/sources", "Sources"], ["/crawler", "Crawler"],
  ["/ai-history", "AI history"], ["/search", "Search intelligence"], ["/settings", "Settings"],
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><div className="shell">
    <aside className="sidebar"><Link href="/" className="brand"><span className="brandmark">B</span><span>Bourse<br/><small>Collector</small></span></Link>
      <nav>{nav.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}</nav>
      <div className="sidebar-note"><span className="status-dot"/> Persistent worker<br/><small>Docker-managed queue</small></div>
    </aside>
    <main className="content">{children}</main>
  </div></body></html>;
}
