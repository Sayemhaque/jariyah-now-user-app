import { describe, it, expect } from 'vitest'
import { isAllowedAudioUrl, proxiedAudioUrl } from './audioSource'

describe('isAllowedAudioUrl', () => {
  it('allows the recitation audio hosts', () => {
    expect(isAllowedAudioUrl('https://everyayah.com/data/Ghamadi_40kbps/001001.mp3')).toBe(true)
    expect(isAllowedAudioUrl('https://verses.quran.com/Sudais/mp3/001001.mp3')).toBe(true)
    expect(isAllowedAudioUrl('https://cdn.ummahapi.com/a.mp3')).toBe(true)
  })

  it('refuses other hosts, look-alikes and plain http', () => {
    expect(isAllowedAudioUrl('https://evil.com/a.mp3')).toBe(false)
    expect(isAllowedAudioUrl('https://everyayah.com.evil.com/a.mp3')).toBe(false)
    expect(isAllowedAudioUrl('http://everyayah.com/a.mp3')).toBe(false)
    expect(isAllowedAudioUrl('http://169.254.169.254/latest')).toBe(false)
    expect(isAllowedAudioUrl('not a url')).toBe(false)
  })
})

describe('proxiedAudioUrl', () => {
  it('points at the same-origin audio route', () => {
    expect(proxiedAudioUrl('https://everyayah.com/a b.mp3')).toBe('/api/audio?url=https%3A%2F%2Feveryayah.com%2Fa%20b.mp3')
  })
})
