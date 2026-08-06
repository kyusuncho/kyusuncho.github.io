---
title: Chapter 1 — Introduction
parent: RV Badminton App
nav_order: 1
---

# RV Badminton: What It Takes to Replace a Group Chat

An 18-month tour of a four-service, three-language platform built so a badminton club could stop
squinting at chat messages to count their scores.

<p class="pub-tags"><span class="pub-tag">#system-design</span> <span class="pub-tag">#microservices</span> <span class="pub-tag">#spring-boot</span> <span class="pub-tag">#flutter</span> <span class="pub-tag">#fastapi</span> <span class="pub-tag">#software-architecture</span></p>

> This is the first post in a series about **RV Badminton** — a production platform I've been building for ~18 months to run a real badminton club. This post is the map: what the system *is*, why it exists, and how its pieces fit together. The posts that follow each take one architecture decision and go deep. By the end of this one, you'll understand the whole system well enough to know which deep-dive you actually want to read.

---

## It started with badminton

I play badminton every weekend at **RV Badminton**, a club run out of a sports hall in Seoul. The sessions are long — multiple courts, a rotating mix of doubles games across men's, women's, and mixed — and the community is genuinely tight-knit. People have been showing up together for years.

The person who makes RV Badminton *RV Badminton* is **Sangwoo Kim**, the club leader. Sangwoo doesn't just organize the courts and keep the peace; he runs an elaborate ranking system. Every match earns you points — a formula based on scores, opponents, participation — and at the end of every other month, the top-ranked players get prizes: a brand new badminton racket, shuttlecocks, gear. Real prizes. Earned by showing up and playing well, tracked across every session.

That system is the reason people care. The leaderboard isn't decoration — it's the reason someone pushes through a tough set instead of coasting. The ranking *matters*.

And the way it worked, for a long time, was this: **a group chat and a C# program that Sangwoo ran on his own machine.**

---

## The group chat era

During each session, as matches finished, players would type their results into the KakaoTalk group chat. Raw, freeform text, dumped into the same channel used for everything else:

```
김상우 이소현 백태민 김기주 21 19
```

At the end of the day, Sangwoo would scroll back through hours of messages, copy the relevant lines, manually parse them — who played, what were the scores, fix typos, correct anyone who got the format slightly wrong — and paste everything into his own C# application. The program would crunch through the accumulated data, apply his point system, and spit out a leaderboard.

That was the pipeline. Human OCR, manual data entry, one person's laptop, a custom desktop app. It worked because Sangwoo made it work, through sheer personal effort every single week.

But it had problems:

**Problem 1: Nobody understood the actual rules.**
Sangwoo's C# system had a real algorithm underneath — league points, win/loss weighting, a social participation factor — but it lived entirely in his head and his code. Ask any club member how the points were calculated and you'd get a shrug. People knew they were being ranked; they had no idea why. When someone's rating seemed wrong, there was no way to verify it, which meant every season had at least one skeptical conversation in the group chat.

**Problem 2: The leaderboard was always hours behind.**
During the session, everyone was playing blind. You didn't know where you stood until Sangwoo ran his program at the end of the day, maybe later. If you were on the edge of a prize cutoff, you couldn't even tell if the last game mattered. The lag wasn't just annoying — it disconnected the playing from the ranking in a way that dulled the whole competitive edge.

**Problem 3: Non-participants got drowned in notifications.**
The match results were typed into the same group chat that every club member was in — including members who didn't play that day. Sit out a week and your phone still buzzed fifty times as games wrapped up. This was, charitably, not great. People started muting the chat, which meant they also missed the actually important announcements.

**Problem 4: Sangwoo was doing unpaid data-entry work every week.**
The manual pipeline — read the messages, parse them, clean them, enter them — took real time and attention. It also introduced a single point of failure: if Sangwoo wasn't there, or was tired, or the messages were unusually messy, the whole system degraded. The ranking system existed because of one person's willingness to do manual labor on top of actually running the club.

**Problem 5: Simple questions had no good answers.**
"How many games did I play today?" Scroll back through the chat and count. "Who did I pair with most this season?" No idea. "Am I playing better than I was three months ago?" The data existed — somewhere in accumulated chat history — but it was completely inaccessible.

---

## Why I decided to build this

A bit of personal context first, because it matters for how this project was approached.

I'm an AI engineer — my Master's degree in computer science was almost entirely about vision AI: neural networks, image recognition, that world. I had never built a production web service. I had never touched Spring Boot, Flutter, Docker networking, or a reverse proxy. I barely used Git beyond "commit, push, repeat." RV Badminton is, genuinely, my **first software engineering project**.

