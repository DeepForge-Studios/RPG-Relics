"""Build a solid surface Relic Tower watchtower (.mcstructure)."""
from __future__ import annotations

from pathlib import Path

import nbtlib
from nbtlib import Byte, Compound, Int, List, String

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "BP/structures"

# 9 x 12 x 9 watchtower
SX, SY, SZ = 9, 12, 9


def block(name: str, **states):
    c = Compound({"name": String(name), "states": Compound(), "version": Int(18163713)})
    for k, v in states.items():
        if isinstance(v, bool):
            c["states"][k] = Byte(1 if v else 0)
        elif isinstance(v, int):
            c["states"][k] = Int(v)
        else:
            c["states"][k] = String(v)
    return c


PALETTE = [
    block("minecraft:air"),  # 0
    block("minecraft:stone_bricks"),  # 1
    block("minecraft:mossy_stone_bricks"),  # 2
    block("minecraft:cobblestone"),  # 3
    block("minecraft:spruce_planks"),  # 4
    block("minecraft:ladder", facing_direction=3),  # 5 south face
    block("minecraft:chest", **{"minecraft:cardinal_direction": "south"}),  # 6
    block("minecraft:barrel", facing_direction=1, open_bit=False),  # 7 up
    block("minecraft:campfire", extinguished=False, **{"minecraft:cardinal_direction": "north"}),  # 8
    block("minecraft:torch"),  # 9
    block("minecraft:cobblestone_wall"),  # 10
    block("minecraft:spruce_fence"),  # 11
    block("minecraft:crafting_table"),  # 12
    block("minecraft:bookshelf"),  # 13
    block("minecraft:lantern", hanging=False),  # 14
    block("relics:dummy_chest", **{"minecraft:cardinal_direction": "south"}),  # 15
    block("minecraft:stone_brick_stairs", upside_down_bit=False, weirdo_direction=0),  # 16 N
    block("minecraft:stone_brick_slab", **{"minecraft:vertical_half": "bottom"}),  # 17
]

AIR, STONE, MOSSY, COBBLE, PLANKS = 0, 1, 2, 3, 4
LADDER, CHEST, BARREL, CAMPFIRE, TORCH = 5, 6, 7, 8, 9
WALL, FENCE, CRAFT, BOOK, LANTERN, DUMMY, SB_STAIR_N, SB_SLAB = 10, 11, 12, 13, 14, 15, 16, 17


def brick(x, y, z):
    return MOSSY if (x + y + z) % 5 == 0 else STONE


def idx(x, y, z):
    return x + z * SX + y * SX * SZ


def fill(grid, x0, y0, z0, x1, y1, z1, bid):
    for y in range(y0, y1 + 1):
        for z in range(z0, z1 + 1):
            for x in range(x0, x1 + 1):
                if 0 <= x < SX and 0 <= y < SY and 0 <= z < SZ:
                    grid[idx(x, y, z)] = bid


def setb(grid, x, y, z, bid):
    if 0 <= x < SX and 0 <= y < SY and 0 <= z < SZ:
        grid[idx(x, y, z)] = bid


