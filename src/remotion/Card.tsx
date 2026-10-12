import React from 'react'

interface CardProps {
  maxWidth: number
  paddingTop: number
  paddingX: number
  glow: number
  visibility: number
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ maxWidth, paddingTop, paddingX, glow, visibility, children }) => (
  <div
    style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      maxWidth,
      width: '100%',
      padding: `${paddingTop}px ${paddingX}px`,
      opacity: visibility,
      transform: `translateY(${(1 - visibility) * glow}px) scale(${0.97 + visibility * 0.03})`,
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: `-${glow}px`,
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.32) 45%, rgba(0,0,0,0) 72%)',
        pointerEvents: 'none',
      }}
    />
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {children}
    </div>
  </div>
)
