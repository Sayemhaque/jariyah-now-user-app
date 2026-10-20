import { SectionTitle } from '@/components/customize/SectionTitle'
import { cardTemplates } from '@/lib/cards/templates'
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
      <SectionTitle>Title style</SectionTitle>
      <TitleStylePicker />
      <SectionTitle>Colours</SectionTitle>
      <ThemePicker />
      <p className="text-[11px] text-muted-foreground">{cardTemplates.length} templates: every layout works with every colour theme.</p>
    </div>
  )
}
