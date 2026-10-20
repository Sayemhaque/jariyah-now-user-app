import React from 'react'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bodyProps, column, storyInset, type LayoutProps } from './layoutTypes'

const Corner: React.FC<{ a: number; t: number; color: string; flip?: [number, number] }> = ({ a, t, color, flip }) => {
  const pt = (x: number, y: number) => (flip ? `${flip[0] - x},${flip[1] - y}` : `${x},${y}`)
  const line = a + t + 20
  return (
    <>
      <polygon points={`${pt(0, 0)} ${pt(a, 0)} ${pt(0, a)}`} fill={color} opacity="0.12" />
      <polygon points={`${pt(0, a)} ${pt(a, 0)} ${pt(a + t, 0)} ${pt(0, a + t)}`} fill={color} opacity="0.88" />
      <polygon points={`${pt(0, line)} ${pt(line, 0)} ${pt(line + 1.6, 0)} ${pt(0, line + 1.6)}`} fill={color} opacity="0.7" />
      <polygon points={`${pt(0, line + 12)} ${pt(line + 12, 0)} ${pt(line + 12.8, 0)} ${pt(0, line + 12.8)}`} fill={color} opacity="0.35" />
    </>
  )
}

export const AngleLayout: React.FC<LayoutProps> = (p) => {
  const { theme, width, height } = p
  const square = p.format === 'square'
  const [a, t] = [storyInset(p.format, 110, square ? 56 : 70), storyInset(p.format, 120, square ? 76 : 90)]
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <Corner a={a} t={t} color={theme.accent} />
        <Corner a={a} t={t} color={theme.accent} flip={[width, height]} />
      </svg>
      <div style={column(`${storyInset(p.format, 260, square ? 100 : 120)}px 140px ${storyInset(p.format, 280, square ? 92 : 110)}px`, square ? 22 : 30)}>
        <CardHeader content={p.content} theme={theme} logoSrc={p.logoSrc} />
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={theme} />
      </div>
    </>
  )
}
