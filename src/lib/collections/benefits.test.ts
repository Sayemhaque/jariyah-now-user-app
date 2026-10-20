import { describe, it, expect } from 'vitest'
import { azkarCollection } from './azkar'
import { azkarBenefits, presetBenefits } from './benefits'
import { masnoonSurahs } from './masnoonSurahs'
import { quranicDuas } from './quranicDuas'
import { azkarCard, quranCards } from '@/lib/cards/cardContent'
import { banglaSource } from '@/lib/cards/bangla'
import { cardPostMetadata } from '@/lib/cards/cardPostMetadata'

const authenticSources = /^(Sahih al-Bukhari|Sahih Muslim|Jami' at-Tirmidhi|Sunan Abi Dawud) \d+$/
const withoutAuthenticVirtue = ['yasin', 'waqiah', 'hashr-end']

describe('benefits', () => {
  it('gives masnoon surahs their benefit, and none where only weak narrations exist', () => {
    masnoonSurahs.forEach((s) => expect(Boolean(presetBenefits[s.id]), s.id).toBe(!withoutAuthenticVirtue.includes(s.id)))
    expect(masnoonSurahs.find((s) => s.id === 'yasin')!.note).not.toMatch(/heart/i)
  })

  it('only points at real presets and azkar, in English and Bangla, with a cited source', () => {
    const presetIds = new Set([...masnoonSurahs, ...quranicDuas].map((p) => p.id))
    Object.entries(presetBenefits).forEach(([id, b]) => {
      expect(presetIds.has(id), id).toBe(true)
      expect(b.bn, id).toMatch(/[ঀ-৿]/)
      expect(b.source, id).toMatch(authenticSources)
    })
    const azkarIds = new Set(azkarCollection.map((a) => a.id))
    Object.entries(azkarBenefits).forEach(([id, b]) => {
      expect(azkarIds.has(id), id).toBe(true)
      expect(b.source, id).toMatch(authenticSources)
    })
  })

  it('shows the zikr benefit on its card in the chosen language', () => {
    const item = azkarCollection.find((a) => a.id === 'hawqala')!
    expect(azkarCard(item, 'english').benefit).toEqual({ text: 'A treasure from the treasures of Paradise', source: 'Sahih al-Bukhari 6384' })
    expect(azkarCard(item, 'bangla').benefit).toEqual({ text: 'জান্নাতের ভান্ডারসমূহের একটি ভান্ডার', source: 'সহীহ বুখারী ৬৩৮৪' })
    expect(item.english).not.toMatch(/treasure/)
  })

  it('puts a surah benefit on the first carousel slide only and in the caption', () => {
    const ayat = Array.from({ length: 6 }, (_, i) => ({ number: i + 1, arabic: 'ب'.repeat(200), translation: 'w'.repeat(200) }))
    const cards = quranCards({ kind: 'masnoon', title: 'Al-Mulk', surahName: 'Al-Mulk', surahNameArabic: 'الملك', surahNumber: 67, ayat, benefit: presetBenefits.mulk }, 'portrait')
    expect(cards[0]!.benefit?.text).toMatch(/intercede/)
    cards.slice(1).forEach((c) => expect(c.benefit).toBeUndefined())
    expect(cardPostMetadata(cards).description).toContain(`✦ ${presetBenefits.mulk!.en} (${presetBenefits.mulk!.source})`)
  })

  it('writes sources in Bangla', () => {
    expect(banglaSource("Jami' at-Tirmidhi 2891")).toBe('জামে আত-তিরমিজি ২৮৯১')
  })
})
