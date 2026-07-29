# Vercel Sandbox Render Implementation Plan

## Architecture Overview

The Vercel Sandbox approach replaces the current **synchronous ffmpeg render** (`renderVideoServer`) with a **detached Remotion render** that runs inside a Firecracker MicroVM on Vercel's infrastructure. The render result auto-uploads to Vercel Blob, and the client polls for completion.

```
Client                      Next.js API                    Vercel Sandbox
  │                              │                              │
  │  POST /api/render/start      │                              │
  │ ─────────────────────────►   │  createSandbox()             │
  │                              │ ──────────────────────────►  │
  │                              │  addBundleToSandbox()        │
  │                              │ ──────────────────────────►  │
  │                              │  renderMediaOnVercel(        │
  │                              │    detached: true,           │
  │                              │    vercelBlob: {...}         │
  │                              │  ) ──────────────────────►   │
  │   { jobId, sandboxId, cmdId }│                              │
  │ ◄─────────────────────────  │                              │
  │                              │                              │
  │  GET /api/render/progress    │                              │
  │    ?jobId=xxx                │                              │
  │ ─────────────────────────►   │  getRenderProgress()         │
  │                              │ ──────────────────────────►  │
  │   { stage: "done",           │                              │
  │     url: "...",              │                              │
  │     size: 12345 }            │                              │
  │ ◄─────────────────────────  │                              │
  │                              │                              │
  │  Download MP4 from blob URL  │                              │
  │ ───────────────────────────────────────────────────────►   │
```

## Key Constraint

`bundle()` from `@remotion/bundler` **cannot run inside a serverless function** (Vercel's 50MB limit, no webpack in bundled code). We must pre-bundle during build.

## Step-by-Step

### Step 1: Create Build Script for Remotion Bundle

**File: `scripts/build-remotion-bundle.ts`**

```ts
import { bundle } from '@remotion/bundler'
import path from 'path'

const serveUrl = await bundle({
  entryPoint: path.join(process.cwd(), 'src/remotion/index.ts'),
  webpackOverride: (config) => config,
})
console.log(serveUrl) // prints the output dir
```

Add to `package.json` scripts:
```json
"build:bundle": "npx tsx scripts/build-remotion-bundle.ts"
```

Create `src/remotion/index.ts` entry point with `registerRoot()`.

### Step 2: Add `steps` route to serve the bundle

**File: `src/app/api/render/start/route.ts`**

Uses `@remotion/vercel` functions:
1. `createSandbox()` — provisions the sandbox (takes ~5 min first time, then ~1 min for warm)
2. Read pre-built bundle from disk
3. `addBundleToSandbox({ sandbox, bundleDir })` — copies bundle into sandbox
4. `renderMediaOnVercel({ sandbox, detached: true, vercelBlob: { blobToken, access: 'public' } })` — starts detached render
5. Store `{ sandboxId, cmdId }` with a job ID in a lightweight store (Upstash Redis or in-memory Map)
6. Return `{ jobId }` immediately

### Step 3: Progress Polling Endpoint

**File: `src/app/api/render/progress/route.ts`**

Uses `getRenderProgress({ sandboxId, cmdId })` from `@remotion/vercel`. Returns the full `RenderProgress` object. The client polls every 1-2s.

Stages the client renders:
- `starting` → `composing` phase in UI
- `opening-browser` → `uploading` phase
- `render-progress` → `encoding` phase (maps internal progress to 0-100%)
- `uploading` → `finalizing` phase
- `done` → shows download button with blob URL
- `error` → shows error
- `expired` → shows "sandbox expired" error

### Step 4: Update ExportModal

Replace the current single-request flow (`POST /api/render` → blob) with a two-step flow:
1. `POST /api/render/start` → gets `jobId`
2. Poll `GET /api/render/progress?jobId=xxx` every 1.5s
3. When `stage === 'done'`, show download button pointing to `url`
4. Phase mapping:
   - `starting` → `composing`
   - `opening-browser` / `selecting-composition` → `uploading`
   - `render-progress` → `encoding`
   - `uploading` → `finalizing`
   - `done` → show download
   - `error` / `expired` → show error

### Step 5: Environment Variables

Add to `.env`:
```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
VERCEL_TEAM_ID=team_...
VERCEL_PROJECT_ID=prj_...
VERCEL_TOKEN=...
```

For dev (local sandbox testing), the SDK auto-authenticates via `vercel env pull`.

### Step 6: Update `src/lib/env.ts`

Add `BLOB_READ_WRITE_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT_ID`, and `VERCEL_TOKEN` to the env schema.

## File Changes Summary

| Action | File | Purpose |
|--------|------|---------|
| **Create** | `src/remotion/index.ts` | Remotion entry point with `registerRoot()` |
| **Create** | `scripts/build-remotion-bundle.ts` | Build script for pre-bundling |
| **Create** | `src/app/api/render/start/route.ts` | POST endpoint to start sandbox render |
| **Create** | `src/app/api/render/progress/route.ts` | GET endpoint to poll render progress |
| **Modify** | `src/components/ExportModal.tsx` | Polling flow + blob download link |
| **Modify** | `src/lib/env.ts` | Add blob/sandbox env vars |
| **Modify** | `package.json` | Add `build:bundle` script |
| **Keep** | `src/app/api/render/route.ts` | Backward compat for simple server-renderer (or remove) |
| **Keep** | `src/lib/server-renderer/` | Still used as fallback render path |

## Phase 1 Verification (Already Done)

- `renderVideo.ts` — correct `new VideoFrame(canvas, {...})` ✓
- `VideoPreview.tsx` — stable `RenderLoadingIndicator` ref, correct effect pattern ✓
- `VideoComposer.ts` — try/catch on `createImageBitmap` ✓

## Risks & Mitigations

1. **Sandbox creation is slow (~5 min)**: Use `detachedSandboxTimeoutInMilliseconds` to keep it alive. Consider sandbox pooling for production.
2. **Sandbox cold start**: First render will be slow. Subsequent renders reuse warm sandbox.
3. **bundle() can't run in serverless**: Mitigated by pre-building during `next build`.
4. **Blob token rotation**: The token in `.env` must be kept in sync.
5. **Cost**: Each sandbox uses vCPU hours. Clean up stopped sandboxes.
6. **`@remotion/bundler` version mismatch**: The bundler version must match `@remotion/vercel` — currently both `^4.0.501` but this needs exact pinning.