'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Loader2, Maximize2, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCardContents } from '@/hooks/useCardContents'
import { useCardDownload } from '@/hooks/useCardDownload'
import { useCardDesign } from '@/hooks/useCardDesign'
import { useContent } from '@/lib/contentStore'
import { bnDigits } from '@/lib/cards/bangla'
import { CardStage } from './CardStage'
import { OffscreenCards } from './OffscreenCards'
import { PosterPreviewDialog } from './PosterPreviewDialog'
import { PosterPlaceholder } from './PosterPlaceholder'

export function CardPreview({ onSettingsClick }: { onSettingsClick: () => void }) {
  const { cardFormat, mode } = useContent()
  const design = useCardDesign()
  const { cards, isLoading } = useCardContents()
  const [index, setIndex] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(false)
  const nodes = useRef<(HTMLDivElement | null)[]>([])
  const { save, isSaving } = useCardDownload()
  const current = Math.min(index, Math.max(0, cards.length - 1))
  const fileName = `jariyah-${mode}-${cards[0]?.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'poster'}-${cardFormat}`

  if (!cards.length) return <PosterPlaceholder isLoading={isLoading} onSettingsClick={onSettingsClick} />

  return (
    <div className="flex h-full flex-col gap-3 p-3 sm:p-6">
      <OffscreenCards cards={cards} design={design} nodes={nodes} />
      <button type="button" onClick={() => setPreviewOpen(true)} className="relative min-h-0 flex-1" aria-label="বড় করে দেখুন">
        <CardStage {...design} content={cards[current]!} />
      </button>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button size="icon" variant="secondary" onClick={onSettingsClick} className="h-11 w-11 lg:hidden" aria-label="সেটিংস"><SlidersHorizontal className="h-5 w-5" /></Button>
        {cards.length > 1 && (
          <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <Button size="icon" variant="ghost" onClick={() => setIndex(Math.max(0, current - 1))} disabled={current === 0} aria-label="আগের স্লাইড"><ChevronLeft className="h-5 w-5" /></Button>
            {bnDigits(current + 1)} / {bnDigits(cards.length)}
            <Button size="icon" variant="ghost" onClick={() => setIndex(Math.min(cards.length - 1, current + 1))} disabled={current === cards.length - 1} aria-label="পরের স্লাইড"><ChevronRight className="h-5 w-5" /></Button>
          </div>
        )}
        <Button variant="secondary" onClick={() => setPreviewOpen(true)} className="h-11 px-4 text-sm font-semibold">
          <Maximize2 className="mr-1.5 h-4 w-4" />বড় করে দেখুন
        </Button>
        <Button onClick={() => save([nodes.current[current] ?? null], cards.length > 1 ? `${fileName}-${current + 1}` : fileName)} disabled={isSaving} className="h-11 px-5 text-sm font-semibold">
          {isSaving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Download className="mr-1.5 h-4 w-4" />}ডাউনলোড করুন
        </Button>
      </div>
      <PosterPreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} cards={cards} design={design} fileName={fileName} />
    </div>
  )
}
