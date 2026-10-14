<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

# Agent Instructions

## Commands

```bash
npx vitest run           # single test run
npx vitest src/lib/validation.test.ts  # single file
npx vitest run --coverage  # coverage (src/lib/**, excludes env.ts, surahs-fallback.ts)
npx tsc --noEmit         # type check
npm run lint             # eslint (flat config)
```

CI order: `lint → typecheck → test → build`. There is no single `npm run typecheck` script — use `npx tsc --noEmit` directly.

**Vitest**: Running on v3 (not v4) because vitest v4 depends on `std-env@4` which is ESM-only and breaks on Node 20. Coverage: `@vitest/coverage-v8` must match vitest's major version.

## Dev server

Runs on Turbopack (default in Next.js 16). The `npm run dev` script symlinks `.next/cache` to `/tmp/jariyah-next-cache` to avoid inotify watcher issues. If you see stale cache problems, delete `/tmp/jariyah-next-cache`.

## Architecture

- **Next.js 16.2 App Router** with standalone output mode (`output: "standalone"`)
- **Bundler**: Turbopack (default) — no webpack. Pass `--webpack` to opt out.
- **Browser-side video export**: Canvas + WebCodecs (`VideoEncoder`/`AudioEncoder`) + `mp4-muxer` → H.264 MP4. See `src/lib/browser-renderer/`
- **State**: Zustand context provider (`src/lib/store.ts`) for builder UI, TanStack Query available in `src/lib/queries/`
- **Env validation**: Zod at boot via `src/lib/env.ts`. Server vars validated on import; client gets only `NEXT_PUBLIC_*` vars. Tests get defaults automatically when `VITEST` env is set.

## Key paths

- `src/app/` — pages + API routes
- `src/lib/` — shared logic, schemas, types
- `src/lib/browser-renderer/` — browser-side video renderer (Canvas, AudioMixer, WebCodecs)
- `src/remotion/` — Remotion video components (preview only)
- `src/components/` — top-level feature components (VideoPreview, ExportModal, CustomizationPanel, selectors)
- `src/components/{site,legal,builder,preview,export,customize,selection,common}/` — small reusable pieces, one component per file
- `src/hooks/` — custom hooks that hold component state and effects
- `src/lib/content/` — page copy as data (landing, templates, legal pages); legal text uses `**bold**` / `[link](href)` markup parsed by `richText.ts`
- `src/lib/tiktok/`, `src/app/api/tiktok/`, `src/components/tiktok/` — Post to TikTok from the export screen via Login Kit + Content Posting API (see `docs/TIKTOK_SHARE.md`)
- `src/lib/daily/`, `src/lib/social/`, `daily-reel.ts` — daily auto-post to YouTube/Facebook/Instagram/TikTok (see `docs/DAILY_AUTOPOST.md`)
- `src/lib/backgroundPresets.ts` + `src/remotion/scene/` — animated backgrounds drawn in code, each with a color palette; `src/lib/theme.ts` applies the palette to text colors when "Match colors to background" is on, and `src/lib/imagePalette.ts` builds a palette from an uploaded image. After adding or changing a scene, run `npm run scene-previews` to regenerate the picker thumbnails in `public/scene-previews/`

## Conventions

Follow `docs/REFACTOR_PROMPT.md`. In short:

- **camelCase** for every variable, constant, function and prop (`maxAyatsPerVideo`, not `MAX_AYATS_PER_VIDEO`). Only components, types and classes are capitalized. Env var names and external API fields keep their original names.
- **No comments** in code — use clear names and small functions instead.
- **One component per file, 60–70 lines max.** Move state into a hook in `src/hooks/`, pure logic into `src/lib/`, repeated JSX into a reusable component.
- **Reuse before creating.** Search `src/components/` for an existing component (e.g. `OptionButton`, `SliderField`, `SectionHeader`, `FeatureCard`, `GlassButton`) before writing a new one.
- **Watch `cn()` order**: `tailwind-merge` drops `leading-*` when a `text-{size}` class comes after it — put size classes first.

- **Path alias**: `@/*` → `./src/*`
- **shadcn/ui**: New York style, Lucide icons, CSS variables enabled (`components.json`)
- **Fonts**: 11 Google Fonts loaded in `layout.tsx` (Inter, EB Garamond, 6 Arabic, 3 Bengali)
- **ESLint**: Very permissive — `no-explicit-any`, `no-unused-vars`, `react-hooks/exhaustive-deps` all off. Don't rely on lint to catch issues.
- **TypeScript**: `noImplicitAny: false`, `strict: true`. Types are loose by design.
- **Tests**: `*.test.ts` colocated with source. Coverage only for `src/lib/`. Test environment is `node` (not jsdom).
- **Event listeners on Remotion Player**: Use `useEffect` with state flag pattern (not callback refs) to avoid "maximum update depth" errors. See `VideoPreview.tsx`.

## Gotchas

- Video render happens entirely in the browser (Canvas → WebCodecs → MP4), not on the server.
- `formatMs` utility lives in `src/lib/format.ts` — import from `@/lib/format`.
- The dev server logs to `dev.log` (via `tee`). Production logs to `server.log`.
- Turbopack is the default bundler. If you hit a bundler issue, try `next build --webpack` to isolate.
