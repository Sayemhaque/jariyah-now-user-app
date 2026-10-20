import React from 'react'
import { polar } from '@/lib/cards/shapes'
import { useSvgId } from '../../useSvgId'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

export const EclipseLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const svgId = useSvgId('eclipse')
  const [cx, cy] = [w / 2, h * 0.46]
  const r = pick(p.format, 360, 320, 400)
  const bead = polar(cx, cy, r, -0.5)
  return (
    <OrnamentLayout
      {...p}
      pattern={false}
      padding={pick(p.format, '120px 150px 112px', '100px 150px 92px', '280px 150px 300px')}
      art={
        <>
          <defs>
            <radialGradient id={svgId('corona')}>
              <stop offset="0.62" stopColor={t.accent} stopOpacity={t.light ? 0.45 : 0.5} />
              <stop offset="1" stopColor={t.accent} stopOpacity="0" />
            </radialGradient>
            <filter id={svgId('blur')} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" /></filter>
          </defs>
          <circle cx={cx} cy={cy} r={r * 1.6} fill={`url(#${svgId('corona')})`} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={t.accent} strokeWidth="10" opacity="0.5" filter={`url(#${svgId('blur')})`} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={t.accent} strokeWidth="2.2" />
          <circle cx={bead[0]} cy={bead[1]} r="18" fill={t.accent} opacity="0.4" filter={`url(#${svgId('blur')})`} />
          <circle cx={bead[0]} cy={bead[1]} r="4.5" fill={t.light ? '#fffaf0' : '#fff6dc'} />
        </>
      }
    />
  )
}
