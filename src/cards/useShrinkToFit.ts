import { useLayoutEffect, useRef } from 'react'

const maxPasses = 8

export function useShrinkToFit(key: string, onSettled?: () => void) {
  const boxRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    let cancelled = false
    const fit = () => {
      const box = boxRef.current
      const content = contentRef.current
      if (!box || !content) return
      let factor = 1
      content.style.setProperty('--card-fit', '1')
      for (let pass = 0; pass < maxPasses && content.offsetHeight > box.clientHeight; pass++) {
        factor *= Math.max(0.7, box.clientHeight / content.offsetHeight) * 0.99
        content.style.setProperty('--card-fit', String(factor))
      }
    }
    fit()
    const fontsReady = typeof document !== 'undefined' && document.fonts ? document.fonts.ready : Promise.resolve()
    fontsReady.then(() => {
      if (cancelled) return
      fit()
      onSettled?.()
    })
    return () => {
      cancelled = true
    }
  }, [key])

  return { boxRef, contentRef }
}

export const fitted = (px: number) => `calc(${px}px * var(--card-fit, 1))`
