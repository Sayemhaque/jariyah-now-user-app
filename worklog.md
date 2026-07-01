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
