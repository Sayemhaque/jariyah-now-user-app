import type { useAyatLoader } from '@/hooks/useAyatLoader'
import { SurahSelector } from '@/components/SurahSelector'
import { AyatRangePicker } from '@/components/AyatRangePicker'
import { ReciterSelector } from '@/components/ReciterSelector'
import { TranslationSelector } from '@/components/TranslationSelector'
import { LoadAyatsButton } from '@/components/builder/LoadAyatsButton'

export function QuranSelection({ loader }: { loader: ReturnType<typeof useAyatLoader> }) {
  return (
    <>
      <div className="space-y-2.5">
        <SurahSelector />
        <AyatRangePicker />
        <ReciterSelector />
        <TranslationSelector />
      </div>
      <LoadAyatsButton loader={loader} />
    </>
  )
}
