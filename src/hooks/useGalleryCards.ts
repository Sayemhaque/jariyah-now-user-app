import { useMemo, useState } from 'react'
import { textCollections } from '@/lib/collections'
import type { TextLanguage } from '@/lib/collections/types'
import { azkarCard, hadithCard } from '@/lib/cards/cardContent'
import { alternatingCardThemes } from '@/lib/cards/themes'
import type { CardContent, CardFormat, CardProps } from '@/lib/cards/types'
import { defaultHadithSelection, shareableHadiths } from '@/lib/hadith/hadithPicks'
import { useHadithSection } from './useHadithSection'

export type GalleryMode = 'hadith' | 'azkar'

const previewCount = 8

export function useGalleryCards() {
  const [mode, setMode] = useState<GalleryMode>('hadith')
  const [language, setLanguage] = useState<TextLanguage>('english')
  const [format, setFormat] = useState<CardFormat>('portrait')
  const [selection, setSelection] = useState(defaultHadithSelection)
  const [visible, setVisible] = useState(previewCount)
  const hadithQuery = useHadithSection(selection.book, selection.section, language)

  const items = useMemo(() => {
    const contents: { id: string; content: CardContent }[] =
      mode === 'hadith'
        ? shareableHadiths(hadithQuery.data ?? []).map((h) => ({ id: `${h.book}-${h.number}`, content: hadithCard(h) }))
        : textCollections.azkar.map((item) => ({ id: item.id, content: azkarCard(item, language) }))
    return contents.map(({ id, content }, index) => ({
      id,
      card: { content, theme: alternatingCardThemes[index % alternatingCardThemes.length]!, format } as CardProps,
      fileName: `jariyah-${mode}-${id}-${language}-${format}`,
    }))
  }, [mode, language, format, hadithQuery.data])

  return {
    mode,
    setMode: (next: GalleryMode) => { setMode(next); setVisible(previewCount) },
    language,
    setLanguage,
    format,
    setFormat,
    selection,
    setBook: (book: string, section: number) => { setSelection({ book, section }); setVisible(previewCount) },
    setSection: (section: number) => { setSelection((s) => ({ ...s, section })); setVisible(previewCount) },
    items: items.slice(0, visible),
    total: items.length,
    hasMore: items.length > visible,
    showMore: () => setVisible((v) => v + previewCount * 2),
    isLoading: mode === 'hadith' && hadithQuery.isLoading,
    failed: mode === 'hadith' && hadithQuery.isError,
  }
}
