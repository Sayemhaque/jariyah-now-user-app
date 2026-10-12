import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { seeded } from './seeded'

const dome = (left: number, right: number, base: number, peak: number) => {
  const mid = (left + right) / 2
  const w = right - left
  return `M${left},${base} C${left - w * 0.08},${base - (base - peak) * 0.62} ${mid - w * 0.22},${peak + (base - peak) * 0.22} ${mid},${peak} C${mid + w * 0.22},${peak + (base - peak) * 0.22} ${right + w * 0.08},${base - (base - peak) * 0.62} ${right},${base} Z`
}
const minaret = (x: number, top: number) =>
  `M${x - 13},600 L${x - 13},${top + 70} L${x - 20},${top + 62} L${x + 20},${top + 62} L${x + 13},${top + 70} L${x + 13},600 Z M${x - 10},${top + 62} L${x - 10},${top + 30} L${x},${top} L${x + 10},${top + 30} L${x + 10},${top + 62} Z`

const shapes = [
  'M0,560 L1000,560 L1000,600 L0,600 Z',
  'M290,600 L290,400 L710,400 L710,600 Z',
  'M395,400 L395,345 L605,345 L605,400 Z',
  dome(395, 605, 345, 175),
  'M235,600 L235,440 L340,440 L340,600 Z M660,600 L660,440 L765,440 L765,600 Z',
  dome(250, 325, 440, 375),
  dome(675, 750, 440, 375),
  minaret(185, 120),
  minaret(815, 120),
  'M497,175 L497,138 L503,138 L503,175 Z',
]
const windows = [
  [430, 450], [480, 450], [530, 450], [570, 450], [330, 470], [650, 470], [262, 480], [722, 480], [445, 365], [535, 365],
]

export const MosqueSilhouette: React.FC<{ color: string; light: string }> = ({ color, light }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const seconds = frame / fps
  const silhouetteHeight = Math.min(height * 0.5, width * 0.62)

  return (
    <svg
      viewBox="0 0 1000 600"
      preserveAspectRatio="xMidYMax meet"
      width={width}
      height={silhouetteHeight}
      style={{ position: 'absolute', left: 0, bottom: 0 }}
    >
      {shapes.map((d, index) => (
        <path key={index} d={d} fill={color} />
      ))}
      <circle cx="500" cy="128" r="9" fill={light} opacity="0.9" />
      {windows.map(([x, y], index) => (
        <path
          key={index}
          d={`M${x - 7},${y + 30} L${x - 7},${y + 8} Q${x},${y - 4} ${x + 7},${y + 8} L${x + 7},${y + 30} Z`}
          fill={light}
          opacity={0.45 + 0.4 * Math.abs(Math.sin(seconds * (0.5 + seeded(index, 31)) + index))}
        />
      ))}
    </svg>
  )
}
