'use client'

import { Check, Mic2 } from 'lucide-react'
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
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-foreground/90">
        <Mic2 className="h-4 w-4 text-primary" />
        Reciter
      </label>

      <Select value={reciterId} onValueChange={setReciter}>
        <SelectTrigger className="w-full bg-card/60 h-11">
          <SelectValue placeholder="Choose a reciter" />
        </SelectTrigger>
        <SelectContent className="bg-popover">
          {RECITERS.map((r) => (
            <SelectItem key={r.id} value={r.id} className="py-2.5">
              <div className="flex items-center gap-3 w-full">
                <div
                  className="grid place-items-center h-9 w-9 rounded-full text-xs font-bold text-white shrink-0 ring-2 ring-white/10"
                  style={{ backgroundColor: r.avatarColor }}
                >
                  {r.name
                    .split(' ')
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join('')}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium leading-tight truncate">
                    {r.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground leading-tight">
                    {r.style}
                  </span>
                </div>
                <span lang="ar" className="font-arabic-uthmani text-lg text-foreground/80 shrink-0">
                  {r.arabicName}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Inline preview of the selected reciter */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card/40 px-3 py-2.5">
        <div
          className="grid place-items-center h-10 w-10 rounded-full text-sm font-bold text-white shrink-0 ring-2 ring-white/10"
          style={{ backgroundColor: selected.avatarColor }}
        >
          {selected.name
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0])
            .join('')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{selected.name}</span>
            {reciterId === selected.id && (
              <Check className="h-3.5 w-3.5 text-primary shrink-0" />
            )}
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-2">
            <span>{selected.style}</span>
            <span className="opacity-50">·</span>
            <span lang="ar" className="font-arabic-uthmani text-base">
              {selected.arabicName}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
