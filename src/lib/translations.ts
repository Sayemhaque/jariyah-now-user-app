/**
 * Quran translation editions available in the app.
 *
 * Each edition is identified by its UmmahAPI translation key (e.g.
 * `bengali`, `sahiih_international`) and carries the licensing/attribution
 * metadata needed to:
 *   (a) display proper credit in the UI + exported video, and
 *   (b) warn the user when an edition is restricted to personal use only.
 *
 * The default is `bengali` (the project's primary audience).
 *
 * If you add a new edition here, also:
 *   - Add it to the Zod enum in `src/lib/schemas.ts` (translationEditionSchema)
 *   - Add a test in `src/lib/translations.test.ts`
 *   - Update `NOTICES` at the repo root
 */
export interface TranslationEdition {
  /** UmmahAPI translation key — used in the API URL. */
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
  // --- Bengali ---
  {
    key: 'bengali',
    label: 'বাংলা — মুহিউদ্দীন খান',
    fullName: 'কুরআনের বাংলা অনুবাদ',
    rightsHolder: 'মুহিউদ্দীন খান (Muhiuddin Khan)',
    license: 'permissive',
    licenseNote:
      'বাংলা অনুবাদ। অবাণিজ্যিক ব্যবহারের জন্য অনুমতিপ্রাপ্ত।',
  },
  // --- English ---
  {
    key: 'sahiih_international',
    label: 'English — Saheeh International',
    fullName: 'The Quran: Arabic Text with English Translation',
    rightsHolder: 'Saheeh International',
    license: 'permissive',
    licenseNote:
      'Permitted for non-commercial use with attribution. Widely used in Quran applications.',
  },
  {
    key: 'pickthall',
    label: 'English — Pickthall',
    fullName: 'The Meaning of the Glorious Quran',
    rightsHolder: 'Marmaduke Pickthall (1930)',
    license: 'public-domain',
    licenseNote: 'Public domain. First published 1930; copyright has expired.',
  },
  {
    key: 'yusuf_ali',
    label: 'English — Yusuf Ali',
    fullName: 'The Holy Quran: Translation and Commentary',
    rightsHolder: 'Abdullah Yusuf Ali',
    license: 'permissive',
    licenseNote:
      'Permitted for non-commercial use with attribution.',
  },
  // --- Urdu ---
  {
    key: 'urdu',
    label: 'اردو — فتح محمد جالندھری',
    fullName: 'قرآن کا اردو ترجمہ',
    rightsHolder: 'Fateh Muhammad Jalandhari',
    license: 'permissive',
    licenseNote:
      'Urdu translation. Permitted for non-commercial use with attribution.',
  },
  // --- Turkish ---
  {
    key: 'turkish',
    label: 'Türkçe — Diyanet Vakfı',
    fullName: 'Kur’an-ı Kerim Meali',
    rightsHolder: 'Diyanet Vakfı',
    license: 'permissive',
    licenseNote:
      'Turkish translation. Permitted for non-commercial use with attribution.',
  },
  // --- Indonesian ---
  {
    key: 'indonesian',
    label: 'Bahasa Indonesia — Indonesian Religious Affairs',
    fullName: 'Al-Qur’an dan Terjemahnya',
    rightsHolder: 'Indonesian Ministry of Religious Affairs',
    license: 'permissive',
    licenseNote:
      'Indonesian translation. Permitted for non-commercial use with attribution.',
  },
  // --- French ---
  {
    key: 'french',
    label: 'Français — Hamidullah',
    fullName: 'Le Saint Coran',
    rightsHolder: 'Muhammad Hamidullah',
    license: 'permissive',
    licenseNote:
      'French translation. Permitted for non-commercial use with attribution.',
  },
  // --- German ---
  {
    key: 'german',
    label: 'Deutsch — Abu Rida',
    fullName: 'Der Heilige Koran',
    rightsHolder: 'Abu Rida Muhammad ibn Ahmad ibn Rassoul',
    license: 'permissive',
    licenseNote:
      'German translation. Permitted for non-commercial use with attribution.',
  },
  // --- Spanish ---
  {
    key: 'spanish',
    label: 'Español — Cortés',
    fullName: 'El Sagrado Corán',
    rightsHolder: 'Julio Cortés',
    license: 'permissive',
    licenseNote:
      'Spanish translation. Permitted for non-commercial use with attribution.',
  },
  // --- Malay ---
  {
    key: 'malay',
    label: 'Bahasa Melayu — Basmeih',
    fullName: 'Terjemahan Al-Quran',
    rightsHolder: 'Abdullah Basmeih',
    license: 'permissive',
    licenseNote:
      'Malay translation. Permitted for non-commercial use with attribution.',
  },
  // --- Bosnian ---
  {
    key: 'bosnian',
    label: 'Bosanski — Korkut',
    fullName: 'Prijevod Kur’ana',
    rightsHolder: 'Besim Korkut',
    license: 'permissive',
    licenseNote:
      'Bosnian translation. Permitted for non-commercial use with attribution.',
  },
]

export const DEFAULT_TRANSLATION_KEY = 'bengali'

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
