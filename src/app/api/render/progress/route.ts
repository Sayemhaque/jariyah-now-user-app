import { NextRequest, NextResponse } from 'next/server'
import { getJob } from '@/lib/renderJobStore'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
    }

    const job = getJob(jobId)
    if (!job) {
      return NextResponse.json({ error: 'Unknown job' }, { status: 404 })
    }

    switch (job.status) {
      case 'pending':
      case 'rendering':
        return NextResponse.json(
          { stage: 'render-progress', overallProgress: 0.5 },
          { headers: { 'Cache-Control': 'no-store' } },
        )
      case 'done':
        return NextResponse.json(
          { stage: 'done', url: job.url },
          { headers: { 'Cache-Control': 'no-store' } },
        )
      case 'error':
        return NextResponse.json(
          { stage: 'error', message: job.error ?? 'Render failed' },
          { headers: { 'Cache-Control': 'no-store' } },
        )
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Progress check failed'
    console.error('[render/progress]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
