"""Generate biome-themed mimic textures that stay aligned with geometry.mimic UVs.

Detail paint is constrained to known face rectangles so cracks/vines never
cross UV seams (the main cause of 'scrambled' chest faces).
"""
from __future__ import annotations

import colorsys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "RP/textures/entity/mimic.png"
OUT = ROOT / "RP/textures/entity"

# Box UV face rects for geometry.mimic (u, v, w, h)
FACES = {
    "lid_top": (14, 0, 14, 14),
    "lid_bottom": (28, 0, 14, 14),
    "lid_west": (0, 14, 14, 5),
    "lid_north": (14, 14, 14, 5),
    "lid_east": (28, 14, 14, 5),
    "lid_south": (42, 14, 14, 5),
    "body_top": (14, 19, 14, 14),
    "body_bottom": (28, 19, 14, 14),
    "body_west": (0, 33, 14, 10),
    "body_north": (14, 33, 14, 10),
    "body_east": (28, 33, 14, 10),
    "body_south": (42, 33, 14, 10),
}

SIDE_FACES = [
    "lid_west", "lid_north", "lid_east", "lid_south",
    "body_west", "body_north", "body_east", "body_south",
]
TOP_FACES = ["lid_top", "body_top"]

VARIANTS = {
    "mimic_forest": {
        "hue": 0.02,
        "sat": 1.05,
        "val": 1.0,
        "tint": (0, 0, 0, 0),
        "detail": "forest",
    },
    "mimic_desert": {
        "hue": 0.09,
        "sat": 0.72,
        "val": 1.18,
        "tint": (210, 170, 90, 28),
        "detail": "desert",
    },
    "mimic_swamp": {
        "hue": -0.03,
        "sat": 0.82,
        "val": 0.72,
        "tint": (30, 55, 28, 36),
        "detail": "swamp",
    },
    "mimic_snow": {
        "hue": 0.56,
        "sat": 0.35,
        "val": 1.28,
        "tint": (180, 210, 235, 42),
        "detail": "snow",
    },
    "mimic_jungle": {
        "hue": -0.05,
        "sat": 1.18,
        "val": 0.92,
        "tint": (20, 70, 24, 34),
        "detail": "jungle",
    },
    "mimic_badlands": {
        "hue": 0.02,
        "sat": 1.25,
        "val": 1.05,
        "tint": (150, 45, 20, 40),
        "detail": "badlands",
    },
}


def clamp(v: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, v))


def shift_pixel(r: int, g: int, b: int, cfg: dict) -> tuple[int, int, int]:
    rf, gf, bf = r / 255.0, g / 255.0, b / 255.0
    h, s, v = colorsys.rgb_to_hsv(rf, gf, bf)
    # Keep red mouth / latch mostly alone
    if r > 120 and r > g * 1.4 and r > b * 1.4:
        return r, g, b
    if s < 0.04 and v > 0.82:
        h = (h + cfg["hue"] * 0.25) % 1.0
        s *= cfg["sat"] * 0.35
        v = clamp(v * cfg["val"])
    elif s < 0.08:
        h = (h + cfg["hue"] * 0.15) % 1.0
        s *= cfg["sat"]
        v = clamp(v * cfg["val"])
    else:
        h = (h + cfg["hue"]) % 1.0
        s = clamp(s * cfg["sat"])
        v = clamp(v * cfg["val"])
    nr, ng, nb = colorsys.hsv_to_rgb(h, s, v)
    tr, tg, tb, ta = cfg["tint"]
    if ta:
        a = ta / 255.0
        nr = nr * (1 - a) + (tr / 255.0) * a
        ng = ng * (1 - a) + (tg / 255.0) * a
        nb = nb * (1 - a) + (tb / 255.0) * a
    return int(clamp(nr) * 255), int(clamp(ng) * 255), int(clamp(nb) * 255)


def blend(pixel, color, amount: float):
    r, g, b, a = pixel
    cr, cg, cb = color
    return (
        int(r * (1 - amount) + cr * amount),
        int(g * (1 - amount) + cg * amount),
        int(b * (1 - amount) + cb * amount),
        a,
    )


def is_woodish(pixel) -> bool:
    r, g, b, a = pixel
    if a < 200:
        return False
    # skip mouth red / latch
    if r > 120 and r > g * 1.35 and r > b * 1.35:
        return False
    return r + g + b >= 40


def iter_face(name: str):
    u, v, w, h = FACES[name]
    for y in range(v, v + h):
        for x in range(u, u + w):
            yield x, y, x - u, y - v, w, h


