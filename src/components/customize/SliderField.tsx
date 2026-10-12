import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

interface SliderFieldProps {
  label: string
  valueLabel: string
  value: number
  min: number
  max: number
  disabled?: boolean
  onChange: (value: number) => void
}

export function SliderField({ label, valueLabel, value, min, max, disabled, onChange }: SliderFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <span className="text-[11px] font-mono text-foreground/70 tabular-nums">{valueLabel}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        disabled={disabled}
        onValueChange={(next) => onChange(next[0]!)}
      />
    </div>
  )
}
