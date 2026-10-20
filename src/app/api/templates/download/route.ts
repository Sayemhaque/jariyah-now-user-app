import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { presignedBlobUrl } from '@/lib/blobUrls'
import { findVideoTemplate, templateVideoPath } from '@/lib/templates/videoTemplates'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const token = env.BLOB_READ_WRITE_TOKEN
  const template = findVideoTemplate(req.nextUrl.searchParams.get('key') ?? '')
  if (!template) return NextResponse.json({ error: 'Unknown video' }, { status: 404 })
  if (!token) return NextResponse.json({ error: 'Video storage is not set up' }, { status: 503 })
  return NextResponse.redirect(await presignedBlobUrl(templateVideoPath(template.key), token, 30 * 60 * 1000), 302)
}
