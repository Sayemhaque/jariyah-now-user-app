import React from 'react'
import { useSvgId } from '../../useSvgId'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

export const AuroraLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const svgId = useSvgId('aurora')
  const [mx, my] = [pick(p.format, 60, 50, 70), pick(p.format, 60, 50, 200)]
  const bands = [
    { d: `M-100 ${h * 0.22} C${w * 0.3} ${h * 0.02} ${w * 0.6} ${h * 0.4} ${w + 100} ${h * 0.12}`, color: t.accent, o: 0.42 },
    { d: `M-100 ${h * 0.7} C${w * 0.25} ${h * 0.5} ${w * 0.7} ${h * 0.95} ${w + 100} ${h * 0.66}`, color: t.arabic, o: 0.3 },
    { d: `M-100 ${h * 0.95} C${w * 0.4} ${h * 0.8} ${w * 0.7} ${h * 1.05} ${w + 100} ${h * 0.86}`, color: t.accent, o: 0.3 },
  ]
  return (
    <OrnamentLayout
      {...p}
      pattern={false}
      padding={`${my + pick(p.format, 70, 50, 90)}px 150px ${my + pick(p.format, 60, 44, 80)}px`}
      art={
        <>
          <defs><filter id={svgId('blur')} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="60" /></filter></defs>
          <g filter={`url(#${svgId('blur')})`}>
            {bands.map((b, i) => <path key={i} d={b.d} fill="none" stroke={b.color} strokeWidth="190" opacity={b.o} strokeLinecap="round" />)}
          </g>
          <rect x={mx} y={my} width={w - 2 * mx} height={h - 2 * my} rx="40" fill="none" stroke={t.accent} strokeWidth="1.2" opacity="0.6" />
        </>
      }
    />
  )
}
