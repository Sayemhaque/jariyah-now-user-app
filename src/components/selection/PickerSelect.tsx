import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select'

interface PickerSelectProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  disabled?: boolean
  contentClassName?: string
  children: React.ReactNode
}

export function PickerSelect({ value, onChange, placeholder, disabled, contentClassName, children }: PickerSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full bg-card h-12 text-sm px-4 py-3">
        <SelectValue className="justify-center" placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={cn('bg-popover', contentClassName)}>{children}</SelectContent>
    </Select>
  )
}
