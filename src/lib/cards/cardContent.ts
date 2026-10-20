import { textTranslation } from '@/lib/collections/textTranslation'
import type { TextItem, TextLanguage } from '@/lib/collections/types'
import type { Hadith } from '@/lib/hadith/types'
import type { CardContent, CardFormat, CardLine } from './types'
import { banglaBookNames, banglaEyebrows, banglaGrade, banglaNote, banglaSource, bnDigits } from './bangla'
import { azkarBenefits, type Benefit } from '@/lib/collections/benefits'

export interface CardAyah {
  number: number
  arabic: string
  translation: string
}

export interface QuranCardInput {
  kind: 'dua' | 'masnoon'
  title: string
  bangla?: boolean
  benefit?: Benefit
  surahName: string
  surahNameArabic: string
  surahNumber: number
  ayat: CardAyah[]
}

const slideBudgets: Record<CardFormat, number> = { portrait: 470, square: 330, story: 760 }

function splitNote(source: string): { note?: string; reference: string } {
  const parts = source.split(' · ')
  return parts.length > 1 ? { note: parts[0], reference: parts.slice(1).join(' · ') } : { reference: source }
}

export const cardBenefit = (benefit: Benefit | undefined, bangla: boolean) =>
  benefit ? { text: bangla ? benefit.bn : benefit.en, source: bangla ? banglaSource(benefit.source) : benefit.source } : undefined

const showsGrade = (hadith: Hadith) => hadith.grade && hadith.book !== 'bukhari' && hadith.book !== 'muslim'

function banglaHadithCard(hadith: Hadith): CardContent {
  const reference = `হাদিস নং ${bnDigits(hadith.number)}${showsGrade(hadith) ? ` · ${banglaGrade(hadith.grade)}` : ''}`
  return { kind: 'hadith', eyebrow: banglaEyebrows.hadith, title: banglaBookNames[hadith.book] ?? hadith.bookName, lines: [{ translation: hadith.text }], reference }
}

export function hadithCard(hadith: Hadith): CardContent {
  if (hadith.language === 'bangla') return banglaHadithCard(hadith)
  const reference = `${hadith.bookName} ${hadith.number}${showsGrade(hadith) ? ` · ${hadith.grade}` : ''}`
  return { kind: 'hadith', eyebrow: 'Hadith', title: hadith.chapter || hadith.bookName, lines: [{ translation: hadith.text }], reference }
}

export function azkarCard(item: TextItem, language: TextLanguage): CardContent {
  const { note, reference } = splitNote(item.source)
  const bangla = language === 'bangla'
  return {
    kind: 'azkar',
    eyebrow: bangla ? banglaEyebrows.azkar : 'Azkar',
    title: bangla ? item.titleBn ?? item.title : item.title,
    lines: [{ arabic: item.arabic, translation: textTranslation(item, language) }],
    reference,
    ...(note ? { note: bangla ? banglaNote(note) : note } : {}),
    ...(azkarBenefits[item.id] ? { benefit: cardBenefit(azkarBenefits[item.id], bangla) } : {}),
  }
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
    eyebrow: input.bangla ? banglaEyebrows[input.kind] : input.kind === 'dua' ? 'Quranic Dua' : 'Masnoon Surah',
    title: input.title,
    arabicTitle: input.kind === 'masnoon' ? input.surahNameArabic : undefined,
    lines: ayat.map((a): CardLine => ({ arabic: a.arabic, translation: a.translation, ayah: a.number })),
    reference: `Surah ${input.surahName} · ${input.surahNumber}:${ayahRange(ayat)}`,
    ...(index === 0 && input.benefit ? { benefit: cardBenefit(input.benefit, Boolean(input.bangla)) } : {}),
    ...(slides.length > 1 ? { slide: { index: index + 1, count: slides.length } } : {}),
  }))
}
