import { mulberry32 } from '@/lib/daily/plan'

export type Point = [number, number]

export const round = (n: number) => Math.round(n * 10) / 10
const at = (cx: number, cy: number, r: number, angle: number) => `${round(cx + r * Math.cos(angle))} ${round(cy + r * Math.sin(angle))}`
const up = -Math.PI / 2

export const polar = (cx: number, cy: number, r: number, angle: number): Point => [round(cx + r * Math.cos(angle)), round(cy + r * Math.sin(angle))]

const closed = (points: string[]) => points.map((pt, i) => `${i ? 'L' : 'M'}${pt}`).join(' ') + ' Z'

export function starPath(cx: number, cy: number, points: number, outer: number, inner: number, rotation = up): string {
  const step = Math.PI / points
  return closed(Array.from({ length: points * 2 }, (_, i) => at(cx, cy, i % 2 ? inner : outer, rotation + i * step)))
}

export function polygonPath(cx: number, cy: number, sides: number, radius: number, rotation = up): string {
  return closed(Array.from({ length: sides }, (_, i) => at(cx, cy, radius, rotation + (i * 2 * Math.PI) / sides)))
}

export function petalPath(cx: number, cy: number, count: number, inner: number, outer: number, spread = 0.5): string {
  const half = (Math.PI / count) * spread
  return Array.from({ length: count }, (_, i) => {
    const angle = up + (i * 2 * Math.PI) / count
    return `M${at(cx, cy, inner, angle - half)} Q${at(cx, cy, outer * 0.9, angle - half * 1.2)} ${at(cx, cy, outer, angle)} Q${at(cx, cy, outer * 0.9, angle + half * 1.2)} ${at(cx, cy, inner, angle + half)} Z`
  }).join(' ')
}

export function annularSector(cx: number, cy: number, inner: number, outer: number, from: number, to: number): string {
  const large = to - from > Math.PI ? 1 : 0
  return `M${at(cx, cy, outer, from)} A${outer} ${outer} 0 ${large} 1 ${at(cx, cy, outer, to)} L${at(cx, cy, inner, to)} A${inner} ${inner} 0 ${large} 0 ${at(cx, cy, inner, from)} Z`
}

function scallopEdge(x1: number, y1: number, x2: number, y2: number, bump: number): string {
  const count = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / (bump * 2)))
  const r = round(Math.hypot(x2 - x1, y2 - y1) / (count * 2))
  return Array.from({ length: count }, (_, i) => `A${r} ${r} 0 0 1 ${round(x1 + ((x2 - x1) * (i + 1)) / count)} ${round(y1 + ((y2 - y1) * (i + 1)) / count)}`).join(' ')
}

export function scallopRect(x: number, y: number, width: number, height: number, bump: number): string {
  const [r, b] = [x + width, y + height]
  return `M${x} ${y} ${scallopEdge(x, y, r, y, bump)} ${scallopEdge(r, y, r, b, bump)} ${scallopEdge(r, b, x, b, bump)} ${scallopEdge(x, b, x, y, bump)} Z`
}

export function perimeterPoints(x: number, y: number, width: number, height: number, spacing: number): Point[] {
  const edge = (x1: number, y1: number, x2: number, y2: number): Point[] => {
    const count = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / spacing))
    return Array.from({ length: count }, (_, i) => [round(x1 + ((x2 - x1) * i) / count), round(y1 + ((y2 - y1) * i) / count)])
  }
  const [r, b] = [x + width, y + height]
  return [...edge(x, y, r, y), ...edge(r, y, r, b), ...edge(r, b, x, b), ...edge(x, b, x, y)]
}

export function pointedArchPath(left: number, right: number, apex: number, shoulder: number, bottom: number): string {
  const cx = (left + right) / 2
  const span = (right - left) / 2
  const rise = shoulder - apex
  return `M${left} ${bottom} V${shoulder} C${left} ${round(shoulder - rise * 0.62)} ${round(cx - span * 0.38)} ${round(apex + rise * 0.16)} ${cx} ${apex} C${round(cx + span * 0.38)} ${round(apex + rise * 0.16)} ${right} ${round(shoulder - rise * 0.62)} ${right} ${shoulder} V${bottom} Z`
}

export function multifoilArchPath(left: number, right: number, spring: number, bottom: number, lobes: number): string {
  const cx = (left + right) / 2
  const radius = (right - left) / 2
  const points = Array.from({ length: lobes + 1 }, (_, i) => at(cx, spring, radius, Math.PI + (i * Math.PI) / lobes))
  const lobe = round(radius * Math.sin(Math.PI / (lobes * 2)) * 1.25)
  return `M${left} ${bottom} V${spring} ${points.slice(1).map((pt) => `A${lobe} ${lobe} 0 0 1 ${pt}`).join(' ')} V${bottom} Z`
}

export function moonPath(cx: number, cy: number, r: number, phase: number): string {
  const k = Math.cos(2 * Math.PI * phase)
  const rx = round(Math.abs(k) * r)
  const waxing = phase < 0.5
  const outer = `M${cx} ${cy - r} A${r} ${r} 0 0 ${waxing ? 1 : 0} ${cx} ${cy + r}`
  const sweep = waxing !== k > 0 ? 1 : 0
  return `${outer} A${rx} ${r} 0 0 ${sweep} ${cx} ${cy - r} Z`
}

export function zigzagPath(left: number, right: number, y: number, amplitude: number, period: number): string {
  const count = Math.round((right - left) / period) * 2
  const step = (right - left) / count
  return `M${left} ${y} ` + Array.from({ length: count }, (_, i) => `L${round(left + step * (i + 1))} ${i % 2 ? y : y - amplitude}`).join(' ')
}

