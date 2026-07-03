'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  Film,
  Loader2,
  Download,
  RefreshCw,
  Menu,
  X,
  Eye,
  Settings,
  BookOpenText,
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

type MobileTab = 'preview' | 'settings'

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
  const [mobileTab, setMobileTab] = useState<MobileTab>('settings')

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
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header — fixed height */}
      <header className="border-b border-border qv-frosted shrink-0 z-30">
        <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground">
              <Film className="h-5 w-5" />
            </div>
            <span className="text-[15px] font-bold tracking-tight">QuranVid</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setExportOpen(true)}
              disabled={!canExport}
              size="sm"
              className="qv-btn-primary font-semibold"
            >
              <Film className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Export video</span>
            </Button>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 sm:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-4">
                  <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-sm font-medium">About</Link>
                  <Link href="/terms" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-sm font-medium">Terms</Link>
                  <Link href="/privacy" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-sm font-medium">Privacy</Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Mobile tab bar */}
      <div className="lg:hidden flex border-b border-border bg-card shrink-0">
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition ${mobileTab === 'preview' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
        >
          <Eye className="h-4 w-4" /> Preview
        </button>
        <button
          onClick={() => setMobileTab('settings')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition ${mobileTab === 'settings' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
        >
          <Settings className="h-4 w-4" /> Settings
        </button>
      </div>

      {/* Main layout — fills remaining viewport height, no scrolling on the page itself */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-0 min-h-0 overflow-hidden">
        {/* Preview pane — fills available height, no iPhone frame */}
        <section
          className={`relative bg-muted/30 flex flex-col min-h-0 overflow-hidden ${mobileTab === 'preview' ? 'flex-1' : 'hidden lg:flex'}`}
        >
          <VideoPreview />
        </section>

        {/* Controls sidebar — Selection + Customize, scrollable internally */}
        <aside
          className={`border-t lg:border-t-0 lg:border-l border-border bg-card min-h-0 overflow-y-auto scrollbar-thin ${mobileTab === 'settings' ? 'flex-1' : 'hidden lg:block'}`}
        >
          <div className="p-3 sm:p-4 space-y-4">
            {/* Selection */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="qv-step">1</span>
                <h2 className="text-sm font-bold tracking-tight">Selection</h2>
              </div>
              <div className="space-y-3">
                <SurahSelector />
                <AyatRangePicker />
                <ReciterSelector />
                <TranslationSelector />
              </div>

              <Button
                onClick={onLoadAyats}
                disabled={loading || !selectedSurah || !validation.ok}
                className="w-full qv-btn-primary font-semibold"
                size="default"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Loading ayats…</>
                ) : ayatList.length ? (
                  <><RefreshCw className="h-4 w-4 mr-1.5" />Reload ayats</>
                ) : (
                  <><Download className="h-4 w-4 mr-1.5" />Load ayats</>
                )}
              </Button>

              {ayatList.length > 0 && (
                <Button
                  onClick={() => setMobileTab('preview')}
                  variant="outline"
                  className="w-full lg:hidden"
                  size="sm"
                >
                  <Eye className="h-4 w-4 mr-1.5" />View preview
                </Button>
              )}
            </section>

            <div className="h-px bg-border" />

            {/* Customize — back in the sidebar where it was */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="qv-step">2</span>
                <h2 className="text-sm font-bold tracking-tight">Customize</h2>
              </div>
              <CustomizationPanel />
            </section>

            <div className="h-px bg-border" />

            {/* Tip */}
            <div className="qv-card rounded-xl p-3 flex gap-3">
              <div className="grid place-items-center h-7 w-7 rounded-lg bg-primary/15 text-primary shrink-0">
                <BookOpenText className="h-3.5 w-3.5" />
              </div>
              <div className="text-[11px] text-muted-foreground leading-relaxed">
                <span className="text-foreground font-medium">How it works.</span>{' '}
                Click <em>Load ayats</em> after changing the surah, range, or reciter.
                Then hit <span className="text-primary font-medium">Export video</span>.
              </div>
            </div>

            {/* Footer */}
            <div className="pt-1 pb-2 text-[11px] text-muted-foreground space-y-2">
              <p className="leading-relaxed">
                Quran text from{' '}
                <a href="https://alquran.cloud" target="_blank" rel="noopener noreferrer" className="text-foreground/80 hover:text-primary underline underline-offset-2 font-medium">alquran.cloud</a>
                {', '}
                <a href="https://quran.com" target="_blank" rel="noopener noreferrer" className="text-foreground/80 hover:text-primary underline underline-offset-2 font-medium">quran.com</a>
                . Audio from{' '}
                <a href="https://verses.quran.com" target="_blank" rel="noopener noreferrer" className="text-foreground/80 hover:text-primary underline underline-offset-2 font-medium">verses.quran.com</a>.
              </p>
              <nav className="flex items-center gap-3">
                <Link href="/about" className="hover:text-foreground transition">About</Link>
                <span className="opacity-40">·</span>
                <Link href="/terms" className="hover:text-foreground transition">Terms</Link>
                <span className="opacity-40">·</span>
                <Link href="/privacy" className="hover:text-foreground transition">Privacy</Link>
              </nav>
            </div>
          </div>
        </aside>
      </main>

      <ExportModal open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  )
}
