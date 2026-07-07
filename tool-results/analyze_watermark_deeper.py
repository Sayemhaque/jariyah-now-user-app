#!/usr/bin/env python3
"""Deeper analysis: locate the actually-opaque white icon inside the dark wash."""
from PIL import Image
import numpy as np
from collections import Counter

IMG = "/home/z/my-project/upload/jariyah-now-watermark.png"
img = Image.open(IMG).convert("RGBA")
arr = np.array(img)
H, W, _ = arr.shape
alpha = arr[:, :, 3]
rgb = arr[:, :, :3]

# Where is the truly opaque content (alpha >= 200)?
print("=== OPAQUE-ICON LOCATION (alpha >= 200) ===")
opaque_mask = alpha >= 200
rows = np.any(opaque_mask, axis=1)
cols = np.any(opaque_mask, axis=0)
if rows.any():
    top, bottom = np.where(rows)[0][[0, -1]]
    left, right = np.where(cols)[0][[0, -1]]
    print(f"Opaque bbox: left={left}, top={top}, right={right}, bottom={bottom}")
    print(f"Opaque content size: {right-left+1} x {bottom-top+1}")
    print(f"Padding around opaque content: left={left}, top={top}, right={W-1-right}, bottom={H-1-bottom}")
    cx = (left+right)//2; cy = (top+bottom)//2
    print(f"Opaque content center: ({cx}, {cy})  -- frame center is ({W//2}, {H//2})")
    print(f"Offset from frame center: dx={cx-W//2}, dy={cy-H//2}")
else:
    print("No fully opaque pixels.")

# Where is alpha >= 100 (clearly visible content)?
print("\n=== VISIBLE-CONTENT LOCATION (alpha >= 100) ===")
vis_mask = alpha >= 100
rows = np.any(vis_mask, axis=1)
cols = np.any(vis_mask, axis=0)
if rows.any():
    top, bottom = np.where(rows)[0][[0, -1]]
    left, right = np.where(cols)[0][[0, -1]]
    print(f"Visible bbox (alpha>=100): left={left}, top={top}, right={right}, bottom={bottom}")
    print(f"Visible content size: {right-left+1} x {bottom-top+1}")

# Composited-on-white vs composited-on-black preview samples
print("\n=== COMPOSITING PREVIEW (what the VLM 'saw') ===")
# Background = white (255,255,255)
white_bg = (rgb.astype(int) * alpha[:,:,None].astype(int)/255 + 255 * (1 - alpha[:,:,None].astype(int)/255)).astype(np.uint8)
# Background = black (0,0,0)
black_bg = (rgb.astype(int) * alpha[:,:,None].astype(int)/255).astype(np.uint8)
# Background = checkerboard (typical transparency view) -> just skip

def sample_composited(x, y, label, base, comp):
    r,g,b = comp[y, x]
    print(f"  {label:25s} ({x:4d},{y:4d}) on {base}: RGB=({r:3d},{g:3d},{b:3d}) hex=#{r:02X}{g:02X}{b:02X}")

for (x,y,lbl) in [(0,0,"corner"), (W//2,H//2,"center"), (W//2,H//4,"top-mid"), (W//2,3*H//4,"bot-mid")]:
    sample_composited(x,y,lbl,"white",white_bg)
    sample_composited(x,y,lbl,"black",black_bg)

# Look at center area: scan a vertical & horizontal strip through frame center, print alpha + RGB
print("\n=== CENTER VERTICAL SCAN (x=W/2, every 80px) ===")
x = W//2
for y in range(0, H, 80):
    r,g,b,a = arr[y, x]
    print(f"  y={y:4d}  RGB=({r:3d},{g:3d},{b:3d})  A={a:3d}")

print("\n=== CENTER HORIZONTAL SCAN (y=H/2, every 80px) ===")
y = H//2
for x in range(0, W, 80):
    r,g,b,a = arr[y, x]
    print(f"  x={x:4d}  RGB=({r:3d},{g:3d},{b:3d})  A={a:3d}")

# Quantize & summarize the dark "wash" color (pixels with 30<=alpha<=60 and dark RGB)
print("\n=== DARK-WASH COLOR ANALYSIS (alpha 30-60) ===")
wash_mask = (alpha >= 30) & (alpha <= 60)
if wash_mask.any():
    wash_rgb = rgb[wash_mask]
    mean = wash_rgb.mean(axis=0)
    med = np.median(wash_rgb, axis=0)
    print(f"Wash pixel count: {int(wash_mask.sum())} ({100*int(wash_mask.sum())/(W*H):.2f}%)")
    print(f"Wash RGB mean: ({mean[0]:.1f},{mean[1]:.1f},{mean[2]:.1f}) hex=#{int(mean[0]):02X}{int(mean[1]):02X}{int(mean[2]):02X}")
    print(f"Wash RGB median: ({med[0]:.0f},{med[1]:.0f},{med[2]:.0f}) hex=#{int(med[0]):02X}{int(med[1]):02X}{int(med[2]):02X}")
    print(f"Wash alpha mean: {float(alpha[wash_mask].mean()):.1f}")
