import type { AyatSlide, VideoSettings } from '@/lib/types'
import type { computeTextSizes } from '../layout'
import { useAyahPages } from '../useAyahPages'
import { useSlideMotion } from '../useSlideMotion'

export function useStyleSlide(
  slide: AyatSlide,
  durationInFrames: number,
  settings: VideoSettings,
  sizes: ReturnType<typeof computeTextSizes>,
  area: { maxWidth: number; availableHeight: number },
) {
  const motion = useSlideMotion(durationInFrames)
  const pages = useAyahPages(slide, settings, sizes, area, motion.timeMs)
  return { motion, pages }
}

export const pageMotionStyle = (pages: ReturnType<typeof useAyahPages>) => ({
  opacity: pages.state.opacity,
  transform: `translateY(${pages.state.shift * pages.fitted.arabic * 0.35}px)`,
})
