# Development progress

## 2026-11-22 — Foundation and working vertical slice

- [x] Next.js/TypeScript application, responsive operations dashboard, and REST endpoints
- [x] PostgreSQL relational schema and initial migration for all required core entities
- [x] Docker multi-stage build and self-initializing Compose stack
- [x] Persistent Redis/BullMQ worker with restart recovery
- [x] Static HTML and PDF text processing
- [x] URL canonicalization, loop deduplication, robots.txt, limits, and SSRF/redirect protection
- [x] Deterministic link discovery plus validated AI-guided navigation
- [x] Scholarship extraction, evidence, conservative deduplication, versioning, and review lifecycle
- [x] Explicit SerpAPI searches, two-account allocation accounting, results, and crawl ingestion
- [x] Unit tests for URL safety, HTML extraction, prompt-injection inertness, malformed AI output, and hallucinated links
- [x] Clean production Next.js build with infrastructure connections deferred until runtime
- [x] Playwright JavaScript-rendering escalation with subrequest SSRF controls
- [x] RSS/Atom and sitemap-specific adapters
- [x] CSV/JSON bulk source-import UI with explicit crawl activation
- [x] Human verification action UI, audited status history, and evidence conflict-resolution API
- [x] Optional Telegram bot announcements with durable delivery, deduplication, retries, test control, and crawl-failure alerts
- [ ] Controlled end-to-end live provider experiment (requires owner authorization and Docker runtime)

Docker could not be executed on the development machine because Docker is not installed. Local static validation and tests are recorded through the project scripts; no paid provider request was made.

Dependency audit note: current upstream Crawlee 3.x reports moderate transitive denial-of-service advisories, and the Prisma 6 migration CLI reports high advisories whose offered fix is the breaking Prisma 7 line. Runtime input byte/depth limits reduce crawler exposure; upgrading Prisma remains a deliberate migration task rather than an unsafe automatic major upgrade.
