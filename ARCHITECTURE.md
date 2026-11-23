# Architecture

## Runtime topology

`docker-compose.yml` runs four roles: PostgreSQL, append-only Redis, a one-shot migration/seed service, the Next.js web/API process, and a BullMQ crawler worker. Named volumes preserve database and queue state.

## Dependency direction

- `src/domain` contains crawl policy, extraction, provider contracts, validation, and orchestration.
- `src/lib` contains outer adapters for Prisma, Redis/BullMQ, configuration, and logging.
- `src/app/api` translates HTTP input/output and does not own crawl logic.
- `src/worker` consumes durable job references; crawl frontier truth remains in PostgreSQL.

The queue contains only a crawl job ID. Pages and frontier status are transactional database records, so retrying or restarting a worker does not lose the investigation.

## Safety boundary

Every URL is canonicalized. Initial URLs and every redirect are DNS-resolved and rejected if any resolution is non-public, loopback, link-local, or otherwise non-unicast. Only HTTP(S) is supported. robots.txt, timeouts, byte caps, redirect caps, depth, page count, and child-link count are enforced by backend code.

Web content is passed to AI as explicitly untrusted evidence. Navigation responses must match a Zod schema and can select only crawler-assigned link IDs. AI cannot create headers, URLs, shell commands, or policy overrides. Extracted scholarships enter `NEEDS_REVIEW`; AI confidence alone can never create `VERIFIED` status.

Static HTTP is always attempted before Playwright. Browser rendering is used only for detected JavaScript shells, and every browser subrequest is checked against the public-network URL policy. Images, fonts, and media are blocked. XML feeds are parsed deterministically and enter the same relational frontier.

Verification is an explicit state transition with an actor, reason, timestamp, trusted-source requirement, and minimum evidence policy. Confirming one evidence item marks unresolved alternatives for the same field as conflicting; the decision is also versioned.

Telegram is a driven notification adapter. A verified transition schedules a uniquely constrained delivery record after the scholarship transaction succeeds. A dedicated rate-limited BullMQ worker sends the message and records attempts, Telegram message ID, errors, and completion time. Pending deliveries recover after restarts; failed deliveries can be retried manually. Provider credentials remain server-side.

## Data and deduplication

Canonical source/page/result URLs and crawl-job frontier pairs have unique constraints. Scholarship candidates are matched conservatively on normalized title, provider, and academic year, then versioned before updates. Evidence remains tied to a field, source URL, excerpt, and verification state.

## Provider policy

SerpAPI accounts have separate monthly allocation counters and failures. Selection uses remaining allocation, never rate-limit evasion. Paid search requires an explicit request. AgentRouter is isolated behind `invokeStructuredAI`; its OpenAI-compatible base URL/model are configuration, making a future provider adapter replaceable.
