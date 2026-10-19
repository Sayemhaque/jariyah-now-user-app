import { describe, it, expect } from 'vitest'
import { detectSpeech, rmsEnvelope, speechFromSamples } from './speechActivity'
import { synthRecitation } from './testAudio'

describe('rmsEnvelope', () => {
  it('measures loudness per 10ms frame', () => {
    const envelope = rmsEnvelope(synthRecitation([{ startMs: 100, endMs: 200 }], 300, 8000, 0), 8000)
    expect(envelope).toHaveLength(30)
    expect(envelope[5]).toBe(0)
    expect(envelope[15]).toBeCloseTo(0.5 / Math.SQRT2, 2)
  })
})

describe('detectSpeech', () => {
  it('finds the lead-in silence, the tail and the breath pauses', () => {
    const audio = synthRecitation(
      [
        { startMs: 640, endMs: 2100 },
        { startMs: 2600, endMs: 4300 },
        { startMs: 5100, endMs: 6900 },
      ],
      8200,
    )
    const speech = speechFromSamples(audio, 8000)!
    expect(speech.startMs).toBeGreaterThanOrEqual(620)
    expect(speech.startMs).toBeLessThanOrEqual(660)
    expect(speech.endMs).toBeGreaterThanOrEqual(6880)
    expect(speech.endMs).toBeLessThanOrEqual(6920)
    expect(speech.pauses).toHaveLength(2)
    expect(speech.pauses[0]!.startMs).toBeCloseTo(2100, -2)
    expect(speech.pauses[1]!.endMs).toBeCloseTo(5100, -2)
  })

  it('ignores gaps too short to be a pause and clicks too short to be speech', () => {
    const audio = synthRecitation(
      [
        { startMs: 50, endMs: 70 },
        { startMs: 500, endMs: 1500 },
        { startMs: 1580, endMs: 3000 },
      ],
      3500,
    )
    const speech = speechFromSamples(audio, 8000)!
    expect(speech.startMs).toBeGreaterThanOrEqual(480)
    expect(speech.pauses).toHaveLength(0)
  })

  it('keeps quiet passages as speech when the reciter softens', () => {
    const audio = synthRecitation(
      [
        { startMs: 300, endMs: 1500, level: 0.6 },
        { startMs: 1500, endMs: 2500, level: 0.12 },
      ],
      3000,
    )
    const speech = speechFromSamples(audio, 8000)!
    expect(speech.endMs).toBeGreaterThanOrEqual(2480)
    expect(speech.pauses).toHaveLength(0)
  })

  it('returns null for silence', () => {
    expect(detectSpeech(new Array(100).fill(0))).toBeNull()
  })
})
