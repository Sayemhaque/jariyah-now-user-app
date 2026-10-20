import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useContent } from '@/lib/contentStore'
import { bnDigits } from '@/lib/cards/bangla'
import { darkCardThemes, findCardTheme, lightCardThemes } from '@/lib/cards/themes'
import type { CardTheme } from '@/lib/cards/types'
import { ThemeSwatch } from './ThemeSwatch'

export function ThemePicker() {
  const { cardThemeKey } = useContent()
  const [showAll, setShowAll] = useState(false)
  const limit = showAll ? undefined : 12
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        বেছে নেওয়া রং: <span className="font-semibold text-foreground">{findCardTheme(cardThemeKey).label}</span>
      </p>
      <ThemeGroup label="হালকা রং" themes={lightCardThemes.slice(0, limit)} />
      <ThemeGroup label="গাঢ় রং" themes={darkCardThemes.slice(0, limit)} />
      <Button variant="secondary" onClick={() => setShowAll(!showAll)} className="h-11 w-full text-sm font-semibold">
        {showAll ? 'কম রং দেখান' : `সব ${bnDigits(lightCardThemes.length + darkCardThemes.length)}টি রং দেখুন`}
      </Button>
    </div>
  )
}

function ThemeGroup({ label, themes }: { label: string; themes: CardTheme[] }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
        {themes.map((theme) => <ThemeSwatch key={theme.key} theme={theme} />)}
      </div>
    </div>
  )
}
