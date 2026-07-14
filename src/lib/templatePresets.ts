// ─────────────────────────────────────────────────────────────────────────────
// Template Presets — pre-configured starting points for the Quran Video
// Generator.
//
// Each template bundles a Surah/ayat range plus suggested visual settings
// (background, font, colors) so users can launch into a polished reel in one
// click instead of configuring everything by hand.
//
// Click behaviour on /templates:
//   • Quran templates → setSurah + setFromAyat + setToAyat → navigate to /app
//
// All templates are static data — no fetches happen on this page.
// ─────────────────────────────────────────────────────────────────────────────

export type TemplateType = 'quran' | 'names' | 'hadith' | 'dua'

/** Configuration for a Quran-type template — what to load in the builder. */
export interface QuranTemplateConfig {
  surah: number
  fromAyat: number
  toAyat: number
  /** Suggested reciter id (matches RECITERS[].id in lib/reciters.ts). */
  reciterId?: string
  /** Suggested UmmahAPI translation key (e.g. 'bengali', 'sahiih_international'). */
  translationKey?: string
  /** Suggested background preset key (matches BG_PRESETS[].key). */
  backgroundPreset?: string
  /** Suggested Arabic font. */
  arabicFont?: 'uthmani' | 'scheherazade' | 'markazi' | 'naskh' | 'kufi' | 'cairo'
  /** Suggested highlight color (hex). */
  highlightColor?: string
}

export interface TemplatePreset {
  id: string
  type: TemplateType
  title: string
  description: string
  /** Emoji or short icon glyph shown on the template card. */
  icon: string
  /** Tailwind gradient classes (e.g. "from-amber-500 to-rose-600"). */
  gradient: string
  /** Type-specific config — narrow via the `type` field. */
  config: QuranTemplateConfig
}

// ─── 6 Quran templates ──────────────────────────────────────────────────────
const QURAN_TEMPLATES: TemplatePreset[] = [
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

// ─── 1 Names template ───────────────────────────────────────────────────────
const NAMES_TEMPLATE: TemplatePreset = {
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

// ─── 1 Hadith template ──────────────────────────────────────────────────────
const HADITH_TEMPLATE: TemplatePreset = {
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

// ─── 3 Dua templates ────────────────────────────────────────────────────────
const DUA_TEMPLATES: TemplatePreset[] = [
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

// ─── Combined export ────────────────────────────────────────────────────────
export const TEMPLATE_PRESETS: TemplatePreset[] = [
  ...QURAN_TEMPLATES,
  NAMES_TEMPLATE,
  HADITH_TEMPLATE,
  ...DUA_TEMPLATES,
]

/** Type guard: a Quran-type template (with surah/ayat range). */
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

/** Filter category labels for the templates page UI. */
export const TEMPLATE_CATEGORIES: { key: TemplateType | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: '✨' },
  { key: 'quran', label: 'Quran', icon: '📖' },
  { key: 'dua', label: 'Dua', icon: '🤲' },
  { key: 'names', label: '99 Names', icon: '✨' },
  { key: 'hadith', label: 'Hadith', icon: '📜' },
]
