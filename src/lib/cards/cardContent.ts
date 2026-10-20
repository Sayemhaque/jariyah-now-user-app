import { textTranslation } from '@/lib/collections/textTranslation'
import type { TextItem, TextLanguage } from '@/lib/collections/types'
import type { CardContent, CardFormat, CardLine } from './types'

export interface CardAyah {
  number: number
  arabic: string
  translation: string
}

export interface QuranCardInput {
  kind: 'dua' | 'masnoon'
  title: string
  surahName: string
  surahNameArabic: string
  surahNumber: number
  ayat: CardAyah[]
}

const slideBudgets: Record<CardFormat, number> = { portrait: 560, square: 400, story: 860 }

function splitNote(source: string): { note?: string; reference: string } {
  const parts = source.split(' · ')
  return parts.length > 1 ? { note: parts[0], reference: parts.slice(1).join(' · ') } : { reference: source }
}

export function hadithCard(item: TextItem, language: TextLanguage): CardContent {
  return { kind: 'hadith', eyebrow: 'Hadith', title: item.title, lines: [{ translation: textTranslation(item, language) }], reference: item.source }
}

export function azkarCard(item: TextItem, language: TextLanguage): CardContent {
  return { kind: 'azkar', eyebrow: 'Azkar', title: item.title, lines: [{ arabic: item.arabic, translation: textTranslation(item, language) }], ...splitNote(item.source) }
}

const ayahWeight = (a: CardAyah) => a.arabic.length + a.translation.length * 0.8

export function splitAyatIntoSlides(ayat: CardAyah[], format: CardFormat): CardAyah[][] {
  const slides: CardAyah[][] = []
  let current: CardAyah[] = []
  let weight = 0
  for (const ayah of ayat) {
    if (current.length && weight + ayahWeight(ayah) > slideBudgets[format]) {
      slides.push(current)
      current = []
      weight = 0
    }
    current.push(ayah)
    weight += ayahWeight(ayah)
  }
  if (current.length) slides.push(current)
  return slides
}

const ayahRange = (ayat: CardAyah[]) => (ayat.length === 1 ? `${ayat[0]!.number}` : `${ayat[0]!.number}–${ayat[ayat.length - 1]!.number}`)

export function quranCards(input: QuranCardInput, format: CardFormat): CardContent[] {
  const slides = splitAyatIntoSlides(input.ayat, format)
  return slides.map((ayat, index) => ({
    kind: input.kind,
    eyebrow: input.kind === 'dua' ? 'Quranic Dua' : 'Masnoon Surah',
    title: input.title,
    arabicTitle: input.kind === 'masnoon' ? input.surahNameArabic : undefined,
    lines: ayat.map((a): CardLine => ({ arabic: a.arabic, translation: a.translation, ayah: a.number })),
    reference: `Surah ${input.surahName} · ${input.surahNumber}:${ayahRange(ayat)}`,
    ...(slides.length > 1 ? { slide: { index: index + 1, count: slides.length } } : {}),
  }))
}
