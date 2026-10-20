import React from 'react'
import type { CardAlign, CardLine, CardTheme } from '@/lib/cards/types'
import type { CardTypeSizes } from '@/lib/cards/cardTypography'
import { isBengaliText } from '@/lib/cards/cardTypography'
import { toArabicDigits } from '@/lib/wordTiming'
import { fitted } from './useShrinkToFit'
import { useCardStyle } from './CardStyleContext'
import { textWeight } from './titleFonts'

interface CardLineTextProps {
  line: CardLine
  theme: CardTheme
  sizes: CardTypeSizes
  quranic: boolean
  align?: CardAlign
}

export const CardLineText: React.FC<CardLineTextProps> = ({ line, theme, sizes, quranic, align = 'center' }) => {
  const { fonts } = useCardStyle()
  const bengali = isBengaliText(line.translation)
  const translationOnly = !line.arabic
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: align === 'left' ? 'stretch' : 'center', gap: fitted(sizes.translation * 0.7) }}>
      {line.arabic && (
        <div dir="rtl" style={{ fontFamily: fonts.arabic.family, fontSize: fitted(sizes.arabic), lineHeight: 1.9, color: theme.arabic, textAlign: align === 'left' ? 'right' : 'center' }}>
          {line.arabic}
          {line.ayah !== undefined && <span style={{ color: theme.accent, fontSize: '0.8em' }}>{` ﴿${toArabicDigits(line.ayah)}﴾`}</span>}
        </div>
      )}
      <div
        style={{
          fontFamily: (bengali ? fonts.textBangla : fonts.textLatin).family,
          fontStyle: translationOnly && !bengali && fonts.textLatin.id === 'cormorant' ? 'italic' : 'normal',
          fontWeight: bengali ? Math.min(textWeight(fonts.textBangla), 500) : textWeight(fonts.textLatin),
          fontSize: fitted(sizes.translation),
          lineHeight: bengali ? 1.6 : 1.42,
          color: translationOnly ? theme.ink : theme.muted,
          textAlign: align,
        }}
      >
        {line.translation}
      </div>
    </div>
  )
}
