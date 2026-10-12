import type { useAyatLoader } from '@/hooks/useAyatLoader'
import { SurahSelector } from '@/components/SurahSelector'
import { AyatRangePicker } from '@/components/AyatRangePicker'
import { ReciterSelector } from '@/components/ReciterSelector'
import { TranslationSelector } from '@/components/TranslationSelector'
import { CustomizationPanel } from '@/components/CustomizationPanel'
import { AppCredits } from './AppCredits'
import { LoadAyatsButton } from './LoadAyatsButton'
import { StepPanel } from './StepPanel'

export function SettingsPanel({ loader }: { loader: ReturnType<typeof useAyatLoader> }) {
  return (
    <div className="space-y-3">
      <StepPanel step={1} title="Selection" className="space-y-3">
        <div className="space-y-2.5">
          <SurahSelector />
          <AyatRangePicker />
          <ReciterSelector />
          <TranslationSelector />
        </div>
        <LoadAyatsButton loader={loader} />
      </StepPanel>
      <StepPanel step={2} title="Customize" className="space-y-2.5">
        <CustomizationPanel />
      </StepPanel>
      <AppCredits />
    </div>
  )
}
