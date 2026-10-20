import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { SceneSetup } from './useThreeScene'

const gold = new THREE.Color('#d8ae5c')
const violet = new THREE.Color('#7c3aed')

function starShape(points: number, outer: number, inner: number) {
  const shape = new THREE.Shape()
  for (let i = 0; i <= points * 2; i++) {
    const r = i % 2 ? inner : outer
    const a = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2
    if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r)
    else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r)
  }
  shape.holes.push(new THREE.Path().absarc(0, 0, inner * 0.55, 0, Math.PI * 2, true))
  return shape
}

function dust(count: number) {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const r = 3 + Math.random() * 6
    const t = Math.random() * Math.PI * 2
    const p = Math.acos(2 * Math.random() - 1)
    positions.set([r * Math.sin(p) * Math.cos(t), r * Math.sin(p) * Math.sin(t) * 0.7, r * Math.cos(p) - 2], i * 3)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return new THREE.Points(geometry, new THREE.PointsMaterial({ color: gold, size: 0.05, transparent: true, opacity: 0.8, depthWrite: false }))
}

export const goldStarScene: SceneSetup = (scene, _camera, renderer) => {
  const pmrem = new THREE.PMREMGenerator(renderer)
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = environment
  pmrem.dispose()
  const metal = new THREE.MeshStandardMaterial({ color: gold, metalness: 0.9, roughness: 0.22, envMapIntensity: 1.25, emissive: new THREE.Color('#5a3a08'), emissiveIntensity: 0.25 })
  const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape(8, 2.3, 1.75), { depth: 0.32, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.08, bevelSegments: 3 }), metal)
  star.geometry.center()
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.95, 0.035, 16, 160), metal)
  const halo = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.012, 8, 200), new THREE.MeshBasicMaterial({ color: violet, transparent: true, opacity: 0.5 }))
  const group = new THREE.Group()
  group.add(star, ring, halo)
  const particles = dust(700)
  scene.add(group, particles, new THREE.AmbientLight('#ffffff', 0.9))
  const key = new THREE.DirectionalLight('#fff4dc', 2.4)
  key.position.set(4, 5, 6)
  const rim = new THREE.PointLight(violet, 30, 20)
  rim.position.set(-4, -2, 3)
  scene.add(key, rim)
  return {
    update: ({ time, pointer }) => {
      group.rotation.set(pointer.y * 0.35 + Math.sin(time * 0.4) * 0.12, time * 0.25 + pointer.x * 0.5, 0)
      group.position.y = Math.sin(time * 0.8) * 0.12
      halo.rotation.set(time * 0.3, time * 0.2, 0)
      particles.rotation.y = time * 0.03
      rim.position.x = Math.cos(time * 0.6) * 4
    },
    dispose: () => {
      environment.dispose()
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Points) { o.geometry.dispose(); (o.material as THREE.Material).dispose() }
      })
    },
  }
}
