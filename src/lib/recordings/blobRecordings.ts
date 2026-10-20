import { del, issueSignedToken, list, presignUrl, put } from '@vercel/blob'
import type { TextMode } from '@/lib/collections/types'
import { parseRecordingPath, recordingPath, recordingsPrefix, type RecordingKey } from './recordingPath'

const linkLifetimeMs = 24 * 60 * 60 * 1000

export interface StoredRecording extends RecordingKey {
  url: string
  uploadedAt: string
}

async function signedUrl(pathname: string, token: string): Promise<string> {
  const validUntil = Date.now() + linkLifetimeMs
  const signed = await issueSignedToken({ token, pathname, operations: ['get'], validUntil })
  const { presignedUrl } = await presignUrl(signed, { operation: 'get', pathname, validUntil, access: 'private' })
  return presignedUrl
}

export async function saveRecording(token: string, mode: TextMode, itemId: string, extension: string, body: Blob, contentType: string): Promise<StoredRecording> {
  const pathname = recordingPath(mode, itemId, extension)
  await removeOtherFormats(token, mode, itemId, pathname)
  const blob = await put(pathname, body, { access: 'private', contentType, token, addRandomSuffix: false, allowOverwrite: true })
  return { mode, itemId, url: await signedUrl(blob.pathname, token), uploadedAt: new Date().toISOString() }
}

async function removeOtherFormats(token: string, mode: TextMode, itemId: string, keep: string) {
  const { blobs } = await list({ token, prefix: `${recordingsPrefix}${mode}/${itemId}.` })
  await Promise.all(blobs.filter((b) => b.pathname !== keep).map((b) => del(b.url, { token })))
}

export async function listRecordings(token: string, mode?: TextMode): Promise<StoredRecording[]> {
  const { blobs } = await list({ token, prefix: mode ? `${recordingsPrefix}${mode}/` : recordingsPrefix, limit: 1000 })
  const stored = blobs.flatMap((b) => {
    const key = parseRecordingPath(b.pathname)
    return key ? [{ key, pathname: b.pathname, uploadedAt: new Date(b.uploadedAt).toISOString() }] : []
  })
  return Promise.all(stored.map(async (s) => ({ ...s.key, uploadedAt: s.uploadedAt, url: await signedUrl(s.pathname, token) })))
}
