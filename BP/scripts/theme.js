/**
 * RPG Relics visual theme — single source for ActionForm § colors + JSON UI RGB.
 * Always import from here (or Vault/design docs). Do not invent random palette codes.
 *
 * Mirror: docs/UI_THEME.md · Vault/2-Areas/UI/
 */

/** Bedrock § formatting codes used in forms / chat. */
export const Ink = Object.freeze({
  reset: "§r",
  /** Primary gold — titles, headers, forge accents */
  gold: "§6",
  /** Soft gold / highlight (nugget yellow) */
  highlight: "§e",
  /** Forge purple — Attunement, Boost Codex, special menus */
  purple: "§d",
  /** Deep purple (guide Boosts button) */
  violet: "§5",
  /** Body / primary readable text */
  white: "§f",
  /** Secondary info */
  muted: "§7",
  /** Disabled / back / footnotes */
  dim: "§8",
  /** Success / unlocked / ON */
  good: "§a",
  /** Danger / OFF / Mimics */
  bad: "§c",
  /** Info / sense / aqua accents */
  aqua: "§b",
  /** Blue (Ward / Rare) */
  blue: "§9",
});

/** Affinity (class) colors — Boost lean / Berserker·Guardian·… — keep in sync with Boost Codex. */
export const BoostInk = Object.freeze({
  might: Ink.bad,
  ward: Ink.blue,
  gale: Ink.aqua,
  fortune: Ink.gold,
  vitality: Ink.good,
  alchemy: Ink.purple,
});

/** Tier lore colors. */
export const TierInk = Object.freeze({
  common: Ink.muted,
  uncommon: Ink.good,
  rare: Ink.blue,
});

/** Attunement group colors — 8 affinities (reuse Boost palette + Necromancy/Radiance). */
export const AttuneInk = Object.freeze({
  might: Ink.bad,
  ward: Ink.blue,
  gale: Ink.aqua,
  fortune: Ink.gold,
  vitality: Ink.good,
  alchemy: Ink.purple,
  necromancy: Ink.violet,
  radiance: Ink.highlight,
});

/**
 * Synergy Affinity class particle tint reference — RGB 0–1 floats baked into
 * `RP/particles/synergy_<class>_proc.json` / `_echo.json`. Mirrors the
 * BoostInk/AttuneInk family each class leans on (red/blue/aqua/gold/green/purple).
 */
export const AffinityRgb = Object.freeze({
  berserker: { red: 0.85, green: 0.12, blue: 0.08 }, // might — red
  guardian: { red: 0.25, green: 0.55, blue: 0.95 }, // ward — blue
  scout: { red: 0.15, green: 0.85, blue: 0.8 }, // gale — aqua
  trickster: { red: 0.95, green: 0.78, blue: 0.25 }, // fortune — gold
  healer: { red: 0.25, green: 0.85, blue: 0.35 }, // vitality — green
  arcanist: { red: 0.62, green: 0.28, blue: 0.85 }, // alchemy — purple
});

/** Attunement rarity → lore tint + level cap. */
export const RarityInk = Object.freeze({
  common: Ink.muted,
  uncommon: Ink.good,
  rare: Ink.blue,
  epic: Ink.purple,
});

/**
 * RGB 0–1 floats for RP JSON UI labels (match Reliquary).
 * Gold headers: Extra Slots / Charms. Soft lavender: body slot tips (e.g. Hand).
 */
export const UiRgb = Object.freeze({
  gold: [0.95, 0.78, 0.35],
  softLavender: [0.82, 0.72, 0.92],
  /** Approximate hex for texture artists / mockups */
  hex: Object.freeze({
    gold: "#F2C759",
    softLavender: "#D1B8EB",
    windowPurple: "#2A1538",
    deepPurple: "#1A0E24",
    borderGold: "#C9A227",
    gemMagenta: "#C44AA8",
    slotBg: "#3D2A4F",
    invLabelGray: "#5A5A62",
  }),
});

/** Reliquary / forge texture paths (RP). Prefer these names when adding UI art. */
export const UiTextures = Object.freeze({
  windowBg: "textures/ui/curio_window_bg",
  ledgerBg: "textures/ui/curio_ledger_bg",
  slotBg: "textures/ui/curio_slot_bg",
  dollFrame: "textures/ui/curio_doll_frame",
  title: "textures/ui/curio_reliquary_title",
  gem: "textures/ui/curio_gem",
  invLabelBg: "textures/ui/curio_inv_label_bg",
  forgePanel: "textures/ui/relic_forge_panel",
  examineGhost: "textures/ui/curio_gem",
  /** Scripted-form (ActionForm) reskin — see RP/ui/server_form.json */
  formBg: "textures/ui/curio_form_bg",
  formButton: "textures/ui/curio_form_button",
  formButtonHover: "textures/ui/curio_form_button_hover",
  formButtonPressed: "textures/ui/curio_form_button_pressed",
});

/** Reliquary Examine bay container index (not an equip slot). */
export const EXAMINE_SLOT_INDEX = 24;

/** Wrap text in a theme ink code + reset. */
export function paint(ink, text) {
  return `${ink}${text}${Ink.reset}`;
}

export const uiTitle = (text) => paint(Ink.gold, text);
export const uiAccentTitle = (text) => paint(Ink.purple, text);
export const uiBody = (text) => paint(Ink.white, text);
export const uiMuted = (text) => paint(Ink.muted, text);
export const uiDim = (text) => paint(Ink.dim, text);
export const uiHighlight = (text) => paint(Ink.highlight, text);
export const uiBack = () => paint(Ink.muted, "← Back");
export const uiClose = () => paint(Ink.muted, "Close");
