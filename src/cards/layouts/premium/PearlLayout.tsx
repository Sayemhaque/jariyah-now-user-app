import React from 'react'
import { perimeterPoints } from '@/lib/cards/shapes'
import { useSvgId } from '../../useSvgId'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

export const PearlLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const svgId = useSvgId('pearl')
  const [mx, my] = [pick(p.format, 60, 50, 60), pick(p.format, 60, 50, 210)]
  const pearls = perimeterPoints(mx, my, w - 2 * mx, h - 2 * my, 26)
  const corners = [[mx, my], [w - mx, my], [mx, h - my], [w - mx, h - my]]
  const fill = `url(#${svgId('shine')})`
  return (
    <OrnamentLayout
      {...p}
      padding={`${my + pick(p.format, 64, 46, 80)}px 156px ${my + pick(p.format, 56, 40, 70)}px`}
      gap={pick(p.format, 26, 18, 34)}
      art={
        <>
          <defs>
            <radialGradient id={svgId('shine')} cx="0.35" cy="0.3" r="0.8">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.45" stopColor={t.accent} stopOpacity="0.9" />
              <stop offset="1" stopColor={t.accent} stopOpacity="0.55" />
            </radialGradient>
          </defs>
          <rect x={mx + 20} y={my + 20} width={w - 2 * mx - 40} height={h - 2 * my - 40} fill="none" stroke={t.accent} strokeWidth="0.9" opacity="0.6" />
          {pearls.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="7" fill={fill} />)}
          {corners.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="15" fill={fill} stroke={t.accent} strokeWidth="1" />)}
        </>
      }
    />
  )
}
