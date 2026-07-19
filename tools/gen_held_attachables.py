"""Generate held-in-hand attachables for RPG Relics hand-slot relics.

Creates geometry, hold animations, model textures, and attachable definitions
so relics look 3D when held (sword/tool pose). Requires Blockbench hold animations
to seat correctly in first/third person — generator is disabled by default.
"""
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
RP = ROOT / "RP"
TEX = RP / "textures" / "models" / "attachables"
GEO = RP / "models" / "entity"
ANIM = RP / "animations" / "attachables"
ATT = RP / "attachables"
ITEMS = ROOT / "BP" / "items"

HAND_RELICS = [
    "reapers_hook",
    "storm_parasol",
    "cinderfist",
    "excavator_gauntlets",
    "crusher_gauntlet",
    "fleetstrike_gloves",
    "impact_knuckles",
    "leeching_glove",
]

# Per-item tint for shared gauntlet geometry (primary, secondary, accent)
GAUNTLET_PALETTES = {
    "cinderfist": ((92, 58, 42), (42, 30, 55), (210, 140, 50)),
    "excavator_gauntlets": ((90, 95, 110), (30, 28, 55), (160, 120, 70)),
    "crusher_gauntlet": ((70, 72, 80), (28, 26, 45), (120, 120, 130)),
    "fleetstrike_gloves": ((70, 55, 50), (20, 18, 28), (180, 100, 90)),
    "impact_knuckles": ((50, 70, 95), (20, 22, 48), (40, 140, 200)),
    "leeching_glove": ((50, 90, 55), (25, 30, 22), (140, 40, 50)),
}


def ensure_dirs() -> None:
    for d in (TEX, GEO, ANIM, ATT):
        d.mkdir(parents=True, exist_ok=True)


def fill_rect(img: Image.Image, box: tuple[int, int, int, int], color: tuple[int, ...]) -> None:
    ImageDraw.Draw(img).rectangle(box, fill=color)


def make_scythe_texture() -> None:
    """32x32 atlas: shaft / blade / wrap."""
    img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    # shaft wood
    fill_rect(img, (0, 0, 3, 31), (78, 52, 32, 255))
    fill_rect(img, (1, 0, 2, 31), (98, 68, 40, 255))
    # metal collar
    fill_rect(img, (0, 4, 3, 7), (90, 90, 105, 255))
    # blade grey-violet (matches Harvest Scythe icon)
    fill_rect(img, (8, 0, 27, 7), (70, 68, 95, 255))
    fill_rect(img, (8, 1, 26, 5), (110, 100, 140, 255))
    fill_rect(img, (24, 0, 27, 10), (55, 52, 75, 255))
    # edge highlight
    fill_rect(img, (8, 0, 26, 1), (180, 175, 200, 255))
    img.save(TEX / "reapers_hook.png")


def make_lantern_texture() -> None:
    """32x32 atlas: frame / glass / flame / handle."""
    img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    # dark metal frame
    fill_rect(img, (0, 0, 15, 15), (40, 40, 55, 255))
    fill_rect(img, (2, 2, 13, 13), (55, 55, 72, 255))
    # glass windows
    fill_rect(img, (3, 4, 6, 11), (120, 160, 200, 220))
    fill_rect(img, (9, 4, 12, 11), (120, 160, 200, 220))
    # flame
    fill_rect(img, (6, 6, 9, 11), (255, 200, 80, 255))
    fill_rect(img, (7, 5, 8, 7), (255, 240, 160, 255))
    # handle wood
    fill_rect(img, (16, 0, 19, 23), (70, 48, 30, 255))
    fill_rect(img, (17, 0, 18, 23), (95, 65, 40, 255))
    # top cap
    fill_rect(img, (4, 0, 11, 2), (50, 50, 65, 255))
    img.save(TEX / "storm_parasol.png")


def make_gauntlet_texture(item_id: str, primary, secondary, accent) -> None:
    """32x32 atlas matching held_gauntlet.geo UV regions."""
    img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    p = (*primary, 255)
    s = (*secondary, 255)
    a = (*accent, 255)
    # cuff band
    fill_rect(img, (0, 0, 15, 7), s)
    fill_rect(img, (2, 2, 13, 5), p)
    # hand / palm
    fill_rect(img, (0, 8, 15, 23), p)
    fill_rect(img, (2, 10, 13, 21), tuple(min(255, c + 18) for c in primary) + (255,))
    # knuckles
    fill_rect(img, (16, 0, 31, 7), a)
    fill_rect(img, (17, 1, 30, 6), tuple(min(255, c + 30) for c in accent) + (255,))
    # strap
    fill_rect(img, (16, 8, 31, 11), s)
    img.save(TEX / f"{item_id}.png")


