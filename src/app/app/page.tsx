'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  Film,
  Loader2,
  Sparkles,
  Download,
  RefreshCw,
  BookOpenText,
  Menu,
  X,
} from 'lucide-react'
import { useBuilderStore } from '@/lib/store'
import { validateAyatRange } from '@/lib/validation'
import { SurahSelector } from '@/components/SurahSelector'
import { AyatRangePicker } from '@/components/AyatRangePicker'
import { ReciterSelector } from '@/components/ReciterSelector'
import { TranslationSelector } from '@/components/TranslationSelector'
import { CustomizationPanel } from '@/components/CustomizationPanel'
import { VideoPreview } from '@/components/VideoPreview'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { toast } from 'sonner'

// Lazy-mount the ExportModal so the MediaRecorder + Canvas code isn't in the
// main page chunk. The modal only loads when the user first opens it.
const ExportModal = dynamic(
  () => import('@/components/ExportModal').then((m) => m.ExportModal),
  { ssr: false },
)

export default function Home() {
  const loadSurahs = useBuilderStore((s) => s.loadSurahs)
  const fetchRange = useBuilderStore((s) => s.fetchRange)
  const loading = useBuilderStore((s) => s.loadingAyats)
  const ayatList = useBuilderStore((s) => s.ayatList)
  const surahs = useBuilderStore((s) => s.surahs)
  const selectedSurahNumber = useBuilderStore((s) => s.selectedSurahNumber)
  const fromAyat = useBuilderStore((s) => s.fromAyat)
  const toAyat = useBuilderStore((s) => s.toAyat)

  const selectedSurah = useMemo(
    () => surahs.find((s) => s.number === selectedSurahNumber),
    [surahs, selectedSurahNumber],
  )
  const validation = useMemo(
    () => validateAyatRange(fromAyat, toAyat, selectedSurah),
    [fromAyat, toAyat, selectedSurah],
  )

  const [exportOpen, setExportOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    loadSurahs()
  }, [loadSurahs])

  const onLoadAyats = async () => {
    if (!selectedSurah) {
      toast.error('Please pick a surah first')
      return
    }
    if (!validation.ok) {
      toast.error(validation.error ?? 'Invalid ayat range')
      return
    }
    await fetchRange()
    toast.success('Ayat data loaded — press play in the preview.')
  }

  const canExport = ayatList.length > 0 && validation.ok

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header — light, frosted, with mobile menu */}
      <header className="border-b border-border qv-frosted sticky top-0 z-30">
        <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold leading-tight tracking-tight">
                QuranVid
              </span>
              <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground leading-tight mt-0.5">
                Recitation video generator
              </span>
            </div>
          </div>

          {/* Desktop nav + export */}
          <div className="hidden sm:flex items-center gap-2">
            <Link
              href="/about"
              className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition px-3 py-1.5 rounded-lg hover:bg-muted"
            >
              About
            </Link>
            <Link
              href="/terms"
              className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition px-3 py-1.5 rounded-lg hover:bg-muted"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition px-3 py-1.5 rounded-lg hover:bg-muted"
            >
              Privacy
            </Link>
            <Button
              onClick={() => setExportOpen(true)}
              disabled={!canExport}
              size="sm"
              className="qv-btn-primary ml-2 font-semibold"
            >
              <Film className="h-4 w-4 mr-1.5" />
              Export video
            </Button>
          </div>

          {/* Mobile: just export + menu button */}
          <div className="flex sm:hidden items-center gap-1.5">
            <Button
              onClick={() => setExportOpen(true)}
              disabled={!canExport}
              size="sm"
              className="qv-btn-primary font-semibold"
            >
              <Film className="h-4 w-4" />
            </Button>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-4">
                  <Link
                    href="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-sm font-medium"
                  >
                    About
                  </Link>
                  <Link
                    href="/terms"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-sm font-medium"
                  >
                    Terms
                  </Link>
                  <Link
                    href="/privacy"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-sm font-medium"
                  >
                    Privacy
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main two-panel layout — responsive */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-0 min-h-0">
        {/* Preview pane — 60% on desktop, full width on mobile */}
        <section className="relative bg-muted/30 min-h-[50vh] sm:min-h-[55vh] lg:min-h-0 lg:max-h-[calc(100vh-3.5rem)] flex flex-col">
          <VideoPreview />
        </section>

        {/* Controls sidebar — 40% on desktop, below preview on mobile */}
        <aside className="border-t lg:border-t-0 lg:border-l border-border bg-card lg:max-h-[calc(100vh-3.5rem)] lg:overflow-y-auto scrollbar-thin">
          <div className="p-4 sm:p-5 space-y-6">
            {/* Selection section */}
            <section className="space-y-4">
              <SectionHeader step={1} title="Selection" />
              <div className="space-y-4">
                <SurahSelector />
                <AyatRangePicker />
                <ReciterSelector />
                <TranslationSelector />
              </div>

              <Button
                onClick={onLoadAyats}
                disabled={loading || !selectedSurah || !validation.ok}
                className="w-full qv-btn-primary font-semibold"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    Loading ayats…
                  </>
                ) : ayatList.length ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1.5" />
                    Reload ayats
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-1.5" />
                    Load ayats
                  </>
                )}
              </Button>
            </section>

            <Divider />

            {/* Customization */}
            <section className="space-y-4">
              <SectionHeader step={2} title="Customize" />
              <CustomizationPanel />
            </section>

            <Divider />

            {/* Tip card */}
            <div className="qv-card rounded-xl p-3.5 flex gap-3">
              <div className="grid place-items-center h-8 w-8 rounded-lg bg-primary/15 text-primary shrink-0">
                <BookOpenText className="h-4 w-4" />
              </div>
              <div className="text-[11.5px] text-muted-foreground leading-relaxed">
                <span className="text-foreground font-medium">How it works.</span>{' '}
                Click <em>Load ayats</em> after changing the surah, range, or
                reciter. The preview will play the recitation with each word
                highlighted in real time. When you&apos;re happy, hit{' '}
                <span className="text-primary font-medium">Export video</span>.
              </div>
            </div>

            {/* Sidebar footer — attribution + legal links */}
            <div className="pt-2 pb-1 border-t border-border text-[11px] text-muted-foreground space-y-2">
              <p className="leading-relaxed">
                Quran text from{' '}
                <a
                  href="https://alquran.cloud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/80 hover:text-primary underline underline-offset-2 font-medium"
                >
                  alquran.cloud
                </a>
                {', '}
                <a
                  href="https://quran.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/80 hover:text-primary underline underline-offset-2 font-medium"
                >
                  quran.com
                </a>
                . Audio from{' '}
                <a
                  href="https://verses.quran.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/80 hover:text-primary underline underline-offset-2 font-medium"
                >
                  verses.quran.com
                </a>
                .
              </p>
              <nav className="flex items-center gap-3">
                <Link
                  href="/about"
                  className="hover:text-foreground transition"
                >
                  About
                </Link>
                <span className="opacity-40">·</span>
                <Link
                  href="/terms"
                  className="hover:text-foreground transition"
                >
                  Terms
                </Link>
                <span className="opacity-40">·</span>
                <Link
                  href="/privacy"
                  className="hover:text-foreground transition"
                >
                  Privacy
                </Link>
              </nav>
            </div>
          </div>
        </aside>
      </main>

      <ExportModal open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  )
}

function SectionHeader({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="qv-step">{step}</span>
      <h2 className="text-sm font-bold tracking-tight">{title}</h2>
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-border" />
}
