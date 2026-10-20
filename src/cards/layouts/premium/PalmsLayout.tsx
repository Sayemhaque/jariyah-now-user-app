import React from 'react'
import { polar } from '@/lib/cards/shapes'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, tint, type LayoutProps } from '../layoutTypes'

const fronds = [-150, -118, -86, -54, -22, 12, 40]

function Palm({ x, base, height, flip, color }: { x: number; base: number; height: number; flip: boolean; color: string }) {
  const lean = flip ? -40 : 40
  const [tx, ty] = [x + lean, base - height]
  return (
    <g fill={color}>
      <path d={`M${x - 10} ${base} Q${x + lean * 0.2 - 6} ${base - height * 0.5} ${tx - 4} ${ty} L${tx + 4} ${ty} Q${x + lean * 0.2 + 6} ${base - height * 0.5} ${x + 10} ${base} Z`} />
      {fronds.map((a, i) => {
        const angle = ((flip ? 180 - a : a) * Math.PI) / 180
        const len = 128 - Math.abs(i - 3) * 9
        const [ex, ey] = polar(tx, ty + 40, len, angle)
        const [mx, my] = polar(tx, ty - 30, len * 0.5, angle)
        return <path key={a} d={`M${tx} ${ty} Q${mx} ${my - 14} ${ex} ${ey} Q${mx} ${my + 12} ${tx} ${ty} Z`} opacity="0.9" />
      })}
      <circle cx={tx - 8} cy={ty + 10} r="7" />
      <circle cx={tx + 6} cy={ty + 14} r="7" />
    </g>
  )
}

export const PalmsLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const height = pick(p.format, 480, 380, 640)
  const color = tint(t.accent, t.light ? 0.4 : 0.32)
  return (
    <OrnamentLayout
      {...p}
      padding={pick(p.format, '110px 200px 120px', '92px 200px 104px', '270px 200px 320px')}
      art={
        <>
          <path d={`M0 ${h - 70} Q${w * 0.3} ${h - 130} ${w * 0.55} ${h - 80} T${w} ${h - 90} V${h} H0 Z`} fill={tint(t.accent, 0.16)} />
          <Palm x={56} base={h - 70} height={height} flip={false} color={color} />
          <Palm x={w - 56} base={h - 76} height={height * 0.86} flip color={color} />
        </>
      }
    />
  )
}
