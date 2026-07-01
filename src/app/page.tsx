'use client'

import { useEffect, useMemo, useState } from 'react'
import { Film, Loader2, Sparkles, Download, RefreshCw } from 'lucide-react'
import { useBuilderStore } from '@/lib/store'
import { validateAyatRange } from '@/lib/validation'
import { SurahSelector } from '@/components/SurahSelector'
import { AyatRangePicker } from '@/components/AyatRangePicker'
import { ReciterSelector } from '@/components/ReciterSelector'
import { CustomizationPanel } from '@/components/CustomizationPanel'
import { VideoPreview } from '@/components/VideoPreview'
import { ExportModal } from '@/components/ExportModal'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function Home() {
  const loadSurahs = useBuilderStore((s) => s.loadSurahs)
  const fetchRange = useBuilderStore((s) => s.fetchRange)
  const loading = useBuilderStore((s) => s.loadingAyats)
  const ayatList = useBuilderStore((s) => s.ayatList)
  const surahs = useBuilderStore((s) => s.surahs)
  const selectedSurahNumber = useBuilderStore((s) => s.selectedSurahNumber)
  const fromAyat = useBuilderStore((s) => s.fromAyat)
  const toAyat = useBuilderStore((s) => s.toAyat)

  // Derive surah + validation from raw state with stable references.
  const selectedSurah = useMemo(
    () => surahs.find((s) => s.number === selectedSurahNumber),
    [surahs, selectedSurahNumber],
  )
  const validation = useMemo(
    () => validateAyatRange(fromAyat, toAyat, selectedSurah),
    [fromAyat, toAyat, selectedSurah],
  )

  const [exportOpen, setExportOpen] = useState(false)

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
      {/* Header */}
      <header className="border-b border-border bg-card/40 backdrop-blur sticky top-0 z-30">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-9 w-9 rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold leading-tight">
                QuranVid
              </span>
              <span className="text-[11px] text-muted-foreground leading-tight">
                Recitation video generator
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://alquran.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline text-[11px] text-muted-foreground hover:text-foreground transition"
            >
              Data: alquran.cloud · quran.com
            </a>
            <Button
              onClick={() => setExportOpen(true)}
              disabled={!canExport}
              size="sm"
              className="ml-2"
            >
              <Film className="h-4 w-4 mr-1.5" />
              Export video
            </Button>
          </div>
        </div>
      </header>

      {/* Main two-panel layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-0 min-h-0">
        {/* Preview pane — 60% */}
        <section className="relative bg-background min-h-[60vh] lg:min-h-0 lg:max-h-[calc(100vh-57px)] flex flex-col">
          <VideoPreview />
        </section>

        {/* Controls sidebar — 40% */}
        <aside className="border-t lg:border-t-0 lg:border-l border-border bg-card/30 lg:max-h-[calc(100vh-57px)] lg:overflow-y-auto scrollbar-thin">
          <div className="p-4 sm:p-5 space-y-5">
            {/* Selection section */}
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground mb-3">
                  1 · Selection
                </h2>
                <div className="space-y-3">
                  <SurahSelector />
                  <AyatRangePicker />
                  <ReciterSelector />
                </div>
              </div>

              <Button
                onClick={onLoadAyats}
                disabled={loading || !selectedSurah || !validation.ok}
                className="w-full"
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
            </div>

            <Separator />

            {/* Customization — tabs to keep the sidebar compact on mobile */}
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3">
                2 · Customize
              </h2>
              <Tabs defaultValue="layout" className="w-full">
                <TabsList className="grid grid-cols-3 w-full bg-background/40">
                  <TabsTrigger value="layout" className="text-xs">
                    Layout
                  </TabsTrigger>
                  <TabsTrigger value="style" className="text-xs">
                    Style
                  </TabsTrigger>
                  <TabsTrigger value="captions" className="text-xs">
                    Captions
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="layout" className="mt-4">
                  <CustomizationPanel />
                </TabsContent>
                <TabsContent value="style" className="mt-4">
                  <StyleTab />
                </TabsContent>
                <TabsContent value="captions" className="mt-4">
                  <CaptionsTab />
                </TabsContent>
              </Tabs>
            </div>

            <Separator />

            <div className="rounded-lg border border-border bg-background/40 p-3 text-[11px] text-muted-foreground leading-relaxed">
              <p>
                <span className="text-foreground font-medium">Tip:</span>{' '}
                Click <em>Load ayats</em> after changing surah/range/reciter.
                The preview will play the recitation with each word highlighted
                in real time. When you're happy, hit{' '}
                <span className="text-primary font-medium">Export video</span>.
              </p>
            </div>
          </div>
        </aside>
      </main>

      <ExportModal open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  )
}

