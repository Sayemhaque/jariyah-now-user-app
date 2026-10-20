'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Images, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useCardDownload } from '@/hooks/useCardDownload'
import { bnDigits } from '@/lib/cards/bangla'
import { cardSizes, type CardContent, type CardProps } from '@/lib/cards/types'
import { OffscreenCards } from './OffscreenCards'
import { ScaledCard } from './ScaledCard'

interface PosterPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cards: CardContent[]
  design: Omit<CardProps, 'content'>
  fileName: string
}

export function PosterPreviewDialog({ open, onOpenChange, cards, design, fileName }: PosterPreviewDialogProps) {
  const [index, setIndex] = useState(0)
  const nodes = useRef<(HTMLDivElement | null)[]>([])
  const { save, isSaving } = useCardDownload()
  const current = Math.min(index, cards.length - 1)
  const { width, height } = cardSizes[design.format]
  const multiple = cards.length > 1
  if (!cards.length) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[96dvh] max-w-[calc(100%-1rem)] grid-cols-[minmax(0,1fr)] gap-4 overflow-y-auto border-white/10 bg-background/95 p-4 backdrop-blur-xl sm:max-w-[min(94vw,720px)] sm:p-6">
        <DialogTitle className="pr-8 text-base sm:text-lg">{cards[current]!.title}</DialogTitle>
        <DialogDescription className="sr-only">পোস্টারের বড় প্রিভিউ</DialogDescription>
        {open && <OffscreenCards cards={cards} design={design} nodes={nodes} />}
        <div className="relative mx-auto w-full" style={{ maxWidth: `min(100%, calc(62dvh * ${width / height}))` }}>
          <div className="overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10">
            <ScaledCard {...design} content={cards[current]!} />
          </div>
          {multiple && <SlideArrows current={current} count={cards.length} onChange={setIndex} />}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {multiple && <span className="text-sm font-medium text-muted-foreground">{bnDigits(current + 1)} / {bnDigits(cards.length)}</span>}
          <Button size="lg" onClick={() => save([nodes.current[current] ?? null], multiple ? `${fileName}-${current + 1}` : fileName)} disabled={isSaving} className="h-12 px-6 text-base font-semibold">
            {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
            ডাউনলোড করুন
          </Button>
          {multiple && (
            <Button size="lg" variant="secondary" onClick={() => save(cards.map((_, i) => nodes.current[i] ?? null), fileName)} disabled={isSaving} className="h-12 px-5 text-base font-semibold">
              <Images className="mr-2 h-5 w-5" />
              সব {bnDigits(cards.length)}টি ডাউনলোড
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SlideArrows({ current, count, onChange }: { current: number; count: number; onChange: (index: number) => void }) {
  const arrow = 'absolute top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur transition hover:bg-black/75 disabled:opacity-30'
  return (
    <>
      <button type="button" aria-label="আগের স্লাইড" className={`${arrow} -left-2 sm:-left-6`} disabled={current === 0} onClick={() => onChange(current - 1)}><ChevronLeft className="h-6 w-6" /></button>
      <button type="button" aria-label="পরের স্লাইড" className={`${arrow} -right-2 sm:-right-6`} disabled={current === count - 1} onClick={() => onChange(current + 1)}><ChevronRight className="h-6 w-6" /></button>
    </>
  )
}
