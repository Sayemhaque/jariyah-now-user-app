const stack = (variable: string, family: string, fallback: string) => `var(${variable}, '${family}'), ${fallback}`

export const arabicFontStacks: Record<string, string> = {
  quran: stack('--font-amiri-quran', 'Amiri Quran', 'serif'),
  uthmani: stack('--font-amiri', 'Amiri', 'serif'),
  amiri: stack('--font-amiri', 'Amiri', 'serif'),
  scheherazade: stack('--font-scheherazade', 'Scheherazade New', 'serif'),
  markazi: stack('--font-markazi-text', 'Markazi Text', 'serif'),
  naskh: stack('--font-noto-naskh-arabic', 'Noto Naskh Arabic', 'serif'),
  kufi: stack('--font-reem-kufi', 'Reem Kufi', 'sans-serif'),
  cairo: stack('--font-cairo', 'Cairo', 'sans-serif'),
}

export const bengaliFontStacks: Record<string, string> = {
  anek: stack('--font-anek-bangla', 'Anek Bangla', 'sans-serif'),
  tiro: stack('--font-tiro-bangla', 'Tiro Bangla', 'serif'),
  sans: stack('--font-noto-sans-bengali', 'Noto Sans Bengali', 'sans-serif'),
  serif: stack('--font-noto-serif-bengali', 'Noto Serif Bengali', 'serif'),
  hind: stack('--font-hind-siliguri', 'Hind Siliguri', 'sans-serif'),
}

export const uiFontStack = stack('--font-inter', 'Inter', 'system-ui, sans-serif')
export const displayFontStack = stack('--font-display', 'EB Garamond', 'serif')
export const headerArabicStack = arabicFontStacks.uthmani!
