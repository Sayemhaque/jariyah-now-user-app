'use client'

import { useRef } from 'react'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/utils'

interface RevealProps {
  children: React.ReactNode
  className?: string
  delayMs?: number
}

export function Reveal({ children, className, delayMs = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const visible = useInView(ref, true, '-12% 0px')
  return (
    <div ref={ref} className={cn('qv-reveal', visible && 'is-visible', className)} style={{ transitionDelay: `${delayMs}ms` }}>
      {children}
    </div>
  )
}
