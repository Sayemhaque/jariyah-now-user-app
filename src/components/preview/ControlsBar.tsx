import { Settings, Volume2, VolumeX } from 'lucide-react'
import { formatMs } from '@/lib/format'
import { Slider } from '@/components/ui/slider'

interface ControlsBarProps {
  currentMs: number
  totalMs: number
  muted: boolean
  disabled: boolean
  onSeek: (ms: number) => void
  onToggleMute: () => void
  onSettingsClick?: () => void
}

export function ControlsBar({ currentMs, totalMs, muted, disabled, onSeek, onToggleMute, onSettingsClick }: ControlsBarProps) {
  return (
    <div className="bg-gradient-to-t from-black/60 to-transparent pb-1.5 pt-5 px-3 sm:px-4">
      <div className="flex items-center justify-end mb-5">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onSettingsClick?.()
          }}
          className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-md text-sm font-semibold text-white hover:bg-white/25 transition-colors pointer-events-auto shadow-lg"
        >
          <Settings className="h-4 w-4" />
          Customize
        </button>
      </div>
      <Slider
        value={[Math.min(totalMs, currentMs)]}
        max={Math.max(1, totalMs)}
        step={100}
        onValueChange={(value) => onSeek(value[0]!)}
        disabled={disabled}
        className="pointer-events-auto mb-1.5"
      />
      <div className="flex items-center justify-between">
        <span className="text-white/90 text-[11px] font-mono tabular-nums">
          {formatMs(currentMs)} / {formatMs(totalMs)}
        </span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onToggleMute()
          }}
          className="text-white/80 hover:text-white transition-colors pointer-events-auto"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
