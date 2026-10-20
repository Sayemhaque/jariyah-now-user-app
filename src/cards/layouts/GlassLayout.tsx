import React from 'react'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardGrain } from '../CardGrain'
import { CardHeader } from '../CardHeader'
import { bodyProps, column, storyInset, type LayoutProps } from './layoutTypes'

export const GlassLayout: React.FC<LayoutProps> = (p) => {
  const { theme, width, height } = p
  const blobs = `radial-gradient(circle at 12% 14%, ${theme.accent}88 0, transparent 34%), radial-gradient(circle at 92% 30%, ${theme.arabic}66 0, transparent 38%), radial-gradient(circle at 30% 96%, ${theme.accent}66 0, transparent 36%)`
  const inset = storyInset(p.format, 220, 80)
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: theme.background }} />
      <div style={{ position: 'absolute', inset: 0, background: blobs }} />
      <CardGrain width={width} height={height} opacity={theme.grain} light={theme.light} />
      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          top: inset,
          bottom: inset,
          borderRadius: 48,
          background: theme.light ? 'linear-gradient(160deg, rgba(255,255,255,0.72), rgba(255,255,255,0.42))' : 'linear-gradient(160deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))',
          border: `1.5px solid ${theme.light ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.22)'}`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.5), 0 30px 80px ${theme.light ? 'rgba(40, 30, 20, 0.16)' : 'rgba(0, 0, 0, 0.4)'}`,
        }}
      />
      <div style={column(`${inset + 70}px 140px ${inset + 60}px`, 30)}>
        <CardHeader content={p.content} theme={theme} logoSrc={p.logoSrc} />
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={theme} />
      </div>
    </>
  )
}
