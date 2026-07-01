import { NextRequest, NextResponse } from 'next/server'
import { jobs } from '../render/route'

/**
 * GET /api/render-status?jobId=xxx
 *   → Returns { status: 'rendering' | 'done' | 'error', progress, downloadUrl }
 */
export async function GET(req: NextRequest) {
  const jobId = new URL(req.url).searchParams.get('jobId')
  if (!jobId) {
    return NextResponse.json({ error: 'Missing jobId' }, { status: 400 })
  }
  const job = jobs.get(jobId)
  if (!job) {
    return NextResponse.json({ error: 'Unknown jobId' }, { status: 404 })
  }
  return NextResponse.json({
    status: job.status,
    progress: job.progress,
    downloadUrl: job.downloadUrl,
    error: job.error,
  })
}
