import { describe, it, expect } from 'vitest'
import { azkarCollection } from '@/lib/collections/azkar'
import { toHadiths } from '@/lib/hadith/hadithApi'
import { shareableHadiths } from '@/lib/hadith/hadithPicks'
import engBukhari from '@/lib/hadith/fixtures/eng-bukhari-1.json'
import benBukhari from '@/lib/hadith/fixtures/ben-bukhari-2.json'
import engAbuDawud from '@/lib/hadith/fixtures/eng-abudawud-1.json'
import { azkarCard, hadithCard, quranCards, splitAyatIntoSlides, type CardAyah } from './cardContent'
import { availableBodyHeight, contentHeight, fitCardType } from './cardTypography'
import { cardPostMetadata } from './cardPostMetadata'
import { cardThemes } from './themes'
import { cardSizes, type CardFormat } from './types'

const formats = Object.keys(cardSizes) as CardFormat[]
const bukhari = toHadiths(engBukhari, 'bukhari', 'english', 1)
const abuDawud = toHadiths(engAbuDawud, 'abudawud', 'english', 1)
const shortHadiths = shareableHadiths([...bukhari, ...abuDawud, ...toHadiths(benBukhari, 'bukhari', 'bangla', 2)])
const ayah = (number: number, length = 120): CardAyah => ({ number, arabic: 'ب'.repeat(length), translation: 'w'.repeat(length) })
const mulk = { kind: 'masnoon' as const, title: 'Al-Mulk', surahName: 'Al-Mulk', surahNameArabic: 'الملك', surahNumber: 67 }

describe('card content', () => {
  it('shows a hadith as its text only, titled by its chapter, with the collection and number', () => {
    const card = hadithCard(bukhari[0]!)
    expect(card.lines).toEqual([{ translation: bukhari[0]!.text }])
    expect(card.title).toBe('Revelation')
    expect(card.reference).toBe('Sahih al-Bukhari 1')
  })

  it('adds the grade for collections outside Bukhari and Muslim', () => {
    expect(hadithCard(abuDawud.find((h) => h.number === 2)!).reference).toBe('Sunan Abi Dawud 2 · Sahih')
  })

  it('splits the when-to-say note from the azkar source', () => {
    const card = azkarCard(azkarCollection.find((a) => a.id === 'sayyidul-istighfar')!, 'english')
    expect(card.note).toBe('Morning and evening')
    expect(card.reference).toBe('Sahih al-Bukhari 6306')
    expect(card.lines[0]!.arabic).toBeTruthy()
  })

  it('groups ayat into slides that each fit, never leaving an ayah out', () => {
    const ayat = Array.from({ length: 10 }, (_, i) => ayah(i + 1, 140))
    formats.forEach((format) => {
      const slides = splitAyatIntoSlides(ayat, format)
      expect(slides.flat().map((a) => a.number)).toEqual(ayat.map((a) => a.number))
    })
    expect(splitAyatIntoSlides(ayat, 'square').length).toBeGreaterThan(splitAyatIntoSlides(ayat, 'story').length)
  })

  it('numbers carousel slides and gives each its own ayah range', () => {
    const cards = quranCards({ ...mulk, ayat: Array.from({ length: 6 }, (_, i) => ayah(i + 1, 200)) }, 'portrait')
    expect(cards.length).toBeGreaterThan(1)
    expect(cards[0]!.slide).toEqual({ index: 1, count: cards.length })
    expect(cards[0]!.reference).toMatch(/^Surah Al-Mulk · 67:1/)
    expect(cards[0]!.arabicTitle).toBe('الملك')
  })

  it('keeps a single-slide dua free of a slide counter', () => {
    const [card] = quranCards({ ...mulk, kind: 'dua', title: 'Good in this world', ayat: [ayah(201)] }, 'portrait')
    expect(card!.slide).toBeUndefined()
    expect(card!.eyebrow).toBe('Quranic Dua')
    expect(card!.reference).toBe('Surah Al-Mulk · 67:201')
  })
})

describe('fitCardType', () => {
  const allCards = [...shortHadiths.map(hadithCard), ...azkarCollection.flatMap((a) => [azkarCard(a, 'english'), azkarCard(a, 'bangla')])]

  it('fits every hadith and zikr in every size without shrinking text below a readable size', () => {
    formats.forEach((format) => {
      allCards.forEach((card) => {
        const sizes = fitCardType(card, format)
        const width = cardSizes[format].width - 256
        expect(contentHeight(card, sizes, width, 44 * sizes.scale), `${card.title} ${format}`).toBeLessThanOrEqual(availableBodyHeight(card, format))
        expect(sizes.translation, `${card.title} ${format}`).toBeGreaterThanOrEqual(18)
      })
    })
  })

  it('shows short texts larger than long ones', () => {
    const short = fitCardType(hadithCard(abuDawud.find((h) => h.number === 2)!), 'portrait')
    const long = fitCardType(azkarCard(azkarCollection.find((a) => a.id === 'sayyidul-istighfar')!, 'english'), 'portrait')
    expect(short.scale).toBe(1)
    expect(long.translation).toBeLessThan(short.translation)
  })
})

describe('cardPostMetadata', () => {
  it('writes a dua caption with every ayah, the full range and the translation credit', () => {
    const cards = quranCards({ ...mulk, ayat: Array.from({ length: 6 }, (_, i) => ayah(i + 1, 200)) }, 'portrait')
    const meta = cardPostMetadata(cards, ['JariyahNow'], 'Saheeh International')
    expect(meta.title).toBe('Masnoon Surah: Al-Mulk')
    expect(meta.description).toContain('Surah Al-Mulk · 67:1–6')
    expect(meta.description).toContain('(6) ')
    expect(meta.description).toContain('Translation: Saheeh International')
    expect(meta.hashtags).toContain('#MasnoonSurah')
    expect(meta.hashtags).not.toContain('#Shorts')
  })

  it('leaves Quran hashtags off hadith posts', () => {
    const meta = cardPostMetadata([hadithCard(bukhari[0]!)], ['JariyahNow', 'Quran'])
    expect(meta.hashtags).toContain('#JariyahNow')
    expect(meta.hashtags).not.toContain('#Quran')
    expect(meta.description).toContain('Source: Sahih al-Bukhari 1')
  })
})

describe('cardThemes', () => {
  it('have unique keys and both light and dark designs', () => {
    expect(new Set(cardThemes.map((t) => t.key)).size).toBe(cardThemes.length)
    expect(cardThemes.some((t) => t.light)).toBe(true)
    expect(cardThemes.some((t) => !t.light)).toBe(true)
  })
})
