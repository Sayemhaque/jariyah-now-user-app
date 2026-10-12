import type { Platform } from '@/lib/social/types'

export const dailyConfig = {
  reciterId: 'random',
  translationKey: 'bengali',
  maxAyats: 10,
  quality: '1080p' as const,
  extraHashtags: ['JariyahNow', 'Quran'],
  platforms: ['instagram'] as Platform[],
  youtubePrivacy: 'public',
  tiktokPrivacy: 'SELF_ONLY',
}
