import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useContent } from '@/lib/contentStore'
import { useRecordings } from '@/hooks/useRecordings'
import { useTextLoader } from '@/hooks/useTextLoader'
import type { TextMode } from '@/lib/collections/types'
import { LanguageToggle } from './LanguageToggle'
import { TextItemPicker } from './TextItemPicker'
import { VoicePanel } from './VoicePanel'

export function TextSelection({ mode }: { mode: TextMode }) {
  const { textItemId } = useContent()
  const recordings = useRecordings(mode, textItemId)
  const loader = useTextLoader(mode, recordings.recording?.url ?? null)
  return (
    <div className="space-y-3">
      <TextItemPicker mode={mode} recordedIds={recordings.recordedIds} />
      <LanguageToggle />
      {textItemId && <VoicePanel {...recordings} />}
      <Button onClick={loader.load} disabled={!loader.canLoad || loader.isLoading} className="w-full font-semibold">
        {loader.isLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Download className="mr-1.5 h-4 w-4" />}
        {loader.canLoad || !textItemId ? 'Load into preview' : 'Record your voice first'}
      </Button>
    </div>
  )
}
