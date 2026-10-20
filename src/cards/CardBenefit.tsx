import React from 'react'
import { isBengaliText } from '@/lib/cards/cardTypography'
import type { CardAlign, CardContent, CardTheme } from '@/lib/cards/types'
import { bengaliFontStacks, cardDisplayStack } from '@/remotion/fontStacks'
import { useCardStyle } from './CardStyleContext'

export const CardBenefit: React.FC<{ benefit: NonNullable<CardContent['benefit']>; theme: CardTheme; align: CardAlign }> = ({ benefit, theme, align }) => {
  const bangla = isBengaliText(benefit.text)
  const compact = useCardStyle().format === 'square'
  const textSize = (bangla ? 25 : 29) * (compact ? 0.84 : 1)
  return (
    <div
      style={{
        maxWidth: 780,
        marginTop: 6,
        padding: compact ? '10px 28px' : '16px 34px 14px',
        borderRadius: 28,
        background: `${theme.accent}1c`,
        border: `1.4px solid ${theme.accent}70`,
        textAlign: align,
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'left' ? 'flex-start' : 'center',
        gap: 6,
      }}
    >
      <div style={{ fontFamily: bangla ? bengaliFontStacks.serif : cardDisplayStack, fontStyle: bangla ? 'normal' : 'italic', fontWeight: 500, fontSize: textSize, lineHeight: bangla ? 1.5 : 1.3, color: theme.ink }}>
        <span style={{ color: theme.accent }}>✦ </span>
        {benefit.text}
        {compact && <span style={{ fontSize: textSize * 0.72, color: theme.muted, fontStyle: 'normal' }}> — {benefit.source}</span>}
      </div>
      {!compact && <div style={{ fontFamily: bangla ? bengaliFontStacks.serif : cardDisplayStack, fontSize: bangla ? 19 : 21, letterSpacing: '0.04em', color: theme.muted }}>— {benefit.source}</div>}
    </div>
  )
}
