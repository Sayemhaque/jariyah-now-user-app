import { randomUUID } from 'node:crypto'
import { del, issueSignedToken, presignUrl, put } from '@vercel/blob'

const linkLifetimeMs = 60 * 60 * 1000

export async function withTemporaryVideoUrl<T>(video: Buffer, token: string, withUrl: (url: string) => Promise<T>): Promise<T> {
  const pathname = `reels-tmp/${randomUUID()}.mp4`
  const blob = await put(pathname, video, { access: 'private', contentType: 'video/mp4', token, addRandomSuffix: false })
  try {
    const validUntil = Date.now() + linkLifetimeMs
    const signed = await issueSignedToken({ token, pathname: blob.pathname, operations: ['get'], validUntil })
    const { presignedUrl } = await presignUrl(signed, { operation: 'get', pathname: blob.pathname, validUntil, access: 'private' })
    return await withUrl(presignedUrl)
  } finally {
    await del(blob.url, { token }).catch(() => undefined)
  }
}
