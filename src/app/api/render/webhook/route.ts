import { NextRequest, NextResponse } from 'next/server'
import { updateJob } from '@/lib/renderJobStore'

export async function POST(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get('jobId')
    const url = request.nextUrl.searchParams.get('url')

    if (!jobId || !url) {
      return NextResponse.json({ error: 'jobId and url are required' }, { status: 400 })
    }

    const job = updateJob(jobId, { status: 'done', url })
    if (!job) {
      return NextResponse.json({ error: 'Unknown job' }, { status: 404 })
    }

    console.log(`[webhook] Job ${jobId} completed: ${url}`)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Webhook failed'
    console.error('[render/webhook]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
