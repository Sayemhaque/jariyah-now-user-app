import { defaultHashtags, toHashtag, type PostMetadata } from '@/lib/daily/plan'
import { textTranslation } from './textSlide'
import type { TextItem, TextLanguage, TextMode } from './types'

const modeTags: Record<TextMode, string[]> = {
  hadith: ['#Hadith', '#Sunnah', '#হাদিস'],
  azkar: ['#Azkar', '#Dhikr', '#Dua', '#জিকির'],
}
const modeNames: Record<TextMode, string> = { hadith: 'Hadith', azkar: 'Azkar' }

export interface TextPostInput {
  mode: TextMode
  item: TextItem
  language: TextLanguage
  extraHashtags?: string[]
}

export function buildTextPostMetadata({ mode, item, language, extraHashtags = [] }: TextPostInput): PostMetadata {
  const quranOnly = new Set(['#Quran', '#QuranRecitation', '#Tilawat', '#কুরআন', '#QuranReels'])
  const tags = [...modeTags[mode], ...defaultHashtags, ...extraHashtags.map(toHashtag)].filter((t) => t && !quranOnly.has(t))
  const hashtags = Array.from(new Set(tags))
  const base = `${modeNames[mode]}: ${item.title}`
  const title = `${base} #Shorts`.length <= 100 ? `${base} #Shorts` : base.slice(0, 100)
  const lines = [
    item.title,
    '',
    item.arabic,
    '',
    textTranslation(item, language),
    '',
    `Source: ${item.source}`,
    '',
    'Share this reminder — it could be sadaqah jariyah for you.',
    '',
    hashtags.join(' '),
  ]
  return { title, description: lines.join('\n'), hashtags, shortCaption: `${base} — ${item.source}\n${hashtags.join(' ')}` }
}
