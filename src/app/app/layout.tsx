import {
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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${amiri.variable} ${scheherazade.variable} ${markazi.variable} ${notoNaskhArabic.variable} ${reemKufi.variable} ${cairo.variable} ${notoBengali.variable} ${notoSerifBengali.variable} ${hindSiliguri.variable}`}
    >
      {children}
    </div>
  );
}
