import React from 'react'
import { useSvgId } from '../../useSvgId'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, tint, type LayoutProps } from '../layoutTypes'

const tablet = (left: number, right: number, top: number, bottom: number, crown: number) =>
  `M${left} ${bottom} V${top + crown} A${(right - left) / 2} ${crown} 0 0 1 ${right} ${top + crown} V${bottom} Z`

export const TabletLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const svgId = useSvgId('tablet')
  const [x0, x1] = [110, w - 110]
  const top = pick(p.format, 50, 40, 220)
  const bottom = h - pick(p.format, 96, 80, 270)
  const crown = pick(p.format, 200, 150, 220)
  return (
    <OrnamentLayout
      {...p}
      padding={`${top + crown * 0.62}px 170px ${h - bottom + 50}px`}
      gap={pick(p.format, 26, 18, 34)}
      art={
        <>
          <defs>
            <linearGradient id={svgId('stone')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity={t.light ? 0.75 : 0.14} />
              <stop offset="1" stopColor="#ffffff" stopOpacity={t.light ? 0.4 : 0.03} />
            </linearGradient>
            <filter id={svgId('shadow')} x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="24" stdDeviation="26" floodColor="#000" floodOpacity={t.light ? 0.16 : 0.45} /></filter>
          </defs>
          <path d={tablet(x0, x1, top, bottom, crown)} fill={`url(#${svgId('stone')})`} stroke={t.accent} strokeWidth="1.8" filter={`url(#${svgId('shadow')})`} />
          <path d={tablet(x0 + 20, x1 - 20, top + 20, bottom - 20, crown - 20)} fill="none" stroke={t.accent} strokeWidth="0.9" opacity="0.7" />
          <rect x={x0 - 36} y={bottom} width={x1 - x0 + 72} height="22" fill={tint(t.accent, 0.3)} stroke={t.accent} strokeWidth="1.4" />
          <rect x={x0 - 64} y={bottom + 22} width={x1 - x0 + 128} height="22" fill={tint(t.accent, 0.18)} stroke={t.accent} strokeWidth="1.4" />
        </>
      }
    />
  )
}
