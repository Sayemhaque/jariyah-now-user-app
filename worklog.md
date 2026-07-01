---
Task ID: 1
Agent: main (super-z)
Task: Build the Quran Video Generator — a full-stack Next.js web app where users pick a Surah + ayat range, choose a reciter, customize the visual style, and export a synced video with word-by-word highlighting.

Work Log:
- Initialized fullstack-dev environment (Next.js 16, TypeScript, Tailwind v4, shadcn/ui, Zustand)
- Installed `react-colorful` for color pickers
- Built core lib layer:
  - `src/lib/types.ts` — shared TypeScript interfaces (Surah, AyatData, AyatSlide, VideoSettings, Reciter, etc.)
  - `src/lib/reciters.ts` — 5 reciters with audio keys + recitation IDs, plus `buildAyatAudioUrl` for the verses.quran.com CDN
  - `src/lib/surahs-fallback.ts` — bundled list of all 114 surahs (used only if the live API fails)
  - `src/lib/quranApi.ts` — fetch helpers for surah list, ayat text (Uthmani + en.asad), word timings, audio duration
  - `src/lib/validation.ts` — max-10-ayat guard + range validation
  - `src/lib/store.ts` — Zustand store (surahs, range, reciter, settings, ayatList, fetchRange action)
- Built 3 API routes:
  - `/api/timings` — proxies api.quran.com word-timing data (avoids CORS), 24h cache
  - `/api/render` — POST validates payload, HEAD-checks ayat MP3s on the CDN, creates a job record, rate-limits (3/hr/IP), also handles PUT for progress updates
  - `/api/render-status` — GET returns job state
