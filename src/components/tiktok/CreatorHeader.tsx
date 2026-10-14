import type { CreatorInfo } from '@/lib/tiktok/rules'

interface CreatorHeaderProps {
  creator: CreatorInfo
  onDisconnect: () => void
}

export function CreatorHeader({ creator, onDisconnect }: CreatorHeaderProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background/60 p-3">
      {creator.avatarUrl ? (
        <img src={creator.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
      ) : (
        <div className="h-10 w-10 rounded-full bg-muted" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">Posting to TikTok as</p>
        <p className="truncate text-sm font-semibold text-foreground">
          {creator.nickname}
          {creator.username && <span className="ml-1 font-normal text-muted-foreground">@{creator.username}</span>}
        </p>
      </div>
      <button type="button" onClick={onDisconnect} className="text-xs text-muted-foreground underline-offset-2 hover:underline">
        Switch account
      </button>
    </div>
  )
}
