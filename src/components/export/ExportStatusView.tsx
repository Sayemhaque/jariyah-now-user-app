import type { useExportJob } from '@/hooks/useExportJob'
import { downloadFile } from '@/lib/export/renderJob'
import type { Orientation } from '@/lib/types'
import { DonePanel } from './DonePanel'
import { ErrorPanel } from './ErrorPanel'
import { IdlePanel } from './IdlePanel'
import { ProcessingPanel } from './ProcessingPanel'

interface ExportStatusViewProps {
  job: ReturnType<typeof useExportJob>
  filename: string
  orientation: Orientation
}

export function ExportStatusView({ job, filename, orientation }: ExportStatusViewProps) {
  const { status, downloadUrl } = job
  if (status === 'processing') return <ProcessingPanel progress={job.progress} phase={job.phase} />
  if (status === 'error') return <ErrorPanel message={job.errorMessage} />
  if (status === 'done' && downloadUrl) {
    return <DonePanel filename={filename} orientation={orientation} onDownload={() => downloadFile(downloadUrl, filename)} />
  }
  return status === 'idle' ? <IdlePanel /> : null
}
