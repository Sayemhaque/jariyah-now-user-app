import React from 'react'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

function Tulip({ transform, color }: { transform: string; color: string }) {
  return (
    <g transform={transform} stroke={color} strokeWidth="1.4" strokeLinejoin="round">
      <path d="M0 0 C40 30 80 60 120 120" fill="none" strokeWidth="2.2" />
      <path d="M30 22 C10 70 30 120 70 140 C60 100 56 60 30 22 Z" fill={color} fillOpacity="0.35" />
      <path d="M50 34 C100 30 140 50 160 86 C120 84 84 70 50 34 Z" fill={color} fillOpacity="0.35" />
      <g transform="translate(120 120) rotate(-45)">
        <path d="M0 0 C-30 -10 -34 -50 -22 -84 C-12 -60 -6 -40 0 -30 C6 -40 12 -60 22 -84 C34 -50 30 -10 0 0 Z" fill={color} fillOpacity="0.7" />
        <path d="M0 -30 C-6 -56 -4 -80 0 -100 C4 -80 6 -56 0 -30 Z" fill={color} />
      </g>
    </g>
  )
}

export const TulipLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const s = pick(p.format, 1, 0.82, 1.1)
  const m = 26
  return (
    <OrnamentLayout
      {...p}
      padding={pick(p.format, '120px 160px 112px', '100px 160px 92px', '280px 160px 300px')}
      art={
        <g opacity="0.8">
          <Tulip transform={`translate(${m} ${m}) scale(${s})`} color={t.accent} />
          <Tulip transform={`translate(${w - m} ${m}) scale(${-s} ${s})`} color={t.accent} />
          <Tulip transform={`translate(${m} ${h - m}) scale(${s} ${-s})`} color={t.accent} />
          <Tulip transform={`translate(${w - m} ${h - m}) scale(${-s} ${-s})`} color={t.accent} />
        </g>
      }
    />
  )
}
