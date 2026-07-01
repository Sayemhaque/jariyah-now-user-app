import { NextRequest, NextResponse } from 'next/server'
import { renderStatusQuerySchema } from '@/lib/schemas'
import { getRenderJob } from '@/lib/jobStore'

/**
 * GET /api/render-status?jobId=xxx
 *   → Returns { status: 'rendering' | 'done' | 'error', progress, downloadUrl }
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
