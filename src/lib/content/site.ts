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
  'Jariyah Now একটি স্বাধীন অ্যাপ। কোনো কারী, অনুবাদ প্রকাশক বা ধর্মীয় প্রতিষ্ঠানের সাথে এর কোনো সম্পর্ক নেই এবং তাদের অনুমোদনও নেওয়া হয়নি। অ্যাপে ব্যবহৃত অনুবাদ ও তিলাওয়াত তাদের নিজ নিজ উৎসের নামে উল্লেখ করা আছে। আপনি যা তৈরি ও শেয়ার করবেন, তার দায়িত্ব আপনার নিজের।'

export const copyrightText = () => `© ${new Date().getFullYear()} Jariyah Now — সর্বস্বত্ব সংরক্ষিত`

const shareTitle = 'Jariyah Now (জারিয়াহ নাও) — একবার শেয়ার, সওয়াব চিরকাল।'
const shareDescription =
  'কুরআনের আয়াত দিয়ে সুন্দর কুরআন ভিডিও ও রিলস বানান — তিলাওয়াত, অনুবাদ আর নিজের পছন্দের ডিজাইনসহ।'
const ogImage = `${siteUrl}/og-image.png`

export const landingMetadata: Metadata = {
  title: 'Jariyah Now — কুরআনের আয়াত দিয়ে সহজে রিলস বানান',
  description:
    'কয়েক সেকেন্ডেই কুরআন ভিডিও বানান — সূরা ও আয়াত বেছে নিন, তিলাওয়াত আর অনুবাদ যোগ করুন, তারপর ফেসবুক, ইনস্টাগ্রাম, টিকটক ও ইউটিউবে শেয়ার করুন।',
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
  { href: '/#hadith', label: 'হাদিস', hideBelow: 'sm' },
  { href: '/templates', label: 'টেমপ্লেট', hideBelow: 'sm' },
  { href: '/about', label: 'আমাদের কথা', hideBelow: 'sm' },
  { href: '/terms', label: 'শর্তাবলি', hideBelow: 'md' },
  { href: '/privacy', label: 'গোপনীয়তা', hideBelow: 'md' },
]

export const templatesHeaderLinks: NavItem[] = [
  { href: '/app', label: 'ভিডিও বানান', hideBelow: 'sm' },
  { href: '/about', label: 'আমাদের কথা', hideBelow: 'sm' },
]

export const landingFooterLinks: NavItem[] = [
  { href: '/app', label: 'অ্যাপ' },
  { href: '/templates', label: 'টেমপ্লেট' },
  { href: '/about', label: 'আমাদের কথা' },
  { href: '/terms', label: 'শর্তাবলি' },
  { href: '/privacy', label: 'গোপনীয়তা' },
]

export const templatesFooterLinks: NavItem[] = [
  { href: '/app', label: 'ভিডিও বানান' },
  { href: '/about', label: 'আমাদের কথা' },
  { href: '/terms', label: 'শর্তাবলি' },
  { href: '/privacy', label: 'গোপনীয়তা' },
]

export const legalFooterLinks: NavItem[] = [
  { href: '/about', label: 'আমাদের কথা' },
  { href: '/terms', label: 'শর্তাবলি' },
  { href: '/privacy', label: 'গোপনীয়তা' },
]

export const heroHighlights = ['১১৪টি সূরা', '১৩ জন কারী', 'চলমান ব্যাকগ্রাউন্ড', '১২টি অনুবাদ']

export const landingSteps: FeatureItem[] = [
  { icon: BookOpen, step: '1', title: 'সূরা বেছে নিন', description: '১১৪টি সূরা থেকে একটি বেছে নিন। তারপর কোন আয়াত থেকে কোন আয়াত পর্যন্ত চান, তা ঠিক করুন (সর্বোচ্চ ১০টি আয়াত)।' },
  { icon: Mic2, step: '2', title: 'কারী বেছে নিন', description: 'আফাসি, সুদাইস, আবদুল বাসিত, মুয়াইকলি, গামদিসহ ১৩ জন প্রিয় কারীর তিলাওয়াত থেকে বেছে নিন।' },
  { icon: Palette, step: '3', title: 'ডিজাইন সাজিয়ে নিন', description: 'ব্যাকগ্রাউন্ড, ফন্ট, রং — সবকিছু নিজের মতো বদলান। বদলালেই সাথে সাথে প্রিভিউতে দেখতে পাবেন।' },
  { icon: Download, step: '4', title: 'ডাউনলোড ও শেয়ার করুন', description: 'একটি চাপেই ডাউনলোড করুন। ফেসবুক, ইনস্টাগ্রাম রিলস বা ইউটিউবে দেওয়ার জন্য তৈরি।' },
]

export const landingFeatures: FeatureItem[] = [
  { icon: Sparkles, title: 'সুন্দর আরবি লেখা', description: 'উন্নত মানের আরবি ফন্ট, পরিষ্কার ও সুন্দরভাবে ভিডিওর মাঝখানে সাজানো।' },
  { icon: Mic2, title: '১৩ জন বিখ্যাত কারী', description: 'মিশারি আফাসি থেকে আবদুল বাসিত — প্রিয় সব কারীর তিলাওয়াত এক জায়গায়। তিলাওয়াত আসে everyayah.com থেকে।' },
  { icon: Languages, title: '১২টি অনুবাদ', description: 'বাংলা, ইংরেজি, উর্দু, তুর্কি, ইন্দোনেশীয়, ফরাসি, জার্মান, স্প্যানিশ, মালয় ও বসনীয় ভাষায় অনুবাদ — UmmahAPI থেকে।' },
  { icon: Palette, title: 'নিজের মতো সাজান', description: '২৭টি চলমান ব্যাকগ্রাউন্ড, যা নিজেই মানানসই রং বেছে নেয়। নিজের ছবিও দিতে পারেন, ফন্টও বদলাতে পারেন।' },
  { icon: Film, title: 'রিলস ও শর্টসের জন্য তৈরি', description: 'লম্বা বা চওড়া, 720p বা 1080p — যেকোনো সাইজে ডাউনলোড করুন। সব জায়গায় ঠিকঠাক মানাবে।' },
  { icon: Globe, title: 'ব্রাউজারেই চলে', description: 'কিছু ইনস্টল করতে হবে না, কিছু আপলোডও হয় না। ভিডিও আপনার নিজের ফোন বা কম্পিউটারেই তৈরি হয়।' },
]

export const templateSteps: FeatureItem[] = [
  { icon: LayoutGrid, step: '1', title: 'টেমপ্লেট বেছে নিন', description: 'কুরআনের আয়াত, দোয়া ও আরও অনেক কিছু দেখুন। প্রতিটি কার্ডে দেখানো আছে কেমন ভিডিও পাবেন।' },
  { icon: Sparkles, step: '2', title: 'সব নিজে থেকেই সেট হয়ে যায়', description: 'সূরা, আয়াত, কারী, ফন্ট, ব্যাকগ্রাউন্ড ও রং — টেমপ্লেট থেকে সব আপনাআপনি বসে যায়।' },
  { icon: Film, step: '3', title: 'একটু বদলে ডাউনলোড করুন', description: 'চাইলে যেকোনো কিছু বদলে নিন, তারপর ভিডিও ডাউনলোড করুন। ফেসবুক, ইনস্টাগ্রাম, টিকটক ও ইউটিউবে দেওয়ার জন্য তৈরি।' },
]

export const appMenuLinks: NavItem[] = [
  { href: '/templates', label: 'টেমপ্লেট' },
  ...legalFooterLinks,
]
