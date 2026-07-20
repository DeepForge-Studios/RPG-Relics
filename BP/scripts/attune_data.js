/**
 * Attunement progress v3 — per-ItemStack level (from wearing) + rolled attunement
 * slots (from the direct ActionForm Forge).
 *
 * Primary forge path is scripted forms in attunement.js. Legacy 27-slot chest
 * bay helpers remain in reliquary.js for cleanup only.
 */
import { getRelicDef } from "./registry.js";
import { loreLinesForItem, loreOptsForPlayer } from "./descriptions.js";
import { Ink, paint, AttuneInk } from "./theme.js";
import {
  POOL,
  GROUP_LABELS,
  RARITY,
  getAttuneDef,
  rarityCap,
  attuneMagnitude,
  groupInk,
  relicAffinity,
} from "./attune_pool.js";
import { synergyTier } from "./attune_synergy.js";

export const FOCUS_A_SLOT = 25;
export const FOCUS_B_SLOT = 26;
export const RITUAL_INPUT_SLOTS = [FOCUS_A_SLOT, FOCUS_B_SLOT];
/** Legacy hidden gauge item id — only used to sweep stale copies out of bags. */
export const GAUGE_ID = "relics:ui_plus";

const LEGACY_PROP = "relics:attune_map";
export const ITEM_ATTUNE_PROP = "relics:attune_v3";
const XP_PER_LEVEL = 20;
export const MAX_LEVEL = 8;
/** Second attunement slot unlocks at this relic level. */
export const SECOND_SLOT_LEVEL = 5;
export const MAX_SLOTS = 2;

const LEGACY_KEYS = {
  might: {
    ferocity: "rivet_streak",
    overpower: "scarbrand",
    bloodlust: "cracked_rib_pact",
    rend: "scarbrand",
  },
  ward: {
    bulwark: "bastion_glyph",
    thornmail: "oathchain",
    aegis: "siege_root",
    steadfast: "bastion_glyph",
  },
  gale: {
    fleetfoot: "slipstream_cut",
    updraft: "tempest_tithe",
    frenzy: "crosswind_mark",
    driftstep: "gale_anchor",
  },
  fortune: {
    prospector: "gilded_rumor",
    windfall: "gilded_rumor",
    trailblazer: "mimics_wager",
    tidediver: "debt_of_plenty",
  },
  vitality: {
    regrowth: "symbiotic_seed",
    bastion: "heartforge",
    lifebloom: "symbiotic_seed",
    vigor: "marrow_swap",
  },
  alchemy: {
    catalyst: "crucible_bloom",
    toxin: "vialmark",
    emberward: "witchglass_retort",
    insight: "phial_familiar",
  },
  necromancy: {
    soul_siphon: "corpse_lantern",
    withering_touch: "dirge_mark",
    grave_harvest: "corpse_lantern",
    bonechill: "pale_conscription",
  },
  radiance: {
    smite: "thunderbrand",
    blessing: "dawnwell",
    sanctuary: "lumen_chorus",
    radiant: "judgment_brand",
  },
};

function migrateSlot(slot) {
  const group = String(slot?.group ?? "");
  let key = String(slot?.key ?? "");
  if (!getAttuneDef(group, key)) key = LEGACY_KEYS[group]?.[key] ?? key;
  return {
    group,
    key,
    rarity: String(slot?.rarity ?? "common"),
  };
}

function loadMap(player) {
  if (!player) return {};
  try {
    const raw = player.getDynamicProperty(LEGACY_PROP);
    if (typeof raw === "string" && raw.length) return JSON.parse(raw);
  } catch {
  }
  return {};
}

function saveMap(player, map) {
  if (!player) return;
  try {
    const keys = Object.keys(map);
    player.setDynamicProperty(LEGACY_PROP, keys.length ? JSON.stringify(map) : undefined);
  } catch {
  }
}

