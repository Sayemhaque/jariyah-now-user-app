/**
 * Platform brand icons as inline SVG components.
 * Used in the ExportModal platform picker to give each preset a visual identity.
 * These are simplified/stylized versions, not exact brand logos.
 */

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="6" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
    </svg>
  )
}

export function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M10 9l5 3l-5 3z" fill="currentColor" />
    </svg>
  )
}

export function YouTubeShortsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="6" y="2" width="12" height="20" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M10 8l5 4l-5 4z" fill="currentColor" />
    </svg>
  )
}
