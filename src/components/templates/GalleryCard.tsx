import { useRef } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScaledCard } from '@/components/cards/ScaledCard'
import { useCardDownload } from '@/hooks/useCardDownload'
import type { CardProps } from '@/lib/cards/types'

export function GalleryCard({ card, fileName }: { card: CardProps; fileName: string }) {
  const node = useRef<HTMLDivElement | null>(null)
  const { save, isSaving } = useCardDownload()
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-lg">
      <ScaledCard {...card} nodeRef={(el) => { node.current = el }} />
      <div className="flex items-center gap-2 p-2.5">
        <p className="min-w-0 flex-1 truncate text-xs font-semibold">{card.content.title}</p>
        <Button size="sm" variant="secondary" onClick={() => save([node.current], fileName)} disabled={isSaving} aria-label={`Download ${card.content.title}`}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        </Button>
      </div>
    </article>
  )
}
