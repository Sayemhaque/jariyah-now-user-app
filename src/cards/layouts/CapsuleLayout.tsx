import React from 'react'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bodyProps, column, panelFill, storyInset, type LayoutProps } from './layoutTypes'

export const CapsuleLayout: React.FC<LayoutProps> = (p) => {
  const { theme, width, height } = p
  const square = p.format === 'square'
  const side = 104
  const v = storyInset(p.format, 190, square ? 54 : 64)
  const half = (width - side * 2) / 2
  const r = storyInset(p.format, 380, square ? 190 : 260)
  const ring = 18
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} />
      <div
        style={{
          position: 'absolute',
          left: side - ring,
          right: side - ring,
          top: v - ring,
          bottom: v - ring,
          borderRadius: `${half + ring}px / ${r + ring}px`,
          border: `1.2px solid ${theme.accent}`,
          opacity: 0.55,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: side,
          right: side,
          top: v,
          bottom: v,
          borderRadius: `${half}px / ${r}px`,
          background: panelFill(theme),
          border: `2px solid ${theme.accent}`,
          boxShadow: `0 30px 70px ${theme.light ? 'rgba(60, 40, 15, 0.14)' : 'rgba(0, 0, 0, 0.38)'}`,
        }}
      />
      <div style={column(`${v + storyInset(p.format, 170, square ? 96 : 124)}px 150px ${v + storyInset(p.format, 150, square ? 84 : 110)}px`, square ? 22 : 30)}>
        <CardHeader content={p.content} theme={theme} logoSrc={p.logoSrc} />
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={theme} />
      </div>
    </>
  )
}
