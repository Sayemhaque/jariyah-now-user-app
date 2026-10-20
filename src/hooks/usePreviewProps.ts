import { useMemo } from 'react'
import { useBuilderStore } from '@/lib/store'
import { computeSlideFrames } from '@/lib/advanceTiming'
import { videoFps } from '@/lib/constants'
import { aspectRatios } from '@/remotion/types'
import { useVideoTitles } from './useVideoTitles'

export function usePreviewProps() {
  const slides = useBuilderStore((s) => s.ayatList)
  const settings = useBuilderStore((s) => s.settings)
  const { titles, attributionLine } = useVideoTitles()

  const { totalFrames, offsets } = useMemo(() => computeSlideFrames(slides, videoFps), [slides])
  const inputProps = useMemo(
    () => ({ slides, settings, orientation: settings.orientation, attributionLine, ...titles, totalAyats: slides.length }),
    [slides, settings, titles, attributionLine],
  )

  return { slides, inputProps, totalFrames, frameOffsets: offsets, aspect: aspectRatios[settings.orientation]! }
}
