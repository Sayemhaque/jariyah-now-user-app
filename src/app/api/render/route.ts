import { NextRequest, NextResponse } from 'next/server'
import type { z } from 'zod'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
import {
  renderBodySchema,
  renderUpdateBodySchema,
  type RenderBody,
} from '@/lib/schemas'
import {
  consumeRateLimit,
  getClientIp,
} from '@/lib/rateLimit'
import {
  claimRenderJobStart,
  createRenderJob,
  verifyJobOwnership,
  updateRenderJob,
  computeDedupeHash,
} from '@/lib/jobStore'
import { fetchWithTimeout } from '@/lib/fetchWithTimeout'

export const runtime = 'nodejs'

function renderToDownloadUrl(jobId: string): string {
  return `/api/render-download?jobId=${encodeURIComponent(jobId)}`
}

async function remotionRenderJob(jobId: string, body: RenderBody): Promise<void> {
  const { renderWithRemotion } = await import('@/lib/server/renderWithRemotion')
  const outputPath = path.join(os.tmpdir(), `jariyahnow-render-${jobId}`, 'final.mp4')

  try {
    await fs.mkdir(path.dirname(outputPath), { recursive: true })

    const slides = body.slides.map((s) => ({
      arabicText: s.arabicText,
      translation: s.translation,
      transliteration: s.transliteration ?? '',
      surahName: s.surahName,
      surahNameArabic: s.surahNameArabic,
      ayatNumber: s.ayatNumber,
      surahNumber: s.surahNumber,
      audioUrl: s.audioUrl,
      audioDurationMs: s.audioDurationMs,
    }))

    const inputProps: Record<string, unknown> = {
      slides,
      settings: body.settings as Record<string, unknown>,
      orientation: body.orientation,
      reciterName: body.reciterName,
      attributionLine: body.attributionLine,
      surahName: body.slides[0]?.surahName ?? '',
      surahNameArabic: body.slides[0]?.surahNameArabic ?? '',
      totalAyats: body.slides.length,
      isExport: true,
    }

    await renderWithRemotion(inputProps, outputPath, (progress) => {
      updateRenderJob(jobId, { status: 'rendering', progress })
    })

    const workspaceDir = path.dirname(outputPath)
    const outputFilename = path.basename(outputPath)

    const otherFiles = await fs.readdir(workspaceDir)
    await Promise.all(
      otherFiles
        .filter((f) => f !== outputFilename)
        .map((f) => fs.rm(path.join(workspaceDir, f), { force: true })),
    )

    updateRenderJob(jobId, {
      status: 'done',
      progress: 1,
      outputPath,
      downloadUrl: renderToDownloadUrl(jobId),
    })
  } catch (error) {
    logger.error('remotion render failed', {
      jobId,
      error: error instanceof Error ? error.message : String(error),
    })
    updateRenderJob(jobId, {
      status: 'error',
      progress: 0,
      error: 'Render failed: ' + (error instanceof Error ? error.message : String(error)),
    })
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const requestId = req.headers.get('x-request-id') ?? `req_${Date.now().toString(36)}`

  // --- Rate limit -----------------------------------------------------
  const rl = await consumeRateLimit(ip)
  if (!rl.ok) {
    logger.warn('render rate limited', { ip, requestId, remaining: rl.remaining })
    return NextResponse.json(
      {
        error: `Rate limit exceeded: max ${env.RENDER_RATE_LIMIT_MAX} renders per hour per IP.`,
        retryAfterMs: rl.resetMs - Date.now(),
      },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.resetMs - Date.now()) / 1000)) },
      },
    )
  }

  // --- Parse + validate body ------------------------------------------
  let body: RenderBody
  try {
    const json = await req.json()
    const parsed = renderBodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: parsed.error.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 },
      )
    }
    body = parsed.data
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // --- Idempotency: dedupe by payload hash ----------------------------
  const dedupeHash = computeDedupeHash({
    slides: body.slides.map((s) => ({
      surahNumber: s.surahNumber,
      ayatNumber: s.ayatNumber,
      audioUrl: s.audioUrl,
    })),
    reciterKey: body.reciterKey,
    orientation: body.orientation,
    settings: {
      ...(body.settings as Record<string, unknown>),
      quality: body.quality,
      reciterName: body.reciterName,
      attributionLine: body.attributionLine,
    },
  })

  // --- HEAD-check each ayat MP3 on the CDN ----------------------------
  const audioChecks = await Promise.all(
    body.slides.map(async (s) => {
      try {
        const r = await fetchWithTimeout(s.audioUrl, { method: 'HEAD' })
        return { url: s.audioUrl, ok: r.ok, status: r.status }
      } catch {
        return { url: s.audioUrl, ok: false }
      }
    }),
  )
  const allMissing = audioChecks.every((c) => !c.ok)
  if (allMissing) {
    logger.warn('all ayat audio missing on CDN', {
      ip,
      requestId,
      reciterKey: body.reciterKey,
    })
    return NextResponse.json(
      {
        error:
          'Could not reach the reciter audio on the Quran.com CDN. Try a different reciter.',
      },
      { status: 502 },
    )
  }

  // --- Create job (idempotent) ----------------------------------------
  const job = createRenderJob(dedupeHash)

  logger.info('render job created', {
    jobId: job.id,
    ip,
    requestId,
    reciterKey: body.reciterKey,
    slideCount: body.slides.length,
    audioOk: audioChecks.filter((c) => c.ok).length,
  })

  if (claimRenderJobStart(job.id)) {
    void remotionRenderJob(job.id, body)
  }

  return NextResponse.json(
    {
      jobId: job.id,
      ownerToken: job.ownerToken,
      audioCheck: audioChecks,
      note: 'Server-side render started. Poll /api/render-status with the owner token for progress.',
    },
    { status: 202 },
  )
}

export async function PUT(req: NextRequest) {
  let body: z.infer<typeof renderUpdateBodySchema>
  try {
    const json = await req.json()
    const parsed = renderUpdateBodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid body', details: parsed.error.issues },
        { status: 400 },
      )
    }
    body = parsed.data
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const ownerToken = req.headers.get('x-owner-token')
  if (!ownerToken || !verifyJobOwnership(body.jobId, ownerToken)) {
    logger.warn('PUT /api/render ownership check failed', {
      jobId: body.jobId,
      hasToken: Boolean(ownerToken),
    })
    return NextResponse.json(
      { error: 'Forbidden — invalid or missing owner token' },
      { status: 403 },
    )
  }

  const updated = updateRenderJob(body.jobId, {
    status: body.status,
    progress: body.progress,
    downloadUrl: body.downloadUrl,
    error: body.error,
  })
  if (!updated) {
    return NextResponse.json({ error: 'Unknown jobId' }, { status: 404 })
  }
  const { ownerToken: _omit, ...safe } = updated
  return NextResponse.json(safe)
}
