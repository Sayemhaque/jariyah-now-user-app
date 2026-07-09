import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { env } from '@/lib/env'
import { fetchWithTimeout } from '@/lib/fetchWithTimeout'
import { ummahHeaders } from '@/lib/quranApi'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

const ayatQuerySchema = z.object({
  surah: z.coerce.number().int().min(1).max(114),
  ayat: z.coerce.number().int().min(1),
  translation: z.string().min(1).default('bengali'),
  script: z.enum(['uthmani', 'indopak']).default('uthmani'),
})

export async function GET(req: NextRequest) {
  const parsed = ayatQuerySchema.safeParse({
    surah: req.nextUrl.searchParams.get('surah'),
    ayat: req.nextUrl.searchParams.get('ayat'),
    translation: req.nextUrl.searchParams.get('translation') ?? 'bengali',
    script: req.nextUrl.searchParams.get('script') ?? 'uthmani',
  })

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid query parameters',
        details: parsed.error.issues.map((issue) => issue.message),
      },
      { status: 400 },
    )
  }

  const { surah, ayat, translation, script } = parsed.data
  const upstreamUrl = `${env.UMMAHAPI_BASE_URL}/quran/surah/${surah}/ayah/${ayat}?translation=${encodeURIComponent(
    translation,
  )}&script=${script}`

  try {
    const upstream = await fetchWithTimeout(upstreamUrl, {
      headers: ummahHeaders(),
      next: { revalidate: 604_800 },
    })

    if (!upstream.ok) {
      logger.warn('GET /api/ayat upstream non-200', {
        surah,
        ayat,
        translation,
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
        'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=864000',
      },
    })
  } catch (err) {
    logger.error('GET /api/ayat fetch failed', {
      surah,
      ayat,
      translation,
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json(
      { error: 'Failed to fetch ayat data' },
      { status: 504 },
    )
  }
}
