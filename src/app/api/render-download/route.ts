import { createReadStream } from 'node:fs'
import { promises as fs } from 'node:fs'
import { Readable } from 'node:stream'

import { NextRequest } from 'next/server'

import { getRenderJob, verifyJobOwnership } from '@/lib/jobStore'
import { logger } from '@/lib/logger'
import { renderDownloadQuerySchema } from '@/lib/schemas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const parsed = renderDownloadQuerySchema.safeParse({
    jobId: req.nextUrl.searchParams.get('jobId'),
  })
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid query' },
      { status: 400 },
    )
  }

  const ownerToken = req.headers.get('x-owner-token')
  if (!ownerToken || !verifyJobOwnership(parsed.data.jobId, ownerToken)) {
    logger.warn('GET /api/render-download ownership check failed', {
      jobId: parsed.data.jobId,
      hasToken: Boolean(ownerToken),
    })
    return Response.json(
      { error: 'Forbidden — invalid or missing owner token' },
      { status: 403 },
    )
  }

  const job = getRenderJob(parsed.data.jobId)
  if (!job) {
    return Response.json({ error: 'Unknown jobId' }, { status: 404 })
  }
  if (job.status !== 'done' || !job.outputPath) {
    return Response.json({ error: 'Render is not ready yet' }, { status: 409 })
  }

  try {
    const stat = await fs.stat(job.outputPath)
    const stream = createReadStream(job.outputPath)
    return new Response(Readable.toWeb(stream) as ReadableStream, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': String(stat.size),
        'Content-Disposition': `attachment; filename="${job.id}.mp4"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    logger.error('render download file missing', {
      jobId: job.id,
      outputPath: job.outputPath,
      error: error instanceof Error ? error.message : String(error),
    })
    return Response.json(
      { error: 'Rendered file could not be found on disk' },
      { status: 410 },
    )
  }
}
