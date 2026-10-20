import { useState } from 'react'
import { ChevronDown, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AdvancedDesign({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-border bg-card/60">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-2.5 px-4 py-3.5 text-left">
        <Settings2 className="h-5 w-5 text-primary" />
        <span className="flex-1">
          <span className="block text-sm font-semibold">আরও ডিজাইন অপশন</span>
          <span className="block text-xs text-muted-foreground">নকশা, শিরোনামের ধরন ও ফন্ট — না বদলালেও চলবে</span>
        </span>
        <ChevronDown className={cn('h-5 w-5 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="space-y-3 border-t border-border px-4 pb-4 pt-3">{children}</div>}
    </div>
  )
}
