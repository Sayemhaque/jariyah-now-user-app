export function journeyLayout(width: number, height: number, portraitActorX = 0.5) {
  const portrait = height > width
  const unit = Math.min(width, height) / 1080
  return {
    unit,
    groundY: height * (portrait ? 0.86 : 0.965),
    actorX: width * (portrait ? portraitActorX : 0.15),
    actorScale: unit * (portrait ? 1.1 : 0.95),
  }
}

export const worldOffset = (seconds: number, speed: number, spacing: number) => (seconds * speed) % spacing

export function kneeFor(hip: [number, number], foot: [number, number], length: number): [number, number] {
  const dx = foot[0] - hip[0]
  const dy = foot[1] - hip[1]
  const distance = Math.min(Math.hypot(dx, dy), length * 1.98)
  const angle = Math.atan2(dy, dx)
  const bend = Math.acos(distance / (2 * length))
  return [hip[0] + length * Math.cos(angle - bend), hip[1] + length * Math.sin(angle - bend)]
}
