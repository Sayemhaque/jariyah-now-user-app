import { Loader2 } from 'lucide-react'
import type { ConnectionStatus } from '@/hooks/useTikTokConnection'

interface ConnectTikTokPanelProps {
  status: ConnectionStatus
  message: string | null
  onConnect: () => void
}

export function ConnectTikTokPanel({ status, message, onConnect }: ConnectTikTokPanelProps) {
  if (status === 'loading') return <Loader2 className="mx-auto my-10 h-8 w-8 animate-spin text-primary" />
  if (status === 'unavailable') return <p className="py-8 text-center text-sm text-muted-foreground">Sharing to TikTok is not available right now.</p>
  if (status === 'blocked') {
    return <p className="py-8 text-center text-sm text-muted-foreground">{message ?? 'TikTok is not accepting posts from this account right now. Please try again later.'}</p>
  }
  return (
    <div className="space-y-4 py-6 text-center">
      <p className="text-sm text-muted-foreground">Connect your TikTok account to post this video directly from Jariyah Now.</p>
      <button type="button" onClick={onConnect} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-6 text-sm font-semibold text-white hover:bg-black/85">
        Continue with TikTok
      </button>
      <p className="text-[11px] text-muted-foreground">We only use your TikTok account to show your profile and publish the videos you choose to post.</p>
    </div>
  )
}
