#!/usr/bin/env python3
"""PIL analysis of the watermark PNG: alpha channel stats, bbox, pixel sampling."""
from PIL import Image
import json

IMG = "/home/z/my-project/upload/jariyah-logo_watermark.png"
out = {}

img = Image.open(IMG)
img.load()
out["path"] = IMG
out["format"] = img.format
out["mode"] = img.mode
out["size_px"] = f"{img.width}x{img.height}"

has_alpha = img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info)
out["has_alpha_channel"] = has_alpha

if has_alpha:
    rgba = img.convert("RGBA")
    alpha = rgba.split()[3]
    alpha_data = list(alpha.getdata())
    total = len(alpha_data)
    fully_transparent = sum(1 for a in alpha_data if a == 0)
    fully_opaque = sum(1 for a in alpha_data if a == 255)
    partial = total - fully_transparent - fully_opaque
    min_a = min(alpha_data)
    max_a = max(alpha_data)
    avg_a = sum(alpha_data) / total
    out["alpha"] = {
        "total_pixels": total,
        "fully_transparent (a==0)": fully_transparent,
        "fully_opaque (a==255)": fully_opaque,
        "partial (0<a<255)": partial,
        "pct_transparent": round(100 * fully_transparent / total, 2),
        "pct_opaque": round(100 * fully_opaque / total, 2),
        "pct_partial": round(100 * partial / total, 2),
        "min_alpha": min_a,
        "max_alpha": max_a,
        "avg_alpha": round(avg_a, 2),
        "verdict": (
            "fully opaque" if fully_opaque == total
            else "fully transparent" if fully_transparent == total
            else "mixed (has transparency)"
        ),
    }

    # bbox of non-transparent content (alpha > 0)
    bbox = rgba.getbbox()  # bbox of non-zero (including non-zero alpha) region
    out["bbox_nonzero_alpha"] = bbox
    if bbox:
        x0, y0, x1, y1 = bbox
        out["bbox_size_px"] = f"{x1 - x0}x{y1 - y0}"
        out["bbox_offset_px"] = f"x={x0}, y={y0}"
        out["bbox_pct_of_canvas"] = {
            "width_pct": round(100 * (x1 - x0) / img.width, 2),
            "height_pct": round(100 * (y1 - y0) / img.height, 2),
            "x_offset_pct": round(100 * x0 / img.width, 2),
            "y_offset_pct": round(100 * y0 / img.height, 2),
        }
    # bbox of "fully opaque" content (alpha == 255)
    # build a mask where alpha == 255
    from PIL import ImageOps
    opaque_mask = alpha.point(lambda p: 255 if p == 255 else 0)
    opaque_bbox = opaque_mask.getbbox()
    out["bbox_fully_opaque"] = opaque_bbox

# sample pixels
def sample(x, y):
    px = rgba.getpixel((x, y)) if has_alpha else img.getpixel((x, y))
    return {"x": x, "y": y, "rgba": px}

w, h = img.width, img.height
samples = {
    "center": sample(w // 2, h // 2),
    "top_left_corner": sample(0, 0),
    "top_right_corner": sample(w - 1, 0),
    "bottom_left_corner": sample(0, h - 1),
    "bottom_right_corner": sample(w - 1, h - 1),
    "center_top_edge": sample(w // 2, 0),
    "center_bottom_edge": sample(w // 2, h - 1),
    "center_left_edge": sample(0, h // 2),
    "center_right_edge": sample(w - 1, h // 2),
}
out["pixel_samples"] = samples

# dominant non-transparent color (rough): histogram of opaque pixels
if has_alpha:
    opaque_pixels = [p for p in rgba.getdata() if p[3] > 10]
    if opaque_pixels:
        # bucket RGB to nearest 16
        buckets = {}
        for r, g, b, a in opaque_pixels:
            key = (r // 16 * 16, g // 16 * 16, b // 16 * 16)
            buckets[key] = buckets.get(key, 0) + 1
        top = sorted(buckets.items(), key=lambda kv: kv[1], reverse=True)[:8]
        out["top_color_buckets_rgb16"] = [
            {"rgb_bucket": k, "count": v, "pct_of_opaque": round(100 * v / len(opaque_pixels), 2)}
            for k, v in top
        ]
        out["opaque_pixel_count"] = len(opaque_pixels)

print(json.dumps(out, indent=2))
