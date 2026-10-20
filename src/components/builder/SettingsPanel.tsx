import type { useAyatLoader } from '@/hooks/useAyatLoader'
import { CustomizationPanel } from '@/components/CustomizationPanel'
import { ContentModePicker } from '@/components/content/ContentModePicker'
import { QuranSelection } from '@/components/content/QuranSelection'
import { TextSelection } from '@/components/content/TextSelection'
import { useContent } from '@/lib/contentStore'
import { isTextMode } from '@/lib/collections/types'
import { AppCredits } from './AppCredits'
import { StepPanel } from './StepPanel'

export function SettingsPanel({ loader }: { loader: ReturnType<typeof useAyatLoader> }) {
  const { mode } = useContent()
  return (
    <div className="space-y-3">
      <StepPanel step={1} title="Selection" className="space-y-3">
        <ContentModePicker />
        {isTextMode(mode) ? <TextSelection mode={mode} /> : <QuranSelection mode={mode} loader={loader} />}
      </StepPanel>
      <StepPanel step={2} title="Customize" className="space-y-2.5">
        <CustomizationPanel />
      </StepPanel>
      <AppCredits />
    </div>
  )
}
