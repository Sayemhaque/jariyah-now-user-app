import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useBuilderStore } from '@/lib/store'
import { useContent } from '@/lib/contentStore'
import { findPreset, findTextItem } from '@/lib/collections'
import { presetParts } from '@/lib/collections/presetParts'
import { isPresetMode, isTextMode } from '@/lib/collections/types'
import { azkarCard, hadithCard, quranCards } from '@/lib/cards/cardContent'
import { fetchCardAyat } from '@/lib/cards/fetchCardAyat'
import type { CardContent } from '@/lib/cards/types'

export function useCardContents() {
  const { mode, presetId, partIndex, textItemId, language, cardFormat } = useContent()
  const surahs = useBuilderStore((s) => s.surahs)
  const translationKey = useBuilderStore((s) => s.translationKey)
  const preset = isPresetMode(mode) ? findPreset(mode, presetId) : undefined
  const part = preset ? presetParts(preset)[partIndex] : undefined

  const ayatQuery = useQuery({
    queryKey: ['card-ayat', preset?.surah, part?.fromAyat, part?.toAyat, translationKey],
    queryFn: () => fetchCardAyat(preset!.surah, part!.fromAyat, part!.toAyat, translationKey),
    enabled: Boolean(preset && part),
    staleTime: 1000 * 60 * 60,
  })

  const cards = useMemo<CardContent[]>(() => {
    if (isTextMode(mode)) {
      const item = findTextItem(mode, textItemId)
      return item ? [mode === 'hadith' ? hadithCard(item, language) : azkarCard(item, language)] : []
    }
    const surah = surahs.find((s) => s.number === preset?.surah)
    if (!preset || !surah || !ayatQuery.data) return []
    const title = mode === 'duas' ? preset.title : surah.name
    return quranCards({ kind: mode === 'duas' ? 'dua' : 'masnoon', title, surahName: surah.name, surahNameArabic: surah.arabicName, surahNumber: surah.number, ayat: ayatQuery.data }, cardFormat)
  }, [mode, textItemId, language, preset, surahs, ayatQuery.data, cardFormat])

  return { cards, isLoading: ayatQuery.isFetching, error: ayatQuery.error }
}
