'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from '@/hooks/useInView'
import { bnDigits } from '@/lib/cards/bangla'

export function CountUp({ value, durationMs = 1600 }: { value: number; durationMs?: number }) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const visible = useInView(ref, true, '0px')
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (!visible) return
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      setShown(Math.round(value * (1 - Math.pow(1 - t, 3))))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [visible, value, durationMs])
  return <span ref={ref} className="tabular-nums">{bnDigits(shown)}</span>
}