The timing was specific. I had just finished my degree and was waiting for my first job to start — there was about a month before my first day. During that gap, "vibe-coding" was having a moment: AI-assisted coding was everywhere, people were building real things surprisingly fast with LLM help, and the barrier to starting something ambitious had dropped noticeably. I wanted to actually get familiar with the things I'd be expected to know as a working engineer — GitHub workflows, infrastructure, basic networking, how a backend and a database talk to each other, what Docker Compose actually does. The theory I had. The hands-on intuition I didn't.

RV Badminton seemed like the perfect vehicle. It was a real problem I cared about, for real people I played with every weekend, with a scope I thought was manageable. I'd build a simple match-recording app, learn some things, call it done.

The pitch I made to Sangwoo was simple: *let me build a proper app for this.* He could define the rules, and the app would handle everything else — recording matches in real time, computing points automatically, showing a live leaderboard during the session, and delivering it all to members' phones without flooding the group chat.

He said yes. And then I started to understand what "manageable" actually meant.

![RV Badminton member sign-in screen]({{ '/assets/images/posts/rv-badminton/login.webp' | relative_url }}){: .post-shot width="720" height="1565" loading="lazy" }

*The Flutter member app starts with the club's own sign-in surface — a much more deliberate starting point than a freeform chat thread.*
{: .post-caption }

What started as a month-long learning project became eighteen months of continuous development. I didn't plan for that. But somewhere along the way it stopped feeling like homework and started feeling like something I genuinely wanted to get right — and every time a club member checked their stats mid-session, it felt worth it.

**RV Badminton is** roughly **1,185 commits** of that: four services in three languages, running in production, with a real deployment runbook and real users who would notice if it broke. This post is about *how a learning project earns that complexity* — because none of it was added for its own sake. Each piece exists because a specific, concrete problem made the simple version stop working.

---

## The constraints that shaped everything

If you want to understand a system's architecture, don't start with the architecture. Start with the problems that made the previous approach untenable. Each of the five problems in Sangwoo's pipeline maps directly onto an engineering constraint — and each constraint shaped a part of the system.

### 1. Match data needs to be visible to everyone, immediately

The group chat pipeline had a fundamental concurrency problem: one person (Sangwoo) was the bottleneck between "a match happened" and "anyone knows about it." Everyone else was operating on stale information for hours.

The fix sounds simple — just write results to a database — but "immediately" is the hard part. When a match is recorded on court 3, the players on court 1 should see it appear on their phones *now*, without refreshing. Every member present at the session is effectively a concurrent reader of a shared, changing dataset. That requirement pushes the backend toward **real-time event broadcasting**: the moment a result is written, it needs to propagate to every connected client simultaneously.

This is not a problem you can solve with a REST API and a pull-to-refresh. It needs a persistent connection — a WebSocket — and a server architecture that can push to all connected clients without missing anyone. The moment you commit to that, you're also committing to handling reconnections, authentication on the socket layer, and the question of what happens to a client that was offline when an update arrived.

### 2. Every member deserves their own statistics

In the group chat era, the only artifact was Sangwoo's end-of-day leaderboard — a single ranked list. Individual history didn't exist as a queryable thing. "How many games did I play this season?" or "Who have I played with most?" required scrolling back through weeks of messages and counting by hand.

This is a deeper problem than it sounds. It's not just about adding a stats screen. It means the data model has to be designed from the start to support **per-member, per-season, per-sportsday queries** — not just a running total. Every match needs to record not just who won, but who played, what their roles were, what the score was, which sportsday it belonged to, which season that sportsday falls in. The leaderboard is then just one view over that data; individual dashboards are another.

The app gives each member a personal dashboard: games played, win rate, point progression over time, league level history, how they've trended across seasons. None of that comes for free from "store match results." It requires a data model that was built with those queries in mind from the beginning — and a rating engine that can answer questions like "what were my points after last month's session?" without having to replay everything on the fly each time.

### 3. The manual pipeline needs to disappear entirely

Problems 3 and 4 from the group chat era — Sangwoo's data-entry labor and the flood of notifications to non-participants — are both symptoms of the same root cause: **a manual process sitting in the middle of a system that should be automatic.**

Automation here means several things at once. Match recording has to be something *any member at the session* can do from their phone, in a structured way that doesn't require cleanup — no more freeform chat messages that someone has to parse. Score submission triggers point recalculation automatically, not at the end of the day when Sangwoo finds time. Push notifications go to the right people (participants and people who opted in) through a real notification system, not a group chat that treats everyone identically.

That last point has its own engineering weight. Reliable push notifications — ones that actually arrive, that retry on failure, that don't block the API response while Firebase is slow — require an **asynchronous message queue** between "a match was recorded" and "a push notification was delivered." If you fire-and-forget a notification in the same API call that saves the match, any hiccup in Firebase makes the whole request fail or hang. The queue decouples those concerns: the match is saved fast, the notification is delivered eventually and reliably.

