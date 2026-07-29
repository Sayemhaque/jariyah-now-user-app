import type { Metadata } from "next";
import { Inter, EB_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/Providers";

// ─── UI font ─────────────────────────────────────────────────────────
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// ─── Display font — classical serif for hero/headings ────────────────
const ebGaramond = EB_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
        className={`${inter.variable} ${ebGaramond.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
