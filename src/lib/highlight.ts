import type { WordTiming } from './types'

/**
 * Pure function: given a list of word timings and the current playback
 * position (in ms), return the index of the word that should be
 * highlighted, or -1 if none.
 *
 * Extracted from VideoPreview + ExportModal so it can be unit-tested
 * exhaustively (the spec calls out edge cases: word at frame 0, word at
 * last frame, zero-duration word).
 *
 * Rules:
 *   - A word is "active" when tMs is in [startMs, endMs).
 *   - If a word has endMs === 0 (timing data missing), use the next word's
 *     startMs as its end, or tMs + 1 if it's the last word.
 *   - If tMs is past the last word's endMs, return the last word index so
 *     the highlight doesn't disappear during the trailing silence.
 *   - If tMs is before the first word, return -1.
 */
export function getActiveWordIndex(
  words: ReadonlyArray<Pick<WordTiming, 'startMs' | 'endMs'>>,
  tMs: number,
): number {
  if (words.length === 0) return -1
  if (tMs <= 0) return -1

  for (let i = 0; i < words.length; i++) {
    const w = words[i]!
    const end =
      w.endMs > 0
        ? w.endMs
        : i + 1 < words.length
          ? words[i + 1]!.startMs
          : tMs + 1
    if (tMs >= w.startMs && tMs < end) {
      return i
    }
  }

  // Past the last word's end — keep the last word highlighted so the UI
  // doesn't flicker off during trailing audio/silence.
  return words.length - 1
}
