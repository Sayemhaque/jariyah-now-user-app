import type { Platform } from '@/lib/social/types'

export const dailyConfig = {
  reciterId: 'random',
  translationKey: 'bengali',
  maxDurationSec: 85,
  quality: '1080p' as const,
  extraHashtags: ['JariyahNow', 'Quran'],
  platforms: ['facebook', 'instagram'] as Platform[],
  youtubePrivacy: 'public',
  tiktokPrivacy: 'SELF_ONLY',
}
