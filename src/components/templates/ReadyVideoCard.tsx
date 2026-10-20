import { useState } from 'react'
import { Download, Loader2, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatMs } from '@/lib/format'
import type { PublishedTemplate } from '@/lib/templates/templateCatalog'

interface ReadyVideoCardProps {
  video: PublishedTemplate
  downloading: boolean
  onDownload: () => void
}

export function ReadyVideoCard({ video, downloading, onDownload }: ReadyVideoCardProps) {
  const [playing, setPlaying] = useState(false)
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-lg">
      <div className="relative aspect-[9/16] bg-black">
        {playing ? (
          <video src={video.previewUrl} poster={video.thumbUrl} controls autoPlay playsInline className="h-full w-full object-cover" />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} className="absolute inset-0" aria-label={`${video.title} চালু করুন`}>
            <img src={video.thumbUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
            <span className="absolute inset-0 grid place-items-center bg-black/10 transition group-hover:bg-black/25">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 text-black shadow-lg"><Play className="ml-1 h-6 w-6" /></span>
            </span>
            <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-white">{formatMs(video.durationMs)}</span>
          </button>
        )}
      </div>
      <div className="space-y-2 p-3">
        <div>
          <h3 className="line-clamp-1 text-sm font-semibold">{video.title}</h3>
          <p className="line-clamp-1 text-xs text-muted-foreground">{[video.reference, video.partLabel.split(' · ')[0], video.reciterName].filter(Boolean).join(' · ')}</p>
        </div>
        <Button onClick={onDownload} disabled={downloading} size="sm" className="w-full font-semibold">
          {downloading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Download className="mr-1.5 h-4 w-4" />}
          ভিডিও ডাউনলোড
        </Button>
      </div>
    </article>
  )
}
