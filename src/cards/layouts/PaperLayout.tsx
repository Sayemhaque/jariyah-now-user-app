import React from 'react'
import type { CardTheme } from '@/lib/cards/types'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bandTheme, bodyProps, column, storyInset, type LayoutProps } from './layoutTypes'

const sheetTheme = (theme: CardTheme): CardTheme => (theme.light ? theme : { ...bandTheme(theme), background: '#f6f0e2' })

export const PaperLayout: React.FC<LayoutProps> = (p) => {
  const { theme, width, height } = p
  const square = p.format === 'square'
  const sheet = sheetTheme(theme)
  const v = storyInset(p.format, 200, square ? 64 : 78)
  const box: React.CSSProperties = { position: 'absolute', left: 92, right: 92, top: v, bottom: v, borderRadius: 6 }
  const shadow = theme.light ? 'rgba(70, 50, 20, 0.18)' : 'rgba(0, 0, 0, 0.45)'
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} />
      <div style={{ ...box, background: theme.light ? '#f3ece0' : '#e4d9c3', transform: 'rotate(-1.8deg) translate(-8px, 10px)', boxShadow: `0 10px 30px ${shadow}` }} />
      <div
        style={{
          ...box,
          background: theme.light ? 'linear-gradient(170deg, #ffffff, #fbf8f1)' : 'linear-gradient(170deg, #faf5ea, #f1e9d8)',
          boxShadow: `0 1px 0 rgba(255, 255, 255, 0.6) inset, 0 24px 60px ${shadow}, 0 4px 12px ${shadow}`,
        }}
      />
      <div style={{ ...box, left: 92 + 26, right: 92 + 26, top: v + 26, bottom: v + 26, borderRadius: 2, border: `1px solid ${sheet.accent}`, opacity: 0.35 }} />
      <div style={column(`${v + (square ? 70 : 90)}px 150px ${v + (square ? 60 : 80)}px`, square ? 22 : 30)}>
        <CardHeader content={p.content} theme={sheet} logoSrc={p.logoSrc} />
        <CardBody {...bodyProps(p)} theme={sheet} />
        <CardFooter content={p.content} theme={sheet} />
      </div>
    </>
  )
}
