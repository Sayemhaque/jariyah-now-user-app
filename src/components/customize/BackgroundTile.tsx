import Image from 'next/image'
import type { BackgroundPreset } from '@/lib/backgroundPresets'
import { cn } from '@/lib/utils'

interface BackgroundTileProps {
  preset: BackgroundPreset
  url: string
  selected: boolean
  onSelect: () => void
}

export function BackgroundTile({ preset, url, selected, onSelect }: BackgroundTileProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'group relative aspect-video w-36 shrink-0 snap-start rounded-lg overflow-hidden border transition',
        selected
          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background border-transparent'
          : 'border-border hover:border-foreground/40',
      )}
    >
      {preset.isVideo ? (
        <video src={url} className="absolute inset-0 h-full w-full object-cover" muted playsInline preload="metadata" />
      ) : (
        <Image src={url} alt={preset.label} fill sizes="144px" className="object-cover" />
      )}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-[10px] font-medium py-1 px-1.5 text-center flex items-center justify-center gap-1 truncate">
        {preset.emoji && <span aria-hidden>{preset.emoji}</span>}
        {preset.label}
      </span>
    </button>
  )
}
