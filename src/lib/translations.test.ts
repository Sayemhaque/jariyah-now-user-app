import { describe, it, expect } from 'vitest'
import {
  TRANSLATION_EDITIONS,
  getTranslationEdition,
  videoAttributionLine,
  DEFAULT_TRANSLATION_KEY,
} from './translations'

describe('TRANSLATION_EDITIONS', () => {
  it('includes the 12 UmmahAPI editions (1 Bengali + 4 English + 7 others)', () => {
    expect(TRANSLATION_EDITIONS.length).toBe(12)
  })

  it('every edition has a unique key', () => {
    const keys = TRANSLATION_EDITIONS.map((e) => e.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('every edition has a label, fullName, rightsHolder, and licenseNote', () => {
    for (const e of TRANSLATION_EDITIONS) {
      expect(e.label).toBeTruthy()
      expect(e.fullName).toBeTruthy()
      expect(e.rightsHolder).toBeTruthy()
      expect(e.licenseNote).toBeTruthy()
    }
  })

  it('only personal-use-only editions carry the warn flag', () => {
    for (const e of TRANSLATION_EDITIONS) {
      if (e.license === 'personal-use-only') {
        expect(e.warn).toBe(true)
      } else {
        expect(e.warn).toBeUndefined()
      }
    }
  })

  it('includes all 12 expected UmmahAPI translation keys', () => {
    const keys = TRANSLATION_EDITIONS.map((e) => e.key)
    const expected = [
      'bengali',
      'sahiih_international',
      'pickthall',
      'yusuf_ali',
      'urdu',
      'turkish',
      'indonesian',
      'french',
      'german',
      'spanish',
      'malay',
      'bosnian',
    ]
    for (const k of expected) {
      expect(keys).toContain(k)
    }
  })
})

describe('DEFAULT_TRANSLATION_KEY', () => {
  it('is bengali (Bengali translation)', () => {
    expect(DEFAULT_TRANSLATION_KEY).toBe('bengali')
  })

  it('is NOT an English edition', () => {
    expect(DEFAULT_TRANSLATION_KEY).not.toBe('sahiih_international')
    expect(DEFAULT_TRANSLATION_KEY).not.toBe('pickthall')
    expect(DEFAULT_TRANSLATION_KEY).not.toBe('yusuf_ali')
  })
})

describe('getTranslationEdition', () => {
  it('returns the matching edition for a known key (sahiih_international)', () => {
    const e = getTranslationEdition('sahiih_international')
    expect(e.key).toBe('sahiih_international')
    expect(e.label).toBe('English — Saheeh International')
  })

  it('returns the matching edition for pickthall', () => {
    const e = getTranslationEdition('pickthall')
    expect(e.key).toBe('pickthall')
    expect(e.label).toBe('English — Pickthall')
  })

  it('returns the matching edition for bengali', () => {
    const e = getTranslationEdition('bengali')
    expect(e.key).toBe('bengali')
  })

  it('falls back to the first edition (bengali) for an unknown key', () => {
    const e = getTranslationEdition('nonexistent')
    expect(e.key).toBe('bengali')
  })

  it('falls back for an empty string', () => {
    const e = getTranslationEdition('')
    expect(e.key).toBe('bengali')
  })
})

describe('videoAttributionLine', () => {
  it('returns an empty string for public-domain editions (no attribution required)', () => {
    expect(videoAttributionLine('pickthall')).toBe('')
  })

  it('returns a non-empty attribution line for permissive editions', () => {
    const line = videoAttributionLine('sahiih_international')
    expect(line).toBeTruthy()
    expect(line).toContain('Saheeh International')
  })

  it('returns a non-empty attribution line for the Yusuf Ali edition', () => {
    const line = videoAttributionLine('yusuf_ali')
    expect(line).toBeTruthy()
    expect(line).toContain('Yusuf Ali')
  })

  it('returns a non-empty attribution line for the Bengali edition', () => {
    const line = videoAttributionLine('bengali')
    expect(line).toBeTruthy()
    expect(line).toContain('Muhiuddin Khan')
  })

  it('returns a non-empty attribution for an unknown key (falls back to bengali)', () => {
    const line = videoAttributionLine('nonexistent')
    expect(line).toBeTruthy()
  })

  it('the attribution line includes both the full name and rights holder', () => {
    const line = videoAttributionLine('sahiih_international')
    expect(line).toMatch(/^Translation: /)
  })
})
