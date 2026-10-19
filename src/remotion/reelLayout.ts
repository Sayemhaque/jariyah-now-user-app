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
  headerAlign: 'center' | 'sides'
  sideInset: number
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
  headerAlign: 'center',
  sideInset: 0,
}

export const landscapeLayout: ReelLayout = {
  logoTop: 0.055,
  logoHeight: 0.1,
  titleTop: 0.055,
  badgeTop: 0.08,
  visualizerCenter: 0.9,
  visualizerHeight: 0.07,
  visualizerWidth: 0.46,
  textTop: 0.22,
  textBottom: 0.17,
  textMaxWidth: 0.8,
  headerAlign: 'sides',
  sideInset: 0.05,
}

export function useReelLayout(): ReelLayout {
  const { width, height } = useVideoConfig()
  return height > width ? portraitLayout : landscapeLayout
}
