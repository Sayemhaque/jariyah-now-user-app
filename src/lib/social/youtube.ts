/**
 * YouTube Shorts upload via the YouTube Data API v3 resumable upload.
 * A vertical video ≤ 3 minutes is automatically classified as a Short.
 *
 * Note: until your Google Cloud project passes YouTube's API audit, videos
 * uploaded through the API are locked to private regardless of privacyStatus.
 */
import type { YouTubeConfig } from './config'
import { expectOk, type UploadInput, type UploadResult } from './types'

export async function getGoogleAccessToken(cfg: YouTubeConfig): Promise<string> {
  const res = await expectOk(
    await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        refresh_token: cfg.refreshToken,
        grant_type: 'refresh_token',
      }),
    }),
    'YouTube token refresh',
  )
  const json = (await res.json()) as { access_token?: string }
  if (!json.access_token) throw new Error('YouTube token refresh returned no access_token')
  return json.access_token
}

export async function uploadToYouTube(cfg: YouTubeConfig, input: UploadInput): Promise<UploadResult> {
  const token = await getGoogleAccessToken(cfg)
  const { meta, video } = input

  const init = await expectOk(
    await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Length': String(video.length),
          'X-Upload-Content-Type': 'video/mp4',
        },
        body: JSON.stringify({
          snippet: {
            title: meta.title,
            description: meta.description,
            tags: meta.hashtags.map((h) => h.replace(/^#/, '')),
            categoryId: '22',
          },
          status: {
            privacyStatus: cfg.privacyStatus,
            selfDeclaredMadeForKids: false,
          },
        }),
      },
    ),
    'YouTube upload init',
  )
  const uploadUrl = init.headers.get('location')
  if (!uploadUrl) throw new Error('YouTube upload init returned no Location header')

  const done = await expectOk(
    await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'video/mp4', 'Content-Length': String(video.length) },
      body: new Uint8Array(video),
    }),
    'YouTube video upload',
  )
  const json = (await done.json()) as { id?: string }
  if (!json.id) throw new Error('YouTube upload returned no video id')
  return { platform: 'youtube', id: json.id, url: `https://youtube.com/shorts/${json.id}` }
}
