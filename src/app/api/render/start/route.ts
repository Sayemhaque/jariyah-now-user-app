import { NextResponse } from 'next/server'
import { createSandbox, addBundleToSandbox, renderMediaOnVercel } from '@remotion/vercel'
import { getEnv } from '@/lib/env'
import { computeSlideFrames } from '@/lib/advanceTiming'
import { FPS } from '@/lib/constants'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

export const runtime = 'nodejs'
export const maxDuration = 300

const RES_MAP: Record<string, { w: number; h: number }> = {
  landscape: { w: 1280, h: 720 },
  portrait: { w: 720, h: 1280 },
}

const QUALITY_SCALE: Record<string, number> = {
  '480p': 0.667,
  '720p': 1,
  '1080p': 1.5,
}

function resolveBundleDir(): string {
  if (process.env.REMOTION_BUNDLE_DIR) {
    return process.env.REMOTION_BUNDLE_DIR
  }
  const candidates = [
    join(process.cwd(), '.next/server/remotion-bundle'),
    join(process.cwd(), '.next/remotion-bundle'),
    join(process.cwd(), '../.next/remotion-bundle'),
  ]
  for (const dir of candidates) {
    if (existsSync(dir)) return dir
  }
  return candidates[0]!
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { slides, settings, orientation, reciterName, attributionLine, surahName, surahNameArabic, totalAyats, quality } = body

    if (!slides?.length) {
      return NextResponse.json({ error: 'No slides provided' }, { status: 400 })
    }

    const { totalFrames } = computeSlideFrames(slides, FPS)
    if (totalFrames <= 0) {
      return NextResponse.json({ error: 'No frames to render' }, { status: 400 })
    }

    const qualityScale = QUALITY_SCALE[quality ?? '720p'] ?? 1
    const res = RES_MAP[orientation ?? 'portrait']!
    const W = Math.round(res.w * qualityScale) & ~1
    const H = Math.round(res.h * qualityScale) & ~1

    const sandbox = await createSandbox({
      resources: { vcpus: 4 },
      timeoutInMilliseconds: 300_000,
    })

    const bundleDir = resolveBundleDir()
    if (!existsSync(bundleDir)) {
      await sandbox.stop()
      return NextResponse.json({ error: `Remotion bundle not found at ${bundleDir}. Run 'npm run build:bundle' first.` }, { status: 500 })
    }

    await addBundleToSandbox({
      sandbox,
      bundleDir,
    })

    const inputProps = {
      slides,
      settings,
      orientation,
      reciterName,
      attributionLine,
      surahName,
      surahNameArabic,
      totalAyats,
      isExport: true,
    }

    const blobToken = getEnv().BLOB_READ_WRITE_TOKEN
    if (!blobToken) {
      await sandbox.stop()
      return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN is not configured' }, { status: 500 })
    }

    const { sandboxId, cmdId } = await renderMediaOnVercel({
      sandbox,
      compositionId: 'AyatVideo',
      inputProps,
      codec: 'h264',
      scale: qualityScale,
      frameRange: [0, totalFrames - 1],
      imageFormat: 'jpeg',
      enforceAudioTrack: true,
      logLevel: 'info',
      timeoutInMilliseconds: 120_000,
      detached: true,
      vercelBlob: {
        blobToken,
        access: 'public',
      },
      detachedSandboxTimeoutInMilliseconds: 600_000,
    })

    return NextResponse.json({
      jobId: sandboxId,
      sandboxId,
      cmdId,
      totalFrames,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Render start failed'
    console.error('[render/start]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}