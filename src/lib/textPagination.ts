// ─── Audio-synced text pagination ────────────────────────────────────
//
// PROBLEM
//   Time-proportional pagination splits an ayah into N chunks and gives
//   each chunk `totalDuration / N` seconds. But Arabic recitation has
//   variable word lengths (madd, pausal forms, etc.), so the reciter
//   can still be saying chunk-1's words when the timer decides it's
//   time for chunk-2. Text jumps AHEAD of the audio.
//
// SOLUTION
//   Use the per-word `startMs` / `endMs` (already fetched for word
//   highlighting) to decide EXACTLY when each chunk boundary fires.
//   A chunk switches the moment the reciter finishes its LAST word —
//   not when a clock says so. This keeps text and audio in perfect
//   sync.
//
//   The translation is split into the SAME number of chunks as the
//   Arabic (equal word count per chunk) and switches at the same
//   audio boundaries — so Arabic page 2 and translation page 2
//   always appear together.

import type { WordTiming } from './types'

/** A single page of paginated text. */
export interface TextChunk {
  /** Inclusive start time of this chunk (ms since ayat start). */
  startMs: number
  /** Exclusive end time of this chunk (ms since ayat start). */
  endMs: number
  /** Index of the first word (in the source word list) in this chunk. */
  wordStart: number
  /** Index AFTER the last word in this chunk (exclusive). */
  wordEnd: number
}

export interface PaginationPlan {
  chunks: TextChunk[]
  /** Total number of chunks (== chunks.length). Convenience field. */
  total: number
}

/** Tuning — chosen to match natural recitation pacing.
 *  8 Arabic words ≈ 3-5 seconds per chunk, which feels comfortable
 *  to read in a reel. */
const MAX_WORDS_PER_CHUNK = 8
/** Don't paginate short ayats — they fit on one screen fine. */
const MIN_WORDS_TO_PAGINATE = 20

/**
 * Build audio-synced chunks from per-word timings.
 *
 * Each chunk holds up to `maxWordsPerChunk` words. The chunk's
 * `startMs` is the startMs of its first word; its `endMs` is the
 * endMs of its last word. This means the chunk switches the INSTANT
 * the reciter finishes the last word in it — perfect sync.
 *
 * If `words` is empty or has no usable timings, returns an empty
 * plan (caller should fall back to time-proportional pagination).
 */
export function buildAudioSyncedChunks(
  words: { startMs: number; endMs: number }[],
  maxWordsPerChunk: number = MAX_WORDS_PER_CHUNK,
): PaginationPlan {
  if (!words.length) return { chunks: [], total: 0 }

  // Verify the timings are actually usable (not all zeros).
  const hasTimings = words.some((w) => w.endMs > w.startMs)
  if (!hasTimings) return { chunks: [], total: 0 }

  const chunks: TextChunk[] = []
  for (let i = 0; i < words.length; i += maxWordsPerChunk) {
    const end = Math.min(i + maxWordsPerChunk, words.length)
    const firstWord = words[i]!
    const lastWord = words[end - 1]!
    chunks.push({
      startMs: firstWord.startMs,
      endMs: lastWord.endMs,
      wordStart: i,
      wordEnd: end,
    })
  }
  return { chunks, total: chunks.length }
}

/**
 * Find which chunk is active at a given timestamp.
 *
 * Returns -1 if `intoMs` is before the first chunk starts, or
 * `chunks.length - 1` if it's after the last chunk ends (so the
 * final chunk stays visible during any trailing silence).
 *
 * Uses a binary search — O(log N) — because this runs every frame
 * (60fps) inside the canvas draw loop.
 */
export function findChunkAtTime(
  chunks: TextChunk[],
  intoMs: number,
): number {
  if (!chunks.length) return -1
  if (intoMs < chunks[0]!.startMs) return -1
  // After the last chunk's end → keep showing the last chunk
  // (handles trailing silence / final madd).
  if (intoMs >= chunks[chunks.length - 1]!.endMs) {
    return chunks.length - 1
  }

  let lo = 0
  let hi = chunks.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    const c = chunks[mid]!
    if (intoMs < c.startMs) {
      hi = mid - 1
    } else if (intoMs >= c.endMs) {
      lo = mid + 1
    } else {
      return mid
    }
  }
  return lo
}

/**
 * Split a translation (or any text) into `numChunks` equal-ish pieces
 * by word count. Used to keep the translation in sync with the Arabic
 * chunk count — translation chunk `i` shows while Arabic chunk `i`
 * shows.
 *
 * If `numChunks <= 1` returns a single-element array containing the
 * whole text.
 */
export function splitTranslationToChunks(
  text: string,
  numChunks: number,
): string[] {
  if (numChunks <= 1) return [text]
  const words = text.split(/\s+/).filter(Boolean)
  if (!words.length) return ['']
  const perChunk = Math.ceil(words.length / numChunks)
  const out: string[] = []
  for (let i = 0; i < numChunks; i++) {
    const slice = words.slice(i * perChunk, (i + 1) * perChunk)
    out.push(slice.join(' '))
  }
  return out
}

/**
 * Decide whether an ayah should be paginated at all, based on its
 * Arabic word count. Short ayahs fit on one screen and shouldn't
 * be split.
 */
