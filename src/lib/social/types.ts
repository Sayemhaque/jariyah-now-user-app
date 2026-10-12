import type { PostMetadata } from '@/lib/daily/plan'

export type Platform = 'youtube' | 'facebook' | 'instagram' | 'tiktok'

export const ALL_PLATFORMS: Platform[] = ['youtube', 'facebook', 'instagram', 'tiktok']

export interface UploadInput {
  video: Buffer
  meta: PostMetadata
}

export interface UploadResult {
  platform: Platform
  id: string
  url?: string
  note?: string
}

/** Throws with the response body when `res` is not 2xx. */
export async function expectOk(res: Response, label: string): Promise<Response> {
  if (res.ok) return res
  const body = await res.text().catch(() => '')
  throw new Error(`${label} failed (${res.status}): ${body.slice(0, 1000)}`)
}

export async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms))
}
