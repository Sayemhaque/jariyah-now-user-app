/**
 * Quran translation editions available in the app.
 *
 * Each edition is identified by its alquran.cloud edition key (e.g.
 * `en.pickthall`) and carries the licensing/attribution metadata needed to
 * (a) display proper credit in the UI + exported video, and
 * (b) warn the user when an edition is restricted to personal use only.
 *
 * The default is `en.pickthall` (public domain, 1930) so the app never
 * ships with a copyright-restricted translation as the default.
 *
 * If you add a new edition here, also:
 *   - Add it to the Zod enum in `src/lib/schemas.ts` (translationEditionSchema)
 *   - Add a test in `src/lib/translations.test.ts`
 *   - Update `NOTICES` at the repo root
 */
export interface TranslationEdition {
  /** alquran.cloud edition key — used in the API URL. */
  key: string
  /** Short label for the dropdown. */
  label: string
  /** Full human-readable name shown in the About page + video attribution. */
  fullName: string
  /** Translator or rights holder. */
  rightsHolder: string
  /** One-line license summary. */
  license: 'public-domain' | 'permissive' | 'personal-use-only'
  /** License detail for the About page. */
  licenseNote: string
  /** True if the edition requires a warning badge in the UI. */
  warn?: boolean
}

export const TRANSLATION_EDITIONS: TranslationEdition[] = [
  // --- Bengali translations ---
  {
    key: 'bn.bengali',
    label: 'বাংলা — মুহিউদ্দীন খান',
    fullName: 'কুরআনের বাংলা অনুবাদ',
    rightsHolder: 'মুহিউদ্দীন খান (Muhiuddin Khan)',
    license: 'permissive',
    licenseNote:
      'বাংলা অনুবাদ। অবাণিজ্যিক ব্যবহারের জন্য অনুমতিপ্রাপ্ত।',
  },
  {
    key: 'bn.hoque',
    label: 'বাংলা — জহুরুল হক',
    fullName: 'কুরআনের বাংলা অনুবাদ',
    rightsHolder: 'জহুরুল হক (Zohurul Hoque)',
    license: 'permissive',
    licenseNote:
      'বাংলা অনুবাদ। অবাণিজ্যিক ব্যবহারের জন্য অনুমতিপ্রাপ্ত।',
  },
  // --- English translations ---
  {
    key: 'en.pickthall',
    label: 'English — Pickthall',
    fullName: 'The Meaning of the Glorious Quran',
    rightsHolder: 'Marmaduke Pickthall (1930)',
    license: 'public-domain',
    licenseNote: 'Public domain. First published 1930; copyright has expired.',
  },
  {
    key: 'en.sahih',
    label: 'English — Saheeh International',
    fullName: 'The Quran: Arabic Text with English Translation',
    rightsHolder: 'Saheeh International',
    license: 'permissive',
    licenseNote:
      'Permitted for non-commercial use with attribution. Widely used in Quran applications.',
  },
  {
    key: 'en.clearquran',
    label: 'English — Clear Quran',
    fullName: 'The Clear Quran — Dr. Mustafa Khattab',
    rightsHolder: 'Dr. Mustafa Khattab / Furqan Institute',
    license: 'permissive',
    licenseNote:
      'Permitted for non-commercial use with attribution to the Furqan Institute.',
  },
  {
    key: 'en.asad',
    label: 'English — Muhammad Asad',
    fullName: 'The Message of the Quran',
    rightsHolder: 'Dar al-Andalus Ltd. (the Asad estate)',
    license: 'personal-use-only',
    licenseNote:
      'Copyrighted translation. Personal reading only — a separate license from Dar al-Andalus is required for any public distribution, including in videos. Pick a different edition if you plan to publish.',
    warn: true,
  },
]

export const DEFAULT_TRANSLATION_KEY = 'bn.bengali'

export function getTranslationEdition(key: string): TranslationEdition {
  return (
    TRANSLATION_EDITIONS.find((e) => e.key === key) ??
    TRANSLATION_EDITIONS[0]!
  )
}

/**
 * Build the attribution line shown at the bottom of the exported video
 * ("Translation: {fullName} — {rightsHolder}"). Returns an empty string for
 * public-domain editions where attribution isn't legally required (we still
 * show it on the About page, just not on every frame).
 */
export function videoAttributionLine(key: string): string {
  const edition = getTranslationEdition(key)
  if (edition.license === 'public-domain') return ''
  return `Translation: ${edition.fullName} — ${edition.rightsHolder}`
}
