import React from 'react'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

function Target({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g stroke={color} fill="none" strokeWidth="1">
      <circle cx={x} cy={y} r="10" />
      <circle cx={x} cy={y} r="4" fill={color} />
      <path d={`M${x - 18} ${y} H${x + 18} M${x} ${y - 18} V${y + 18}`} />
    </g>
  )
}

export const CropmarksLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const [mx, my] = [pick(p.format, 82, 70, 82), pick(p.format, 82, 70, 230)]
  const [l, r, top, b] = [mx, w - mx, my, h - my]
  const len = 46
  const marks = `M${l - 14} ${top} h${-len} M${l} ${top - 14} v${-len} M${r + 14} ${top} h${len} M${r} ${top - 14} v${-len} M${l - 14} ${b} h${-len} M${l} ${b + 14} v${len} M${r + 14} ${b} h${len} M${r} ${b + 14} v${len}`
  return (
    <OrnamentLayout
      {...p}
      pattern={false}
      vignette={false}
      padding={`${top + pick(p.format, 40, 28, 60)}px 150px ${h - b + pick(p.format, 36, 26, 56)}px`}
      gap={pick(p.format, 30, 22, 38)}
      art={
        <>
          <path d={marks} stroke={t.accent} strokeWidth="1.4" />
          <rect x={l} y={top} width={r - l} height={b - top} fill="none" stroke={t.accent} strokeWidth="0.6" opacity="0.35" />
          <Target x={w / 2} y={top / 2} color={t.accent} />
          <Target x={w / 2} y={h - (h - b) / 2} color={t.accent} />
        </>
      }
    />
  )
}
