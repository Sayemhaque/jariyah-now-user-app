import type { VideoSettings, AyatSlide, Orientation } from '@/lib/types'

export interface AyatVideoProps {
  slides: AyatSlide[]
  settings: VideoSettings
  orientation: Orientation
  reciterName: string
  attributionLine: string
  surahName: string
  surahNameArabic: string
  totalAyats: number
  quality?: '480p' | '720p' | '1080p'
  isExport?: boolean
  preLooped?: boolean
}

export const resolutions: Record<Orientation, { w: number; h: number }> = {
  landscape: { w: 1280, h: 720 },
  portrait: { w: 720, h: 1280 },
}

export const renderQualityScale: Record<string, number> = {
  '480p': 0.667,
  '720p': 1,
  '1080p': 1.5,
}

export const aspectRatios: Record<string, { w: number; h: number; ratio: string }> = {
  landscape: { w: 1280, h: 720, ratio: '16 / 9' },
  portrait: { w: 720, h: 1280, ratio: '9 / 16' },
}

export const textWidthFractions: Record<string, number> = {
  full: 0.94,
  wide: 0.82,
  medium: 0.70,
  narrow: 0.58,
}

export const textSpacingFractions: Record<string, number> = {
  compact: 0.01,
  normal: 0.03,
  spacious: 0.06,
}

export const orientationFontBase: Record<string, { ar: number; tr: number; arRef: number; trRef: number }> = {
  portrait: { ar: 9.4, tr: 3.0, arRef: 30, trRef: 14 },
  landscape: { ar: 6.0, tr: 1.9, arRef: 34, trRef: 15 },
}
