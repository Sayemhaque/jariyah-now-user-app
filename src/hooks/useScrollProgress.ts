import { useEffect, useRef, useState } from 'react'

export function useScrollProgress(steps: number) {
  const ref = useRef<HTMLElement | null>(null)
  const progress = useRef(0)
  const [step, setStep] = useState(0)
  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const node = ref.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const travel = Math.max(rect.height - window.innerHeight * 0.6, 1)
      progress.current = Math.min(1, Math.max(0, (window.innerHeight * 0.4 - rect.top) / travel))
      node.style.setProperty('--story-progress', progress.current.toFixed(3))
      setStep(Math.min(steps - 1, Math.floor(progress.current * steps)))
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure) }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [steps])
  return { ref, progress, step }
}
