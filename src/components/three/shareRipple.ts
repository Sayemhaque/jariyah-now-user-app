import * as THREE from 'three'
import type { SceneSetup } from './useThreeScene'

interface Node { position: THREE.Vector3; parent: number; threshold: number }

const lit = new THREE.Color('#e2b35e')
const dim = new THREE.Color('#c9bfe0')
const layers = [1, 7, 16, 30, 52]

function buildNodes(): Node[] {
  const nodes: Node[] = [{ position: new THREE.Vector3(), parent: -1, threshold: 0 }]
  let previous = [0]
  layers.slice(1).forEach((count, layer) => {
    const current: number[] = []
    for (let i = 0; i < count; i++) {
      const y = 1 - (2 * (i + 0.5)) / count
      const a = i * 2.39996
      const r = Math.sqrt(1 - y * y)
      const position = new THREE.Vector3(Math.cos(a) * r, y * 0.75, Math.sin(a) * r).multiplyScalar(1.05 * (layer + 1))
      const parent = previous.reduce((best, p) => (nodes[p]!.position.distanceTo(position) < nodes[best]!.position.distanceTo(position) ? p : best), previous[0]!)
      current.push(nodes.length)
      nodes.push({ position, parent, threshold: (layer + 1 + (i % 5) * 0.12) / layers.length })
    }
    previous = current
  })
  return nodes
}

export function createShareRipple(getProgress: () => number): SceneSetup {
  return (scene, camera) => {
    camera.position.set(0, 1.2, 11.5)
    camera.lookAt(0, 0, 0)
    const nodes = buildNodes()
    const pointColors = new Float32Array(nodes.length * 3)
    const points = new THREE.BufferGeometry().setFromPoints(nodes.map((n) => n.position))
    points.setAttribute('color', new THREE.BufferAttribute(pointColors, 3))
    const links = nodes.flatMap((n, i) => (n.parent >= 0 ? [{ index: i, parent: n.parent }] : []))
    const lineColors = new Float32Array(links.length * 6)
    const lines = new THREE.BufferGeometry().setFromPoints(links.flatMap((l) => [nodes[l.parent]!.position, nodes[l.index]!.position]))
    lines.setAttribute('color', new THREE.BufferAttribute(lineColors, 3))
    const group = new THREE.Group()
    group.add(
      new THREE.LineSegments(lines, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.7 })),
      new THREE.Points(points, new THREE.PointsMaterial({ vertexColors: true, size: 0.22, sizeAttenuation: true, transparent: true, depthWrite: false })),
    )
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 32), new THREE.MeshBasicMaterial({ color: lit }))
    scene.add(group, core)
    const colour = new THREE.Color()
    return {
      update: ({ time, pointer }) => {
        const progress = getProgress()
        nodes.forEach((n, i) => {
          const glow = THREE.MathUtils.clamp((progress - n.threshold) * 8 + 1, 0, 1)
          colour.copy(dim).lerp(lit, glow).toArray(pointColors, i * 3)
        })
        links.forEach((l, i) => {
          lineColors.set(pointColors.subarray(l.parent * 3, l.parent * 3 + 3), i * 6)
          lineColors.set(pointColors.subarray(l.index * 3, l.index * 3 + 3), i * 6 + 3)
        })
        points.attributes.color!.needsUpdate = true
        lines.attributes.color!.needsUpdate = true
        group.rotation.set(0.25 + pointer.y * 0.15, time * 0.12 + pointer.x * 0.3, 0)
        core.scale.setScalar(1 + Math.sin(time * 2.4) * 0.12)
      },
      dispose: () => { points.dispose(); lines.dispose(); core.geometry.dispose() },
    }
  }
}