def build_grid(mimic: bool) -> list[int]:
    grid = [AIR] * (SX * SY * SZ)

    # Full solid foundation pad (embeds one block into terrain when placed at heightmap-1)
    fill(grid, 0, 0, 0, 8, 0, 8, COBBLE)
    fill(grid, 1, 0, 1, 7, 0, 7, STONE)

    # Outer stone walls (floors 1–7), continuous — no gaps except intentional openings
    for y in range(1, 8):
        for x in range(1, 8):
            setb(grid, x, y, 1, brick(x, y, 1))  # north
            setb(grid, x, y, 7, brick(x, y, 7))  # south
        for z in range(2, 7):
            setb(grid, 1, y, z, brick(1, y, z))  # west
            setb(grid, 7, y, z, brick(7, y, z))  # east

    # Interior floors
    fill(grid, 2, 1, 2, 6, 1, 6, PLANKS)
    fill(grid, 2, 4, 2, 6, 4, 6, PLANKS)
    fill(grid, 2, 7, 2, 6, 7, 6, PLANKS)

    # South doorway (framed, 2 tall)
    setb(grid, 4, 1, 7, AIR)
    setb(grid, 4, 2, 7, AIR)
    setb(grid, 3, 1, 7, STONE)
    setb(grid, 5, 1, 7, STONE)
    setb(grid, 3, 2, 7, STONE)
    setb(grid, 5, 2, 7, STONE)
    setb(grid, 4, 3, 7, STONE)
    setb(grid, 4, 0, 7, PLANKS)
    setb(grid, 4, 0, 8, SB_STAIR_N)

    # Side/north windows (single cells only)
    for y in (2, 5):
        setb(grid, 1, y, 4, AIR)
        setb(grid, 7, y, 4, AIR)
        setb(grid, 4, y, 1, AIR)

    # Ladder on north interior wall
    for y in range(1, 8):
        setb(grid, 3, y, 2, LADDER)

    # Ground floor furniture
    setb(grid, 6, 1, 2, CRAFT)
    setb(grid, 2, 1, 6, BOOK)
    setb(grid, 5, 1, 6, BARREL)
    setb(grid, 6, 1, 6, DUMMY if mimic else CHEST)
    setb(grid, 2, 2, 2, TORCH)
    setb(grid, 6, 2, 5, TORCH)

    # Mid floor
    setb(grid, 6, 4, 6, BARREL)
    setb(grid, 2, 5, 2, LANTERN)
    setb(grid, 6, 5, 2, TORCH)

    # Roof battlements — continuous wall ring, then crenels
    for x in range(1, 8):
        setb(grid, x, 8, 1, WALL)
        setb(grid, x, 8, 7, WALL)
    for z in range(2, 7):
        setb(grid, 1, 8, z, WALL)
        setb(grid, 7, 8, z, WALL)

    # Crenellations (every other post)
    for x in (1, 3, 5, 7):
        setb(grid, x, 9, 1, WALL)
        setb(grid, x, 9, 7, WALL)
    for z in (3, 5):
        setb(grid, 1, 9, z, WALL)
        setb(grid, 7, 9, z, WALL)

    # Corner pillars up to lantern height
    for x, z in ((1, 1), (7, 1), (1, 7), (7, 7)):
        setb(grid, x, 9, z, WALL)
        setb(grid, x, 10, z, WALL)
        setb(grid, x, 11, z, TORCH)

    # Roof center beacon
    setb(grid, 4, 8, 4, CAMPFIRE)
    setb(grid, 4, 8, 3, FENCE)
    setb(grid, 4, 8, 5, FENCE)
    setb(grid, 3, 8, 4, FENCE)
    setb(grid, 5, 8, 4, FENCE)

    # Ground skirt slabs so the pad reads as a finished platform
    for x in range(0, 9):
        if grid[idx(x, 0, 0)] == COBBLE:
            setb(grid, x, 1, 0, SB_SLAB)
        if grid[idx(x, 0, 8)] == COBBLE:
            setb(grid, x, 1, 8, SB_SLAB)
    for z in range(1, 8):
        if grid[idx(0, 0, z)] == COBBLE:
            setb(grid, 0, 1, z, SB_SLAB)
        if grid[idx(8, 0, z)] == COBBLE:
            setb(grid, 8, 1, z, SB_SLAB)

    # Keep doorway step clear of skirt
    setb(grid, 4, 1, 8, AIR)
    setb(grid, 4, 0, 8, SB_STAIR_N)

    return grid


def chest_entity(x, y, z, loot: str | None, mimic: bool):
    data = Compound(
        {
            "Findable": Byte(0),
            "Items": List[Compound](),
            "id": String("Chest"),
            "isMovable": Byte(1),
            "x": Int(x),
            "y": Int(y),
            "z": Int(z),
        }
    )
    if loot and not mimic:
        data["LootTable"] = String(loot)
    return data


def barrel_entity(x, y, z, loot: str):
    return Compound(
        {
            "Findable": Byte(0),
            "Items": List[Compound](),
            "id": String("Barrel"),
            "isMovable": Byte(1),
            "x": Int(x),
            "y": Int(y),
            "z": Int(z),
            "LootTable": String(loot),
        }
    )


def write_structure(path: Path, mimic: bool) -> None:
    grid = build_grid(mimic)
    layer0 = List[Int]([Int(i) for i in grid])
    layer1 = List[Int]([Int(-1) for _ in grid])

    bpd = Compound()
    if not mimic:
        bpd[str(idx(6, 1, 6))] = Compound(
            {
                "block_entity_data": chest_entity(
                    6, 1, 6, "loot_tables/relics/chests/campsite_chest.json", False
                )
            }
        )
    for bx, by, bz in ((5, 1, 6), (6, 4, 6)):
        bpd[str(idx(bx, by, bz))] = Compound(
            {
                "block_entity_data": barrel_entity(
                    bx, by, bz, "loot_tables/relics/chests/campsite_barrel.json"
                )
            }
        )

    root = Compound(
        {
            "format_version": Int(1),
            "size": List[Int]([Int(SX), Int(SY), Int(SZ)]),
            "structure": Compound(
                {
                    "block_indices": List[List[Int]]([layer0, layer1]),
                    "entities": List[Compound](),
                    "palette": Compound(
                        {
                            "default": Compound(
                                {
                                    "block_palette": List[Compound](PALETTE),
                                    "block_position_data": bpd,
                                }
                            )
                        }
                    ),
                }
            ),
            "structure_world_origin": List[Int]([Int(0), Int(0), Int(0)]),
        }
    )

    file = nbtlib.File(root, gzipped=False, byteorder="little")
    path.parent.mkdir(parents=True, exist_ok=True)
    file.save(path, byteorder="little")
    print(f"wrote {path.name} ({path.stat().st_size} bytes) mimic={mimic}")


def main() -> None:
    write_structure(OUT / "relic_tower.mcstructure", mimic=False)
    write_structure(OUT / "relic_tower_mimic.mcstructure", mimic=True)


if __name__ == "__main__":
    main()
