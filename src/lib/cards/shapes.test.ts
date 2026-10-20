import { describe, it, expect } from 'vitest'
import { annularSector, hexCenters, lowPolyCorner, marbleVeins, meanderPath, moonPath, multifoilArchPath, perimeterPoints, petalPath, pointedArchPath, polar, polygonPath, quadPoint, ridgePath, scallopRect, scatter, starPath, swagPath, swagPoints, tornRectPath, zigzagPath } from './shapes'

const commands = (d: string, letter: string) => d.split(letter).length - 1

describe('card shapes', () => {
  it('draws stars and polygons with the right number of points', () => {
    expect(commands(starPath(0, 0, 8, 10, 5), 'L')).toBe(15)
    expect(starPath(0, 0, 4, 10, 5).startsWith('M0 -10')).toBe(true)
    expect(commands(polygonPath(0, 0, 6, 10), 'L')).toBe(5)
    expect(polygonPath(0, 0, 6, 10).endsWith('Z')).toBe(true)
    expect(commands(petalPath(0, 0, 16, 5, 20), 'M')).toBe(16)
  })

  it('places polar points and rounds to one decimal', () => {
    expect(polar(10, 10, 5, 0)).toEqual([15, 10])
    expect(polar(0, 0, 10, Math.PI / 3)).toEqual([5, 8.7])
  })

  it('uses a large arc only for sectors wider than half a circle', () => {
    expect(annularSector(0, 0, 5, 10, 0, Math.PI / 2)).toContain('A10 10 0 0 1')
    expect(annularSector(0, 0, 5, 10, 0, Math.PI * 1.5)).toContain('A10 10 0 1 1')
  })

  it('scallops and walks a rectangle edge by edge', () => {
    expect(commands(scallopRect(0, 0, 100, 40, 10), 'A')).toBe(5 + 2 + 5 + 2)
    const points = perimeterPoints(0, 0, 100, 50, 25)
    expect(points).toHaveLength(4 + 2 + 4 + 2)
    expect(points[0]).toEqual([0, 0])
    expect(points[4]).toEqual([100, 0])
  })

  it('builds closed arch outlines that start and end at the base', () => {
    const pointed = pointedArchPath(0, 200, 10, 150, 400)
    expect(pointed.startsWith('M0 400 V150')).toBe(true)
    expect(pointed).toContain(' 100 10 ')
    expect(pointed.endsWith('V400 Z')).toBe(true)
    const foil = multifoilArchPath(0, 200, 100, 300, 7)
    expect(commands(foil, 'A')).toBe(7)
    expect(foil).toContain('200 100')
  })

  it('draws moon phases on the correct side', () => {
    expect(moonPath(0, 0, 10, 0.25)).toContain('A10 10 0 0 1 0 10')
    expect(moonPath(0, 0, 10, 0.75)).toContain('A10 10 0 0 0 0 10')
    expect(moonPath(0, 0, 10, 0.5)).toBe('M0 -10 A10 10 0 0 0 0 10 A10 10 0 0 0 0 -10 Z')
    expect(moonPath(0, 0, 10, 0.1)).toMatch(/A8\.1 10 0 0 0 0 -10/)
  })

  it('repeats band motifs across the length', () => {
    expect(commands(zigzagPath(0, 100, 50, 10, 25), 'L')).toBe(8)
    expect(commands(meanderPath(100, 28), 'M')).toBe(4)
    const swags = swagPoints(0, 300, 10, 3)
    expect(swags).toEqual([[0, 10], [100, 10], [200, 10], [300, 10]])
    expect(commands(swagPath(swags, 20), 'Q')).toBe(3)
    expect(swagPath(swags, 20)).toContain('Q50 50 100 10')
  })

  it('follows a quadratic curve', () => {
    const mid = quadPoint(0.5, [0, 0], [50, 100], [100, 0])
    expect(mid.point).toEqual([50, 50])
    expect(mid.angle).toBe(0)
  })

  it('keeps seeded scenery deterministic', () => {
    expect(scatter(3, 5, 0, 0, 100, 100)).toEqual(scatter(3, 5, 0, 0, 100, 100))
    expect(scatter(3, 20, 10, 20, 100, 50).every((s) => s.x >= 10 && s.x <= 110 && s.y >= 20 && s.y <= 70)).toBe(true)
    expect(ridgePath(300, 500, 100, 2)).toBe(ridgePath(300, 500, 100, 2))
    expect(ridgePath(300, 500, 100, 2).startsWith('M0 500')).toBe(true)
    expect(tornRectPath(0, 0, 200, 100, 4)).not.toBe(tornRectPath(0, 0, 200, 100, 5))
    expect(marbleVeins(1080, 1350, 11)).toHaveLength(9)
  })

  it('tiles hexagons and low-poly corners', () => {
    expect(hexCenters(100, 100, 20).length).toBeGreaterThan(10)
    const facets = lowPolyCorner(6, 300, 6)
    expect(facets.length).toBe(36)
    expect(facets.every((f) => f.opacity > 0 && f.opacity < 0.4)).toBe(true)
  })
})
