# Task: integrate-site-logo — Agent: main (super-z)

## Goal
Replace the placeholder Sparkles/Film/Share2 icon logo blocks across the
landing page, app header, and metadata with the real `/logo.png` asset
(along with `/logo-32.png`, `/logo-180.png`, and `/favicon.ico` for the
metadata icons manifest).

## Previous agents' context
- Read `/home/z/my-project/worklog.md` — previous agents built the Quran
  Video Generator app (Surah/Ayat picker, reciter selector, customization
  panel with brand-themed backgrounds incl. Twilight Mosque, watermark
  compositing pipeline, full API + tests).
- Logo assets were already preprocessed and staged in `/public/`:
  - `logo.png` (256×256 RGBA, 64K)
  - `logo-32.png` (32×32, 2.2K)
  - `logo-180.png` (180×180, 35K)
  - `favicon.ico` (828B, multi-res ICO)

## Changes made

### 1. `src/app/layout.tsx` — metadata `icons` block
Replaced the single-string `icon: "/logo.svg"` form with the full array
form so browsers pick the best size:
```ts
icons: {
  icon: [
    { url: '/favicon.ico', sizes: 'any' },
    { url: '/logo-32.png', type: 'image/png', sizes: '32x32' },
    { url: '/logo.png', type: 'image/png', sizes: '256x256' },
  ],
  shortcut: '/favicon.ico',
  apple: '/logo-180.png',
},
```

### 2. `src/app/page.tsx` (landing) — 4 logo placeholders swapped
- **Header logo** (the sticky top bar): replaced the
  `<div className="grid place-items-center h-10 w-10 rounded-xl bg-primary text-primary-foreground"><Sparkles className="h-5 w-5" /></div>`
  block with `<img src="/logo.png" alt="Jariyah Now logo" className="h-10 w-10 rounded-xl object-contain" />`.
- **Hero badge** ("Free • No account required"): replaced
  `<Sparkles className="h-3.5 w-3.5" />` with
  `<img src="/logo.png" alt="" className="h-3.5 w-3.5 rounded-sm" />`.
- **Final CTA section** ("Start creating now"): the task spec called out
  a `Sparkles` block here, but the actual code in the file used
  `<Share2 className="h-7 w-7" />` inside the same
  `h-14 w-14 rounded-2xl bg-primary text-primary-foreground mx-auto mb-6`
  wrapper. Replaced the whole block with
  `<img src="/logo.png" alt="Jariyah Now logo" className="h-14 w-14 rounded-2xl object-contain mx-auto mb-6" />`.
- **Footer logo**: replaced the
  `<div className="grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground"><Sparkles className="h-5 w-5" /></div>`
  block with `<img src="/logo.png" alt="Jariyah Now logo" className="h-9 w-9 rounded-xl object-contain" />`.

### 3. Import cleanup in `src/app/page.tsx`
- `Sparkles` is still used at `icon: Sparkles` in the features array
  (Word-by-word highlighting card), so the import is kept.
- `Share2` was only used at the Final CTA logo block — now unused.
  Removed `Share2,` from the `lucide-react` import to avoid an unused-
  import lint error.

### 4. `src/app/app/page.tsx` (builder header)
Replaced the
`<div className="grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground"><Film className="h-5 w-5" /></div>`
block with `<img src="/logo.png" alt="Jariyah Now logo" className="h-9 w-9 rounded-xl object-contain" />`.
`Film` is still used at the Export-button icon, so its import is kept.

### 5. `src/components/LegalPage.tsx`
Checked both `LegalPage` (the wrapper for /terms, /privacy, /about) and
the exported `SiteFooter` — neither contains a Sparkles/icon logo
placeholder. The SiteFooter renders the brand as plain text
(`<span className="font-medium text-foreground/70">Jariyah Now</span>`),
no logo block to replace. **No changes** to this file.

## Verification (all PASS)

- `ls -lh public/{logo.png,logo-32.png,logo-180.png,favicon.ico}` →
  all 4 files present ✓
  - favicon.ico (828B), logo-180.png (35K), logo-32.png (2.2K),
    logo.png (64K)
- `npx eslint src/app/layout.tsx src/app/page.tsx src/app/app/page.tsx
  src/components/LegalPage.tsx` → exit 0, 0 errors / 0 warnings ✓
- `npx next build` → ✓ Compiled successfully in 10.9s, ✓ TypeScript
  pass, ✓ 13/13 static pages generated, route table intact
  (/, /_not-found, /about, /api, /api/convert-mp4, /api/health,
  /api/render, /api/render-status, /api/timings, /app, /privacy,
  /sitemap.xml, /terms) ✓
- `npx vitest run` → 11 files / 179 tests passed in 1.18s ✓
- `tail dev.log` → clean `GET / 200` after edits, no runtime errors
  related to the logo files ✓

## Summary
The real Jariyah Now logo PNG is now wired in everywhere a logo is
shown: the favicon/icon manifest in `layout.tsx` (covering favicon.ico,
32px PNG, 256px PNG, and apple-touch-icon), the landing-page header
badge, the hero "Free" badge, the final CTA section, the landing
footer, and the app builder header. The old Sparkles/Film/Share2
icon-in-a-primary-square placeholders are all gone. Unused `Share2`
import was pruned; `Sparkles` and `Film` imports are retained because
they're still used elsewhere (feature card icons and the Export-button
icon, respectively). Build, lint, and all 179 tests are green.