def write_json(path: Path, data: object) -> None:
    path.write_text(json.dumps(data, indent="\t") + "\n", encoding="utf-8")


def make_scythe_geo() -> None:
    # Compact sickle: grip at origin, shaft up Y, blade toward +X.
    # Sized like a Minecraft tool (~16 long), not a player-height prop.
    write_json(
        GEO / "harvest_scythe.geo.json",
        {
            "format_version": "1.16.0",
            "minecraft:geometry": [
                {
                    "description": {
                        "identifier": "geometry.harvest_scythe",
                        "texture_width": 32,
                        "texture_height": 32,
                        "visible_bounds_width": 2,
                        "visible_bounds_height": 2.5,
                        "visible_bounds_offset": [0, 0.75, 0],
                    },
                    "bones": [
                        {
                            "name": "root_item",
                            "pivot": [0, 0, 0],
                            "binding": "q.item_slot_to_bone_name(c.item_slot)",
                        },
                        {
                            "name": "scythe",
                            "parent": "root_item",
                            "pivot": [0, 0, 0],
                            "cubes": [
                                {
                                    "origin": [-0.5, 0, -0.5],
                                    "size": [1, 14, 1],
                                    "uv": {
                                        "north": {"uv": [0, 0], "uv_size": [1, 14]},
                                        "east": {"uv": [1, 0], "uv_size": [1, 14]},
                                        "south": {"uv": [0, 0], "uv_size": [1, 14]},
                                        "west": {"uv": [1, 0], "uv_size": [1, 14]},
                                        "up": {"uv": [0, 0], "uv_size": [1, 1]},
                                        "down": {"uv": [0, 14], "uv_size": [1, 1]},
                                    },
                                },
                                {
                                    "origin": [-0.75, 12.5, -0.75],
                                    "size": [1.5, 1.5, 1.5],
                                    "uv": {
                                        "north": {"uv": [0, 4], "uv_size": [2, 2]},
                                        "east": {"uv": [0, 4], "uv_size": [2, 2]},
                                        "south": {"uv": [0, 4], "uv_size": [2, 2]},
                                        "west": {"uv": [0, 4], "uv_size": [2, 2]},
                                        "up": {"uv": [0, 4], "uv_size": [2, 2]},
                                        "down": {"uv": [0, 4], "uv_size": [2, 2]},
                                    },
                                },
                                {
                                    "origin": [0, 12.75, -0.4],
                                    "size": [7, 1.2, 0.8],
                                    "uv": {
                                        "north": {"uv": [8, 1], "uv_size": [7, 1]},
                                        "east": {"uv": [24, 0], "uv_size": [1, 1]},
                                        "south": {"uv": [8, 3], "uv_size": [7, 1]},
                                        "west": {"uv": [8, 0], "uv_size": [1, 1]},
                                        "up": {"uv": [8, 0], "uv_size": [7, 1]},
                                        "down": {"uv": [8, 4], "uv_size": [7, 1]},
                                    },
                                },
                                {
                                    "origin": [5.5, 9.5, -0.4],
                                    "size": [1.5, 4, 0.8],
                                    "uv": {
                                        "north": {"uv": [24, 0], "uv_size": [2, 4]},
                                        "east": {"uv": [24, 0], "uv_size": [1, 4]},
                                        "south": {"uv": [24, 0], "uv_size": [2, 4]},
                                        "west": {"uv": [24, 0], "uv_size": [1, 4]},
                                        "up": {"uv": [24, 0], "uv_size": [2, 1]},
                                        "down": {"uv": [24, 3], "uv_size": [2, 1]},
                                    },
                                },
                            ],
                        },
                    ],
                }
            ],
        },
    )


