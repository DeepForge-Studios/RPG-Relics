# Adding Trinkets (API for other packs)

Other Bedrock add-ons can register items into RPG Relics so they equip in the Reliquary and run the same effect hooks.

Bedrock packs cannot import each other's JS modules. Registration is done with a **script event** and a JSON message.

## What you provide

1. Your own **item** (BP item JSON + RP texture) in your pack.
2. One **registration call** when your pack loads (or when a player joins).

RPG Relics must also be enabled in the world.

## Register

From your pack's script:

```js
import { system } from "@minecraft/server";

system.runTimeout(() => {
  system.sendScriptEvent(
    "relics:register",
    JSON.stringify({
      id: "mypack:lucky_coin",
      slot: "trinket",
      displayName: "Lucky Coin",
      tier: "uncommon",
      passive: { effect: "haste", amplifier: 0 },
    })
  );
}, 40);
```

Or from chat / command block (for testing):

```
/scriptevent relics:register {"id":"mypack:lucky_coin","slot":"trinket","displayName":"Lucky Coin","tier":"uncommon","passive":{"effect":"haste","amplifier":0}}
```

## Unregister / list

```
/scriptevent relics:unregister mypack:lucky_coin
/scriptevent relics:list_external
```

## Definition fields

| Field | Required | Notes |
|-------|----------|--------|
| `id` | yes | Full item id, e.g. `mypack:lucky_coin` |
| `slot` | yes | `trinket`, `any`, `face`, `head`, `necklace`, `ring`, `charm`, `back`, `body`, `belt`, `hands`, `feet` |
| `displayName` | no | Shown in Reliquary / lore |
| `tier` | no | `common`, `uncommon`, or `rare` (lore color + Boost power) |
| `passive` | no | `{ "effect": "speed", "amplifier": 0 }` |
| `custom` | no | Built-in custom id already handled by RPG Relics (`item_magnet`, `double_jump`, …) |
| `onHurt` | no | `{ "effect": "resistance", "amplifier": 0, "duration": 40 }` or `{ "thorns": { "chance": 1, "damage": 2 } }` |
| `onAttack` | no | `{ "ignite": { "chance": 1, "seconds": 3 } }`, `bonusDamage`, `lifesteal`, `knockback`, `wither`, `lightning` |
| `onKill` | no | `{ "bonusXpOrbs": 4 }` |

`slot: "trinket"` only fits Extra Reliquary sockets. `slot: "any"` fits every socket.

## Important limits

- Registration lives in **memory for the current world session**. Call register again on pack load / join.
- Your item must exist as a real Bedrock item in your pack; RPG Relics only wires **behavior**.
- New `custom` effect types still need a matching handler inside RPG Relics (or use `passive` / `onHurt` / `onAttack` / `onKill`).
- Content log shows `[RPG Relics] registered trinket …` when registration succeeds.

## Minimal example pack sketch

See the full working template: **[examples/trinket-addon/](examples/trinket-addon/)**

```
MyTrinkets/
  BP/
    items/lucky_coin.json          <- your item
    scripts/main.js                <- send relics:register
  RP/
    textures/items/lucky_coin.png
    textures/item_texture.json
```
