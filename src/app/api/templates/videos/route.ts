import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
import { publishedTemplates } from '@/lib/templates/templateCatalog'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const token = env.BLOB_READ_WRITE_TOKEN
  if (!token) return NextResponse.json({ videos: [] })
  try {
    const videos = await publishedTemplates(token)
    return NextResponse.json({ videos }, { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1800' } })
  } catch (err) {
    logger.error('template list failed', { error: err instanceof Error ? err.message : String(err) })
    return NextResponse.json({ videos: [] }, { status: 502 })
  }
}
