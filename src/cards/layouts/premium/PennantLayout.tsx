import React from 'react'
import { useSvgId } from '../../useSvgId'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

export const PennantLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const svgId = useSvgId('pennant')
  const rod = pick(p.format, 54, 44, 210)
  const [x0, x1, top] = [116, w - 116, rod + 12]
  const bottom = h - pick(p.format, 40, 30, 200)
  const notch = pick(p.format, 100, 80, 120)
  const banner = (i: number) => `M${x0 + i} ${top + i * 0.5} H${x1 - i} V${bottom - i * 1.4} L${w / 2} ${bottom - notch - i * 0.6} L${x0 + i} ${bottom - i * 1.4} Z`
  return (
    <OrnamentLayout
      {...p}
      padding={`${top + pick(p.format, 70, 52, 90)}px 170px ${h - bottom + notch + 30}px`}
      gap={pick(p.format, 26, 18, 34)}
      art={
        <>
          <defs>
            <linearGradient id={svgId('g')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={t.accent} stopOpacity={t.light ? 0.24 : 0.2} />
              <stop offset="1" stopColor={t.accent} stopOpacity="0.04" />
            </linearGradient>
          </defs>
          <path d={banner(0)} fill={`url(#${svgId('g')})`} stroke={t.accent} strokeWidth="2" strokeLinejoin="round" />
          <path d={banner(16)} fill="none" stroke={t.accent} strokeWidth="0.8" opacity="0.7" strokeLinejoin="round" />
          <rect x={x0 - 44} y={rod - 5} width={x1 - x0 + 88} height="10" rx="5" fill={t.accent} />
          {[x0 - 50, x1 + 50].map((x) => <circle key={x} cx={x} cy={rod} r="12" fill={t.accent} />)}
          {[x0, x1].map((x) => (
            <g key={x} stroke={t.accent} fill={t.accent}>
              <line x1={x} y1={bottom} x2={x} y2={bottom + 24} strokeWidth="1.4" />
              <path d={`M${x - 7} ${bottom + 24} h14 l-3 18 h-8 Z`} />
            </g>
          ))}
        </>
      }
    />
  )
}
