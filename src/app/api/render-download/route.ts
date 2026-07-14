import { createReadStream } from 'node:fs'
import { promises as fs } from 'node:fs'
import { Readable } from 'node:stream'

import { NextRequest } from 'next/server'

import { getRenderJob } from '@/lib/jobStore'
import { logger } from '@/lib/logger'
import { renderDownloadQuerySchema } from '@/lib/schemas'
import { validateQuery, requireOwnership } from '@/lib/route-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const q = validateQuery(
    { jobId: req.nextUrl.searchParams.get('jobId') },
    renderDownloadQuerySchema,
  )
  if (!q.ok) return q.error

  const ownershipErr = requireOwnership(q.value.jobId, req)
  if (ownershipErr) return ownershipErr

  const job = getRenderJob(q.value.jobId)
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
