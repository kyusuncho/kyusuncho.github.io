---
title: RV Badminton App
parent: Projects
nav_order: 1
has_children: true
---

# Building a Production Badminton Club Platform

18 months, 4 services, one polyglot rating engine — how a hobby app for a badminton club grew
into a fully reactive, four-service system with its own rating microservice.

<p class="pub-tags"><span class="pub-tag">#spring-boot</span> <span class="pub-tag">#flutter</span> <span class="pub-tag">#microservices</span> <span class="pub-tag">#reactive</span> <span class="pub-tag">#redis</span> <span class="pub-tag">#system-design</span></p>

## Chapters in this series

1. [Chapter 1 — Introduction]({% link projects/rv-badminton-app/introduction.md %}) — what the system is,
   why it exists, and how its pieces fit together.
2. [Chapter 2 — PointCalculator]({% link projects/rv-badminton-app/pointcalculator.md %}) — decoupling the
   rating engine into a Python microservice with a DuckDB replay cache.

---

> **TL;DR** — RV Badminton is a full-stack platform that tracks matches, player ratings, leaderboards, and a community feed for a real badminton club. It's been in active development for ~18 months and ~1,185 commits, and it runs in production at `rvbadminton.xyz`. Under the hood it's four services in three languages: a fully reactive **Spring Boot 3.4** backend, a **Flutter** mobile app, a **Vue 3** admin dashboard, and a **Python FastAPI** rating microservice that owns the leaderboards. This post walks through what it does, why it's shaped the way it is, and the design decisions I'd defend in a review.

---

## Why this exists

Most amateur sports clubs run on a spreadsheet and a group chat. Ours did too — match results scrawled into a shared sheet, rankings argued about in the chat, and no real memory of who played whom or how anyone was actually trending.

RV Badminton started as the obvious fix: *record matches in an app, compute ratings automatically, show a leaderboard.* That's a weekend project. What it actually became — over 18 months of real club usage — is a system with the kind of problems you only get when real people depend on the numbers being right:

- People care **a lot** about their rating, so the rating math has to be explainable and reproducible.
- Match results get edited and corrected after the fact, so ratings have to be **recomputable from history**, not just incrementally patched.
- A club is social, so it grew a **community module** (posts, comments, media, a marketplace).
- It runs on real money on a real VPS, so it has **observability, migrations, and a deployment story**.

The interesting part isn't any single feature. It's how the constraints pushed the architecture into a specific, defensible shape.

---

## The shape of the system

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   frontend   │────▶│     backend      │◀────│    dashboard     │
│  (Flutter)   │     │ (Spring Boot 3.4)│     │   (Vue 3/Vite)  │
└─────────────┘     └───────┬──────────┘     └─────────────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
         PostgreSQL      Redis       RabbitMQ
              ▲             ▲
              │             │
     ┌────────┴─────────────┘
     │  PointCalculator
     │  (FastAPI / Python)
     └──────────────────
```

| Service | Stack | Responsibility |
|---|---|---|
| **backend** | Spring Boot 3.4, Java 17, reactive (R2DBC) | Auth (JWT), matches, members, community, leaderboard reads, FCM |
| **frontend** | Flutter (Provider, STOMP, FCM) | The member-facing mobile app |
| **dashboard** | Vue 3 + TypeScript (Vite, Pinia, PrimeVue, Tailwind) | Admin panel: members, sportsdays, seasons |
| **PointCalculator** | Python 3.11, FastAPI, DuckDB | The rating engine — computes points, owns the Redis leaderboards |

Backing services: **PostgreSQL 17** (source of truth), **Redis 7** (cache + locks + leaderboards), **RabbitMQ 3** (async FCM dispatch), **MinIO** (S3-compatible media storage), and an optional **ELK stack** for log aggregation.

By the numbers: ~342 Java files in the backend, ~155 Dart files in the app, a Vue dashboard, 8 focused Python modules in the rating service, and 27 Flyway migrations of accumulated schema history.

---

## Decision 1: A fully reactive backend

The entire backend is reactive top to bottom — **no blocking calls in the request path**.

```
Controller  →  returns Mono<ResponseEntity<T>>
   Service  →  chains Mono/Flux business logic
Repository  →  extends ReactiveCrudRepository<Entity, UUID>
            →  R2DBC PostgreSQL driver
