import React from 'react'
import type { CardContent, CardTheme } from '@/lib/cards/types'
import { cardCapsStack, cardDisplayStack } from '@/remotion/fontStacks'
import { CardDivider } from './CardOrnament'

const pad = (n: number) => String(n).padStart(2, '0')

export const CardFooter: React.FC<{ content: CardContent; theme: CardTheme }> = ({ content, theme }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
    <CardDivider color={theme.accent} />
    <div style={{ fontFamily: cardCapsStack, fontSize: 22, letterSpacing: '0.24em', paddingLeft: '0.24em', color: theme.accent, textTransform: 'uppercase', textAlign: 'center', fontWeight: 500 }}>
      {content.reference}
    </div>
    {content.note && <div style={{ fontFamily: cardDisplayStack, fontStyle: 'italic', fontSize: 30, color: theme.muted }}>{content.note}</div>}
    {content.slide && (
      <div style={{ fontFamily: cardCapsStack, fontSize: 18, letterSpacing: '0.3em', color: theme.muted }}>
        {pad(content.slide.index)} / {pad(content.slide.count)}
      </div>
    )}
  </div>
)
