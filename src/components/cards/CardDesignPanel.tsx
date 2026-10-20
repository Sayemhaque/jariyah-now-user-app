import { SectionTitle } from '@/components/customize/SectionTitle'
import { FormatPicker } from './FormatPicker'
import { ThemePicker } from './ThemePicker'

export function CardDesignPanel() {
  return (
    <div className="space-y-3">
      <SectionTitle>Size</SectionTitle>
      <FormatPicker />
      <SectionTitle>Design</SectionTitle>
      <ThemePicker />
    </div>
  )
}
