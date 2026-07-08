// ─────────────────────────────────────────────────────────────────────────────
// Zikr Reels — presets for the /zikr page.
//
// Each preset describes one short dhikr phrase (SubhanAllah, Alhamdulillah,
// etc.) with Arabic text, transliteration, English meaning, a default
// repetition count, and the path to a generated MP3 audio clip in
// /public/zikr-audio/{id}.mp3.
//
// The Zikr Reels page lets the user:
//   • pick a zikr from this list
//   • pick a repetition count (33 / 99 / 100 / 500)
//   • pick a pacing (realtime / fast / ultrafast)
//   • pick a background image (reuses the Quran generator's presets)
//   • customize the font + overlay
//   • export a 9:16 MP4 reel
//
// Audio: each zikr MP3 is generated via espeak-ng (Arabic voice) + ffmpeg
// (pitch shift + EQ for a deep male sound). The Zikr Reels page loops the
// clip via Web Audio API and overlays an ambient drone (background.mp3)
// for atmosphere.
// ─────────────────────────────────────────────────────────────────────────────

export type ZikrPacing = 'realtime' | 'fast' | 'ultrafast'

export interface ZikrPreset {
  /** URL-safe id — also the audio clip filename stem. */
  id: string
  /** Arabic text — rendered large on the preview + canvas. */
  arabic: string
  /** Latin transliteration — shown under the Arabic in the preview + canvas. */
  transliteration: string
  /** Short English meaning — shown under the transliteration. */
  meaning: string
  /** Default repetition count when the user opens the page with no preset. */
  defaultCount: number
  /** Path to the MP3 audio clip (relative to /public). */
  audioClip: string
}

export const ZIKR_PRESETS: ZikrPreset[] = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ ٱللَّٰهِ',
    transliteration: 'SubhanAllah',
    meaning: 'Glory be to Allah',
    defaultCount: 33,
    audioClip: '/zikr-audio/subhanallah.mp3',
  },
  {
    id: 'alhamdulillah',
    arabic: 'ٱلْحَمْدُ لِلَّٰهِ',
    transliteration: 'Alhamdulillah',
    meaning: 'All praise is for Allah',
    defaultCount: 33,
    audioClip: '/zikr-audio/alhamdulillah.mp3',
  },
  {
    id: 'allahu-akbar',
    arabic: 'ٱللَّٰهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    meaning: 'Allah is the Greatest',
    defaultCount: 34,
    audioClip: '/zikr-audio/allahu-akbar.mp3',
  },
  {
    id: 'la-ilaha-illallah',
    arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ',
    transliteration: 'La ilaha illallah',
    meaning: 'There is no god but Allah',
    defaultCount: 100,
    audioClip: '/zikr-audio/la-ilaha-illallah.mp3',
  },
  {
    id: 'astaghfirullah',
    arabic: 'أَسْتَغْفِرُ ٱللَّٰهَ',
    transliteration: 'Astaghfirullah',
    meaning: 'I seek forgiveness from Allah',
    defaultCount: 100,
    audioClip: '/zikr-audio/astaghfirullah.mp3',
  },
  {
    id: 'la-hawla',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّٰهِ',
    transliteration: 'La hawla wa la quwwata illa billah',
    meaning: 'There is no power except with Allah',
    defaultCount: 100,
    audioClip: '/zikr-audio/la-hawla.mp3',
  },
]

/** Repetition count presets — surfaced as quick-select chips. */
export const ZIKR_COUNT_PRESETS: number[] = [33, 99, 100, 500]

/** Path to the ambient background drone MP3 (always-on, low volume). */
export const ZIKR_BACKGROUND_AUDIO = '/zikr-audio/background.mp3'

/** Per-utterance duration in milliseconds for each pacing.
 *  `realtime` ≈ natural human cadence (~2.4s per utterance).
 *  `fast`     ≈ quick recitation (~1.2s per utterance).
 *  `ultrafast` ≈ rapid-fire meditative pace (~0.7s per utterance).
 */
const PACING_DURATION_MS: Record<ZikrPacing, number> = {
  realtime: 2400,
  fast: 1200,
  ultrafast: 700,
}

/**
 * Estimate the total video duration for a given count + pacing.
 * Returns milliseconds. Used by the Zikr page to size the progress bar
 * and to drive the export canvas's render loop.
 *
 * We add a small lead-in (300ms) and lead-out (800ms) so the first + last
 * utterance aren't clipped. The total grows linearly with count.
 */
export function estimateZikrDuration(
  count: number,
  pacing: ZikrPacing,
): number {
  const perUtterance = PACING_DURATION_MS[pacing]
  const leadIn = 300
  const leadOut = 800
  return leadIn + count * perUtterance + leadOut
}

/**
 * For a given pacing, return the per-utterance duration in milliseconds.
 * Used by the Zikr page's playback loop to advance the counter at the right
 * cadence (and by the export canvas to know how many utterances to draw).
 */
export function getCounterStep(pacing: ZikrPacing): number {
  return PACING_DURATION_MS[pacing]
}

/** Look up a zikr preset by id (case-insensitive). Returns the first match
 *  or `undefined` if the id is unknown. */
export function getZikrById(id: string): ZikrPreset | undefined {
  const lower = id.toLowerCase()
  return ZIKR_PRESETS.find((z) => z.id === lower)
}
