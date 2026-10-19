import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { fetchWithTimeout } from '@/lib/fetchWithTimeout'
import { consumeRateLimit, getClientIp } from '@/lib/rateLimit'
import { logger } from '@/lib/logger'
import { isAllowedAudioUrl, maxAudioBytes } from '@/lib/speech/audioSource'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url') ?? ''
  if (!isAllowedAudioUrl(url)) return NextResponse.json({ error: 'Audio host not allowed' }, { status: 400 })

  const rl = await consumeRateLimit(`audio:${getClientIp(req)}`, env.TIMINGS_RATE_LIMIT_MAX, env.TIMINGS_RATE_LIMIT_WINDOW_MS)
  if (!rl.ok) return NextResponse.json({ error: 'Rate limit exceeded. Try again in a moment.' }, { status: 429 })

  try {
    const upstream = await fetchWithTimeout(url)
    const size = Number(upstream.headers.get('content-length') ?? 0)
    if (!upstream.ok || !upstream.body || size > maxAudioBytes) {
      return NextResponse.json({ error: `Upstream returned ${upstream.status}` }, { status: 502 })
    }
    return new Response(upstream.body, {
      headers: {
        'Content-Type': upstream.headers.get('content-type') ?? 'audio/mpeg',
        'Cache-Control': 'public, s-maxage=604800, max-age=86400',
      },
    })
  } catch (err) {
    logger.warn('audio proxy failed', { url, error: err instanceof Error ? err.message : String(err) })
    return NextResponse.json({ error: 'Failed to fetch audio' }, { status: 504 })
  }
}
