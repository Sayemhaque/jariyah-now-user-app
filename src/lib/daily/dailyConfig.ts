import type { Platform } from '@/lib/social/types'

export const dailyConfig = {
  reciterId: 'random',
  translationKey: 'bengali',
  maxDurationSec: 85,
  quality: '1080p' as const,
  extraHashtags: ['JariyahNow', 'Quran'],
  platforms: ['youtube', 'facebook', 'instagram', 'tiktok'] as Platform[],
  youtubePrivacy: 'public',
  tiktokPrivacy: 'SELF_ONLY',
}
