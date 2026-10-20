import React from 'react'
import { scatter } from '@/lib/cards/shapes'
import { useSvgId } from '../../useSvgId'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

export const WatercolorLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const svgId = useSvgId('wash')
  const splash = [...scatter(41, 14, 40, 40, 380, 300), ...scatter(43, 14, w - 420, h - 360, 380, 320)]
  return (
    <OrnamentLayout
      {...p}
      pattern={false}
      padding={pick(p.format, '120px 150px 112px', '100px 150px 92px', '280px 150px 300px')}
      art={
        <>
          <defs><filter id={svgId('blur')} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="46" /></filter></defs>
          <g filter={`url(#${svgId('blur')})`}>
            <ellipse cx={w * 0.12} cy={h * 0.1} rx="330" ry="250" fill={t.accent} opacity={t.light ? 0.42 : 0.34} />
            <ellipse cx={w * 0.9} cy={h * 0.9} rx="360" ry="280" fill={t.arabic} opacity={t.light ? 0.32 : 0.3} />
            <ellipse cx={w * 0.96} cy={h * 0.36} rx="160" ry="200" fill={t.accent} opacity="0.2" />
          </g>
          {splash.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r * 1.6} fill={i % 2 ? t.arabic : t.accent} opacity={s.o * 0.5} />)}
        </>
      }
    />
  )
}
