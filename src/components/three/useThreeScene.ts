import { useEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'

export interface SceneFrame {
  time: number
  pointer: THREE.Vector2
}

export interface SceneHandle {
  update: (frame: SceneFrame) => void
  dispose: () => void
}

export type SceneSetup = (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => SceneHandle

export function useThreeScene(setup: SceneSetup): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const host = ref.current
    if (!host) return
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    host.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
    camera.position.set(0, 0, 9)
    const handle = setup(scene, camera, renderer)
    const pointer = new THREE.Vector2()
    const target = new THREE.Vector2()
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let visible = true
    let frame = 0
    const render = (ms: number) => {
      pointer.lerp(target, 0.05)
      handle.update({ time: still ? 1.2 : ms / 1000, pointer })
      renderer.render(scene, camera)
    }
    const loop = (ms: number) => {
      render(ms)
      frame = visible && !still && !document.hidden ? requestAnimationFrame(loop) : 0
    }
    const wake = () => { if (!frame && visible && !still && !document.hidden) frame = requestAnimationFrame(loop) }
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host
      renderer.setSize(w, h, false)
      renderer.domElement.style.cssText = 'width:100%;height:100%;display:block'
      camera.aspect = w / Math.max(h, 1)
      camera.updateProjectionMatrix()
      render(performance.now())
    }
    const onPointer = (e: PointerEvent) => target.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
    const sizeObserver = new ResizeObserver(resize)
    const viewObserver = new IntersectionObserver(([entry]) => { visible = !!entry?.isIntersecting; wake() })
    sizeObserver.observe(host)
    viewObserver.observe(host)
    window.addEventListener('pointermove', onPointer, { passive: true })
    document.addEventListener('visibilitychange', wake)
    resize()
    wake()
    return () => {
      cancelAnimationFrame(frame)
      sizeObserver.disconnect()
      viewObserver.disconnect()
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', wake)
      handle.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [setup])
  return ref
}
