import { Film, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { RenderStatus } from '@/hooks/useExportJob'

interface ExportFooterProps {
  status: RenderStatus
  canProcess: boolean
  onClose: () => void
  onProcess: () => void
}

export function ExportFooter({ status, canProcess, onClose, onProcess }: ExportFooterProps) {
  return (
    <div className="border-t border-border bg-card px-6 py-3 flex gap-2 shrink-0">
      <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
        <X className="h-4 w-4 mr-1.5" />
        Close
      </Button>
      {status !== 'processing' && (
        <Button onClick={onProcess} disabled={!canProcess} className="qv-btn-primary flex-1">
          <Film className="h-4 w-4 mr-1.5" />
          {status === 'done' ? 'Process again' : 'Process video'}
        </Button>
      )}
    </div>
  )
}
