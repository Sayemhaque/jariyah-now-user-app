import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json(
    {
      name: 'Jariyah Now API',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        surahs: '/api/surahs',
        ayat: '/api/ayat',
        timings: '/api/timings',
      },
      docs: '/about',
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    },
  )
}