def make_lantern_geo() -> None:
    write_json(
        GEO / "storm_lantern.geo.json",
        {
            "format_version": "1.16.0",
            "minecraft:geometry": [
                {
                    "description": {
                        "identifier": "geometry.storm_lantern",
                        "texture_width": 32,
                        "texture_height": 32,
                        "visible_bounds_width": 1.5,
                        "visible_bounds_height": 2,
                        "visible_bounds_offset": [0, 0.5, 0],
                    },
                    "bones": [
                        {
                            "name": "root_item",
                            "pivot": [0, 0, 0],
                            "binding": "q.item_slot_to_bone_name(c.item_slot)",
                        },
                        {
                            "name": "lantern",
                            "parent": "root_item",
                            "pivot": [0, 0, 0],
                            "cubes": [
                                {
                                    "origin": [-0.4, 0, -0.4],
                                    "size": [0.8, 8, 0.8],
                                    "uv": {
                                        "north": {"uv": [16, 0], "uv_size": [1, 8]},
                                        "east": {"uv": [17, 0], "uv_size": [1, 8]},
                                        "south": {"uv": [16, 0], "uv_size": [1, 8]},
                                        "west": {"uv": [17, 0], "uv_size": [1, 8]},
                                        "up": {"uv": [16, 0], "uv_size": [1, 1]},
                                        "down": {"uv": [16, 7], "uv_size": [1, 1]},
                                    },
                                },
                                {
                                    "origin": [-1.75, 7, -1.75],
                                    "size": [3.5, 4.5, 3.5],
                                    "uv": {
                                        "north": {"uv": [0, 0], "uv_size": [4, 5]},
                                        "east": {"uv": [6, 0], "uv_size": [4, 5]},
                                        "south": {"uv": [0, 0], "uv_size": [4, 5]},
                                        "west": {"uv": [6, 0], "uv_size": [4, 5]},
                                        "up": {"uv": [4, 0], "uv_size": [4, 4]},
                                        "down": {"uv": [4, 0], "uv_size": [4, 4]},
                                    },
                                },
                                {
                                    "origin": [-2, 11, -2],
                                    "size": [4, 1.2, 4],
                                    "uv": {
                                        "north": {"uv": [0, 0], "uv_size": [4, 1]},
                                        "east": {"uv": [0, 0], "uv_size": [4, 1]},
                                        "south": {"uv": [0, 0], "uv_size": [4, 1]},
                                        "west": {"uv": [0, 0], "uv_size": [4, 1]},
                                        "up": {"uv": [4, 0], "uv_size": [4, 4]},
                                        "down": {"uv": [4, 0], "uv_size": [4, 4]},
                                    },
                                },
                                {
                                    "origin": [-0.6, 8, -0.6],
                                    "size": [1.2, 2, 1.2],
                                    "uv": {
                                        "north": {"uv": [6, 6], "uv_size": [2, 2]},
                                        "east": {"uv": [6, 6], "uv_size": [2, 2]},
                                        "south": {"uv": [6, 6], "uv_size": [2, 2]},
                                        "west": {"uv": [6, 6], "uv_size": [2, 2]},
                                        "up": {"uv": [7, 5], "uv_size": [1, 1]},
                                        "down": {"uv": [7, 9], "uv_size": [1, 1]},
                                    },
                                },
                            ],
                        },
                    ],
                }
            ],
        },
    )


def make_gauntlet_geo() -> None:
    # Palm-sized fist prop (hand bone is ~2 units), not a boxing glove.
    write_json(
        GEO / "held_gauntlet.geo.json",
        {
            "format_version": "1.16.0",
            "minecraft:geometry": [
                {
                    "description": {
                        "identifier": "geometry.held_gauntlet",
                        "texture_width": 32,
                        "texture_height": 32,
                        "visible_bounds_width": 1,
                        "visible_bounds_height": 1,
                        "visible_bounds_offset": [0, 0.25, 0],
                    },
                    "bones": [
                        {
                            "name": "root_item",
                            "pivot": [0, 0, 0],
                            "binding": "q.item_slot_to_bone_name(c.item_slot)",
                        },
                        {
                            "name": "gauntlet",
                            "parent": "root_item",
                            "pivot": [0, 0, 0],
                            "cubes": [
                                {
                                    "origin": [-1.2, -0.5, -1.2],
                                    "size": [2.4, 1.6, 2.4],
                                    "uv": {
                                        "north": {"uv": [0, 0], "uv_size": [3, 2]},
                                        "east": {"uv": [5, 0], "uv_size": [3, 2]},
                                        "south": {"uv": [0, 0], "uv_size": [3, 2]},
                                        "west": {"uv": [5, 0], "uv_size": [3, 2]},
                                        "up": {"uv": [0, 0], "uv_size": [3, 3]},
                                        "down": {"uv": [0, 0], "uv_size": [3, 3]},
                                    },
                                },
                                {
                                    "origin": [-1.4, 0.9, -1.4],
                                    "size": [2.8, 2.6, 2.8],
                                    "uv": {
                                        "north": {"uv": [0, 8], "uv_size": [3, 3]},
                                        "east": {"uv": [6, 8], "uv_size": [3, 3]},
                                        "south": {"uv": [0, 8], "uv_size": [3, 3]},
                                        "west": {"uv": [6, 8], "uv_size": [3, 3]},
                                        "up": {"uv": [0, 8], "uv_size": [3, 3]},
                                        "down": {"uv": [0, 14], "uv_size": [3, 3]},
                                    },
                                },
                                {
                                    "origin": [-1.5, 2.8, -1.55],
                                    "size": [3, 1, 1.1],
                                    "uv": {
                                        "north": {"uv": [16, 0], "uv_size": [3, 1]},
                                        "east": {"uv": [16, 2], "uv_size": [1, 1]},
                                        "south": {"uv": [16, 0], "uv_size": [3, 1]},
                                        "west": {"uv": [16, 2], "uv_size": [1, 1]},
                                        "up": {"uv": [16, 0], "uv_size": [3, 1]},
                                        "down": {"uv": [16, 4], "uv_size": [3, 1]},
                                    },
                                },
                            ],
                        },
                    ],
                }
            ],
        },
    )


