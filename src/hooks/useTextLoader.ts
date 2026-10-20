import { useState } from 'react'
import { toast } from 'sonner'
import { useBuilderStore } from '@/lib/store'
import { useContent } from '@/lib/contentStore'
import { findTextItem } from '@/lib/collections'
import { buildTextSlide, silentTextAudio, slideArabic, type RecordedAudio } from '@/lib/collections/textSlide'
import type { TextMode } from '@/lib/collections/types'
import { analyzeAudioInBrowser } from '@/lib/speech/browserSpeech'
import { syncWords } from '@/lib/speech/syncWords'

export function useTextLoader(mode: TextMode, recordingUrl: string | null) {
  const setAyatList = useBuilderStore((s) => s.setAyatList)
  const { textItemId, language, setLoadedText } = useContent()
  const [isLoading, setIsLoading] = useState(false)
  const item = findTextItem(mode, textItemId)

  const recordedAudio = async (url: string): Promise<RecordedAudio> => {
    const audio = await analyzeAudioInBrowser(url)
    if (!audio) throw new Error('Could not read the recording')
    return { url, durationMs: audio.durationMs, words: syncWords({ arabicText: slideArabic(mode, item!), durationMs: audio.durationMs, speech: audio.speech }) }
  }

  const load = async () => {
    if (!item) return
    setIsLoading(true)
    try {
      const audio = recordingUrl ? await recordedAudio(recordingUrl) : silentTextAudio(mode, item, language)
      setLoadedText({ mode, item, language })
      setAyatList([buildTextSlide(mode, item, language, audio)])
      toast.success(recordingUrl ? 'Loaded with your voice — press play.' : 'Loaded without voice — press play.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not load')
    } finally {
      setIsLoading(false)
    }
  }

  return { load, isLoading, canLoad: Boolean(item), hasVoice: Boolean(recordingUrl) }
}
