import React from 'react'
import { continueRender, delayRender, staticFile } from 'remotion'
import type { CardProps } from '@/lib/cards/types'
import { QuoteCard } from '@/cards/QuoteCard'
import { ensureRemotionFonts, remotionFontsReady } from './loadFonts'

export const QuoteCardStill: React.FC<CardProps> = (props) => {
  ensureRemotionFonts()
  const [handle] = React.useState(() => delayRender('Fitting card text'))
  const [fontsReady, setFontsReady] = React.useState(false)
  React.useEffect(() => {
    remotionFontsReady().then(() => setFontsReady(true))
  }, [])
  if (!fontsReady) return null
  return <QuoteCard {...props} logoSrc={staticFile('watermark.png')} onSettled={() => continueRender(handle)} />
}
