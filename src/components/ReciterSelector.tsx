'use client'

import { Mic2 } from 'lucide-react'
import { useBuilderStore } from '@/lib/store'
import { RECITERS } from '@/lib/reciters'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function ReciterSelector() {
  const reciterId = useBuilderStore((s) => s.reciterId)
  const setReciter = useBuilderStore((s) => s.setReciter)
  const selected = RECITERS.find((r) => r.id === reciterId) ?? RECITERS[0]!

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        <Mic2 className="h-3.5 w-3.5 text-primary" />
        Reciter
      </label>

      <Select value={reciterId} onValueChange={setReciter}>
        <SelectTrigger className="w-full bg-card h-12 text-sm px-4 py-3">
          <SelectValue className="justify-center" placeholder="Choose a reciter" />
        </SelectTrigger>
        <SelectContent className="bg-popover">
          {RECITERS.map((r) => (
            <SelectItem key={r.id} value={r.id} className="py-2.5">
              <div className="flex items-center gap-3 w-full">
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium leading-tight truncate">
                    {r.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground leading-tight">
                    {r.style}
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
