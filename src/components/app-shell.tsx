"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigation = [
  { href: "/", label: "Overview" },
  { href: "/scholarships", label: "Scholarships" },
  { href: "/sources", label: "Sources" },
  { href: "/crawler", label: "Crawler" },
  { href: "/ai-history", label: "AI history" },
  { href: "/search", label: "Search intelligence" },
  { href: "/settings", label: "Settings" },
];

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="primary-navigation" aria-label="Primary navigation">
      {navigation.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            href={item.href}
            key={item.href}
            className={active ? "nav-link nav-link-active" : "nav-link"}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const current = navigation.find((item) => item.href === "/" ? pathname === "/" : pathname.startsWith(item.href));

  if (pathname === "/login") {
    return <main className="login-shell">{children}</main>;
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link href="/" className="brand" aria-label="Study Worldwide overview">
          <Image
            src="/brand/horizontal-logo.png"
            alt="Study Worldwide"
            width={1200}
            height={637}
            priority
          />
        </Link>
        <Navigation />
        <div className="sidebar-status" aria-label="System status">
          <span className="status-dot" aria-hidden="true" />
          <span><strong>Collection worker</strong><small>Docker-managed queue</small></span>
        </div>
      </aside>

      <div className="workspace">
        <header className="utility-header">
          <details className="mobile-menu">
            <summary aria-label="Open navigation">
              <span className="menu-lines" aria-hidden="true" />
              <Image src="/brand/icon-only-mark.png" alt="" width={36} height={36} />
              <span>Study Worldwide</span>
            </summary>
            <div className="mobile-navigation-panel"><Navigation /></div>
          </details>
          <p className="current-section">{current?.label ?? "Study Worldwide"}</p>
          <div className="utility-actions">
            <span className="utility-context">Scholarship operations</span>
            <form action="/api/auth/logout" method="post"><button className="sign-out" type="submit">Sign out</button></form>
          </div>
        </header>
        <main className="content" id="main-content">{children}</main>
      </div>
    </div>
  );
}
