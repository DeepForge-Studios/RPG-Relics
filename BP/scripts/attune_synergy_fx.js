/**
 * Synergy Affinity FX — unique per-class particle + sound cues for the
 * Reliquary Synergy system. Six Affinity classes, each with a distinct
 * proc/echo particle under `RP/particles/synergy_<class>_*.json` (tints in
 * `theme.js` → `AffinityRgb`), plus a shared purple/gold forge burst.
 *
 * Kept standalone so combat logic (e.g. attune_synergy.js) can import and
 * call these without this module reaching back into runtime state.
 */

/** Valid Affinity class keys — must match RP/particles + RP/sounds/synergy filenames. */
export const SYNERGY_CLASSES = Object.freeze([
  "berserker",
  "guardian",
  "scout",
  "trickster",
  "healer",
  "arcanist",
]);

function isSynergyClass(affinityKey) {
  return SYNERGY_CLASSES.includes(affinityKey);
}

function particle(dim, id, loc) {
  try {
    dim.spawnParticle(id, loc);
  } catch {
  }
}

function sound(player, id, pitch = 1, volume = 0.5) {
  try {
    player.playSound(id, { pitch, volume });
  } catch {
  }
}

function location(player, y = 1) {
  return {
    x: player.location.x,
    y: player.location.y + y,
    z: player.location.z,
  };
}

/** Synergy proc — main trigger cue. Class particle + class sound + shared "proc" sting. */
export function playSynergyProc(player, affinityKey) {
  if (!player || !isSynergyClass(affinityKey)) return;
  particle(player.dimension, `relics:synergy_${affinityKey}_proc`, location(player));
  sound(player, `relics.synergy.${affinityKey}`, 1, 0.55);
  sound(player, "relics.synergy.proc", 0.95 + Math.random() * 0.15, 0.4);
}

/** Synergy echo — softer repeat/follow-up cue. */
export function playSynergyEcho(player, affinityKey) {
  if (!player || !isSynergyClass(affinityKey)) return;
  particle(player.dimension, `relics:synergy_${affinityKey}_echo`, location(player));
  sound(player, `relics.synergy.${affinityKey}`, 1.3, 0.35);
  sound(player, "relics.synergy.echo", 0.8 + Math.random() * 0.15, 0.35);
}

/** Synergy forge — Attunement Forge reroll/upgrade cue. Shared gold→purple burst. */
export function playSynergyForge(player, affinityKey) {
  if (!player || !isSynergyClass(affinityKey)) return;
  particle(player.dimension, "relics:synergy_forge", location(player, 0.8));
  sound(player, `relics.synergy.${affinityKey}`, 0.85, 0.45);
  sound(player, "relics.synergy.forge", 1, 0.55);
}
