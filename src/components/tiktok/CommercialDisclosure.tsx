import { SwitchField } from '@/components/customize/SwitchField'
import { commercialLabel, type TikTokPostForm } from '@/lib/tiktok/rules'
import { BrandChoice } from './BrandChoice'

interface CommercialDisclosureProps {
  form: TikTokPostForm
  onChange: (patch: Partial<TikTokPostForm>) => void
}

export function CommercialDisclosure({ form, onChange }: CommercialDisclosureProps) {
  const label = commercialLabel(form)
  return (
    <div className="space-y-2 rounded-xl border border-border bg-background/40 p-3">
      <SwitchField label="Disclose video content" checked={form.commercial} onChange={(commercial) => onChange({ commercial })} />
      <p className="text-xs text-muted-foreground">Turn on to disclose that this video promotes goods or services in exchange for something of value.</p>
      {form.commercial && (
        <div className="space-y-1 pt-1">
          <BrandChoice
            title="Your brand"
            description="You are promoting yourself or your own business."
            checked={form.yourBrand}
            onChange={(yourBrand) => onChange({ yourBrand })}
          />
          <BrandChoice
            title="Branded content"
            description="You are promoting another brand or a third party."
            checked={form.brandedContent}
            onChange={(brandedContent) => onChange({ brandedContent })}
          />
          {label && <p className="px-2 text-xs font-medium text-primary">{label}</p>}
        </div>
      )}
    </div>
  )
}