def paint_edge_moss(px, faces, color, dens=0.45):
    for face in faces:
        for x, y, lx, ly, w, h in iter_face(face):
            on_edge = lx <= 1 or ly <= 1 or lx >= w - 2 or ly >= h - 2
            if not on_edge:
                continue
            p = px[x, y]
            if not is_woodish(p):
                continue
            if ((x * 13 + y * 7) % 10) / 10.0 > dens:
                continue
            px[x, y] = blend(p, color, 0.55)


def paint_side_vines(px, faces, color, dens=0.35):
    for face in faces:
        for x, y, lx, ly, w, h in iter_face(face):
            # Vertical vine strips only — stays continuous on that face
            if lx % 5 not in (1, 2):
                continue
            p = px[x, y]
            if not is_woodish(p):
                continue
            if ((lx + ly * 3) % 7) / 7.0 > dens:
                continue
            px[x, y] = blend(p, color, 0.65)


def paint_frost_cracks(px, faces):
    for face in faces:
        for x, y, lx, ly, w, h in iter_face(face):
            p = px[x, y]
            if not is_woodish(p):
                continue
            # Sparse short cracks inside the face only
            if (lx + ly * 2) % 11 == 0 or (lx * 2 - ly) % 13 == 0:
                px[x, y] = blend(p, (120, 220, 255), 0.55)
            elif ly == 0 or lx == 0:
                px[x, y] = blend(p, (230, 245, 255), 0.35)


def paint_sand_bands(px, faces):
    for face in faces:
        for x, y, lx, ly, w, h in iter_face(face):
            p = px[x, y]
            if not is_woodish(p):
                continue
            if ly % 4 == 0:
                px[x, y] = blend(p, (230, 190, 96), 0.4)


def paint_terracotta(px, faces):
    for face in faces:
        for x, y, lx, ly, w, h in iter_face(face):
            p = px[x, y]
            if not is_woodish(p):
                continue
            band = ly % 5
            if band in (0, 1):
                px[x, y] = blend(p, (190, 76, 38), 0.5)
            elif band == 3:
                px[x, y] = blend(p, (230, 134, 58), 0.3)


def paint_bark_knots(px, faces):
    for face in faces:
        for x, y, lx, ly, w, h in iter_face(face):
            p = px[x, y]
            if not is_woodish(p):
                continue
            if (lx * 7 + ly * 3) % 29 == 0:
                px[x, y] = blend(p, (38, 22, 12), 0.55)
            elif (lx + ly * 5) % 23 == 0:
                px[x, y] = blend(p, (52, 135, 45), 0.4)


def apply_details(im: Image.Image, detail: str) -> None:
    px = im.load()
    if detail == "forest":
        paint_bark_knots(px, SIDE_FACES + TOP_FACES)
        paint_edge_moss(px, TOP_FACES + SIDE_FACES, (40, 110, 40), dens=0.4)
    elif detail == "jungle":
        paint_side_vines(px, SIDE_FACES, (18, 115, 35), dens=0.5)
        paint_edge_moss(px, TOP_FACES, (30, 140, 45), dens=0.55)
    elif detail == "swamp":
        paint_edge_moss(px, SIDE_FACES + TOP_FACES, (36, 90, 40), dens=0.6)
        paint_side_vines(px, SIDE_FACES, (50, 95, 40), dens=0.25)
    elif detail == "snow":
        paint_frost_cracks(px, TOP_FACES + SIDE_FACES)
    elif detail == "desert":
        paint_sand_bands(px, SIDE_FACES + TOP_FACES)
    elif detail == "badlands":
        paint_terracotta(px, SIDE_FACES + TOP_FACES)


def force_opaque_used(im: Image.Image) -> None:
    """Make sampled face pixels fully opaque to avoid alphatest sparkle."""
    px = im.load()
    for face in FACES:
        u, v, w, h = FACES[face]
        for y in range(v, v + h):
            for x in range(u, u + w):
                r, g, b, a = px[x, y]
                if a > 0 and a < 255:
                    px[x, y] = (r, g, b, 255)


def recolor(name: str, cfg: dict) -> None:
    im = Image.open(SRC).convert("RGBA")
    out = Image.new("RGBA", im.size)
    src_px = im.load()
    dst_px = out.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = src_px[x, y]
            if a < 8:
                dst_px[x, y] = (0, 0, 0, 0)
                continue
            nr, ng, nb = shift_pixel(r, g, b, cfg)
            dst_px[x, y] = (nr, ng, nb, 255 if a > 8 else 0)
    apply_details(out, cfg["detail"])
    force_opaque_used(out)
    out.save(OUT / f"{name}.png")
    print(f"wrote {name}.png")


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"missing source texture: {SRC}")
    OUT.mkdir(parents=True, exist_ok=True)
    for name, cfg in VARIANTS.items():
        recolor(name, cfg)


if __name__ == "__main__":
    main()
