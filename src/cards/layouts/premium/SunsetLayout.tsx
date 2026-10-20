import React from 'react'
import { useSvgId } from '../../useSvgId'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

export const SunsetLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const svgId = useSvgId('sunset')
  const r = pick(p.format, 400, 340, 460)
  const cy = h - pick(p.format, 20, 10, 160)
  const bars = Array.from({ length: 7 }, (_, i) => ({ y: cy - r * 0.62 + i * 34, height: 4 + i * 2.6 }))
  return (
    <OrnamentLayout
      {...p}
      padding={pick(p.format, '116px 150px 130px', '96px 150px 108px', '276px 150px 320px')}
      art={
        <>
          <defs>
            <linearGradient id={svgId('sun')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={t.accent} stopOpacity="0.62" />
              <stop offset="1" stopColor={t.arabic} stopOpacity="0.18" />
            </linearGradient>
            <mask id={svgId('cut')}>
              <rect width={w} height={h} fill="white" />
              {bars.map((b) => <rect key={b.y} x="0" y={b.y} width={w} height={b.height} fill="black" />)}
            </mask>
          </defs>
          <circle cx={w / 2} cy={cy} r={r} fill={`url(#${svgId('sun')})`} mask={`url(#${svgId('cut')})`} opacity={t.light ? 0.55 : 0.5} />
          <line x1="60" y1={cy} x2={w - 60} y2={cy} stroke={t.accent} strokeWidth="1.4" opacity="0.7" />
          <rect x="0" y={cy} width={w} height={h - cy} fill={t.accent} opacity="0.08" />
        </>
      }
    />
  )
}
