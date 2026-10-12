import type { Surah } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

export function SurahSummary({ surah }: { surah: Surah }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-0.5">
      <Badge variant="secondary" className="font-mono bg-primary/10 text-primary border-primary/20">
        {surah.number}
      </Badge>
      <span className="tabular-nums">{surah.numberOfAyahs} ayats</span>
      <span className="opacity-50">·</span>
      <span>{surah.revelationType}</span>
    </div>
  )
}
