import { useEffect, useState } from 'react'
import { continueRender, delayRender, getRemotionEnvironment } from 'remotion'
import { getAudioData, visualizeAudio, type MediaUtilsAudioData } from '@remotion/media-utils'

const sampleCount = 64

function useSafeAudioData(src: string): MediaUtilsAudioData | null {
  const [data, setData] = useState<MediaUtilsAudioData | null>(null)
  const [handle] = useState(() =>
    getRemotionEnvironment().isRendering ? delayRender(`Analysing audio ${src}`, { timeoutInMilliseconds: 25000 }) : null,
  )

  useEffect(() => {
    let active = true
    getAudioData(src)
      .then((result) => active && setData(result))
      .catch(() => undefined)
      .finally(() => handle !== null && continueRender(handle))
    return () => {
      active = false
    }
  }, [src, handle])

  return data
}

export function useAudioBars(src: string, frame: number, fps: number, barCount: number): number[] | null {
  const audioData = useSafeAudioData(src)
  if (!audioData) return null
  const spectrum = visualizeAudio({ audioData, frame, fps, numberOfSamples: sampleCount, smoothing: true })
  return Array.from({ length: barCount }, (_, index) => {
    const bin = 1 + Math.floor((index / barCount) * sampleCount * 0.45)
    return Math.min(1, Math.sqrt(spectrum[bin] ?? 0) * 1.7)
  })
}
