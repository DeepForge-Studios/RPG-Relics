"""Generate simple 16x16 placeholder icons for the example trinket add-on."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "RP" / "textures" / "items"


def ring_icon() -> Image.Image:
    img = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    for x in range(16):
        for y in range(16):
            dx, dy = x - 7.5, y - 7.5
            dist = (dx * dx + dy * dy) ** 0.5
            if 4.0 <= dist <= 6.2:
                img.putpixel((x, y), (200, 40, 60, 255))
            elif dist < 3.2:
                img.putpixel((x, y), (120, 20, 35, 255))
    return img


def coin_icon() -> Image.Image:
    img = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    for x in range(16):
        for y in range(16):
            dx, dy = x - 7.5, y - 7.5
            dist = (dx * dx + dy * dy) ** 0.5
            if dist <= 6.5:
                img.putpixel((x, y), (220, 180, 40, 255))
            if 5.0 < dist <= 6.5:
                img.putpixel((x, y), (160, 120, 20, 255))
    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    ring_icon().save(OUT / "ruby_ring.png")
    coin_icon().save(OUT / "lucky_coin.png")
    print(f"wrote icons in {OUT}")


if __name__ == "__main__":
    main()
