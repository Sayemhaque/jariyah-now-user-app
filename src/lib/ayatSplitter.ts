/**
 * Split Long Ayah feature — types, logic, and helpers.
 *
 * When an ayah exceeds a word count threshold (default 15), the user can
 * split it into 2-3 parts. Each part becomes a sub-clip with its own
 * "Part X/N" caption. Audio is split using ffmpeg's silencedetect to
 * find natural pause points near the user's split selection.
 */

/** Word-level data from UmmahAPI /api/quran/words/{surah}/{ayah} */
export interface WordData {
  position: number
  arabic: string
  transliteration: string
  meaning: string
}

/** A silence point detected by ffmpeg's silencedetect filter. */
export interface SilencePoint {
  start: number   // seconds
  end: number     // seconds
  duration: number // seconds
}

/** A split segment — one part of the split ayah. */
export interface SplitSegment {
  partNumber: number      // 1-based (Part 1, Part 2, ...)
  totalParts: number
  wordFrom: number        // 0-based word index (inclusive)
  wordTo: number          // 0-based word index (exclusive)
  audioStartMs: number    // trimmed audio start (ms)
  audioEndMs: number      // trimmed audio end (ms)
  words: WordData[]       // words in this segment
}

/** Full split data for one ayah. */
export interface AyatSplit {
  surah: number
  ayat: number
  words: WordData[]
  splitPoints: number[]   // word indices where splits occur (0-based, the FIRST word of each new part)
  segments: SplitSegment[]
  audioUrl: string
  audioDurationMs: number
}

/** Default threshold — ayats with more than this many words show the split option. */
export const SPLIT_WORD_THRESHOLD = 15

/**
 * Check if an ayah should show the "Split into parts" option.
 * Uses the arabicText word count as a proxy (split by whitespace).
 */
export function isSplittable(arabicText: string, threshold: number = SPLIT_WORD_THRESHOLD): boolean {
  return arabicText.split(/\s+/).filter(Boolean).length > threshold
}

/**
 * Fetch word-by-word data from UmmahAPI.
 * GET /api/quran/words/{surah}/{ayah}
 */
export async function fetchWordData(
  surah: number,
  ayat: number,
): Promise<WordData[] | null> {
  try {
    const res = await fetch(`https://ummahapi.com/api/quran/words/${surah}/${ayat}`, {
      headers: { 'X-API-Key': process.env.NEXT_PUBLIC_UMMAHAPI_KEY ?? '' },
    })
    if (!res.ok) return null
    const json = await res.json()
    if (!json.success) return null
    const words = json.data?.words ?? []
    return words.map((w: {
      position: number
      arabic: string
      transliteration: { text: string } | string
      translation: string
    }) => ({
      position: w.position,
      arabic: w.arabic,
      transliteration: typeof w.transliteration === 'object' ? w.transliteration.text : w.transliteration,
      meaning: w.translation,
    }))
  } catch {
    return null
  }
}

/**
 * Fetch silence points from our server endpoint.
 * POST /api/silence-detect with { audioUrl }
 */
export async function fetchSilencePoints(audioUrl: string): Promise<SilencePoint[]> {
  try {
    const res = await fetch('/api/silence-detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioUrl }),
    })
    if (!res.ok) return []
    const json = await res.json()
    return json.silences ?? []
  } catch {
    return []
  }
}

/**
 * Given a split point (word index), find the nearest silence point
 * in the audio. Falls back to a proportional estimate if no silence
 * is found within the tolerance window.
 *
 * @param wordIndex  0-based index of the first word in the NEXT part
 * @param totalWords total word count
 * @param durationMs total audio duration in ms
 * @param silences   silence points from ffmpeg
 * @param toleranceMs how far from the estimate to look (default ±2000ms)
 */
export function snapToSilence(
  wordIndex: number,
  totalWords: number,
  durationMs: number,
  silences: SilencePoint[],
  toleranceMs: number = 2000,
): { startMs: number; endMs: number } {
  // Estimate: proportional split based on word count
  const estimateSec = (wordIndex / totalWords) * (durationMs / 1000)
  const toleranceSec = toleranceMs / 1000

  // Find the silence point closest to our estimate
  let best: SilencePoint | null = null
  let bestDist = Infinity
  for (const s of silences) {
    const midSec = (s.start + s.end) / 2
    const dist = Math.abs(midSec - estimateSec)
    if (dist < bestDist && dist < toleranceSec) {
      best = s
      bestDist = dist
    }
  }

  if (best) {
    // Use the silence midpoint as the cut point
    const cutMs = ((best.start + best.end) / 2) * 1000
    return { startMs: cutMs, endMs: cutMs }
  }

  // Fallback: proportional estimate
  const estMs = Math.round(estimateSec * 1000)
  return { startMs: estMs, endMs: estMs }
}

/**
 * Build split segments from word data + split points + silences.
 *
 * @param words        all words in the ayah
 * @param splitPoints  word indices where each new part begins (sorted, 0-based)
 *                     e.g. [0, 8, 16] means Part 1 = words 0-7, Part 2 = 8-15, Part 3 = 16-end
 * @param audioDurationMs total audio duration
 * @param silences     silence points from ffmpeg
 */
export function buildSegments(
  words: WordData[],
  splitPoints: number[],
  audioDurationMs: number,
  silences: SilencePoint[],
): SplitSegment[] {
  // Ensure splitPoints starts with 0
  const points = [0, ...splitPoints.filter((p) => p > 0).sort((a, b) => a - b)]
  const totalParts = points.length
  const segments: SplitSegment[] = []

  for (let i = 0; i < totalParts; i++) {
    const wordFrom = points[i]!
    const wordTo = i + 1 < totalParts ? points[i + 1]! : words.length
    const segmentWords = words.slice(wordFrom, wordTo)

    // Calculate audio boundaries
    let audioStartMs = 0
    let audioEndMs = audioDurationMs

    if (i > 0) {
      // Start of this segment = end of previous = snap to silence near wordFrom
      const snap = snapToSilence(wordFrom, words.length, audioDurationMs, silences)
      audioStartMs = snap.startMs
    }
    if (i < totalParts - 1) {
      // End of this segment = start of next = snap to silence near wordTo
      const snap = snapToSilence(wordTo, words.length, audioDurationMs, silences)
      audioEndMs = snap.endMs
    }

    segments.push({
      partNumber: i + 1,
      totalParts,
      wordFrom,
      wordTo,
      audioStartMs,
      audioEndMs,
      words: segmentWords,
    })
  }

  return segments
}
