import { NextRequest, NextResponse } from 'next/server'
import { getRenderProgress } from '@remotion/vercel'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const sandboxId = request.nextUrl.searchParams.get('sandboxId')
    const cmdId = request.nextUrl.searchParams.get('cmdId')

    if (!sandboxId || !cmdId) {
      return NextResponse.json({ error: 'sandboxId and cmdId are required' }, { status: 400 })
    }

    const progress = await getRenderProgress({ sandboxId, cmdId })

    return NextResponse.json(progress, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Progress check failed'
    console.error('[render/progress]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}