import React from 'react'
import { uiFontStack } from './fontStacks'

interface HeaderLabelProps {
  primary: React.ReactNode
  secondary: React.ReactNode
  primarySize: number
  secondarySize: number
  secondaryOpacity: number
  secondarySpacing: string
  gap: number
  alignEnd?: boolean
  lang?: string
  primaryFont: string
}

export const HeaderLabel: React.FC<HeaderLabelProps> = (props) => (
  <div style={{ display: 'flex', flexDirection: 'column', ...(props.alignEnd ? { alignItems: 'flex-end' } : {}) }}>
    <span
      style={{
        fontFamily: props.primaryFont,
        fontSize: props.primarySize,
        lineHeight: 1.1,
        textShadow: '0 1px 4px rgba(0,0,0,0.7)',
      }}
      lang={props.lang}
    >
      {props.primary}
    </span>
    <span
      style={{
        fontSize: props.secondarySize,
        opacity: props.secondaryOpacity,
        letterSpacing: props.secondarySpacing,
        textTransform: 'uppercase',
        marginTop: props.gap,
        fontFamily: uiFontStack,
      }}
    >
      {props.secondary}
    </span>
  </div>
)
