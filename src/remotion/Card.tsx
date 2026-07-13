import React from 'react'

export const Card: React.FC<{
  maxWidth: number
  paddingTop: number
  paddingX: number
  borderRadius: number
  shadow: number
  children: React.ReactNode
}> = ({ maxWidth, paddingTop, paddingX, borderRadius, shadow, children }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth,
        width: '100%',
        backgroundColor: 'rgba(15, 15, 20, 0.6)',
        padding: `${paddingTop}px ${paddingX}px`,
        borderRadius: borderRadius,
        boxShadow: `0 ${shadow}px ${shadow * 2}px rgba(0, 0, 0, 0.4)`,
      }}
    >
      {children}
    </div>
  )
}
