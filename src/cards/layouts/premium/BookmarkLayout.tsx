import React from 'react'
import { OrnamentLayout } from '../OrnamentLayout'
import { panelFill, pick, tint, type LayoutProps } from '../layoutTypes'

export const BookmarkLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const [x0, x1] = [84, w - 100]
  const [top, bottom] = [pick(p.format, 70, 56, 230), h - pick(p.format, 84, 70, 250)]
  const rx = x1 - 150
  const page = (dx: number, dy: number, o: number) => <rect x={x0 + dx} y={top + dy} width={x1 - x0} height={bottom - top} rx="10" fill={tint(t.accent, o)} stroke={t.accent} strokeWidth="0.8" opacity="0.8" />
  return (
    <OrnamentLayout
      {...p}
      padding={`${top + pick(p.format, 120, 96, 140)}px ${w - x1 + 70}px ${h - bottom + 60}px ${x0 + 70}px`}
      gap={pick(p.format, 28, 20, 34)}
      art={
        <>
          {page(16, 16, 0.1)}
          {page(8, 8, 0.14)}
          <rect x={x0} y={top} width={x1 - x0} height={bottom - top} rx="10" fill={panelFill(t)} stroke={t.accent} strokeWidth="1.4" />
          <rect x={x0 + 22} y={top + 22} width={x1 - x0 - 44} height={bottom - top - 44} rx="4" fill="none" stroke={t.accent} strokeWidth="0.7" opacity="0.5" />
          <path d={`M${rx} ${top - 18} H${rx + 60} V${top + 100} L${rx + 30} ${top + 76} L${rx} ${top + 100} Z`} fill={t.accent} />
          <path d={`M${rx + 8} ${top - 18} V${top + 86} M${rx + 52} ${top - 18} V${top + 86}`} stroke={t.light ? '#fffaf0' : '#1a1206'} strokeWidth="1" strokeDasharray="3 4" opacity="0.6" />
        </>
      }
    />
  )
}
