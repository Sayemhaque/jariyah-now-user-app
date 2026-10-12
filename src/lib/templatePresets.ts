export type TemplateType = 'quran' | 'names' | 'hadith' | 'dua'

export interface QuranTemplateConfig {
  surah: number
  fromAyat: number
  toAyat: number
  reciterId?: string
  translationKey?: string
  backgroundPreset?: string
  arabicFont?: 'quran' | 'uthmani' | 'scheherazade' | 'markazi' | 'naskh' | 'kufi' | 'cairo'
  highlightColor?: string
}

export interface TemplatePreset {
  id: string
  type: TemplateType
  title: string
  description: string
  icon: string
  gradient: string
  config: QuranTemplateConfig
}

const quranTemplates: TemplatePreset[] = [
  {
    id: 'ayat-al-kursi',
    type: 'quran',
    title: 'Ayat al-Kursi',
    description: 'The Throne Verse — Surah Al-Baqarah 2:255. The most powerful verse for protection.',
    icon: '🛡️',
    gradient: 'from-indigo-500 to-purple-700',
    config: {
      surah: 2,
      fromAyat: 255,
      toAyat: 255,
      reciterId: 'abdulbasit',
      translationKey: 'bengali',
      backgroundPreset: 'twilight-mosque',
      arabicFont: 'uthmani',
      highlightColor: '#9333ea',
    },
  },
  {
    id: 'al-mulk',
    type: 'quran',
    title: 'Surah Al-Mulk',
    description: 'The Sovereignty — 30 verses of protection from the grave punishment. Recite before sleep.',
    icon: '👑',
    gradient: 'from-amber-500 to-orange-700',
    config: {
      surah: 67,
      fromAyat: 1,
      toAyat: 5,
      reciterId: 'sudais',
      translationKey: 'sahiih_international',
      backgroundPreset: 'sunset-mosque',
      arabicFont: 'uthmani',
      highlightColor: '#f5b942',
    },
  },
  {
    id: 'al-imran-ayat-185',
    type: 'quran',
    title: 'Al-Imran 3:185',
    description: 'Reflection on the Hereafter — every soul shall taste death. A reminder of what truly matters.',
    icon: '🌿',
    gradient: 'from-emerald-500 to-teal-700',
    config: {
      surah: 3,
      fromAyat: 185,
      toAyat: 185,
      reciterId: 'muaiqly',
      translationKey: 'bengali',
      backgroundPreset: 'forest',
      arabicFont: 'naskh',
      highlightColor: '#10b981',
    },
  },
  {
    id: 'al-fatihah',
    type: 'quran',
    title: 'Surah Al-Fatihah',
    description: 'The Opening — 7 verses recited in every prayer. The foundation of the Quran.',
    icon: '🌟',
    gradient: 'from-rose-500 to-pink-700',
    config: {
      surah: 1,
      fromAyat: 1,
      toAyat: 7,
      reciterId: 'alafasy',
      translationKey: 'bengali',
      backgroundPreset: 'twilight-hills',
      arabicFont: 'uthmani',
      highlightColor: '#f43f5e',
    },
  },
  {
    id: 'al-ikhlas',
    type: 'quran',
    title: 'Surah Al-Ikhlas',
    description: 'Sincerity — 4 verses on the absolute oneness of Allah. Equals one-third of the Quran.',
    icon: '💎',
    gradient: 'from-cyan-500 to-blue-700',
    config: {
      surah: 112,
      fromAyat: 1,
      toAyat: 4,
      reciterId: 'shatri',
      translationKey: 'sahiih_international',
      backgroundPreset: 'night',
      arabicFont: 'kufi',
      highlightColor: '#06b6d4',
    },
  },
  {
    id: 'ar-rahman',
    type: 'quran',
    title: 'Surah Ar-Rahman',
    description: 'The Most Merciful — the verse of blessings repeated 31 times. A meditation on Allah\u2019s favors.',
    icon: '🌺',
    gradient: 'from-fuchsia-500 to-purple-700',
    config: {
      surah: 55,
      fromAyat: 1,
      toAyat: 13,
      reciterId: 'abdulbasit_mujawwad',
      translationKey: 'bengali',
      backgroundPreset: 'sunset-glow',
      arabicFont: 'uthmani',
      highlightColor: '#d946ef',
    },
  },
]

