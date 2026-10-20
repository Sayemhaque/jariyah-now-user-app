import { useState } from 'react'
import { toast } from 'sonner'
import { useBuilderStore } from '@/lib/store'
import { useContent } from '@/lib/contentStore'
import { findTextItem } from '@/lib/collections'
import { buildTextSlide } from '@/lib/collections/textSlide'
import type { TextMode } from '@/lib/collections/types'
import { analyzeAudioInBrowser } from '@/lib/speech/browserSpeech'
import { syncWords } from '@/lib/speech/syncWords'

export function useTextLoader(mode: TextMode, recordingUrl: string | null) {
  const setAyatList = useBuilderStore((s) => s.setAyatList)
  const { textItemId, language, setLoadedText } = useContent()
  const [isLoading, setIsLoading] = useState(false)
  const item = findTextItem(mode, textItemId)

  const load = async () => {
    if (!item || !recordingUrl) return
    setIsLoading(true)
    try {
      const audio = await analyzeAudioInBrowser(recordingUrl)
      if (!audio) throw new Error('Could not read the recording')
      const words = syncWords({ arabicText: item.arabic, durationMs: audio.durationMs, speech: audio.speech })
      setLoadedText({ mode, item, language })
      setAyatList([buildTextSlide(mode, item, language, { url: recordingUrl, durationMs: audio.durationMs, words })])
      toast.success('Loaded — press play in the preview.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not load')
    } finally {
      setIsLoading(false)
    }
  }

  return { load, isLoading, canLoad: Boolean(item && recordingUrl) }
}
