import { NextRequest, NextResponse } from 'next/server'
import { get } from '@vercel/blob'
import { getEnv } from '@/lib/env'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
    }

    const env = getEnv()
    const blobToken = env.BLOB_READ_WRITE_TOKEN

    if (!blobToken) {
      return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN not configured' }, { status: 500 })
    }

    const statusBlob = await get(`jobs/${jobId}.json`, {
      access: 'private',
      token: blobToken,
    })

    if (!statusBlob) {
      return NextResponse.json(
        { stage: 'render-progress', overallProgress: 0.5 },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    }

    const data = await new Response(statusBlob.stream).json()

    if (data.status === 'done') {
      return NextResponse.json(
        { stage: 'done', url: `/api/render/download?jobId=${encodeURIComponent(jobId)}` },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    }

    return NextResponse.json(
      { stage: 'render-progress', overallProgress: 0.5 },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Progress check failed'
    console.error('[render/progress]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
