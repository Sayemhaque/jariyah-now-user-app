import { logger } from '@/lib/logger'
import { proxiedAudioUrl } from './audioSource'
import { speechFromSamples, type SpeechMap } from './speechActivity'

const analysisRate = 8000

async function decodeSpeech(url: string): Promise<SpeechMap | null> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`audio ${res.status}`)
  const context = new OfflineAudioContext(1, 1, analysisRate)
  const decoded = await context.decodeAudioData(await res.arrayBuffer())
  return speechFromSamples(decoded.getChannelData(0), decoded.sampleRate)
}

export async function analyzeSpeechInBrowser(url: string): Promise<SpeechMap | null> {
  try {
    return await decodeSpeech(url)
  } catch {
    try {
      return await decodeSpeech(proxiedAudioUrl(url))
    } catch (err) {
      logger.warn('word sync: audio analysis failed', { url, error: err instanceof Error ? err.message : String(err) })
      return null
    }
  }
}