export function shouldPaginate(words: { text: string }[]): boolean {
  return words.filter((w) => w.text).length >= MIN_WORDS_TO_PAGINATE
}

/**
 * Same threshold but operating on a raw string — used by the fallback
 * (no word timings) path that still splits by time-proportionally.
 */
export function shouldPaginateText(text: string): boolean {
  const n = text.split(/\s+/).filter(Boolean).length
  return n >= MIN_WORDS_TO_PAGINATE
}

/**
 * Convenience: build a fallback time-proportional plan when word
 * timings are unavailable. Used as a graceful degradation path —
 * better than no pagination at all.
 */
export function buildTimeProportionalPlan(
  totalDurationMs: number,
  numChunks: number,
): PaginationPlan {
  if (numChunks <= 1 || totalDurationMs <= 0) {
    return { chunks: [], total: 0 }
  }
  const per = totalDurationMs / numChunks
  const chunks: TextChunk[] = []
  for (let i = 0; i < numChunks; i++) {
    chunks.push({
      startMs: i * per,
      endMs: (i + 1) * per,
      wordStart: i,
      wordEnd: i + 1,
    })
  }
  return { chunks, total: chunks.length }
}

/**
 * Build a silence-snapped pagination plan from the ACTUAL audio's
 * breath pauses (detected by ffmpeg's silencedetect filter).
 *
 * This is the most accurate pagination method because it operates on
 * the exact audio file the user hears:
 *
 *   1. Compute ideal evenly-spaced chunk boundaries
 *   2. Snap each boundary to the nearest detected silence (within
 *      ±3 seconds). If no silence is nearby, keep the ideal boundary.
 *   3. Map each time-based chunk to a proportional word range so the
 *      Arabic text can be sliced correctly.
 *
 * Result: chunks switch at natural breath points — never mid-word.
 *
 * @param totalDurationMs  Total audio duration in ms
 * @param numChunks        Desired number of chunks
 * @param pauses           Breath pauses (ms) from silence detection
 * @param totalWords       Total Arabic word count (for word-range mapping)
 */
export function buildSilenceSnappedPlan(
  totalDurationMs: number,
  numChunks: number,
  pauses: { start: number; end: number }[],
  totalWords: number,
): PaginationPlan {
  if (numChunks <= 1 || totalDurationMs <= 0) {
    return { chunks: [], total: 0 }
  }

  // ─── Step 1: ideal evenly-spaced boundaries ──────────────────────
  const idealBoundaries: number[] = []
  for (let i = 1; i < numChunks; i++) {
    idealBoundaries.push((i * totalDurationMs) / numChunks)
  }

  // ─── Step 2: snap each boundary to the nearest UNUSED silence ─────
  // A silence's midpoint is the natural "switch here" moment.
  // Each silence can only be claimed by ONE boundary (the closest
  // one) — otherwise two boundaries would snap to the same point
  // and create an empty chunk between them.
  const SNAP_THRESHOLD_MS = 3000 // ±3 seconds
  const usedSilenceIdx = new Set<number>()
  const snappedBoundaries = idealBoundaries.map((ideal) => {
    let bestVal = ideal
    let bestDist = SNAP_THRESHOLD_MS
    let bestSilenceIdx = -1
    for (let i = 0; i < pauses.length; i++) {
      if (usedSilenceIdx.has(i)) continue
      const p = pauses[i]!
      const midMs = (p.start + p.end) / 2
      const dist = Math.abs(midMs - ideal)
      if (dist < bestDist) {
        bestVal = midMs
        bestDist = dist
        bestSilenceIdx = i
      }
    }
    if (bestSilenceIdx >= 0) usedSilenceIdx.add(bestSilenceIdx)
    return bestVal
  })

  // ─── Step 3: build chunks + map to proportional word ranges ──────
  // We don't know exactly which words fall in each time range (we
  // don't have per-word timings), but a proportional split is a
  // good approximation — and the TIME boundaries are exact, which
  // is what matters for sync.
  const chunks: TextChunk[] = []
  for (let i = 0; i < numChunks; i++) {
    const startMs = i === 0 ? 0 : snappedBoundaries[i - 1]!
    const endMs = i === numChunks - 1 ? totalDurationMs : snappedBoundaries[i]!
    // Proportional word range
    const startRatio = startMs / totalDurationMs
    const endRatio = endMs / totalDurationMs
    chunks.push({
      startMs,
      endMs,
      wordStart: Math.round(startRatio * totalWords),
      wordEnd: Math.round(endRatio * totalWords),
    })
  }

  return { chunks, total: chunks.length }
}

/**
 * Decide how many chunks to use when we DON'T have word timings.
 * Falls back to a word-count heuristic: ~8 Arabic words per chunk.
 */
export function estimateChunkCount(arabicWordCount: number): number {
  if (arabicWordCount < MIN_WORDS_TO_PAGINATE) return 1
  return Math.ceil(arabicWordCount / MAX_WORDS_PER_CHUNK)
}

// Re-exported for tests + callers that want to inspect the tuning.
export const PAGINATION_TUNING = {
  MAX_WORDS_PER_CHUNK,
  MIN_WORDS_TO_PAGINATE,
} as const

// Type-only re-export so callers can reference WordTiming without a
// separate import line.
export type { WordTiming }
