import { cn } from '@/lib/utils'
import { useContent } from '@/lib/contentStore'
import type { CardTheme } from '@/lib/cards/types'

export function ThemeSwatch({ theme }: { theme: CardTheme }) {
  const { cardThemeKey, setCardThemeKey } = useContent()
  const selected = cardThemeKey === theme.key
  return (
    <button
      type="button"
      title={theme.label}
      aria-label={theme.label}
      aria-pressed={selected}
      onClick={() => setCardThemeKey(theme.key)}
      className={cn('relative aspect-[4/5] overflow-hidden rounded-md border transition', selected ? 'border-primary ring-2 ring-primary/50' : 'border-border hover:scale-105')}
      style={{ background: theme.background }}
    >
      <span className="absolute inset-[14%] border" style={{ borderColor: theme.accent, opacity: 0.7 }} />
      <span className="absolute left-1/2 top-[34%] h-[3px] w-1/2 -translate-x-1/2 rounded-full" style={{ background: theme.arabic }} />
      <span className="absolute left-1/2 top-[50%] h-[2px] w-[40%] -translate-x-1/2 rounded-full" style={{ background: theme.ink }} />
      <span className="absolute left-1/2 top-[62%] h-[2px] w-[30%] -translate-x-1/2 rounded-full" style={{ background: theme.accent }} />
    </button>
  )
}
