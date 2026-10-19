import React from 'react'
import { headerArabicStack, uiFontStack } from '../fontStacks'
import { manuscriptColors as colors } from './manuscriptLayout'

interface ManuscriptHeaderProps {
  unit: number
  pageHeight: number
  arabicName: string
  englishName: string
  meaning?: string
}

export const ManuscriptHeader: React.FC<ManuscriptHeaderProps> = ({ unit, pageHeight, arabicName, englishName, meaning }) => (
  <>
    <div
      style={{
        position: 'absolute',
        top: pageHeight * 0.07,
        left: '11%',
        right: '11%',
        height: unit * 116,
        borderRadius: unit * 58,
        background: `linear-gradient(180deg, #164c42, ${colors.emerald})`,
        border: `${unit * 3}px solid ${colors.gold}`,
        boxShadow: `inset 0 0 0 ${unit * 6}px ${colors.emerald}, inset 0 0 0 ${unit * 8}px ${colors.gold}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ fontFamily: headerArabicStack, fontWeight: 700, fontSize: unit * 54, color: colors.goldLight, direction: 'rtl' }}>
        سورة {arabicName}
      </span>
    </div>
    <div
      style={{
        position: 'absolute',
        top: pageHeight * 0.07 + unit * 136,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily: uiFontStack,
        fontWeight: 600,
        fontSize: unit * 18,
        letterSpacing: '0.4em',
        color: '#8a6420',
      }}
    >
      {[englishName, meaning].filter(Boolean).join(' · ').toUpperCase()}
    </div>
  </>
)
