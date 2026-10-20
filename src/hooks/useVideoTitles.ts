import { useMemo } from 'react'
import { useBuilderStore } from '@/lib/store'
import { useContent } from '@/lib/contentStore'
import { videoAttributionLine } from '@/lib/translations'
import { presetHeadline } from '@/lib/collections'
import { isTextSlide, textVideoTitles } from '@/lib/collections/textSlide'

export function useVideoTitles() {
  const firstSlide = useBuilderStore((s) => s.ayatList[0])
  const surah = useBuilderStore((s) => s.getSelectedSurah())
  const reciter = useBuilderStore((s) => s.getReciter())
  const translationKey = useBuilderStore((s) => s.translationKey)
  const { mode, presetId, loadedText } = useContent()

  return useMemo(() => {
    if (isTextSlide(firstSlide) && loadedText) {
      return { titles: textVideoTitles(loadedText.mode, loadedText.item), attributionLine: '', loadedText, headline: undefined }
    }
    const titles = { surahName: surah?.name ?? '', surahNameArabic: surah?.arabicName ?? '', surahMeaning: surah?.englishName ?? '', reciterName: reciter?.name ?? '' }
    return { titles, attributionLine: videoAttributionLine(translationKey), loadedText: null, headline: presetHeadline(mode, presetId) }
  }, [firstSlide, loadedText, surah, reciter, translationKey, mode, presetId])
}
