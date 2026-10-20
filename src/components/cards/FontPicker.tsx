import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useContent } from '@/lib/contentStore'
import { useCustomFonts } from '@/hooks/useCustomFonts'
import { defaultFonts, fontsForSlot, fontsForStyle, type FontSlot } from '@/lib/cards/fontLibrary'
import { FontSelect } from './FontSelect'

const slots: { slot: FontSlot; label: string; sample: string }[] = [
  { slot: 'titleLatin', label: 'Title · English', sample: 'Good Manners' },
  { slot: 'titleBangla', label: 'Title · Bangla', sample: 'সহীহ বুখারী' },
  { slot: 'textLatin', label: 'Text · English', sample: 'The best of you' },
  { slot: 'textBangla', label: 'Text · Bangla', sample: 'তোমাদের মধ্যে উত্তম' },
  { slot: 'arabic', label: 'Arabic', sample: 'بِسْمِ ٱللَّهِ' },
]

export function FontPicker() {
  const { fonts, customFonts, setFont, titleStyle } = useContent()
  const uploadFont = useCustomFonts()
  const current = (slot: FontSlot) => fonts[slot] ?? fontsForStyle[titleStyle][slot] ?? defaultFonts[slot]
  return (
    <div className="space-y-2.5">
      {slots.map(({ slot, label, sample }) => (
        <FontSelect key={slot} label={label} sample={sample} value={current(slot)} fonts={fontsForSlot(slot, customFonts)} onChange={(id) => setFont(slot, id)} />
      ))}
      <Button variant="secondary" size="sm" asChild className="w-full">
        <label className="cursor-pointer">
          <Upload className="mr-1.5 h-4 w-4" />
          Upload your own font
          <input type="file" accept=".ttf,.otf,.woff,.woff2" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFont(e.target.files[0])} />
        </label>
      </Button>
      <p className="text-[11px] leading-snug text-muted-foreground">TTF, OTF or WOFF up to 8 MB. Your fonts stay in this browser and appear in every list above.</p>
    </div>
  )
}
