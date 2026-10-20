import { timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
import { findTextItem } from '@/lib/collections'
import { listRecordings, saveRecording } from '@/lib/recordings/blobRecordings'
import { audioExtension, maxRecordingBytes } from '@/lib/recordings/recordingPath'

export const runtime = 'nodejs'

const modeSchema = z.enum(['hadith', 'azkar'])

function sameKey(given: string, expected: string): boolean {
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

const fail = (error: string, status: number) => NextResponse.json({ error }, { status })

export async function GET(req: NextRequest) {
  const token = env.BLOB_READ_WRITE_TOKEN
  if (!token) return NextResponse.json({ recordings: [] })
  const mode = modeSchema.safeParse(req.nextUrl.searchParams.get('mode'))
  const recordings = await listRecordings(token, mode.success ? mode.data : undefined)
  return NextResponse.json({ recordings }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(req: NextRequest) {
  const token = env.BLOB_READ_WRITE_TOKEN
  const uploadKey = env.RECORDINGS_UPLOAD_KEY
  if (!token || !uploadKey) return fail('Recording uploads are not set up. Add BLOB_READ_WRITE_TOKEN and RECORDINGS_UPLOAD_KEY in Vercel.', 503)
  if (!sameKey(req.headers.get('x-upload-key') ?? '', uploadKey)) return fail('Wrong upload key', 401)

  const form = await req.formData().catch(() => null)
  const file = form?.get('file')
  const mode = modeSchema.safeParse(form?.get('mode'))
  const itemId = String(form?.get('itemId') ?? '')
  if (!(file instanceof Blob) || !mode.success || !findTextItem(mode.data, itemId)) return fail('Send a file, a mode and a known itemId', 400)
  if (file.size > maxRecordingBytes) return fail('Recording is larger than 4 MB', 413)
  const extension = audioExtension(file.type)
  if (!extension) return fail(`Unsupported audio type "${file.type}"`, 415)

  try {
    const recording = await saveRecording(token, mode.data, itemId, extension, file, file.type)
    return NextResponse.json({ recording })
  } catch (err) {
    logger.error('recording upload failed', { itemId, error: err instanceof Error ? err.message : String(err) })
    return fail('Upload failed', 502)
  }
}
