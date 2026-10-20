import React from 'react'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bodyProps, column, panelFill, storyInset, type LayoutProps } from './layoutTypes'

function archPath(l: number, r: number, top: number, bottom: number): string {
  const cx = (l + r) / 2
  const shoulder = top + (r - l) * 0.42
  return `M${l} ${bottom} V${shoulder} Q${l} ${top + 40} ${cx} ${top} Q${r} ${top + 40} ${r} ${shoulder} V${bottom} Z`
}

export const ArchLayout: React.FC<LayoutProps> = (p) => {
  const { width, height, theme } = p
  const top = storyInset(p.format, 230, 70)
  const bottom = height - storyInset(p.format, 230, 70)
  const [l, r] = [86, width - 86]
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <path d={archPath(l, r, top, bottom)} fill={panelFill(theme)} stroke={theme.accent} strokeWidth="2.2" />
        <path d={archPath(l + 16, r - 16, top + 22, bottom - 16)} fill="none" stroke={theme.accent} strokeWidth="0.9" opacity="0.6" />
      </svg>
      <div style={column(`${top + (p.format === 'square' ? 92 : 120)}px 150px ${height - bottom + (p.format === 'square' ? 40 : 60)}px`, p.format === 'square' ? 22 : 30)}>
        <CardHeader content={p.content} theme={theme} logoSrc={p.logoSrc} />
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={theme} />
      </div>
    </>
  )
}
