import type { TextLanguage } from '@/lib/collections/types'
import type { Platform } from '@/lib/social/types'

export const dailyConfig = {
  reciterId: 'random',
  translationKey: 'sahiih_international',
  postTimes: ['07:00', '10:00', '13:30', '16:30', '19:30', '21:40'],
  maxDurationSec: 60,
  maxAyats: 10,
  textLanguage: 'english' as TextLanguage,
  coverAtMs: 2500,
  quality: '1080p' as const,
  extraHashtags: ['JariyahNow', 'Quran'],
  platforms: ['instagram', 'facebook'] as Platform[],
  youtubePrivacy: 'public',
  tiktokPrivacy: 'SELF_ONLY',
}
