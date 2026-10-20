import { randomUUID } from 'node:crypto'
import { del, issueSignedToken, presignUrl, put } from '@vercel/blob'

const linkLifetimeMs = 60 * 60 * 1000

export interface TemporaryFile {
  data: Buffer
  contentType: string
  extension: string
}

async function presigned(pathname: string, token: string): Promise<string> {
  const validUntil = Date.now() + linkLifetimeMs
  const signed = await issueSignedToken({ token, pathname, operations: ['get'], validUntil })
  const { presignedUrl } = await presignUrl(signed, { operation: 'get', pathname, validUntil, access: 'private' })
  return presignedUrl
}

export async function withTemporaryUrls<T>(files: TemporaryFile[], token: string, withUrls: (urls: string[]) => Promise<T>): Promise<T> {
  const folder = `reels-tmp/${randomUUID()}`
  const blobs = await Promise.all(
    files.map((file, i) => put(`${folder}/${i + 1}.${file.extension}`, file.data, { access: 'private', contentType: file.contentType, token, addRandomSuffix: false })),
  )
  try {
    return await withUrls(await Promise.all(blobs.map((b) => presigned(b.pathname, token))))
  } finally {
    await Promise.all(blobs.map((b) => del(b.url, { token }).catch(() => undefined)))
  }
}

export async function withTemporaryVideoUrl<T>(video: Buffer, token: string, withUrl: (url: string) => Promise<T>): Promise<T> {
  return withTemporaryUrls([{ data: video, contentType: 'video/mp4', extension: 'mp4' }], token, ([url]) => withUrl(url!))
}
