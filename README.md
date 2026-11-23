# Bourse Collector

A production-oriented, AI-guided scholarship discovery engine. The crawler retrieves real evidence; AI interprets bounded crawler output; the backend validates every action before execution.

## First run with Docker

Prerequisite: Docker Desktop with Compose v2.

```powershell
Copy-Item .env.example .env  # skip this if your .env already exists
docker compose up --build
```

Open <http://localhost:3000>. On the first run Compose automatically:

1. creates PostgreSQL and persistent Redis volumes;
2. waits for both services to become healthy;
3. applies all Prisma migrations and safe default settings;
4. starts the dashboard/API and persistent BullMQ worker;
5. recovers interrupted crawl frontier items after worker restarts.

No external `REDIS_URL` or database server is required. Compose injects internal connection URLs. Paid providers are optional: without keys, crawling and deterministic extraction work while AI/search features report `disabled` in `/api/health`.

Useful commands:

```powershell
docker compose ps
docker compose logs -f app worker caddy
docker compose down             # data is retained
docker compose down --volumes   # destructive: removes local database and queue data
```

## Automatic VPS deployment

The repository includes a CD-only GitHub Actions workflow that deploys every push to `main` over SSH. It keeps production secrets in a VPS-only `.env`, automatically generates missing PostgreSQL credentials on the first deployment, starts the Docker Compose stack, and checks application health before reporting success. Caddy terminates HTTPS on ports 80/443 while the app's direct port is bound only to VPS loopback. PostgreSQL, Redis, and Caddy state persist in VPS-hosted Docker volumes. See [DEPLOYMENT.md](DEPLOYMENT.md) for the one-time VPS and GitHub secret setup.

## Existing environment file

The current lowercase keys are supported for compatibility:

- `serp_api_5k` → primary 5,000-request account
- `serp_api_1k` → secondary 1,000-request account
- `psql_user` / `psql_root_password` → Docker PostgreSQL credentials

Uppercase `SERPAPI_KEY_PRIMARY` and `SERPAPI_KEY_SECONDARY` are preferred. AgentRouter uses `AGENTROUTER_API_KEY`, `AGENTROUTER_BASE_URL`, and `AGENTROUTER_MODEL`. Secrets are loaded server-side and never exposed to the browser or Docker build context.

## Local development

Run PostgreSQL and Redis locally (or only those Compose services), then:

```powershell
npm install
npm run db:generate
npm run db:setup
npm run dev
# second terminal
npm run worker
```

## Telegram notifications

Create a bot with `@BotFather`, add it to the target private chat, group, or channel, and put these values in `.env`:

```env
TELEGRAM_BOT_TOKEN=123456:replace_with_real_bot_token
TELEGRAM_CHAT_ID=-1001234567890
# Optional for forum topics:
TELEGRAM_MESSAGE_THREAD_ID=
```

Restart the stack, open **Settings**, send one explicit test message, then enable `notifications.telegram.enabled`. Verified-scholarship announcements are enabled as an event type by default; crawl-failure alerts remain disabled until explicitly enabled. Messages are persisted, deduplicated, retried through BullMQ, and visible in the delivery history. The token is never returned to the browser.

Verification:

```powershell
npm run typecheck
npm test
npm run build
```

Real SerpAPI calls are never made by setup/tests. The Search Intelligence form requires a browser confirmation and sends `confirmPaidRequest: true`. Search results remain distinct from scholarships and seed persistent crawl jobs. AI calls occur only for explicitly started crawl investigations when an AI provider is configured.

## API highlights

- `GET /api/health` — database, Redis, and provider configuration
- `GET|POST /api/sources` — trusted crawl seeds; POST queues a crawl by default
- `GET /api/crawl-jobs` — persistent investigation state
- `GET /api/scholarships` — extracted opportunities and evidence counts
- `GET|POST /api/search-runs` — tracked, explicit SerpAPI searches
- `GET|PATCH /api/settings` — pause switch and budget/crawl settings

## Current boundaries

The vertical slice supports static HTML, PDF, sitemap, RSS, and Atom extraction; same-site recursive crawling; redirects; robots.txt; canonicalization; SSRF blocking; deterministic relevance ranking; AgentRouter-compatible structured decisions; evidence; deduplication; and audited human verification. Playwright is a guarded fallback for JavaScript application shells and is installed only in the worker image. Bulk JSON/CSV imports register seeds without automatically starting every crawl.

See [ARCHITECTURE.md](ARCHITECTURE.md) and [PROGRESS.md](PROGRESS.md).
