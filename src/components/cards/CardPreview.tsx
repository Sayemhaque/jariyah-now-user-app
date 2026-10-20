'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Images, Loader2, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCardContents } from '@/hooks/useCardContents'
import { useCardDownload } from '@/hooks/useCardDownload'
import { useContent } from '@/lib/contentStore'
import { findCardTheme } from '@/lib/cards/themes'
import { PreviewPlaceholder } from '@/components/preview/PreviewPlaceholder'
import { CardStage } from './CardStage'
import { OffscreenCards } from './OffscreenCards'

export function CardPreview({ onSettingsClick }: { onSettingsClick: () => void }) {
  const { cardFormat, cardThemeKey, mode } = useContent()
  const { cards, isLoading } = useCardContents()
  const [index, setIndex] = useState(0)
  const nodes = useRef<(HTMLDivElement | null)[]>([])
  const { save, isSaving } = useCardDownload()
  const current = Math.min(index, Math.max(0, cards.length - 1))
  const theme = findCardTheme(cardThemeKey)
  const baseName = `jariyah-${mode}-${cards[0]?.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) ?? 'card'}-${cardFormat}`

  if (!cards.length) return <div className="grid h-full place-items-center p-6">{isLoading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <PreviewPlaceholder />}</div>

  return (
    <div className="flex h-full flex-col gap-3 p-3 sm:p-6">
      <OffscreenCards cards={cards} theme={theme} format={cardFormat} nodes={nodes} />
      <div className="relative min-h-0 flex-1">
        <CardStage content={cards[current]!} theme={theme} format={cardFormat} />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button size="icon" variant="secondary" onClick={onSettingsClick} className="lg:hidden" aria-label="Settings"><SlidersHorizontal className="h-4 w-4" /></Button>
        {cards.length > 1 && (
          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Button size="icon" variant="ghost" onClick={() => setIndex(Math.max(0, current - 1))} disabled={current === 0}><ChevronLeft className="h-4 w-4" /></Button>
            {current + 1} / {cards.length}
            <Button size="icon" variant="ghost" onClick={() => setIndex(Math.min(cards.length - 1, current + 1))} disabled={current === cards.length - 1}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        )}
        <Button onClick={() => save([nodes.current[current] ?? null], cards.length > 1 ? `${baseName}-${current + 1}` : baseName)} disabled={isSaving} className="font-semibold">
          {isSaving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Download className="mr-1.5 h-4 w-4" />}
          Download PNG
        </Button>
        {cards.length > 1 && <AllSlidesButton count={cards.length} onSave={() => save(cards.map((_, i) => nodes.current[i] ?? null), baseName)} />}
      </div>
    </div>
  )
}

function AllSlidesButton({ count, onSave }: { count: number; onSave: () => void }) {
  return (
    <Button variant="secondary" onClick={onSave} className="font-semibold">
      <Images className="mr-1.5 h-4 w-4" />
      All {count} slides
    </Button>
  )
}
