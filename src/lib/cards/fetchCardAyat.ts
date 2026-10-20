import { fetchAyatData } from '@/lib/quranApi'
import { reciters } from '@/lib/reciters'
import type { CardAyah } from './cardContent'

export async function fetchCardAyat(surah: number, fromAyat: number, toAyat: number, translationKey: string): Promise<CardAyah[]> {
  const reciter = reciters[0]!
  const numbers = Array.from({ length: toAyat - fromAyat + 1 }, (_, i) => fromAyat + i)
  const ayat = await Promise.all(numbers.map((n) => fetchAyatData(surah, n, reciter.recitationId, reciter.audioKey, '', '', translationKey)))
  return ayat.map((a, i) => {
    if (!a) throw new Error(`Could not load ayah ${surah}:${numbers[i]}`)
    return { number: a.ayatNumber, arabic: a.arabicText, translation: a.translation }
  })
}
