import type { Metadata } from 'next'
import type { LucideIcon } from 'lucide-react'
import { BookOpen, Download, Film, Globe, Languages, LayoutGrid, Mic2, Palette, Sparkles } from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  hideBelow?: 'sm' | 'md'
}

export interface FeatureItem {
  icon: LucideIcon
  title: string
  description: string
  step?: string
}

export const siteUrl = 'https://jariyahnow.com'

export const legalDisclaimer =
  'Jariyah Now is an independent tool and is not affiliated with or endorsed by any Quran recitation rights holder, translation publisher, or religious authority. Translations and audio recitations used in this app are credited to their respective sources. Users are responsible for the content they create and share using this platform.'

export const copyrightText = () => `© ${new Date().getFullYear()} Jariyah Now — All rights reserved`

const shareTitle = 'Jariyah Now — Share once, earn forever.'
const shareDescription =
  'Turn Quran verses into beautiful shareable reels with recitation, translation, and your own style.'
const ogImage = `${siteUrl}/og-image.png`

export const landingMetadata: Metadata = {
  title: 'Jariyah Now — Turn Quran Verses Into Shareable Reels',
  description:
    'Create Quran verse reels in seconds — pick a Surah, choose your ayat, add recitation audio and translation, then share on Instagram, TikTok & YouTube.',
  alternates: { canonical: siteUrl },
  openGraph: {
    title: shareTitle,
    description: shareDescription,
    url: siteUrl,
    siteName: 'Jariyah Now',
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'Jariyah Now' }],
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: shareTitle, description: shareDescription, images: [ogImage] },
}

export const rootMetadata: Metadata = {
  ...landingMetadata,
  metadataBase: new URL(siteUrl),
  keywords: [
    'Quran',
    'Quran reels',
    'Islamic reels',
    'Sadaqah Jariyah',
    'Instagram reels',
    'TikTok Quran',
    'YouTube shorts',
    'Quran video generator',
    'Quran recitation',
    'Islamic content creator',
    'Arabic text + translation',
    'Quran translation',
  ],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/logo.png', type: 'image/png', sizes: '256x256' },
    ],
    shortcut: '/favicon.ico',
    apple: '/logo-180.png',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
}

export const landingHeaderLinks: NavItem[] = [
  { href: '/templates', label: 'Templates', hideBelow: 'sm' },
  { href: '/about', label: 'About', hideBelow: 'sm' },
  { href: '/terms', label: 'Terms', hideBelow: 'md' },
  { href: '/privacy', label: 'Privacy', hideBelow: 'md' },
]

export const templatesHeaderLinks: NavItem[] = [
  { href: '/app', label: 'Builder', hideBelow: 'sm' },
  { href: '/about', label: 'About', hideBelow: 'sm' },
]

export const landingFooterLinks: NavItem[] = [
  { href: '/app', label: 'App' },
  { href: '/templates', label: 'Templates' },
  { href: '/about', label: 'About' },
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
]

export const templatesFooterLinks: NavItem[] = [
  { href: '/app', label: 'Builder' },
  { href: '/about', label: 'About' },
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
]

export const legalFooterLinks: NavItem[] = [
  { href: '/about', label: 'About' },
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
]

export const heroHighlights = ['114 Surahs', '13 reciters', 'Animated backgrounds', '12 translations']

export const landingSteps: FeatureItem[] = [
  { icon: BookOpen, step: '1', title: 'Pick a Surah', description: 'Choose from all 114 Surahs and set your ayat range (up to 10 ayats).' },
  { icon: Mic2, step: '2', title: 'Choose a reciter', description: 'Alafasy, Sudais, Abdul Basit, Muaiqly, Ghamdi and more — 13 iconic voices to pick from.' },
  { icon: Palette, step: '3', title: 'Customize the look', description: 'Background, fonts, colors, overlays — tweak everything with a live preview.' },
  { icon: Download, step: '4', title: 'Export & share', description: 'Download in one click — ready for Reels, Shorts, or YouTube.' },
]

export const landingFeatures: FeatureItem[] = [
  { icon: Sparkles, title: 'Beautiful Arabic typography', description: 'Premium Arabic fonts with smooth RTL rendering, perfectly centered for reels and shorts.' },
  { icon: Mic2, title: '13 world-class reciters', description: 'From Mishary Alafasy to Abdul Basit — every iconic voice in one place, streamed from everyayah.com.' },
  { icon: Languages, title: '12 translations', description: 'Bengali, English, Urdu, Turkish, Indonesian, French, German, Spanish, Malay, and Bosnian — via UmmahAPI.' },
  { icon: Palette, title: 'Full customization', description: '12 animated backgrounds that pick matching colors for you, custom uploads, font controls — make every reel your own.' },
  { icon: Film, title: 'Reels & Shorts ready', description: 'Export portrait or landscape, 720p or 1080p — perfectly sized for every platform.' },
  { icon: Globe, title: 'Runs in your browser', description: 'No software to install, no uploads, fully private — your video renders right on your device.' },
]

export const templateSteps: FeatureItem[] = [
  { icon: LayoutGrid, step: '1', title: 'Pick a template', description: 'Browse Quran verses, duas, and more. Each card shows you exactly what you’ll get.' },
  { icon: Sparkles, step: '2', title: 'It auto-configures', description: 'The builder loads the surah, ayat range, reciter, font, background, and colors from the template.' },
  { icon: Film, step: '3', title: 'Tweak + export', description: 'Adjust anything you want, then export an MP4 ready for Instagram Reels, TikTok, and YouTube Shorts.' },
]

export const appMenuLinks: NavItem[] = [
  { href: '/templates', label: 'Templates' },
  ...legalFooterLinks,
]
