import React from 'react'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bodyProps, column, storyInset, type LayoutProps } from './layoutTypes'
import type { CardTheme } from '@/lib/cards/types'

function Roll({ y, theme, width }: { y: number; theme: CardTheme; width: number }) {
  const shade = `linear-gradient(180deg, rgba(0,0,0,0.38) 0, rgba(255,255,255,0.42) 30%, rgba(255,255,255,0.08) 52%, rgba(0,0,0,0.42) 100%), ${theme.accent}`
  const knob = { position: 'absolute' as const, top: 6, width: 30, height: 44, borderRadius: 10, background: `linear-gradient(180deg, rgba(0,0,0,0.3), rgba(255,255,255,0.3) 35%, rgba(0,0,0,0.45)), ${theme.accent}` }
  return (
    <div style={{ position: 'absolute', left: 58, width: width - 116, top: y - 28, height: 56 }}>
      <div style={{ ...knob, left: -8 }} />
      <div style={{ ...knob, right: -8 }} />
      <div style={{ position: 'absolute', left: 18, right: 18, top: 0, bottom: 0, borderRadius: 28, background: shade, boxShadow: `0 10px 24px ${theme.light ? 'rgba(60,40,10,0.25)' : 'rgba(0,0,0,0.5)'}` }} />
      <div style={{ position: 'absolute', left: 40, right: 40, top: 15, height: 1, background: 'rgba(255,255,255,0.45)' }} />
    </div>
  )
}

export const ScrollLayout: React.FC<LayoutProps> = (p) => {
  const { width, height, theme } = p
  const square = p.format === 'square'
  const top = storyInset(p.format, 230, square ? 62 : 80)
  const bottom = height - top
  const paper = theme.light
    ? `linear-gradient(90deg, ${theme.accent}26 0, rgba(255,255,255,0.78) 8%, rgba(255,255,255,0.86) 50%, rgba(255,255,255,0.78) 92%, ${theme.accent}26 100%)`
    : `linear-gradient(90deg, rgba(0,0,0,0.3) 0, ${theme.accent}1a 8%, ${theme.accent}24 50%, ${theme.accent}1a 92%, rgba(0,0,0,0.3) 100%)`
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} />
      <div style={{ position: 'absolute', left: 100, right: 100, top, bottom: height - bottom, background: paper, borderLeft: `1px solid ${theme.accent}66`, borderRight: `1px solid ${theme.accent}66`, boxShadow: `0 24px 60px ${theme.light ? 'rgba(60,40,10,0.18)' : 'rgba(0,0,0,0.45)'}` }} />
      <div style={{ position: 'absolute', left: 128, right: 128, top: top + 44, bottom: height - bottom + 44, border: `1px solid ${theme.accent}55` }} />
      <Roll y={top} theme={theme} width={width} />
      <Roll y={bottom} theme={theme} width={width} />
      <div style={column(`${top + (square ? 80 : 110)}px 150px ${height - bottom + (square ? 72 : 96)}px`, square ? 22 : 30)}>
        <CardHeader content={p.content} theme={theme} logoSrc={p.logoSrc} />
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={theme} />
      </div>
    </>
  )
}
