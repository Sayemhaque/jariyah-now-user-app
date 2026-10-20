import { useMemo } from 'react'
import { useBuilderStore } from '@/lib/store'
import { toExportSlides } from '@/lib/export/renderJob'
import { buildPostMetadata } from '@/lib/daily/plan'
import { buildTextPostMetadata } from '@/lib/collections/textPostMetadata'
import { useVideoTitles } from './useVideoTitles'

export function useExportDetails() {
  const ayatList = useBuilderStore((s) => s.ayatList)
  const surah = useBuilderStore((s) => s.getSelectedSurah())
  const reciter = useBuilderStore((s) => s.getReciter())
  const settings = useBuilderStore((s) => s.settings)
  const fromAyat = useBuilderStore((s) => s.fromAyat)
  const toAyat = useBuilderStore((s) => s.toAyat)
  const { titles, attributionLine, loadedText, headline } = useVideoTitles()

  const slides = useMemo(() => toExportSlides(ayatList, surah), [ayatList, surah])
  const totalMs = useMemo(() => ayatList.reduce((sum, a) => sum + (a.audioDurationMs || 0), 0), [ayatList])
  const filename = loadedText
    ? `${loadedText.mode}-${loadedText.item.id}.mp4`
    : `quran-${surah?.number ?? 0}-ayat-${fromAyat}-${toAyat}-${reciter?.id ?? 'reciter'}.mp4`

  const caption = loadedText
    ? buildTextPostMetadata(loadedText).shortCaption
    : surah
      ? buildPostMetadata({ surah, fromAyat, toAyat, reciterName: titles.reciterName, headline }).shortCaption
      : ''

  const buildRequest = (quality: string) => ({ slides, settings, orientation: settings.orientation, attributionLine, ...titles, totalAyats: slides.length, quality })

  return { slides, totalMs, filename, caption, orientation: settings.orientation, buildRequest }
}
