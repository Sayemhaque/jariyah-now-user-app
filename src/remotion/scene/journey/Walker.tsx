import React from 'react'

interface WalkerProps {
  x: number
  groundY: number
  scale: number
  seconds: number
  color: string
}

export const Walker: React.FC<WalkerProps> = ({ x, groundY, scale, seconds, color }) => {
  const stride = Math.sin(seconds * 4.2) * 0.42
  const bob = Math.abs(Math.cos(seconds * 4.2)) * -2
  const limb = (angle: number, fromY: number, length: number, width: number, opacity: number) => (
    <line x1={0} y1={fromY} x2={Math.sin(angle) * length} y2={fromY + Math.cos(angle) * length} stroke={color} strokeWidth={width} strokeLinecap="round" opacity={opacity} />
  )
  return (
    <g transform={`translate(${x} ${groundY}) scale(${scale})`}>
      {limb(-stride, -48, 46, 9, 0.75)}
      {limb(stride, -48, 46, 9, 1)}
      <g transform={`translate(0 ${bob})`}>
        <g transform="translate(0 -118)">{limb(stride * 0.8, 0, 50, 7, 0.75)}</g>
        <path d="M-15,-122 Q0,-128 15,-122 L23,-44 Q0,-38 -23,-44 Z" fill={color} />
        <g transform="translate(0 -118)">{limb(-stride * 0.8, 0, 50, 7, 1)}</g>
        <circle cx={0} cy={-140} r={13} fill={color} />
        <path d="M-13,-144 A13,13 0 0 1 13,-144 Z" fill={color} />
      </g>
    </g>
  )
}
