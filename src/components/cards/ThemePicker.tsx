import { useContent } from '@/lib/contentStore'
import { darkCardThemes, findCardTheme, lightCardThemes } from '@/lib/cards/themes'
import type { CardTheme } from '@/lib/cards/types'
import { ThemeSwatch } from './ThemeSwatch'

export function ThemePicker() {
  const { cardThemeKey } = useContent()
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Selected: <span className="font-semibold text-foreground">{findCardTheme(cardThemeKey).label}</span>
      </p>
      <ThemeGroup label={`Light · ${lightCardThemes.length}`} themes={lightCardThemes} />
      <ThemeGroup label={`Dark & rich · ${darkCardThemes.length}`} themes={darkCardThemes} />
    </div>
  )
}

function ThemeGroup({ label, themes }: { label: string; themes: CardTheme[] }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
        {themes.map((theme) => <ThemeSwatch key={theme.key} theme={theme} />)}
      </div>
    </div>
  )
}
