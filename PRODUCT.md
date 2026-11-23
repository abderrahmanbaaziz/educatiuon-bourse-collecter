# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary user is an authenticated Study Worldwide administrator operating an Algeria-based scholarship aggregation workflow. They monitor scholarship discovery, trusted sources, crawl runs, extracted records, human verification, notification delivery, and data quality.

## Product Purpose

Study Worldwide is an internal operations workspace for discovering scholarship opportunities from real sources, preserving evidence, and moving uncertain extracted records through explicit human review. Success means administrators can identify failures and review needs quickly, trace every material fact to its source, and keep collection work running safely.

## Positioning

The product separates evidence collection, bounded AI interpretation, and human verification instead of treating AI output as publishable truth. Crawling and deterministic extraction remain useful when paid AI or search providers are unavailable.

## Operating Context

Administrators use a desktop-first dashboard with responsive mobile access. Core workflows cover the overview, scholarships, sources, crawler jobs, paid search intelligence, AI invocation history, settings, and Telegram delivery status. PostgreSQL and Redis run in Docker on the production VPS, with persistent server-hosted volumes.

## Capabilities and Constraints

- Preserve existing Next.js routes, API contracts, Prisma models, Docker services, and production deployment behavior.
- Only real API-backed data and supported actions may appear in operational screens.
- The dashboard is private and requires authentication; the health endpoint remains available to deployment monitoring.
- Scholarship eligibility for Algerian applicants must not be assumed when evidence does not establish it.
- AI, search, and Telegram providers are optional and configured server-side.

## Brand Commitments

The visible product name is **Study Worldwide**. `Bourse Collector` remains an internal repository and pipeline name. The mandatory brand and interface authority is `study_worldwide_brand_kit (1)/DESIGN.md`, including the supplied logo and favicon assets. The interface must feel like a high-trust academic operations workspace, never a generic AI SaaS dashboard.

## Evidence on Hand

- Mandatory brand contract and packaged artwork: `study_worldwide_brand_kit (1)/`.
- Existing live APIs, database records, tests, and quick-workflow artifacts provide the only approved operational data.
- No testimonials, commercial benchmarks, or public marketing claims are supplied and none may be invented.

## Product Principles

1. Evidence and provenance outrank automated confidence.
2. Operational problems and review needs must be visible before decorative summaries.
3. Dense data remains readable, searchable, and actionable.
4. Security and explicit human control are defaults, not optional enhancements.
5. Provider outages must degrade clearly without hiding available core functionality.

## Accessibility & Inclusion

The web interface targets WCAG AA contrast, keyboard navigation, visible focus, semantic data tables, touch-accessible controls, responsive layouts, and honest handling of missing or multilingual scholarship information.
