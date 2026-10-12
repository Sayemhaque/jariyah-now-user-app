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
  logoTop: number
  logoHeight: number
}

export const safeZone = { top: 0.11, bottom: 0.25, right: 0.16, left: 0.05 }

export const portraitLayout: ReelLayout = {
  logoTop: 0.11,
  logoHeight: 0.06,
  titleTop: 0.175,
  badgeTop: 0.27,
  visualizerCenter: 0.34,
  visualizerHeight: 0.06,
  visualizerWidth: 0.6,
  textTop: 0.38,
  textBottom: 0.265,
  textMaxWidth: 0.68,
}

export const landscapeLayout: ReelLayout = {
  logoTop: 0.03,
  logoHeight: 0.1,
  titleTop: 0.135,
  badgeTop: 0.3,
  visualizerCenter: 0.385,
  visualizerHeight: 0.07,
  visualizerWidth: 0.64,
  textTop: 0.44,
  textBottom: 0.07,
  textMaxWidth: 0.82,
}

export function useReelLayout(): ReelLayout {
  const { width, height } = useVideoConfig()
  return height > width ? portraitLayout : landscapeLayout
}
