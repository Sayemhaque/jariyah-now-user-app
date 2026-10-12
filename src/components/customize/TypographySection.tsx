import { Sparkles } from 'lucide-react'
import { useSettings } from '@/lib/store'
import { arabicFontOptions, bengaliFontOptions, textSpacingOptions, textWidthOptions } from '@/lib/content/customize'
import { FontSizeFields } from './FontSizeFields'
import { SectionTitle } from './SectionTitle'
import { SegmentedField } from './SegmentedField'
import { SelectField } from './SelectField'
import { SwitchField } from './SwitchField'

export function TypographySection() {
  const { settings, updateSettings, setAutoFitFonts } = useSettings()
  return (
    <>
      <SectionTitle>Typography</SectionTitle>
      <div className="space-y-2.5">
        <SwitchField icon={Sparkles} label="Auto-fit fonts" checked={settings.autoFitFonts} onChange={setAutoFitFonts} />
        {settings.autoFitFonts && (
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Font sizes auto-scale to the selected layout. Turn off to fine-tune manually.
          </p>
        )}
        <SelectField
          label="Arabic font"
          value={settings.arabicFont}
          options={arabicFontOptions}
          onChange={(arabicFont) => updateSettings({ arabicFont, fontStyle: arabicFont })}
        />
        <SelectField
          label="Bengali font"
          value={settings.bengaliFont}
          options={bengaliFontOptions}
          onChange={(bengaliFont) => updateSettings({ bengaliFont })}
        />
        <FontSizeFields />
        <SegmentedField
          label="Text width"
          value={settings.textWidth}
          options={textWidthOptions}
          gridClassName="grid grid-cols-4 gap-1"
          onChange={(textWidth) => updateSettings({ textWidth })}
        />
        <SegmentedField
          label="Text spacing"
          value={settings.textSpacing}
          options={textSpacingOptions}
          gridClassName="grid grid-cols-3 gap-1"
          onChange={(textSpacing) => updateSettings({ textSpacing })}
        />
      </div>
    </>
  )
}