def make_animations() -> None:
    # Y ~24–27 counters Bedrock's bound-item -24 offset.
    write_json(
        ANIM / "held_relics.animation.json",
        {
            "format_version": "1.8.0",
            "animations": {
                "animation.curio.tool.first_person_hold": {
                    "loop": True,
                    "bones": {
                        "root_item": {
                            "rotation": [100, 56, -32],
                            "position": [-1, 15, 7],
                            "scale": 0.75,
                        }
                    },
                },
                "animation.curio.tool.third_person_hold": {
                    "loop": True,
                    "bones": {
                        "root_item": {
                            "rotation": [30, 0, 0],
                            "position": [0.5, 24, -3.5],
                            "scale": 0.65,
                        }
                    },
                },
                "animation.curio.gauntlet.first_person_hold": {
                    "loop": True,
                    "bones": {
                        "root_item": {
                            "rotation": [90, 40, -15],
                            "position": [0.5, 16, 5],
                            "scale": 0.7,
                        }
                    },
                },
                "animation.curio.gauntlet.third_person_hold": {
                    "loop": True,
                    "bones": {
                        "root_item": {
                            "rotation": [0, 0, 0],
                            "position": [0, 24, -1],
                            "scale": 0.55,
                        }
                    },
                },
            },
        },
    )


def make_attachable(
    item_id: str,
    texture: str,
    geometry: str,
    first_anim: str,
    third_anim: str,
) -> None:
    write_json(
        ATT / f"{item_id}.json",
        {
            "format_version": "1.10.0",
            "minecraft:attachable": {
                "description": {
                    "identifier": f"relics:{item_id}",
                    "materials": {
                        "default": "entity_alphatest",
                        "enchanted": "entity_alphatest_glint",
                    },
                    "textures": {
                        "default": texture,
                        "enchanted": "textures/misc/enchanted_item_glint",
                    },
                    "geometry": {"default": geometry},
                    "animations": {
                        "first_person_hold": first_anim,
                        "third_person_hold": third_anim,
                    },
                    "scripts": {
                        "animate": [
                            {"first_person_hold": "c.is_first_person"},
                            {"third_person_hold": "!c.is_first_person"},
                        ]
                    },
                    "render_controllers": ["controller.render.item_default"],
                }
            },
        },
    )


def set_hand_equipped(item_id: str) -> None:
    path = ITEMS / f"{item_id}.json"
    data = json.loads(path.read_text(encoding="utf-8-sig"))
    comps = data["minecraft:item"]["components"]
    if comps.get("minecraft:hand_equipped") is True:
        return
    comps["minecraft:hand_equipped"] = True
    path.write_text(json.dumps(data, indent=4) + "\n", encoding="utf-8")
    print(f"  hand_equipped -> {item_id}")


def main() -> None:
    import sys

    if "--force" not in sys.argv:
        print(
            "Skipped: held attachables were removed (FP/TP seating was broken).\n"
            "Items use hand_equipped flat tool pose instead.\n"
            "Pass --force only if rebuilding attachables intentionally."
        )
        return

    ensure_dirs()
    print("Textures...")
    make_scythe_texture()
    make_lantern_texture()
    for item_id, pal in GAUNTLET_PALETTES.items():
        make_gauntlet_texture(item_id, *pal)

    print("Geometry...")
    make_scythe_geo()
    make_lantern_geo()
    make_gauntlet_geo()

    print("Animations...")
    make_animations()

    print("Attachables...")
    make_attachable(
        "reapers_hook",
        "textures/models/attachables/reapers_hook",
        "geometry.harvest_scythe",
        "animation.curio.tool.first_person_hold",
        "animation.curio.tool.third_person_hold",
    )
    make_attachable(
        "storm_parasol",
        "textures/models/attachables/storm_parasol",
        "geometry.storm_lantern",
        "animation.curio.tool.first_person_hold",
        "animation.curio.tool.third_person_hold",
    )
    for item_id in GAUNTLET_PALETTES:
        make_attachable(
            item_id,
            f"textures/models/attachables/{item_id}",
            "geometry.held_gauntlet",
            "animation.curio.gauntlet.first_person_hold",
            "animation.curio.gauntlet.third_person_hold",
        )

    print("BP hand_equipped...")
    for item_id in HAND_RELICS:
        set_hand_equipped(item_id)

    print("Done.")


if __name__ == "__main__":
    main()
