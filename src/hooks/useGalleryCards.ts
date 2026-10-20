import { useMemo, useState } from 'react'
import { textCollections } from '@/lib/collections'
import type { TextLanguage, TextMode } from '@/lib/collections/types'
import { azkarCard, hadithCard } from '@/lib/cards/cardContent'
import { cardThemes } from '@/lib/cards/themes'
import type { CardFormat, CardProps } from '@/lib/cards/types'

const previewCount = 8

export function useGalleryCards() {
  const [mode, setMode] = useState<TextMode>('hadith')
  const [language, setLanguage] = useState<TextLanguage>('english')
  const [format, setFormat] = useState<CardFormat>('portrait')
  const [showAll, setShowAll] = useState(false)

  const items = useMemo(
    () =>
      textCollections[mode].map((item, index) => ({
        id: item.id,
        card: { content: mode === 'hadith' ? hadithCard(item, language) : azkarCard(item, language), theme: cardThemes[index % cardThemes.length]!, format } as CardProps,
        fileName: `jariyah-${mode}-${item.id}-${language}-${format}`,
      })),
    [mode, language, format],
  )

  return { mode, setMode, language, setLanguage, format, setFormat, items: showAll ? items : items.slice(0, previewCount), hasMore: !showAll && items.length > previewCount, showMore: () => setShowAll(true) }
}
