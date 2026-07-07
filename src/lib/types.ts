// Shared types for the Jariyah Now Quran Video Generator

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
  // ─── Structural Quran markers (Juz / Hizb / Rubʿ al-Hizb / Ruku / Manzil / Page) ───
  // Sourced from api.quran.com's `fields` query param. All optional because
  // older cached responses may not include them.
  juzNumber?: number
  hizbNumber?: number
  rubElHizbNumber?: number
  rukuNumber?: number
  manzilNumber?: number
  pageNumber?: number
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
  // Structural markers — passed through from AyatData so the export
  // renderer can draw them on the canvas.
  juzNumber?: number
  hizbNumber?: number
  rubElHizbNumber?: number
  rukuNumber?: number
  manzilNumber?: number
  pageNumber?: number
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

/**
 * Arabic font choices — 6 fonts spanning classical calligraphic → modern
 * sans-serif. The class names in globals.css match these keys
 * (`.font-arabic-{key}`).
 */
export type ArabicFont =
  | 'uthmani'        // Amiri — classical Uthmani, calligraphic
  | 'scheherazade'   // Scheherazade New — traditional Naskh
  | 'naskh'          // Noto Naskh Arabic — clean modern Naskh
  | 'kufi'           // Reem Kufi — geometric Kufi, contemporary
  | 'cairo'          // Cairo — modern sans-serif Arabic
  | 'amiri'          // Alias for uthmani (backwards compat)

/**
 * Bengali font choices — 3 fonts covering sans-serif (default), serif
 * (formal/scholarly), and a clean modern variant. Class names in
 * globals.css match these keys (`.font-bengali-{key}`).
 */
export type BengaliFont = 'sans' | 'serif' | 'hind'

/** Backwards-compat alias — old code used `FontStyle` for Arabic font
 *  selection. Kept so existing stores/tests don't break. New code should
 *  use `ArabicFont` directly. */
export type FontStyle = ArabicFont

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

export type TextWidth = 'full' | 'wide' | 'medium' | 'narrow'
export type TextSpacing = 'compact' | 'normal' | 'spacious'

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
  /** Arabic font selection (6 options). Drives the .font-arabic-{key} class. */
  arabicFont: ArabicFont
  /** Bengali font selection (3 options). Drives the .font-bengali-{key} class
   *  when the selected translation is Bengali. */
  bengaliFont: BengaliFont
  showTranslation: boolean
  showTransliteration: boolean
  orientation: Orientation
  /** When true, arabic + translation font sizes auto-scale to the orientation. */
  autoFitFonts: boolean
  /** How much horizontal padding the text block gets inside the card. */
  textWidth: TextWidth
  /** Gap between Arabic text and translation. */
  textSpacing: TextSpacing
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
