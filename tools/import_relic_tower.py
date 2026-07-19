"""Import hand-built tower/home structures and make them pack-ready."""
from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from pathlib import Path

import nbtlib
from nbtlib import Byte, Compound, Float, Int, List, Long, Short, String

ROOT = Path(__file__).resolve().parents[1]
STRUCTURES = ROOT / "BP/structures"

BLOCK_REMAP = {
    "connectedglass:scratched_glass_black_pane": "minecraft:black_stained_glass_pane",
    "mcwtrpdoors:dark_oak_classic_trapdoor": "minecraft:dark_oak_trapdoor",
    "more_slabs_stairs_and_walls:cracked_polished_blackstone_bricks_slab": (
        "minecraft:cracked_polished_blackstone_brick_slab"
    ),
    "more_slabs_stairs_and_walls:cracked_polished_blackstone_bricks_stairs": (
        "minecraft:cracked_polished_blackstone_brick_stairs"
    ),
}
REMOVED_BLOCKS = {"minecraft:structure_block"}
LOOT_TABLE = "loot_tables/relics/chests/tower_chest.json"


@dataclass(frozen=True)
class StructureVariant:
    output_id: str
    src: Path
    mob_profile: str
    # fixed = use the first explicit loot position
    loot_chest: str
    loot_positions: tuple[tuple[int, int, int], ...] = ()
    mimic_chest_pos: tuple[int, int, int] | None = None
    defender_positions: tuple[tuple[str, float, float, float], ...] = ()
    mimic_positions: tuple[tuple[str, float, float, float], ...] = ()


VARIANTS = [
    StructureVariant(
        "relic_tower_spruce",
        Path(r"c:\Users\Carri\Downloads\torre sv.mcstructure"),
        "tower",
        "fixed",
        (
            (14, 24, 15),
            (14, 28, 15),
            (14, 36, 15),
        ),
        (14, 24, 15),
        (
            ("minecraft:pillager", 15.5, 5.0, 15.5),
            ("minecraft:pillager", 13.5, 13.0, 15.5),
            ("minecraft:pillager", 17.5, 21.0, 15.5),
            ("minecraft:pillager", 15.5, 13.0, 15.5),
            ("minecraft:pillager", 15.5, 25.0, 15.5),
            ("minecraft:pillager", 15.5, 33.0, 15.5),
            ("minecraft:pillager", 16.5, 45.0, 15.5),
        ),
        (
            ("relics:mimic", 14.5, 21.0, 15.5),
            ("relics:mimic", 16.5, 29.0, 15.5),
            ("relics:mimic", 15.5, 45.0, 15.5),
        ),
    ),
    StructureVariant(
        "relic_home_fantasy",
        Path(r"c:\Users\Carri\Downloads\0_0_0_House.mcstructure"),
        "home",
        "fixed",
        (
            (15, 19, 7),
            (8, 19, 15),
            (6, 20, 7),
        ),
        (15, 19, 7),
        (
            # Brown wool anchor is (10,1,11): pillager directly above it.
            ("minecraft:pillager", 10.5, 2.0, 11.5),
            ("minecraft:pillager", 13.5, 2.0, 11.5),
            # In the viewer, screen-right is +Z; three blocks right, above support.
            ("minecraft:witch", 10.5, 3.0, 14.5),
            ("minecraft:witch", 13.5, 3.0, 14.5),
            ("minecraft:pillager", 11.5, 11.0, 10.5),
            ("minecraft:witch", 11.5, 19.0, 10.5),
            ("minecraft:pillager", 11.5, 33.0, 10.5),
            ("minecraft:witch", 12.5, 35.0, 10.5),
        ),
        (
            # Left of cracked deepslate marker (9,2,13) in the viewer.
            ("relics:mimic", 9.5, 2.0, 12.5),
            ("relics:mimic", 11.5, 33.0, 10.5),
            ("relics:mimic", 12.5, 19.0, 10.5),
        ),
    ),
]


def linear_index(x: int, y: int, z: int, sy: int, sz: int) -> int:
    """Bedrock .mcstructure block order is Z-fastest, then Y, then X."""
    return z + y * sz + x * sy * sz


def remap_block(block: Compound) -> Compound:
    name = str(block["name"])
    if name in REMOVED_BLOCKS:
        return Compound(
            {
                "name": String("minecraft:air"),
                "states": Compound(),
                "version": block.get("version", Int(18163713)),
            }
        )
    if name in BLOCK_REMAP:
        return Compound(
            {
                "name": String(BLOCK_REMAP[name]),
                "states": block.get("states", Compound()),
                "version": block.get("version", Int(18163713)),
            }
        )
    return block


