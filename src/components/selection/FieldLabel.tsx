import type { LucideIcon } from 'lucide-react'

export function FieldLabel({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      <Icon className="h-3.5 w-3.5 text-primary" />
      {children}
    </label>
  )
}
