import React from 'react'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { NightSkyline, StarField } from './NightShapes'
import { bodyProps, column, storyInset, type LayoutProps } from './layoutTypes'

export const NightLayout: React.FC<LayoutProps> = (p) => {
  const { theme, width, height } = p
  const skyline = height * 0.2
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} pattern={false} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <StarField width={width} height={height * 0.5} color={theme.light ? theme.accent : theme.ink} />
        <NightSkyline width={width} height={height} skyline={skyline} color={theme.light ? theme.arabic : '#000000'} opacity={theme.light ? 0.14 : 0.42} accent={theme.accent} />
      </svg>
      <div style={column(`${storyInset(p.format, 250, 110)}px 130px ${skyline + storyInset(p.format, 120, 20)}px`, 30)}>
        <CardHeader content={p.content} theme={theme} logoSrc={p.logoSrc} />
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={theme} />
      </div>
    </>
  )
}
