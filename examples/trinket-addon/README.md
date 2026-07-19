# Example Trinket Add-on

Minimal Bedrock add-on that shows how to register **your own items** into RPG Relics so they equip in the Reliquary and run relic effects.

## Requirements

- Minecraft Bedrock **1.21.60+**
- Stable Script API (no Beta APIs experiment required if using stable `@minecraft/server`)
- **RPG Relics** behavior + resource packs enabled **above** this pack in the world pack list

## What this example adds

| Item | Slot | Effect |
|------|------|--------|
| `example_trinkets:ruby_ring` | Ring | Passive Strength I |
| `example_trinkets:lucky_coin` | Extra trinket socket | Passive Haste I |

## Build

From the repo root:

```powershell
./examples/trinket-addon/build_example_trinket_addon.ps1
```

Output: `examples/trinket-addon/example_trinket_addon.mcaddon`

## Install & test

1. Import **RPG Relics** first, then import `example_trinket_addon.mcaddon`.
2. Enable both packs on a world (RPG Relics above Example Trinkets).
3. Join the world and check the content log for:
   ```
   [RPG Relics] registered trinket example_trinkets:ruby_ring
   [RPG Relics] registered trinket example_trinkets:lucky_coin
   ```
4. Give the items and open the Reliquary:

```
/give @s example_trinkets:ruby_ring
/give @s example_trinkets:lucky_coin
/scriptevent relics:open_menu
```

## How it works

1. **You** define the Bedrock item JSON + icon texture in your pack.
2. On load (and again when players join), your script sends `relics:register` with a JSON definition.
3. RPG Relics stores that definition and treats your item like a native relic for slots, lore, Boost, and hooks.

Bedrock packs cannot `import` each other's JavaScript. The script event is the supported bridge.

## Fork this for your own pack

1. Rename the namespace `example_trinkets` → `yourpack` everywhere.
2. Generate new UUIDs in both `manifest.json` files (header + modules).
3. Add your items under `BP/items/` and textures under `RP/textures/items/`.
4. Register each item in `BP/scripts/main.js`.

Full API reference: [docs/ADDING_TRINKETS.md](../../docs/ADDING_TRINKETS.md)
