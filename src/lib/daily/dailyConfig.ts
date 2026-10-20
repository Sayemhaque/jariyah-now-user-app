import type { ContentMode, TextLanguage } from '@/lib/collections/types'
import type { Platform } from '@/lib/social/types'

export const dailyConfig = {
  reciterId: 'random',
  translationKey: 'sahiih_international',
  postTimes: ['07:00', '10:00', '14:00', '17:00', '21:00', '22:30'],
  maxAyats: 10,
  contentRotation: [
    ...['quran', 'hadith', 'quran', 'azkar', 'quran', 'duas'],
    ...['quran', 'hadith', 'quran', 'azkar', 'quran', 'masnoon'],
  ] as ContentMode[],
  textLanguage: 'english' as TextLanguage,
  coverAtMs: 2500,
  quality: '1080p' as const,
  extraHashtags: ['JariyahNow', 'Quran'],
  platforms: ['instagram', 'facebook'] as Platform[],
  youtubePrivacy: 'public',
  tiktokPrivacy: 'SELF_ONLY',
}
