import type { useAyatLoader } from '@/hooks/useAyatLoader'
import { CustomizationPanel } from '@/components/CustomizationPanel'
import { CardDesignPanel } from '@/components/cards/CardDesignPanel'
import { ContentModePicker } from '@/components/content/ContentModePicker'
import { ImageSelection } from '@/components/content/ImageSelection'
import { QuranSelection } from '@/components/content/QuranSelection'
import { useContent } from '@/lib/contentStore'
import { AppCredits } from './AppCredits'
import { StepPanel } from './StepPanel'

export function SettingsPanel({ loader }: { loader: ReturnType<typeof useAyatLoader> }) {
  const { mode } = useContent()
  return (
    <div className="space-y-3">
      <StepPanel step={1} title="Selection" className="space-y-3">
        <ContentModePicker />
        {mode === 'quran' ? <QuranSelection loader={loader} /> : <ImageSelection mode={mode} />}
      </StepPanel>
      <StepPanel step={2} title={mode === 'quran' ? 'Customize' : 'Design'} className="space-y-2.5">
        {mode === 'quran' ? <CustomizationPanel /> : <CardDesignPanel />}
      </StepPanel>
      <AppCredits />
    </div>
  )
}
