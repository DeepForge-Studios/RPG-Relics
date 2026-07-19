import { system } from "@minecraft/server";

const guarded = new Map();

function key(player, victim) {
  return `${player?.id ?? ""}:${victim?.id ?? ""}`;
}

export function guardBonusDamage(player, victim, ticks = 3) {
  if (!player || !victim) return;
  guarded.set(key(player, victim), system.currentTick + Math.max(1, ticks));
}

export function isBonusDamageGuarded(player, victim) {
  const id = key(player, victim);
  const until = guarded.get(id) ?? -1;
  if (until < system.currentTick) {
    guarded.delete(id);
    return false;
  }
  return true;
}