def block_key(block: Compound) -> str:
    name = str(block["name"])
    states = block.get("states", Compound())
    parts = [name]
    for key in sorted(states.keys()):
        parts.append(f"{key}={states[key]}")
    return "|".join(parts)


def dedupe_palette(old_palette: List[Compound]) -> tuple[List[Compound], list[int]]:
    new_palette: list[Compound] = []
    lookup: dict[str, int] = {}
    old_to_new: list[int] = []
    for block in old_palette:
        remapped = remap_block(block)
        key = block_key(remapped)
        if key not in lookup:
            lookup[key] = len(new_palette)
            new_palette.append(remapped)
        old_to_new.append(lookup[key])
    return List[Compound](new_palette), old_to_new


def palette_index(palette: List[Compound], name: str) -> int | None:
    for i, block in enumerate(palette):
        if str(block["name"]) == name:
            return i
    return None


def ensure_block(palette: List[Compound], block: Compound) -> int:
    key = block_key(block)
    for i, existing in enumerate(palette):
        if block_key(existing) == key:
            return i
    palette.append(block)
    return len(palette) - 1


def chest_block(mimic: bool) -> Compound:
    name = "relics:dummy_chest" if mimic else "minecraft:chest"
    return Compound(
        {
            "name": String(name),
            "states": Compound({"minecraft:cardinal_direction": String("south")}),
            "version": Int(18163713),
        }
    )


def chest_entity(x: int, y: int, z: int) -> Compound:
    return Compound(
        {
            "Findable": Byte(0),
            "Items": List[Compound](),
            "LootTable": String(LOOT_TABLE),
            "id": String("Chest"),
            "isMovable": Byte(1),
            "x": Int(x),
            "y": Int(y),
            "z": Int(z),
        }
    )


def is_solid_floor(name: str) -> bool:
    if name in {"minecraft:air", "minecraft:water", "minecraft:lava", "minecraft:structure_void"}:
        return False
    if name.endswith(
        (
            "_door",
            "_trapdoor",
            "_fence",
            "_fence_gate",
            "_wall",
            "_button",
            "_sign",
            "_carpet",
            "_pressure_plate",
        )
    ):
        return False
    return True


