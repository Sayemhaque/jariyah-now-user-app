'use client'

import { goldStarScene } from './goldStar'
import { useThreeScene } from './useThreeScene'

export default function HeroScene({ className }: { className?: string }) {
  const ref = useThreeScene(goldStarScene)
  return <div ref={ref} aria-hidden className={className} />
}
