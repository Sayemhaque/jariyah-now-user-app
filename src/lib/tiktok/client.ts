import type { CreatorInfo, TikTokPostForm } from './rules'

export class TikTokClientError extends Error {
  constructor(message: string, readonly code: string) {
    super(message)
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/tiktok/${path}`, { credentials: 'same-origin', ...init })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new TikTokClientError(json.error ?? 'TikTok request failed', json.code ?? 'unknown')
  return json as T
}

export const fetchCreator = () => call<{ creator: CreatorInfo }>('creator').then((r) => r.creator)

export const startTikTokPost = (jobId: string, form: TikTokPostForm) =>
  call<{ publishId: string }>('post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobId, form }),
  }).then((r) => r.publishId)

export const fetchTikTokStatus = (publishId: string) =>
  call<{ status: string; failReason: string | null }>(`status?publishId=${encodeURIComponent(publishId)}`)

export const disconnectTikTok = () => call<{ ok: boolean }>('logout', { method: 'POST' })

export const jobIdFromDownloadUrl = (url: string) => new URL(url, 'https://local').searchParams.get('jobId')

export const tiktokAuthKey = 'tiktok-auth'
