import React from 'react'
import { cardPadding } from '@/lib/cards/cardTypography'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bodyProps, type LayoutProps } from './layoutTypes'

const PaperGrain: React.FC<{ width: number; height: number; light: boolean }> = ({ width, height, light }) => (
  <svg width={width} height={height} style={{ position: 'absolute', inset: 0, mixBlendMode: light ? 'multiply' : 'screen' }}>
    <filter id="jn-paper-fibres" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="7" />
      <feColorMatrix values={light ? '0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.3  0 0 0 0.55 0' : '0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.18 0'} />
    </filter>
    <filter id="jn-paper-cloud" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.006 0.012" numOctaves="2" seed="3" />
      <feColorMatrix values={light ? '0 0 0 0 0.55  0 0 0 0 0.47  0 0 0 0 0.38  0 0 0 0.35 0' : '0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0'} />
    </filter>
    <rect width={width} height={height} filter="url(#jn-paper-cloud)" />
    <rect width={width} height={height} filter="url(#jn-paper-fibres)" opacity="0.5" />
  </svg>
)

const SoftFolds: React.FC<{ light: boolean }> = ({ light }) => {
  const shade = light ? 'rgba(110,86,60,0.13)' : 'rgba(0,0,0,0.35)'
  const glow = light ? 'rgba(255,253,248,0.55)' : 'rgba(255,255,255,0.05)'
  return <div style={{ position: 'absolute', inset: '-15%', background: `repeating-linear-gradient(152deg, transparent 0, ${glow} 7%, transparent 13%, ${shade} 19%, transparent 26%)`, filter: 'blur(30px)' }} />
}

export const TextureLayout: React.FC<LayoutProps> = (p) => {
  const { theme, width, height } = p
  const pad = cardPadding[p.format]
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: theme.background }} />
      <SoftFolds light={theme.light} />
      <PaperGrain width={width} height={height} light={theme.light} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 90% 80% at 50% 45%, transparent 60%, ${theme.light ? 'rgba(90,70,40,0.12)' : 'rgba(0,0,0,0.35)'} 100%)` }} />
      <img src={p.logoSrc} alt="" style={{ position: 'absolute', right: 110, bottom: pad.bottom - 30, height: 60, filter: theme.light ? 'brightness(0)' : 'none', opacity: theme.light ? 0.55 : 0.8 }} />
      <div style={{ position: 'absolute', inset: 0, padding: `${pad.top + 50}px 140px ${pad.bottom + 70}px 150px`, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 30 }}>
        <CardHeader content={p.content} theme={theme} align="left" eyebrow={false} />
        <CardBody {...bodyProps(p)} align="left" quoteMark={false} />
        <CardFooter content={p.content} theme={theme} align="left" divider={false} />
      </div>
    </>
  )
}
