# Agent Instructions

## Commands

```bash
npx vitest run           # single test run
npx vitest src/lib/validation.test.ts  # single file
npx vitest run --coverage  # coverage (src/lib/**, excludes env.ts, surahs-fallback.ts)
npx tsc --noEmit         # type check
npm run lint             # eslint
```

CI order: `lint → typecheck → test → build`. There is no single `npm run typecheck` script — use `npx tsc --noEmit` directly.

## Dev server

The `npm run dev` script symlinks `.next/cache` to `/tmp/jariyah-next-cache` to avoid inotify watcher issues. If you see stale cache problems, delete `/tmp/jariyah-next-cache`.

## Architecture

- **Next.js 16 App Router** with standalone output mode (`output: "standalone"`)
- **Server external packages** (not bundled): `@remotion/bundler`, `@remotion/renderer`, `@remotion/cli`, `remotion` — configured in `next.config.ts`
- **Client-side video export**: Canvas + MediaRecorder + Web Audio API (in `ExportModal.tsx`)
- **Server-side video export** (production): Remotion pipeline (`src/lib/server/renderWithRemotion.ts`) using ffmpeg for background pre-looping (`src/lib/server/ffmpeg.ts`)
- **State**: Zustand context provider (`src/lib/store.ts`) for builder UI, TanStack Query available in `src/lib/queries/`
- **Env validation**: Zod at boot via `src/lib/env.ts`. Server vars validated on import; client gets only `NEXT_PUBLIC_*` vars. Tests get defaults automatically when `VITEST` env is set.
- **Middleware**: `src/proxy.ts` handles CSRF + bot filtering on `/api/*` routes. Not a `middleware.ts` — it's a standalone proxy exported with a `config.matcher`.

## Key paths

- `src/app/` — pages + API routes
- `src/app/api/render/route.ts` — POST (validate, rate-limit, create job) + PUT (update progress)
- `src/lib/` — shared logic, schemas, types
- `src/lib/server/` — server-only: ffmpeg, Remotion render
- `src/remotion/` — Remotion video components (ArabicText, Card, OverlayLayer, etc.)
- `src/components/` — React components (VideoPreview, ExportModal, CustomizationPanel)
- `public/backgrounds/` — preset images + videos for video backgrounds

## Conventions

- **Path alias**: `@/*` → `./src/*`
- **shadcn/ui**: New York style, Lucide icons, CSS variables enabled (`components.json`)
- **Fonts**: 10 Google Fonts loaded in `layout.tsx` (Inter, 7 Arabic, 2 Bengali)
- **ESLint**: Very permissive — `no-explicit-any`, `no-unused-vars`, `react-hooks/exhaustive-deps` all off. Don't rely on lint to catch issues.
- **TypeScript**: `noImplicitAny: false`, `strict: true`. Types are loose by design.
- **Tests**: `*.test.ts` colocated with source. Coverage only for `src/lib/`. Test environment is `node` (not jsdom).
- **Background videos**: Must be normalized before use (`npm run normalize-bg` / `scripts/normalize-bg-video.sh`). Validates with `npm run validate-bg`.
- **Remotion render**: Uses pre-looped background videos via ffmpeg. The `AyatVideo` component reads `preLooped` prop to skip `<Loop>` wrapper when exporting.
- **Event listeners on Remotion Player**: Use `useEffect` with state flag pattern (not callback refs) to avoid "maximum update depth" errors. See `VideoPreview.tsx`.

## Gotchas

- The app has **two video render paths**: client-side (Canvas + MediaRecorder in ExportModal) and server-side (Remotion). They share `src/remotion/` components but have different font-size scaling formulas — preview/export mismatch is a known issue area.
- `sharp` is used server-only in Remotion render path. Don't import it from client components.
- The dev server logs to `dev.log` (via `tee`). Production logs to `server.log`.
- Background video presets are defined in `src/lib/backgroundPresets.ts`. Each video has a `safe` variant (normalized) and a raw variant.
