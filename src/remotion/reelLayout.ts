import { useVideoConfig } from 'remotion'

export interface ReelLayout {
  titleTop: number
  badgeTop: number
  visualizerCenter: number
  visualizerHeight: number
  visualizerWidth: number
  textTop: number
  textBottom: number
  textMaxWidth: number
  attributionBottom: number
  progressBottom: number
  progressInset: number
  watermark: { top: number; left?: number; right?: number }
}

export const safeZone = { top: 0.11, bottom: 0.25, right: 0.16, left: 0.05 }

export const portraitLayout: ReelLayout = {
  titleTop: 0.115,
  badgeTop: 0.21,
  visualizerCenter: 0.285,
  visualizerHeight: 0.065,
  visualizerWidth: 0.6,
  textTop: 0.33,
  textBottom: 0.315,
  textMaxWidth: 0.68,
  attributionBottom: 0.3,
  progressBottom: 0.255,
  progressInset: 0.16,
  watermark: { top: 0.212, left: 0.06 },
}

export const landscapeLayout: ReelLayout = {
  titleTop: 0.05,
  badgeTop: 0.165,
  visualizerCenter: 0.27,
  visualizerHeight: 0.085,
  visualizerWidth: 0.64,
  textTop: 0.34,
  textBottom: 0.2,
  textMaxWidth: 0.82,
  attributionBottom: 0.105,
  progressBottom: 0.04,
  progressInset: 0.08,
  watermark: { top: 0.03, right: 0.04 },
}

export function useReelLayout(): ReelLayout {
  const { width, height } = useVideoConfig()
  return height > width ? portraitLayout : landscapeLayout
}
