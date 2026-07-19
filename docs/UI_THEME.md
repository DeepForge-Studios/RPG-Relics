# UI Theme — RPG Relics (source of truth)

**Do not invent random colors.** Use `BP/scripts/theme.js` + this doc + Reliquary textures.

---

## Color scheme (forge purple / gold)

| Token | § code | Hex (approx) | Use |
|-------|--------|--------------|-----|
| Gold | `§6` | `#F2C759` | Form titles, Reliquary headers |
| Highlight | `§e` | — | Inline emphasis, commands |
| Purple | `§d` | — | Attunement, Boost Codex, special |
| Violet | `§5` | — | Guide “Boosts” |
| White | `§f` | — | Body copy |
| Muted | `§7` | — | Secondary lines |
| Dim | `§8` | — | Back / footnotes / locked |
| Good | `§a` | — | Unlocked / ON / Uncommon |
| Bad | `§c` | — | Danger / OFF / Mimics |
| Aqua | `§b` | — | Gale / Sense / info |
| Blue | `§9` | — | Ward / Rare |

**JSON UI RGB** (Reliquary labels):

- Gold headers: `[0.95, 0.78, 0.35]`
- Soft lavender tips (e.g. Hand): `[0.82, 0.72, 0.92]`

**Texture palette:** deep window purple ≈ `#2A1538` / `#1A0E24`, border gold ≈ `#C9A227`, gem magenta ≈ `#C44AA8`, slot bg ≈ `#3D2A4F`, inv label gray ≈ `#5A5A62`.

---

## Textures (`RP/textures/ui/`)

| Asset | Role |
|-------|------|
| `curio_window_bg.png` | Outer Reliquary window |
| `curio_ledger_bg.png` | Inner panel |
| `curio_purple_fill.png` | Seamless purple under inventory / seam cover |
| `curio_slot_bg.png` | Slot wells |
| `curio_doll_frame.png` | Paper-doll frame |
| `curio_reliquary_title.png` | Title art |
| `curio_gem.png` | Corner gems |
| `curio_inv_label_bg.png` | Inventory label plate |
| `slot_*.png` | Slot ghost icons (simple X) |
| `relic_forge_panel.png` | Forge UI accent |
| `../blocks/attunement_forge.png` | Anvil block; purple/gold metal with exact `curio_gem.png` rune motifs |
| `curio_form_bg.png` | Scripted-form window (nineslice; deep-purple header band, gold rim + divider) |
| `curio_form_button.png` / `_hover` / `_pressed` | Scripted-form buttons (slot purple / lightened + gold border / deep purple) |

JSON UI: `RP/ui/curio_reliquary.json`, `curio_ledger.json`, `curio_bag.json`, `server_form.json` (ActionForm reskin — regenerate art with `tools/gen_curio_form_ui.py`)

---

## Forms (ActionForm)

Import helpers from `theme.js`:

```js
import { uiTitle, uiAccentTitle, uiBack, Ink, BoostInk } from "./theme.js";
form.title(uiAccentTitle("Relic Attunement"));
form.button(uiBack());
```

Boost colors: `BoostInk.might` … `BoostInk.alchemy` (also in `boosts_data.js`).

---

## Rules for agents

1. New UI copy → use `Ink` / helpers, not ad-hoc `§` soup
2. New textures → name `curio_*` and list here
3. Mockups → match purple/gold + gem corners
4. Session start → skim this file or `Vault/2-Areas/UI/Color scheme`
