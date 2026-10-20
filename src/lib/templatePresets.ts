export type TemplateType = 'quran' | 'names' | 'hadith' | 'dua'

export interface QuranTemplateConfig {
  surah: number
  fromAyat: number
  toAyat: number
  reciterId?: string
  translationKey?: string
  backgroundPreset?: string
  arabicFont?: 'quran' | 'uthmani' | 'scheherazade' | 'markazi' | 'naskh' | 'kufi' | 'cairo'
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
    title: 'আয়াতুল কুরসি',
    description: 'সূরা আল-বাকারা ২:২৫৫। হেফাজতের জন্য সবচেয়ে মর্যাদাপূর্ণ আয়াত।',
    icon: '🛡️',
    gradient: 'from-indigo-500 to-purple-700',
    config: {
      surah: 2,
      fromAyat: 255,
      toAyat: 255,
      reciterId: 'abdulbasit',
      translationKey: 'bengali',
      backgroundPreset: 'night-gold',
      arabicFont: 'uthmani',
    },
  },
  {
    id: 'al-mulk',
    type: 'quran',
    title: 'সূরা আল-মুলক',
    description: 'কবরের আজাব থেকে রক্ষার ৩০ আয়াতের সূরা। ঘুমানোর আগে পড়ুন।',
    icon: '👑',
    gradient: 'from-amber-500 to-orange-700',
    config: {
      surah: 67,
      fromAyat: 1,
      toAyat: 5,
      reciterId: 'sudais',
      translationKey: 'sahiih_international',
      backgroundPreset: 'desert-dawn',
      arabicFont: 'uthmani',
    },
  },
  {
    id: 'al-imran-ayat-185',
    type: 'quran',
    title: 'আলে ইমরান ৩:১৮৫',
    description: 'প্রত্যেক প্রাণকেই মৃত্যুর স্বাদ নিতে হবে। আখিরাতের কথা মনে করিয়ে দেওয়া একটি আয়াত।',
    icon: '🌿',
    gradient: 'from-emerald-500 to-teal-700',
    config: {
      surah: 3,
      fromAyat: 185,
      toAyat: 185,
      reciterId: 'muaiqly',
      translationKey: 'bengali',
      backgroundPreset: 'emerald-sanctuary',
      arabicFont: 'naskh',
    },
  },
  {
    id: 'al-fatihah',
    type: 'quran',
    title: 'সূরা আল-ফাতিহা',
    description: 'প্রতি নামাজে পড়া ৭ আয়াতের সূরা। কুরআনের শুরু ও মূল ভিত্তি।',
    icon: '🌟',
    gradient: 'from-rose-500 to-pink-700',
    config: {
      surah: 1,
      fromAyat: 1,
      toAyat: 7,
      reciterId: 'alafasy',
      translationKey: 'bengali',
      backgroundPreset: 'royal-amethyst',
      arabicFont: 'uthmani',
    },
  },
  {
    id: 'al-ikhlas',
    type: 'quran',
    title: 'সূরা আল-ইখলাস',
    description: 'আল্লাহর একত্ব নিয়ে ৪ আয়াতের সূরা। কুরআনের এক-তৃতীয়াংশের সমান।',
    icon: '💎',
    gradient: 'from-cyan-500 to-blue-700',
    config: {
      surah: 112,
      fromAyat: 1,
      toAyat: 4,
      reciterId: 'shatri',
      translationKey: 'sahiih_international',
      backgroundPreset: 'midnight-aurora',
      arabicFont: 'kufi',
    },
  },
  {
    id: 'ar-rahman',
    type: 'quran',
    title: 'সূরা আর-রহমান',
    description: 'নিয়ামতের কথা বলা আয়াতটি এখানে ৩১ বার এসেছে। আল্লাহর অনুগ্রহ নিয়ে ভাবার সূরা।',
    icon: '🌺',
    gradient: 'from-fuchsia-500 to-purple-700',
    config: {
      surah: 55,
      fromAyat: 1,
      toAyat: 13,
      reciterId: 'abdulbasit_mujawwad',
      translationKey: 'bengali',
      backgroundPreset: 'desert-dawn',
      arabicFont: 'uthmani',
    },
  },
]

