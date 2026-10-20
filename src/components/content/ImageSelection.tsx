import { TranslationSelector } from '@/components/TranslationSelector'
import { isPresetMode, type ContentMode } from '@/lib/collections/types'
import { PresetPicker } from './PresetPicker'
import { TextSelection } from './TextSelection'
import { HadithSelection } from '@/components/hadith/HadithSelection'

export function ImageSelection({ mode }: { mode: Exclude<ContentMode, 'quran'> }) {
  if (mode === 'hadith') return <HadithSelection />
  if (!isPresetMode(mode)) return <TextSelection mode={mode} />
  return (
    <div className="space-y-2.5">
      <PresetPicker mode={mode} />
      <TranslationSelector />
    </div>
  )
}
