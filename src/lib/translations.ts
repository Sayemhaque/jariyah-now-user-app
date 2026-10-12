export interface TranslationEdition {
  key: string
  label: string
  fullName: string
  rightsHolder: string
  license: 'public-domain' | 'permissive' | 'personal-use-only'
  licenseNote: string
  warn?: boolean
}

export const translationEditions: TranslationEdition[] = [
  {
    key: 'bengali',
    label: 'বাংলা — মুহিউদ্দীন খান',
    fullName: 'কুরআনের বাংলা অনুবাদ',
    rightsHolder: 'মুহিউদ্দীন খান (Muhiuddin Khan)',
    license: 'permissive',
    licenseNote:
      'বাংলা অনুবাদ। অবাণিজ্যিক ব্যবহারের জন্য অনুমতিপ্রাপ্ত।',
  },
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
  {
    key: 'urdu',
    label: 'اردو — فتح محمد جالندھری',
    fullName: 'قرآن کا اردو ترجمہ',
    rightsHolder: 'Fateh Muhammad Jalandhari',
    license: 'permissive',
    licenseNote:
      'Urdu translation. Permitted for non-commercial use with attribution.',
  },
  {
    key: 'turkish',
    label: 'Türkçe — Diyanet Vakfı',
    fullName: 'Kur’an-ı Kerim Meali',
    rightsHolder: 'Diyanet Vakfı',
    license: 'permissive',
    licenseNote:
      'Turkish translation. Permitted for non-commercial use with attribution.',
  },
  {
    key: 'indonesian',
    label: 'Bahasa Indonesia — Indonesian Religious Affairs',
    fullName: 'Al-Qur’an dan Terjemahnya',
    rightsHolder: 'Indonesian Ministry of Religious Affairs',
    license: 'permissive',
    licenseNote:
      'Indonesian translation. Permitted for non-commercial use with attribution.',
  },
  {
    key: 'french',
    label: 'Français — Hamidullah',
    fullName: 'Le Saint Coran',
    rightsHolder: 'Muhammad Hamidullah',
    license: 'permissive',
    licenseNote:
      'French translation. Permitted for non-commercial use with attribution.',
  },
  {
    key: 'german',
    label: 'Deutsch — Abu Rida',
    fullName: 'Der Heilige Koran',
    rightsHolder: 'Abu Rida Muhammad ibn Ahmad ibn Rassoul',
    license: 'permissive',
    licenseNote:
      'German translation. Permitted for non-commercial use with attribution.',
  },
  {
    key: 'spanish',
    label: 'Español — Cortés',
    fullName: 'El Sagrado Corán',
    rightsHolder: 'Julio Cortés',
    license: 'permissive',
    licenseNote:
      'Spanish translation. Permitted for non-commercial use with attribution.',
  },
  {
    key: 'malay',
    label: 'Bahasa Melayu — Basmeih',
    fullName: 'Terjemahan Al-Quran',
    rightsHolder: 'Abdullah Basmeih',
    license: 'permissive',
    licenseNote:
      'Malay translation. Permitted for non-commercial use with attribution.',
  },
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

export const defaultTranslationKey = 'bengali'

export function getTranslationEdition(key: string): TranslationEdition {
  return (
    translationEditions.find((e) => e.key === key) ??
    translationEditions[0]!
  )
}

export function videoAttributionLine(key: string): string {
  const edition = getTranslationEdition(key)
  if (edition.license === 'public-domain') return ''
  return `Translation: ${edition.fullName} — ${edition.rightsHolder}`
}
