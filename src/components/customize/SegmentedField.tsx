import { Label } from '@/components/ui/label'
import { OptionButton } from '@/components/common/OptionButton'

interface SegmentedFieldProps<T extends string> {
  label: string
  value: T
  options: T[]
  gridClassName: string
  onChange: (value: T) => void
}

export function SegmentedField<T extends string>({ label, value, options, gridClassName, onChange }: SegmentedFieldProps<T>) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className={gridClassName}>
        {options.map((option) => (
          <OptionButton
            key={option}
            selected={value === option}
            onSelect={() => onChange(option)}
            className="rounded-lg py-1.5 text-[11px] font-medium capitalize"
          >
            {option}
          </OptionButton>
        ))}
      </div>
    </div>
  )
}
