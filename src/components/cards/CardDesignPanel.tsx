import { SectionTitle } from '@/components/customize/SectionTitle'
import { cardDesigns, templateCount } from '@/lib/cards/templates'
import { bnDigits } from '@/lib/cards/bangla'
import { AdvancedDesign } from './AdvancedDesign'
import { EyebrowPicker } from './EyebrowPicker'
import { FontPicker } from './FontPicker'
import { FormatPicker } from './FormatPicker'
import { DecorationPicker, StructurePicker } from './LayoutPicker'
import { TextSizePicker } from './TextSizePicker'
import { ThemePicker } from './ThemePicker'
import { TitleStylePicker } from './TitleStylePicker'

export function CardDesignPanel() {
  return (
    <div className="space-y-3">
      <SectionTitle>সাইজ</SectionTitle>
      <FormatPicker />
      <SectionTitle>লেআউট</SectionTitle>
      <StructurePicker />
      <SectionTitle>রং</SectionTitle>
      <ThemePicker />
      <AdvancedDesign>
        <SectionTitle>নকশা</SectionTitle>
        <DecorationPicker />
        <SectionTitle>সেকশনের শিরোনাম</SectionTitle>
        <EyebrowPicker />
        <SectionTitle>শিরোনামের ধরন</SectionTitle>
        <TitleStylePicker />
        <SectionTitle>ফন্ট</SectionTitle>
        <FontPicker />
        <SectionTitle>লেখার সাইজ</SectionTitle>
        <TextSizePicker />
      </AdvancedDesign>
      <p className="text-xs text-muted-foreground">{bnDigits(cardDesigns.length)}টি লেআউট × {bnDigits(100)}টি রং = {bnDigits(templateCount)}টি টেমপ্লেট</p>
    </div>
  )
}
