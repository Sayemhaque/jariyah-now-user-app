import React from 'react'
import { staticFile } from 'remotion'
import type { CardProps } from '@/lib/cards/types'
import { QuoteCard } from '@/cards/QuoteCard'
import { ensureRemotionFonts } from './loadFonts'

export const QuoteCardStill: React.FC<CardProps> = (props) => {
  ensureRemotionFonts()
  return <QuoteCard {...props} logoSrc={staticFile('watermark.png')} />
}
