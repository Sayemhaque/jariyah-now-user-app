import { Label } from '@/components/ui/label'
import { OptionButton } from '@/components/common/OptionButton'

export type ExportQuality = '480p' | '720p' | '1080p'

const qualityOptions: { value: ExportQuality; tag?: string }[] = [
  { value: '480p', tag: 'Lite' },
  { value: '720p' },
  { value: '1080p', tag: 'HD' },
]

interface QualityPickerProps {
  quality: ExportQuality
  onChange: (quality: ExportQuality) => void
  showMobileWarning: boolean
}

export function QualityPicker({ quality, onChange, showMobileWarning }: QualityPickerProps) {
  return (
    <div className="space-y-2">
      <Label className="qv-section-title !mb-0">Quality</Label>
      {showMobileWarning && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-600 dark:text-amber-400 leading-relaxed">
          Mobile export may be slow. For best results, use a desktop browser.
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        {qualityOptions.map((option) => (
          <OptionButton
            key={option.value}
            glow
            selected={quality === option.value}
            onSelect={() => onChange(option.value)}
            className="rounded-xl p-2.5 sm:p-3 text-sm font-medium"
          >
            {option.value}
            {option.tag && <span className="ml-2 text-[10px] uppercase tracking-wider opacity-70">{option.tag}</span>}
          </OptionButton>
        ))}
      </div>
    </div>
  )
}
