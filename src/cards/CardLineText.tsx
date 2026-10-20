import React from 'react'
import type { CardLine, CardTheme } from '@/lib/cards/types'
import type { CardTypeSizes } from '@/lib/cards/cardTypography'
import { isBengaliText } from '@/lib/cards/cardTypography'
import { toArabicDigits } from '@/lib/wordTiming'
import { fitted } from './useShrinkToFit'
import { arabicFontStacks, bengaliFontStacks, cardDisplayStack } from '@/remotion/fontStacks'

interface CardLineTextProps {
  line: CardLine
  theme: CardTheme
  sizes: CardTypeSizes
  quranic: boolean
}

export const CardLineText: React.FC<CardLineTextProps> = ({ line, theme, sizes, quranic }) => {
  const bengali = isBengaliText(line.translation)
  const translationOnly = !line.arabic
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: fitted(sizes.translation * 0.7) }}>
      {line.arabic && (
        <div dir="rtl" style={{ fontFamily: quranic ? arabicFontStacks.quran : arabicFontStacks.amiri, fontSize: fitted(sizes.arabic), lineHeight: 1.9, color: theme.ink, textAlign: 'center' }}>
          {line.arabic}
          {line.ayah !== undefined && <span style={{ color: theme.accent, fontSize: '0.8em' }}>{` ﴿${toArabicDigits(line.ayah)}﴾`}</span>}
        </div>
      )}
      <div
        style={{
          fontFamily: bengali ? bengaliFontStacks.serif : cardDisplayStack,
          fontStyle: translationOnly && !bengali ? 'italic' : 'normal',
          fontWeight: bengali ? 400 : 500,
          fontSize: fitted(sizes.translation),
          lineHeight: bengali ? 1.6 : 1.42,
          color: translationOnly ? theme.ink : theme.muted,
          textAlign: 'center',
        }}
      >
        {line.translation}
      </div>
    </div>
  )
}
