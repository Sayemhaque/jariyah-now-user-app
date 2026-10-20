import { OptionButton } from '@/components/common/OptionButton'
import { useCardContents } from '@/hooks/useCardContents'
import { useContent } from '@/lib/contentStore'
import { azkarCard } from '@/lib/cards/cardContent'
import { cardLayouts } from '@/lib/cards/templates'
import { findCardTheme } from '@/lib/cards/themes'
import { textCollections } from '@/lib/collections'
import { ScaledCard } from './ScaledCard'

const sample = azkarCard(textCollections.azkar.find((a) => a.id === 'hawqala')!, 'english')

export function LayoutPicker() {
  const { cardLayout, setCardLayout, cardThemeKey } = useContent()
  const { cards } = useCardContents()
  const theme = findCardTheme(cardThemeKey)
  const content = cards[0] ?? sample
  return (
    <div className="grid grid-cols-3 gap-2">
      {cardLayouts.map((layout) => (
        <OptionButton key={layout.key} selected={cardLayout === layout.key} onSelect={() => setCardLayout(layout.key)} glow className="flex flex-col gap-1.5 rounded-xl p-1.5">
          <span aria-hidden className="pointer-events-none block overflow-hidden rounded-md">
            <ScaledCard content={content} theme={theme} format="portrait" layout={layout.key} />
          </span>
          <span className="text-[10px] font-medium leading-tight">{layout.label}</span>
        </OptionButton>
      ))}
    </div>
  )
}
