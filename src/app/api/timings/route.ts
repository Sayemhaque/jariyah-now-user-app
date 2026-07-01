import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { fetchWithTimeout, isFetchAbort } from '@/lib/fetchWithTimeout'
import { logger } from '@/lib/logger'
import { timingsQuerySchema } from '@/lib/schemas'

/**
 * Proxy for the Quran.com word-timing API. The browser cannot call
 * api.quran.com directly because of CORS, so we re-issue the request
 * server-side and pass the JSON back unchanged.
 *
 * Query params (validated with zod):
 *   surah        — surah number (1-114)
 *   ayat         — ayat number within the surah
 *   recitationId — Quran.com recitation id (1, 2, 5, 6, 7 are common)
 */
export async function GET(req: NextRequest) {
  // --- Validate input -------------------------------------------------
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

  // --- Build upstream URL ---------------------------------------------
  const verseKey = `${surah}:${ayat}`
  const upstreamUrl = new URL(
    `${env.QURAN_COM_API_BASE_URL}/verses/by_key/${verseKey}`,
  )
  upstreamUrl.searchParams.set('words', 'true')
  upstreamUrl.searchParams.set(
    'word_fields',
    'text_uthmani,location,transliteration,position',
  )
  upstreamUrl.searchParams.set('audio_recitation', String(recitationId))

  // --- Fetch with timeout ---------------------------------------------
  try {
    const upstream = await fetchWithTimeout(upstreamUrl.toString(), {
      headers: { Accept: 'application/json' },
      // Word timings never change for a given reciter — cache at the edge
      // for 24h, then serve stale for up to a week while revalidating.
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
    // Timeout or network failure — degrade gracefully. The client treats an
    // empty word list as "no highlighting" and still renders the ayat.
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
