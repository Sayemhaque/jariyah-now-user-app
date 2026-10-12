import { useEffect, type RefObject } from 'react'
import type { PlayerRef } from '@remotion/player'

interface PlayerEventHandlers {
  onFrame: (frame: number) => void
  onPlay: () => void
  onStop: () => void
}

export function usePlayerEvents(
  playerRef: RefObject<PlayerRef | null>,
  ready: boolean,
  { onFrame, onPlay, onStop }: PlayerEventHandlers,
) {
  useEffect(() => {
    const player = playerRef.current
    if (!player || !ready) return
    const handleFrame = () => {
      if (playerRef.current) onFrame(playerRef.current.getCurrentFrame())
    }
    player.addEventListener('frameupdate', handleFrame)
    player.addEventListener('play', onPlay)
    player.addEventListener('pause', onStop)
    player.addEventListener('ended', onStop)
    return () => {
      player.removeEventListener('frameupdate', handleFrame)
      player.removeEventListener('play', onPlay)
      player.removeEventListener('pause', onStop)
      player.removeEventListener('ended', onStop)
    }
  }, [playerRef, ready, onFrame, onPlay, onStop])
}
