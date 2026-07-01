'use client'

import type { OverlayStyle, VideoSettings } from './types'

/**
 * Shared overlay helpers used by both the React <VideoPreview> and the
 * Canvas-based export pipeline. Keeping the math in one place ensures the
 * preview and the exported video look the same.
 */

interface RgbaColor {
  r: number
  g: number
  b: number
}

export function hexToRgb(hex: string): RgbaColor {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16) || 0,
    g: parseInt(h.slice(2, 4), 16) || 0,
    b: parseInt(h.slice(4, 6), 16) || 0,
  }
}

export function rgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Build a CSS background expression that paints the overlay onto a 100% × 100%
 * box. Used by the React preview's absolute-positioned overlay div.
 */
export function overlayCssBackground(s: VideoSettings): string | null {
  if (s.overlayStyle === 'none' || s.overlayOpacity === 0) return null
  const a = s.overlayOpacity / 100
  const c = s.overlayColor
  switch (s.overlayStyle) {
    case 'solid':
      return rgba(c, a)
    case 'bottom-gradient':
      return `linear-gradient(180deg, ${rgba(c, 0)} 0%, ${rgba(c, a * 0.5)} 55%, ${rgba(c, a)} 100%)`
    case 'top-gradient':
      return `linear-gradient(180deg, ${rgba(c, a)} 0%, ${rgba(c, a * 0.5)} 45%, ${rgba(c, 0)} 100%)`
    case 'vignette':
      return `radial-gradient(ellipse at center, ${rgba(c, 0)} 35%, ${rgba(c, a * 0.55)} 75%, ${rgba(c, a)} 100%)`
    case 'center-focus':
      return `radial-gradient(ellipse at center, ${rgba(c, a)} 0%, ${rgba(c, a * 0.5)} 45%, ${rgba(c, 0)} 80%)`
    default:
      return null
  }
}

/**
 * Paint the overlay onto a CanvasRenderingContext2D. Mirrors the CSS shapes
 * from `overlayCssBackground` so the exported frame matches the preview.
 */
export function paintOverlayOnCanvas(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  s: VideoSettings,
) {
  if (s.overlayStyle === 'none' || s.overlayOpacity === 0) return
  const a = s.overlayOpacity / 100
  const c = s.overlayColor
  const { r, g, b } = hexToRgb(c)
  const fill = (alpha: number) => `rgba(${r}, ${g}, ${b}, ${alpha})`

  switch (s.overlayStyle) {
    case 'solid': {
      ctx.fillStyle = fill(a)
      ctx.fillRect(0, 0, W, H)
      break
    }
    case 'bottom-gradient': {
      const grad = ctx.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, fill(0))
      grad.addColorStop(0.55, fill(a * 0.5))
      grad.addColorStop(1, fill(a))
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)
      break
    }
    case 'top-gradient': {
      const grad = ctx.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, fill(a))
      grad.addColorStop(0.45, fill(a * 0.5))
      grad.addColorStop(1, fill(0))
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)
      break
    }
    case 'vignette': {
      const grad = ctx.createRadialGradient(
        W / 2,
        H / 2,
        Math.min(W, H) * 0.18,
        W / 2,
        H / 2,
        Math.max(W, H) * 0.7,
      )
      grad.addColorStop(0, fill(0))
      grad.addColorStop(0.55, fill(a * 0.55))
      grad.addColorStop(1, fill(a))
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)
      break
    }
    case 'center-focus': {
      const grad = ctx.createRadialGradient(
        W / 2,
        H / 2,
        Math.min(W, H) * 0.05,
        W / 2,
        H / 2,
        Math.max(W, H) * 0.7,
      )
      grad.addColorStop(0, fill(a))
      grad.addColorStop(0.45, fill(a * 0.5))
      grad.addColorStop(1, fill(0))
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)
      break
    }
  }
}
