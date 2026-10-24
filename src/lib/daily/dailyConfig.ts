import type { TextLanguage } from '@/lib/collections/types'
import type { Platform } from '@/lib/social/types'

export const dailyConfig = {
  reciterId: 'random',
  translationKey: 'sahiih_international',
  postTimes: ['07:00', '13:30', '19:30', '22:00'],
  maxDurationSec: 60,
  duaReelsFrom: '2026-10-24',
  duaReelsUntil: '2026-11-03',
  maxAyats: 10,
  textLanguage: 'english' as TextLanguage,
  coverAtMs: 2500,
  quality: '1080p' as const,
  extraHashtags: ['JariyahNow', 'Quran'],
  platforms: ['instagram', 'facebook', 'youtube'] as Platform[],
  youtubePrivacy: 'public',
  tiktokPrivacy: 'SELF_ONLY',
}
