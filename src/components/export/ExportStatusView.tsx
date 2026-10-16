import { useState } from 'react'
import type { useExportJob } from '@/hooks/useExportJob'
import { TikTokShareDialog } from '@/components/tiktok/TikTokShareDialog'
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
  durationMs: number
  caption: string
}

export function ExportStatusView({ job, filename, orientation, durationMs, caption }: ExportStatusViewProps) {
  const [sharing, setSharing] = useState(false)
  const { status, downloadUrl } = job
  if (status === 'processing') return <ProcessingPanel progress={job.progress} phase={job.phase} />
  if (status === 'error') return <ErrorPanel message={job.errorMessage} />
  if (status === 'done' && downloadUrl) {
    return (
      <>
        <DonePanel
          filename={filename}
          orientation={orientation}
          onDownload={() => downloadFile(downloadUrl, filename)}
          onShareTikTok={() => setSharing(true)}
        />
        <TikTokShareDialog open={sharing} onOpenChange={setSharing} videoUrl={downloadUrl} durationMs={durationMs} defaultCaption={caption} />
      </>
    )
  }
  return status === 'idle' ? <IdlePanel /> : null
}
