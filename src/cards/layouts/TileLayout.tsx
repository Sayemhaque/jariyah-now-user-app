import React from 'react'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bandTheme, bodyProps, column, storyInset, type LayoutProps } from './layoutTypes'

const tile = 'M24 4 L29 19 L44 24 L29 29 L24 44 L19 29 L4 24 L19 19 Z'

export const TileLayout: React.FC<LayoutProps> = (p) => {
  const { theme, width, height } = p
  const id = React.useId().replace(/:/g, '')
  const band = bandTheme(theme)
  const [o, i] = [36, 100]
  const ring = `M${o} ${o} H${width - o} V${height - o} H${o} Z M${i} ${i} V${height - i} H${width - i} V${i} Z`
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} pattern={false} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id={`tile${id}`} width="48" height="48" patternUnits="userSpaceOnUse">
            <path d={tile} fill="none" stroke={band.accent} strokeWidth="1.6" />
            <circle cx="0" cy="0" r="4" fill={band.accent} />
            <circle cx="48" cy="48" r="4" fill={band.accent} />
          </pattern>
        </defs>
        <path d={ring} fill={band.background} fillRule="evenodd" />
        <path d={ring} fill={`url(#tile${id})`} fillRule="evenodd" opacity="0.85" />
        <rect x={o + 8} y={o + 8} width={width - (o + 8) * 2} height={height - (o + 8) * 2} fill="none" stroke={band.accent} strokeWidth="1.2" />
        <rect x={i + 10} y={i + 10} width={width - (i + 10) * 2} height={height - (i + 10) * 2} fill="none" stroke={theme.accent} strokeWidth="1.2" opacity="0.7" />
      </svg>
      <div style={column(`${storyInset(p.format, 260, 150)}px 150px ${storyInset(p.format, 290, 140)}px`, 32)}>
        <CardHeader content={p.content} theme={theme} logoSrc={p.logoSrc} />
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={theme} />
      </div>
    </>
  )
}
