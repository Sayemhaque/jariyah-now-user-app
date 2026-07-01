import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Sparkles,
  Play,
  Film,
  Mic2,
  BookOpen,
  Palette,
  Download,
  ArrowRight,
  Check,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'QuranVid — কুরআন থেকে সুন্দর ভিডিও তৈরি করুন',
  description:
    'সূরা নির্বাচন করুন, কারী বেছে নিন, ডিজাইন কাস্টমাইজ করুন — এবং একটি সম্পূর্ণ সিঙ্ক করা ভিডিও এক্সপোর্ট করুন যাতে শব্দে শব্দে হাইলাইটিং এবং অনুবাদ রয়েছে।',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-30 qv-frosted border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">QuranVid</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/about"
              className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition"
            >
              সম্পর্কে
            </Link>
            <Link
              href="/terms"
              className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition"
            >
              শর্তাবলী
            </Link>
            <Link
              href="/privacy"
              className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition"
            >
              গোপনীয়তা
            </Link>
            <Link
              href="/app"
              className="qv-btn-primary inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold"
            >
              অ্যাপ খুলুন
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-20">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              বিনামূল্যে • কোনো অ্যাকাউন্ট লাগবে না
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              কুরআন থেকে
              <br />
              <span className="text-primary">সুন্দর ভিডিও</span> তৈরি করুন
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl">
              সূরা নির্বাচন করুন, কারী বেছে নিন, ডিজাইন কাস্টমাইজ করুন — এবং
              একটি সম্পূর্ণ সিঙ্ক করা ভিডিও এক্সপোর্ট করুন যাতে শব্দে শব্দে
              হাইলাইটিং এবং বাংলা/ইংরেজি অনুবাদ রয়েছে। রিল, শর্টস বা
              ইউটিউবের জন্য তৈরি।
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/app"
                className="qv-btn-primary inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl text-base font-semibold"
              >
                <Film className="h-5 w-5" />
                এখনই ভিডিও বানান
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl text-base font-semibold border border-border bg-card hover:bg-muted transition"
              >
                <Play className="h-4 w-4" />
                কিভাবে কাজ করে
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-10 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                ১১৪টি সূরা
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                ৫জন বিখ্যাত কারী
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                শব্দে শব্দে হাইলাইটিং
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                ৪টি অনুবাদ
              </div>
            </div>
          </div>
        </div>

        {/* Decorative gradient blob */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />
      </section>

      {/* ─── App Showcase ─── */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              আপনার ব্রাউজারেই সবকিছু
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              কোনো সফটওয়্যার ইনস্টল করতে হবে না। সবকিছু ব্রাউজারেই হয় —
              ভিডিও প্রিভিউ, এডিটিং, এবং এক্সপোর্ট।
            </p>
          </div>

          {/* Desktop + Mobile side by side */}
          <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center">
            {/* Desktop screenshot in a browser frame */}
            <div className="relative">
              <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 h-10 border-b border-border bg-muted/50">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-destructive/40" />
                    <div className="h-3 w-3 rounded-full bg-amber-500/40" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/40" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-3 py-1 rounded-md bg-card border border-border text-[10px] text-muted-foreground font-mono">
                      quranvid.app
                    </div>
                  </div>
                </div>
                {/* Screenshot */}
                <img
                  src="/landing/app-desktop.png"
                  alt="QuranVid অ্যাপ — ডেস্কটপ ভিউ"
                  className="w-full h-auto block"
                />
              </div>
            </div>

            {/* Mobile screenshot in a phone frame */}
            <div className="hidden lg:block w-[200px] shrink-0">
              <div className="rounded-[2rem] border-[6px] border-foreground/80 bg-foreground/80 p-1 shadow-2xl">
                <div className="rounded-[1.5rem] overflow-hidden bg-background">
                  <img
                    src="/landing/app-mobile.png"
                    alt="QuranVid অ্যাপ — মোবাইল ভিউ"
                    className="w-full h-auto block"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              মাত্র ৪ ধাপে আপনার ভিডিও
            </h2>
            <p className="text-muted-foreground">
              সহজ, দ্রুত, এবং সম্পূর্ণ ফ্রি
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BookOpen,
                step: '১',
                title: 'সূরা নির্বাচন করুন',
                desc: '১১৪টি সূরা থেকে বেছে নিন এবং আয়াত রেঞ্জ সেট করুন (সর্বোচ্চ ১০টি আয়াত)।',
              },
              {
                icon: Mic2,
                step: '২',
                title: 'কারী বেছে নিন',
                desc: 'আলাফাসী, আব্দুল বাসিত, মিনশাবী, হুসরী, সুদাইস — যে কোনো একজন।',
              },
              {
                icon: Palette,
                step: '৩',
                title: 'ডিজাইন করুন',
                desc: 'ব্যাকগ্রাউন্ড, ফন্ট, রং, ওভারলে — সব কাস্টমাইজ করুন। লাইভ প্রিভিউ দেখুন।',
              },
              {
                icon: Download,
                step: '৪',
                title: 'এক্সপোর্ট করুন',
                desc: 'এক ক্লিকে ভিডিও ডাউনলোড করুন — রিল, শর্টস, বা ইউটিউবের জন্য তৈরি।',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="qv-card rounded-2xl p-6 relative"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-3xl font-bold text-primary/30">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-bold text-base mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              কেন QuranVid?
            </h2>
            <p className="text-muted-foreground">
              যা আপনি অন্য কোথাও পাবেন না
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'শব্দে শব্দে হাইলাইটিং',
                desc: 'প্রতিটি শব্দ আবৃত্তির সাথে সাথে হাইলাইট হয় — দর্শক সহজে অনুসরণ করতে পারে।',
              },
              {
                icon: Mic2,
                title: '৫জন বিখ্যাত কারী',
                desc: 'মিশারি আলাফাসী থেকে শুরু করে আব্দুল বাসিত — সবার আবৃত্তি একই জায়গায়।',
              },
              {
                icon: BookOpen,
                title: '৪টি অনুবাদ',
                desc: 'পিকথল (পাবলিক ডোমেইন), সহীহ ইন্টারন্যাশনাল, ক্লিয়ার কুরআন, এবং মুহাম্মদ আসাদ।',
              },
              {
                icon: Palette,
                title: 'সম্পূর্ণ কাস্টমাইজেশন',
                desc: '৭টি ব্যাকগ্রাউন্ড প্রিসেট, কাস্টম আপলোড, ৬টি ওভারলে স্টাইল, ফন্ট কন্ট্রোল।',
              },
              {
                icon: Film,
                title: 'রিল ও শর্টস রেডি',
                desc: 'পোর্ট্রেট, ল্যান্ডস্কেপ — যেকোনো ফরম্যাটে এক্সপোর্ট করুন। ৭২০p বা ১০৮০p।',
              },
              {
                icon: Download,
                title: 'ব্রাউজারেই সবকিছু',
                desc: 'কোনো সফটওয়্যার লাগবে না। ভিডিও আপনার ব্রাউজারেই রেন্ডার হয় — সম্পূর্ণ প্রাইভেট।',
              },
            ].map((f, i) => (
              <div key={i} className="qv-card rounded-2xl p-6">
                <div className="grid place-items-center h-11 w-11 rounded-xl bg-primary/10 text-primary mb-4">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="qv-card rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">
            {/* Decorative bg */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-primary/5 rounded-full blur-3xl -z-10" />

            <div className="grid place-items-center h-14 w-14 rounded-2xl bg-primary text-primary-foreground mx-auto mb-6">
              <Sparkles className="h-7 w-7" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              এখনই শুরু করুন
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              কোনো রেজিস্ট্রেশন ছাড়াই, সম্পূর্ণ ফ্রি। মাত্র কয়েক সেকেন্ডে
              আপনার প্রথম কুরআন ভিডিও তৈরি করুন।
            </p>

            <Link
              href="/app"
              className="qv-btn-primary inline-flex items-center justify-center gap-2 h-14 px-8 rounded-2xl text-lg font-semibold"
            >
              <Film className="h-6 w-6" />
              ভিডিও বানান শুরু করুন
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-sm">QuranVid</div>
                <div className="text-xs text-muted-foreground">
                  কুরআন থেকে সুন্দর ভিডিও
                </div>
              </div>
            </div>

            <nav className="flex items-center gap-5 text-sm">
              <Link
                href="/app"
                className="text-muted-foreground hover:text-foreground transition font-medium"
              >
                অ্যাপ
              </Link>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground transition font-medium"
              >
                সম্পর্কে
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition font-medium"
              >
                শর্তাবলী
              </Link>
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition font-medium"
              >
                গোপনীয়তা
              </Link>
            </nav>
          </div>

          <div className="mt-8 pt-6 border-t border-border text-xs text-muted-foreground text-center leading-relaxed">
            কুরআন টেক্সট:{' '}
            <a
              href="https://alquran.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              alquran.cloud
            </a>
            {' • '}
            <a
              href="https://quran.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              quran.com
            </a>
            {' • '}অডিও:{' '}
            <a
              href="https://verses.quran.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              verses.quran.com
            </a>
            <br />
            © ২০২৬ QuranVid — সকল অধিকার সংরক্ষিত
          </div>
        </div>
      </footer>
    </div>
  )
}
