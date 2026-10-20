import React from 'react'
import type { CardAlign, CardContent, CardTheme } from '@/lib/cards/types'
import { isBengaliText } from '@/lib/cards/cardTypography'
import { bengaliFontStacks, cardCapsStack, cardDisplayStack } from '@/remotion/fontStacks'
import { CardDivider } from './CardOrnament'

const pad = (n: number) => String(n).padStart(2, '0')

interface CardFooterProps {
  content: CardContent
  theme: CardTheme
  align?: CardAlign
  divider?: boolean
}

export const CardFooter: React.FC<CardFooterProps> = ({ content, theme, align = 'center', divider = true }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: align === 'left' ? 'flex-start' : 'center', gap: 16, width: '100%' }}>
    {divider && <CardDivider color={theme.accent} />}
    <div style={{ ...(isBengaliText(content.reference) ? { fontFamily: bengaliFontStacks.serif, fontSize: 26, letterSpacing: '0.03em' } : { fontFamily: cardCapsStack, fontSize: 22, letterSpacing: '0.24em', paddingLeft: '0.24em' }), color: theme.accent, textTransform: 'uppercase', textAlign: align, fontWeight: 500 }}>
      {content.reference}
    </div>
    {content.note && <div style={{ fontFamily: isBengaliText(content.note) ? bengaliFontStacks.serif : cardDisplayStack, fontStyle: isBengaliText(content.note) ? 'normal' : 'italic', fontSize: isBengaliText(content.note) ? 26 : 30, color: theme.muted }}>{content.note}</div>}
    {content.slide && (
      <div style={{ fontFamily: cardCapsStack, fontSize: 18, letterSpacing: '0.3em', color: theme.muted }}>
        {pad(content.slide.index)} / {pad(content.slide.count)}
      </div>
    )}
  </div>
)
