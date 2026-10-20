'use client'

import { useMemo, type RefObject } from 'react'
import { createShareRipple } from './shareRipple'
import { useThreeScene } from './useThreeScene'

export default function RippleScene({ progress, className }: { progress: RefObject<number>; className?: string }) {
  const setup = useMemo(() => createShareRipple(() => progress.current ?? 0), [progress])
  const ref = useThreeScene(setup)
  return <div ref={ref} aria-hidden className={className} />
}
