import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { isPrivacyAllowed, privacyLabels, type TikTokPostForm } from '@/lib/tiktok/rules'

interface PrivacySelectProps {
  form: TikTokPostForm
  options: string[]
  onChange: (privacyLevel: string) => void
}

export function PrivacySelect({ form, options, onChange }: PrivacySelectProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">Who can view this video</Label>
      <Select value={form.privacyLevel ?? ''} onValueChange={onChange}>
        <SelectTrigger className="h-10 w-full bg-background/60">
          <SelectValue placeholder="Select privacy" />
        </SelectTrigger>
        <SelectContent>
          {options.map((level) => {
            const allowed = isPrivacyAllowed(form, level)
            return (
              <SelectItem key={level} value={level} disabled={!allowed}>
                {privacyLabels[level] ?? level}
                {!allowed && <span className="ml-2 text-xs text-muted-foreground">Branded content can&apos;t be private</span>}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}
