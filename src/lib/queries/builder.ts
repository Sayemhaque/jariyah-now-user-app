'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchAyatData, fetchSurahs, getAudioDurationMs } from '@/lib/quranApi'
import { fetchVerseTimings } from '@/lib/fetchVerseTimings'
import { analyzeSpeechInBrowser } from '@/lib/speech/browserSpeech'
import { syncWords } from '@/lib/speech/syncWords'
import type { AyatData, Surah } from '@/lib/types'

export interface AyatRangeQueryParams {
  surah: Surah
  fromAyat: number
  toAyat: number
  recitationId: number
  quranComId?: number
  audioKey: string
  translationKey: string
  useTajweed: boolean
}

export const builderQueryKeys = {
  surahs: ['builder', 'surahs'] as const,
  ayatRange: (params: AyatRangeQueryParams) =>
    [
      'builder',
      'ayat-range',
      params.surah.number,
      params.fromAyat,
      params.toAyat,
      params.recitationId,
      params.quranComId ?? 0,
      params.audioKey,
      params.translationKey,
      params.useTajweed ? 1 : 0,
    ] as const,
}

export async function fetchAyatRangeData({
  surah,
  fromAyat,
  toAyat,
  recitationId,
  quranComId,
  audioKey,
  translationKey,
  useTajweed,
}: AyatRangeQueryParams): Promise<AyatData[]> {
  const ayatNumbers: number[] = []

  for (let ayat = fromAyat; ayat <= toAyat; ayat++) {
    ayatNumbers.push(ayat)
  }

  const resolved = await Promise.all(
    ayatNumbers.map(async (ayat) => {
      const [fetched, timings] = await Promise.all([
        fetchAyatData(surah.number, ayat, recitationId, audioKey, surah.name, surah.arabicName, translationKey, useTajweed),
        quranComId ? fetchVerseTimings(surah.number, ayat, quranComId) : Promise.resolve(null),
      ])
      if (!fetched) return null
      const data = timings ? { ...fetched, audioUrl: timings.audioUrl, words: timings.words } : fetched

      const [audioDurationMs, speech] = await Promise.all([getAudioDurationMs(data.audioUrl), analyzeSpeechInBrowser(data.audioUrl)])
      const words = syncWords({ arabicText: data.arabicText, timedWords: data.words, durationMs: audioDurationMs, speech })
      return { ...data, audioDurationMs, ...(words ? { words } : {}) }
    }),
  )

  return resolved.filter((item): item is AyatData => item !== null)
}

export function useSurahsQuery() {
  return useQuery({
    queryKey: builderQueryKeys.surahs,
    queryFn: fetchSurahs,
    staleTime: 1000 * 60 * 60,
  })
}

export function useAyatRangeQuery(
  params: AyatRangeQueryParams | null,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: params ? builderQueryKeys.ayatRange(params) : ['builder', 'ayat-range', 'idle'],
    queryFn: () => {
      if (!params) {
        throw new Error('Ayat range query called without params')
      }
      return fetchAyatRangeData(params)
    },
    enabled: enabled && Boolean(params),
    staleTime: 1000 * 60 * 10,
  })
}
