import React from 'react'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, tint, type LayoutProps } from '../layoutTypes'

function Bow({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g fill={color} stroke={color} strokeWidth="1.2">
      <path d={`M${x} ${y} C${x - 30} ${y - 40} ${x - 76} ${y - 26} ${x - 66} ${y + 4} C${x - 58} ${y + 26} ${x - 24} ${y + 16} ${x} ${y} Z`} fillOpacity="0.55" />
      <path d={`M${x} ${y} C${x + 30} ${y - 40} ${x + 76} ${y - 26} ${x + 66} ${y + 4} C${x + 58} ${y + 26} ${x + 24} ${y + 16} ${x} ${y} Z`} fillOpacity="0.55" />
      <path d={`M${x - 6} ${y + 6} L${x - 34} ${y + 58} L${x - 22} ${y + 54} L${x - 18} ${y + 66} L${x + 2} ${y + 10} Z`} fillOpacity="0.8" />
      <path d={`M${x + 6} ${y + 6} L${x + 34} ${y + 58} L${x + 22} ${y + 54} L${x + 18} ${y + 66} L${x - 2} ${y + 10} Z`} fillOpacity="0.8" />
      <rect x={x - 12} y={y - 12} width="24" height="24" rx="6" />
    </g>
  )
}

export const RibbonframeLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const [mx, my] = [pick(p.format, 52, 44, 52), pick(p.format, 52, 44, 200)]
  const band = 24
  const fold = (x: number, y: number, dx: number, dy: number) => <path d={`M${x} ${y} l${dx * band} 0 l${-dx * band} ${dy * band} Z`} fill={t.accent} opacity="0.7" />
  return (
    <OrnamentLayout
      {...p}
      padding={`${my + pick(p.format, 120, 96, 120)}px 160px ${my + pick(p.format, 64, 48, 80)}px`}
      gap={pick(p.format, 26, 18, 34)}
      art={
        <>
          <path d={`M${mx} ${my} H${w - mx} V${h - my} H${mx} Z M${mx + band} ${my + band} V${h - my - band} H${w - mx - band} V${my + band} Z`} fill={tint(t.accent, t.light ? 0.26 : 0.2)} fillRule="evenodd" stroke={t.accent} strokeWidth="1.2" />
          <rect x={mx + 5} y={my + 5} width={w - 2 * mx - 10} height={h - 2 * my - 10} fill="none" stroke={t.accent} strokeWidth="0.7" strokeDasharray="4 4" opacity="0.7" />
          {fold(mx, my, 1, 1)}
          {fold(w - mx, my, -1, 1)}
          {fold(mx, h - my, 1, -1)}
          {fold(w - mx, h - my, -1, -1)}
          <Bow x={w / 2} y={my + band / 2} color={t.accent} />
        </>
      }
    />
  )
}
