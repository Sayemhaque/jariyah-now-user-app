import type { ContentMode, TextLanguage } from '@/lib/collections/types'
import type { Platform } from '@/lib/social/types'

export const dailyConfig = {
  reciterId: 'random',
  translationKey: 'sahiih_international',
  postTimes: ['09:00', '15:00', '22:00'],
  maxAyats: 10,
  contentRotation: ['quran', 'masnoon', 'hadith', 'duas', 'azkar'] as ContentMode[],
  textLanguage: 'english' as TextLanguage,
  coverAtMs: 2500,
  quality: '1080p' as const,
  extraHashtags: ['JariyahNow', 'Quran'],
  platforms: ['instagram', 'facebook'] as Platform[],
  youtubePrivacy: 'public',
  tiktokPrivacy: 'SELF_ONLY',
}
