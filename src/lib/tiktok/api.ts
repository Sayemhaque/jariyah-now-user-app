import type { CreatorInfo } from './rules'

const apiBase = 'https://open.tiktokapis.com/v2'
export const tiktokScopes = ['user.info.basic', 'video.publish']

export interface TikTokApp {
  clientKey: string
  clientSecret: string
  redirectUri: string
}

export class TikTokApiError extends Error {
  constructor(message: string, readonly code: string, readonly status: number) {
    super(message)
  }
}

export function authorizeUrl(app: TikTokApp, state: string): string {
  const params = new URLSearchParams({ client_key: app.clientKey, scope: tiktokScopes.join(','), response_type: 'code', redirect_uri: app.redirectUri, state })
  return `https://www.tiktok.com/v2/auth/authorize/?${params}`
}

export async function exchangeCode(app: TikTokApp, code: string) {
  const res = await fetch(`${apiBase}/oauth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_key: app.clientKey, client_secret: app.clientSecret, code, grant_type: 'authorization_code', redirect_uri: app.redirectUri }),
  })
  const json = (await res.json()) as { access_token?: string; open_id?: string; expires_in?: number; error?: string; error_description?: string }
  if (!res.ok || !json.access_token || !json.open_id) {
    throw new TikTokApiError(json.error_description || json.error || 'TikTok login failed', json.error ?? 'token_error', res.status)
  }
  return { accessToken: json.access_token, openId: json.open_id, expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000 }
}

async function postJson<T>(path: string, accessToken: string, body: object): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(body),
  })
  const json = (await res.json().catch(() => ({}))) as { data?: T; error?: { code?: string; message?: string } }
  const code = json.error?.code ?? 'unknown'
  if (!res.ok || code !== 'ok') throw new TikTokApiError(json.error?.message || `TikTok request failed (${res.status})`, code, res.status)
  return json.data as T
}

interface RawCreatorInfo {
  creator_avatar_url: string
  creator_username: string
  creator_nickname: string
  privacy_level_options: string[]
  comment_disabled: boolean
  duet_disabled: boolean
  stitch_disabled: boolean
  max_video_post_duration_sec: number
}

export async function queryCreatorInfo(accessToken: string): Promise<CreatorInfo> {
  const raw = await postJson<RawCreatorInfo>('/post/publish/creator_info/query/', accessToken, {})
  return {
    avatarUrl: raw.creator_avatar_url,
    nickname: raw.creator_nickname,
    username: raw.creator_username,
    privacyOptions: raw.privacy_level_options,
    commentDisabled: raw.comment_disabled,
    duetDisabled: raw.duet_disabled,
    stitchDisabled: raw.stitch_disabled,
    maxDurationSec: raw.max_video_post_duration_sec,
  }
}

export async function startDirectPost(accessToken: string, postInfo: object, videoUrl: string): Promise<string> {
  const data = await postJson<{ publish_id: string }>('/post/publish/video/init/', accessToken, {
    post_info: postInfo,
    source_info: { source: 'PULL_FROM_URL', video_url: videoUrl },
  })
  return data.publish_id
}

export async function fetchPostStatus(accessToken: string, publishId: string) {
  const data = await postJson<{ status: string; fail_reason?: string }>('/post/publish/status/fetch/', accessToken, { publish_id: publishId })
  return { status: data.status, failReason: data.fail_reason ?? null }
}
