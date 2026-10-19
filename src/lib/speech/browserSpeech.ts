import { speechFromSamples, type SpeechMap } from './speechActivity'

const analysisRate = 8000

export async function analyzeSpeechInBrowser(url: string): Promise<SpeechMap | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const context = new OfflineAudioContext(1, 1, analysisRate)
    const decoded = await context.decodeAudioData(await res.arrayBuffer())
    return speechFromSamples(decoded.getChannelData(0), decoded.sampleRate)
  } catch {
    return null
  }
}
