import { useMemo } from 'react'
import { useBuilderStore } from '@/lib/store'
import { useAyatRangeQuery } from '@/lib/queries/builder'
import { reciters } from '@/lib/reciters'
import { validateAyatRange } from '@/lib/validation'

export function useAyatRange() {
  const surahs = useBuilderStore((s) => s.surahs)
  const selectedSurahNumber = useBuilderStore((s) => s.selectedSurahNumber)
  const fromAyat = useBuilderStore((s) => s.fromAyat)
  const toAyat = useBuilderStore((s) => s.toAyat)
  const reciterId = useBuilderStore((s) => s.reciterId)
  const translationKey = useBuilderStore((s) => s.translationKey)
  const useTajweed = useBuilderStore((s) => s.settings.useTajweed)

  const selectedSurah = useMemo(
    () => surahs.find((s) => s.number === selectedSurahNumber),
    [surahs, selectedSurahNumber],
  )
  const validation = useMemo(
    () => validateAyatRange(fromAyat, toAyat, selectedSurah),
    [fromAyat, toAyat, selectedSurah],
  )
  const reciter = useMemo(() => reciters.find((item) => item.id === reciterId) ?? reciters[0], [reciterId])
  const params = useMemo(
    () =>
      selectedSurah
        ? {
            surah: selectedSurah,
            fromAyat,
            toAyat,
            recitationId: reciter.recitationId,
            audioKey: reciter.audioKey,
            translationKey,
            useTajweed,
          }
        : null,
    [selectedSurah, fromAyat, toAyat, reciter, translationKey, useTajweed],
  )

  return { selectedSurah, validation, query: useAyatRangeQuery(params, false) }
}