export function meanderPath(length: number, size: number): string {
  const count = Math.floor(length / size)
  const offset = (length - count * size) / 2
  const keys = Array.from({ length: count }, (_, i) => {
    const x = offset + i * size
    const s = size
    return `M${round(x)} ${s} V0 H${round(x + s * 0.8)} V${round(s * 0.72)} H${round(x + s * 0.24)} V${round(s * 0.24)} H${round(x + s * 0.56)} V${round(s * 0.48)}`
  })
  return `${keys.join(' ')} M${round(offset)} ${size} H${round(offset + count * size)}`
}

export function swagPoints(left: number, right: number, y: number, swags: number): Point[] {
  return Array.from({ length: swags + 1 }, (_, i) => [round(left + ((right - left) * i) / swags), y])
}

export function swagPath(points: Point[], sag: number): string {
  return points.slice(1).map(([x, y], i) => {
    const [px, py] = points[i]!
    return `${i ? '' : `M${px} ${py} `}Q${round((px + x) / 2)} ${round(py + sag * 2)} ${x} ${y}`
  }).join(' ')
}

export function quadPoint(t: number, p0: Point, p1: Point, p2: Point): { point: Point; angle: number } {
  const u = 1 - t
  const point: Point = [round(u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0]), round(u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1])]
  const dx = 2 * u * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0])
  const dy = 2 * u * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1])
  return { point, angle: round((Math.atan2(dy, dx) * 180) / Math.PI) }
}

export function scatter(seed: number, count: number, x: number, y: number, width: number, height: number): { x: number; y: number; r: number; o: number }[] {
  const rand = mulberry32(seed)
  return Array.from({ length: count }, () => ({ x: round(x + rand() * width), y: round(y + rand() * height), r: round(0.8 + rand() * 2.4), o: round(0.25 + rand() * 0.65) }))
}

export function ridgePath(width: number, base: number, height: number, seed: number): string {
  const rand = mulberry32(seed)
  const [f1, f2, p1, p2] = [0.004 + rand() * 0.004, 0.012 + rand() * 0.01, rand() * 6, rand() * 6]
  const points = Array.from({ length: Math.ceil(width / 30) + 1 }, (_, i) => {
    const x = i * 30
    const lift = 0.62 + 0.26 * Math.sin(x * f1 + p1) + 0.12 * Math.sin(x * f2 + p2)
    return `L${x} ${round(base - height * lift)}`
  })
  return `M0 ${base} ${points.join(' ')} L${width} ${base} Z`
}

export function tornRectPath(x: number, y: number, width: number, height: number, seed: number, roughness = 6): string {
  const rand = mulberry32(seed)
  const jitter = () => round((rand() - 0.5) * roughness * 2)
  const edge = (x1: number, y1: number, x2: number, y2: number, nx: number, ny: number) => {
    const count = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / 14))
    return Array.from({ length: count }, (_, i) => {
      const t = (i + 1) / count
      const j = jitter()
      return `L${round(x1 + (x2 - x1) * t + nx * j)} ${round(y1 + (y2 - y1) * t + ny * j)}`
    }).join(' ')
  }
  const [r, b] = [x + width, y + height]
  return `M${x} ${y} ${edge(x, y, r, y, 0, 1)} ${edge(r, y, r, b, 1, 0)} ${edge(r, b, x, b, 0, 1)} ${edge(x, b, x, y, 1, 0)} Z`
}

export function marbleVeins(width: number, height: number, seed: number, count = 9): { d: string; width: number; opacity: number }[] {
  const rand = mulberry32(seed)
  return Array.from({ length: count }, () => {
    const y0 = rand() * height
    const y1 = y0 + (rand() - 0.3) * height * 0.7
    const c1: Point = [width * (0.2 + rand() * 0.2), y0 + (rand() - 0.5) * 360]
    const c2: Point = [width * (0.6 + rand() * 0.2), y1 + (rand() - 0.5) * 360]
    return { d: `M-20 ${round(y0)} C${round(c1[0])} ${round(c1[1])} ${round(c2[0])} ${round(c2[1])} ${width + 20} ${round(y1)}`, width: round(0.6 + rand() * 2.4), opacity: round(0.06 + rand() * 0.14) }
  })
}

export function hexCenters(width: number, height: number, size: number): Point[] {
  const dx = size * Math.sqrt(3)
  const dy = size * 1.5
  const centers: Point[] = []
  for (let row = 0; row * dy <= height + size; row++) {
    for (let col = 0; col * dx <= width + dx; col++) centers.push([round(col * dx + (row % 2 ? dx / 2 : 0)), round(row * dy)])
  }
  return centers
}

export function lowPolyCorner(seed: number, size: number, cells: number): { points: string; opacity: number }[] {
  const rand = mulberry32(seed)
  const step = size / cells
  const grid = Array.from({ length: cells + 1 }, (_, row) => Array.from({ length: cells + 1 }, (_, col): Point => [
    round(col * step + (col && col < cells ? (rand() - 0.5) * step * 0.7 : 0)),
    round(row * step + (row && row < cells ? (rand() - 0.5) * step * 0.7 : 0)),
  ]))
  const triangles: { points: string; opacity: number }[] = []
  for (let row = 0; row < cells; row++) {
    for (let col = 0; col < cells - row; col++) {
      const [a, b, c, d] = [grid[row]![col]!, grid[row]![col + 1]!, grid[row + 1]![col]!, grid[row + 1]![col + 1]!]
      const shapes = col + row < cells - 1 ? [[a, b, d], [a, d, c]] : [[a, b, c]]
      for (const shape of shapes) triangles.push({ points: shape.map((pt) => pt.join(',')).join(' '), opacity: round(0.05 + rand() * 0.3 * (1 - (row + col) / cells)) })
    }
  }
  return triangles
}
