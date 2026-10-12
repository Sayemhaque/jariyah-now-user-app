'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchAyatData, fetchAudioPauses, fetchSurahs, getAudioDurationMs } from '@/lib/quranApi'
import { fetchVerseTimings } from '@/lib/fetchVerseTimings'
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

      const arWordCount = data.arabicText.split(/\s+/).filter(Boolean).length
      const numBreakpoints = arWordCount > 20 ? Math.ceil(arWordCount / 8) - 1 : 0
      const [audioDurationMs, audioPauses] = await Promise.all([
        getAudioDurationMs(data.audioUrl),
        numBreakpoints > 0
          ? fetchAudioPauses(data.audioUrl, numBreakpoints)
          : Promise.resolve([]),
      ])

      return {
        ...data,
        audioDurationMs,
        ...(audioPauses.length ? { audioPauses } : {}),
      }
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
