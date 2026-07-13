import React from 'react'

export const TopHeader: React.FC<{
  surahName: string
  surahNameArabic: string
  ayatNumber: number
  surahNumber: number
  index: number
  total: number
  width: number
  height: number
}> = ({ surahName, surahNameArabic, ayatNumber, surahNumber, index, total, width, height }) => {
  return (
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
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontFamily: 'Amiri, serif',
            fontSize: width * 0.05,
            lineHeight: 1.1,
            textShadow: '0 1px 4px rgba(0,0,0,0.7)',
          }}
          lang="ar"
        >
          {surahNameArabic}
        </span>
        <span
          style={{
            fontSize: width * 0.02,
            opacity: 0.75,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginTop: height * 0.005,
          }}
        >
          {surahName}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <span
          style={{
            fontFamily: 'Amiri, serif',
            fontSize: width * 0.042,
            lineHeight: 1.1,
            textShadow: '0 1px 4px rgba(0,0,0,0.7)',
          }}
        >
          {surahNumber}:{ayatNumber}
        </span>
        <span
          style={{
            fontSize: width * 0.018,
            opacity: 0.65,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginTop: height * 0.005,
          }}
        >
          Ayat {index + 1} of {total}
        </span>
      </div>
    </div>
  )
}
