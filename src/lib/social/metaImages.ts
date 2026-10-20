import type { FacebookConfig, InstagramConfig } from './config'
import type { PostMetadata } from '@/lib/daily/plan'
import { expectOk, sleep, type UploadResult } from './types'

const graphUrl = 'https://graph.facebook.com'

export interface ImagePostInput {
  imageUrls: string[]
  meta: PostMetadata
}

async function graphPost<T>(path: string, params: Record<string, string>, label: string): Promise<T> {
  const res = await expectOk(
    await fetch(`${graphUrl}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(params) }),
    label,
  )
  return (await res.json()) as T
}

async function waitUntilReady(cfg: InstagramConfig, id: string): Promise<void> {
  for (let i = 0; i < 30; i++) {
    const res = await expectOk(await fetch(`${graphUrl}/${cfg.graphVersion}/${id}?fields=status_code&access_token=${encodeURIComponent(cfg.accessToken)}`), 'Instagram image status')
    const { status_code } = (await res.json()) as { status_code?: string }
    if (status_code === 'FINISHED') return
    if (status_code === 'ERROR' || status_code === 'EXPIRED') throw new Error(`Instagram image processing failed: ${status_code}`)
    await sleep(3000)
  }
  throw new Error('Instagram image processing timed out')
}

async function igContainer(cfg: InstagramConfig, params: Record<string, string>): Promise<string> {
  const { id } = await graphPost<{ id?: string }>(`${cfg.graphVersion}/${cfg.igUserId}/media`, { ...params, access_token: cfg.accessToken }, 'Instagram image container')
  if (!id) throw new Error('Instagram image container returned no id')
  await waitUntilReady(cfg, id)
  return id
}

export async function postImagesToInstagram(cfg: InstagramConfig, input: ImagePostInput): Promise<UploadResult> {
  const caption = input.meta.description
  const creationId =
    input.imageUrls.length === 1
      ? await igContainer(cfg, { image_url: input.imageUrls[0]!, caption })
      : await igContainer(cfg, {
          media_type: 'CAROUSEL',
          caption,
          children: (await Promise.all(input.imageUrls.map((url) => igContainer(cfg, { image_url: url, is_carousel_item: 'true' })))).join(','),
        })
  const published = await graphPost<{ id?: string }>(`${cfg.graphVersion}/${cfg.igUserId}/media_publish`, { creation_id: creationId, access_token: cfg.accessToken }, 'Instagram publish')
  if (!published.id) throw new Error('Instagram publish returned no media id')
  return { platform: 'instagram', id: published.id }
}

export async function postImagesToFacebook(cfg: FacebookConfig, input: ImagePostInput): Promise<UploadResult> {
  const { pageId, pageAccessToken: token, graphVersion: v } = cfg
  const message = input.meta.description
  if (input.imageUrls.length === 1) {
    const photo = await graphPost<{ id?: string; post_id?: string }>(`${v}/${pageId}/photos`, { url: input.imageUrls[0]!, caption: message, access_token: token }, 'Facebook photo post')
    return { platform: 'facebook', id: photo.post_id ?? photo.id ?? '' }
  }
  const photos = await Promise.all(
    input.imageUrls.map((url) => graphPost<{ id?: string }>(`${v}/${pageId}/photos`, { url, published: 'false', access_token: token }, 'Facebook photo upload')),
  )
  const attached = Object.fromEntries(photos.map((p, i) => [`attached_media[${i}]`, JSON.stringify({ media_fbid: p.id })]))
  const post = await graphPost<{ id?: string }>(`${v}/${pageId}/feed`, { message, ...attached, access_token: token }, 'Facebook album post')
  return { platform: 'facebook', id: post.id ?? '', url: post.id ? `https://www.facebook.com/${post.id}` : undefined }
}
