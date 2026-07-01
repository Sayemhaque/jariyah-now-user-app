import { describe, it, expect } from 'vitest'
import {
  TRANSLATION_EDITIONS,
  getTranslationEdition,
  videoAttributionLine,
  DEFAULT_TRANSLATION_KEY,
} from './translations'

describe('TRANSLATION_EDITIONS', () => {
  it('includes at least 3 editions', () => {
    expect(TRANSLATION_EDITIONS.length).toBeGreaterThanOrEqual(3)
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
})

describe('DEFAULT_TRANSLATION_KEY', () => {
  it('is en.pickthall (public domain)', () => {
    expect(DEFAULT_TRANSLATION_KEY).toBe('en.pickthall')
  })

  it('refers to a public-domain edition', () => {
    const edition = getTranslationEdition(DEFAULT_TRANSLATION_KEY)
    expect(edition.license).toBe('public-domain')
  })

  it('is NOT en.asad (the copyrighted edition)', () => {
    expect(DEFAULT_TRANSLATION_KEY).not.toBe('en.asad')
  })
})

describe('getTranslationEdition', () => {
  it('returns the matching edition for a known key', () => {
    const e = getTranslationEdition('en.sahih')
    expect(e.key).toBe('en.sahih')
    expect(e.label).toBe('Saheeh International')
  })

  it('falls back to the first edition (pickthall) for an unknown key', () => {
    const e = getTranslationEdition('nonexistent')
    expect(e.key).toBe('en.pickthall')
  })

  it('falls back for an empty string', () => {
    const e = getTranslationEdition('')
    expect(e.key).toBe('en.pickthall')
  })
})

describe('videoAttributionLine', () => {
  it('returns an empty string for public-domain editions (no attribution required)', () => {
    expect(videoAttributionLine('en.pickthall')).toBe('')
  })

  it('returns a non-empty attribution line for permissive editions', () => {
    const line = videoAttributionLine('en.sahih')
    expect(line).toBeTruthy()
    expect(line).toContain('Saheeh International')
  })

  it('returns a non-empty attribution line for the Clear Quran edition', () => {
    const line = videoAttributionLine('en.clearquran')
    expect(line).toBeTruthy()
    expect(line).toContain('Clear Quran')
  })

  it('returns a non-empty attribution line for the copyrighted Asad edition', () => {
    // Even though attribution alone doesn't satisfy the Asad license, we
    // still render the line so the user + viewers know the source.
    const line = videoAttributionLine('en.asad')
    expect(line).toBeTruthy()
    expect(line).toContain('Dar al-Andalus')
  })

  it('returns an empty string for an unknown key (falls back to pickthall)', () => {
    expect(videoAttributionLine('nonexistent')).toBe('')
  })

  it('the attribution line includes both the full name and rights holder', () => {
    const line = videoAttributionLine('en.sahih')
    expect(line).toMatch(/^Translation: /)
  })
})
