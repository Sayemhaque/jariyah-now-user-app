interface ProgressStripProps {
  currentMs: number
  totalMs: number
  onSeek: (ms: number) => void
}

export function ProgressStrip({ currentMs, totalMs, onSeek }: ProgressStripProps) {
  return (
    <div
      className="absolute bottom-0 inset-x-0 h-1 cursor-pointer z-20"
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const fraction = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
        onSeek(fraction * totalMs)
      }}
    >
      <div className="h-full bg-white/20">
        <div
          className="h-full bg-white/80 hover:bg-white transition-colors"
          style={{ width: `${totalMs > 0 ? (currentMs / totalMs) * 100 : 0}%` }}
        />
      </div>
    </div>
  )
}
