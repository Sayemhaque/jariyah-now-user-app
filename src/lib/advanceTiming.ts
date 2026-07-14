export function getAdvanceAtMs(
  ayat:
    | {
        audioDurationMs: number
        audioPauses?: { start: number; end: number; duration: number }[]
      }
    | null
    | undefined,
  liveDurationMs: number,
): number {
  if (!ayat) return 0
  const totalMs = ayat.audioDurationMs || liveDurationMs || 0
  if (totalMs <= 0) return 0
  const trailingPause = ayat.audioPauses?.[ayat.audioPauses.length - 1]
  if (!trailingPause) return totalMs
  const remainingMs = totalMs - trailingPause.end
  const remainingFraction = remainingMs / totalMs
  if (remainingMs >= 120 && remainingMs <= 1500 && remainingFraction < 0.08) {
    return Math.max(0, Math.min(totalMs, trailingPause.end + 80))
  }
  return totalMs
}

export function computeSlideFrames(
  slides: { audioDurationMs: number; audioPauses?: { start: number; end: number; duration: number }[] }[],
  fps: number,
): { totalFrames: number; offsets: number[] } {
  const offsets: number[] = []
  let acc = 0
  for (const s of slides) {
    offsets.push(acc)
    const advanceMs = getAdvanceAtMs(s, s.audioDurationMs)
    acc += Math.round(advanceMs / 1000 * fps)
  }
  return { totalFrames: acc, offsets }
}
