import type { Metadata } from "next";
import { Inter, Amiri, Scheherazade_New, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

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

const notoBengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
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
    "word-by-word highlight",
    "Quran translation",
  ],
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
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
        className={`${inter.variable} ${amiri.variable} ${scheherazade.variable} ${notoBengali.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
