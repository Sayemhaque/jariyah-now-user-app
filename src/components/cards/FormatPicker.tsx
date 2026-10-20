import { OptionButton } from '@/components/common/OptionButton'
import { useContent } from '@/lib/contentStore'
import { cardSizes, type CardFormat } from '@/lib/cards/types'

const formats = Object.keys(cardSizes) as CardFormat[]

export function FormatPicker() {
  const { cardFormat, setCardFormat } = useContent()
  return (
    <div className="grid grid-cols-3 gap-2">
      {formats.map((format) => {
        const { width, height, label } = cardSizes[format]
        return (
          <OptionButton key={format} selected={cardFormat === format} onSelect={() => setCardFormat(format)} glow className="flex flex-col items-center gap-1.5 rounded-xl py-2.5">
            <span className="rounded-[3px] border-2 border-current" style={{ width: (width / height) * 22, height: 22 }} />
            <span className="text-xs font-medium leading-none">{label}</span>
          </OptionButton>
        )
      })}
    </div>
  )
}
