import type { Metadata } from "next";
import {
  Inter,
  Amiri,
  Scheherazade_New,
  Markazi_Text,
  Noto_Naskh_Arabic,
  Reem_Kufi,
  Cairo,
  Noto_Sans_Bengali,
  Noto_Serif_Bengali,
  Hind_Siliguri,
} from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/Providers";

// ─── UI font ─────────────────────────────────────────────────────────
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// ─── Arabic fonts (7 total) ──────────────────────────────────────────
// Curated selection spanning classical calligraphic → modern sans-serif
// so users can match the visual tone of their video.
const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

const scheherazade = Scheherazade_New({
  variable: "--font-scheherazade",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

const markazi = Markazi_Text({
  variable: "--font-markazi-text",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-noto-naskh-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

const reemKufi = Reem_Kufi({
  variable: "--font-reem-kufi",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

// ─── Bengali fonts (3 total) ─────────────────────────────────────────
// Covers sans-serif (default), serif (formal/scholarly), and a clean
// modern variant for contemporary reels.
const notoBengali = Noto_Sans_Bengali({
  variable: "--font-noto-sans-bengali",
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

const notoSerifBengali = Noto_Serif_Bengali({
  variable: "--font-noto-serif-bengali",
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
});

const siteUrl = "https://jariyahnow.com";
const ogImage = `${siteUrl}/og-image.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Jariyah Now — Turn Quran Verses Into Shareable Reels",
  description:
    "Create Quran verse reels in seconds — pick a Surah, choose your ayat, add recitation audio and translation, then share on Instagram, TikTok & YouTube.",
  keywords: [
    "Quran",
    "Quran reels",
    "Islamic reels",
    "Sadaqah Jariyah",
    "Instagram reels",
    "TikTok Quran",
    "YouTube shorts",
    "Quran video generator",
    "Quran recitation",
    "Islamic content creator",
    "Arabic text + translation",
    "Quran translation",
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
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Jariyah Now — Share once, earn forever.",
    description:
      "Turn Quran verses into beautiful shareable reels with recitation, translation, and your own style.",
    url: siteUrl,
    siteName: "Jariyah Now",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Jariyah Now",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jariyah Now — Share once, earn forever.",
    description:
      "Turn Quran verses into beautiful shareable reels with recitation, translation, and your own style.",
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${amiri.variable} ${scheherazade.variable} ${markazi.variable} ${notoNaskhArabic.variable} ${reemKufi.variable} ${cairo.variable} ${notoBengali.variable} ${notoSerifBengali.variable} ${hindSiliguri.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
          <SonnerToaster />
        </Providers>
      </body>
    </html>
  );
}
