import React from 'react'
import { scatter } from '@/lib/cards/shapes'
import { useSvgId } from '../../useSvgId'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

export const RainLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const svgId = useSvgId('rain')
  const drops = scatter(27, 70, 0, -60, w, h * 0.9)
  return (
    <OrnamentLayout
      {...p}
      pattern={false}
      padding={pick(p.format, '120px 150px 112px', '100px 150px 92px', '280px 150px 300px')}
      art={
        <>
          <defs>
            <linearGradient id={svgId('fade')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="white" />
              <stop offset="0.75" stopColor="black" />
            </linearGradient>
            <mask id={svgId('mask')}><rect width={w} height={h} fill={`url(#${svgId('fade')})`} /></mask>
          </defs>
          <g mask={`url(#${svgId('mask')})`} stroke={t.accent} strokeLinecap="round">
            {drops.map((d, i) => (
              <g key={i} opacity={d.o * 0.5}>
                <line x1={d.x} y1={d.y} x2={d.x} y2={d.y + 30 + d.r * 30} strokeWidth={0.6 + d.r * 0.3} />
                <path d={`M${d.x} ${d.y + 34 + d.r * 30} q-4 7 0 9 q4 -2 0 -9 Z`} fill={t.accent} strokeWidth="0.6" />
              </g>
            ))}
          </g>
          <rect x="60" y="60" width={w - 120} height={h - 120} rx="8" fill="none" stroke={t.accent} strokeWidth="0.8" opacity="0.4" />
        </>
      }
    />
  )
}
