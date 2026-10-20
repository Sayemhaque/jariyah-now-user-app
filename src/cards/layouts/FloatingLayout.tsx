import React from 'react'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bodyProps, column, storyInset, type LayoutProps } from './layoutTypes'

export const FloatingLayout: React.FC<LayoutProps> = (p) => {
  const { theme, width, height } = p
  const square = p.format === 'square'
  const top = square ? 150 : storyInset(p.format, 330, 200)
  const bottom = square ? 60 : storyInset(p.format, 260, 90)
  const panel = theme.light ? 'linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,253,248,0.86))' : 'linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04))'
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} />
      <img src={p.logoSrc} alt="" style={{ position: 'absolute', left: '50%', top: top - (square ? 124 : 150), height: square ? 84 : 100, transform: 'translateX(-50%)', filter: theme.light ? 'brightness(0)' : 'none', opacity: theme.light ? 0.78 : 0.95 }} />
      <div
        style={{
          position: 'absolute',
          left: 84,
          right: 84,
          top,
          bottom,
          borderRadius: 44,
          background: panel,
          border: `1.5px solid ${theme.accent}55`,
          boxShadow: theme.light ? '0 40px 90px rgba(60, 40, 10, 0.18)' : '0 40px 90px rgba(0, 0, 0, 0.45)',
        }}
      />
      <div style={column(`${top + (square ? 44 : 64)}px 130px ${bottom + (square ? 40 : 56)}px`, square ? 22 : 30)}>
        <CardHeader content={p.content} theme={theme} />
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={theme} />
      </div>
    </>
  )
}
