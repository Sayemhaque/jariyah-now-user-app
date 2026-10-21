import { afterEach, describe, expect, it, vi } from 'vitest'
import { uploadToFacebookReels } from './meta'

const cfg = { pageId: 'page1', pageAccessToken: 'tok', graphVersion: 'v21.0' }
const meta = { title: 'T', description: 'D', hashtags: [], shortCaption: 'C' }

function mockGraph(thumbnailOk = true) {
  const calls: { url: string; body: unknown }[] = []
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
    calls.push({ url, body: init.body })
    if (url.includes('/thumbnails') && !thumbnailOk) return new Response('bad', { status: 400 })
    return Response.json(url.endsWith('/video_reels') ? { video_id: 'vid1', upload_url: 'https://rupload.example/vid1', success: true } : { success: true })
  }))
  vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  return calls
}

afterEach(() => vi.unstubAllGlobals())

describe('Facebook reels', () => {
  it('sets the chosen cover frame as the thumbnail before publishing', async () => {
    const calls = mockGraph()
    await uploadToFacebookReels(cfg, { video: Buffer.from('mp4'), meta, cover: Buffer.from('jpg') })
    expect(calls.map((c) => c.url.replace('https://graph.facebook.com/', ''))).toEqual([
      'v21.0/page1/video_reels',
      'https://rupload.example/vid1',
      'v21.0/vid1/thumbnails',
      'v21.0/page1/video_reels',
    ])
    const form = calls[2]!.body as FormData
    expect(form.get('is_preferred')).toBe('true')
    expect(form.get('source')).toBeInstanceOf(Blob)
  })

  it('still publishes when the thumbnail is rejected', async () => {
    const calls = mockGraph(false)
    const result = await uploadToFacebookReels(cfg, { video: Buffer.from('mp4'), meta, cover: Buffer.from('jpg') })
    expect(result.id).toBe('vid1')
    expect(calls.at(-1)!.url).toContain('video_reels')
  })

  it('skips the thumbnail step without a cover', async () => {
    const calls = mockGraph()
    await uploadToFacebookReels(cfg, { video: Buffer.from('mp4'), meta })
    expect(calls.some((c) => c.url.includes('thumbnails'))).toBe(false)
  })
})
