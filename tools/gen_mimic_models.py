"""Generate biome-specific mimic geometry variants.

The base mimic has a small, stable animated rig:
root -> body -> down_head / up_head

These variants keep those bone names so the existing animations still work,
but add biome-themed cubes to change the silhouettes.
"""
from __future__ import annotations

import copy
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "RP/models/entity/mimic.geo.json"
OUT = ROOT / "RP/models/entity"


def cube(origin, size, uv=(32, 64), rotation=None, pivot=None):
    data = {"origin": origin, "size": size, "uv": list(uv)}
    if rotation is not None:
        data["rotation"] = rotation
    if pivot is not None:
        data["pivot"] = pivot
    return data


VARIANTS = {
    "forest": {
        "uv": (32, 64),
        "body": [
            cube([-10, 0, -6], [3, 2, 12]),
            cube([7, 0, -6], [3, 2, 12]),
            cube([-6, 0, 7], [12, 2, 3]),
            cube([-6, 0, -10], [12, 2, 3]),
        ],
        "up_head": [
            cube([-8, 13, -2], [2, 6, 2]),
            cube([6, 13, -2], [2, 6, 2]),
            cube([-10, 17, -2], [5, 1, 2]),
            cube([5, 17, -2], [5, 1, 2]),
            cube([-5, 14, -8], [10, 2, 2]),
        ],
    },
    "desert": {
        "uv": (40, 64),
        "body": [
            cube([-9, 2, -5], [2, 2, 2]),
            cube([7, 4, -3], [2, 2, 2]),
            cube([-8, 5, 6], [2, 2, 2]),
            cube([6, 1, 7], [2, 2, 2]),
        ],
        "up_head": [
            cube([-8, 12, -8], [2, 4, 2]),
            cube([6, 12, -8], [2, 4, 2]),
            cube([-4, 14, -9], [2, 3, 2]),
            cube([2, 14, -9], [2, 3, 2]),
            cube([-7, 14, 5], [14, 2, 2]),
        ],
    },
    "swamp": {
        "uv": (32, 80),
        "body": [
            cube([-9, 0, -4], [2, 3, 8]),
            cube([7, 0, -4], [2, 3, 8]),
            cube([-4, 0, -9], [8, 3, 2]),
            cube([-5, -1, 7], [10, 2, 3]),
        ],
        "up_head": [
            cube([-6, 14, -2], [2, 3, 2]),
            cube([-7, 17, -3], [4, 2, 4]),
            cube([4, 13, 1], [2, 3, 2]),
            cube([3, 16, 0], [4, 2, 4]),
            cube([-8, 9, -9], [1, 5, 1]),
            cube([7, 9, -9], [1, 5, 1]),
        ],
    },
    "snow": {
        "uv": (40, 80),
        "body": [
            cube([-8, 2, -8], [2, 5, 2]),
            cube([6, 2, -8], [2, 5, 2]),
            cube([-8, 2, 6], [2, 5, 2]),
            cube([6, 2, 6], [2, 5, 2]),
        ],
        "up_head": [
            cube([-6, 14, -6], [2, 7, 2]),
            cube([4, 14, -5], [2, 6, 2]),
            cube([-1, 14, 5], [2, 8, 2]),
            cube([-5, 6, -12], [1, 4, 1]),
            cube([0, 6, -12], [1, 5, 1]),
            cube([5, 6, -12], [1, 4, 1]),
        ],
    },
    "jungle": {
        "uv": (32, 96),
        "body": [
            cube([-9, 1, -5], [2, 8, 1]),
            cube([7, 2, -3], [2, 7, 1]),
            cube([-6, 0, 7], [12, 2, 3]),
            cube([-8, 6, 5], [3, 3, 3]),
            cube([5, 5, 6], [3, 3, 3]),
        ],
        "up_head": [
            cube([-8, 14, -7], [16, 2, 14]),
            cube([-10, 12, -3], [2, 6, 1]),
            cube([8, 12, -3], [2, 6, 1]),
            cube([-4, 7, -12], [1, 5, 1]),
            cube([3, 7, -12], [1, 5, 1]),
        ],
    },
    "badlands": {
        "uv": (40, 96),
        "body": [
            cube([-9, 2, -7], [2, 4, 14]),
            cube([7, 2, -7], [2, 4, 14]),
            cube([-7, 1, 7], [14, 3, 2]),
            cube([-7, 1, -9], [14, 3, 2]),
        ],
        "up_head": [
            cube([-9, 13, -6], [3, 4, 3]),
            cube([6, 13, -6], [3, 4, 3]),
            cube([-11, 16, -7], [4, 2, 2]),
            cube([7, 16, -7], [4, 2, 2]),
            cube([-6, 14, 5], [12, 3, 2]),
        ],
    },
}


def bone_by_name(geometry, name):
    for bone in geometry["bones"]:
        if bone["name"] == name:
            return bone
    raise KeyError(name)


def build_variant(name, spec):
    base = json.loads(BASE.read_text(encoding="utf-8"))
    geometry = copy.deepcopy(base["minecraft:geometry"][0])
    geometry["description"]["identifier"] = f"geometry.mimic_{name}"
    geometry["description"]["visible_bounds_width"] = 3.5
    geometry["description"]["visible_bounds_height"] = 3.25
    geometry["description"]["visible_bounds_offset"] = [0, 0.9, 0]

    for bone_name in ("body", "down_head", "up_head"):
        bone_by_name(geometry, bone_name).setdefault("cubes", [])

    bone_by_name(geometry, "body")["cubes"].extend(spec.get("body", []))
    bone_by_name(geometry, "down_head")["cubes"].extend(spec.get("down_head", []))
    bone_by_name(geometry, "up_head")["cubes"].extend(spec.get("up_head", []))

    out = {"format_version": base["format_version"], "minecraft:geometry": [geometry]}
    path = OUT / f"mimic_{name}.geo.json"
    path.write_text(json.dumps(out, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {path.relative_to(ROOT)}")


def main():
    for name, spec in VARIANTS.items():
        build_variant(name, spec)


if __name__ == "__main__":
    main()
