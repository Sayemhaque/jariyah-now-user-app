import { useRef, useState } from 'react'
import { Download, Eye, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PosterPreviewDialog } from '@/components/cards/PosterPreviewDialog'
import { ScaledCard } from '@/components/cards/ScaledCard'
import { useCardDownload } from '@/hooks/useCardDownload'
import type { CardProps } from '@/lib/cards/types'

export function GalleryCard({ card, fileName }: { card: CardProps; fileName: string }) {
  const node = useRef<HTMLDivElement | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const { save, isSaving } = useCardDownload()
  const { content, ...design } = card
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl">
      <button type="button" onClick={() => setPreviewOpen(true)} className="relative block w-full text-left" aria-label={`${content.title} — বড় করে দেখুন`}>
        <ScaledCard {...card} nodeRef={(el) => { node.current = el }} />
        <span className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-black shadow-lg"><Eye className="h-4 w-4" />প্রিভিউ</span>
        </span>
      </button>
      <div className="space-y-2 p-2.5">
        <p className="truncate text-sm font-semibold">{content.title}</p>
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="secondary" onClick={() => setPreviewOpen(true)} className="h-10 text-sm font-semibold">
            <Eye className="mr-1 h-4 w-4" />প্রিভিউ
          </Button>
          <Button size="sm" onClick={() => save([node.current], fileName)} disabled={isSaving} className="h-10 text-sm font-semibold" aria-label={`${content.title} ডাউনলোড করুন`}>
            {isSaving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Download className="mr-1 h-4 w-4" />}ডাউনলোড
          </Button>
        </div>
      </div>
      <PosterPreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} cards={[content]} design={design} fileName={fileName} />
    </article>
  )
}
