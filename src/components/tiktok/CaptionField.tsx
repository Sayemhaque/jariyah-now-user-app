import { Label } from '@/components/ui/label'
import { maxTitleLength } from '@/lib/tiktok/rules'

interface CaptionFieldProps {
  value: string
  onChange: (title: string) => void
}

export function CaptionField({ value, onChange }: CaptionFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor="tiktok-caption" className="text-sm font-medium">Caption</Label>
        <span className="text-[11px] text-muted-foreground">{value.length}/{maxTitleLength}</span>
      </div>
      <textarea
        id="tiktok-caption"
        value={value}
        maxLength={maxTitleLength}
        rows={3}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-none rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </div>
  )
}
