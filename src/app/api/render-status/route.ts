import { NextRequest, NextResponse } from 'next/server'
import { renderStatusQuerySchema } from '@/lib/schemas'
import { getRenderJob } from '@/lib/jobStore'
import { validateQuery, requireOwnership } from '@/lib/route-utils'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const q = validateQuery(
    { jobId: req.nextUrl.searchParams.get('jobId') },
    renderStatusQuerySchema,
  )
  if (!q.ok) return q.error

  const job = getRenderJob(q.value.jobId)
  if (!job) {
    return NextResponse.json({ error: 'Unknown jobId' }, { status: 404 })
  }

  const ownershipErr = requireOwnership(q.value.jobId, req)
  if (ownershipErr) return ownershipErr

  return NextResponse.json(
    {
      status: job.status,
      progress: job.progress,
      downloadUrl: job.downloadUrl,
      error: job.error,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