```

Was this necessary for a club app's traffic? Honestly, no — the load would be fine on a boring blocking stack. But committing to reactive end-to-end forced a discipline that paid off elsewhere: every multi-step write is an explicit reactive transaction (`TransactionalOperator`), and concurrency-sensitive paths use real pessimistic locking (`SELECT ... FOR UPDATE` via `findByIdForUpdate`) instead of hoping for the best. When two admins edit the same match at the same time, the behavior is defined rather than racy.

The backend is organized **package-by-feature**, not by layer:

```
com.rvbadminton.backend/
├── auth/          community/      config/       fcm/
├── leaderboard/   match/          members/      minio/
├── redis/         security/       sportsday/    statistics/
└── websocket/     integration/    profile/      health/
```

Each feature owns its controllers, services, repositories, and DTOs. This is the single most useful structural decision in the codebase — adding "market posts can have tags" touches one folder, not five horizontal layers.

---

## Decision 2: Let Python own the ratings

This is the decision I'd lead with in any architecture review, because it looks weird until you hear the constraint.

The ratings used to live in Java, computed inline. The problem: **match history is mutable.** An admin fixes a score from last Tuesday, and now every rating computed after that match is wrong. Incremental rating updates can't cleanly handle "go back in time and replay." And iterating on rating *logic* — which is the part club members argue about — inside a compiled, reactive Java service is slow and scary.

So the rating engine became its own service, **PointCalculator**, with a clean authority model:

| Data | Source of truth | Writer | Reader |
|---|---|---|---|
| Raw match/member data | PostgreSQL | Spring Boot | PointCalculator |
| Derived rating state | DuckDB | PointCalculator | PointCalculator |
| Leaderboards & league levels | Redis | PointCalculator | Spring Boot |
| Weight configs | Redis | Spring Boot (admin) | PointCalculator |

The key ideas:

1. **Spring Boot is the only writer to Postgres.** PointCalculator only ever *reads* raw data (via DuckDB's `postgres_scanner`).
2. **DuckDB is a disposable derived store.** It holds per-match rating history and aggregates — and nothing else. If the file is lost, the engine replays the entire match history from Postgres and rebuilds it. That property alone removes a whole class of "corrupted state" incidents.
3. **Redis is the contract between the two services.** PointCalculator writes the leaderboard sorted sets and league-level hashes; Spring Boot only reads them. The key names are mirrored in `RedisKeys.java` and Python constants, so the contract is explicit on both sides.

When a match is saved or edited, Spring Boot enqueues a recalc and calls `POST /recalc { from_match_id }`. The engine finds that match's timestamp, **clears all derived state at or after that boundary, replays forward, and rebuilds Redis.** On startup, Spring Boot calls `GET /validate_startup`, and the engine self-heals: if Postgres has matches DuckDB never saw, it recalculates from the earliest divergence.

This is the pattern I'm proudest of. It turns "recompute everything correctly" from a terrifying operation into the *normal* operation.

### The rating math, briefly

Two scores coexist:

- **League Points / League Levels** — a percentile-ranked competitive ladder. Levels 1–5 are assigned by percentile, but *only across a qualified pool* (members with ≥10 matches in that league); everyone below the threshold sits at level 6. This stops a newcomer's one lucky win from distorting the ladder.
- **Game Points** — a participation-friendly score. Winners get `score × 2`, losers `score × 1`, so showing up and playing always counts for something.

The detail I like most is the **social participation weight** applied to each sportsday (a club meetup):

```
weighted = raw_points × (0.5 + 1.0 × (1 + unique_players_interacted) / member_count)
```

Play with almost nobody and your multiplier floors around `0.5`; play with nearly everyone present and it approaches `1.5`. The rating literally rewards being a good club member who mixes in with the room, not just a sandbagger who farms easy opponents. That's a *product* decision encoded as a formula — which is exactly the kind of thing that belongs in a fast-iterating Python service rather than buried in compiled Java.

---

## Decision 3: Real-time without a heavy stack

Match lists update live. When someone records a result courtside, everyone watching the leaderboard sees it appear.

This runs on **STOMP over WebSocket**. Match mutations broadcast to `/topic/matches/events` with `CREATED`/`UPDATED`/`DELETED` events, and the Flutter app subscribes with auto-reconnect and exponential backoff. Security isn't an afterthought: a `StompJwtChannelInterceptor` validates the JWT on `CONNECT` *and* on every `SEND`/`SUBSCRIBE` frame, so an authenticated socket can't be used to subscribe to things it shouldn't.

Push notifications take the async path. Rather than block an API response on Firebase, match events publish to **RabbitMQ**:

```
MatchService → NotificationPublisher → RabbitMQ → FcmConsumer → Firebase → devices
```

with a durable queue, a dead-letter queue, and exponential-backoff retries (2s → 4s → 10s). If Firebase hiccups, the API request doesn't care and the message doesn't vanish.

---

## Decision 4: A community module that isn't a monolith of `if` statements

The club wanted more than scores — a free board, a contest board, a secondhand marketplace, a suggestions box. The naive version is one `posts` table and a pile of `if (boardType == ...)` branches.

Instead, boards use the **Strategy Pattern**. A common `BoardPostExtensionHandler` interface (`create` / `update` / `loadDetail`) has per-board implementations:

| Board | Extension fields |
|---|---|
| `free` | `pin` |
| `contest` | `startDate`, `endDate`, `place` |
| `market` | `price`, `sellingStatus`, `tags` |
| `suggestion` | (base behavior) |

`PostService` dispatches to the right handler inside a single reactive transaction. Adding a board type is a new handler and a new extension table — the core post pipeline doesn't change. Listing avoids N+1 by `LEFT JOIN`-ing extension tables into a single projection.

Media is handled the way you should handle media: **presigned URLs.** The client asks the backend for a time-limited PUT URL, uploads *directly* to MinIO, then confirms. Large files never stream through the application server, and uploads move through an explicit status lifecycle (`UPLOADING → UPLOADED → PROCESSING → READY → FAILED`) so a half-finished upload is a known state, not a mystery.

---

## Decision 5: Treat the dev environment as a product

A four-service polyglot system is genuinely annoying to run locally. So the onboarding story got real engineering attention.

All shared backing services (Postgres, Redis, RabbitMQ, PointCalculator) run permanently on a shared dev box reachable over **Tailscale**. New developers pick one of four tiers by changing *only host variables* in `.env` — ports never change:

- **Maximum isolation** — share only the DB; run your own Redis + RabbitMQ in Docker.
- **Minimal setup (recommended)** — run *just the backend* natively; everything else is the shared box.

The README documents each tier, the failure modes (e.g. "don't `bootRun` a branch with a new Flyway migration against the shared DB — it changes the schema for everyone, instantly"), and the footguns (shell env vars silently overriding `.env`). Onboarding friction is a tax you pay on every contributor; this was worth removing.

---

## Where it is today

The system is **live in production** at `rvbadminton.xyz`, serving the club daily. Recent work has been less about features and more about the unglamorous things that keep a production system healthy:

- **Infrastructure migration** — currently moving the whole stack to a DigitalOcean VPS behind **Traefik v3** (automatic Let's Encrypt TLS), with a documented, data-preserving runbook: cold `rsync` of Postgres/Redis/RabbitMQ/DuckDB data dirs, secrets copied separately, certs re-issued on the target.
- **Observability** — an optional ELK stack (Elasticsearch + Logstash + Filebeat + Kibana) with structured JSON logs, gated behind GitHub OAuth via `oauth2-proxy`.
- **Config consolidation** — a single root `.env` as the source of truth across both the Java and Python services, with host-based environment switching.
- **E2E testing** — Maestro wired in for Flutter UI flows.

### What's honestly still rough

I'd rather be straight about the gaps than oversell:

- **Test coverage is uneven.** The backend has focused unit tests (JUnit 5 + Reactor `StepVerifier`), the app has match-related tests, but the dashboard has none and overall coverage is below where I'd want it.
- **No CI/CD yet.** Builds and deploys are still hands-on; GitHub Actions for build/test/deploy is the next infrastructure investment.
- **API docs are ad hoc.** OpenAPI/Swagger across all controllers is on the list.
- **Legacy ghosts.** An old Django backend still needs its remaining data/scripts fully retired.

None of these are architectural dead-ends — they're the normal debt of a system that prioritized shipping to real users.

---

## What I'd take to the next project

Three lessons generalize beyond badminton:

1. **Make "recompute from scratch" the normal path, not the emergency one.** Treating DuckDB as disposable derived state — always rebuildable from the Postgres source of truth — removed an entire category of state-corruption bugs. Idempotent, replayable computation is a cheat code.

2. **Split a service along the axis of *change frequency*, not just load.** PointCalculator didn't get extracted for scale; it got extracted because rating logic *changes often and needs to be reasoned about clearly*. The language boundary (Python for math-y iteration, Java for the reactive API) followed the change-frequency boundary.

3. **A clear authority model beats clever syncing.** "Postgres owns raw data, Python owns derived state, Redis is the read contract, Spring Boot is read-only on leaderboards" fits in one table — and that table is why two services in two languages can share data without stepping on each other.

It started as a way to stop arguing about rankings in a group chat. It turned into the most complete piece of system design I've built — and it's still running every time the club plays.

---

*Stack: Spring Boot 3.4 (WebFlux/R2DBC) · Flutter · Vue 3 · FastAPI · PostgreSQL 17 · Redis 7 · RabbitMQ 3 · DuckDB · MinIO · Traefik · ELK · Docker Compose.*
