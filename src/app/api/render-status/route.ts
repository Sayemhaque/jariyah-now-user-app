import { NextRequest, NextResponse } from 'next/server'
import { renderStatusQuerySchema } from '@/lib/schemas'
import { getRenderJob, verifyJobOwnership } from '@/lib/jobStore'
import { logger } from '@/lib/logger'

/**
 * GET /api/render-status?jobId=xxx
 *   → Returns { status: 'rendering' | 'done' | 'error', progress, downloadUrl }
 *
 * Requires the `x-owner-token` header matching the token returned at POST
 * time. Without it, anyone who guessed or enumerated a jobId could poll
 * another user's render status — a minor information disclosure, but one
 * we close now that jobIds are random UUIDs (not predictable, but still).
 *
 * Always fresh — no caching. The client polls this on a short interval while
 * a render is in flight, so a cached response would defeat the purpose.
 */
export async function GET(req: NextRequest) {
  const parsed = renderStatusQuerySchema.safeParse({
    jobId: req.nextUrl.searchParams.get('jobId'),
  })
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid query' },
      { status: 400 },
    )
  }

  const job = getRenderJob(parsed.data.jobId)
  if (!job) {
    return NextResponse.json({ error: 'Unknown jobId' }, { status: 404 })
  }

  // --- Ownership check ------------------------------------------------
  const ownerToken = req.headers.get('x-owner-token')
  if (!ownerToken || !verifyJobOwnership(parsed.data.jobId, ownerToken)) {
    logger.warn('GET /api/render-status ownership check failed', {
      jobId: parsed.data.jobId,
      hasToken: Boolean(ownerToken),
    })
    return NextResponse.json(
      { error: 'Forbidden — invalid or missing owner token' },
      { status: 403 },
    )
  }

  return NextResponse.json(
    {
      status: job.status,
      progress: job.progress,
      downloadUrl: job.downloadUrl,
      error: job.error,
    },
    // `no-store` is critical: progress changes every poll, and any
    // intermediate cache would make the bar look frozen.
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
