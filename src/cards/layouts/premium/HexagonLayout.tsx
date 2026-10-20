import React from 'react'
import { hexCenters, polygonPath } from '@/lib/cards/shapes'
import { useSvgId } from '../../useSvgId'
import { OrnamentLayout } from '../OrnamentLayout'
import { panelFill, pick, type LayoutProps } from '../layoutTypes'

export const HexagonLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const svgId = useSvgId('hex')
  const cx = w / 2
  const [top, bottom] = [pick(p.format, 50, 40, 220), h - pick(p.format, 50, 40, 220)]
  const k = pick(p.format, 200, 130, 230)
  const hexagon = (i: number) => `M${cx} ${top + i} L${w - 70 - i} ${top + k + i * 0.4} V${bottom - k - i * 0.4} L${cx} ${bottom - i} L${70 + i} ${bottom - k - i * 0.4} V${top + k + i * 0.4} Z`
  return (
    <OrnamentLayout
      {...p}
      pattern={false}
      padding={`${top + k - pick(p.format, 30, 40, 0)}px 170px ${h - bottom + k - pick(p.format, 50, -10, 20)}px`}
      gap={pick(p.format, 26, 18, 34)}
      art={
        <>
          <defs>
            <radialGradient id={svgId('fade')} cx="0.5" cy="0.5" r="0.7">
              <stop offset="0.35" stopColor="black" />
              <stop offset="1" stopColor="white" />
            </radialGradient>
            <mask id={svgId('mask')}><rect width={w} height={h} fill={`url(#${svgId('fade')})`} /></mask>
          </defs>
          <g mask={`url(#${svgId('mask')})`} fill="none" stroke={t.accent} strokeWidth="1" opacity="0.4">
            {hexCenters(w, h, 46).map(([x, y], i) => <path key={i} d={polygonPath(x, y, 6, 42)} />)}
          </g>
          <path d={hexagon(0)} fill={panelFill(t)} stroke={t.accent} strokeWidth="2.4" strokeLinejoin="round" />
          <path d={hexagon(16)} fill="none" stroke={t.accent} strokeWidth="0.9" opacity="0.7" strokeLinejoin="round" />
        </>
      }
    />
  )
}
