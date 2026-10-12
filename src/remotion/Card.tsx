import React from 'react'

interface CardProps {
  maxWidth: number
  paddingTop: number
  paddingX: number
  borderRadius: number
  shadow: number
  visibility: number
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ maxWidth, paddingTop, paddingX, borderRadius, shadow, visibility, children }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      maxWidth,
      width: '100%',
      background: 'linear-gradient(160deg, rgba(24,20,38,0.66) 0%, rgba(8,8,14,0.58) 100%)',
      border: '1px solid rgba(255,255,255,0.10)',
      backdropFilter: `blur(${shadow * 0.6}px)`,
      padding: `${paddingTop}px ${paddingX}px`,
      borderRadius,
      boxShadow: `0 ${shadow}px ${shadow * 2}px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)`,
      opacity: visibility,
      transform: `translateY(${(1 - visibility) * shadow * 1.5}px) scale(${0.96 + visibility * 0.04})`,
    }}
  >
    {children}
  </div>
)
