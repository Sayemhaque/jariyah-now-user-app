import React from 'react'
import { scatter } from '@/lib/cards/shapes'
import { useSvgId } from '../../useSvgId'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

export const SpotlightLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const svgId = useSvgId('spot')
  const cx = w / 2
  const floor = h * 0.88
  const dust = scatter(3, 36, cx - 260, 80, 520, floor - 160).filter((d) => Math.abs(d.x - cx) < 60 + (d.y / floor) * 300)
  return (
    <OrnamentLayout
      {...p}
      pattern={false}
      padding={pick(p.format, '130px 150px 120px', '104px 150px 96px', '290px 150px 310px')}
      art={
        <>
          <defs>
            <linearGradient id={svgId('beam')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={t.accent} stopOpacity={t.light ? 0.4 : 0.34} />
              <stop offset="1" stopColor={t.accent} stopOpacity="0" />
            </linearGradient>
            <radialGradient id={svgId('pool')}>
              <stop offset="0" stopColor={t.accent} stopOpacity="0.36" />
              <stop offset="1" stopColor={t.accent} stopOpacity="0" />
            </radialGradient>
            <filter id={svgId('soft')} x="-30%" y="-10%" width="160%" height="120%"><feGaussianBlur stdDeviation="22" /></filter>
          </defs>
          <path d={`M${cx - 70} -10 H${cx + 70} L${cx + 440} ${floor} H${cx - 440} Z`} fill={`url(#${svgId('beam')})`} filter={`url(#${svgId('soft')})`} />
          <ellipse cx={cx} cy={floor} rx="420" ry="56" fill={`url(#${svgId('pool')})`} />
          {dust.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r * 0.8} fill={t.accent} opacity={d.o * 0.6} />)}
          <rect x={cx - 60} y="0" width="120" height="16" rx="4" fill={t.accent} opacity="0.85" />
        </>
      }
    />
  )
}