The end state: Sangwoo's entire Saturday pipeline — copy messages, parse names and scores, clean typos, run the desktop app, post the results — is replaced by members tapping in scores as they play, with everything else happening automatically.

![RV Badminton match-recording screen]({{ '/assets/images/posts/rv-badminton/match-recording.webp' | relative_url }}){: .post-shot width="720" height="1561" loading="lazy" }

*The match screen is a structured, date-aware workflow: this local 2026-08-05 view shows the 30 experiment matches and their scores. Player names are mosaicked for privacy.*
{: .post-caption }

### 4. A club is social, not just competitive

Once the app had members' attention, the group chat's other job became visible: it was also the place where people *talked*. Announcements, session photos, buying and selling used gear, suggestions to the organizers — all of it mixed in with the match scores.

That's how a match tracker grows a **community module**. Not because it was planned, but because taking away the group chat's data role left a gap that the social role still needed to fill — somewhere that was *not* also a firehose of score updates. Multiple board types, posts, threaded comments, media attachments, a secondhand marketplace. And with that comes its own engineering surface: image uploads that don't stream through the server, edit history, soft-deletion, moderation controls.

![RV Badminton community board]({{ '/assets/images/posts/rv-badminton/community-board.webp' | relative_url }}){: .post-shot width="720" height="1558" loading="lazy" }

*The app keeps the club's social conversations in a dedicated community space, separate from match results and ranking updates.*
{: .post-caption }

### 5. It runs on real money for real people

This isn't a demo. It's deployed on a paid server, real members open it on their real phones, and if it goes down during a club session, that's a real failure that affects real people's Saturday. That reality forces the unglamorous half of software engineering into existence: **database migrations** that don't lose data, **observability** so you can tell *why* something broke, a **deployment process** you can repeat under pressure, and a **local dev setup** that another developer can actually get running.

---

Notice what all five constraints share: **none of them are about scale.** A badminton club peaks at a few dozen people simultaneously tapping in results. The complexity here is *essential* — it comes from the problem being genuinely multi-faceted (real-time data, personal analytics, end-to-end automation, social features, and operational reliability all at once), not from needing to serve a million users. That distinction changes what "good architecture" means. The goal isn't to handle load; it's to keep five different concerns from tangling into each other.

---

## The shape of the system

Here's the whole thing on one page. Four services, with shared infrastructure in the middle.

```
┌──────────────┐     ┌────────────────────┐     ┌──────────────────┐
│   frontend   │────▶│      backend       │◀────│    dashboard     │
│  (Flutter)   │     │  (Spring Boot 3.4) │     │   (Vue 3/Vite)   │
│  member app  │     │   reactive API     │     │   admin panel    │
└──────────────┘     └─────────┬──────────┘     └──────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
         PostgreSQL          Redis          RabbitMQ
        (source of        (cache +         (async FCM
          truth)         leaderboards)      dispatch)
              ▲                ▲
              │   reads        │   writes
              └────────┬───────┘
                       │
              ┌────────┴──────────┐
              │   PointCalculator │
              │  (FastAPI/Python) │
              │   rating engine   │
              └───────────────────┘
```

Let's walk through each — what it does, what it's built on, and why I chose each component. 

### The backend — the spine (Spring Boot 3.4, Java 17)

Everything goes through the backend. It's the only service that's allowed to **write** to the main database, which makes it the single authority on "what actually happened": matches, members, community posts, authentication.

It's built on a **fully reactive** stack — Spring WebFlux with R2DBC, the reactive PostgreSQL driver. In plain terms, that means the backend never blocks a thread waiting for the database; requests flow through as asynchronous streams (`Mono` for one result, `Flux` for many). For a club's traffic this is, frankly, overkill — but committing to it forced a useful discipline: every multi-step write is an explicit transaction, and the parts where two people might collide (like two admins editing the same match) use real database locking instead of hoping the timing works out.

It's also organized **by feature, not by layer** — there's an `auth` folder, a `match` folder, a `community` folder, each owning its own controllers, services, and database access. Adding a feature touches one folder, not five.


### The frontend — what members actually touch (Flutter)

The member-facing app. Built in Flutter so one codebase targets both iOS and Android. It talks to the backend over normal REST for most things, but for the live stuff — watching match results appear in real time — it holds a **WebSocket** connection. It also receives push notifications through Firebase.

The app handles the messy realities of mobile: tokens that expire mid-session (it silently re-authenticates and retries), network connections that drop (the real-time socket reconnects on its own with increasing backoff), and switching between dev/test/production backends without rebuilding.

