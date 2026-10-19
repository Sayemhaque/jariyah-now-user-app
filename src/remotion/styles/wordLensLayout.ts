export interface Zone {
  top: number
  left: number
  width: number
  height: number
}

const zone = (width: number, height: number, top: number, left: number, w: number, h: number): Zone => ({
  top: height * top,
  left: width * left,
  width: width * w,
  height: height * h,
})

export function wordLensZones(width: number, height: number) {
  if (height > width) {
    return {
      ayah: zone(width, height, 0.18, 0.09, 0.75, 0.1),
      card: zone(width, height, 0.29, 0.09, 0.75, 0.29),
      translation: zone(width, height, 0.6, 0.09, 0.75, 0.135),
      arabicScale: 0.55,
    }
  }
  return {
    ayah: zone(width, height, 0.2, 0.5, 0.44, 0.36),
    card: zone(width, height, 0.18, 0.06, 0.4, 0.7),
    translation: zone(width, height, 0.6, 0.5, 0.44, 0.28),
    arabicScale: 0.8,
  }
}
