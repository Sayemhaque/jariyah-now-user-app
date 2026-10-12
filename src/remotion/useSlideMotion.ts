import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

export function useSlideMotion(durationInFrames: number) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: Math.round(fps * 1.1) })
  const exitFrames = Math.max(1, Math.min(Math.round(fps * 0.6), Math.floor(durationInFrames / 4)))
  const exit = interpolate(frame, [durationInFrames - exitFrames, durationInFrames], [1, 0], clamp)
  const translationIn = interpolate(frame, [fps * 0.5, fps * 1.4], [0, 1], clamp)

  return {
    frame,
    timeMs: (frame / fps) * 1000,
    visibility: Math.min(enter, exit),
    enter,
    translationIn: Math.min(translationIn, exit),
    progress: Math.min(1, frame / Math.max(1, durationInFrames)),
  }
}
