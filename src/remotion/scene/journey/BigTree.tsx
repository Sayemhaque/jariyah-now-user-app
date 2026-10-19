import React from 'react'
import { useVideoConfig } from 'remotion'

export const BigTree: React.FC<{ x: number; groundY: number; scale: number; seconds: number; color: string }> = ({ x, groundY, scale, seconds, color }) => {
  const { width, height } = useVideoConfig()
  const sway = Math.sin(seconds * 0.7) * 1.2
  const clusters = [[-160, -380, 120], [-40, -440, 140], [100, -400, 130], [190, -330, 100], [-230, -300, 90], [20, -330, 120], [-110, -290, 100]]
  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
      <g transform={`translate(${x} ${groundY}) scale(${scale})`}>
        <path d="M-28,0 Q-20,-120 -36,-230 Q-60,-280 -120,-300 L-110,-310 Q-56,-296 -26,-262 Q-10,-300 40,-330 L48,-320 Q4,-286 6,-230 Q-2,-120 30,0 Z" fill={color} />
        <g transform={`rotate(${sway} 0 -250)`}>
          {clusters.map(([cx, cy, r]) => (
            <circle key={`${cx}`} cx={cx} cy={cy} r={r} fill={color} />
          ))}
        </g>
      </g>
    </svg>
  )
}
