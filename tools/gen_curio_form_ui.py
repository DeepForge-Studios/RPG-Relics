"""Generate purple/gold nineslice textures for the scripted-form (ActionForm)
reskin: window background + button default/hover/pressed states.

Palette from BP/scripts/theme.js UiRgb.hex — do not invent new colors.
"""
import json
import os

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "RP", "textures", "ui")

GOLD = (201, 162, 39, 255)        # borderGold #C9A227
GOLD_SHADOW = (122, 94, 23, 255)  # darkened borderGold
WINDOW = (42, 21, 56, 255)        # windowPurple #2A1538
DEEP = (26, 14, 36, 255)          # deepPurple #1A0E24
SLOT = (61, 42, 79, 255)          # slotBg #3D2A4F
SLOT_HI = (82, 57, 107, 255)      # lightened slotBg (hover fill)
SLOT_EDGE = (36, 24, 49, 255)     # darkened slotBg (button border)


def save(name, img, nineslice, base_size):
    img.save(os.path.join(OUT, f"{name}.png"))
    meta = {"nineslice_size": nineslice, "base_size": base_size}
    with open(os.path.join(OUT, f"{name}.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)
    print(f"wrote {name}.png + .json")


def window_bg():
    """48x48. Top slice 26px bakes the header band + gold divider so the form
    title strip stays fixed while the body stretches."""
    size = 48
    img = Image.new("RGBA", (size, size), WINDOW)
    d = ImageDraw.Draw(img)
    # header band behind the title
    d.rectangle([0, 0, size - 1, 21], fill=DEEP)
    # gold divider under the header (title area is ~22px tall)
    d.rectangle([2, 22, size - 3, 22], fill=GOLD)
    d.rectangle([2, 23, size - 3, 23], fill=GOLD_SHADOW)
    # outer gold rim (2px) with a 1px dark outline outside
    d.rectangle([0, 0, size - 1, size - 1], outline=DEEP, width=1)
    d.rectangle([1, 1, size - 2, size - 2], outline=GOLD, width=2)
    d.rectangle([3, 3, size - 4, size - 4], outline=GOLD_SHADOW, width=1)
    save("curio_form_bg", img, [8, 26, 8, 8], [size, size])


def button(name, fill, border):
    size = 16
    img = Image.new("RGBA", (size, size), fill)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, size - 1, size - 1], outline=border, width=1)
    save(name, img, 4, [size, size])


window_bg()
button("curio_form_button", SLOT, SLOT_EDGE)
button("curio_form_button_hover", SLOT_HI, GOLD)
button("curio_form_button_pressed", DEEP, GOLD_SHADOW)
