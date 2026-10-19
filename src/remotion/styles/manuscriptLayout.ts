export const manuscriptColors = {
  ink: '#2a1c0c',
  gold: '#b8892c',
  goldLight: '#f1d27e',
  leaf: '#a8721a',
  emerald: '#0c3029',
  parchment: 'radial-gradient(ellipse at 50% 30%, #fbf1d6 0%, #efdfb4 60%, #e2cc94 100%)',
  backdrop: 'radial-gradient(ellipse at 50% 40%, #12453a 0%, #0a2a23 55%, #061a16 100%)',
}

export function manuscriptBox(width: number, height: number) {
  const portrait = height > width
  const boxWidth = portrait ? width * 0.75 : width * 0.7
  const top = height * (portrait ? 0.19 : 0.17)
  const bottom = height * (portrait ? 0.265 : 0.05)
  return { top, left: portrait ? width * 0.09 : (width - boxWidth) / 2, width: boxWidth, height: height - top - bottom }
}
