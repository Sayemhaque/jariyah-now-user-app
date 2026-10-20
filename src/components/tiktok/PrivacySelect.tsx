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
      <Label className="text-sm font-medium">ভিডিওটি কারা দেখতে পারবেন</Label>
      <Select value={form.privacyLevel ?? ''} onValueChange={onChange}>
        <SelectTrigger className="h-10 w-full bg-background/60">
          <SelectValue placeholder="কারা দেখবেন বেছে নিন" />
        </SelectTrigger>
        <SelectContent>
          {options.map((level) => {
            const allowed = isPrivacyAllowed(form, level)
            return (
              <SelectItem key={level} value={level} disabled={!allowed}>
                {privacyLabels[level] ?? level}
                {!allowed && <span className="ml-2 text-xs text-muted-foreground">অন্যের ব্র্যান্ডের প্রচার শুধু নিজের জন্য রাখা যায় না</span>}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}
