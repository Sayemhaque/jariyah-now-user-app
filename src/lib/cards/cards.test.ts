import { describe, it, expect } from 'vitest'
import { azkarCollection } from '@/lib/collections/azkar'
import { hadithCollection } from '@/lib/collections/hadith'
import { azkarCard, hadithCard, quranCards, splitAyatIntoSlides, type CardAyah } from './cardContent'
import { availableBodyHeight, contentHeight, fitCardType } from './cardTypography'
import { cardPostMetadata } from './cardPostMetadata'
import { cardThemes } from './themes'
import { cardSizes, type CardFormat } from './types'

const formats = Object.keys(cardSizes) as CardFormat[]
const ayah = (number: number, length = 120): CardAyah => ({ number, arabic: 'ب'.repeat(length), translation: 'w'.repeat(length) })
const mulk = { kind: 'masnoon' as const, title: 'Al-Mulk', surahName: 'Al-Mulk', surahNameArabic: 'الملك', surahNumber: 67 }

describe('card content', () => {
  it('shows a hadith as its translation only, with the source as reference', () => {
    const item = hadithCollection[0]!
    const card = hadithCard(item, 'bangla')
    expect(card.lines).toEqual([{ translation: item.bangla }])
    expect(card.reference).toBe(item.source)
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
  const allCards = [...hadithCollection.flatMap((h) => [hadithCard(h, 'english'), hadithCard(h, 'bangla')]), ...azkarCollection.flatMap((a) => [azkarCard(a, 'english'), azkarCard(a, 'bangla')])]

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
    const short = fitCardType(hadithCard(hadithCollection.find((h) => h.id === 'purity')!, 'english'), 'portrait')
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
    const meta = cardPostMetadata([hadithCard(hadithCollection[0]!, 'english')], ['JariyahNow', 'Quran'])
    expect(meta.hashtags).toContain('#JariyahNow')
    expect(meta.hashtags).not.toContain('#Quran')
    expect(meta.description).toContain(`Source: ${hadithCollection[0]!.source}`)
  })
})

describe('cardThemes', () => {
  it('have unique keys and both light and dark designs', () => {
    expect(new Set(cardThemes.map((t) => t.key)).size).toBe(cardThemes.length)
    expect(cardThemes.some((t) => t.light)).toBe(true)
    expect(cardThemes.some((t) => !t.light)).toBe(true)
  })
})
