/**
 * Affinity ↔ Attunement primary Synergy.
 *
 * Forge is hard-locked to a relic's AFFINITY_ATTUNE_GROUPS paths. Synergy only
 * fires when the stamped attunement group matches the relic's PRIMARY affinity
 * group (index 0). The adjacent path (index 1) stays baseline (1.0×).
 *
 *   Primary  = AFFINITY_ATTUNE_GROUPS[affinity][0]   (e.g. might → "might")
 *   Adjacent = AFFINITY_ATTUNE_GROUPS[affinity][1]   → no synergy
 *
 * Numeric mods apply ONLY to custom (scripted) damage/heal/shield numbers,
 * durations, cooldowns, and chance rolls — never to vanilla effect amplifiers
 * (e.g. Resistance IV stays IV).
 */
import { AFFINITY_ATTUNE_GROUPS, relicAffinity } from "./attune_pool.js";
import { playSynergyProc, playSynergyEcho, playSynergyForge } from "./attune_synergy_fx.js";

/** Internal affinity key → FX/sound class slug (matches RP particles + sounds). */
export const AFFINITY_CLASS_SLUG = Object.freeze({
  might: "berserker",
  ward: "guardian",
  gale: "scout",
  fortune: "trickster",
  vitality: "healer",
  alchemy: "arcanist",
});

export function affinityClassSlug(key) {
  return AFFINITY_CLASS_SLUG[key] ?? "arcanist";
}

/** Absolute cap for any chance after the synergy bonus is added. */
export const SYNERGY_CHANCE_CAP = 0.95;

const PRIMARY_MODS = Object.freeze({
  durationMult: 1.5,
  cooldownMult: 0.7,
  chanceBonus: 0.2,
  powerMult: 1.35,
  echoTicks: 15,
  echoMult: 0.5,
});

const NEUTRAL_MODS = Object.freeze({
  durationMult: 1,
  cooldownMult: 1,
  chanceBonus: 0,
  powerMult: 1,
  echoTicks: 0,
  echoMult: 0,
});

/**
 * @returns {"primary"|"adjacent"|"none"}
 */
export function synergyTier(affinityKey, attuneGroup) {
  const groups = AFFINITY_ATTUNE_GROUPS[affinityKey];
  if (!groups || !attuneGroup) return "none";
  if (groups[0] === attuneGroup) return "primary";
  if (groups[1] === attuneGroup) return "adjacent";
  return "none";
}

/** Same as synergyTier but resolves the affinity from a relic def. */
export function synergyTierForRelic(def, attuneGroup) {
  return synergyTier(relicAffinity(def), attuneGroup);
}

/** Primary attune group for a relic def (its "home" path). */
export function primaryGroupForRelic(def) {
  return AFFINITY_ATTUNE_GROUPS[relicAffinity(def)]?.[0];
}

/** True when `group` is the relic's primary (synergy) path. */
export function isPrimaryGroupForRelic(def, group) {
  return !!group && primaryGroupForRelic(def) === group;
}

/** Numeric modifier bundle for a tier. */
export function synergyMods(tier) {
  return tier === "primary" ? PRIMARY_MODS : NEUTRAL_MODS;
}

/** Cooldown ticks after synergy discount (min 1). */
export function synCooldown(tier, ticks) {
  return Math.max(1, Math.round(ticks * synergyMods(tier).cooldownMult));
}

/** Duration ticks after synergy extension (min 1). */
export function synDuration(tier, ticks) {
  return Math.max(1, Math.round(ticks * synergyMods(tier).durationMult));
}

/** Chance after synergy bonus, capped. */
export function synChance(tier, chance) {
  return Math.min(SYNERGY_CHANCE_CAP, chance + synergyMods(tier).chanceBonus);
}

/** Scaled custom power (damage/heal/shield numbers only). */
export function synPower(tier, amount) {
  return amount * synergyMods(tier).powerMult;
}

/**
 * Primary Synergy proc cue — per-class particles + sounds via attune_synergy_fx.
 * @param {import("@minecraft/server").Player} player
 * @param {string} [affinityKey] internal key (might|ward|…)
 */
export function playSynergyFeedback(player, affinityKey) {
  if (!player) return;
  try {
    playSynergyProc(player, affinityClassSlug(affinityKey));
  } catch {
  }
}

/** Echo follow-up cue (half-power pulse). */
export function playSynergyEchoFeedback(player, affinityKey) {
  if (!player) return;
  try {
    playSynergyEcho(player, affinityClassSlug(affinityKey));
  } catch {
  }
}

/** Forge success when ritual used the primary Synergy path. */
export function playSynergyForgeFeedback(player, affinityKey) {
  if (!player) return;
  try {
    playSynergyForge(player, affinityClassSlug(affinityKey));
  } catch {
  }
}