const namesTemplate: TemplatePreset = {
  id: '99-names',
  type: 'names',
  title: 'আল্লাহর ৯৯ নাম',
  description: 'আসমাউল হুসনা — আল্লাহর ৯৯টি সুন্দর নাম। প্রতিটি নাম অর্থসহ একে একে দেখানো হয়।',
  icon: '✨',
  gradient: 'from-amber-400 via-orange-500 to-rose-600',
  config: {
    surah: 7,
    fromAyat: 180,
    toAyat: 180,
    reciterId: 'alafasy',
    translationKey: 'sahiih_international',
    backgroundPreset: 'night-gold',
    arabicFont: 'uthmani',
  },
}

const hadithTemplate: TemplatePreset = {
  id: 'daily-hadith',
  type: 'hadith',
  title: 'প্রতিদিনের হাদিস',
  description: 'ইমাম নববীর ৪০ হাদিস থেকে প্রতিদিন একটি নতুন হাদিস। ছোট, সহজ আর শেয়ার করার মতো।',
  icon: '📜',
  gradient: 'from-emerald-600 to-green-800',
  config: {
    surah: 59,
    fromAyat: 7,
    toAyat: 7,
    reciterId: 'shatri',
    translationKey: 'bengali',
    backgroundPreset: 'emerald-sanctuary',
    arabicFont: 'uthmani',
  },
}

const duaTemplates: TemplatePreset[] = [
  {
    id: 'dua-travel',
    type: 'dua',
    title: 'সফরের দোয়া',
    description: 'সফরে বের হওয়ার সময় পড়ার দোয়া — সূরা আয-যুখরুফ ৪৩:১৩-১৪। পথে হেফাজতের জন্য।',
    icon: '🚗',
    gradient: 'from-sky-500 to-blue-700',
    config: {
      surah: 43,
      fromAyat: 13,
      toAyat: 14,
      reciterId: 'alafasy',
      translationKey: 'bengali',
      backgroundPreset: 'royal-amethyst',
      arabicFont: 'uthmani',
    },
  },
  {
    id: 'dua-morning',
    type: 'dua',
    title: 'সকালের দোয়া',
    description: 'ফজরের পর পড়ুন — সূরা আলে ইমরান ৩:১৯০-১৯১। সারাদিনের হেফাজত ও বরকতের জন্য।',
    icon: '🌅',
    gradient: 'from-orange-400 to-amber-600',
    config: {
      surah: 3,
      fromAyat: 190,
      toAyat: 191,
      reciterId: 'muaiqly',
      translationKey: 'bengali',
      backgroundPreset: 'desert-dawn',
      arabicFont: 'naskh',
    },
  },
  {
    id: 'dua-evening',
    type: 'dua',
    title: 'সন্ধ্যার দোয়া',
    description: 'মাগরিবের পর পড়ুন — সূরা আল-ফালাক (১১৩) ও আন-নাস (১১৪)। রাতভর হেফাজতের জন্য।',
    icon: '🌆',
    gradient: 'from-indigo-600 to-slate-800',
    config: {
      surah: 113,
      fromAyat: 1,
      toAyat: 5,
      reciterId: 'sudais',
      translationKey: 'bengali',
      backgroundPreset: 'royal-amethyst',
      arabicFont: 'uthmani',
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
  { key: 'all', label: 'সব', icon: '✨' },
  { key: 'quran', label: 'কুরআন', icon: '📖' },
  { key: 'dua', label: 'দোয়া', icon: '🤲' },
  { key: 'names', label: '৯৯ নাম', icon: '✨' },
  { key: 'hadith', label: 'হাদিস', icon: '📜' },
]

export const templateTypeLabels: Record<TemplateType, string> = {
  quran: '📖 কুরআন',
  dua: '🤲 দোয়া',
  names: '✨ নাম',
  hadith: '📜 হাদিস',
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
