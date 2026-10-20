import React from 'react'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardGrain } from '../CardGrain'
import { CardHeader } from '../CardHeader'
import { bodyProps, column, storyInset, type LayoutProps } from './layoutTypes'
import type { CardTheme } from '@/lib/cards/types'

function tile(theme: CardTheme, size: number): string {
  const h = size / 2
  const s = size * 0.27
  const d = size * 0.13
  const star = `<rect x='${h - s}' y='${h - s}' width='${s * 2}' height='${s * 2}'/><rect x='${h - s}' y='${h - s}' width='${s * 2}' height='${s * 2}' transform='rotate(45 ${h} ${h})'/>`
  const corners = [[0, 0], [size, 0], [0, size], [size, size]].map(([x, y]) => `<path d='M${x} ${y - d}L${x + d} ${y}L${x} ${y + d}L${x - d} ${y}Z'/>`).join('')
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'><g fill='${theme.accent}'>${star}</g><circle cx='${h}' cy='${h}' r='${size * 0.09}' fill='${theme.light ? theme.arabic : (theme.background.match(/#[0-9a-fA-F]{6}/)?.[0] ?? '#000000')}' opacity='0.7'/><g fill='${theme.accent}' opacity='0.55'>${corners}</g></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

export const ZelligeLayout: React.FC<LayoutProps> = (p) => {
  const { width, height, theme } = p
  const square = p.format === 'square'
  const e = storyInset(p.format, 40, 34)
  const band = square ? 52 : 60
  const size = band / 2
  const line = `1.5px solid ${theme.accent}`
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: theme.background }} />
      <div style={{ position: 'absolute', inset: 0, background: theme.glow }} />
      <div style={{ position: 'absolute', inset: e, backgroundImage: tile(theme, size), backgroundSize: `${size}px ${size}px`, backgroundPosition: 'center', opacity: theme.light ? 0.85 : 0.75 }} />
      <div style={{ position: 'absolute', inset: e, border: line }} />
      <div style={{ position: 'absolute', inset: e + band, background: theme.background, border: line, boxShadow: `0 0 0 6px ${theme.light ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.35)'}` }} />
      <div style={{ position: 'absolute', inset: e + band, background: theme.glow }} />
      <div style={{ position: 'absolute', inset: e + band + 14, border: `0.8px solid ${theme.accent}`, opacity: 0.5 }} />
      <CardGrain width={width} height={height} opacity={theme.grain} light={theme.light} />
      <div style={column(`${storyInset(p.format, 250, square ? 150 : 170)}px 150px ${storyInset(p.format, 250, square ? 132 : 150)}px`, square ? 22 : 30)}>
        <CardHeader content={p.content} theme={theme} logoSrc={p.logoSrc} />
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={theme} />
      </div>
    </>
  )
}
