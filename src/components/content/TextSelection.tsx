import type { TextMode } from '@/lib/collections/types'
import { LanguageToggle } from './LanguageToggle'
import { TextItemPicker } from './TextItemPicker'

export function TextSelection({ mode }: { mode: TextMode }) {
  return (
    <div className="space-y-3">
      <TextItemPicker mode={mode} />
      <LanguageToggle />
    </div>
  )
}
