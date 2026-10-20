import { RotateCcw } from 'lucide-react'
import { SliderField } from '@/components/customize/SliderField'
import { Button } from '@/components/ui/button'
import { useCardContents } from '@/hooks/useCardContents'
import { useContent } from '@/lib/contentStore'
import { bnDigits } from '@/lib/cards/bangla'
import { isDefaultTextSizes, maxTextSize, minTextSize, partsForContents, resolveTextSizes } from '@/lib/cards/textSizes'

export function TextSizePicker() {
  const { cardTextSizes, setCardTextSize, resetCardTextSizes } = useContent()
  const { cards } = useCardContents()
  const sizes = resolveTextSizes(cardTextSizes)
  return (
    <div className="space-y-3">
      {partsForContents(cards).map(({ part, label }) => {
        const percent = Math.round(sizes[part] * 100)
        return (
          <SliderField key={part} label={label} valueLabel={`${bnDigits(percent)}%`} value={percent} min={minTextSize} max={maxTextSize} onChange={(value) => setCardTextSize(part, value / 100)} />
        )
      })}
      <Button variant="secondary" size="sm" className="w-full" disabled={isDefaultTextSizes(cardTextSizes)} onClick={resetCardTextSizes}>
        <RotateCcw className="mr-1.5 h-4 w-4" />
        সব সাইজ আগের মতো করুন
      </Button>
      <p className="text-[11px] leading-snug text-muted-foreground">লেখা কার্ডে না ধরলে মূল লেখা নিজে থেকে একটু ছোট হয়ে যায়, যাতে কিছু কেটে না যায়।</p>
    </div>
  )
}
