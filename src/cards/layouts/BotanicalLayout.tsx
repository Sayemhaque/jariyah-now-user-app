import React from 'react'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { Vine } from './Vine'
import { bodyProps, column, storyInset, type LayoutProps } from './layoutTypes'

export const BotanicalLayout: React.FC<LayoutProps> = (p) => {
  const { theme, width, height } = p
  const leaf = theme.light ? theme.arabic : theme.accent
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} pattern={false} />
      <div style={{ position: 'absolute', inset: 64, borderRadius: 80, border: `1.4px solid ${theme.accent}`, opacity: 0.6 }} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <Vine color={leaf} x={0} y={0} scale={1} />
        <Vine color={leaf} x={width} y={height} scale={-1} />
      </svg>
      <div style={column(`${storyInset(p.format, 260, 130)}px 140px ${storyInset(p.format, 300, 120)}px`, 30)}>
        <CardHeader content={p.content} theme={theme} logoSrc={p.logoSrc} />
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={theme} />
      </div>
    </>
  )
}
