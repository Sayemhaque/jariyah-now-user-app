import React from 'react'
import { tornRectPath } from '@/lib/cards/shapes'
import { useSvgId } from '../../useSvgId'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, tint, type LayoutProps } from '../layoutTypes'

export const DeckleLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const svgId = useSvgId('deckle')
  const [x, y] = [86, pick(p.format, 80, 64, 230)]
  const [pw, ph] = [w - 2 * x, h - 2 * y]
  return (
    <OrnamentLayout
      {...p}
      padding={`${y + pick(p.format, 64, 46, 80)}px 156px ${y + pick(p.format, 56, 40, 70)}px`}
      gap={pick(p.format, 26, 18, 34)}
      art={
        <>
          <defs>
            <filter id={svgId('shadow')} x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="14" stdDeviation="18" floodColor="#000" floodOpacity={t.light ? 0.18 : 0.5} /></filter>
          </defs>
          <path d={tornRectPath(x - 14, y - 6, pw + 20, ph + 18, 4, 7)} fill={tint(t.accent, 0.2)} transform={`rotate(-1.6 ${w / 2} ${h / 2})`} />
          <path d={tornRectPath(x, y, pw, ph, 8, 5)} fill={t.light ? 'rgba(255,253,246,0.9)' : 'rgba(255,255,255,0.08)'} filter={`url(#${svgId('shadow')})`} />
          <path d={tornRectPath(x, y, pw, ph, 8, 5)} fill="none" stroke={t.accent} strokeWidth="0.8" opacity="0.5" />
        </>
      }
    />
  )
}
