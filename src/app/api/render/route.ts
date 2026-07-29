import { NextResponse } from 'next/server'
import { renderVideoServer } from '@/lib/server-renderer/renderVideoServer'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const mp4Buffer = await renderVideoServer(body)
    const blob = new Blob([new Uint8Array(mp4Buffer)], { type: 'video/mp4' })

    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="jariyah-now-${Date.now()}.mp4"`,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Render failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
