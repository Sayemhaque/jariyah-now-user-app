import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useBuilderStore } from '@/lib/store'
import { useContent } from '@/lib/contentStore'
import { findPreset, findTextItem } from '@/lib/collections'
import { presetParts } from '@/lib/collections/presetParts'
import { isPresetMode, isTextMode } from '@/lib/collections/types'
import { azkarCard, hadithCard, quranCards } from '@/lib/cards/cardContent'
import { fetchCardAyat } from '@/lib/cards/fetchCardAyat'
import { isBanglaTranslation, presetCardTitle } from '@/lib/cards/presetTitle'
import { presetBenefits } from '@/lib/collections/benefits'
import type { CardContent } from '@/lib/cards/types'
import { useHadithSection } from './useHadithSection'

export function useCardContents() {
  const { mode, presetId, partIndex, textItemId, language, cardFormat, hadithBook, hadithSection, hadithNumber } = useContent()
  const hadithQuery = useHadithSection(hadithBook, hadithSection, language)
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
    if (mode === 'hadith') {
      const hadith = hadithQuery.data?.find((h) => h.number === hadithNumber)
      return hadith ? [hadithCard(hadith)] : []
    }
    if (isTextMode(mode)) {
      const item = findTextItem(mode, textItemId)
      return item ? [azkarCard(item, language)] : []
    }
    const surah = surahs.find((s) => s.number === preset?.surah)
    if (!isPresetMode(mode) || !preset || !surah || !ayatQuery.data) return []
    const bangla = isBanglaTranslation(translationKey)
    const title = presetCardTitle(mode, preset, surah.name, bangla)
    return quranCards({ bangla, benefit: presetBenefits[preset.id], kind: mode === 'duas' ? 'dua' : 'masnoon', title, surahName: surah.name, surahNameArabic: surah.arabicName, surahNumber: surah.number, ayat: ayatQuery.data }, cardFormat)
  }, [mode, textItemId, language, preset, surahs, ayatQuery.data, cardFormat, hadithQuery.data, hadithNumber, translationKey])

  return { cards, isLoading: ayatQuery.isFetching || (mode === 'hadith' && hadithQuery.isFetching), error: ayatQuery.error }
}