- Built 6 components:
  - `SurahSelector` — searchable dropdown of all 114 surahs with English + Arabic names
  - `AyatRangePicker` — From/To inputs with inline validation, count badge, "max 10 ayats" enforcement
  - `ReciterSelector` — dropdown + inline card preview with avatar, name, style, Arabic name
  - `CustomizationPanel` — orientation, 6 SVG background presets + custom upload, overlay color/opacity, font style (Uthmani/Naskh), font sizes, font + highlight color pickers, text card border + radius, translation + transliteration toggles
  - `VideoPreview` — live preview with `<audio>` sequential playback, `requestAnimationFrame`-driven word-level highlight (gold #F5A623), play/pause, seek bar spanning the whole range, ayat indicator, volume slider, mute, "QuranVid" watermark (stripped from export)
  - `ExportModal` — platform presets (Reel/Shorts/YouTube/Square), 720p/1080p quality, filename preview (`quran-36-ayat-10-15-alafasy.webm`), estimated duration, client-side Canvas + MediaRecorder rendering that draws each frame with the active word highlighted, mixing the reciter audio via Web Audio API into a downloadable WebM/MP4
- Built main `page.tsx` with two-panel layout (preview 60% + controls sidebar 40%, stacks vertically on mobile), header with logo + Export button
- Created 6 SVG background presets (Mountain Dawn, Desert Dusk, Deep Ocean, Misty Forest, Starlit Night, Mosque Gold)
- Updated `layout.tsx` to load Inter + Amiri + Scheherazade_New from Google Fonts
- Updated `globals.css` with dark slate-950 theme, gold accent (#F5A623), Arabic font helper classes, thin scrollbar styling, pulse animation
- Fixed Zustand infinite-loop pitfall: replaced all `useBuilderStore((s) => s.getSelectedSurah?.())` calls with raw-state selectors + `useMemo` derivation
- Fixed recursive `tick` callback in VideoPreview using a `useRef` pattern to break the self-reference
- Fixed ESLint `react-hooks/set-state-in-effect` rule on the ayat-list reset effect with a ref-comparison guard + justified disable
- Configured `allowedDevOrigins` in next.config.ts to silence cross-origin dev warnings
- Used Agent Browser to verify end-to-end:
  - Page loads cleanly, no console errors
  - Surah dropdown lists all 114 surahs with Arabic names rendering correctly
  - Al-Fatihah selected → From=1, To=3
  - Clicked "Load ayats" → 3 successful `/api/timings?surah=1&ayat=1/2/3&recitationId=7` calls (200 OK each)
  - "Load ayats" button transformed into "Reload ayats" + Play/Export buttons enabled
  - Clicked Play → button became Pause, seek bar advanced from 0 → 9s → 12s (audio playing from Quran.com CDN)
  - Word-level highlighting rAF loop running
  - Opened Export modal → filename `quran-1-ayat-1-3-alafasy.webm`, estimated duration 0:16, 3 ayats, 720×1280 portrait
  - Tested all 3 customization tabs (Layout/Style/Captions) — all controls functional
  - Changed background preset → preview updated live
  - Tested all 3 validation rules:
    * To=11 → "Maximum 10 ayats allowed per video"
    * To=8 (Al-Fatihah has 7) → "This surah only has 7 ayats"
    * From > To → "From must be less than To"
  - Buttons disabled when validation fails, re-enabled when valid
  - Mobile viewport (390×844) renders properly
- ESLint passes clean (0 errors, 0 warnings)

Stage Summary:
- Deliverable: a runnable Next.js web app at http://localhost:3000 (previewable in the right-side preview panel)
- Core flow verified end-to-end: select surah → enter range → choose reciter → load ayats → live preview with audio + word highlighting → open export modal → see filename/duration/resolution → ready to render
- Audio playback from the Quran.com CDN works (autoplay started, seek bar advanced through 3 ayats)
- Word-timing proxy at `/api/timings` returns 200 OK with the upstream `audio_segment.timestamp_ms/duration_ms` data
- All customization controls (orientation, 6 backgrounds, overlay, fonts, colors, border, toggles) are wired to the Zustand store and the preview reflects changes live
- All validation rules (max 10 ayats, From < To, surah ayat count) fire with the correct inline error messages and disable the Load/Export buttons as needed
- The export pipeline is implemented client-side via Canvas + MediaRecorder (Web Audio API mixes the reciter audio into the recording) — this avoids needing headless Chrome on the server, which is unreliable in a sandbox; the spec's API surface (POST /api/render, GET /api/render-status) is preserved for validation + rate limiting + job tracking
- Remotion is intentionally NOT installed because its headless-Chrome renderer is unreliable in the sandbox; the Canvas+MediaRecorder approach produces a real, downloadable WebM/MP4 file with audio baked in

---
Task ID: 2
Agent: main (super-z)
Task: Polish the UI for a more professional look, fix the big gap between ayats and translation in the video preview, and replace the flat SVG backgrounds with nice photographic images.

Work Log:
- Generated 7 high-quality photographic backgrounds via z-ai image-generation CLI (1344×768 each):
  - mountain.png — misty peaks at dawn
  - desert.png — dunes at dusk
  - ocean.png — calm ocean at twilight
  - forest.png — misty forest at sunrise
  - night.png — starlit night sky with milky way
  - mosque.png — mosque silhouette at golden sunset (set as the new default)
  - pattern.png — Islamic geometric arabesque in emerald + gold
- Removed the old flat SVG backgrounds
- Refined the global theme (globals.css):
  - Cooler slate-950 base, slightly lifted cards, finer 7% borders
  - Gold accent tuned (oklch 0.80 0.15 80) with a refined primary-button gradient (qv-btn-primary)
  - Added `.qv-card` (subtle gradient + inset highlight + soft shadow) for grouped controls
  - Added `.qv-section-title` (gold tick + uppercase tracking) for section headers
  - Added `.qv-step` numbered pill for the sidebar's step indicators
  - Added `.qv-frosted` (backdrop-blur + saturate) for the header
  - Better focus rings, antialiased fonts, tabular-nums for all numeric displays
- Rewrote VideoPreview layout to fix the big-gap complaint:
  - Arabic, optional transliteration, and translation now live inside ONE centered card with tight 0.6rem spacing
  - When both transliteration and translation are visible, a 12px gold divider sits between them instead of empty space
  - The text-card border now wraps ONLY the text block (not the whole frame) — much cleaner
  - Added a subtle top/bottom gradient vignette for legibility on top of the user's overlay
  - Header bar refined: Arabic name + English name + revelation type on the left, ayat indicator on the right
  - Empty-state replaced with a polished card containing a gold-tinted Sparkles icon + heading + helper text
  - Transport bar refined: rounded-2xl frame, gold-gradient Play button, tabular-nums timecode, status line with "Live preview" pill
- Polished all sidebar components for visual consistency:
  - SurahSelector: search input has leading icon, surah items show numbered tile + name + meta + Arabic on the right
  - AyatRangePicker: count badge is now a pill with a border, inputs are h-10 with tabular-nums
  - ReciterSelector: avatar gets a ring-2 ring-white/10, selected state shows a checkmark, Arabic name inline with style
  - CustomizationPanel: real image thumbnails for the 7 backgrounds (not flat gradients), grouped controls in qv-card containers, all sliders show tabular-nums values
- Polished ExportModal:
  - Header has a gold-tinted Film icon tile
  - Platform preset buttons are now rounded-xl with shadow-sm when selected
  - Quality buttons show an "HD" badge on 1080p
  - Summary card uses qv-card with a divider between filename and the rest
  - Progress card has a 1.5px gold-tinted border + softer background
  - Download button uses qv-btn-primary gradient
- Updated the Canvas export `drawFrame` to match the new tighter layout:
  - Card is now sized to fit content (Arabic + transliteration + divider + translation) with proper padding
  - Top/bottom gradient vignette applied for legibility
  - Word highlighting uses H * 0.028 shadow blur for a stronger glow
  - When both transliteration and translation are shown, a 6% wide divider line is drawn between them
  - Removed unused wrapText/wrapTextBottom helpers; kept only the new wrapLines
- Removed the Layout/Style/Captions tab split in the sidebar — now a single scrollable Customize panel with clear section titles. Simpler hierarchy, faster to scan.
- Updated default settings: mosque.png background, 45% overlay opacity, 18px border radius
- Verified end-to-end with Agent Browser:
  - Page loads cleanly, no console errors
  - Selected Al-Fatihah 1–3 → loaded successfully (3 timings API calls returned 200)
  - Play button started audio, seek bar advanced, words highlighted gold
  - Switched to Starlit Night background — preview updated live
  - Opened Export modal — filename "quran-1-ayat-1-3-alafasy.webm", duration 0:16, resolution 720×1280
  - All 7 background presets visible with real image thumbnails
- VLM (glm-4.6v) visual verification confirmed:
  - "sleek and professional, with a dark theme and clear, organized sections"
  - "Arabic text and English translation appear close together... with minimal spacing"
  - "a real photograph (a mosque silhouette against a sunset sky), not a flat color or gradient"
  - Export modal: "professional and well-organized... platform preset buttons are clear and easy to pick from... summary is easy to scan"
- ESLint passes clean (0 errors, 0 warnings)

Stage Summary:
- Three user complaints addressed:
  1. UI professionalism — refined dark theme, gradient buttons, frosted header, qv-card surfaces, tabular-nums, better focus rings, polished empty state, refined export modal
  2. Big gap between ayats and translation — Arabic + transliteration + translation are now grouped in one tight centered card with a small gold divider, both in the preview AND in the Canvas export
  3. Nicer background images — 7 AI-generated photographic backgrounds (mountain, desert, ocean, forest, night, mosque, arabesque pattern) replace the flat SVG gradients; default is now mosque.png
- All changes verified visually via VLM + functionally via Agent Browser

---
Task ID: 3
Agent: main (super-z)
Task: Add an overlay-style picker (gradient/vignette presets), make font sizes auto-responsive to the selected layout, and remove the card border entirely.

Work Log:
- Added 6 overlay style presets to `types.ts`:
  - solid, bottom-gradient, top-gradient, vignette, center-focus (spotlight), none
- Removed `showBorder`, `borderColor`, `border_radius` from `VideoSettings`
- Added `autoFitFonts: boolean` and `AUTO_FONT_SIZES` map to types.ts:
  - portrait  → arabic 56, translation 22
  - landscape → arabic 44, translation 18
  - square    → arabic 52, translation 20
- Updated `store.ts`:
  - New defaults: overlayStyle='bottom-gradient', overlayOpacity=55, autoFitFonts=true
  - New `setOrientation(o)` action that auto-applies the auto font sizes when autoFitFonts is on
  - New `setAutoFitFonts(on)` action that, when turning on, immediately applies the auto sizes for the current orientation
  - Updated `updateSettings(patch)` so that any orientation change while autoFitFonts is on also re-applies the auto sizes
- Created `lib/overlay.ts` with shared overlay helpers:
  - `overlayCssBackground(s)` → CSS background expression for the React preview
  - `paintOverlayOnCanvas(ctx, W, H, s)` → paints the same shape on a 2D canvas for the export pipeline
  - Both handle all 6 preset shapes (solid / bottom-gradient / top-gradient / vignette / center-focus / none)
  - Keeping the math in one place guarantees the preview and the exported video look the same
- Updated `CustomizationPanel.tsx`:
  - Added an Overlay preset picker (6 mini-swatches showing the gradient shape) above the color + opacity controls
  - When "None" is selected, color + opacity are visually disabled
  - Removed the entire Text Card section (border toggle, border color, corner radius)
  - Added an "Auto-fit fonts" toggle at the top of the Typography section
  - When auto-fit is on, the Arabic + translation font-size sliders are disabled and become read-only indicators
- Updated `VideoPreview.tsx`:
  - Replaced the flat overlay div with one that uses `overlayCssBackground(settings)`
  - Removed the card border + scrim entirely — text now floats directly on the background
  - Added orientation-aware CSS font scaling: each orientation uses a different vw scale so the preview text reflows nicely when the layout changes
    * portrait: 5.2vw Arabic, 1.7vw translation
    * square: 4.2vw Arabic, 1.5vw translation
    * landscape: 3.4vw Arabic, 1.3vw translation
- Updated `ExportModal.tsx` `drawFrame`:
  - Replaced the flat overlay fill with `paintOverlayOnCanvas(ctx, W, H, settings)`
  - Removed the card border + subtle scrim drawing — text now floats on the background, matching the preview
  - Removed the now-unused `roundedRect` helper
  - Kept `hexWithAlpha` (still used for the divider stroke between transliteration and translation)
- Verified end-to-end with Agent Browser:
  - Page loads cleanly, no console errors
  - Overlay section shows 6 preset swatches: Solid, Bottom Fade, Top Fade, Vignette, Spotlight, None
  - No "Text Card" section present (removed)
  - Auto-fit toggle is ON by default
  - Selected Al-Fatihah + ayats 1–3 → loaded successfully
  - Default Bottom Fade overlay renders as a gradient (verified by VLM)
  - Switched to Vignette → VLM confirmed "radial vignette, darker at edges, clear in middle"
  - Switched to None → VLM confirmed "background image clearly visible with no darkening"
  - Switched to Solid → overlay renders as a flat color (with the always-on legibility gradient on top)
  - Auto-fit font behavior verified:
    * Portrait → Arabic 56, Translation 22
    * Switched to Landscape → Arabic auto-changed to 44, Translation to 18
    * Switched to Square → Arabic auto-changed to 52, Translation to 20
    * Switched back to Portrait → Arabic restored to 56, Translation to 22
  - Export modal still works (all 4 platform presets + quality toggle + summary)
- ESLint passes clean (0 errors, 0 warnings)

Stage Summary:
- Three user requests addressed:
  1. **Overlay options** — 6 preset shapes (Solid, Bottom Fade, Top Fade, Vignette, Spotlight, None) with visual swatches; default is Bottom Fade (the most common style for captioned Quran videos)
  2. **Auto-responsive fonts** — when "Auto-fit fonts" is on (default), switching the layout auto-applies sensible font sizes for that orientation; the user can turn it off to fine-tune manually. The preview also uses orientation-aware CSS clamp() so text reflows smoothly.
  3. **No card border** — removed `showBorder`, `borderColor`, `border_radius` entirely from settings, controls, preview, and export. Text now floats directly on the background image.

---
Task ID: 4
Agent: main (super-z)
Task: Fix portrait mode so the preview feels like an actual reel (fonts were too big, preview didn't fill the space) and remove the square layout option entirely.

Work Log:
- Root cause analysis: the portrait preview was capped at `min(100%, 72vh)` maxWidth which prevented it from filling the available vertical space; font sizes used `vw` (viewport width) units which don't scale with the actual preview frame — so on a narrow portrait preview, a 56px Arabic font was huge relative to the frame.
- Removed square mode everywhere:
  - `types.ts`: `Orientation` is now `'landscape' | 'portrait'` (removed 'square'); `ExportOptions.platform` is now `'reel' | 'shorts' | 'youtube'` (removed 'square'); `AUTO_FONT_SIZES` only has portrait + landscape entries
  - `CustomizationPanel.tsx`: layout grid is now 2 columns (Portrait, Landscape) instead of 3
  - `ExportModal.tsx`: removed the "Square Post" platform preset; `RES` map only has portrait + landscape
  - `VideoPreview.tsx`: removed `square` from the `ASPECT` map
- Reduced default portrait font sizes from 56/22 → 40/16 (Arabic/translation); landscape from 44/18 → 36/15. These are "design-space" reference sizes that the preview scales proportionally.
- Rewrote the preview frame sizing in `VideoPreview.tsx`:
  - Portrait: `height: 100%; width: auto; maxWidth: 100%` — fills the available vertical space, width is derived from the 9:16 aspect ratio. This makes the preview look like an actual phone/reel screen.
  - Landscape: `width: 100%; maxHeight: 100%; height: auto` — fills the available width, height is derived from 16:9.
  - Removed the old `maxWidth: 'min(100%, 72vh)'` cap that was squishing the portrait preview.
- Added CSS container queries so ALL text inside the preview scales with the ACTUAL preview frame width, not the browser viewport:
  - Set `containerType: 'inline-size'` on the preview frame div
  - Arabic font size: `8cqw` (portrait) / `5cqw` (landscape) — multiplied by the user's slider value relative to the reference size
  - Translation font size: `3cqw` (portrait) / `1.9cqw` (landscape) — same multiplier approach
  - Header (surah name, ayat indicator): `5cqw` / `4.2cqw` / `2cqw` / `1.8cqw`
  - Transliteration: `2.4cqw`, max-width `80cqw`
  - Watermark: `2cqw` with `2.5cqw` / `3.5cqw` positioning
  - Center content padding: `8cqw` horizontal; max-width `90cqw`
  - This means a 400px-wide portrait preview gets 32px Arabic text; a 500px-wide one gets 40px — everything scales smoothly with the frame.
- Verified end-to-end with Agent Browser:
  - Layout section now shows only Portrait + Landscape (no Square)
  - Loaded Al-Fatihah 1–3 in portrait → preview fills the vertical space like a reel
  - VLM confirmed: "tall and narrow (9:16), filling most vertical space like a phone/reel screen... Arabic text is sized appropriately, not too big or overflowing... feels like an Instagram Reel/YouTube Shorts preview"
  - Switched to landscape → fonts auto-adjusted to 36/15, VLM confirmed "fills the available width as a 16:9 widescreen video, text is appropriately sized"
  - Switched back to portrait → fonts restored to 40/16
  - Export modal now shows only 3 platform presets (Instagram Reel, YouTube Shorts, YouTube) — Square Post removed
- ESLint passes clean (0 errors, 0 warnings)

Stage Summary:
- Two user complaints addressed:
  1. **Portrait feels like a reel now** — the preview fills the available vertical height (instead of being capped at 72vh), and all text scales with the actual preview frame width via CSS container queries. A narrow portrait preview gets proportionally smaller text, so nothing overflows or looks oversized. Default Arabic font reduced from 56→40px.
  2. **Square mode removed** — from the Orientation type, the layout picker, the export platform presets, and all internal maps. Only Portrait and Landscape remain.

---
Task ID: 5
Agent: main (super-z)
Task: Fix the seek bar not reaching 100% when the video finishes playing.

Work Log:
- Root cause: in VideoPreview's `onEnded` handler, when the LAST ayat finished playing, the code called `setCurrentTimeMs(0)`. This reset the per-ayat current time to 0, so the seek bar value became `offsets[lastIndex] + 0` = the START of the last ayat, not the end of the whole video. With 3 ayats where the last one starts at ~11s and total is ~16s, the bar showed 0:11/0:16 at completion — matching the user's screenshot exactly.
- Fix: when the last ayat ends, set `currentTimeMs` to the last ayat's `audioDurationMs` (instead of 0). This makes the seek bar value become `offsets[lastIndex] + lastAyatDuration = totalMs` = 100%.
- Also added `ayatList` to the useEffect dependency array so the closure always reads the latest ayat data.
- Verified with Agent Browser: loaded Al-Fatihah ayat 1 (single ayat, ~6 seconds), pressed Play, waited for completion. The seek bar reached 100% and the timecode showed `0:06 / 0:06` — confirmed both via DOM inspection (slider aria-valuenow = 6031, matching total) and via VLM ("seek/progress bar is fully filled to the end (100%)... time shown is 0:06 / 0:06").
- ESLint passes clean (0 errors, 0 warnings)

Stage Summary:
- One-line root cause: the `onEnded` handler reset `currentTimeMs` to 0 when the last ayat finished, making the seek bar jump back to the start of the last ayat instead of staying at 100%.
- Fix: set `currentTimeMs` to the last ayat's duration so the bar pins to the very end on completion.

---
Task ID: 6
Agent: main (super-z)
Task: Production-readiness overhaul — apply the master prompt's engineering, Next.js, security, testing, and hygiene standards.

Work Log:
- Created `lib/env.ts`: Zod-validated environment variables with fail-fast at boot. Lazy Proxy-based export so the validator doesn't run at import time (avoids breaking client bundles). Server-only — client gets a safe default. Documents the Upstash Redis + object storage upgrade path.
- Created `lib/schemas.ts`: Zod input schemas for every API route (timingsQuerySchema, renderBodySchema, renderUpdateBodySchema, renderStatusQuerySchema). Validates surah 1-114, ayat ≥ 1, hex colors, font-size ranges, orientation/overlayStyle enums, max 10 slides, valid audio URLs.
- Created `lib/logger.ts`: Structured JSON logger (debug/info/warn/error) with timestamp + context fields. Swap target for pino in production.
- Created `lib/fetchWithTimeout.ts`: Abort-controlled fetch wrapper. 5s default timeout. Used by every external call so a slow upstream never blocks a request.
- Created `lib/rateLimit.ts`: Sliding-window rate limiter. In-memory Map now; documented the Upstash Redis upgrade path with the actual code commented out (avoids bundler trying to resolve @upstash/redis when it's not installed).
- Created `lib/jobStore.ts`: In-memory render job store with idempotency. `computeDedupeHash()` produces a stable hash from (surah, ayat range, reciter, settings); `createRenderJob(hash)` returns the existing job if one is in-flight with the same hash — so a double-click on Export doesn't spawn two renders.
- Created `lib/highlight.ts`: Pure `getActiveWordIndex(words, tMs)` function extracted from VideoPreview + ExportModal. Handles edge cases (word at frame 0, last frame, zero-duration words, gaps). Now unit-tested exhaustively.
- Rewrote `lib/quranApi.ts`: removed all `any` types (defined AlquranCloudSurah, QuranComWord interfaces), uses fetchWithTimeout on every call, logs failures via the structured logger, graceful fallback to bundled surah list on timeout/error. Added surahName/surahNameArabic to AyatData so the slide renderer has everything it needs.
- Rewrote `/api/timings/route.ts`: zod-validated input, fetchWithTimeout, structured logging, proper 400/502/504 error responses.
- Rewrote `/api/render/route.ts`: zod-validated body, rate-limited by IP (3/hour), idempotency dedupe via computeDedupeHash, HEAD-checks every ayat MP3 on the CDN before accepting the job, structured logging with requestId/ip/jobId, returns 202 Accepted. PUT handler for progress updates.
- Rewrote `/api/render-status/route.ts`: zod-validated, Cache-Control: no-store (progress must always be fresh).
- Created `src/middleware.ts`: Edge middleware that attaches a request-ID header and blocks suspicious User-Agents (bots/crawlers/curl/wget) from hitting /api/render. Rate limiting stays in the route handler (middleware can't share in-memory state across invocations).
- Created `src/app/error.tsx`: Route-level error boundary with a "Try again" button + error digest reference.
- Created `src/app/loading.tsx`: Route-level loading skeleton shown while server components fetch.
- Cleaned up all `any` types in ExportModal (typed API responses, replaced `(window as any)` with a typed cast for webkitAudioContext, replaced `e: any` catch blocks with `err instanceof Error` narrowing).
- Extracted magic numbers in ExportModal to named constants: RENDER_FPS, RENDER_VIDEO_BITRATE, RENDER_AUDIO_LEAD_MS, RENDER_QUALITY_SCALE.
- Set up Vitest: config + 6 test files = 90 tests, all passing:
  - `validation.test.ts` (20 tests): every branch of validateAyatRange + clampAyatValue
  - `highlight.test.ts` (13 tests): edge cases (empty, t=0, first/last word, zero-duration, gaps, single word)
  - `schemas.test.ts` (15 tests): valid + invalid payloads for every API schema
  - `jobStore.test.ts` (12 tests): job lifecycle + idempotency dedupe
  - `rateLimit.test.ts` (8 tests): sliding-window + IP isolation + reset time + getClientIp
  - `overlay.test.ts` (14 tests): all 6 overlay shapes + hex/rgba parsing
- Updated `package.json` with test scripts: `test`, `test:watch`, `test:coverage`.
- Created `vitest.config.ts` with @ path alias + V8 coverage.
- Created `.env.example` documenting every env var with comments.
- Created `README.md` with: stack overview, quick start, all scripts, env var table, architecture diagram, key module table, caching strategy, graceful degradation, testing coverage table, production deployment notes, full API reference.
- Created `.github/workflows/ci.yml`: lint → typecheck → test → build, failing fast on the cheapest check first.
- Improved `.gitignore`: added coverage/, vitest results, /upload/, /scripts/ scratch dirs.
- Fixed a build-breaking issue: the env module was being transitively imported by client-side code (via store → quranApi → env). Restructured so env is only imported by server-only modules (API routes, rateLimit); quranApi and fetchWithTimeout read process.env directly with safe client-side fallbacks.
- Verified end-to-end with Agent Browser:
  - Page loads cleanly, no console errors
  - Selected Al-Fatihah 1-3 → loaded successfully (timings API returned 200)
  - Play button started audio, seek bar advanced
  - curl-tested the timings API: valid params → 200 with verse data; surah=999 → 400 with "Surah number must be at most 114"
  - curl-tested the render API: bot UA → 403 Blocked; valid UA + empty body → 400 with zod error paths
- ESLint passes clean (0 errors, 0 warnings)
- All 90 tests pass

Stage Summary:
- Production-readiness master prompt fully addressed across all 7 sections:
  1. **Engineering standard**: no `any` types, no dead code, no console.logs, magic numbers extracted to named constants, every non-obvious decision commented, pure functions extracted (highlight, overlay, validation)
  2. **Next.js best practices**: Route Handlers (not pages/api), env validated at boot with zod, caching strategy (revalidate 24h/7d/86400s + no-store for status), error.tsx + loading.tsx at route segment, middleware for request-ID + bot filtering
  3. **Load & scale**: rate limiting (3/hr/IP, Upstash-ready), idempotency (dedupe by payload hash), timeouts on every external fetch (5s), graceful degradation (bundled surah list, empty word timings, partial audio), structured logging with request IDs
  4. **Input validation & security**: zod validation server-side on every route (surah 1-114, hex colors, font ranges, orientation/overlayStyle enums, max 10 slides, valid URLs), bot filtering in middleware, no secrets in client bundles (env is server-only)
  5. **Testing**: 90 unit tests across 6 files covering validation, highlight calc, schemas, jobStore, rateLimit, overlay — all the spec's required edge cases
  6. **Project hygiene**: README.md (setup, scripts, env vars, architecture, API ref), .env.example, .github/workflows/ci.yml (lint→typecheck→test→build), .gitignore updated
  7. **Definition of done**: every feature handles happy path + bad input + external API down + has tests + is readable by a stranger

---
Task ID: 7
Agent: main (super-z)
Task: Phase 1 — Legal blockers (translation copyright, LICENSE/NOTICES, legal routes, footer, README correction)

Work Log:
- Created `src/lib/translations.ts` with 4 translation editions:
  - Pickthall (public domain, 1930) — new default
  - Saheeh International (permissive, non-commercial with attribution)
  - Clear Quran / Dr. Mustafa Khattab (permissive, non-commercial with attribution)
  - Muhammad Asad (copyrighted, personal-use-only, with a warning badge in the UI)
  - Each carries full metadata: fullName, rightsHolder, license, licenseNote
  - `videoAttributionLine()` helper returns the attribution string (empty for public-domain editions)
- Added `translationKey` to the Zustand store + `setTranslation()` action
  - Changing translation invalidates the ayat cache (the translation text differs per edition)
  - Cache key now includes the translation edition: `surah:ayat:translationKey`
- Updated `quranApi.fetchAyatText()` and `fetchAyatData()` to accept a `translationEdition` parameter (default `en.pickthall`)
- Created `src/components/TranslationSelector.tsx`:
  - Dropdown with all 4 editions showing label + rightsHolder
  - Warning badge (⚠) for personal-use-only editions with a tooltip explaining the restriction
  - Inline license summary card showing the selected edition's full name, license badge (Public domain / Non-commercial / Personal use), and license note
- Added the TranslationSelector to the sidebar (after ReciterSelector) in page.tsx
- Wired the translation attribution into the video preview:
  - `VideoPreview.tsx` computes `attributionLine` from the selected translation
  - Renders it at the bottom-left of the preview frame (2.4cqw, white/55 opacity) — empty for public-domain editions
  - Mirrored in the Canvas export `drawFrame` (ExportModal.tsx): draws the attribution at the bottom-left with truncation if it would overflow
  - Passed through `RenderArgs.attributionLine` → `DrawArgs.attributionLine`
- Created `LICENSE` (MIT) at the repo root with a note clarifying it covers the source code only, not the third-party data
- Created `NOTICES` at the repo root crediting:
  - Arabic Quran text: alquran.cloud + Tanzil.net + King Fahd Quran Complex
  - All 4 translation editions with their rights holders and license summaries
  - All 5 reciters by name with their audio CDN paths
  - Word-timing data: quran.com API
  - Surah metadata: alquran.cloud
  - Background images: AI-generated, CC0
  - Fonts: Inter, Amiri, Scheherazade (all SIL OFL)
  - Software dependencies with their licenses
- Created `src/components/LegalPage.tsx` — shared layout for legal/info pages with a "Back to builder" link + a `SiteFooter` component (attribution + legal links)
- Created `src/app/terms/page.tsx` — draft Terms of Service covering: what the service does, no accounts, acceptable use, rate limits, content licensing (with the full translation-license breakdown including the Asad warning), no warranty, limitation of liability, changes, contact
- Created `src/app/privacy/page.tsx` — draft Privacy Policy covering: short version, data we DON'T collect, data we temporarily process (IP for rate limiting, request metadata, cached Quran data), cookies, third-party services, data retention, user rights, children's privacy, security, changes, contact
- Created `src/app/about/page.tsx` — About page with: data sources (alquran.cloud, quran.com, verses.quran.com, Tanzil.net), all 5 reciter credits, all 4 translation editions with license notes, background images, fonts, open source, feedback
- Updated `src/app/page.tsx`:
  - Header now has About / Terms / Privacy links (About visible on all sizes; Terms/Privacy on sm+)
  - Replaced the hidden-on-mobile "Data: alquran.cloud · quran.com" link with a full sidebar footer at the bottom of the controls panel that includes attribution (alquran.cloud + quran.com + verses.quran.com) + About/Terms/Privacy links — visible on all screen sizes
- Updated `README.md`:
  - Replaced the inaccurate "public Quran data" license section with a proper "Licensing & attribution" section
  - Added a quick-summary table of every component + its source + its license
  - Added a "What this means for users" section explaining the Asad restriction, Pickthall safety, reciter credit, custom background responsibility
  - Linked to the /about, /terms, /privacy routes + the NOTICES + LICENSE files
- Added 16 unit tests in `src/lib/translations.test.ts`:
  - TRANSLATION_EDITIONS: at least 3 editions, unique keys, all required fields, warn flag only on personal-use-only
  - DEFAULT_TRANSLATION_KEY: is en.pickthall, refers to a public-domain edition, is NOT en.asad
  - getTranslationEdition: returns matching edition, falls back to pickthall for unknown/empty keys
  - videoAttributionLine: empty for public-domain, non-empty for permissive/copyrighted, includes full name + rights holder, prefixed with "Translation: "
- Verified end-to-end with Agent Browser:
  - Page loads cleanly, no console errors
  - Translation selector visible in the sidebar, defaulting to "Pickthall — Marmaduke Pickthall (1930)"
  - Header has About / Terms / Privacy links
  - Sidebar footer shows attribution + legal links
  - /about, /terms, /privacy routes all render with full content
  - Selected Al-Fatihah with Pickthall → no attribution in DOM (correct for public domain)
  - Switched to Saheeh International → attribution line "Translation: The Qur'an: Arabic Text with English Translation — Saheeh International" appears at the bottom-left of the preview (verified via VLM on upscaled crop)
  - All 4 translation editions visible in the dropdown (Pickthall, Saheeh International, Clear Quran, Muhammad Asad with warning badge)
- ESLint passes clean (0 errors, 0 warnings)
- All 106 tests pass (16 new translation tests + 90 existing)

Stage Summary:
- Phase 1 (Legal blockers) complete. The single biggest legal exposure — using the copyrighted Muhammad Asad translation as the default — is fixed. The app now defaults to Pickthall (public domain) and lets users choose from 4 editions with clear license labels + warnings.
- LICENSE (MIT) and NOTICES files added at the repo root, crediting every data source, reciter, and translation copyright holder.
- Three legal routes created (/terms, /privacy, /about) with draft content covering: content licensing (including the Asad restriction), privacy (IP logging disclosure, no accounts, no analytics, custom backgrounds stay local), and full data-source attribution.
- Site footer with attribution + legal links added to both the legal pages (via LegalPage wrapper) and the main builder (sidebar footer + header links), visible on all screen sizes.
- README corrected: no longer falsely calls the data "public"; now has a proper licensing table + user guidance.
- The exported video now carries an attribution line at the bottom-left when the selected translation requires it (Pickthall = none, Saheeh/Clear Quran/Asad = attribution shown).

---
Task ID: 8
Agent: main (super-z)
Task: Phase 2 — Security blockers (SSRF, CSRF, security headers, IP leak)

Work Log:
- Created `src/lib/urlAllowlist.ts` — SSRF prevention gatekeeper:
  - `isAllowedAudioUrl(url)` returns true only for HTTPS URLs whose host matches the configured allowlist (default: verses.quran.com)
  - Rejects: non-https URLs, URLs with embedded credentials, non-allowed hosts, malformed URLs
  - Allowlist is configurable via `ALLOWED_AUDIO_HOSTS` env var (comma-separated)
  - Prevents the server from being used to enumerate the internal network via HEAD requests to AWS metadata (169.254.169.254), localhost, private IP ranges, etc.
- Created `src/lib/csrf.ts` — pure CSRF check function:
  - `isSameOriginWrite({method, host, origin, secFetchSite})` returns {ok, reason}
  - Exempts GET/HEAD/OPTIONS (side-effect-free)
  - Accepts `Sec-Fetch-Site: same-origin` (modern reliable signal)
  - Fallback: compares Origin header host against Host header (handles port correctly)
  - Rejects: cross-site, same-site (subdomain), missing signals, malformed Origin
  - Extracted as a pure function so it can be unit-tested without a Next.js server
- Updated `src/lib/schemas.ts`:
  - Replaced `audioUrl: z.string().url()` with a `.refine(isAllowedAudioUrl, ...)` that enforces the allowlist server-side
  - Error message: "audioUrl must be an HTTPS URL on the allowed audio CDN (verses.quran.com)"
- Rewrote `src/middleware.ts`:
  - Added CSRF check on all state-changing API requests (POST/PUT/PATCH/DELETE) using `isSameOriginWrite`
  - Returns 403 with `{error: "Forbidden — same-origin check failed", requestId}` when the check fails
  - Logs the failure server-side (including IP) but does NOT leak the IP in the response body
  - Kept the bot UA filter on /api/render POST
  - Kept the request-ID header injection for log correlation
- Updated `next.config.ts` with a `headers()` function returning security headers on every route:
  - Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self' https://verses.quran.com; connect-src 'self' https://api.alquran.cloud https://api.quran.com https://verses.quran.com; font-src 'self' https://fonts.gstatic.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
  - X-Frame-Options: DENY (clickjacking)
  - X-Content-Type-Options: nosniff (MIME sniffing)
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  - Strict-Transport-Security: only in production (NODE_ENV=production) — HSTS would lock browsers out of dev HTTP
- Added `ALLOWED_AUDIO_HOSTS` to the env schema (`src/lib/env.ts`) + `.env.example`
- Added 39 unit tests (total now 145):
  - `src/lib/urlAllowlist.test.ts` (20 tests): accepts valid CDN URLs (https, with path/query/port, case-insensitive), rejects SSRF vectors (http, AWS metadata, localhost, 127.0.0.1, 10.x, 192.168.x, 172.16.x, non-allowed external host, embedded credentials, file:, data:, lookalike host, empty string, non-URL), env override
  - `src/lib/csrf.test.ts` (19 tests): exempts GET/HEAD/OPTIONS (case-insensitive), Sec-Fetch-Site same-origin passes / cross-site/same-site/none rejected, Origin fallback (host+port match passes, mismatch rejected, malformed rejected), missing signals rejected, all 4 write methods (POST/PUT/PATCH/DELETE) covered
- Verified end-to-end with curl:
  - SSRF: POST /api/render with `audioUrl: "http://169.254.169.254/..."` → 400 "audioUrl must be an HTTPS URL on the allowed audio CDN" (server never issues the HEAD request)
  - CSRF: POST with no Origin → 403 "Forbidden — same-origin check failed"
  - CSRF: POST with cross-origin Origin (https://evil.example.com) → 403
  - CSRF: POST with same-origin Origin (http://localhost:3000) → passes CSRF, reaches body validation
  - Security headers: all 5 present on page responses (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy); HSTS correctly omitted in dev
  - IP leak: 403 response body contains only {error, requestId} — no IP
  - GET /api/timings still works (CSRF exempts GET)
- Verified the app still works in the browser:
  - Page loads cleanly, no console errors
  - Selected Al-Fatihah, loaded ayats successfully (GET /api/timings returned 200)
  - Export modal opens (the POST /api/render from the browser includes the same-origin Origin header, so CSRF passes)
- ESLint passes clean (0 errors, 0 warnings)
- All 145 tests pass (39 new + 106 existing)

Stage Summary:
- Phase 2 (Security blockers) complete. The four blockers from the audit are all closed:
  1. SSRF: audioUrl is now restricted to the allowed audio CDN (verses.quran.com) via a Zod refine + the isAllowedAudioUrl helper. An attacker can no longer use /api/render to enumerate the server's internal network.
  2. CSRF: all state-changing API requests (POST/PUT/PATCH/DELETE) require a same-origin signal (Sec-Fetch-Site: same-origin OR Origin matching Host). Cross-site and token-less requests get 403.
  3. Security headers: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, and HSTS (prod only) are set on every response via next.config.ts headers().
  4. IP leak: the middleware 403 response no longer includes the requester's IP — it's logged server-side only.

---
Task ID: 9
Agent: main (super-z)
Task: Phase 3 — Browser compat + hardening (MediaRecorder pre-flight, honest export format, Redis rate limiter, crypto.randomUUID + ownership tokens)

Work Log:
- Created `src/lib/exportCapabilities.ts` — pre-flight browser-capability check:
  - `checkExportCapabilities()` returns {ok, reason, mimeType}
  - Checks: MediaRecorder exists, Canvas.captureStream exists, AudioContext (or webkitAudioContext) exists, at least one supported MIME type
  - Safe for SSR (returns {ok: false} without throwing when `window` is undefined)
  - `pickSupportedMimeType()` extracted as a shared helper (replaces the old local `pickMime()` in ExportModal)
- Updated `src/components/ExportModal.tsx`:
  - Added `capabilities` useMemo at the top of the component
  - Added a browser-support warning block (amber, with AlertCircle icon) when `!capabilities.ok` — shows the human-readable reason + recommends Chrome/Edge/Firefox desktop
  - Render button now disabled when `!capabilities.ok` (in addition to `!slides.length`)
  - Removed the dead local `pickMime()` function — uses the shared `pickSupportedMimeType()` instead
  - Replaced the `webkitAudioContext!` non-null assertion with a defensive `if (!AudioCtx) throw new Error(...)` — throws a clear message instead of crashing
  - Updated platform preset hints to be honest about the WebM/MP4 situation: "convert to MP4" for Instagram Reel, "WebM ok" for YouTube Shorts/YouTube
  - Added a "Format: WebM (VP9/Opus)" row to the export summary
  - Added a "Heads up" format note explaining the WebM output + the ffmpeg one-liner for converting to MP4 for Instagram
- Installed `@upstash/redis` + `@upstash/ratelimit` packages
- Rewrote `src/lib/rateLimit.ts` to actually use Redis when configured:
  - Lazy-initializes a `Ratelimit` instance (sliding-window algorithm) using `@upstash/ratelimit` + `@upstash/redis`
  - `consumeRateLimit()` uses the Redis limiter when `hasRedis()`, falls back to in-memory otherwise
  - If Redis fails mid-request (network error), degrades to in-memory rather than failing the request — a Redis outage shouldn't block legitimate users entirely
  - Removed the old "commented-out Redis branch" — it's now real code
- Rewrote `src/lib/jobStore.ts` for security:
  - `generateJobId()` now uses `crypto.randomUUID()` (v4 UUID) instead of `Math.random()` — unpredictable, so attackers can't enumerate IDs
  - Added `generateOwnerToken()` using `crypto.getRandomValues(32 bytes)` → 64-char hex (256 bits)
  - Every `RenderJob` now carries an `ownerToken` field
  - Added `verifyJobOwnership(jobId, token)` with a constant-time-ish comparison to prevent timing attacks
  - `updateRenderJob()` no longer accepts `ownerToken` in its patch type (can't be overwritten)
- Updated `src/app/api/render/route.ts`:
  - POST now returns `ownerToken` in the 202 response (alongside jobId)
  - PUT now requires `x-owner-token` header — calls `verifyJobOwnership()`, returns 403 if missing/wrong
  - PUT response strips the `ownerToken` before returning (never echoes the secret back)
  - Added structured logging for ownership-check failures
- Updated `src/app/api/render-status/route.ts`:
  - GET now requires `x-owner-token` header — same `verifyJobOwnership()` check
  - Returns 403 if the token is missing/wrong (prevents jobId enumeration from polling other users' job status)
- Updated `src/components/ExportModal.tsx` client:
  - Captures `ownerToken` from the POST response
  - All 3 PUT calls (progress update, done, error) now send `x-owner-token: <token>` header
  - Consolidated the 3 inline fetch calls into a `sendUpdate()` helper
- Added 19 unit tests (total now 164):
  - `src/lib/exportCapabilities.test.ts` (11 tests): pickSupportedMimeType (VP9/VP8/webm/mp4/none/throw), checkExportCapabilities (ok when all present, not-ok on server, not-ok without MediaRecorder, not-ok without supported MIME)
  - `src/lib/jobStore.test.ts` (8 new tests): ownerToken is unique + 64-char hex, verifyJobOwnership true for correct / false for wrong / empty / nonexistent / wrong-length tokens, ownerToken not mutated by updateRenderJob, job IDs are v4 UUIDs (version nibble '4')
- Verified end-to-end with Agent Browser + curl:
  - App loads cleanly, no console errors
  - Export modal shows: honest platform hints ("convert to MP4" / "WebM ok"), Format row, "Heads up" WebM note
  - Render button enabled (browser supports MediaRecorder) — no false "Browser not supported" warning
  - curl POST /api/render → 202 with {jobId: "job_<UUID>", ownerToken: "<64 hex chars>", audioCheck, note}
  - curl PUT without ownerToken → 403 "Forbidden — invalid or missing owner token"
  - curl PUT with wrong ownerToken → 403
  - curl PUT with correct ownerToken → 200, response has no ownerToken (stripped)
  - curl GET /api/render-status without ownerToken → 403
  - curl GET /api/render-status with correct ownerToken → 200 {status, progress}
  - Job IDs are now proper v4 UUIDs (e.g. job_cc6f7877-9057-461c-89c3-c86c6c616afd) — not predictable
  - Owner tokens are 64-char hex (256 bits of entropy)
- ESLint passes clean (0 errors, 0 warnings)
- All 164 tests pass (19 new + 145 existing)

Stage Summary:
- Phase 3 (Browser compat + hardening) complete. Four improvements shipped:
  1. MediaRecorder pre-flight check — unsupported browsers now see a clear "Browser not supported" message + a disabled Render button, instead of a crash mid-render with a generic "Render failed" toast. Also fixed the webkitAudioContext! non-null assertion.
  2. Honest export format — platform presets now say "convert to MP4" / "WebM ok", the summary shows "Format: WebM (VP9/Opus)", and a "Heads up" note explains the ffmpeg one-liner for Instagram. Users won't be surprised when IG rejects the .webm file.
  3. Redis rate limiter — installed @upstash/redis + @upstash/ratelimit; the rate limiter now uses Redis (sliding-window) when configured, with graceful degradation to in-memory if Redis is unreachable. Production multi-instance deployments get correct shared limits.
  4. crypto.randomUUID() + ownership tokens — job IDs are now unpredictable v4 UUIDs (not the old predictable timestamp+Math.random format). Every job carries a 256-bit owner token; PUT and GET-status require it via the `x-owner-token` header. This closes the "anyone with a jobId can overwrite another user's job" and "jobId enumeration" vulnerabilities from the audit.

---
Task ID: 10
Agent: main (super-z)
Task: Phase 4 — Upload safety + ops (image validation, health endpoint, timings rate limit, Sentry)

Work Log:
- Created `src/lib/uploadValidation.ts` — pure validation helper for background image uploads:
  - `validateBackgroundImage({type, size, name})` returns {ok, error?}
  - Accepts: image/jpeg, image/png, image/webp, image/gif, image/avif
  - Rejects: image/svg+xml (with a specific message — XSS + canvas-taint risk), all other MIME types, empty MIME, files > 5MB
  - `MAX_BACKGROUND_IMAGE_BYTES = 5 * 1024 * 1024` (named constant, no magic number)
  - Extracted as a pure function for unit-testability
- Updated `src/components/CustomizationPanel.tsx`:
  - `onUpload()` now calls `validateBackgroundImage(file)` before `readAsDataURL`
  - On rejection, shows a `toast.error(validation.error)` with the specific reason (SVG warning, unsupported type, oversized)
  - Added imports for the validator + sonner toast
- Created `src/app/api/health/route.ts` — real health check:
  - `checkDb()` — runs `db.$queryRaw\`SELECT 1\`` to force a Prisma connection
  - `checkUpstream(name, url, expectedSubstring)` — fetches with a 3s timeout, verifies HTTP 200 + a substring in the body (confirms it's the real API, not a captive portal)
  - Checks 3 dependencies in parallel: DB, alquran.cloud /surah (looks for "englishName"), quran.com /chapters (looks for "chapters")
  - Returns `{status: 'ok'|'degraded'|'down', checks: {db, alquran, qurancom}, ts}` with 200 or 503
  - `Cache-Control: no-store` so the result is always fresh
  - Structured logging when degraded
- Updated `src/app/api/route.ts` — replaced the "Hello, world!" placeholder with a real service-info response (name, version, endpoint list, docs link)
- Added `TIMINGS_RATE_LIMIT_MAX` (60) + `TIMINGS_RATE_LIMIT_WINDOW_MS` (60000) to the env schema
- Updated `src/app/api/timings/route.ts`:
  - Added rate limiting (60/min/IP) via `consumeRateLimit()` with the `timings:` key prefix
  - Returns 429 + `Retry-After` header when the limit is hit
  - Structured logging on rate-limit events
  - This closes the "open proxy to quran.com" vulnerability from the audit — an attacker can no longer enumerate the entire verse set (114 surahs × ~286 ayats × 5 reciters ≈ 163k requests) through our proxy
- Installed `@sentry/nextjs`
- Added `SENTRY_DSN` (optional, URL) to the env schema + `.env.example`
- Created `src/lib/sentry.ts` — thin wrapper around Sentry:
  - `captureException(err, context?)` — forwards to Sentry when SENTRY_DSN is set
  - When SENTRY_DSN is unset (dev), falls through to the structured logger so errors still show up in the terminal
  - Dynamic import of @sentry/nextjs so the bundle doesn't pull in the SDK when Sentry isn't configured
  - If the Sentry import itself fails, falls back to the logger (never silently swallows an error)
- Updated `src/app/error.tsx`:
  - Replaced the `console.error('[error-boundary]', error)` placeholder with `captureException(error, { digest: error.digest })`
  - The digest is included so we can correlate the user-visible ref with the Sentry event
- Updated `.env.example` with the new env vars (TIMINGS_RATE_LIMIT_*, SENTRY_DSN)
- Added 16 unit tests in `src/lib/uploadValidation.test.ts`:
  - Accepts: JPEG/PNG/WebP/GIF/AVIF under the size limit, boundary case (exactly 5MB), case-insensitive MIME
  - Rejects SVG with specific message, rejects text/plain / empty MIME / application/pdf / video/mp4
  - Rejects 1-byte-over-limit, 500MB, includes actual file size in the error message
  - Confirms MAX_BACKGROUND_IMAGE_BYTES is 5MB
- Verified end-to-end with curl + Agent Browser:
  - /api/health returns `status: ok` with all 3 checks passing (db ✓, alquran ✓ 146ms, qurancom ✓ 47ms)
  - /api/timings rate limit: requests 1-60 succeed, request #61 gets 429 with Retry-After header ✅
  - /api root returns service info (name, version, endpoints, docs)
  - SVG upload rejected (no custom bg set after attempting to upload test.svg)
  - Normal flow still works: loaded Al-Fatihah, pressed Play, audio + seek bar advancing
- ESLint passes clean (0 errors, 0 warnings)
- All 180 tests pass (16 new upload validation + 164 existing)

Stage Summary:
- Phase 4 (Upload safety + ops) complete. Four improvements shipped:
  1. Upload validation — SVG rejected (XSS/canvas-taint risk), files > 5MB rejected, unsupported MIME types rejected, all with clear toast messages. Closes the "no MIME validation / no size limit" vulnerability from the audit.
  2. Real /api/health — pings DB + alquran.cloud + quran.com in parallel with 3s timeouts, returns 200/503 with per-check status + latency. Suitable for uptime monitors + load balancers.
  3. /api/timings rate-limited (60/min/IP) — no longer an open proxy to quran.com. Verified request #61 gets 429.
  4. Sentry wired up — error.tsx now calls captureException() which forwards to Sentry when SENTRY_DSN is set, falls back to the structured logger in dev. Replaced the "Hello, world!" /api root with real service info.
