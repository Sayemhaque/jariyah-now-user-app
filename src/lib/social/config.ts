/**
 * Social-platform credentials for the daily auto-post job.
 *
 * Read straight from `process.env` (GitHub Actions secrets) rather than the
 * app's env schema — the Next.js app itself never posts to social media.
 * A platform whose credentials are missing is reported as unconfigured and
 * skipped, so you can enable platforms one at a time.
 */
import { ALL_PLATFORMS, type Platform } from './types'

export interface YouTubeConfig {
  clientId: string
  clientSecret: string
  refreshToken: string
  privacyStatus: 'public' | 'unlisted' | 'private'
}

export interface FacebookConfig {
  pageId: string
  pageAccessToken: string
  graphVersion: string
}

export interface InstagramConfig {
  igUserId: string
  accessToken: string
  graphVersion: string
}

export interface TikTokConfig {
  clientKey: string
  clientSecret: string
  refreshToken: string
  privacyLevel: string
}

export interface SocialConfig {
  youtube: YouTubeConfig | null
  facebook: FacebookConfig | null
  instagram: InstagramConfig | null
  tiktok: TikTokConfig | null
}

type Env = Record<string, string | undefined>

function all<T extends Record<string, string | undefined>>(vals: T): { [K in keyof T]: string } | null {
  return Object.values(vals).every((v) => typeof v === 'string' && v.trim() !== '')
    ? (Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, v!.trim()])) as { [K in keyof T]: string })
    : null
}

export function loadSocialConfig(env: Env): SocialConfig {
  const graphVersion = env.META_GRAPH_VERSION?.trim() || 'v23.0'

  const yt = all({
    clientId: env.YOUTUBE_CLIENT_ID,
    clientSecret: env.YOUTUBE_CLIENT_SECRET,
    refreshToken: env.YOUTUBE_REFRESH_TOKEN,
  })
  const ytPrivacy = env.YOUTUBE_PRIVACY_STATUS
  const fb = all({ pageId: env.FACEBOOK_PAGE_ID, pageAccessToken: env.FACEBOOK_PAGE_ACCESS_TOKEN })
  const ig = all({
    igUserId: env.INSTAGRAM_USER_ID,
    // Instagram Graph API uses the Facebook Page token of the linked Page.
    accessToken: env.INSTAGRAM_ACCESS_TOKEN || env.FACEBOOK_PAGE_ACCESS_TOKEN,
  })
  const tt = all({
    clientKey: env.TIKTOK_CLIENT_KEY,
    clientSecret: env.TIKTOK_CLIENT_SECRET,
    refreshToken: env.TIKTOK_REFRESH_TOKEN,
  })

  return {
    youtube: yt && {
      ...yt,
      privacyStatus:
        ytPrivacy === 'unlisted' || ytPrivacy === 'private' ? ytPrivacy : 'public',
    },
    facebook: fb && { ...fb, graphVersion },
    instagram: ig && { ...ig, graphVersion },
    // Unaudited TikTok apps may only post SELF_ONLY (private) videos.
    tiktok: tt && { ...tt, privacyLevel: env.TIKTOK_PRIVACY_LEVEL?.trim() || 'SELF_ONLY' },
  }
}

/**
 * Parse a comma-separated platform list ("youtube,tiktok"). Empty or "all"
 * means every platform.
 */
export function parsePlatforms(raw: string | undefined): Platform[] {
  const v = (raw ?? '').trim().toLowerCase()
  if (!v || v === 'all') return [...ALL_PLATFORMS]
  const wanted = v.split(',').map((s) => s.trim())
  const unknown = wanted.filter((p) => !ALL_PLATFORMS.includes(p as Platform))
  if (unknown.length) throw new Error(`Unknown platform(s): ${unknown.join(', ')}`)
  return ALL_PLATFORMS.filter((p) => wanted.includes(p))
}
