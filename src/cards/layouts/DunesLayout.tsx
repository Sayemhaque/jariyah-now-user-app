import React from 'react'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bodyProps, column, storyInset, type LayoutProps } from './layoutTypes'

function crest(w: number, y: number, d: number, flip: boolean): string {
  const x = (f: number) => (flip ? w * (1 - f) : w * f)
  return `M${x(0)} ${y + d * 0.28} C${x(0.22)} ${y - d * 0.04} ${x(0.4)} ${y + d * 0.04} ${x(0.58)} ${y + d * 0.3} S${x(0.86)} ${y + d * 0.02} ${x(1)} ${y + d * 0.14}`
}

export const DunesLayout: React.FC<LayoutProps> = (p) => {
  const { theme, width, height } = p
  const square = p.format === 'square'
  const d = storyInset(p.format, 420, square ? 170 : 240)
  const layers = [0, 0.3, 0.56].map((f, i) => ({ y: height - d + d * f, flip: i === 1, opacity: [0.14, 0.24, 0.4][i] }))
  const front = layers[2]
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} pattern={false} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: d * 1.8, background: `linear-gradient(to top, ${theme.accent}${theme.light ? '1c' : '24'}, transparent)` }} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        {layers.map((l, i) => (
          <path key={i} d={`${crest(width, l.y, d * 0.6, l.flip)} V${height} H${l.flip ? width : 0} Z`} fill={theme.accent} opacity={l.opacity} />
        ))}
        <path d={crest(width, front.y, d * 0.6, false)} fill="none" stroke={theme.accent} strokeWidth="1.6" opacity="0.85" />
        <path d={crest(width, layers[1].y, d * 0.6, true)} fill="none" stroke={theme.accent} strokeWidth="1" opacity="0.45" />
      </svg>
      <div style={column(`${storyInset(p.format, 250, square ? 84 : 104)}px 140px ${d + (square ? 24 : 36)}px`, square ? 22 : 30)}>
        <CardHeader content={p.content} theme={theme} logoSrc={p.logoSrc} />
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={theme} />
      </div>
    </>
  )
}
