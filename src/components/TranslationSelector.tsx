'use client'

import { BookText, AlertTriangle } from 'lucide-react'
import { useBuilderStore } from '@/lib/store'
import {
  TRANSLATION_EDITIONS,
  getTranslationEdition,
} from '@/lib/translations'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

/**
 * Translation edition picker. Each edition carries its own licensing terms —
 * the picker surfaces a warning badge for editions restricted to personal
 * use only (e.g. Muhammad Asad's translation).
 *
 * The default is Pickthall (public domain). Users who pick Asad see a clear
 * note that they need a separate license to distribute the resulting video.
 */
export function TranslationSelector() {
  const translationKey = useBuilderStore((s) => s.translationKey)
  const setTranslation = useBuilderStore((s) => s.setTranslation)
  const edition = getTranslationEdition(translationKey)

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-foreground/90">
        <BookText className="h-4 w-4 text-primary" />
        Translation
      </label>

      <Select value={translationKey} onValueChange={setTranslation}>
        <SelectTrigger className="w-full bg-card/60 h-11">
          <SelectValue placeholder="Choose a translation" />
        </SelectTrigger>
        <SelectContent className="bg-popover">
          {TRANSLATION_EDITIONS.map((e) => (
            <SelectItem key={e.key} value={e.key} className="py-2.5">
              <div className="flex items-center gap-2 w-full">
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium leading-tight truncate">
                    {e.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground leading-tight truncate">
                    {e.rightsHolder}
                  </span>
                </div>
                {e.warn && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-amber-500/15 text-amber-500 shrink-0">
                          <AlertTriangle className="h-3 w-3" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-popover">
                        <p className="text-xs leading-relaxed">
                          {e.licenseNote}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Inline summary of the selected edition's license */}
      <div className="rounded-lg border border-border bg-card/40 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-medium text-foreground/80 truncate">
            {edition.fullName}
          </span>
          <span
            className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full border shrink-0 ${
              edition.license === 'public-domain'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : edition.license === 'permissive'
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
            }`}
          >
            {edition.license === 'public-domain'
              ? 'Public domain'
              : edition.license === 'permissive'
                ? 'Non-commercial'
                : 'Personal use'}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {edition.licenseNote}
        </p>
      </div>
    </div>
  )
}
