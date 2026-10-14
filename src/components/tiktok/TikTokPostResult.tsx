import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import type { PostPhase } from '@/hooks/useTikTokPost'

interface TikTokPostResultProps {
  phase: PostPhase
  message: string | null
  onRetry: () => void
}

export function TikTokPostResult({ phase, message, onRetry }: TikTokPostResultProps) {
  if (phase === 'failed') {
    return (
      <div className="space-y-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-center">
        <XCircle className="mx-auto h-8 w-8 text-destructive" />
        <p className="text-sm font-medium">{message ?? 'TikTok could not publish this video.'}</p>
        <button type="button" onClick={onRetry} className="text-sm font-semibold text-primary hover:underline">Try again</button>
      </div>
    )
  }
  const done = phase === 'published'
  return (
    <div className="space-y-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
      {done ? <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" /> : <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />}
      <p className="text-sm font-semibold">{done ? 'Posted to TikTok' : 'Sending your video to TikTok…'}</p>
      <p className="text-xs text-muted-foreground">
        It can take a few minutes for TikTok to process the video before it appears on your profile.
      </p>
    </div>
  )
}
