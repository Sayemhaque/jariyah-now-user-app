import React from 'react'
import { pointedArchPath, starPath } from '@/lib/cards/shapes'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, tint, type LayoutProps } from '../layoutTypes'

export const IwanLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const [mx, my] = [pick(p.format, 50, 40, 50), pick(p.format, 50, 40, 190)]
  const band = 30
  const [l, r, top, bottom] = [mx + band, w - mx - band, my + band, h - my - band]
  const apex = top + 44
  const shoulder = apex + pick(p.format, 280, 200, 320)
  const arch = pointedArchPath(l + 46, r - 46, apex, shoulder, bottom)
  return (
    <OrnamentLayout
      {...p}
      padding={`${apex + pick(p.format, 180, 120, 240)}px 160px ${h - bottom + pick(p.format, 52, 36, 76)}px`}
      gap={pick(p.format, 26, 18, 34)}
      art={
        <>
          <path d={`M${mx} ${my} H${w - mx} V${h - my} H${mx} Z M${l} ${top} V${bottom} H${r} V${top} Z`} fill={tint(t.accent, t.light ? 0.2 : 0.14)} fillRule="evenodd" stroke={t.accent} strokeWidth="1.8" />
          <rect x={mx + band / 2} y={my + band / 2} width={w - 2 * mx - band} height={h - 2 * my - band} fill="none" stroke={t.accent} strokeWidth="0.8" strokeDasharray="10 6" opacity="0.7" />
          <path d={`M${l} ${top} H${r} V${bottom} H${l} Z ${arch}`} fill={tint(t.accent, t.light ? 0.12 : 0.09)} fillRule="evenodd" />
          <path d={arch} fill="none" stroke={t.accent} strokeWidth="2.2" />
          <path d={pointedArchPath(l + 62, r - 62, apex + 20, shoulder + 8, bottom)} fill="none" stroke={t.accent} strokeWidth="0.8" opacity="0.6" />
          {[l + 64, r - 64].map((x) => <path key={x} d={starPath(x, top + 64, 8, 26, 12)} fill={t.accent} opacity="0.85" />)}
        </>
      }
    />
  )
}
