import { Palette } from 'lucide-react'
import { OptionButton } from '@/components/common/OptionButton'
import { SwitchField } from '@/components/customize/SwitchField'
import { useContent } from '@/lib/contentStore'
import type { CardTitleStyle } from '@/lib/cards/types'
import { titleFont } from '@/cards/titleFonts'

const styles: { key: CardTitleStyle; label: string }[] = [
  { key: 'serif', label: 'Elegant' },
  { key: 'script', label: 'Calligraphy' },
  { key: 'display', label: 'Bold display' },
]

export function TitleStylePicker() {
  const { titleStyle, setTitleStyle, titleGradient, setTitleGradient } = useContent()
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-3 gap-2">
        {styles.map(({ key, label }) => {
          const latin = titleFont(key, 'Aa')
          const bangla = titleFont(key, 'আ')
          return (
            <OptionButton key={key} selected={titleStyle === key} onSelect={() => setTitleStyle(key)} glow className="flex flex-col items-center gap-1 rounded-xl px-1 py-2.5">
              <span className="flex items-baseline gap-1.5 text-[22px] leading-none">
                <span style={{ fontFamily: latin.fontFamily, fontWeight: latin.fontWeight, fontStyle: latin.fontStyle }}>Aa</span>
                <span style={{ fontFamily: bangla.fontFamily, fontWeight: bangla.fontWeight }}>আল</span>
              </span>
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </OptionButton>
          )
        })}
      </div>
      <SwitchField label="Gradient title" icon={Palette} checked={titleGradient} onChange={setTitleGradient} />
    </div>
  )
}
