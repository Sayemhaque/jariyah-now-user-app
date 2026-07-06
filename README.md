# Jariyah Now — Turn Quran Verses Into Shareable Reels

> **Share once, earn forever.**

A full-stack Next.js app where users pick a Surah and an ayat range (max 10),
choose a reciter, customize the visual style, and export a fully synced video —
Arabic audio, word-by-word highlighted subtitles, and translation — ready to
post as a Reel, Short, or YouTube video. Every reel you share is **Sadaqah
Jariyah** — ongoing charity that keeps rewarding you long after you hit share.

## Stack

- **Framework**: Next.js 16 (App Router) + TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (New York) + Lucide icons
- **State**: Zustand (client), TanStack Query (server, available)
- **DB**: Prisma ORM (SQLite in dev)
- **Validation**: Zod (input + env)
- **Testing**: Vitest
- **Fonts**: Inter (UI), Amiri Quran (Arabic, Uthmani), Scheherazade New (Arabic, Naskh)
- **Video export**: Canvas + MediaRecorder + Web Audio API (client-side)

## Quick start

```bash
# 1. Install deps
bun install

# 2. Copy env template and fill in any overrides
cp .env.example .env

# 3. (Optional) Set up the database
bun run db:push

# 4. Start the dev server
bun run dev
# → http://localhost:3000
```

The dev server runs on port 3000. The app is also auto-previewed in the
sandbox's right-side Preview Panel.

## Scripts

| Script | Description |
|---|---|
| `bun run dev` | Start the Next.js dev server (port 3000) |
| `bun run build` | Production build (standalone output) |
| `bun run start` | Run the production build |
| `bun run lint` | ESLint |
| `bun run test` | Run all unit tests once (Vitest) |
| `bun run test:watch` | Run tests in watch mode |
| `bun run test:coverage` | Run tests with V8 coverage report |
| `bun run db:push` | Push the Prisma schema to the database |
| `bun run db:generate` | Regenerate the Prisma client |
| `bun run db:migrate` | Create + apply a Prisma migration |
| `bun run db:reset` | Reset the database (destructive) |

## Environment variables

All vars are validated at boot via `src/lib/env.ts` (Zod). Missing required
vars fail fast instead of breaking at request time. See `.env.example` for
the full list with comments.

| Var | Required | Default | Purpose |
|---|---|---|---|
| `DATABASE_URL` | yes | — | Prisma DB connection string |
| `ALQURAN_CLOUD_BASE_URL` | no | `https://api.alquran.cloud/v1` | Surah list + ayat text |
| `QURAN_COM_API_BASE_URL` | no | `https://api.quran.com/api/v4` | Word-timing data |
| `QURAN_AUDIO_CDN_BASE_URL` | no | `https://verses.quran.com` | Reciter MP3 CDN |
| `RENDER_RATE_LIMIT_MAX` | no | `3` | Max renders per IP per window |
| `RENDER_RATE_LIMIT_WINDOW_MS` | no | `3600000` (1h) | Rate-limit window |
| `EXTERNAL_FETCH_TIMEOUT_MS` | no | `5000` | Timeout for all upstream fetches |
| `UPSTASH_REDIS_REST_URL` | no | — | Distributed rate limiting (prod) |
| `UPSTASH_REDIS_REST_TOKEN` | no | — | Distributed rate limiting (prod) |
| `RENDER_STORAGE_BUCKET` | no | — | S3/R2 bucket for rendered videos |
| `RENDER_STORAGE_REGION` | no | — | S3/R2 region |
| `NEXT_PUBLIC_APP_URL` | no | `http://localhost:3000` | Public app URL |

## Architecture

### Data flow

```
User → Builder UI (client) ──→ /api/timings (proxy) ──→ api.quran.com
                            ──→ alquran.cloud (direct, cached)
                            ──→ verses.quran.com (audio CDN, direct)

User → Export Modal ──→ POST /api/render (validate + rate-limit + HEAD-check audio)
                    ──→ Canvas + MediaRecorder render (client-side)
                    ──→ PUT /api/render (progress updates)
                    ──→ Download .webm
```

### Key modules

| File | Responsibility |
|---|---|
| `src/lib/env.ts` | Zod-validated environment variables |
| `src/lib/schemas.ts` | Zod input schemas for every API route |
| `src/lib/quranApi.ts` | Fetch helpers for surahs, ayat text, word timings |
| `src/lib/validation.ts` | Max-10-ayat + range validation (pure) |
| `src/lib/highlight.ts` | Word-highlight index calculation (pure, tested) |
| `src/lib/overlay.ts` | Overlay shape rendering (CSS + Canvas, shared) |
| `src/lib/rateLimit.ts` | IP rate limiting (in-memory + Upstash-ready) |
| `src/lib/jobStore.ts` | Render job state + idempotency dedupe |
| `src/lib/logger.ts` | Structured JSON logger |
| `src/lib/fetchWithTimeout.ts` | Abort-controlled fetch wrapper |
| `src/middleware.ts` | Request ID + bot filter on API routes |
| `src/app/api/timings/route.ts` | Proxy for quran.com word-timing API |
| `src/app/api/render/route.ts` | POST: validate + create job; PUT: update progress |
| `src/app/api/render-status/route.ts` | GET: poll job state (no-store) |

### Caching strategy

| Resource | Cache | Rationale |
|---|---|---|
| Surah list | `revalidate: 86400` (24h) | Never changes |
| Ayat text + translation | `revalidate: 604800` (7d) | Never changes |
| Word timings | `revalidate: 86400` + `s-maxage` | Per-reciter, stable |
| Render status | `no-store` | Must always be fresh |

