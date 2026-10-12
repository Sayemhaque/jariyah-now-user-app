import type { FacebookConfig, InstagramConfig } from './config'
import { expectOk, sleep, type UploadInput, type UploadResult } from './types'

const graphUrl = 'https://graph.facebook.com'

async function graphPost<T>(path: string, params: Record<string, string>, label: string): Promise<T> {
  const res = await expectOk(
    await fetch(`${graphUrl}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params),
    }),
    label,
  )
  return (await res.json()) as T
}

async function ruploadBytes(uploadUrl: string, token: string, video: Buffer, label: string): Promise<void> {
  await expectOk(
    await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `OAuth ${token}`,
        offset: '0',
        file_size: String(video.length),
        'Content-Type': 'application/octet-stream',
      },
      body: new Uint8Array(video),
    }),
    label,
  )
}

export async function uploadToFacebookReels(cfg: FacebookConfig, input: UploadInput): Promise<UploadResult> {
  const { pageId, pageAccessToken: token, graphVersion: v } = cfg

  const start = await graphPost<{ video_id?: string; upload_url?: string }>(
    `${v}/${pageId}/video_reels`,
    { upload_phase: 'start', access_token: token },
    'Facebook reel start',
  )
  if (!start.video_id) throw new Error('Facebook reel start returned no video_id')
  const uploadUrl = start.upload_url ?? `https://rupload.facebook.com/video-upload/${v}/${start.video_id}`

  await ruploadBytes(uploadUrl, token, input.video, 'Facebook reel upload')

  await graphPost(
    `${v}/${pageId}/video_reels`,
    {
      upload_phase: 'finish',
      video_id: start.video_id,
      video_state: 'PUBLISHED',
      description: input.meta.description,
      title: input.meta.title,
      access_token: token,
    },
    'Facebook reel publish',
  )

  return {
    platform: 'facebook',
    id: start.video_id,
    url: `https://www.facebook.com/reel/${start.video_id}`,
    note: 'Facebook processes the reel asynchronously; it can take a few minutes to appear.',
  }
}

export async function uploadToInstagramReels(cfg: InstagramConfig, input: UploadInput): Promise<UploadResult> {
  const { igUserId, accessToken: token, graphVersion: v } = cfg

  const container = await graphPost<{ id?: string; uri?: string }>(
    `${v}/${igUserId}/media`,
    {
      media_type: 'REELS',
      upload_type: 'resumable',
      caption: input.meta.description,
      share_to_feed: 'true',
      access_token: token,
    },
    'Instagram container create',
  )
  if (!container.id) throw new Error('Instagram container create returned no id')
  const uploadUrl = container.uri ?? `https://rupload.facebook.com/ig-api-upload/${v}/${container.id}`

  await ruploadBytes(uploadUrl, token, input.video, 'Instagram reel upload')

  for (let i = 0; i < 60; i++) {
    await sleep(10_000)
    const res = await expectOk(
      await fetch(
        `${graphUrl}/${v}/${container.id}?fields=status_code,status&access_token=${encodeURIComponent(token)}`,
      ),
      'Instagram container status',
    )
    const s = (await res.json()) as { status_code?: string; status?: string }
    if (s.status_code === 'FINISHED') break
    if (s.status_code === 'ERROR' || s.status_code === 'EXPIRED') {
      throw new Error(`Instagram processing failed: ${s.status ?? s.status_code}`)
    }
    if (i === 59) throw new Error('Instagram processing timed out after 10 minutes')
  }

  const published = await graphPost<{ id?: string }>(
    `${v}/${igUserId}/media_publish`,
    { creation_id: container.id, access_token: token },
    'Instagram publish',
  )
  if (!published.id) throw new Error('Instagram publish returned no media id')
  return { platform: 'instagram', id: published.id }
}
