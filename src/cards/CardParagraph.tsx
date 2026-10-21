import React from 'react'
import type { CardAlign, CardLine, CardTheme } from '@/lib/cards/types'
import type { CardTypeSizes } from '@/lib/cards/cardTypography'
import { isBengaliText } from '@/lib/cards/cardTypography'
import { bnDigits } from '@/lib/cards/bangla'
import { toArabicDigits } from '@/lib/wordTiming'
import { fitted } from './useShrinkToFit'
import { useCardStyle } from './CardStyleContext'
import { textWeight } from './titleFonts'

interface CardParagraphProps {
  lines: CardLine[]
  theme: CardTheme
  sizes: CardTypeSizes
  align?: CardAlign
}

export const CardParagraph: React.FC<CardParagraphProps> = ({ lines, theme, sizes, align = 'center' }) => {
  const { fonts } = useCardStyle()
  const bengali = lines.some((l) => isBengaliText(l.translation))
  const marker = (n: number | undefined) => (bengali ? bnDigits(n ?? 0) : String(n ?? ''))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: fitted(sizes.translation * 1.1), width: '100%' }}>
      <div dir="rtl" style={{ fontFamily: fonts.arabic.family, fontSize: fitted(sizes.arabic), lineHeight: 1.95, color: theme.arabic, textAlign: align === 'left' ? 'right' : 'center' }}>
        {lines.map((l, i) => (
          <React.Fragment key={i}>
            {l.arabic}
            <span style={{ color: theme.accent, fontSize: '0.78em', margin: '0 0.25em' }}>﴿{toArabicDigits(l.ayah ?? 0)}﴾</span>{' '}
          </React.Fragment>
        ))}
      </div>
      <div style={{ width: 90, height: 2, background: theme.accent, opacity: 0.6, alignSelf: align === 'left' ? 'flex-start' : 'center' }} />
      <div style={{ fontFamily: (bengali ? fonts.textBangla : fonts.textLatin).family, fontWeight: bengali ? Math.min(textWeight(fonts.textBangla), 500) : textWeight(fonts.textLatin), fontSize: fitted(sizes.translation), lineHeight: bengali ? 1.65 : 1.5, color: theme.ink, textAlign: align }}>
        {lines.map((l, i) => (
          <React.Fragment key={i}>
            <span style={{ color: theme.accent, fontWeight: 600, fontSize: '0.8em' }}>({marker(l.ayah)})</span> {l.translation}{' '}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
