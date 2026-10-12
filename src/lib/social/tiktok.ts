/**
 * TikTok upload via the Content Posting API (Direct Post, FILE_UPLOAD).
 *
 * Requires a TikTok developer app with the `video.publish` scope. Until the
 * app passes TikTok's audit, posts are restricted to SELF_ONLY (private).
 */
import type { TikTokConfig } from './config'
import { expectOk, sleep, type UploadInput, type UploadResult } from './types'

const API = 'https://open.tiktokapis.com/v2'
const MB = 1024 * 1024

/**
 * TikTok chunk rules: a file ≤ 64 MB may go in one chunk; otherwise chunks
 * are 5–64 MB and the final chunk absorbs the remainder (up to 128 MB).
 */
export function tiktokChunkPlan(size: number, chunkSize = 10 * MB): { chunkSize: number; count: number } {
  if (size <= 64 * MB) return { chunkSize: size, count: 1 }
  return { chunkSize, count: Math.floor(size / chunkSize) }
}

export async function refreshTikTokToken(
  cfg: TikTokConfig,
): Promise<{ accessToken: string; refreshToken?: string }> {
  const res = await expectOk(
    await fetch(`${API}/oauth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: cfg.clientKey,
        client_secret: cfg.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: cfg.refreshToken,
      }),
    }),
    'TikTok token refresh',
  )
  const json = (await res.json()) as { access_token?: string; refresh_token?: string; error_description?: string }
  if (!json.access_token) throw new Error(`TikTok token refresh failed: ${json.error_description ?? 'no access_token'}`)
  return { accessToken: json.access_token, refreshToken: json.refresh_token }
}

export async function uploadToTikTok(cfg: TikTokConfig, input: UploadInput): Promise<UploadResult> {
  const { accessToken, refreshToken } = await refreshTikTokToken(cfg)
  const rotated = Boolean(refreshToken && refreshToken !== cfg.refreshToken)

  const size = input.video.length
  const plan = tiktokChunkPlan(size)

  const initRes = await expectOk(
    await fetch(`${API}/post/publish/video/init/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        post_info: {
          title: input.meta.shortCaption.slice(0, 2200),
          privacy_level: cfg.privacyLevel,
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
        },
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: size,
          chunk_size: plan.chunkSize,
          total_chunk_count: plan.count,
        },
      }),
    }),
    'TikTok publish init',
  )
  const init = (await initRes.json()) as {
    data?: { publish_id?: string; upload_url?: string }
    error?: { code?: string; message?: string }
  }
  const publishId = init.data?.publish_id
  const uploadUrl = init.data?.upload_url
  if (!publishId || !uploadUrl) {
    throw new Error(`TikTok publish init failed: ${init.error?.code} ${init.error?.message ?? ''}`)
  }

  for (let i = 0; i < plan.count; i++) {
    const start = i * plan.chunkSize
    const end = i === plan.count - 1 ? size : start + plan.chunkSize
    await expectOk(
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': String(end - start),
          'Content-Range': `bytes ${start}-${end - 1}/${size}`,
        },
        body: new Uint8Array(input.video.subarray(start, end)),
      }),
      `TikTok chunk ${i + 1}/${plan.count}`,
    )
  }

  // Poll until TikTok finishes processing.
  let status = 'PROCESSING_UPLOAD'
  for (let i = 0; i < 60 && !['PUBLISH_COMPLETE', 'FAILED', 'SEND_TO_USER_INBOX'].includes(status); i++) {
    await sleep(10_000)
    const res = await expectOk(
      await fetch(`${API}/post/publish/status/fetch/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({ publish_id: publishId }),
      }),
      'TikTok status',
    )
    const s = (await res.json()) as { data?: { status?: string; fail_reason?: string } }
    status = s.data?.status ?? status
    if (status === 'FAILED') throw new Error(`TikTok publish failed: ${s.data?.fail_reason ?? 'unknown'}`)
  }

  const notes = [`status: ${status}`]
  if (rotated) {
    notes.push('TikTok issued a new refresh token — update the TIKTOK_REFRESH_TOKEN secret')
  }
  return { platform: 'tiktok', id: publishId, note: notes.join('; ') }
}
