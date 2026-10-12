import { HexColorPicker } from 'react-colorful'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface ColorFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function ColorField({ label, value, onChange, disabled }: ColorFieldProps) {
  return (
    <div className={cn('flex items-center justify-between gap-3', disabled && 'opacity-50')}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono text-foreground/70 uppercase">{value}</span>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className="h-7 w-9 rounded-md border border-border ring-1 ring-inset ring-white/5 disabled:cursor-not-allowed"
              style={{ backgroundColor: value }}
              aria-label={`Pick ${label}`}
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2 bg-popover border-border">
            <HexColorPicker color={value} onChange={onChange} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
