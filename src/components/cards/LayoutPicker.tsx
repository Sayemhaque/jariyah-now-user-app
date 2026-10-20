import { OptionButton } from '@/components/common/OptionButton'
import { useCardContents } from '@/hooks/useCardContents'
import { useCardDesign } from '@/hooks/useCardDesign'
import { useContent } from '@/lib/contentStore'
import { azkarCard } from '@/lib/cards/cardContent'
import { cardLayouts } from '@/lib/cards/templates'
import { cardVariants, variantSpecs } from '@/lib/cards/variants'
import { textCollections } from '@/lib/collections'
import { ScaledCard } from './ScaledCard'

const sample = azkarCard(textCollections.azkar.find((a) => a.id === 'hawqala')!, 'english')

function PreviewOption({ selected, onSelect, label, children }: { selected: boolean; onSelect: () => void; label: string; children: React.ReactNode }) {
  return (
    <OptionButton selected={selected} onSelect={onSelect} glow className="flex flex-col gap-1.5 rounded-xl p-1.5">
      <span aria-hidden className="pointer-events-none block overflow-hidden rounded-md">{children}</span>
      <span className="text-[10px] font-medium leading-tight">{label}</span>
    </OptionButton>
  )
}

export function LayoutPicker() {
  const { setCardLayout, setCardVariant } = useContent()
  const design = useCardDesign()
  const content = useCardContents().cards[0] ?? sample
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Structure · 12</p>
      <div className="grid grid-cols-3 gap-2">
        {cardLayouts.map((layout) => (
          <PreviewOption key={layout.key} selected={design.layout === layout.key} onSelect={() => setCardLayout(layout.key)} label={layout.label}>
            <ScaledCard {...design} format="portrait" layout={layout.key} content={content} />
          </PreviewOption>
        ))}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Decoration · 9 (×12 = 108 layouts)</p>
      <div className="grid grid-cols-3 gap-2">
        {cardVariants.map((variant) => (
          <PreviewOption key={variant} selected={design.variant === variant} onSelect={() => setCardVariant(variant)} label={variantSpecs[variant].label}>
            <ScaledCard {...design} format="portrait" variant={variant} eyebrowStyle={undefined} content={content} />
          </PreviewOption>
        ))}
      </div>
    </div>
  )
}
