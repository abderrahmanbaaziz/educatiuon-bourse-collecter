import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Study Worldwide", template: "%s · Study Worldwide" },
  description: "Scholarship discovery and verification operations",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {/*
          THESIS: Scholarship evidence is the primary material; the interface refuses decorative SaaS spectacle.
          OWN-WORLD: Warm paper, white working surfaces, near-black ink, antique-brass detail, and compact square controls.
          STORY: Operators see system state, inspect real records, and move uncertain evidence through explicit review.
          FIRST VIEWPORT: A real Study Worldwide masthead anchors a quiet sidebar beside a dense, full-width workspace.
          FORM: Academic operations ledger, pinned by the supplied brand contract; seed key BRAND-KIT-PINNED.
          FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
        */}
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
