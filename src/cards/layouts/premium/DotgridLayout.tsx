import React from 'react'
import { useSvgId } from '../../useSvgId'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

export const DotgridLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const svgId = useSvgId('dots')
  const [mx, my] = [pick(p.format, 70, 58, 76), pick(p.format, 70, 58, 220)]
  const corners = [[mx, my], [w - mx, my], [mx, h - my], [w - mx, h - my]]
  return (
    <OrnamentLayout
      {...p}
      pattern={false}
      padding={`${my + pick(p.format, 50, 34, 70)}px 150px ${my + pick(p.format, 44, 30, 60)}px`}
      art={
        <>
          <defs>
            <pattern id={svgId('grid')} width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="14" cy="14" r="1.7" fill={t.accent} /></pattern>
            <radialGradient id={svgId('fade')} cx="0.5" cy="0.5" r="0.75">
              <stop offset="0.3" stopColor="black" />
              <stop offset="1" stopColor="white" />
            </radialGradient>
            <mask id={svgId('mask')}><rect width={w} height={h} fill={`url(#${svgId('fade')})`} /></mask>
          </defs>
          <rect width={w} height={h} fill={`url(#${svgId('grid')})`} mask={`url(#${svgId('mask')})`} opacity="0.6" />
          <rect x={mx} y={my} width={w - 2 * mx} height={h - 2 * my} rx="26" fill="none" stroke={t.accent} strokeWidth="1" opacity="0.65" />
          {corners.map(([x, y], i) => <path key={i} d={`M${x! - 14} ${y} H${x! + 14} M${x} ${y! - 14} V${y! + 14}`} stroke={t.accent} strokeWidth="2" />)}
        </>
      }
    />
  )
}
