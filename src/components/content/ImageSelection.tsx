import { TranslationSelector } from '@/components/TranslationSelector'
import { isPresetMode, type ContentMode } from '@/lib/collections/types'
import { PresetPicker } from './PresetPicker'
import { TextSelection } from './TextSelection'

export function ImageSelection({ mode }: { mode: Exclude<ContentMode, 'quran'> }) {
  if (!isPresetMode(mode)) return <TextSelection mode={mode} />
  return (
    <div className="space-y-2.5">
      <PresetPicker mode={mode} />
      <TranslationSelector />
    </div>
  )
}
