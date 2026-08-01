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
      return NextResponse.json({ error: 'Unknown job' }, { status: 404 })
    }

    const status = await new Response(statusBlob.stream).json()
    if (status.status !== 'done') {
      return NextResponse.json({ error: 'Render not finished' }, { status: 409 })
    }

    const videoBlob = await get(`exports/${jobId}.mp4`, {
      access: 'private',
      token: blobToken,
    })

    if (!videoBlob) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    return new Response(videoBlob.stream, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': String(videoBlob.blob.size ?? 0),
        'Content-Disposition': 'attachment; filename="video.mp4"',
        'Cache-Control': 'private, no-cache',
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Download failed'
    console.error('[render/download]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
