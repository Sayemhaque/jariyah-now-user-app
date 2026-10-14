'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTikTokConnection } from '@/hooks/useTikTokConnection'
import { jobIdFromDownloadUrl } from '@/lib/tiktok/client'
import { ConnectTikTokPanel } from './ConnectTikTokPanel'
import { TikTokPostPanel } from './TikTokPostPanel'

interface TikTokShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  videoUrl: string
  durationMs: number
  defaultCaption: string
}

export function TikTokShareDialog({ open, onOpenChange, videoUrl, durationMs, defaultCaption }: TikTokShareDialogProps) {
  const connection = useTikTokConnection(open)
  const jobId = jobIdFromDownloadUrl(videoUrl)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[95vw] !max-w-3xl overflow-y-auto bg-card max-sm:h-[100dvh] max-sm:max-h-none max-sm:w-screen max-sm:rounded-none">
        <DialogHeader>
          <DialogTitle>Post to TikTok</DialogTitle>
          <DialogDescription>Review your video and choose how it appears on TikTok.</DialogDescription>
        </DialogHeader>
        {connection.status === 'ready' && connection.creator && jobId ? (
          <TikTokPostPanel
            jobId={jobId}
            videoUrl={videoUrl}
            creator={connection.creator}
            durationSec={Math.ceil(durationMs / 1000)}
            defaultCaption={defaultCaption}
            onDisconnect={connection.disconnect}
          />
        ) : (
          <ConnectTikTokPanel status={connection.status} message={connection.message} onConnect={connection.connect} />
        )}
      </DialogContent>
    </Dialog>
  )
}
