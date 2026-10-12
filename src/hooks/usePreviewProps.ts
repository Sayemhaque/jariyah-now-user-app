import { useMemo } from 'react'
import { useBuilderStore } from '@/lib/store'
import { reciters } from '@/lib/reciters'
import { videoAttributionLine } from '@/lib/translations'
import { computeSlideFrames } from '@/lib/advanceTiming'
import { videoFps } from '@/lib/constants'
import { aspectRatios } from '@/remotion/types'

export function usePreviewProps() {
  const slides = useBuilderStore((s) => s.ayatList)
  const surahs = useBuilderStore((s) => s.surahs)
  const selectedSurahNumber = useBuilderStore((s) => s.selectedSurahNumber)
  const reciterId = useBuilderStore((s) => s.reciterId)
  const translationKey = useBuilderStore((s) => s.translationKey)
  const settings = useBuilderStore((s) => s.settings)

  const { totalFrames, offsets } = useMemo(() => computeSlideFrames(slides, videoFps), [slides])
  const inputProps = useMemo(() => {
    const surah = surahs.find((s) => s.number === selectedSurahNumber)
    const reciter = reciters.find((r) => r.id === reciterId) ?? reciters[0]!
    return {
      slides,
      settings,
      orientation: settings.orientation,
      reciterName: reciter.name,
      attributionLine: videoAttributionLine(translationKey),
      surahName: surah?.name ?? '',
      surahNameArabic: surah?.arabicName ?? '',
      totalAyats: slides.length,
    }
  }, [slides, settings, surahs, selectedSurahNumber, reciterId, translationKey])

  return { slides, inputProps, totalFrames, frameOffsets: offsets, aspect: aspectRatios[settings.orientation]! }
}
