import { CheckCircle2, Download } from 'lucide-react'
import type { Orientation } from '@/lib/types'
import { GlowPanel } from './GlowPanel'

interface DonePanelProps {
  filename: string
  orientation: Orientation
  onDownload: () => void
  onShareTikTok: () => void
}

export function DonePanel({ filename, orientation, onDownload, onShareTikTok }: DonePanelProps) {
  return (
    <GlowPanel tone="success" className="min-h-[280px] text-center">
      <div className="relative mx-auto mb-5">
        <div aria-hidden className="absolute inset-0 rounded-full bg-emerald-500/30 blur-xl qv-processing-glow" />
        <div className="relative grid place-items-center h-16 w-16 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
          <CheckCircle2 className="h-9 w-9 text-white" />
        </div>
      </div>
      <div className="relative space-y-1.5 mb-6">
        <p className="font-bold text-lg text-foreground">ভিডিও তৈরি হয়ে গেছে!</p>
        <p className="text-xs text-muted-foreground">
          আপনার ভিডিও MP4 হিসেবে তৈরি হয়েছে · {orientation === 'portrait' ? 'লম্বা (৯:১৬)' : 'চওড়া (১৬:৯)'}
        </p>
      </div>
      <button
        type="button"
        onClick={onDownload}
        className="qv-btn-primary relative inline-flex items-center justify-center gap-2 w-full h-12 rounded-xl text-base font-semibold"
      >
        <Download className="h-5 w-5" />
        ভিডিও ডাউনলোড করুন
      </button>
      <button
        type="button"
        onClick={onShareTikTok}
        className="relative mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl bg-black text-sm font-semibold text-white hover:bg-black/85"
      >
        TikTok-এ পোস্ট করুন
      </button>
      <div className="relative flex items-center justify-center gap-2 mt-4">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
          MP4 · H.264
        </span>
      </div>
    </GlowPanel>
  )
}
