import { useCallback, useEffect, useRef, useState } from 'react'
import type { PlayerRef } from '@remotion/player'
import { videoFps } from '@/lib/constants'
import type { AyatData } from '@/lib/types'
import { useAutoHideControls } from './useAutoHideControls'
import { usePlayerEvents } from './usePlayerEvents'

const playerVolume = 0.9

export function usePreviewPlayer(slides: AyatData[], totalFrames: number, frameOffsets: number[]) {
  const playerRef = useRef<PlayerRef>(null)
  const controls = useAutoHideControls()
  const [ready, setReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [muted, setMuted] = useState(false)
  const [trackedSlides, setTrackedSlides] = useState(slides)

  if (trackedSlides !== slides) {
    setTrackedSlides(slides)
    setCurrentFrame(0)
    if (!slides.length) setIsPlaying(false)
  }

  const { reveal, scheduleHide } = controls
  const onPlay = useCallback(() => {
    setIsPlaying(true)
    scheduleHide()
  }, [scheduleHide])
  const onStop = useCallback(() => {
    setIsPlaying(false)
    reveal()
  }, [reveal])
  usePlayerEvents(playerRef, ready, { onFrame: setCurrentFrame, onPlay, onStop })

  useEffect(() => playerRef.current?.pause(), [slides])
  useEffect(() => playerRef.current?.setVolume(muted ? 0 : playerVolume), [muted])

  const attachPlayer = useCallback((player: PlayerRef | null) => {
    playerRef.current = player
    setReady(player !== null)
  }, [])

  const togglePlay = () => {
    const player = playerRef.current
    if (!player || !slides.length) return
    if (isPlaying) player.pause()
    else player.play()
  }
  const seekMs = (ms: number) => playerRef.current?.seekTo(Math.min(Math.round((ms / 1000) * videoFps), totalFrames - 1))
  const playAyat = (index: number) => {
    const frame = frameOffsets[index]
    if (!playerRef.current || frame === undefined) return
    playerRef.current.seekTo(frame)
    playerRef.current.play()
  }

  return { controls, attachPlayer, isPlaying, currentFrame, muted, setMuted, togglePlay, seekMs, playAyat }
}
