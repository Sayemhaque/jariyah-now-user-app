import { describe, it, expect } from 'vitest'
import { loadSocialConfig, parsePlatforms } from './config'
import { tiktokChunkPlan } from './tiktok'

describe('loadSocialConfig', () => {
  it('marks platforms without full credentials as unconfigured', () => {
    const cfg = loadSocialConfig({ YOUTUBE_CLIENT_ID: 'id', YOUTUBE_CLIENT_SECRET: 'secret' })
    expect(cfg).toEqual({ youtube: null, facebook: null, instagram: null, tiktok: null })
  })

  it('passes the blob token to Instagram for hosting the video', () => {
    const cfg = loadSocialConfig({ FACEBOOK_PAGE_ACCESS_TOKEN: 'page-token', INSTAGRAM_USER_ID: '456', BLOB_READ_WRITE_TOKEN: 'blob' })
    expect(cfg.instagram?.videoHostToken).toBe('blob')
  })

  it('treats blank secrets as missing', () => {
    const cfg = loadSocialConfig({ FACEBOOK_PAGE_ID: '123', FACEBOOK_PAGE_ACCESS_TOKEN: '  ' })
    expect(cfg.facebook).toBeNull()
  })

  it('reuses the Facebook page token for Instagram and applies defaults', () => {
    const cfg = loadSocialConfig({
      FACEBOOK_PAGE_ID: '123',
      FACEBOOK_PAGE_ACCESS_TOKEN: 'page-token',
      INSTAGRAM_USER_ID: '456',
      YOUTUBE_CLIENT_ID: 'a',
      YOUTUBE_CLIENT_SECRET: 'b',
      YOUTUBE_REFRESH_TOKEN: 'c',
      YOUTUBE_PRIVACY_STATUS: 'nonsense',
      TIKTOK_CLIENT_KEY: 'k',
      TIKTOK_CLIENT_SECRET: 's',
      TIKTOK_REFRESH_TOKEN: 'r',
    })
    expect(cfg.facebook).toEqual({ pageId: '123', pageAccessToken: 'page-token', graphVersion: 'v23.0' })
    expect(cfg.instagram).toEqual({ igUserId: '456', accessToken: 'page-token', graphVersion: 'v23.0' })
    expect(cfg.youtube?.privacyStatus).toBe('public')
    expect(cfg.tiktok?.privacyLevel).toBe('SELF_ONLY')
  })
})

describe('parsePlatforms', () => {
  it('defaults to all platforms', () => {
    expect(parsePlatforms(undefined)).toEqual(['youtube', 'facebook', 'instagram', 'tiktok'])
    expect(parsePlatforms('all')).toHaveLength(4)
  })

  it('parses a subset in canonical order', () => {
    expect(parsePlatforms('tiktok, youtube')).toEqual(['youtube', 'tiktok'])
  })

  it('rejects unknown platforms', () => {
    expect(() => parsePlatforms('youtube,myspace')).toThrow(/myspace/)
  })
})

describe('tiktokChunkPlan', () => {
  const megabyte = 1024 * 1024

  it('uses a single chunk up to 64 MB', () => {
    expect(tiktokChunkPlan(30 * megabyte)).toEqual({ chunkSize: 30 * megabyte, count: 1 })
  })

  it('folds the remainder into the last chunk for larger files', () => {
    const plan = tiktokChunkPlan(95 * megabyte)
    expect(plan).toEqual({ chunkSize: 10 * megabyte, count: 9 })
    const last = 95 * megabyte - (plan.count - 1) * plan.chunkSize
    expect(last).toBeLessThanOrEqual(128 * megabyte)
    expect(last).toBeGreaterThanOrEqual(plan.chunkSize)
  })
})
