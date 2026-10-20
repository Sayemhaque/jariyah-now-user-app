import React from 'react'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bodyProps, column, storyInset, type LayoutProps } from './layoutTypes'

const lines = 5
const gap = 15
const amp = 12
const wave = 280

function wavePath(width: number, y: number, shift: number): string {
  const start = -wave + shift
  const steps = Math.ceil((width - start) / (wave / 2)) + 1
  const tail = Array.from({ length: steps }, (_, i) => `T${start + (i + 1) * (wave / 2)} ${y}`).join(' ')
  return `M${start} ${y} Q${start + wave / 4} ${y - amp} ${start + wave / 2} ${y} ${tail}`
}

const Band: React.FC<{ width: number; top: number; color: string; flip: boolean }> = ({ width, top, color, flip }) => (
  <>
    {Array.from({ length: lines }, (_, i) => {
      const k = flip ? lines - 1 - i : i
      return <path key={i} d={wavePath(width, top + i * gap, k * 26)} fill="none" stroke={color} strokeWidth={k === 0 ? 1.8 : 1.1} opacity={0.85 - k * 0.16} />
    })}
  </>
)

export const OceanLayout: React.FC<LayoutProps> = (p) => {
  const { theme, width, height } = p
  const square = p.format === 'square'
  const edge = storyInset(p.format, 150, square ? 44 : 56)
  const band = (lines - 1) * gap + amp * 2
  const pad = edge + band + storyInset(p.format, 90, square ? 40 : 56)
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} pattern={false} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <Band width={width} top={edge + amp} color={theme.accent} flip={false} />
        <Band width={width} top={height - edge - band + amp} color={theme.accent} flip />
      </svg>
      <div style={column(`${pad}px 140px ${pad - 10}px`, square ? 22 : 30)}>
        <CardHeader content={p.content} theme={theme} logoSrc={p.logoSrc} />
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={theme} />
      </div>
    </>
  )
}
