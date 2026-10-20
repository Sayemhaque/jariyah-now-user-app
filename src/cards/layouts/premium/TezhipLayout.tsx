import React from 'react'
import { cardHeaderHeight, cardPadding } from '@/lib/cards/cardTypography'
import { scallopRect, starPath } from '@/lib/cards/shapes'
import { useCardStyle } from '../../CardStyleContext'
import { titleSlot } from '../../titleFonts'
import { useSvgId } from '../../useSvgId'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, tint, type LayoutProps } from '../layoutTypes'

export const TezhipLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const { fonts, decor, textSizes } = useCardStyle()
  const svgId = useSvgId('tezhip')
  const pad = cardPadding[p.format]
  const top = pad.top + pick(p.format, 30, 20, 0)
  const panelTop = top - 38
  const panelBottom = top + cardHeaderHeight(p.content, fonts[titleSlot(p.content.title)].scale, p.format, decor.eyebrow, textSizes) + 26
  const [x0, x1] = [76, w - 76]
  const midY = (panelTop + panelBottom) / 2
  return (
    <OrnamentLayout
      {...p}
      padding={`${top}px 150px ${pad.bottom + pick(p.format, 20, 10, 0)}px`}
      gap={46}
      art={
        <>
          <defs>
            <linearGradient id={svgId('g')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={t.accent} stopOpacity={t.light ? 0.22 : 0.2} />
              <stop offset="1" stopColor={t.accent} stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <rect x={48} y={48} width={w - 96} height={h - 96} fill="none" stroke={t.accent} strokeWidth="1.2" opacity="0.55" />
          <path d={scallopRect(x0 - 10, panelTop - 10, x1 - x0 + 20, panelBottom - panelTop + 20, 10)} fill="none" stroke={t.accent} strokeWidth="1" opacity="0.6" />
          <rect x={x0} y={panelTop} width={x1 - x0} height={panelBottom - panelTop} fill={`url(#${svgId('g')})`} stroke={t.accent} strokeWidth="1.8" />
          <rect x={x0 + 10} y={panelTop + 10} width={x1 - x0 - 20} height={panelBottom - panelTop - 20} fill="none" stroke={t.accent} strokeWidth="0.8" strokeDasharray="2 6" />
          {[x0 - 24, x1 + 24].map((x) => <path key={x} d={starPath(x, midY, 12, 20, 11)} fill={t.accent} />)}
          <line x1={x0 + 120} y1={panelBottom + 16} x2={x1 - 120} y2={panelBottom + 16} stroke={t.accent} strokeWidth="0.8" opacity="0.5" />
        </>
      }
    />
  )
}
