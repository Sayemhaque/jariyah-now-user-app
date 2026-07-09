'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchAyatData, fetchAudioPauses, fetchSurahs, getAudioDurationMs } from '@/lib/quranApi'
import type { AyatData, Surah } from '@/lib/types'

export interface AyatRangeQueryParams {
  surah: Surah
  fromAyat: number
  toAyat: number
  recitationId: number
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
      const data = await fetchAyatData(
        surah.number,
        ayat,
        recitationId,
        audioKey,
        surah.name,
        surah.arabicName,
        translationKey,
        useTajweed,
      )

      if (!data) return null

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
