import { Loader2 } from 'lucide-react'
import type { ConnectionStatus } from '@/hooks/useTikTokConnection'

interface ConnectTikTokPanelProps {
  status: ConnectionStatus
  message: string | null
  onConnect: () => void
}

export function ConnectTikTokPanel({ status, message, onConnect }: ConnectTikTokPanelProps) {
  if (status === 'loading') return <Loader2 className="mx-auto my-10 h-8 w-8 animate-spin text-primary" />
  if (status === 'unavailable') return <p className="py-8 text-center text-sm text-muted-foreground">এই মুহূর্তে TikTok-এ শেয়ার করা যাচ্ছে না।</p>
  if (status === 'blocked') {
    return <p className="py-8 text-center text-sm text-muted-foreground">{message ?? 'এই মুহূর্তে TikTok এই অ্যাকাউন্ট থেকে পোস্ট নিচ্ছে না। একটু পরে আবার চেষ্টা করুন।'}</p>
  }
  return (
    <div className="space-y-4 py-6 text-center">
      <p className="text-sm text-muted-foreground">আপনার TikTok অ্যাকাউন্ট যুক্ত করুন, তাহলে Jariyah Now থেকেই সরাসরি ভিডিওটি পোস্ট করতে পারবেন।</p>
      <button type="button" onClick={onConnect} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-6 text-sm font-semibold text-white hover:bg-black/85">
        TikTok দিয়ে এগিয়ে যান
      </button>
      <p className="text-[11px] text-muted-foreground">আমরা আপনার TikTok অ্যাকাউন্ট শুধু আপনার প্রোফাইল দেখাতে আর আপনার বেছে নেওয়া ভিডিও পোস্ট করতে ব্যবহার করি।</p>
    </div>
  )
}