function newInstanceId() {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 0x100000000).toString(36)}`;
}

function normalizeState(value) {
  const row = value && typeof value === "object" ? value : {};
  const level = Math.max(0, Math.min(MAX_LEVEL, Number(row.level ?? row.relicLevel) || 0));
  return {
    version: 3,
    instanceId:
      typeof row.instanceId === "string" && row.instanceId
        ? row.instanceId
        : newInstanceId(),
    level,
    xp: level >= MAX_LEVEL ? 0 : Math.max(0, Number(row.xp ?? row.relicXp) || 0),
    slots: Array.isArray(row.slots)
      ? row.slots.slice(0, MAX_SLOTS).map(migrateSlot)
      : [],
  };
}

function readItemState(stack) {
  if (!stack?.typeId) return undefined;
  try {
    const raw = stack.getDynamicProperty(ITEM_ATTUNE_PROP);
    if (typeof raw === "string" && raw) return normalizeState(JSON.parse(raw));
  } catch {
  }
  return undefined;
}

function writeItemState(stack, state) {
  if (!stack?.typeId) return false;
  try {
    stack.setDynamicProperty(ITEM_ATTUNE_PROP, JSON.stringify(normalizeState(state)));
    return true;
  } catch {
    return false;
  }
}

export function hasAttuneIdentity(stack) {
  return !!readItemState(stack);
}

/**
 * Ensure this exact ItemStack owns V3 state. The first encountered copy of a
 * legacy type receives that type's old row; later copies start independently.
 */
export function ensureAttuneIdentity(player, stack) {
  if (!stack?.typeId || !getRelicDef(stack.typeId)) return undefined;
  const existing = readItemState(stack);
  if (existing) return existing;

  const legacy = loadMap(player);
  const old = legacy[stack.typeId];
  const state = normalizeState(old);
  if (old) {
    delete legacy[stack.typeId];
    saveMap(player, legacy);
  }
  writeItemState(stack, state);
  return state;
}

export function xpNeeded(_level) {
  return XP_PER_LEVEL;
}

/**
 * @returns {{ level:number, xp:number, need:number, slots:Array, slotCap:number }}
 */
export function getAttuneProgress(player, itemOrId) {
  const isStack = !!itemOrId?.typeId;
  const row = isStack
    ? ensureAttuneIdentity(player, itemOrId)
    : loadMap(player)[itemOrId] ?? {};
  const state = normalizeState(row);
  const level = state.level;
  const slots = state.slots;
  return {
    version: 3,
    instanceId: state.instanceId,
    level,
    xp: state.xp,
    need: xpNeeded(level),
    slots,
    slotCap: level >= SECOND_SLOT_LEVEL ? MAX_SLOTS : 1,
  };
}

function setAttuneProgress(player, itemOrId, prog) {
  if (itemOrId?.typeId) {
    return writeItemState(itemOrId, prog);
  }
  const map = loadMap(player);
  map[itemOrId] = {
    version: 3,
    instanceId: prog.instanceId,
    level: prog.level,
    xp: prog.xp,
    slots: prog.slots ?? [],
  };
  saveMap(player, map);
  return true;
}

export function isAttuned(player, itemOrId) {
  return getAttuneProgress(player, itemOrId).slots.length > 0;
}

/**
 * Wear XP. Only attuned relics gain levels.
 * @returns {{ level, xp, need, slots, leveled:boolean, unlockedSlot:boolean }}
 */
export function attuneAddXp(player, itemOrId, amount = 1) {
  const prog = getAttuneProgress(player, itemOrId);
  if (prog.slots.length === 0) return { ...prog, leveled: false, unlockedSlot: false };
  let leveled = false;
  let unlockedSlot = false;
  // Primary Affinity↔Attunement synergy earns attune XP 1.5× faster while worn.
  const affinity = relicAffinity(getRelicDef(itemOrId?.typeId ?? itemOrId));
  const primarySynergy = prog.slots.some((s) => synergyTier(affinity, s.group) === "primary");
  const gain = primarySynergy ? Math.max(1, Math.round(amount * 1.5)) : amount;
  prog.xp += gain;
  while (prog.level < MAX_LEVEL && prog.xp >= xpNeeded(prog.level)) {
    prog.xp -= xpNeeded(prog.level);
    prog.level += 1;
    leveled = true;
    if (prog.level === SECOND_SLOT_LEVEL) unlockedSlot = true;
  }
  if (prog.level >= MAX_LEVEL) prog.xp = 0;
  setAttuneProgress(player, itemOrId, prog);
  return { ...prog, need: xpNeeded(prog.level), leveled, unlockedSlot };
}

/** Test Bench helper: max out a relic's attunement level (keeps its rolled skills). */
export function debugMaxAttune(player, stack) {
  if (!stack?.typeId) return undefined;
  const prog = getAttuneProgress(player, stack);
  prog.level = MAX_LEVEL;
  prog.xp = 0;
  if (!setAttuneProgress(player, stack, prog)) return undefined;
  return restampExamineStack(player, stack) ?? stack;
}

/**
 * Test Bench helper: force a specific attunement onto a relic (ignores ritual rules).
 * Replaces slot 0, sets relic level high enough to unlock the rarity's full tier.
 */
export function debugStampAttune(player, stack, group, key, rarity = "epic") {
  if (!stack?.typeId) return undefined;
  const def = getAttuneDef(group, key);
  if (!def) return undefined;
  const rar = RARITY[rarity] ? rarity : "epic";
  const prog = getAttuneProgress(player, stack);
  // Epic = Powers IV; bump relic level to at least the rarity cap (and unlock slot 2).
  prog.level = Math.max(prog.level, rarityCap(rar), SECOND_SLOT_LEVEL, rar === "epic" ? 4 : 1);
  prog.xp = 0;
  prog.slots = [{ group, key, rarity: rar }];
  if (!setAttuneProgress(player, stack, prog)) return undefined;
  return restampExamineStack(player, stack) ?? stack;
}

/**
 * Roll / reroll an attunement onto a relic (spicy: rerolls slot 0, resets its level base).
 * If a free slot is available (slotCap > slots), fills it; otherwise rerolls slot 0.
 * @param {{group,key,rarity,level,name}} rolled
 * @returns {{ prog, replaced:boolean, slot }}
 */
export function applyRolledAttunement(player, itemOrId, rolled) {
  const prog = getAttuneProgress(player, itemOrId);
  const slot = { group: rolled.group, key: rolled.key, rarity: rolled.rarity };
  let replaced = false;
  if (prog.slots.length < prog.slotCap) {
    prog.slots.push(slot);
  } else {
    prog.slots[0] = slot;
    replaced = true;
  }
  if (!setAttuneProgress(player, itemOrId, prog)) {
    return undefined;
  }
  return { prog: getAttuneProgress(player, itemOrId), replaced, slot };
}

/** Effective level of a slot = min(relic level, rarity cap). At least 1 once attuned. */
export function slotLevel(prog, slot) {
  const cap = rarityCap(slot.rarity);
  return Math.max(1, Math.min(prog.level || 1, cap));
}

/** Resolved live effects for an equipped relic (used by the applier). */
export function resolveAttuneEffects(player, itemOrId) {
  const prog = getAttuneProgress(player, itemOrId);
  const out = [];
  for (const slot of prog.slots) {
    const def = getAttuneDef(slot.group, slot.key);
    if (!def) continue;
    const lvl = slotLevel(prog, slot);
    out.push({
      group: slot.group,
      key: slot.key,
      def,
      level: lvl,
      magnitude: attuneMagnitude({ ...slot, level: lvl }),
    });
  }
  return out;
}

/** One color-coded lore chip for a slot, e.g. "§cFerocity II §7(Common)". */
function slotChip(prog, slot) {
  const def = getAttuneDef(slot.group, slot.key);
  if (!def) return "";
  const lvl = slotLevel(prog, slot);
  const cap = rarityCap(slot.rarity);
  const roman = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"][lvl] || String(lvl);
  const rar = RARITY[slot.rarity];
  const name = paint(groupInk(slot.group), `${def.name} ${roman}`);
  const tag = paint(rar?.ink ?? Ink.muted, `(${rar?.label ?? "Common"})`);
  const capped = lvl >= cap ? paint(Ink.dim, " max") : "";
  return `${name} ${tag}${capped}`;
}

/**
 * Invisible UI gauge prefix for the bay relic's nameTag.
 * Format: §T§O§S1§S2§r  (T/O = XP% digits, S1/S2 = unlock flags)
 *
 * Bedrock JSON UI `%.Ns` counts UTF-8 BYTES, and § (U+00A7) is 2 bytes.
 * Digit byte offsets: tens=3, ones=6, slot1=9, slot2=12.
 * Extract with (%.Ns - %.(N-1)s) at those N values.
 */
function gaugePrefix(prog) {
  const need = xpNeeded(prog.level) || XP_PER_LEVEL;
  const pct =
    prog.level >= MAX_LEVEL
      ? 99
      : Math.min(99, Math.max(0, Math.floor(((prog.xp || 0) / need) * 100)));
  const two = String(pct).padStart(2, "0");
  const s1 = prog.slots.length >= 1 ? "1" : "0";
  const s2 = prog.slotCap >= 2 ? "1" : "0";
  return `\u00a7${two[0]}\u00a7${two[1]}\u00a7${s1}\u00a7${s2}\u00a7r`;
}

/** Sweep stale legacy gauge items (relics:ui_plus) out of a player's bags. */
export function stripGaugeFromPlayer(player) {
  if (!player) return;
  const wipe = (c) => {
    if (!c) return;
    for (let i = 0; i < c.size; i++) {
      try {
        if (c.getItem(i)?.typeId === GAUGE_ID) c.setItem(i, undefined);
      } catch {
      }
    }
  };
  wipe(player.getComponent("minecraft:inventory")?.container);
  try {
    wipe(player.getComponent("minecraft:cursor_inventory")?.container);
  } catch {
  }
}

/**
 * Stable item tooltip = registry lore only (gated by player Affinity/Attunement settings).
 * Attune Lv / skills stay in Forge forms + action bar — never rewrite the hover.
 */
function applyStableRelicTooltip(stack, player) {
  if (!stack?.typeId) return false;
  const def = getRelicDef(stack.typeId);
  if (!def) return false;
  const lines = loreLinesForItem(stack.typeId, def, loreOptsForPlayer(player));
  let changed = false;
  try {
    if (stack.nameTag) {
      stack.nameTag = undefined;
      changed = true;
    }
  } catch {
    try {
      if (stack.nameTag) {
        stack.nameTag = "";
        changed = true;
      }
    } catch {
    }
  }
  try {
    const cur = typeof stack.getLore === "function" ? stack.getLore() : [];
    const same = cur.length === lines.length && cur.every((l, i) => l === lines[i]);
    if (!same) {
      stack.setLore(lines);
      changed = true;
    }
  } catch {
  }
  return changed;
}

/** @deprecated Kept for callers; returns stable tooltip data (no attune rewrite). */
export function buildAttuneStamp(player, itemOrId) {
  const itemId = itemOrId?.typeId ?? itemOrId;
  const def = getRelicDef(itemId);
  if (!def) return undefined;
  const name = def.displayName || itemId.replace("relics:", "").replace(/_/g, " ");
  const prog = getAttuneProgress(player, itemOrId);
  return {
    name,
    prog,
    tagged: "",
    lines: loreLinesForItem(itemId, def, loreOptsForPlayer(player)),
  };
}

export function syncExamineRelic(player, stack) {
  if (!stack?.typeId) return false;
  if (!getRelicDef(stack.typeId)) return false;
  ensureAttuneIdentity(player, stack);
  return applyStableRelicTooltip(stack, player);
}

export function restampExamineStack(player, stack) {
  if (!stack?.typeId || !getRelicDef(stack.typeId)) return undefined;
  try {
    const next = stack.clone();
    next.amount = 1;
    ensureAttuneIdentity(player, next);
    applyStableRelicTooltip(next, player);
    return next;
  } catch {
    syncExamineRelic(player, stack);
    return stack;
  }
}

export function attuneActionBar(player, stack) {
  if (!player || !stack) return;
  const def = getRelicDef(stack.typeId);
  if (!def) return;
  const prog = getAttuneProgress(player, stack);
  const name = def.displayName || "Relic";
  try {
    if (prog.slots.length === 0) {
      player.onScreenDisplay.setActionBar(`${paint(Ink.gold, name)}  ·  §7unattuned — add two focus materials`);
    } else {
      player.onScreenDisplay.setActionBar(
        `${paint(Ink.gold, name)}  ·  Lv ${prog.level}  ·  XP ${prog.xp}/${xpNeeded(prog.level)}`
      );
    }
  } catch {
  }
}

/** Chat + action bar ping when a ritual rolls a new attunement. */
export function announceRoll(player, itemId, result) {
  const def = getRelicDef(itemId);
  const name = def?.displayName || "Relic";
  const adef = getAttuneDef(result.slot.group, result.slot.key);
  const prog = result.prog;
  const chip = (() => {
    const rar = RARITY[result.slot.rarity];
    return `${paint(groupInk(result.slot.group), adef?.name ?? result.slot.key)} ${paint(
      rar?.ink ?? Ink.muted,
      `(${rar?.label ?? "Common"})`
    )}`;
  })();
  try {
    player.sendMessage(
      `${paint(Ink.purple, "Attunement Forge")} — ${name} ${result.replaced ? "reforged" : "attuned"}: ${chip}`
    );
    player.playSound(result.replaced ? "random.anvil_use" : "random.anvil_land", {
      volume: 0.5,
      pitch: 1.1,
    });
  } catch {
  }
}

export function groupColorList() {
  return Object.entries(GROUP_LABELS).map(([g, label]) => paint(AttuneInk[g], label));
}
