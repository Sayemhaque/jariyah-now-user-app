// Shared types for the Quran Video Generator

export interface Surah {
  number: number
  name: string          // English name
  englishName: string
  arabicName: string
  numberOfAyahs: number
  revelationType: 'Meccan' | 'Medinan'
}

export interface WordTiming {
  text: string
  position: number
  startMs: number
  endMs: number
  // transliteration from the API when available
  transliteration?: string
}

export interface AyatData {
  surahNumber: number
  ayatNumber: number
  arabicText: string
  translation: string
  words: WordTiming[]
  audioUrl: string
  audioDurationMs: number
  // Surah display info — denormalized onto each ayat so the slide renderer
  // has everything it needs without a separate lookup.
  surahName: string
  surahNameArabic: string
}

export interface AyatSlide {
  arabicText: string
  words: { text: string; startMs: number; endMs: number }[]
  translation: string
  transliteration?: string
  surahName: string
  surahNameArabic: string
  ayatNumber: number
  surahNumber: number
  audioUrl: string
  audioDurationMs: number
}

export interface Reciter {
  id: string
  name: string
  arabicName: string
  style: string
  // Used to build verses.quran.com audio URL: https://verses.quran.com/{audioKey}/{surah}{ayat}.mp3
  audioKey: string
  // Used to query word timings from api.quran.com
  recitationId: number
  avatarColor: string  // used as a fallback avatar background
}

export type Orientation = 'landscape' | 'portrait'
export type FontStyle = 'uthmani' | 'naskh'

/**
 * Overlay style presets. Each one shapes the user's overlayColor/opacity
 * differently across the frame.
 *   solid           — flat color across the whole frame
 *   bottom-gradient — transparent at top → solid at bottom (good for caption text)
 *   top-gradient    — solid at top → transparent at bottom
 *   vignette        — radial, darker at the edges, clear in the middle
 *   center-focus    — radial, clear at the middle, darker at the edges (spotlight)
 *   none            — no overlay at all
 */
export type OverlayStyle =
  | 'solid'
  | 'bottom-gradient'
  | 'top-gradient'
  | 'vignette'
  | 'center-focus'
  | 'none'

export interface VideoSettings {
  backgroundImage: string      // URL or data URL
  backgroundPreset: string     // preset key or 'custom'
  overlayStyle: OverlayStyle
  overlayColor: string         // hex
  overlayOpacity: number       // 0–80
  fontColor: string            // hex
  highlightColor: string       // hex, default #F5A623
  arabicFontSize: number       // 24–72
  translationFontSize: number  // 14–32
  fontStyle: FontStyle
  showTranslation: boolean
  showTransliteration: boolean
  orientation: Orientation
  /** When true, arabic + translation font sizes auto-scale to the orientation. */
  autoFitFonts: boolean
}

export interface ExportOptions {
  platform: 'reel' | 'shorts' | 'youtube'
  quality: '720p' | '1080p'
  filename: string
}

/**
 * Auto-fit font sizes for each orientation. Used when `autoFitFonts` is on,
 * and also applied as sensible defaults whenever the user changes orientation.
 * These are "design-space" sizes at a reference preview width of ~400px; the
 * preview itself scales them proportionally via CSS container queries.
 */
export const AUTO_FONT_SIZES: Record<Orientation, { arabic: number; translation: number }> = {
  portrait: { arabic: 30, translation: 14 },
  landscape: { arabic: 34, translation: 15 },
}
