import { OptionButton } from '@/components/common/OptionButton'
import { useContent } from '@/lib/contentStore'
import { cardThemes } from '@/lib/cards/themes'

export function ThemePicker() {
  const { cardThemeKey, setCardThemeKey } = useContent()
  return (
    <div className="grid grid-cols-4 gap-2">
      {cardThemes.map((theme) => (
        <OptionButton key={theme.key} selected={cardThemeKey === theme.key} onSelect={() => setCardThemeKey(theme.key)} glow className="flex flex-col items-center gap-1.5 rounded-xl p-1.5">
          <span className="relative block aspect-[4/5] w-full overflow-hidden rounded-md" style={{ background: theme.background }}>
            <span className="absolute inset-0" style={{ background: theme.glow }} />
            <span className="absolute inset-[9%] border" style={{ borderColor: theme.accent, opacity: 0.6 }} />
            <span className="absolute left-1/2 top-[38%] h-[3px] w-[44%] -translate-x-1/2 rounded-full" style={{ background: theme.ink, opacity: 0.85 }} />
            <span className="absolute left-1/2 top-[48%] h-[3px] w-[56%] -translate-x-1/2 rounded-full" style={{ background: theme.muted }} />
            <span className="absolute left-1/2 top-[56%] h-[3px] w-[38%] -translate-x-1/2 rounded-full" style={{ background: theme.muted }} />
            <span className="absolute left-1/2 top-[72%] h-[2px] w-[24%] -translate-x-1/2 rounded-full" style={{ background: theme.accent }} />
          </span>
          <span className="text-[10px] font-medium leading-tight text-center">{theme.label}</span>
        </OptionButton>
      ))}
    </div>
  )
}
