import type { useAyatLoader } from '@/hooks/useAyatLoader'
import { SurahSelector } from '@/components/SurahSelector'
import { AyatRangePicker } from '@/components/AyatRangePicker'
import { ReciterSelector } from '@/components/ReciterSelector'
import { TranslationSelector } from '@/components/TranslationSelector'
import { LoadAyatsButton } from '@/components/builder/LoadAyatsButton'
import { isPresetMode, type ContentMode } from '@/lib/collections/types'
import { PresetPicker } from './PresetPicker'

export function QuranSelection({ mode, loader }: { mode: ContentMode; loader: ReturnType<typeof useAyatLoader> }) {
  return (
    <>
      <div className="space-y-2.5">
        {isPresetMode(mode) ? <PresetPicker mode={mode} /> : <SurahSelector />}
        {!isPresetMode(mode) && <AyatRangePicker />}
        <ReciterSelector />
        <TranslationSelector />
      </div>
      <LoadAyatsButton loader={loader} />
    </>
  )
}
