import { SectionTitle } from '@/components/customize/SectionTitle'
import { cardDesigns, templateCount } from '@/lib/cards/templates'
import { EyebrowPicker } from './EyebrowPicker'
import { FontPicker } from './FontPicker'
import { FormatPicker } from './FormatPicker'
import { LayoutPicker } from './LayoutPicker'
import { ThemePicker } from './ThemePicker'
import { TitleStylePicker } from './TitleStylePicker'

export function CardDesignPanel() {
  return (
    <div className="space-y-3">
      <SectionTitle>Size</SectionTitle>
      <FormatPicker />
      <SectionTitle>Layout</SectionTitle>
      <LayoutPicker />
      <SectionTitle>Section title</SectionTitle>
      <EyebrowPicker />
      <SectionTitle>Title style</SectionTitle>
      <TitleStylePicker />
      <SectionTitle>Fonts</SectionTitle>
      <FontPicker />
      <SectionTitle>Colours</SectionTitle>
      <ThemePicker />
      <p className="text-[11px] text-muted-foreground">{cardDesigns.length} layouts × 100 colours = {templateCount.toLocaleString()} templates.</p>
    </div>
  )
}
