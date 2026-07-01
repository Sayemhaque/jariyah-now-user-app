'use client'

import { useRef } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Upload, Sparkles } from 'lucide-react'
import { useBuilderStore } from '@/lib/store'
import type { FontStyle, Orientation, OverlayStyle } from '@/lib/types'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface Preset {
  key: string
  label: string
  url: string
}

// 7 high-quality photographic backgrounds (AI-generated, stored in /public/backgrounds).
const BG_PRESETS: Preset[] = [
  { key: 'mountain', label: 'Mountain Dawn', url: '/backgrounds/mountain.png' },
  { key: 'desert', label: 'Desert Dusk', url: '/backgrounds/desert.png' },
  { key: 'ocean', label: 'Deep Ocean', url: '/backgrounds/ocean.png' },
  { key: 'forest', label: 'Misty Forest', url: '/backgrounds/forest.png' },
  { key: 'night', label: 'Starlit Night', url: '/backgrounds/night.png' },
  { key: 'mosque', label: 'Mosque Gold', url: '/backgrounds/mosque.png' },
  { key: 'pattern', label: 'Arabesque', url: '/backgrounds/pattern.png' },
]

// Overlay style presets — each one shapes the user's color + opacity
// differently across the frame. The mini-swatch uses a real gradient so
// the user can see the shape before applying it.
const OVERLAY_PRESETS: {
  key: OverlayStyle
  label: string
  swatch: string
}[] = [
  {
    key: 'solid',
    label: 'Solid',
    swatch: 'linear-gradient(#000,#000)',
  },
  {
    key: 'bottom-gradient',
    label: 'Bottom Fade',
    swatch:
      'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 60%, #000 100%)',
  },
  {
    key: 'top-gradient',
    label: 'Top Fade',
    swatch:
      'linear-gradient(180deg, #000 0%, rgba(0,0,0,0.4) 40%, transparent 100%)',
  },
  {
    key: 'vignette',
    label: 'Vignette',
    swatch:
      'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)',
  },
  {
    key: 'center-focus',
    label: 'Spotlight',
    swatch:
      'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, transparent 70%)',
  },
  {
    key: 'none',
    label: 'None',
    swatch:
      'repeating-linear-gradient(45deg, #1f2937 0 6px, #111827 6px 12px)',
  },
]

function ColorField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <div className={cn('flex items-center justify-between gap-3', disabled && 'opacity-50')}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono text-foreground/70 uppercase">
          {value}
        </span>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className="h-7 w-9 rounded-md border border-border ring-1 ring-inset ring-white/5 disabled:cursor-not-allowed"
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="qv-section-title mb-2.5 mt-5 first:mt-0">{children}</h3>
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="qv-card rounded-xl p-3.5 space-y-3">{children}</div>
}

