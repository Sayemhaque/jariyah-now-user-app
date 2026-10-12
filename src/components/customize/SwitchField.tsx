import type { LucideIcon } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface SwitchFieldProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  icon?: LucideIcon
}

export function SwitchField({ label, checked, onChange, icon: Icon }: SwitchFieldProps) {
  const text = <Label className={Icon ? 'text-sm font-medium' : 'text-sm'}>{label}</Label>
  return (
    <div className="flex items-center justify-between">
      {Icon ? (
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-primary" />
          {text}
        </div>
      ) : (
        text
      )}
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
