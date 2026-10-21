import React from 'react'

const stripes = (angle: number, color: string, on: number, off: number) => `repeating-linear-gradient(${angle}deg, ${color} 0 ${on}px, transparent ${on}px ${on + off}px)`

export const BlindsShadow: React.FC<{ color: string; light: string }> = ({ color, light }) => (
  <>
    <div style={{ position: 'absolute', inset: '-20%', background: `linear-gradient(125deg, transparent 25%, ${light} 45%, transparent 75%)`, filter: 'blur(30px)' }} />
    <div style={{ position: 'absolute', left: '22%', right: '-30%', top: '-25%', bottom: '-10%', background: stripes(0, color, 26, 40), transform: 'rotate(-24deg) skewX(-18deg)', filter: 'blur(5px)', maskImage: 'linear-gradient(110deg, transparent 5%, #000 35%, #000 80%, transparent)', WebkitMaskImage: 'linear-gradient(110deg, transparent 5%, #000 35%, #000 80%, transparent)' }} />
  </>
)

export const CurtainShadow: React.FC<{ color: string; light: string }> = ({ color, light }) => (
  <>
    <div style={{ position: 'absolute', inset: '-10%', background: `repeating-linear-gradient(90deg, transparent 0, ${color} 4%, transparent 9%, ${light} 13%, transparent 17%, ${color} 23%, transparent 30%)`, filter: 'blur(22px)', opacity: 0.85 }} />
    <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 70% at 35% 30%, ${light}, transparent 70%)` }} />
  </>
)

const jaliTile = (stroke: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='${stroke}' stroke-width='7'><path d='M40 4 L50 30 L76 40 L50 50 L40 76 L30 50 L4 40 L30 30Z'/><rect x='18' y='18' width='44' height='44' transform='rotate(45 40 40)'/></g></svg>`)}")`

export const JaliShadow: React.FC<{ color: string; light: string }> = ({ color, light }) => (
  <div style={{ position: 'absolute', right: '-12%', top: '8%', width: '70%', height: '78%', transform: 'perspective(900px) rotateY(-28deg) rotateZ(-8deg)', filter: 'blur(3px)' }}>
    <div style={{ position: 'absolute', inset: 0, borderRadius: '50% 50% 0 0 / 22% 22% 0 0', background: light, boxShadow: `0 0 80px 40px ${light}` }} />
    <div style={{ position: 'absolute', inset: 0, borderRadius: '50% 50% 0 0 / 22% 22% 0 0', backgroundImage: jaliTile(color), backgroundSize: '80px 80px', opacity: 0.9 }} />
  </div>
)

export const ArchLight: React.FC<{ color: string; light: string }> = ({ color, light }) => (
  <>
    <div style={{ position: 'absolute', inset: 0, background: color, opacity: 0.55 }} />
    {[0, 1].map((i) => (
      <div key={i} style={{ position: 'absolute', top: '6%', left: `${14 + i * 40}%`, width: '30%', height: '72%', borderRadius: '50% 50% 0 0 / 28% 28% 0 0', background: light, transform: 'skewX(-16deg)', filter: 'blur(10px)', opacity: 0.95 }}>
        <div style={{ position: 'absolute', left: '48%', top: '30%', bottom: 0, width: '4%', background: color }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: '58%', height: '3%', background: color }} />
      </div>
    ))}
  </>
)
