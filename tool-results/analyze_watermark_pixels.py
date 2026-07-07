#!/usr/bin/env python3
"""Pixel-level analysis of the watermark PNG using PIL."""
from PIL import Image
import numpy as np
from collections import Counter

IMG = "/home/z/my-project/upload/jariyah-now-watermark.png"

img = Image.open(IMG)
print(f"=== IMAGE METADATA ===")
print(f"Mode: {img.mode}")
print(f"Size: {img.size} (W x H)")
print(f"Format: {img.format}")
print(f"Has alpha channel: {'A' in img.mode or img.mode == 'RGBA'}")

# Force RGBA for uniform analysis
if img.mode != "RGBA":
    img = img.convert("RGBA")

arr = np.array(img)
H, W, _ = arr.shape
print(f"Array shape: {arr.shape}")

alpha = arr[:, :, 3]
rgb = arr[:, :, :3]

# --- ALPHA CHANNEL ANALYSIS ---
print(f"\n=== ALPHA CHANNEL ===")
total_pixels = H * W
fully_transparent = int(np.sum(alpha == 0))
fully_opaque = int(np.sum(alpha == 255))
partial = total_pixels - fully_transparent - fully_opaque
print(f"Total pixels: {total_pixels}")
print(f"Fully transparent (alpha=0):   {fully_transparent:>10} ({100*fully_transparent/total_pixels:6.2f}%)")
print(f"Fully opaque (alpha=255):      {fully_opaque:>10} ({100*fully_opaque/total_pixels:6.2f}%)")
print(f"Partial alpha (1..254):        {partial:>10} ({100*partial/total_pixels:6.2f}%)")
print(f"Alpha min={int(alpha.min())}, max={int(alpha.max())}, mean={float(alpha.mean()):.2f}")

# Distribution of partial alpha values (anti-aliasing hint)
if partial > 0:
    partial_vals = alpha[(alpha > 0) & (alpha < 255)]
    print(f"Partial alpha value distribution (10 bins):")
    hist, edges = np.histogram(partial_vals, bins=10)
    for h, lo, hi in zip(hist, edges[:-1], edges[1:]):
        print(f"  {int(lo):3d}-{int(hi):3d}: {h:>8}")

# --- BOUNDING BOX OF NON-TRANSPARENT CONTENT ---
print(f"\n=== BOUNDING BOX OF NON-TRANSPARENT CONTENT ===")
# Use alpha > 0 threshold (anything not fully transparent)
mask = alpha > 0
if mask.any():
    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)
    top, bottom = np.where(rows)[0][[0, -1]]
    left, right = np.where(cols)[0][[0, -1]]
    print(f"Bounding box (alpha>0): left={left}, top={top}, right={right}, bottom={bottom}")
    print(f"Content size: {right-left+1} x {bottom-top+1}")
    print(f"Padding: left={left}, top={top}, right={W-1-right}, bottom={H-1-bottom}")
    print(f"Content area: {100*(right-left+1)*(bottom-top+1)/(W*H):.2f}% of frame")

# Also a stricter bounding box using alpha >= 16 (ignore nearly-transparent fringes)
mask_strict = alpha >= 16
if mask_strict.any():
    rows = np.any(mask_strict, axis=1)
    cols = np.any(mask_strict, axis=0)
    top, bottom = np.where(rows)[0][[0, -1]]
    left, right = np.where(cols)[0][[0, -1]]
    print(f"Bounding box (alpha>=16): left={left}, top={top}, right={right}, bottom={bottom}")
    print(f"Content size: {right-left+1} x {bottom-top+1}")

# --- PIXEL SAMPLING ---
print(f"\n=== PIXEL SAMPLES ===")
def px(x, y, label):
    r, g, b, a = arr[y, x]
    print(f"  {label:25s} ({x:4d},{y:4d})  RGB=({r:3d},{g:3d},{b:3d})  A={a:3d}  hex=#{r:02X}{g:02X}{b:02X}")

px(0, 0, "top-left corner")
px(W-1, 0, "top-right corner")
px(0, H-1, "bottom-left corner")
px(W-1, H-1, "bottom-right corner")
px(W//2, H//2, "exact center")
px(W//2, H//4, "top-center")
px(W//2, 3*H//4, "bottom-center")
px(W//4, H//2, "left-center")
px(3*W//4, H//2, "right-center")

# --- DOMINANT OPAQUE COLORS ---
print(f"\n=== DOMINANT COLORS (among opaque-ish pixels, alpha >= 200) ===")
opaque_mask = alpha >= 200
if opaque_mask.any():
    opaque_rgb = rgb[opaque_mask]
    # Quantize to reduce color count (round to nearest 8)
    q = (opaque_rgb // 8) * 8
    # Count unique
    flat = [tuple(c) for c in q]
    counter = Counter(flat)
    print(f"Unique quantized colors among opaque pixels: {len(counter)}")
    print(f"Top 10 colors:")
    for color, count in counter.most_common(10):
        pct = 100 * count / int(opaque_mask.sum())
        r, g, b = color
        print(f"  #{r:02X}{g:02X}{b:02X}  ({r:3d},{g:3d},{b:3d})  count={count:>8} ({pct:5.2f}% of opaque)")

# --- DOMINANT NEAR-WHITE / NEAR-BLACK CHECK ---
print(f"\n=== LUMINANCE CHECK (opaque pixels) ===")
if opaque_mask.any():
    lum = (0.299*opaque_rgb[:,0] + 0.587*opaque_rgb[:,1] + 0.114*opaque_rgb[:,2])
    near_white = int(np.sum(lum >= 240))
    near_black = int(np.sum(lum <= 15))
    mid = int(np.sum((lum > 15) & (lum < 240)))
    total_op = int(opaque_mask.sum())
    print(f"Near-white (lum>=240): {near_white} ({100*near_white/total_op:.2f}%)")
    print(f"Mid-tone (15<lum<240): {mid} ({100*mid/total_op:.2f}%)")
    print(f"Near-black (lum<=15): {near_black} ({100*near_black/total_op:.2f}%)")
    print(f"Mean luminance of opaque pixels: {float(lum.mean()):.2f}")
    print(f"Luminance std dev: {float(lum.std()):.2f}")

print("\n=== DONE ===")
