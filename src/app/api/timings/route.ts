import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { fetchWithTimeout, isFetchAbort } from '@/lib/fetchWithTimeout'
import { consumeRateLimit, getClientIp } from '@/lib/rateLimit'
import { logger } from '@/lib/logger'
import { timingsQuerySchema } from '@/lib/schemas'
import { quranComVerseUrl } from '@/lib/fetchVerseTimings'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = await consumeRateLimit(
    `timings:${ip}`,
    env.TIMINGS_RATE_LIMIT_MAX,
    env.TIMINGS_RATE_LIMIT_WINDOW_MS,
  )
  if (!rl.ok) {
    logger.warn('timings rate limited', { ip, remaining: rl.remaining })
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again in a moment.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rl.resetMs - Date.now()) / 1000)),
        },
      },
    )
  }

  const parsedQuery = timingsQuerySchema.safeParse({
    surah: Number(req.nextUrl.searchParams.get('surah')),
    ayat: Number(req.nextUrl.searchParams.get('ayat')),
    recitationId: Number(req.nextUrl.searchParams.get('recitationId')),
  })
  if (!parsedQuery.success) {
    return NextResponse.json(
      {
        error: 'Invalid query parameters',
        details: parsedQuery.error.issues.map((i) => i.message),
      },
      { status: 400 },
    )
  }
  const { surah, ayat, recitationId } = parsedQuery.data

  const verseKey = `${surah}:${ayat}`
  const upstreamUrl = quranComVerseUrl(env.QURAN_COM_API_BASE_URL, surah, ayat, recitationId)

  try {
    const upstream = await fetchWithTimeout(upstreamUrl, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 86_400 },
    })
    if (!upstream.ok) {
      logger.warn('timings upstream non-200', {
        verseKey,
        recitationId,
        status: upstream.status,
      })
      return NextResponse.json(
        { error: `Upstream returned ${upstream.status}` },
        { status: 502 },
      )
    }
    const json = await upstream.json()
    return NextResponse.json(json, {
      headers: {
        'Cache-Control':
          'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    })
  } catch (err) {
    const reason = isFetchAbort(err) ? 'timeout' : 'network error'
    logger.error('timings fetch failed', {
      verseKey,
      recitationId,
      reason,
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json(
      { error: `Failed to fetch timings (${reason})` },
      { status: 504 },
    )
  }
}
