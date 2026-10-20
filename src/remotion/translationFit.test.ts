import { describe, it, expect } from 'vitest'
import { estimateTextLines } from './layout'
import { fitTranslationOnlySize } from './translationFit'

describe('fitTranslationOnlySize', () => {
  it('shows a short hadith larger than a normal translation', () => {
    expect(fitTranslationOnlySize('Purity is half of faith.', 40, 860, 1000)).toBeCloseTo(68)
  })

  it('shrinks a long hadith until it fits the text area', () => {
    const text = 'The strong one is not the one who overcomes others in wrestling; the strong one is the one who controls himself in anger. '.repeat(3)
    const size = fitTranslationOnlySize(text, 40, 860, 900)
    expect(size).toBeLessThan(68)
    expect(estimateTextLines(text, size, 860) * size * 1.45).toBeLessThanOrEqual(900 * 0.85)
  })
})
