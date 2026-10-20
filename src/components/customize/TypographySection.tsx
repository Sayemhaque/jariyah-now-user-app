import { Sparkles } from 'lucide-react'
import { useSettings } from '@/lib/store'
import { arabicFontOptions, bengaliFontOptions, textSpacingLabels, textSpacingOptions, textWidthLabels, textWidthOptions } from '@/lib/content/customize'
import { FontSizeFields } from './FontSizeFields'
import { SectionTitle } from './SectionTitle'
import { SegmentedField } from './SegmentedField'
import { SelectField } from './SelectField'
import { SwitchField } from './SwitchField'

export function TypographySection() {
  const { settings, updateSettings, setAutoFitFonts } = useSettings()
  return (
    <>
      <SectionTitle>ফন্ট</SectionTitle>
      <div className="space-y-2.5">
        <SwitchField icon={Sparkles} label="ফন্ট নিজে থেকে মানানসই" checked={settings.autoFitFonts} onChange={setAutoFitFonts} />
        {settings.autoFitFonts && (
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            লেআউট অনুযায়ী ফন্টের সাইজ নিজে থেকেই ঠিক হয়। নিজে সাইজ ঠিক করতে চাইলে এটি বন্ধ করুন।
          </p>
        )}
        <SelectField
          label="আরবি ফন্ট"
          value={settings.arabicFont}
          options={arabicFontOptions}
          onChange={(arabicFont) => updateSettings({ arabicFont, fontStyle: arabicFont })}
        />
        <SelectField
          label="বাংলা ফন্ট"
          value={settings.bengaliFont}
          options={bengaliFontOptions}
          onChange={(bengaliFont) => updateSettings({ bengaliFont })}
        />
        <FontSizeFields />
        <SegmentedField
          label="লেখার চওড়া"
          value={settings.textWidth}
          options={textWidthOptions}
          labels={textWidthLabels}
          gridClassName="grid grid-cols-4 gap-1"
          onChange={(textWidth) => updateSettings({ textWidth })}
        />
        <SegmentedField
          label="লাইনের ফাঁক"
          value={settings.textSpacing}
          options={textSpacingOptions}
          labels={textSpacingLabels}
          gridClassName="grid grid-cols-3 gap-1"
          onChange={(textSpacing) => updateSettings({ textSpacing })}
        />
      </div>
    </>
  )
}