export function CustomizationPanel() {
  const settings = useBuilderStore((s) => s.settings)
  const update = useBuilderStore((s) => s.updateSettings)
  const setOrientation = useBuilderStore((s) => s.setOrientation)
  const setAutoFitFonts = useBuilderStore((s) => s.setAutoFitFonts)
  const fileRef = useRef<HTMLInputElement>(null)

  const onUpload = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result || '')
      update({
        backgroundImage: dataUrl,
        backgroundPreset: 'custom',
      })
    }
    reader.readAsDataURL(file)
  }

  const overlayDisabled = settings.overlayStyle === 'none'

  return (
    <div className="space-y-1">
      {/* Layout */}
      <SectionTitle>Layout</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        {(['portrait', 'landscape'] as Orientation[]).map((o) => (
          <button
            key={o}
            onClick={() => setOrientation(o)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-lg border px-2 py-3 text-xs transition',
              settings.orientation === o
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card/40 hover:border-foreground/30 hover:bg-card/70',
            )}
          >
            <div
              className={cn(
                'border-2 rounded-sm',
                settings.orientation === o
                  ? 'border-primary'
                  : 'border-foreground/40',
                o === 'portrait' && 'h-7 w-4',
                o === 'landscape' && 'h-4 w-7',
              )}
            />
            <span className="capitalize font-medium">{o}</span>
          </button>
        ))}
      </div>

      {/* Background — real image thumbnails */}
      <SectionTitle>Background</SectionTitle>
      <div className="grid grid-cols-3 gap-2">
        {BG_PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() =>
              update({ backgroundImage: p.url, backgroundPreset: p.key })
            }
            className={cn(
              'group relative aspect-video rounded-lg overflow-hidden border transition',
              settings.backgroundPreset === p.key
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background border-transparent'
                : 'border-border hover:border-foreground/40',
            )}
          >
            <img
              src={p.url}
              alt={p.label}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-[10px] font-medium py-1 px-1.5 text-center">
              {p.label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-2">
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
          className="w-full bg-card/40 hover:bg-card/70"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-3.5 w-3.5 mr-1.5" />
          Upload custom background
        </Button>
      </div>

      {/* Overlay — preset shapes + color + opacity */}
      <SectionTitle>Overlay</SectionTitle>
      <Card>
        <div className="grid grid-cols-3 gap-2">
          {OVERLAY_PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => update({ overlayStyle: p.key })}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-lg border p-2 transition',
                settings.overlayStyle === p.key
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card/40 hover:border-foreground/30 hover:bg-card/70',
              )}
              title={p.label}
            >
              <span
                className="block h-8 w-full rounded-md ring-1 ring-inset ring-white/10"
                style={{ background: p.swatch }}
              />
              <span className="text-[10px] font-medium leading-none">
                {p.label}
              </span>
            </button>
          ))}
        </div>

        <ColorField
          label="Color"
          value={settings.overlayColor}
          onChange={(v) => update({ overlayColor: v })}
          disabled={overlayDisabled}
        />
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Opacity</Label>
            <span className="text-[11px] font-mono text-foreground/70 tabular-nums">
              {overlayDisabled ? '—' : `${settings.overlayOpacity}%`}
            </span>
          </div>
          <Slider
            value={[settings.overlayOpacity]}
            min={0}
            max={80}
            step={1}
            disabled={overlayDisabled}
            onValueChange={(v) => update({ overlayOpacity: v[0]! })}
          />
        </div>
      </Card>

      {/* Typography */}
      <SectionTitle>Typography</SectionTitle>
      <Card>
        {/* Auto-fit toggle — when on, font sizes auto-scale with orientation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <Label className="text-sm font-medium">Auto-fit fonts</Label>
          </div>
          <Switch
            checked={settings.autoFitFonts}
            onCheckedChange={(v) => setAutoFitFonts(v)}
          />
        </div>
        {settings.autoFitFonts && (
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Font sizes auto-scale to the selected layout. Turn off to fine-tune
            manually.
          </p>
        )}

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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">
              Arabic font size
            </Label>
            <span className="text-[11px] font-mono text-foreground/70 tabular-nums">
              {settings.arabicFontSize}px
            </span>
          </div>
          <Slider
            value={[settings.arabicFontSize]}
            min={24}
            max={72}
            step={1}
            // When auto-fit is on, the slider becomes a read-only indicator
            // (the value follows the orientation). The user can still drag it,
            // which will not stick — they need to turn off auto-fit first.
            disabled={settings.autoFitFonts}
            onValueChange={(v) => update({ arabicFontSize: v[0]! })}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">
              Translation font size
            </Label>
            <span className="text-[11px] font-mono text-foreground/70 tabular-nums">
              {settings.translationFontSize}px
            </span>
          </div>
          <Slider
            value={[settings.translationFontSize]}
            min={14}
            max={32}
            step={1}
            disabled={settings.autoFitFonts}
            onValueChange={(v) => update({ translationFontSize: v[0]! })}
          />
        </div>

        <ColorField
          label="Font color"
          value={settings.fontColor}
          onChange={(v) => update({ fontColor: v })}
        />
        <ColorField
          label="Highlight color"
          value={settings.highlightColor}
          onChange={(v) => update({ highlightColor: v })}
        />
      </Card>

      {/* Captions */}
      <SectionTitle>Captions</SectionTitle>
      <Card>
        <div className="flex items-center justify-between">
          <Label className="text-sm">Show translation</Label>
          <Switch
            checked={settings.showTranslation}
            onCheckedChange={(v) => update({ showTranslation: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm">Show transliteration</Label>
          <Switch
            checked={settings.showTransliteration}
            onCheckedChange={(v) => update({ showTransliteration: v })}
          />
        </div>
      </Card>
    </div>
  )
}

export { BG_PRESETS }
