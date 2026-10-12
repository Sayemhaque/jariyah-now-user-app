import type { ScenePalette } from '@/lib/backgroundPresets'
import { cn } from '@/lib/utils'

interface BackgroundTileProps {
  label: string
  palette: ScenePalette
  imageUrl?: string
  selected: boolean
  onSelect: () => void
}

export function BackgroundTile({ label, palette, imageUrl, selected, onSelect }: BackgroundTileProps) {
  const [top, middle, bottom] = palette.base
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative aspect-[3/4] w-24 shrink-0 snap-start rounded-lg overflow-hidden border transition',
        selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background border-transparent' : 'border-border hover:border-foreground/40',
      )}
      style={{
        background: imageUrl
          ? `center / cover no-repeat url("${imageUrl}")`
          : `radial-gradient(circle at 50% 38%, ${palette.accent}40 0%, transparent 55%), linear-gradient(180deg, ${top}, ${middle} 50%, ${bottom})`,
      }}
    >
      <span className="absolute top-1.5 left-1/2 -translate-x-1/2 flex gap-1">
        {[palette.accent, palette.text, palette.translation].map((color) => (
          <span key={color} className="h-2 w-2 rounded-full ring-1 ring-black/20" style={{ background: color }} />
        ))}
      </span>
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-[10px] font-medium py-1 px-1 text-center leading-tight">
        {label}
      </span>
    </button>
  )
}
