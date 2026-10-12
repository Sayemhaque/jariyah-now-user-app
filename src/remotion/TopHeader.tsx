import React from 'react'
import { displayFontStack, headerArabicStack } from './fontStacks'
import { HeaderLabel } from './HeaderLabel'

interface TopHeaderProps {
  surahName: string
  surahNameArabic: string
  ayatNumber: number
  surahNumber: number
  index: number
  total: number
  width: number
  height: number
}

export const TopHeader: React.FC<TopHeaderProps> = ({ surahName, surahNameArabic, ayatNumber, surahNumber, index, total, width, height }) => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      color: 'white',
      padding: `${height * 0.04}px ${width * 0.05}px`,
      pointerEvents: 'none',
    }}
  >
    <HeaderLabel
      lang="ar"
      primaryFont={headerArabicStack}
      primary={surahNameArabic}
      secondary={surahName}
      primarySize={width * 0.05}
      secondarySize={width * 0.02}
      secondaryOpacity={0.75}
      secondarySpacing="0.12em"
      gap={height * 0.005}
    />
    <HeaderLabel
      alignEnd
      primaryFont={displayFontStack}
      primary={`${surahNumber}:${ayatNumber}`}
      secondary={`Ayat ${index + 1} of ${total}`}
      primarySize={width * 0.042}
      secondarySize={width * 0.018}
      secondaryOpacity={0.65}
      secondarySpacing="0.18em"
      gap={height * 0.005}
    />
  </div>
)
