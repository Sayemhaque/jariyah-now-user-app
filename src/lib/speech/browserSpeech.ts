import { logger } from '@/lib/logger'
import { proxiedAudioUrl } from './audioSource'
import { speechFromSamples, type SpeechMap } from './speechActivity'

const analysisRate = 8000

export interface BrowserAudioInfo {
  durationMs: number
  speech: SpeechMap | null
}

async function decodeAudio(url: string): Promise<BrowserAudioInfo> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`audio ${res.status}`)
  const context = new OfflineAudioContext(1, 1, analysisRate)
  const decoded = await context.decodeAudioData(await res.arrayBuffer())
  return { durationMs: Math.round(decoded.duration * 1000), speech: speechFromSamples(decoded.getChannelData(0), decoded.sampleRate) }
}

export async function analyzeAudioInBrowser(url: string): Promise<BrowserAudioInfo | null> {
  try {
    return await decodeAudio(url)
  } catch {
    try {
      return await decodeAudio(proxiedAudioUrl(url))
    } catch (err) {
      logger.warn('word sync: audio analysis failed', { url, error: err instanceof Error ? err.message : String(err) })
      return null
    }
  }
}

export const analyzeSpeechInBrowser = async (url: string) => (await analyzeAudioInBrowser(url))?.speech ?? null
