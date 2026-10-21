import { defaultHashtags, toHashtag, type PostMetadata } from '@/lib/daily/plan'
import type { CardContent, CardKind } from './types'

const kindTags: Record<CardKind, string[]> = {
  hadith: ['#Hadith', '#Sunnah', '#হাদিস'],
  azkar: ['#Azkar', '#Dhikr', '#Dua', '#জিকির'],
  dua: ['#QuranicDua', '#Dua', '#Quran', '#কুরআন'],
  masnoon: ['#MasnoonSurah', '#Sunnah', '#Quran', '#কুরআন'],
}
const quranTags = new Set(['#Quran', '#QuranRecitation', '#Tilawat', '#কুরআন', '#QuranReels', '#Shorts'])

function lineText(card: CardContent): string[] {
  return card.lines.map((l) => (l.ayah !== undefined ? `(${l.ayah}) ${l.translation}` : l.translation))
}

function quranReference(cards: CardContent[]): string {
  const ayat = cards.flatMap((c) => c.lines.map((l) => l.ayah ?? 0))
  const range = ayat.length > 1 ? `${ayat[0]}–${ayat[ayat.length - 1]}` : `${ayat[0]}`
  return `${cards[0]!.reference.split(':')[0]}:${range}`
}

export function cardPostMetadata(cards: CardContent[], extraHashtags: string[] = [], translationCredit?: string): PostMetadata {
  const first = cards[0]!
  const isQuran = first.kind === 'dua' || first.kind === 'masnoon'
  const base = defaultHashtags.filter((t) => !quranTags.has(t))
  const extras = extraHashtags.map(toHashtag).filter((t) => isQuran || !quranTags.has(t))
  const hashtags = Array.from(new Set([...kindTags[first.kind], ...base, ...extras].filter(Boolean)))
  const title = `${first.eyebrow}: ${first.title}`.slice(0, 100)
  const reference = isQuran ? quranReference(cards) : first.reference
  const benefit = first.benefit ?? first.captionBenefit
  const lines = [
    title,
    ...(benefit ? ['', `✦ ${benefit.text} (${benefit.source})`] : []),
    '',
    ...cards.flatMap(lineText),
    '',
    `${isQuran ? '' : 'Source: '}${reference}`,
    ...(first.note ? [first.note] : []),
    ...(translationCredit ? [`Translation: ${translationCredit}`] : []),
    '',
    'Share this reminder — it could be sadaqah jariyah for you.',
    '',
    hashtags.join(' '),
  ]
  return { title, description: lines.join('\n'), hashtags, shortCaption: `${title}\n${hashtags.join(' ')}` }
}
