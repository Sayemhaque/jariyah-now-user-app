import type { LucideIcon } from 'lucide-react'
import { AudioLines, AudioWaveform, Ban, CircleDot, Ellipsis, Headphones, Mic } from 'lucide-react'
import type { ArabicFont, BengaliFont, OverlayStyle, SoundAnimation, TextSpacing, TextWidth } from '@/lib/types'

export interface SelectOption<T extends string> {
  value: T
  label: string
  className?: string
}

export const overlayPresets: { key: OverlayStyle; label: string; swatch: string }[] = [
  { key: 'solid', label: 'পুরো', swatch: 'linear-gradient(#000,#000)' },
  { key: 'bottom-gradient', label: 'নিচে গাঢ়', swatch: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 60%, #000 100%)' },
  { key: 'top-gradient', label: 'উপরে গাঢ়', swatch: 'linear-gradient(180deg, #000 0%, rgba(0,0,0,0.4) 40%, transparent 100%)' },
  { key: 'vignette', label: 'চারপাশে গাঢ়', swatch: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)' },
  { key: 'center-focus', label: 'মাঝে গাঢ়', swatch: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, transparent 70%)' },
  { key: 'none', label: 'নেই', swatch: 'repeating-linear-gradient(45deg, #1f2937 0 6px, #111827 6px 12px)' },
]

const bismillah = 'بِسْمِ ٱللَّهِ'
const bengaliBismillah = 'বিসমিল্লাহ'

export const arabicFontOptions: SelectOption<ArabicFont>[] = [
  { value: 'quran', label: `${bismillah} — Amiri Quran`, className: 'font-arabic-quran' },
  { value: 'uthmani', label: `${bismillah} — Amiri`, className: 'font-arabic-uthmani' },
  { value: 'scheherazade', label: `${bismillah} — Scheherazade`, className: 'font-arabic-scheherazade' },
  { value: 'markazi', label: `${bismillah} — Markazi`, className: 'font-arabic-markazi' },
  { value: 'naskh', label: `${bismillah} — Noto Naskh`, className: 'font-arabic-naskh' },
  { value: 'kufi', label: `${bismillah} — Reem Kufi`, className: 'font-arabic-kufi' },
  { value: 'cairo', label: `${bismillah} — Cairo`, className: 'font-arabic-cairo' },
]

export const bengaliFontOptions: SelectOption<BengaliFont>[] = [
  { value: 'anek', label: `${bengaliBismillah} — Anek Bangla`, className: 'font-bengali-anek' },
  { value: 'tiro', label: `${bengaliBismillah} — Tiro Bangla`, className: 'font-bengali-tiro' },
  { value: 'sans', label: `${bengaliBismillah} — Noto Sans`, className: 'font-bengali-sans' },
  { value: 'serif', label: `${bengaliBismillah} — Noto Serif`, className: 'font-bengali-serif' },
  { value: 'hind', label: `${bengaliBismillah} — Hind Siliguri`, className: 'font-bengali-hind' },
]

export const soundAnimationOptions: { key: SoundAnimation; label: string; icon: LucideIcon }[] = [
  { key: 'bars', label: 'দাগ', icon: AudioLines },
  { key: 'wave', label: 'ঢেউ', icon: AudioWaveform },
  { key: 'circle', label: 'বৃত্ত', icon: CircleDot },
  { key: 'dots', label: 'বিন্দু', icon: Ellipsis },
  { key: 'headphones', label: 'হেডফোন', icon: Headphones },
  { key: 'mic', label: 'মাইক', icon: Mic },
  { key: 'none', label: 'নেই', icon: Ban },
]

export const textWidthOptions: TextWidth[] = ['full', 'wide', 'medium', 'narrow']
export const textSpacingOptions: TextSpacing[] = ['compact', 'normal', 'spacious']

export const textWidthLabels: Record<TextWidth, string> = { full: 'পুরো', wide: 'চওড়া', medium: 'মাঝারি', narrow: 'সরু' }
export const textSpacingLabels: Record<TextSpacing, string> = { compact: 'ঘন', normal: 'স্বাভাবিক', spacious: 'ফাঁকা' }
