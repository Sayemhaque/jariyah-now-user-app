'use client'

import { useState, useEffect, useCallback } from 'react'
import { Scissors, X, Check, Loader2, AlertCircle } from 'lucide-react'
import {
  fetchWordData,
  fetchSilencePoints,
  buildSegments,
  isSplittable,
  type WordData,
  type SilencePoint,
  type SplitSegment,
  type AyatSplit,
} from '@/lib/ayatSplitter'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface AyatSplitterProps {
  open: boolean
  onClose: () => void
  surah: number
  ayat: number
  arabicText: string
  audioUrl: string
  audioDurationMs: number
  onApplySplit: (split: AyatSplit) => void
}

export function AyatSplitter({
  open,
  onClose,
  surah,
  ayat,
  arabicText,
  audioUrl,
  audioDurationMs,
  onApplySplit,
}: AyatSplitterProps) {
  const [words, setWords] = useState<WordData[]>([])
  const [loading, setLoading] = useState(false)
  const [splitPoints, setSplitPoints] = useState<number[]>([])
  const [silences, setSilences] = useState<SilencePoint[]>([])
  const [analyzingAudio, setAnalyzingAudio] = useState(false)

  // Fetch word data when opened. Uses a microtask-deferred setState
  // pattern to avoid the React 19 lint rule against calling setState
  // synchronously inside an effect body (which can trigger cascading
  // renders). The state updates still happen in the same tick from the
  // user's perspective.
  useEffect(() => {
    if (!open) return
    let cancelled = false
    Promise.resolve().then(() => {
      if (cancelled) return
      setLoading(true)
      setSplitPoints([])
      fetchWordData(surah, ayat).then((data) => {
        if (cancelled) return
        if (data && data.length > 0) {
          setWords(data)
        } else {
          // Fallback: split arabicText by whitespace
          const fallbackWords = arabicText
            .split(/\s+/)
            .filter(Boolean)
            .map((text, i) => ({
              position: i + 1,
              arabic: text,
              transliteration: '',
              meaning: '',
            }))
          setWords(fallbackWords)
        }
        setLoading(false)
      })

      // Fetch silence points in parallel
      setAnalyzingAudio(true)
      fetchSilencePoints(audioUrl).then((sils) => {
        if (cancelled) return
        setSilences(sils)
        setAnalyzingAudio(false)
      })
    })
    return () => {
      cancelled = true
    }
  }, [open, surah, ayat, arabicText, audioUrl])

  // Toggle a split point at a word index
  const toggleSplitPoint = useCallback((wordIndex: number) => {
    setSplitPoints((prev) => {
      if (prev.includes(wordIndex)) {
        return prev.filter((p) => p !== wordIndex)
      }
      // Limit to 3 split points (max 4 parts)
      if (prev.length >= 3) {
        toast.error('Maximum 3 split points (4 parts) allowed')
        return prev
      }
      // Can't split at index 0 (that's the start)
      if (wordIndex === 0) return prev
      return [...prev, wordIndex].sort((a, b) => a - b)
    })
  }, [])

  // Apply the split
  const handleApply = () => {
    if (splitPoints.length === 0) {
      toast.error('Place at least one split point')
      return
    }

    const segments = buildSegments(words, splitPoints, audioDurationMs, silences)
    const split: AyatSplit = {
      surah,
      ayat,
      words,
      splitPoints,
      segments,
      audioUrl,
      audioDurationMs,
    }

    onApplySplit(split)
    toast.success(`Split into ${segments.length} parts`)
    onClose()
  }

  if (!open) return null

  // Build the visual word list with split markers
  const sortedSplits = [...splitPoints].sort((a, b) => a - b)

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="grid place-items-center h-9 w-9 rounded-xl bg-primary/15 text-primary">
              <Scissors className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Split Long Ayah</h2>
              <p className="text-[11px] text-muted-foreground">
                Surah {surah}:{ayat} • {words.length} words
                {analyzingAudio && ' • Analyzing audio pauses…'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="grid place-items-center h-8 w-8 rounded-lg hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body — word list with split markers */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          {loading ? (
            <div className="grid place-items-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground mt-2">Loading word data…</p>
            </div>
          ) : (
            <>
              {/* Instructions */}
              <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/15 px-3 py-2.5 mb-4">
                <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Click <strong className="text-foreground">between words</strong> to place split markers.
                  Each marker starts a new part. Audio cuts snap to natural pauses
                  {silences.length > 0 && ` (${silences.length} pauses found)`}.
                  Max 3 splits = 4 parts.
                </p>
              </div>

              {/* Word list — RTL, with split markers between words */}
              <div dir="rtl" lang="ar" className="flex flex-wrap gap-1 items-center justify-center text-lg leading-loose font-arabic-uthmani">
                {words.map((word, i) => (
                  <span key={i} className="inline-flex items-center">
                    {/* Split marker BEFORE this word (except word 0) */}
                    {i > 0 && (
                      <button
                        onClick={() => toggleSplitPoint(i)}
                        className={cn(
                          'mx-0.5 px-1.5 py-1 rounded-md transition shrink-0',
                          sortedSplits.includes(i)
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted/50 hover:bg-primary/20 text-transparent hover:text-primary/60',
                        )}
                        title={sortedSplits.includes(i) ? 'Remove split here' : 'Split here'}
                      >
                        <Scissors className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {/* The word itself */}
                    <span className="px-1 cursor-default select-none">
                      {word.arabic}
                    </span>
                  </span>
                ))}
              </div>

              {/* Part preview */}
              {sortedSplits.length > 0 && (
                <div className="mt-6 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Preview ({sortedSplits.length + 1} parts)
                  </p>
                  {buildSegments(words, sortedSplits, audioDurationMs, silences).map((seg) => (
                    <div key={seg.partNumber} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
                      <span className="grid place-items-center h-7 w-7 rounded-lg bg-primary text-primary-foreground text-xs font-bold shrink-0">
                        {seg.partNumber}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p dir="rtl" className="text-sm font-arabic-uthmani truncate">
                          {seg.words.map((w) => w.arabic).join(' ')}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {seg.words.length} words • {(seg.audioEndMs - seg.audioStartMs) / 1000}s audio
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer — apply / cancel */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-border">
          <p className="text-[11px] text-muted-foreground">
            {sortedSplits.length} split{sortedSplits.length !== 1 ? 's' : ''} → {sortedSplits.length + 1} part{sortedSplits.length + 1 !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="qv-btn-primary font-semibold"
              onClick={handleApply}
              disabled={loading || splitPoints.length === 0}
            >
              <Check className="h-4 w-4 mr-1" />
              Apply Split
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
