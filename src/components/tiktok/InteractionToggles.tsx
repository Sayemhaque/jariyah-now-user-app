import { SwitchField } from '@/components/customize/SwitchField'
import type { CreatorInfo, TikTokPostForm } from '@/lib/tiktok/rules'

interface InteractionTogglesProps {
  form: TikTokPostForm
  creator: CreatorInfo
  onChange: (patch: Partial<TikTokPostForm>) => void
}

export function InteractionToggles({ form, creator, onChange }: InteractionTogglesProps) {
  return (
    <div className="space-y-2.5 rounded-xl border border-border bg-background/40 p-3">
      <p className="text-sm font-medium">Allow users to</p>
      <SwitchField
        label={creator.commentDisabled ? 'Comment (turned off in your TikTok settings)' : 'Comment'}
        checked={form.allowComment}
        disabled={creator.commentDisabled}
        onChange={(allowComment) => onChange({ allowComment })}
      />
      <SwitchField
        label={creator.duetDisabled ? 'Duet (turned off in your TikTok settings)' : 'Duet'}
        checked={form.allowDuet}
        disabled={creator.duetDisabled}
        onChange={(allowDuet) => onChange({ allowDuet })}
      />
      <SwitchField
        label={creator.stitchDisabled ? 'Stitch (turned off in your TikTok settings)' : 'Stitch'}
        checked={form.allowStitch}
        disabled={creator.stitchDisabled}
        onChange={(allowStitch) => onChange({ allowStitch })}
      />
    </div>
  )
}
