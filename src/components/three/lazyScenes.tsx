'use client'

import dynamic from 'next/dynamic'

export const LazyHeroScene = dynamic(() => import('./HeroScene'), { ssr: false })
export const LazyRippleScene = dynamic(() => import('./RippleScene'), { ssr: false })
