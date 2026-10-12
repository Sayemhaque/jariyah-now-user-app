import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import type { usePreviewPlayer } from '@/hooks/usePreviewPlayer'
import { ControlsBar } from './ControlsBar'
import { FadeLayer } from './FadeLayer'
import { GlassButton } from './GlassButton'
import { ProgressStrip } from './ProgressStrip'

interface PlayerOverlayProps {
  player: Omit<ReturnType<typeof usePreviewPlayer>, 'attachPlayer' | 'currentFrame'>
  slideCount: number
  currentIndex: number
  currentMs: number
  totalMs: number
  onSettingsClick?: () => void
}

export function PlayerOverlay({ player, slideCount, currentIndex, currentMs, totalMs, onSettingsClick }: PlayerOverlayProps) {
  const { controls, isPlaying, togglePlay, playAyat, muted, setMuted } = player
  const seek = (ms: number) => {
    player.seekMs(ms)
    controls.reveal()
  }

  return (
    <div
      className="absolute inset-0 z-10"
      onMouseEnter={controls.reveal}
      onMouseMove={controls.reveal}
      onMouseLeave={() => isPlaying && controls.scheduleHide()}
    >
      <div className="absolute inset-0" onClick={togglePlay} />
      <FadeLayer visible={controls.visible} className="inset-0 grid place-items-center">
        <GlassButton size="large" onPress={togglePlay}>
          {isPlaying ? <Pause className="h-6 w-6 sm:h-7 sm:w-7" /> : <Play className="h-6 w-6 sm:h-7 sm:w-7 ml-0.5" />}
        </GlassButton>
      </FadeLayer>
      <FadeLayer visible={controls.visible} className="inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-2 sm:px-4">
        <GlassButton size="small" disabled={!slideCount} onPress={() => playAyat(Math.max(0, currentIndex - 1))}>
          <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
        </GlassButton>
        <GlassButton
          size="small"
          disabled={!slideCount || currentIndex >= slideCount - 1}
          onPress={() => playAyat(Math.min(slideCount - 1, currentIndex + 1))}
        >
          <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
        </GlassButton>
      </FadeLayer>
      <FadeLayer visible={controls.visible} className="bottom-0 inset-x-0">
        <ControlsBar
          currentMs={currentMs}
          totalMs={totalMs}
          muted={muted}
          disabled={!slideCount}
          onSeek={seek}
          onToggleMute={() => setMuted((value) => !value)}
          onSettingsClick={onSettingsClick}
        />
      </FadeLayer>
      <ProgressStrip currentMs={currentMs} totalMs={totalMs} onSeek={seek} />
    </div>
  )
}
