# RPG Relics

**DeepForge Studios** · Minecraft Bedrock Edition add-on

Equip magical relics in a portable **Reliquary** wardrobe, lean into Boost playstyles, and deepen power at the **Attunement Forge**.

**Wiki:** [deepforge-studios.github.io/RPG-Relics](https://deepforge-studios.github.io/RPG-Relics/)

[![Minecraft](https://img.shields.io/badge/Minecraft-Bedrock-green)](https://www.minecraft.net/)
[![Studio](https://img.shields.io/badge/Studio-DeepForge%20Studios-9b59b6)](https://github.com/DeepForge-Studios)

---

## Features

- **Reliquary wardrobe** — equip relics across face, head, necklace, ring, charm, back, body, belt, hands, and feet
- **Boost Codex** — Might, Ward, Gale, Fortune, Vitality, Alchemy from your loadout
- **Attunement Forge** — bind skills to relics, wear them to grow, unlock deeper ranks
- **World finds** — towers, witch homes, underground camps, mimics, archaeology, and rare drops
- **Relic Forge** — crafts, shards, materials, and ascended fusions
- **Achievement-friendly** — stable Script API only; no Beta APIs / Experiments required

---

## Install

1. Download the latest `.mcaddon` from [Releases](https://github.com/DeepForge-Studios/RPG-Relics/releases), or build with `./build_mcaddon.ps1`.
2. Import into Minecraft Bedrock.
3. Enable both **RPG Relics** packs (Behavior + Resources).
4. Leave **Experiments / Beta APIs** off (and **Cheats** off) if you want achievements.

---

## Getting started

On first join you receive a **Relic Tome**, **Relic Crate**, **Attunement Codex**, starter relics (**Nightwatch Goggles**, **Heartward Ring**), shards, and craft materials.

| Action | How |
|--------|-----|
| Open Reliquary | Use the **Relic Crate** |
| Study attunements | Use the **Attunement Codex** |
| Perform rituals | Place an **Attunement Forge** and tap it |
| Guide & settings | Use the **Relic Tome** |

### Boosts

Equipped relics add Boost power by rarity (common 1 · uncommon 2 · rare/ascended 3). Your strongest style becomes active:

| Boost | Effect |
|-------|--------|
| Might | Bonus damage on repeated attacks |
| Ward | Chance to deflect melee hits |
| Gale | Sprint bursts of speed |
| Fortune | Extra ore drops |
| Vitality | Heal on kill |
| Alchemy | Longer potion effects |

### Find relics

Chests, towers, underground camps, mimics, archaeology, and rare mob drops.

### Craft

- **Relic Forge** — crafting table + book + 2 amethyst shards + deepslate bricks
- Materials drop from hostiles: Monster Heart, Beast Fang, Arcane Gem, Mystic Herb, Silver Fragment, Crimson Crystal
- Ascended fusions combine two relics + a catalyst at the Relic Forge

---

## Commands (optional)

Cheats required. Prefer the in-game items above for normal play.

```
/scriptevent relics:open_menu
/scriptevent relics:attune
/scriptevent relics:boosts
/scriptevent relics:status
/scriptevent relics:sense
/give @s relics:reliquary
/give @s relics:relic_guidebook
/give @s relics:relic_forge
/give @s relics:attunement_forge
```

---

## Build from source

```powershell
./build_mcaddon.ps1
```

Creates `curio_relics.mcaddon` (behavior + resource packs).

```
BP/     Behavior pack (scripts, items, loot, structures)
RP/     Resource pack (textures, UI, models)
docs/   Credits
```

---

## Docs

| Doc | Contents |
|-----|----------|
| [Credits](docs/CREDITS.md) | Third-party art attribution |

---

## Studio

Made by **[DeepForge Studios](https://github.com/DeepForge-Studios)** · **[yungsonix](https://github.com/yungsonix)**

*Open the Reliquary. Wear what you find. Attune what you keep.*
