import React from 'react'
import { Walker } from './Walker'

export const UmbrellaWalker: React.FC<{ x: number; groundY: number; scale: number; seconds: number; color: string }> = ({ x, groundY, scale, seconds, color }) => {
  const tilt = Math.sin(seconds * 4.2) * 2
  return (
    <>
      <Walker x={x} groundY={groundY} scale={scale} seconds={seconds} color={color} />
      <g transform={`translate(${x} ${groundY}) scale(${scale}) rotate(${tilt} 0 -150)`}>
        <line x1={6} y1={-110} x2={6} y2={-200} stroke={color} strokeWidth={4} />
        <path d="M-64,-196 Q6,-262 76,-196 Q58,-206 41,-196 Q24,-206 6,-196 Q-12,-206 -29,-196 Q-46,-206 -64,-196 Z" fill={color} />
      </g>
    </>
  )
}
