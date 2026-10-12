import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AyatNumberSelectProps {
  label: string
  value: number
  max: number
  disabled: boolean
  onChange: (value: number) => void
}

export function AyatNumberSelect({ label, value, max, disabled, onChange }: AyatNumberSelectProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</Label>
      <Select value={String(value)} onValueChange={(next) => onChange(Number(next))} disabled={disabled}>
        <SelectTrigger className="w-full bg-card h-9 text-sm">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent className="max-h-[220px] bg-popover">
          {Array.from({ length: max }, (_, index) => index + 1).map((number) => (
            <SelectItem key={number} value={String(number)}>
              {number}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
