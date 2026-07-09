import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { fetchWithTimeout } from '@/lib/fetchWithTimeout'
import { parseUmmahSurahsResponse, ummahHeaders } from '@/lib/quranApi'
import { logger } from '@/lib/logger'
import { SURAHS_FALLBACK } from '@/lib/surahs-fallback'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const res = await fetchWithTimeout(`${env.UMMAHAPI_BASE_URL}/quran/surahs`, {
      headers: ummahHeaders(),
      next: { revalidate: 86_400 },
    })
    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${res.status}`, surahs: SURAHS_FALLBACK },
        {
          status: 502,
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
          },
        },
      )
    }

    const json = await res.json()
    const surahs = parseUmmahSurahsResponse(json)
    if (!surahs.length) {
      return NextResponse.json(
        { surahs: SURAHS_FALLBACK },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
          },
        },
      )
    }

    return NextResponse.json(
      { surahs },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        },
      },
    )
  } catch (err) {
    logger.warn('GET /api/surahs failed', {
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json(
      { surahs: SURAHS_FALLBACK },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
        },
      },
    )
  }
}