// --- Sub-tabs that re-export slices of the CustomizationPanel --------------
// We split the panel into three vertical tabs to keep the sidebar manageable
// without rewriting the controls. Each tab renders just the relevant fields
// by leveraging the same store.

import { BG_PRESETS } from '@/components/CustomizationPanel'
import { Upload } from 'lucide-react'
import { useRef } from 'react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { HexColorPicker } from 'react-colorful'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FontStyle, Orientation } from '@/lib/types'
import { cn } from '@/lib/utils'

function StyleTab() {
  const settings = useBuilderStore((s) => s.settings)
  const update = useBuilderStore((s) => s.updateSettings)
  return (
    <div className="space-y-4">
      <SectionLabel>Background</SectionLabel>
      <div className="grid grid-cols-3 gap-2">
        {BG_PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => update({ backgroundImage: p.url, backgroundPreset: p.key })}
            className={cn(
              'aspect-video rounded-md border border-border overflow-hidden relative',
              settings.backgroundPreset === p.key
                ? 'ring-2 ring-primary'
                : 'hover:border-foreground/30',
            )}
            style={{ background: p.swatch }}
            title={p.label}
          />
        ))}
      </div>

      <UploadBg />

      <SectionLabel>Overlay</SectionLabel>
      <ColorRow label="Color" value={settings.overlayColor} onChange={(v) => update({ overlayColor: v })} />
      <SliderRow
        label="Opacity"
        value={settings.overlayOpacity}
        min={0}
        max={80}
        suffix="%"
        onChange={(v) => update({ overlayOpacity: v })}
      />

      <SectionLabel>Typography</SectionLabel>
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Font style</Label>
        <Select
          value={settings.fontStyle}
          onValueChange={(v: FontStyle) => update({ fontStyle: v })}
        >
          <SelectTrigger className="h-8 w-[160px] bg-background/60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="uthmani">
              <span className="font-arabic-uthmani">Uthmani (Amiri)</span>
            </SelectItem>
            <SelectItem value="naskh">
              <span className="font-arabic-naskh">Naskh (Scheherazade)</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <SliderRow
        label="Arabic size"
        value={settings.arabicFontSize}
        min={24}
        max={72}
        suffix="px"
        onChange={(v) => update({ arabicFontSize: v })}
      />
      <SliderRow
        label="Translation size"
        value={settings.translationFontSize}
        min={14}
        max={32}
        suffix="px"
        onChange={(v) => update({ translationFontSize: v })}
      />
      <ColorRow label="Font color" value={settings.fontColor} onChange={(v) => update({ fontColor: v })} />
      <ColorRow
        label="Highlight color"
        value={settings.highlightColor}
        onChange={(v) => update({ highlightColor: v })}
      />
    </div>
  )
}

function CaptionsTab() {
  const settings = useBuilderStore((s) => s.settings)
  const update = useBuilderStore((s) => s.updateSettings)
  return (
    <div className="space-y-4">
      <SectionLabel>Text card</SectionLabel>
      <ToggleRow
        label="Show border"
        checked={settings.showBorder}
        onChange={(v) => update({ showBorder: v })}
      />
      {settings.showBorder && (
        <>
          <ColorRow label="Border color" value={settings.borderColor} onChange={(v) => update({ borderColor: v })} />
          <SliderRow
            label="Corner radius"
            value={settings.border_radius}
            min={0}
            max={48}
            suffix="px"
            onChange={(v) => update({ border_radius: v })}
          />
        </>
      )}
      <SectionLabel>Captions</SectionLabel>
      <ToggleRow
        label="Show translation"
        checked={settings.showTranslation}
        onChange={(v) => update({ showTranslation: v })}
      />
      <ToggleRow
        label="Show transliteration"
        checked={settings.showTransliteration}
        onChange={(v) => update({ showTransliteration: v })}
      />
    </div>
  )
}

function UploadBg() {
  const update = useBuilderStore((s) => s.updateSettings)
  const fileRef = useRef<HTMLInputElement>(null)
  const onUpload = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result || '')
      update({ backgroundImage: dataUrl, backgroundPreset: 'custom' })
    }
    reader.readAsDataURL(file)
  }
  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onUpload(e.target.files?.[0])}
      />
      <Button
        variant="outline"
        size="sm"
        className="w-full bg-background/40"
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="h-3.5 w-3.5 mr-1.5" />
        Upload custom background
      </Button>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h3>
  )
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono text-foreground/70 uppercase">
          {value}
        </span>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="h-7 w-9 rounded-md border border-border"
              style={{ backgroundColor: value }}
              aria-label={`Pick ${label}`}
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2 bg-popover border-border">
            <HexColorPicker color={value} onChange={onChange} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

function SliderRow({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  suffix: string
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <span className="text-[11px] font-mono text-foreground/70">
          {value}
          {suffix}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={(v) => onChange(v[0]!)}
      />
    </div>
  )
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-sm">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
