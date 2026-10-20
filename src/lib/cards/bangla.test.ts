import { describe, it, expect } from 'vitest'
import { azkarCollection } from '@/lib/collections/azkar'
import { masnoonSurahs } from '@/lib/collections/masnoonSurahs'
import { quranicDuas } from '@/lib/collections/quranicDuas'
import { toHadiths } from '@/lib/hadith/hadithApi'
import benBukhari from '@/lib/hadith/fixtures/ben-bukhari-2.json'
import benTirmidhi from '@/lib/hadith/fixtures/ben-tirmidhi-1.json'
import { banglaGrade, banglaNote, bnDigits } from './bangla'
import { azkarCard, hadithCard, quranCards } from './cardContent'
import { isBanglaTranslation, presetCardTitle } from './presetTitle'

describe('Bangla cards', () => {
  it('gives every dua, masnoon surah and zikr a Bangla title', () => {
    ;[...quranicDuas, ...masnoonSurahs, ...azkarCollection].forEach((item) => expect(item.titleBn, item.id).toMatch(/[ঀ-৿]/))
  })

  it('titles a Bangla hadith with the collection name and a Bangla reference', () => {
    const card = hadithCard(toHadiths(benBukhari, 'bukhari', 'bangla', 2)[0]!)
    expect(card).toMatchObject({ eyebrow: 'হাদিস', title: 'সহীহ বুখারী', reference: 'হাদিস নং ৮' })
    const tirmidhi = hadithCard(toHadiths(benTirmidhi, 'tirmidhi', 'bangla', 1)[2]!)
    expect(tirmidhi.reference).toBe('হাদিস নং ৩ · হাসান সহীহ')
  })

  it('uses the Bangla title and note for a zikr in Bangla', () => {
    const card = azkarCard(azkarCollection.find((a) => a.id === 'sayyidul-istighfar')!, 'bangla')
    expect(card).toMatchObject({ eyebrow: 'আজকার', title: 'সাইয়্যিদুল ইস্তিগফার', note: 'সকাল ও সন্ধ্যায়' })
  })

  it('switches Quran card labels to Bangla with the Bangla translation', () => {
    const dua = quranicDuas.find((d) => d.id === 'dunya-akhirah')!
    expect(isBanglaTranslation('bengali')).toBe(true)
    expect(presetCardTitle('duas', dua, 'Al-Baqarah', true)).toBe('দুনিয়া ও আখিরাতের কল্যাণ')
    expect(presetCardTitle('duas', dua, 'Al-Baqarah', false)).toBe(dua.title)
    expect(presetCardTitle('masnoon', masnoonSurahs.find((s) => s.id === 'mulk')!, 'Al-Mulk', false)).toBe('Al-Mulk')
    const [card] = quranCards({ bangla: true, kind: 'dua', title: 'x', surahName: 'Al-Baqarah', surahNameArabic: 'البقرة', surahNumber: 2, ayat: [{ number: 201, arabic: 'ر', translation: 'হে আমাদের রব' }] }, 'portrait')
    expect(card!.eyebrow).toBe('কুরআনের দোয়া')
  })

  it('converts digits, grades and notes', () => {
    expect(bnDigits(6306)).toBe('৬৩০৬')
    expect(banglaGrade('Hasan Sahih')).toBe('হাসান সহীহ')
    expect(banglaNote('Three times morning and evening')).toBe('সকাল-সন্ধ্যায় তিনবার')
    expect(banglaNote('Something else')).toBe('Something else')
  })
})
