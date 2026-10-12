import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface SurahSearchProps {
  query: string
  onChange: (query: string) => void
}

export function SurahSearch({ query, onChange }: SurahSearchProps) {
  return (
    <div className="p-2 sticky top-0 bg-popover z-10 border-b border-border" onPointerDown={(event) => event.stopPropagation()}>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search by name or number…"
          className="pl-9 h-9 bg-background/60"
          onKeyDown={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        />
      </div>
    </div>
  )
}
