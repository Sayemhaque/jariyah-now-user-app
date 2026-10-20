import { useMemo } from 'react'
import { useBuilderStore } from '@/lib/store'
import { reciters } from '@/lib/reciters'
import { videoAttributionLine } from '@/lib/translations'
import { toExportSlides } from '@/lib/export/renderJob'
import { buildPostMetadata } from '@/lib/daily/plan'

export function useExportDetails() {
  const ayatList = useBuilderStore((s) => s.ayatList)
  const surahs = useBuilderStore((s) => s.surahs)
  const selectedSurahNumber = useBuilderStore((s) => s.selectedSurahNumber)
  const reciterId = useBuilderStore((s) => s.reciterId)
  const translationKey = useBuilderStore((s) => s.translationKey)
  const settings = useBuilderStore((s) => s.settings)
  const fromAyat = useBuilderStore((s) => s.fromAyat)
  const toAyat = useBuilderStore((s) => s.toAyat)

  const surah = useMemo(() => surahs.find((s) => s.number === selectedSurahNumber), [surahs, selectedSurahNumber])
  const reciter = useMemo(() => reciters.find((r) => r.id === reciterId) ?? reciters[0]!, [reciterId])
  const slides = useMemo(() => toExportSlides(ayatList, surah), [ayatList, surah])
  const totalMs = useMemo(() => ayatList.reduce((sum, a) => sum + (a.audioDurationMs || 0), 0), [ayatList])
  const filename = `quran-${surah?.number ?? 0}-ayat-${fromAyat}-${toAyat}-${reciter.id}.mp4`

  const caption = surah ? buildPostMetadata({ surah, fromAyat, toAyat, reciterName: reciter.name }).shortCaption : ''

  const buildRequest = (quality: string) => ({
    slides,
    settings,
    orientation: settings.orientation,
    reciterName: reciter.name,
    attributionLine: videoAttributionLine(translationKey),
    surahName: surah?.name ?? '',
    surahNameArabic: surah?.arabicName ?? '',
    surahMeaning: surah?.englishName ?? '',
    totalAyats: slides.length,
    quality,
  })

  return { slides, totalMs, filename, caption, orientation: settings.orientation, buildRequest }
}
