import React from 'react'
import { kneeFor } from './journeyLayout'

interface CyclistProps {
  x: number
  groundY: number
  scale: number
  seconds: number
  color: string
}

const wheelRadius = 30
const hip: [number, number] = [-16, -86]

const Wheel: React.FC<{ cx: number; spin: number; color: string }> = ({ cx, spin, color }) => (
  <g transform={`translate(${cx} ${-wheelRadius})`}>
    <circle r={wheelRadius} fill="none" stroke={color} strokeWidth={4.5} />
    <g transform={`rotate(${spin})`} stroke={color} strokeWidth={1.2} opacity={0.75}>
      {[0, 30, 60, 90, 120, 150].map((a) => (
        <line key={a} x1={-wheelRadius * Math.cos((a * Math.PI) / 180)} y1={-wheelRadius * Math.sin((a * Math.PI) / 180)} x2={wheelRadius * Math.cos((a * Math.PI) / 180)} y2={wheelRadius * Math.sin((a * Math.PI) / 180)} />
      ))}
    </g>
  </g>
)

export const Cyclist: React.FC<CyclistProps> = ({ x, groundY, scale, seconds, color }) => {
  const crank = seconds * 5.5
  const spin = (seconds * 520) % 360
  const bob = Math.sin(crank * 2) * 0.8
  const foot = (phase: number): [number, number] => [Math.cos(crank + phase) * 15, -30 + Math.sin(crank + phase) * 15]
  const leg = (phase: number, opacity: number) => {
    const end = foot(phase)
    const knee = kneeFor(hip, end, 36)
    return <polyline points={`${hip[0]},${hip[1]} ${knee[0]},${knee[1]} ${end[0]},${end[1]}`} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" opacity={opacity} />
  }
  return (
    <g transform={`translate(${x} ${groundY}) scale(${scale})`}>
      {leg(Math.PI, 0.7)}
      <Wheel cx={-46} spin={spin} color={color} />
      <Wheel cx={48} spin={spin} color={color} />
      <polyline points="-46,-30 0,-30 -18,-80 -46,-30 M0,-30 34,-78" fill="none" stroke={color} strokeWidth={5} strokeLinejoin="round" />
      <polyline points="-18,-80 34,-78 48,-30" fill="none" stroke={color} strokeWidth={5} strokeLinejoin="round" />
      <line x1={-28} y1={-84} x2={-8} y2={-84} stroke={color} strokeWidth={6} strokeLinecap="round" />
      <path d="M30,-80 l10,-10" stroke={color} strokeWidth={5} strokeLinecap="round" />
      <g transform={`translate(0 ${bob})`}>
        <path d="M-22,-82 Q-14,-112 6,-128 L16,-122 Q4,-104 -6,-82 Z" fill={color} />
        <polyline points="10,-124 30,-104 38,-90" fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={14} cy={-142} r={13} fill={color} />
      </g>
      {leg(0, 1)}
    </g>
  )
}
