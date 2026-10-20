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
      <p className="text-sm font-medium">দর্শকরা যা করতে পারবেন</p>
      <SwitchField
        label={creator.commentDisabled ? 'মন্তব্য (আপনার TikTok সেটিংসে বন্ধ আছে)' : 'মন্তব্য'}
        checked={form.allowComment}
        disabled={creator.commentDisabled}
        onChange={(allowComment) => onChange({ allowComment })}
      />
      <SwitchField
        label={creator.duetDisabled ? 'ডুয়েট (আপনার TikTok সেটিংসে বন্ধ আছে)' : 'ডুয়েট'}
        checked={form.allowDuet}
        disabled={creator.duetDisabled}
        onChange={(allowDuet) => onChange({ allowDuet })}
      />
      <SwitchField
        label={creator.stitchDisabled ? 'স্টিচ (আপনার TikTok সেটিংসে বন্ধ আছে)' : 'স্টিচ'}
        checked={form.allowStitch}
        disabled={creator.stitchDisabled}
        onChange={(allowStitch) => onChange({ allowStitch })}
      />
    </div>
  )
}
