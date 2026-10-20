import React from 'react'
import { useSvgId } from '../../useSvgId'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

export const GalleryLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const svgId = useSvgId('gallery')
  const m = pick(p.format, 64, 52, 160)
  const frame = 34
  const mat = pick(p.format, 44, 34, 50)
  const [fx, fy, fw, fh] = [m, m, w - 2 * m, h - 2 * m]
  const inner = frame + mat
  return (
    <OrnamentLayout
      {...p}
      pattern={false}
      padding={`${m + inner + pick(p.format, 44, 30, 40)}px ${m + inner + 34}px ${m + inner + pick(p.format, 36, 26, 36)}px`}
      gap={pick(p.format, 26, 18, 34)}
      art={
        <>
          <defs>
            <linearGradient id={svgId('gilt')} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={t.accent} />
              <stop offset="0.5" stopColor={t.accent} stopOpacity="0.55" />
              <stop offset="1" stopColor={t.accent} />
            </linearGradient>
            <filter id={svgId('shadow')} x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="20" stdDeviation="22" floodColor="#000" floodOpacity={t.light ? 0.22 : 0.55} /></filter>
          </defs>
          <path d={`M${fx} ${fy} h${fw} v${fh} h${-fw} Z M${fx + frame} ${fy + frame} v${fh - 2 * frame} h${fw - 2 * frame} v${-fh + 2 * frame} Z`} fill={`url(#${svgId('gilt')})`} fillRule="evenodd" filter={`url(#${svgId('shadow')})`} />
          <rect x={fx + 6} y={fy + 6} width={fw - 12} height={fh - 12} fill="none" stroke={t.light ? '#fff' : '#000'} strokeWidth="1" opacity="0.35" />
          <rect x={fx + frame} y={fy + frame} width={fw - 2 * frame} height={fh - 2 * frame} fill={t.light ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.06)'} />
          <rect x={fx + inner} y={fy + inner} width={fw - 2 * inner} height={fh - 2 * inner} fill="none" stroke={t.accent} strokeWidth="1" opacity="0.7" />
          <rect x={fx + inner - 6} y={fy + inner - 6} width={fw - 2 * inner + 12} height={fh - 2 * inner + 12} fill="none" stroke={t.accent} strokeWidth="0.6" opacity="0.4" />
        </>
      }
    />
  )
}
