import { CheckCircle2, Download } from 'lucide-react'
import type { Orientation } from '@/lib/types'
import { GlowPanel } from './GlowPanel'

interface DonePanelProps {
  filename: string
  orientation: Orientation
  onDownload: () => void
}

export function DonePanel({ filename, orientation, onDownload }: DonePanelProps) {
  return (
    <GlowPanel tone="success" className="min-h-[280px] text-center">
      <div className="relative mx-auto mb-5">
        <div aria-hidden className="absolute inset-0 rounded-full bg-emerald-500/30 blur-xl qv-processing-glow" />
        <div className="relative grid place-items-center h-16 w-16 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
          <CheckCircle2 className="h-9 w-9 text-white" />
        </div>
      </div>
      <div className="relative space-y-1.5 mb-6">
        <p className="font-bold text-lg text-foreground">Video ready!</p>
        <p className="text-xs text-muted-foreground">
          Your video has been processed as MP4 · {orientation === 'portrait' ? 'Portrait 9:16' : 'Landscape 16:9'}
        </p>
      </div>
      <button
        type="button"
        onClick={onDownload}
        className="qv-btn-primary relative inline-flex items-center justify-center gap-2 w-full h-12 rounded-xl text-base font-semibold"
      >
        <Download className="h-5 w-5" />
        Download {filename}
      </button>
      <div className="relative flex items-center justify-center gap-2 mt-4">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
          MP4 · H.264
        </span>
      </div>
    </GlowPanel>
  )
}
