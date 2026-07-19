# Relic Towers & Homes

Vanilla pillager outposts are **not one structure**. They are a **jigsaw assembly**:

- `watchtower` in the center
- random side pieces: `feature_tent1`, `feature_tent2`, `feature_cage1`, `feature_logs`, `feature_targets`, etc.
- pillagers saved as **entities inside the structure**

RPG Relics randomly chooses between a hand-built **spruce pillager tower** and a **sandstone-roof witch house**.

## Retheme mapping (suggested)

| Vanilla piece | Vanilla blocks | Relic tower blocks |
|---------------|----------------|--------------------|
| Watchtower base | cobblestone + dark oak log corners | cobblestone + mossy stone brick + spruce log corners |
| Watchtower walls | dark oak planks | stone bricks / spruce planks |
| Floors / roof deck | birch planks | spruce planks |
| Roof | dark oak stairs/slabs | stone brick stairs/slabs |
| Fences / cage | dark oak fence | spruce fence / cobblestone wall |
| Tent | white wool | purple wool or gray wool |
| Banner | illager banner | purple banner (optional) |
| Loot chest (top) | vanilla chest | `minecraft:chest` with `loot_tables/relics/chests/tower_chest.json` |
| Mimic tower chest | — | `relics:dummy_chest` |

## Path A — Build in-game (best for custom art)

1. Enable **RPG Relics** in a Creative flat world.
2. Use vanilla pillager pieces as **reference** (Creative structure block load is Java-only; on Bedrock, use screenshots/wiki or rebuild from memory).
3. Build these pieces separately (or as one big pad):
   - `relic_watchtower.mcstructure`
   - `relic_feature_tent.mcstructure`
   - `relic_feature_cage.mcstructure`
   - `relic_feature_logs.mcstructure`
   - `relic_feature_targets.mcstructure`
4. Put **2–4 pillagers** inside before saving (Structure Block → include entities).
5. Top chest loot: set block entity loot table to `loot_tables/relics/chests/tower_chest.json`.
6. Save each file into `BP/structures/`.
7. Test:
   ```
   /structure load mystructure:relic_watchtower ~ ~ ~
   ```
8. Send the `.mcstructure` files — they get wired into world gen.

### One-file shortcut

Build the **whole tower on one platform** (tower + tents + cages around it) and save as:

```
BP/structures/relic_tower_spruce.mcstructure
```

This is easier than jigsaw, but every tower looks the same.

## Path B — True pillager-style jigsaw (advanced)

For random side pieces like vanilla, the pack needs:

```
BP/
  structures/relics/
    watchtower.mcstructure
    feature_tent.mcstructure
    feature_cage.mcstructure
    ...
  worldgen/
    structures/relic_tower.json
    structure_sets/relic_tower.json
    template_pools/relic_tower/*.json
```

Each connecting piece needs **jigsaw blocks** inside the `.mcstructure` files.

Test placement:

```
/place jigsaw relics:relic_tower relics:watchtower ~ ~ ~
```

This replaces the current single `structure_template_feature` spawn for towers.

## Loot

Tower chests should use:

```
loot_tables/relics/chests/tower_chest.json
```

That table mixes **relic items/shards** with **base survival loot** (food, arrows, iron, crossbow, etc.).

## Defenders

The import script adds defenders automatically (no spawner block needed):

- Spruce tower: 7 pillagers
- Witch house: 4 witches + 4 pillagers
- Positions are authored against the same X/Y/Z layers shown by Bloxelizer

## Mimic variant

Each style has a mimic version:

- One interior loot chest is swapped to `relics:dummy_chest` (opens like a chest, spawns a mimic)
- 3 live `relics:mimic` entities are hand-positioned inside
- Same witches/pillagers as the normal version
- Other interior chests keep randomized `tower_chest.json` loot

Testing spawn rate: `BP/feature_rules/relic_tower_mimic_surface.json` (~1/110 per chunk).

## Current pack status

The live structures are imported via `tools/import_relic_tower.py`:

| Source | Output | Size | Notes |
|--------|--------|------|-------|
| `torre sv.mcstructure` | `relic_tower_spruce.mcstructure` | 30×60×30 | 3 interior loot chests + 7 hand-positioned pillagers |
| `0_0_0_House.mcstructure` | `relic_home_fantasy.mcstructure` | 23×53×19 | 3 interior loot chests + 4 witches / 4 pillagers |
| (same sources) | `relic_tower_spruce_mimic.mcstructure` / `relic_home_fantasy_mimic.mcstructure` | — | Dummy chest + 2 mimics |

**World gen:**

- Normal pool: `BP/features/relic_tower_pool_feature.json` + `BP/feature_rules/relic_tower_surface.json` (~1/80 per chunk)
- Mimic pool: `BP/features/relic_tower_mimic_pool_feature.json` + `BP/feature_rules/relic_tower_mimic_surface.json` (~1/110 per chunk)

Each pool randomly picks the **spruce tower** or **witch house** with equal weight.

**Re-import after editing a source structure:**

```powershell
python tools/import_relic_tower.py
./build_mcaddon.ps1
```

Mod blocks from source builds are remapped to vanilla automatically (`import_relic_tower.py` → `BLOCK_REMAP`). Embedded structure blocks are stripped.

**Test in-game:**

```
/scriptevent relics:tower
/scriptevent relics:tower_tp
/structure load mystructure:relic_tower_spruce ~ ~ ~
/structure load mystructure:relic_home_fantasy ~ ~ ~
/structure load mystructure:relic_tower_spruce_mimic ~ ~ ~
/structure load mystructure:relic_home_fantasy_mimic ~ ~ ~
```

The old procedural generator (`tools/gen_relic_tower.py`) is kept for reference only — the pack no longer uses it for world gen.
