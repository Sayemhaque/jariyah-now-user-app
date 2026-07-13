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
  /** When true, use <OffthreadVideo> for background (frame-accurate server render).
   *  When false (default), use <Video> for smooth browser preview. */
  isExport?: boolean
  /** When true, the background video has been pre-looped server-side to match
   *  the total composition duration, so <Loop> wrapping is unnecessary. */
  preLooped?: boolean
}

export const RES: Record<Orientation, { w: number; h: number }> = {
  landscape: { w: 1280, h: 720 },
  portrait: { w: 720, h: 1280 },
}

export const RENDER_QUALITY_SCALE: Record<string, number> = {
  '480p': 0.667,
  '720p': 1,
  '1080p': 1.5,
}

export const ASPECT: Record<string, { w: number; h: number; ratio: string }> = {
  landscape: { w: 1280, h: 720, ratio: '16 / 9' },
  portrait: { w: 720, h: 1280, ratio: '9 / 16' },
}

export const TEXT_WIDTH_FRACTIONS: Record<string, number> = {
  full: 0.94,
  wide: 0.82,
  medium: 0.70,
  narrow: 0.58,
}

export const TEXT_SPACING_FRACTIONS: Record<string, number> = {
  compact: 0.01,
  normal: 0.03,
  spacious: 0.06,
}

export const ARABIC_FONT_CLASS: Record<string, string> = {
  uthmani: 'font-arabic-uthmani',
  amiri: 'font-arabic-uthmani',
  scheherazade: 'font-arabic-scheherazade',
  markazi: 'font-arabic-markazi',
  naskh: 'font-arabic-naskh',
  kufi: 'font-arabic-kufi',
  cairo: 'font-arabic-cairo',
}

export const BENGALI_FONT_CLASS: Record<string, string> = {
  sans: 'font-bengali-sans',
  serif: 'font-bengali-serif',
  hind: 'font-bengali-hind',
}

export const orientationFontBase: Record<string, { ar: number; tr: number; arRef: number; trRef: number }> = {
  portrait: { ar: 7.0, tr: 2.8, arRef: 30, trRef: 14 },
  landscape: { ar: 4.5, tr: 1.8, arRef: 34, trRef: 15 },
}
