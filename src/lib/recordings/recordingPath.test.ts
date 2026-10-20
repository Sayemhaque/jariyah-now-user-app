import { describe, it, expect } from 'vitest'
import { audioExtension, parseRecordingPath, recordingPath } from './recordingPath'

describe('recording paths', () => {
  it('maps browser and file audio types to extensions', () => {
    expect(audioExtension('audio/webm;codecs=opus')).toBe('webm')
    expect(audioExtension('audio/mpeg')).toBe('mp3')
    expect(audioExtension('audio/mp4')).toBe('m4a')
    expect(audioExtension('video/mp4')).toBeNull()
  })

  it('round-trips a recording path', () => {
    const path = recordingPath('hadith', 'intentions', 'webm')
    expect(path).toBe('recordings/hadith/intentions.webm')
    expect(parseRecordingPath(path)).toEqual({ mode: 'hadith', itemId: 'intentions' })
  })

  it('refuses unsafe ids and foreign paths', () => {
    expect(() => recordingPath('azkar', '../x', 'mp3')).toThrow()
    expect(parseRecordingPath('reels-tmp/abc.mp4')).toBeNull()
    expect(parseRecordingPath('recordings/quran/x.mp3')).toBeNull()
  })
})
