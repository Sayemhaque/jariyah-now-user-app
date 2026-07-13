import { describe, expect, it } from 'vitest'

import {
  mapFfmpegProgressLineToRatio,
  parseFfmpegTimestampToSeconds,
} from './ffmpeg'

describe('parseFfmpegTimestampToSeconds', () => {
  it('parses ffmpeg hh:mm:ss timestamps', () => {
    expect(parseFfmpegTimestampToSeconds('00:00:12.500')).toBe(12.5)
  })

  it('returns null for invalid timestamps', () => {
    expect(parseFfmpegTimestampToSeconds('nope')).toBeNull()
  })
})

describe('mapFfmpegProgressLineToRatio', () => {
  it('maps out_time lines into a 0..1 ratio', () => {
    expect(mapFfmpegProgressLineToRatio('out_time=00:00:05.000', 10)).toBe(0.5)
  })

  it('maps out_time_ms lines into a 0..1 ratio', () => {
    expect(mapFfmpegProgressLineToRatio('out_time_ms=5000000', 10)).toBe(0.5)
  })

  it('ignores unrelated progress lines', () => {
    expect(mapFfmpegProgressLineToRatio('speed=1.0x', 10)).toBeNull()
  })
})
