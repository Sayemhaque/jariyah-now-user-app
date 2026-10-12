import { formatMs } from '@/lib/format'
import type { Orientation } from '@/lib/types'
import { renderQualityScale, resolutions } from '@/remotion/types'
import { SummaryRow } from './SummaryRow'

interface ExportSummaryProps {
  filename: string
  totalMs: number
  ayatCount: number
  orientation: Orientation
  quality: string
}

export function ExportSummary({ filename, totalMs, ayatCount, orientation, quality }: ExportSummaryProps) {
  const size = resolutions[orientation]!
  const scale = renderQualityScale[quality]!

  return (
    <div className="qv-card rounded-xl p-3 sm:p-3.5 text-[13px]">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        <div className="col-span-2 flex justify-between items-center gap-2 pb-2 border-b border-border">
          <span className="text-muted-foreground text-xs">Filename</span>
          <span className="font-mono text-[11px] text-foreground/85 truncate max-w-[60%]">{filename}</span>
        </div>
        <SummaryRow label="Duration" value={formatMs(totalMs)} />
        <SummaryRow label="Ayats" value={ayatCount} mono={false} />
        <SummaryRow label="Resolution" value={`${Math.round(size.w * scale)} × ${Math.round(size.h * scale)}`} />
        <SummaryRow label="Format" value="MP4" />
      </div>
    </div>
  )
}
