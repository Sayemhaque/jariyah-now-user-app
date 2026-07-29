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
- `src/components/` — React components (VideoPreview, ExportModal, CustomizationPanel)
- `public/backgrounds/` — preset images + videos for video backgrounds

## Conventions

- **Path alias**: `@/*` → `./src/*`
- **shadcn/ui**: New York style, Lucide icons, CSS variables enabled (`components.json`)
- **Fonts**: 11 Google Fonts loaded in `layout.tsx` (Inter, EB Garamond, 6 Arabic, 3 Bengali)
- **ESLint**: Very permissive — `no-explicit-any`, `no-unused-vars`, `react-hooks/exhaustive-deps` all off. Don't rely on lint to catch issues.
- **TypeScript**: `noImplicitAny: false`, `strict: true`. Types are loose by design.
- **Tests**: `*.test.ts` colocated with source. Coverage only for `src/lib/`. Test environment is `node` (not jsdom).
- **Background videos**: All video presets must be pre-normalized (H.264, yuv420p, correct resolution) before committing. Validates with `npm run validate-bg`.
- **Event listeners on Remotion Player**: Use `useEffect` with state flag pattern (not callback refs) to avoid "maximum update depth" errors. See `VideoPreview.tsx`.

## Gotchas

- Video render happens entirely in the browser (Canvas → WebCodecs → MP4), not on the server.
- `formatMs` utility lives in `src/lib/format.ts` — import from `@/lib/format`.
- The dev server logs to `dev.log` (via `tee`). Production logs to `server.log`.
- Background video presets are defined in `src/lib/backgroundPresets.ts`. Each video has a `safe` variant (normalized) and a raw variant.
- Turbopack is the default bundler. If you hit a bundler issue, try `next build --webpack` to isolate.