def find_walkable_floors(
    indices: List[Int],
    palette: List[Compound],
    sx: int,
    sy: int,
    sz: int,
) -> list[float]:
    air_idx = palette_index(palette, "minecraft:air")
    if air_idx is None:
        return [2.0, max(2.0, sy * 0.6)]
    cx, cz = sx // 2, sz // 2
    floors: list[float] = []
    for y in range(1, sy - 2):
        for dx, dz in ((0, 0), (1, 0), (-1, 0), (0, 1), (0, -1), (2, 1), (-2, -1)):
            x, z = cx + dx, cz + dz
            if not (0 <= x < sx and 0 <= z < sz):
                continue
            here = int(indices[linear_index(x, y, z, sy, sz)])
            above = int(indices[linear_index(x, y + 1, z, sy, sz)])
            below = int(indices[linear_index(x, y - 1, z, sy, sz)])
            if here != air_idx or above != air_idx:
                continue
            if not is_solid_floor(str(palette[below]["name"])):
                continue
            floors.append(float(y))
            break
    if not floors:
        return [2.0, max(2.0, min(sy - 3.0, sy * 0.65))]
    # Prefer a lower and an upper interior floor.
    lower = floors[len(floors) // 4]
    upper = floors[(3 * len(floors)) // 4]
    if upper <= lower + 2:
        upper = floors[-1]
    return [lower, upper]


def structure_entity(identifier: str, x: float, y: float, z: float) -> Compound:
    # Bedrock stores entities as world NBT. With structure_world_origin = 0,0,0,
    # Pos is treated as an offset from the load origin.
    unique_id = -(
        sum(ord(char) for char in identifier) * 1_000_000_000
        + int(x * 100) * 1_000_000
        + int(y * 100) * 1_000
        + int(z * 100)
    )
    return Compound(
        {
            "identifier": String(identifier),
            "Pos": List[Float]([Float(x), Float(y), Float(z)]),
            "Rotation": List[Float]([Float(0.0), Float(0.0)]),
            "Motion": List[Float]([Float(0.0), Float(0.0), Float(0.0)]),
            "UniqueID": Long(unique_id),
            "OnGround": Byte(1),
            "Fire": Short(0),
        }
    )


def find_roof_chest_pos(indices: List[Int], palette: List[Compound], sx: int, sy: int, sz: int) -> tuple[int, int, int]:
    air_idx = palette_index(palette, "minecraft:air")
    if air_idx is None:
        raise ValueError("palette missing air")
    cx, cz = sx // 2, sz // 2
    for y in range(sy - 1, sy // 2, -1):
        for dz in (-1, 0, 1):
            for dx in (-1, 0, 1):
                x, z = cx + dx, cz + dz
                idx = linear_index(x, y, z, sy, sz)
                if int(indices[idx]) != air_idx:
                    continue
                below = y - 1
                if below < 0:
                    continue
                bidx = int(indices[linear_index(x, below, z, sy, sz)])
                below_name = str(palette[bidx]["name"])
                if any(
                    below_name.endswith(suffix)
                    for suffix in ("_planks", "_bricks", "_slab", "_stairs", "_log", "_hyphae")
                ) or "deepslate" in below_name or "blackstone" in below_name or "terracotta" in below_name:
                    return x, y, z
    return cx, sy - 4, cz


def find_highest_chest(indices: List[Int], palette: List[Compound], sx: int, sy: int, sz: int) -> tuple[int, int, int] | None:
    chest_idx = palette_index(palette, "minecraft:chest")
    if chest_idx is None:
        return None
    best: tuple[int, int, int] | None = None
    for y in range(sy):
        for z in range(sz):
            for x in range(sx):
                if int(indices[linear_index(x, y, z, sy, sz)]) != chest_idx:
                    continue
                if best is None or y > best[1]:
                    best = (x, y, z)
    return best


def find_interior_container(
    indices: List[Int],
    palette: List[Compound],
    sx: int,
    sy: int,
    sz: int,
) -> tuple[int, int, int] | None:
    container_names = {"minecraft:chest", "minecraft:barrel"}
    cx, cz = sx / 2.0, sz / 2.0
    target_y = sy * 0.65
    best: tuple[int, int, int] | None = None
    best_score = float("inf")
    for y in range(max(2, int(sy * 0.2)), min(sy - 2, int(sy * 0.88))):
        for z in range(2, sz - 2):
            for x in range(2, sx - 2):
                name = str(palette[int(indices[linear_index(x, y, z, sy, sz)])]["name"])
                if name not in container_names:
                    continue
                score = abs(x - cx) + abs(z - cz) + abs(y - target_y) * 0.35
                if score < best_score:
                    best_score = score
                    best = (x, y, z)
    return best


def find_interior_floor(
    indices: List[Int],
    palette: List[Compound],
    sx: int,
    sy: int,
    sz: int,
) -> tuple[int, int, int]:
    air_idx = palette_index(palette, "minecraft:air")
    if air_idx is None:
        return sx // 2, max(2, int(sy * 0.6)), sz // 2

    cx, cz = sx / 2.0, sz / 2.0
    target_y = sy * 0.65
    best: tuple[int, int, int] | None = None
    best_score = float("-inf")
    for y in range(2, sy - 2):
        for z in range(2, sz - 2):
            for x in range(2, sx - 2):
                here = int(indices[linear_index(x, y, z, sy, sz)])
                above = int(indices[linear_index(x, y + 1, z, sy, sz)])
                below = int(indices[linear_index(x, y - 1, z, sy, sz)])
                if here != air_idx or above != air_idx:
                    continue
                if not is_solid_floor(str(palette[below]["name"])):
                    continue

                # An interior point should encounter walls in several directions.
                walls = 0
                for dx, dz in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    for distance in range(1, 7):
                        xx, zz = x + dx * distance, z + dz * distance
                        if not (0 <= xx < sx and 0 <= zz < sz):
                            break
                        idx = int(indices[linear_index(xx, y, zz, sy, sz)])
                        if idx != air_idx:
                            walls += 1
                            break
                if walls < 3:
                    continue

                center_distance = abs(x - cx) + abs(z - cz)
                height_distance = abs(y - target_y)
                score = walls * 100 - center_distance * 2 - height_distance
                if score > best_score:
                    best_score = score
                    best = (x, y, z)

    if best is not None:
        return best
    return sx // 2, max(2, min(sy - 3, int(target_y))), sz // 2


def sanitize_block_data(
    bpd: Compound,
    indices: List[Int],
    palette: List[Compound],
    sx: int,
    sy: int,
    sz: int,
) -> Compound:
    cleaned = Compound()
    for key, value in bpd.items():
        linear = int(key)
        x = linear // (sy * sz)
        remainder = linear % (sy * sz)
        y = remainder // sz
        z = remainder % sz
        if not (0 <= x < sx and 0 <= y < sy and 0 <= z < sz):
            continue
        block_name = str(palette[int(indices[linear])]["name"])
        if block_name == "minecraft:air":
            continue
        entity = value.get("block_entity_data", Compound())
        if str(entity.get("id", "")) == "StructureBlock":
            continue
        cleaned[key] = value
    return cleaned


def apply_loot_chest(
    *,
    loot_mode: str,
    mimic: bool,
    loot_positions: tuple[tuple[int, int, int], ...],
    override_pos: tuple[int, int, int] | None,
    indices: List[Int],
    palette: List[Compound],
    bpd: Compound,
    sx: int,
    sy: int,
    sz: int,
) -> tuple[int, int, int]:
    if loot_mode == "fixed" and loot_positions:
        primary = override_pos if mimic and override_pos is not None else loot_positions[0]
        for x, y, z in loot_positions:
            if not (0 <= x < sx and 0 <= y < sy and 0 <= z < sz):
                raise ValueError(f"loot chest outside structure: {(x, y, z)}")
            is_dummy = mimic and override_pos == (x, y, z)
            linear = linear_index(x, y, z, sy, sz)
            chest_idx = ensure_block(palette, chest_block(is_dummy))
            indices[linear] = Int(chest_idx)
            bpd.pop(str(linear), None)
            if not is_dummy:
                bpd[str(linear)] = Compound(
                    {"block_entity_data": chest_entity(x, y, z)}
                )
        return primary

    if mimic and override_pos is not None:
        x, y, z = override_pos
        if not (0 <= x < sx and 0 <= y < sy and 0 <= z < sz):
            raise ValueError(f"mimic chest override outside structure: {override_pos}")
        linear = linear_index(x, y, z, sy, sz)
        chest_idx = ensure_block(palette, chest_block(True))
        indices[linear] = Int(chest_idx)
        bpd.pop(str(linear), None)
        return x, y, z

    if loot_mode == "interior":
        pos = find_interior_container(indices, palette, sx, sy, sz)
        if pos is None:
            pos = find_interior_floor(indices, palette, sx, sy, sz)
        x, y, z = pos
        linear = linear_index(x, y, z, sy, sz)
        chest_idx = ensure_block(palette, chest_block(mimic))
        indices[linear] = Int(chest_idx)
        bpd.pop(str(linear), None)
        if not mimic:
            bpd[str(linear)] = Compound({"block_entity_data": chest_entity(x, y, z)})
        return x, y, z

    if loot_mode == "roof":
        chest_idx = ensure_block(palette, chest_block(mimic))
        x, y, z = find_roof_chest_pos(indices, palette, sx, sy, sz)
        linear = linear_index(x, y, z, sy, sz)
        indices[linear] = Int(chest_idx)
        bpd.pop(str(linear), None)
        if not mimic:
            bpd[str(linear)] = Compound({"block_entity_data": chest_entity(x, y, z)})
        return x, y, z

    pos = find_highest_chest(indices, palette, sx, sy, sz)
    if pos is None:
        return apply_loot_chest(
            loot_mode="roof",
            mimic=mimic,
            indices=indices,
            palette=palette,
            bpd=bpd,
            sx=sx,
            sy=sy,
            sz=sz,
        )

    x, y, z = pos
    linear = linear_index(x, y, z, sy, sz)
    if mimic:
        chest_idx = ensure_block(palette, chest_block(True))
        indices[linear] = Int(chest_idx)
        bpd.pop(str(linear), None)
    else:
        entity = bpd.get(str(linear), Compound()).get("block_entity_data", Compound())
        entity = Compound(dict(entity))
        entity["LootTable"] = String(LOOT_TABLE)
        entity["Items"] = List[Compound]()
        entity["Findable"] = Byte(0)
        entity["id"] = String("Chest")
        entity["isMovable"] = Byte(1)
        entity["x"] = Int(x)
        entity["y"] = Int(y)
        entity["z"] = Int(z)
        bpd[str(linear)] = Compound({"block_entity_data": entity})
    return x, y, z


def spawn_entities(
    sx: int,
    sy: int,
    sz: int,
    mimic: bool,
    mob_profile: str,
    floors: list[float],
) -> list[Compound]:
    lower_floor = floors[0]
    upper_floor = floors[-1] if len(floors) > 1 else max(lower_floor + 4.0, sy * 0.65)
    cx, cz = sx / 2.0, sz / 2.0
    if mob_profile == "home":
        entities = [
            structure_entity("minecraft:witch", cx - 2.5, lower_floor, cz + 0.5),
            structure_entity("minecraft:witch", cx + 2.5, upper_floor, cz - 1.5),
            structure_entity("minecraft:pillager", cx + 2.5, lower_floor, cz + 2.5),
            structure_entity("minecraft:pillager", cx - 1.5, upper_floor, cz + 1.5),
        ]
    else:
        entities = [
            structure_entity("minecraft:pillager", cx + 0.5, lower_floor, cz + 2.5),
            structure_entity("minecraft:pillager", cx + 2.5, lower_floor, cz - 1.5),
            structure_entity("minecraft:pillager", cx - 1.5, upper_floor, cz + 0.5),
        ]
    if mimic:
        entities.extend(
            [
                structure_entity("relics:mimic", cx - 3.5, lower_floor, cz + 0.5),
                structure_entity("relics:mimic", cx + 2.5, upper_floor, cz - 2.5),
            ]
        )
    return entities


def import_variant(variant: StructureVariant, mimic: bool) -> None:
    if not variant.src.exists():
        raise SystemExit(f"Missing source structure for {variant.output_id}: {variant.src}")

    root = nbtlib.load(str(variant.src), byteorder="little")
    struct = root["structure"]
    sx, sy, sz = (int(root["size"][0]), int(root["size"][1]), int(root["size"][2]))
    old_palette = struct["palette"]["default"]["block_palette"]
    layer0 = struct["block_indices"][0]

    new_palette, old_to_new = dedupe_palette(old_palette)
    new_layer0 = List[Int](
        [Int(old_to_new[int(i)]) if int(i) >= 0 else Int(-1) for i in layer0]
    )
    bpd = sanitize_block_data(
        struct["palette"]["default"].get("block_position_data", Compound()),
        new_layer0,
        new_palette,
        sx,
        sy,
        sz,
    )

    chest_pos = apply_loot_chest(
        loot_mode=variant.loot_chest,
        mimic=mimic,
        loot_positions=variant.loot_positions,
        override_pos=variant.mimic_chest_pos,
        indices=new_layer0,
        palette=new_palette,
        bpd=bpd,
        sx=sx,
        sy=sy,
        sz=sz,
    )

    floors = find_walkable_floors(new_layer0, new_palette, sx, sy, sz)
    struct["palette"]["default"]["block_palette"] = new_palette
    struct["block_indices"][0] = new_layer0
    struct["palette"]["default"]["block_position_data"] = bpd
    entity_layout = list(variant.defender_positions)
    if mimic:
        entity_layout.extend(variant.mimic_positions)
    struct["entities"] = List[Compound](
        [structure_entity(identifier, x, y, z) for identifier, x, y, z in entity_layout]
    )
    # Make entity Pos relative to the load origin.
    root["structure_world_origin"] = List[Int]([Int(0), Int(0), Int(0)])

    suffix = "_mimic" if mimic else ""
    dst = STRUCTURES / f"{variant.output_id}{suffix}.mcstructure"
    dst.parent.mkdir(parents=True, exist_ok=True)
    nbtlib.File(root, gzipped=False, byteorder="little").save(dst, byteorder="little")

    used = Counter(int(i) for i in new_layer0 if int(i) >= 0)
    names = [str(b["name"]) for b in new_palette]
    mod_left = [
        n
        for n in names
        if ":" in n and not n.startswith("minecraft:") and not n.startswith("relics:")
    ]
    print(f"wrote {dst.name} ({dst.stat().st_size} bytes) mimic={mimic}")
    print(
        f"  source={variant.src.name}, size {sx}x{sy}x{sz}, chest at {chest_pos}, floors {floors}"
    )
    if mod_left:
        print("  WARNING mod blocks remain:", mod_left)


def main() -> None:
    for variant in VARIANTS:
        import_variant(variant, mimic=False)
        import_variant(variant, mimic=True)


if __name__ == "__main__":
    main()