### The dashboard — the control room (Vue 3 + TypeScript)

Admins need a different surface than members. The dashboard is a web app — Vue 3, TypeScript, with data tables — for the organizational work: managing members, scheduling **sportsdays** (the club's term for a meetup/session), defining **seasons**, and adjusting the configuration that the rating engine reads. It logs in through the same backend with a separate admin authentication path.

### The PointCalculator — the ever-changing engine (Python, FastAPI, DuckDB)

The rating engine is its own Python service, exposed through FastAPI, because the point system changes more often than the rest of the product. Sangwoo adjusts weights, experiments with seasonal rules, and asks for explanations when a number looks surprising. Keeping that logic outside the Spring Boot backend lets the API stay focused on the authoritative facts — members, matches, seasons, authentication — while the rating service focuses on replaying those facts into scores. A rules change becomes a rating-engine change, not a backend release.

DuckDB sits inside that service as the analytical layer. PointCalculator reads raw match history from PostgreSQL, uses DuckDB to aggregate and replay the data efficiently, then writes the derived leaderboards and levels into Redis for the backend to serve. The important boundary is ownership: PostgreSQL remains the source of truth, DuckDB holds disposable derived state, and Redis holds the fast read model. The details of that pipeline deserve their own post, but the short version is this: the extra service exists because the rating math is changeable, analytical, and safer when it is independent from the transactional API.

### The supporting cast

Three more pieces hold it together:

- **Redis** is the fast shared layer — it caches the leaderboards (as sorted sets, so "give me the top 20" is instant) and acts as the contract between Python and Java. PointCalculator writes; the backend reads.
- **RabbitMQ** decouples notifications. When a match is recorded, the backend doesn't wait around for Firebase to deliver a push — it drops a message on a queue and moves on. A separate consumer handles delivery, with retries and a dead-letter queue for failures. The user's request stays fast; the notification still gets delivered.
- **MinIO** is S3-compatible storage for media (profile pictures, community photos). Crucially, uploads don't stream through the backend — the client gets a temporary signed URL and uploads *directly* to storage, so a big photo never bottlenecks the API.

And in production, an optional **ELK stack** (Elasticsearch, Logstash, Kibana) aggregates structured logs so that when something breaks, there's a searchable trail instead of a shrug.

---

## How a single match flows through all of it

The architecture is easiest to feel through one concrete action. Someone finishes a game and records the result:

1. The **Flutter app** sends the result to the **backend**.
2. The backend validates it and writes the match into **PostgreSQL** — the new source-of-truth fact.
3. The backend **broadcasts** the new match over WebSocket; every member watching the live feed sees it appear immediately.
4. The backend drops a **notification message** onto RabbitMQ; a consumer delivers a push notification through Firebase without holding up anything else.
5. The backend asks **PointCalculator** to recalculate from this match forward.
6. PointCalculator reads the match history from PostgreSQL, replays it, recomputes ratings into its DuckDB file, and **rebuilds the leaderboards in Redis**.
7. Next time anyone opens the leaderboard, the **backend reads the fresh numbers from Redis** and serves them.

One user action, and every service plays its part — each doing exactly one job, none reaching into another's territory. That separation is the whole point. The competitive math can't corrupt the raw data. A slow notification can't slow down recording a match. A rating-logic change never touches the API.

---

## Where the project is today

RV Badminton is **live in production**, used by the club regularly. The recent work has shifted from features to the things that keep a real system alive: migrating the entire stack to a new cloud server behind an automatic-HTTPS reverse proxy (with a careful, data-preserving runbook), wiring up centralized logging, consolidating configuration into a single source of truth shared across the Java and Python services, and adding end-to-end UI tests.

I'll also be honest about the rough edges, because a system this age always has them: test coverage is uneven, there's no automated CI/CD pipeline yet, the API isn't fully documented, and there's a legacy backend still waiting to be fully retired. None of these are dead-ends — they're the ordinary debt of a project that chose to ship to real users first. I'll cover how I'm working them down as the series goes on.

---

## What's coming next

This was the map. In future posts, I'll go deeper on:

- Why the backend is fully reactive
- Why the ratings live in a separate Python service
- How the rating math actually works
- Real-time match updates and async push notifications
- The community module and media uploads
- Keeping a four-service system sane to run locally

The first of those is up now: [Chapter 2 — PointCalculator]({% link projects/rv-badminton-app/pointcalculator.md %}).

If there's a thread running through all of it, it's this: **every bit of complexity in RV Badminton can be traced back to a concrete constraint.** It started as a way to stop arguing about rankings in a group chat. It became the most complete piece of system design I've built.
