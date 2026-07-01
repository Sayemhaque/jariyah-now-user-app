import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxy for the Quran.com word-timing API.
 * The browser cannot call api.quran.com directly because of CORS, so we
 * re-issue the request server-side and pass the JSON back unchanged.
 *
 * Query params:
 *   surah        — surah number (1-114)
 *   ayat         — ayat number within the surah
 *   recitationId — Quran.com recitation id (1,2,5,6,7 are common)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const surah = searchParams.get('surah')
  const ayat = searchParams.get('ayat')
  const recitationId = searchParams.get('recitationId')

  if (!surah || !ayat || !recitationId) {
    return NextResponse.json(
      { error: 'Missing surah, ayat, or recitationId' },
      { status: 400 },
    )
  }

  const sNum = Number(surah)
  const aNum = Number(ayat)
  if (!Number.isFinite(sNum) || !Number.isFinite(aNum) || sNum < 1 || sNum > 114 || aNum < 1) {
    return NextResponse.json({ error: 'Invalid surah or ayat' }, { status: 400 })
  }

  const verseKey = `${sNum}:${aNum}`
  const url = new URL('https://api.quran.com/api/v4/verses/by_key/' + verseKey)
  url.searchParams.set('words', 'true')
  url.searchParams.set(
    'word_fields',
    'text_uthmani,location,transliteration,position',
  )
  url.searchParams.set('audio_recitation', recitationId)

  try {
    const upstream = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      next: { revalidate: 86400 },
    })
    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${upstream.status}` },
        { status: 502 },
      )
    }
    const json = await upstream.json()
    return NextResponse.json(json, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Failed to fetch timings' },
      { status: 500 },
    )
  }
}
