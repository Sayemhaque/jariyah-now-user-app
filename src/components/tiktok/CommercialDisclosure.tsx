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
      <SwitchField label="ভিডিওর বাণিজ্যিক তথ্য জানান" checked={form.commercial} onChange={(commercial) => onChange({ commercial })} />
      <p className="text-xs text-muted-foreground">এই ভিডিওতে টাকা বা অন্য কিছুর বিনিময়ে কোনো পণ্য বা সেবার প্রচার থাকলে এটি চালু করুন।</p>
      {form.commercial && (
        <div className="space-y-1 pt-1">
          <BrandChoice
            title="আপনার নিজের ব্র্যান্ড"
            description="আপনি নিজের বা নিজের ব্যবসার প্রচার করছেন।"
            checked={form.yourBrand}
            onChange={(yourBrand) => onChange({ yourBrand })}
          />
          <BrandChoice
            title="অন্যের ব্র্যান্ডের প্রচার"
            description="আপনি অন্য কোনো ব্র্যান্ড বা প্রতিষ্ঠানের প্রচার করছেন।"
            checked={form.brandedContent}
            onChange={(brandedContent) => onChange({ brandedContent })}
          />
          {label && <p className="px-2 text-xs font-medium text-primary">{label}</p>}
        </div>
      )}
    </div>
  )
}
