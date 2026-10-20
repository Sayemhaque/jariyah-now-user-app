import { KeyRound } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function UploadKeyField({ value, onChange }: { value: string; onChange: (key: string) => void }) {
  return (
    <div className="relative">
      <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input type="password" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Upload key (saved on this device)" className="h-9 pl-8 text-xs" autoComplete="off" />
    </div>
  )
}
