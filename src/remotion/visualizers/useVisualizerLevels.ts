import { useCurrentFrame, useVideoConfig } from 'remotion'
import { useAudioBars } from '../useAudioBars'

export function useVisualizerLevels(audioUrl: string, count: number) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const levels = useAudioBars(audioUrl, frame, fps, count)
  const seconds = frame / fps
  const values = Array.from({ length: count }, (_, index) =>
    levels ? Math.max(0.06, levels[index] ?? 0) : 0.18 + 0.22 * Math.abs(Math.sin(seconds * 3 + index * 0.55)),
  )
  const average = values.reduce((sum, value) => sum + value, 0) / Math.max(1, count)
  return { values, average, seconds }
}

export interface VisualizerShapeProps {
  audioUrl: string
  accent: string
  width: number
  height: number
}