### Graceful degradation

- If `api.alquran.cloud` is down → the bundled surah list (`surahs-fallback.ts`) is used
- If the timings API is down → the ayat renders without word-level highlighting
- If a single ayat's audio is missing → the rest of the range still loads
- If all audio is missing → the render API returns 502 with an actionable error

## Testing

Tests live next to the code they test (`*.test.ts`). Run them with:

```bash
bun run test            # run once
bun run test:watch      # watch mode
bun run test:coverage   # with coverage report
```

Coverage:

| Module | Tests | What's covered |
|---|---|---|
| `validation.ts` | ~20 | Every branch: valid range, range too large, `from > to`, out-of-bounds, NaN |
| `highlight.ts` | ~15 | Edge cases: word at frame 0, last frame, zero-duration word, gaps |
| `schemas.ts` | ~15 | Every API input schema: valid + invalid payloads |
| `jobStore.ts` | ~12 | Job lifecycle + idempotency dedupe |
| `rateLimit.ts` | ~8 | Sliding-window + IP isolation + reset time |
| `overlay.ts` | ~14 | All 6 overlay shapes + hex parsing |

## Production deployment notes

This sandbox build renders videos **client-side** (Canvas + MediaRecorder)
because headless Chrome (Remotion's requirement) is unreliable here. For a
real production deployment:

1. **Server-side rendering**: install `remotion` + `@remotion/renderer` and
   move the render loop into a queue worker (Inngest / Trigger.dev / a DB-
   backed job table + cron). The `/api/render` + `/api/render-status` API
   surface is already designed for this — no client changes needed.
2. **Distributed rate limiting**: set `UPSTASH_REDIS_REST_URL` +
   `UPSTASH_REDIS_REST_TOKEN`. The rate limiter auto-switches from in-memory
   to Redis.
3. **Object storage**: rendered MP4s go to S3/R2, not local disk. Return a
   signed URL with an expiry from `/api/render-status`.
4. **Observability**: swap the `logger` module for `pino` piped to your log
   aggregator. Add request IDs (already in middleware) to correlate.
5. **CI**: `lint → typecheck → test → build`, failing fast on the cheapest
   check first.

## API reference

### `GET /api/timings?surah=&ayat=&recitationId=`

Proxies the Quran.com word-timing API (avoids CORS). Cached for 24h.

**200** — `{ verses: [{ words: [...] }] }` (pass-through from quran.com)
**400** — invalid query params (with zod error details)
**502** — upstream returned non-200
**504** — upstream timeout

### `POST /api/render`

Validates the payload, rate-limits by IP, HEAD-checks each ayat MP3 on the
CDN, creates a job, returns its ID.

**202** — `{ jobId, audioCheck, note }`
**400** — invalid body (with zod error paths)
**429** — rate limit exceeded (with `Retry-After` header)
**502** — all ayat audio missing on CDN

### `PUT /api/render`

Update an existing job's progress / status / download URL.

**200** — the updated job
**400** — invalid body
**404** — unknown jobId

### `GET /api/render-status?jobId=`

Poll a job's state. Always fresh (`Cache-Control: no-store`).

**200** — `{ status, progress, downloadUrl?, error? }`
**400** — missing jobId
**404** — unknown jobId

## Licensing & attribution

The Jariyah Now **source code** is MIT-licensed — see `LICENSE`.

The **data** the app fetches at runtime (Quran text, translations, reciter
audio, word timings) is NOT covered by the MIT license. Each data source has
its own license — see `NOTICES` at the repo root for the full attribution
and licensing details.

### Quick summary

| Component | Source | License |
|---|---|---|
| Source code | this repo | MIT |
| Arabic Quran text | alquran.cloud / Tanzil.net | Not subject to copyright (word of God) |
| Pickthall translation (default) | alquran.cloud | Public domain (1930) |
| Saheeh International translation | alquran.cloud | Non-commercial use with attribution |
| Clear Quran (Dr. Khattab) | alquran.cloud | Non-commercial use with attribution |
| Muhammad Asad translation | alquran.cloud | **Copyrighted — personal use only.** A separate license from Dar al-Andalus is required for any public distribution, including in videos. |
| Reciter audio | verses.quran.com | Non-commercial use with attribution; commercial use requires permission |
| Word-timing data | quran.com API | Non-commercial use with attribution |
| Preset background images | AI-generated (this repo) | Public domain (CC0) |
| Fonts (Inter, Amiri, Scheherazade) | Google Fonts | SIL Open Font License 1.1 |

### What this means for users

- **Videos you export are your responsibility.** Jariyah Now automatically adds
  an attribution line to the bottom-left of the exported video when the
  selected translation requires it. Attribution alone does not satisfy the
  Muhammad Asad license — if you select that edition, you must obtain a
  separate written license from Dar al-Andalus before distributing the video.
- **Pickthall (the default) is safe** for any use, commercial or otherwise.
- **Credit the reciter** by name in any video description when publishing.
- **Custom background images** are your responsibility — ensure you have the
  rights to use any image you upload.

### Legal pages

- [`/about`](/about) — data sources, reciter credits, translation editions
- [`/terms`](/terms) — Terms of Service (draft — review with a lawyer before launch)
- [`/privacy`](/privacy) — Privacy Policy (draft — review with a lawyer before launch)
- `NOTICES` — full third-party attributions (repo root)
- `LICENSE` — MIT license for the source code (repo root)

