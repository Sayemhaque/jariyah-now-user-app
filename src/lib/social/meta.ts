import type { FacebookConfig, InstagramConfig } from './config'
import { expectOk, sleep, type UploadInput, type UploadResult } from './types'
import { withTemporaryVideoUrl } from './temporaryVideoUrl'

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

async function waitForContainer(cfg: InstagramConfig, containerId: string): Promise<void> {
  for (let i = 0; i < 60; i++) {
    await sleep(10_000)
    const res = await expectOk(
      await fetch(
        `${graphUrl}/${cfg.graphVersion}/${containerId}?fields=status_code,status&access_token=${encodeURIComponent(cfg.accessToken)}`,
      ),
      'Instagram container status',
    )
    const s = (await res.json()) as { status_code?: string; status?: string }
    if (s.status_code === 'FINISHED') return
    if (s.status_code === 'ERROR' || s.status_code === 'EXPIRED') {
      throw new Error(`Instagram processing failed: ${s.status ?? s.status_code}`)
    }
  }
  throw new Error('Instagram processing timed out after 10 minutes')
}

async function createReelContainer(cfg: InstagramConfig, input: UploadInput, source: Record<string, string>) {
  const container = await graphPost<{ id?: string; uri?: string }>(
    `${cfg.graphVersion}/${cfg.igUserId}/media`,
    { media_type: 'REELS', caption: input.meta.description, share_to_feed: 'true', access_token: cfg.accessToken, ...source },
    'Instagram container create',
  )
  if (!container.id) throw new Error('Instagram container create returned no id')
  return { id: container.id, uri: container.uri }
}

async function containerFromUrl(cfg: InstagramConfig, input: UploadInput, videoHostToken: string): Promise<string> {
  return withTemporaryVideoUrl(input.video, videoHostToken, async (videoUrl) => {
    const container = await createReelContainer(cfg, input, { video_url: videoUrl })
    await waitForContainer(cfg, container.id)
    return container.id
  })
}

async function containerFromUpload(cfg: InstagramConfig, input: UploadInput): Promise<string> {
  const container = await createReelContainer(cfg, input, { upload_type: 'resumable' })
  const uploadUrl = container.uri ?? `https://rupload.facebook.com/ig-api-upload/${cfg.graphVersion}/${container.id}`
  await ruploadBytes(uploadUrl, cfg.accessToken, input.video, 'Instagram reel upload')
  await waitForContainer(cfg, container.id)
  return container.id
}

export async function uploadToInstagramReels(cfg: InstagramConfig, input: UploadInput): Promise<UploadResult> {
  const containerId = cfg.videoHostToken
    ? await containerFromUrl(cfg, input, cfg.videoHostToken)
    : await containerFromUpload(cfg, input)
  const published = await graphPost<{ id?: string }>(
    `${cfg.graphVersion}/${cfg.igUserId}/media_publish`,
    { creation_id: containerId, access_token: cfg.accessToken },
    'Instagram publish',
  )
  if (!published.id) throw new Error('Instagram publish returned no media id')
  return { platform: 'instagram', id: published.id }
}
