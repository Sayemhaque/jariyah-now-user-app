import React from 'react'
import type { CardTheme } from '@/lib/cards/types'
import { CardGrain } from './CardGrain'
import { CardPattern } from './CardPattern'

interface CardBackdropProps {
  theme: CardTheme
  width: number
  height: number
  pattern?: boolean
  vignette?: boolean
}

export const CardBackdrop: React.FC<CardBackdropProps> = ({ theme, width, height, pattern = true, vignette = true }) => (
  <>
    <div style={{ position: 'absolute', inset: 0, background: theme.background }} />
    <div style={{ position: 'absolute', inset: 0, background: theme.glow }} />
    {pattern && <CardPattern pattern={theme.pattern} color={theme.accent} opacity={theme.patternOpacity} width={width} height={height} />}
    {vignette && <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 85% 75% at 50% 50%, transparent 55%, ${theme.light ? 'rgba(90, 60, 20, 0.16)' : 'rgba(0, 0, 0, 0.5)'} 100%)` }} />}
    <CardGrain width={width} height={height} opacity={theme.grain} light={theme.light} />
  </>
)
