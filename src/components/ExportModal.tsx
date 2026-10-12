'use client'

import { useState } from 'react'
import { Film } from 'lucide-react'
import { isLowPowerDevice } from '@/lib/export/renderJob'
import { useExportDetails } from '@/hooks/useExportDetails'
import { useExportJob } from '@/hooks/useExportJob'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ExportFooter } from './export/ExportFooter'
import { ExportStatusView } from './export/ExportStatusView'
import { ExportSummary } from './export/ExportSummary'
import { QualityPicker, type ExportQuality } from './export/QualityPicker'

interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportModal({ open, onOpenChange }: ExportModalProps) {
  const [lowPower] = useState(isLowPowerDevice)
  const [quality, setQuality] = useState<ExportQuality>(lowPower ? '480p' : '720p')
  const details = useExportDetails()
  const job = useExportJob(open)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-6xl w-[95vw] h-[90vh] bg-card border-border shadow-xl sm:rounded-2xl p-0 max-sm:h-[100dvh] max-sm:w-screen max-sm:max-w-none max-sm:rounded-none flex flex-col overflow-hidden gap-0">
        <div className="px-6 pt-6 shrink-0">
          <DialogHeader className="mb-2">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="grid place-items-center h-8 w-8 rounded-lg bg-primary/15 text-primary shrink-0">
                <Film className="h-4 w-4" />
              </div>
              Export video
            </DialogTitle>
            <DialogDescription className="text-[13px]">Rendered on the server as H.264 MP4.</DialogDescription>
          </DialogHeader>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="space-y-4">
              <QualityPicker quality={quality} onChange={setQuality} showMobileWarning={lowPower} />
              <ExportSummary
                filename={details.filename}
                totalMs={details.totalMs}
                ayatCount={details.slides.length}
                orientation={details.orientation}
                quality={quality}
              />
            </div>
            <div className="space-y-4">
              <ExportStatusView job={job} filename={details.filename} orientation={details.orientation} />
            </div>
          </div>
        </div>
        <ExportFooter
          status={job.status}
          canProcess={details.slides.length > 0}
          onClose={() => onOpenChange(false)}
          onProcess={() => details.slides.length && job.start(details.buildRequest(quality))}
        />
      </DialogContent>
    </Dialog>
  )
}
