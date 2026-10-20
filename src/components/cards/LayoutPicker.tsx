import { useState } from 'react'
import { OptionButton } from '@/components/common/OptionButton'
import { Button } from '@/components/ui/button'
import { useCardContents } from '@/hooks/useCardContents'
import { useCardDesign } from '@/hooks/useCardDesign'
import { useContent } from '@/lib/contentStore'
import { bnDigits } from '@/lib/cards/bangla'
import { azkarCard } from '@/lib/cards/cardContent'
import { cardLayouts } from '@/lib/cards/templates'
import { cardVariants, variantSpecs } from '@/lib/cards/variants'
import { textCollections } from '@/lib/collections'
import { ScaledCard } from './ScaledCard'

const sample = azkarCard(textCollections.azkar.find((a) => a.id === 'hawqala')!, 'english')
const firstLayouts = 9

function PreviewOption({ selected, onSelect, label, children }: { selected: boolean; onSelect: () => void; label: string; children: React.ReactNode }) {
  return (
    <OptionButton selected={selected} onSelect={onSelect} glow className="flex flex-col gap-1.5 rounded-xl p-1.5">
      <span aria-hidden className="pointer-events-none block overflow-hidden rounded-md">{children}</span>
      <span className="text-xs font-medium leading-tight">{label}</span>
    </OptionButton>
  )
}

export function StructurePicker() {
  const { setCardLayout } = useContent()
  const design = useCardDesign()
  const content = useCardContents().cards[0] ?? sample
  const [showAll, setShowAll] = useState(false)
  const shown = showAll ? cardLayouts : cardLayouts.filter((l, i) => i < firstLayouts || l.key === design.layout)
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {shown.map((layout) => (
          <PreviewOption key={layout.key} selected={design.layout === layout.key} onSelect={() => setCardLayout(layout.key)} label={layout.label}>
            <ScaledCard {...design} lazy format="portrait" layout={layout.key} content={content} />
          </PreviewOption>
        ))}
      </div>
      <Button variant="secondary" onClick={() => setShowAll(!showAll)} className="h-11 w-full text-sm font-semibold">
        {showAll ? 'কম লেআউট দেখান' : `সব ${bnDigits(cardLayouts.length)}টি লেআউট দেখুন`}
      </Button>
    </div>
  )
}

export function DecorationPicker() {
  const { setCardVariant } = useContent()
  const design = useCardDesign()
  const content = useCardContents().cards[0] ?? sample
  return (
    <div className="grid grid-cols-3 gap-2">
      {cardVariants.map((variant) => (
        <PreviewOption key={variant} selected={design.variant === variant} onSelect={() => setCardVariant(variant)} label={variantSpecs[variant].label}>
          <ScaledCard {...design} lazy format="portrait" variant={variant} eyebrowStyle={undefined} content={content} />
        </PreviewOption>
      ))}
    </div>
  )
}