const namesTemplate: TemplatePreset = {
  id: '99-names',
  type: 'names',
  title: '99 Names of Allah',
  description: 'Asma ul Husna — the 99 beautiful names. A meditative reel cycling through each name with meaning.',
  icon: '✨',
  gradient: 'from-amber-400 via-orange-500 to-rose-600',
  config: {
    surah: 7,
    fromAyat: 180,
    toAyat: 180,
    reciterId: 'alafasy',
    translationKey: 'sahiih_international',
    backgroundPreset: 'golden-particles',
    arabicFont: 'uthmani',
    highlightColor: '#f5b942',
  },
}

const hadithTemplate: TemplatePreset = {
  id: 'daily-hadith',
  type: 'hadith',
  title: 'Daily Hadith',
  description: 'A new hadith each day from the 40 Hadith of Imam Nawawi. Bite-sized wisdom for sharing.',
  icon: '📜',
  gradient: 'from-emerald-600 to-green-800',
  config: {
    surah: 59,
    fromAyat: 7,
    toAyat: 7,
    reciterId: 'shatri',
    translationKey: 'bengali',
    backgroundPreset: 'mosque',
    arabicFont: 'uthmani',
    highlightColor: '#10b981',
  },
}

const duaTemplates: TemplatePreset[] = [
  {
    id: 'dua-travel',
    type: 'dua',
    title: 'Dua for Travel',
    description: 'Recited when setting out on a journey — Surah Az-Zukhruf 43:13-14. Protection on the road.',
    icon: '🚗',
    gradient: 'from-sky-500 to-blue-700',
    config: {
      surah: 43,
      fromAyat: 13,
      toAyat: 14,
      reciterId: 'alafasy',
      translationKey: 'bengali',
      backgroundPreset: 'twilight-hills',
      arabicFont: 'uthmani',
      highlightColor: '#0ea5e9',
    },
  },
  {
    id: 'dua-morning',
    type: 'dua',
    title: 'Morning Dua',
    description: 'Recite after Fajr — Surah Al-Imran 3:190-191 for protection and barakah through the day.',
    icon: '🌅',
    gradient: 'from-orange-400 to-amber-600',
    config: {
      surah: 3,
      fromAyat: 190,
      toAyat: 191,
      reciterId: 'muaiqly',
      translationKey: 'bengali',
      backgroundPreset: 'sunset-glow',
      arabicFont: 'naskh',
      highlightColor: '#f5b942',
    },
  },
  {
    id: 'dua-evening',
    type: 'dua',
    title: 'Evening Dua',
    description: 'Recite after Maghrib — Surah Al-Falaq (113) + An-Nas (114) for overnight protection.',
    icon: '🌆',
    gradient: 'from-indigo-600 to-slate-800',
    config: {
      surah: 113,
      fromAyat: 1,
      toAyat: 5,
      reciterId: 'sudais',
      translationKey: 'bengali',
      backgroundPreset: 'crescent-night',
      arabicFont: 'uthmani',
      highlightColor: '#6366f1',
    },
  },
]

export const templatePresets: TemplatePreset[] = [
  ...quranTemplates,
  namesTemplate,
  hadithTemplate,
  ...duaTemplates,
]

export function isQuranTemplate(
  t: TemplatePreset,
): t is TemplatePreset & { config: QuranTemplateConfig } {
  return (
    t.type === 'quran' ||
    t.type === 'names' ||
    t.type === 'hadith' ||
    t.type === 'dua'
  )
}

export const templateCategories: { key: TemplateType | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: '✨' },
  { key: 'quran', label: 'Quran', icon: '📖' },
  { key: 'dua', label: 'Dua', icon: '🤲' },
  { key: 'names', label: '99 Names', icon: '✨' },
  { key: 'hadith', label: 'Hadith', icon: '📜' },
]

export const templateTypeLabels: Record<TemplateType, string> = {
  quran: '📖 Quran',
  dua: '🤲 Dua',
  names: '✨ Names',
  hadith: '📜 Hadith',
}

const featuredTemplateIds = ['ayat-al-kursi', 'al-fatihah', 'ar-rahman', 'dua-morning', '99-names', 'daily-hadith']

export function getFeaturedTemplates(): TemplatePreset[] {
  const featured = featuredTemplateIds
    .map((id) => templatePresets.find((t) => t.id === id))
    .filter((t): t is TemplatePreset => Boolean(t))
  return featured.length >= 6 ? featured : templatePresets.slice(0, 6)
}

export function formatTemplateRange(config: QuranTemplateConfig): string {
  const end = config.toAyat !== config.fromAyat ? `–${config.toAyat}` : ''
  return `${config.surah}:${config.fromAyat}${end}`
}
