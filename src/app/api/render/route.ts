import { NextRequest, NextResponse } from 'next/server'
import type { z } from 'zod'
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
  createRenderJob,
  getRenderJob,
  updateRenderJob,
  computeDedupeHash,
  type RenderJob,
} from '@/lib/jobStore'
import { fetchWithTimeout } from '@/lib/fetchWithTimeout'

/**
 * POST /api/render
 *
 * Validates the render payload, rate-limits by IP, HEAD-checks each ayat MP3
 * on the Quran.com CDN so we can fail fast if the reciter's audio is missing,
 * then creates a job record and returns its ID.
 *
 * The actual MP4 rendering happens client-side (Canvas + MediaRecorder) in
 * this sandbox build — see ExportModal.tsx. In production this route would
 * enqueue a Remotion render job on a queue (Inngest / Trigger.dev / a worker
 * process) and return 202 immediately. The job-store + status-polling API
 * surface is identical either way, so swapping in a real queue later requires
 * no client-side changes.
 */
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
    slides: body.slides,
    reciterKey: body.reciterKey,
    orientation: body.orientation,
    settings: body.settings as Record<string, unknown>,
  })

  // --- HEAD-check each ayat MP3 on the CDN ----------------------------
  // Fail fast if the reciter's audio is missing — saves the client from
  // starting a render that will immediately fail when decodeAudioData bombs.
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

  return NextResponse.json(
    {
      jobId: job.id,
      audioCheck: audioChecks,
      note:
        'Rendering happens client-side via Canvas + MediaRecorder. PUT progress to /api/render to update the job.',
    },
    { status: 202 }, // Accepted — the work hasn't finished, but the job exists
  )
}

/**
 * PUT /api/render
 *
 * Allows the client to update an existing job's progress + final state.
 * The client-side renderer is the source of truth for progress; this route
 * just stores what it reports so a tab refocus / re-poll can recover state.
 */
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

  const existing = getRenderJob(body.jobId)
  if (!existing) {
    return NextResponse.json({ error: 'Unknown jobId' }, { status: 404 })
  }

  const updated = updateRenderJob(body.jobId, {
    status: body.status,
    progress: body.progress,
    downloadUrl: body.downloadUrl,
    error: body.error,
  })
  return NextResponse.json(updated satisfies RenderJob)
}
