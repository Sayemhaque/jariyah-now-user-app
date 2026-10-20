import React from 'react'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, tint, type LayoutProps } from '../layoutTypes'

export const StackLayout: React.FC<LayoutProps> = (p) => {
  const { theme: t } = p
  const inset = pick(p.format, 100, 84, 250)
  const shadow = t.light ? 'rgba(60, 40, 20, 0.18)' : 'rgba(0, 0, 0, 0.45)'
  const sheet = (rotate: number, alpha: number): React.CSSProperties => ({
    position: 'absolute', left: 96, right: 96, top: inset, bottom: inset, borderRadius: 28, transform: `rotate(${rotate}deg)`,
    background: tint(t.accent, alpha), border: `1px solid ${tint(t.accent, 0.45)}`, boxShadow: `0 18px 50px ${shadow}`,
  })
  const front: React.CSSProperties = {
    ...sheet(0, 0), border: `1.5px solid ${tint(t.accent, 0.7)}`,
    background: t.light ? 'linear-gradient(170deg, rgba(255,255,255,0.92), rgba(255,255,255,0.74))' : 'linear-gradient(170deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05))',
  }
  return (
    <OrnamentLayout
      {...p}
      padding={`${inset + pick(p.format, 64, 48, 80)}px 156px ${inset + pick(p.format, 56, 42, 70)}px`}
      gap={pick(p.format, 26, 18, 34)}
      behind={
        <>
          <div style={sheet(-5, 0.16)} />
          <div style={sheet(3, 0.22)} />
          <div style={front} />
        </>
      }
    />
  )
}
