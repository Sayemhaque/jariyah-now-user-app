import { OptionButton } from '@/components/common/OptionButton'
import { CardEyebrow } from '@/cards/CardEyebrow'
import { useCardDesign } from '@/hooks/useCardDesign'
import { useContent } from '@/lib/contentStore'
import { eyebrowStyles } from '@/lib/cards/variants'

export function EyebrowPicker() {
  const { eyebrowStyle, setEyebrowStyle } = useContent()
  const { theme } = useCardDesign()
  return (
    <div className="grid grid-cols-2 gap-2">
      <OptionButton selected={eyebrowStyle === null} onSelect={() => setEyebrowStyle(null)} className="col-span-2 rounded-lg py-2 text-xs font-medium">
        Match the layout
      </OptionButton>
      {eyebrowStyles.map(({ key, label }) => (
        <OptionButton key={key} selected={eyebrowStyle === key} onSelect={() => setEyebrowStyle(key)} className="flex flex-col items-center gap-1 rounded-lg p-1.5">
          <span aria-hidden className="pointer-events-none flex h-14 w-full items-center justify-center overflow-hidden rounded-md" style={{ background: theme.background }}>
            <span style={{ transform: 'scale(0.42)', whiteSpace: 'nowrap' }}>
              <CardEyebrow text="Hadith" theme={theme} style={key} align="center" />
            </span>
          </span>
          <span className="text-[10px] font-medium">{label}</span>
        </OptionButton>
      ))}
    </div>
  )
}
