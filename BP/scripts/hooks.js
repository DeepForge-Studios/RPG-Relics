import { system, EntityDamageCause, BlockPermutation, world, ItemStack } from "@minecraft/server";
import { getEquippedAll, setEquippedStack } from "./relics.js";
import { getRelicTier, shortBlurb } from "./descriptions.js";
import { areBoostsEnabled, areEffectNotificationsEnabled } from "./settings.js";
import { BOOST_ORDER, BOOST_LABELS, BOOST_ABILITIES } from "./boosts_data.js";
import {
  resolveAttuneEffects,
  attuneAddXp,
  isAttuned,
  ensureAttuneIdentity,
  hasAttuneIdentity,
  syncExamineRelic,
} from "./attune_data.js";
import { guardBonusDamage, isBonusDamageGuarded } from "./combat_guard.js";
import {
  handleAttuneAttack,
  handleAttuneHurtBefore,
  handleAttuneHurtAfter,
  handleAttuneKill,
} from "./attune_runtime.js";

export { BOOST_ABILITIES };

const TICK = 20;
const PASSIVE_DUR = TICK * 8;
const cooldowns = new Map();
const resonanceHits = new Map();

function attuneLoadout(player) {
  const equipped = getEquippedAll(player);
  for (const row of equipped) {
    if (hasAttuneIdentity(row.stack)) continue;
    ensureAttuneIdentity(player, row.stack);
    setEquippedStack(player, row.slot, row.stack, { sync: false });
  }
  return equipped;
}

function showActionBar(player, message) {
  if (!areEffectNotificationsEnabled(player)) return;
  player.onScreenDisplay.setActionBar(message);
}

const RESONANCE_LABELS = BOOST_LABELS;

const GALE_CUSTOM = new Set([
  "fluid_movement",
  "swim_boost",
  "liquid_sprint",
  "double_jump",
  "triple_jump",
  "gale_glide",
  "no_fall_damage",
  "leviathan_striders",
  "windsprint_greaves",
]);
const WARD_CUSTOM = new Set([
  "phase_dodge",
  "knockback_resist",
  "fire_res_on_burn",
  "repel_creepers",
  "crystal_shards",
]);
const FORTUNE_CUSTOM = new Set([
  "double_ore",
  "item_magnet",
  "fishing_haul",
  "reveal_hostiles",
]);
const VITALITY_CUSTOM = new Set([
  "second_wind",
  "sustaining_cap",
]);
const ALCHEMY_CUSTOM = new Set([
  "purify_effects",
  "grand_alchemy",
  "potion_linger",
  "toxin_filter",
  "wither_cleanse",
  "full_toxin_ward",
]);

const tideFloor = new Map();
const ICE = "minecraft:frosted_ice";
const MAGMA = "minecraft:magma";
const MAGMA_ALT = "minecraft:magma_block";

const EFFECT_ALIASES = {
  village_hero: ["hero_of_the_village", "village_hero"],
  hero_of_the_village: ["hero_of_the_village", "village_hero"],
  night_vision: ["night_vision"],
  saturation: ["saturation"],
  water_breathing: ["water_breathing"],
  haste: ["haste"],
  invisibility: ["invisibility"],
  jump_boost: ["jump_boost"],
  health_boost: ["health_boost"],
  slow_falling: ["slow_falling"],
  strength: ["strength"],
  dolphins_grace: ["dolphins_grace"],
  speed: ["speed"],
  resistance: ["resistance"],
  fire_resistance: ["fire_resistance"],
  regeneration: ["regeneration"],
  wither: ["wither"],
  luck: ["luck"],
};

function isTideFooting(id) {
  return id === ICE || id === MAGMA || id === MAGMA_ALT;
}

function isCooling(player, tag, durationTicks) {
  const key = `${player.id}:${tag}`;
  const until = cooldowns.get(key) ?? 0;
  if (system.currentTick < until) return true;
  cooldowns.set(key, system.currentTick + durationTicks);
  return false;
}

function tierRank(itemId) {
  const tier = getRelicTier(itemId);
  return tier === "rare" ? 3 : tier === "uncommon" ? 2 : 1;
}

function relicAffinity(def) {
  if (def.onAttack?.lifesteal) return "vitality";
  if (def.onAttack || def.custom === "execute_low_hp") return "might";
  if (
    def.onHurt ||
    WARD_CUSTOM.has(def.custom) ||
    def.passive?.effect === "resistance" ||
    def.passive?.effect === "fire_resistance"
  ) {
    return "ward";
  }
  if (
    GALE_CUSTOM.has(def.custom) ||
    ["speed", "jump_boost", "slow_falling", "dolphins_grace"].includes(def.passive?.effect)
  ) {
    return "gale";
  }
  if (
    FORTUNE_CUSTOM.has(def.custom) ||
    def.onKill ||
    ["luck", "village_hero", "haste"].includes(def.passive?.effect)
  ) {
    return "fortune";
  }
  if (
    VITALITY_CUSTOM.has(def.custom) ||
    def.onAttack?.lifesteal ||
    ["regeneration", "health_boost", "saturation"].includes(def.passive?.effect)
  ) {
    return "vitality";
  }
  if (ALCHEMY_CUSTOM.has(def.custom)) return "alchemy";
  return "alchemy";
}

function emptyBoostScores() {
  return {
    might: 0,
    ward: 0,
    gale: 0,
    fortune: 0,
    vitality: 0,
    alchemy: 0,
  };
}

function scoreEquippedBoosts(player) {
  const scores = emptyBoostScores();
  const levels = emptyBoostScores();
  const equipped = getEquippedAll(player);
  for (const { itemId, def } of equipped) {
    const affinity = relicAffinity(def);
    const rank = tierRank(itemId);
    scores[affinity] += rank;
    levels[affinity] = Math.max(levels[affinity], rank);
  }
  return { scores, levels, equipped };
}

/** Live loadout for Boost Codex / status. */
export function boostLoadout(player) {
  const enabled = areBoostsEnabled(player);
  const { scores, levels, equipped } = scoreEquippedBoosts(player);
  if (!equipped.length) {
    return { enabled, equipped: false, scores, levels, active: undefined };
  }
  let affinity = BOOST_ORDER[0];
  for (const candidate of BOOST_ORDER) {
    if (scores[candidate] > scores[affinity]) affinity = candidate;
  }
  const active = enabled
    ? {
        affinity,
        label: RESONANCE_LABELS[affinity],
        level: levels[affinity] || 1,
        score: scores[affinity],
      }
    : undefined;
  return { enabled, equipped: true, scores, levels, active };
}

function resonanceProfile(player) {
  return boostLoadout(player).active;
}

function blockId(player, yOffset = 0) {
  const loc = player.location;
  return (
    player.dimension.getBlock({
      x: Math.floor(loc.x),
      y: Math.floor(loc.y + yOffset),
      z: Math.floor(loc.z),
    })?.typeId ?? ""
  );
}

function isLiquidId(id) {
  return id.includes("water") || id.includes("lava");
}

export function applyEffect(entity, effectId, duration, amplifier = 0, showParticles = false) {
  if (!entity || !effectId) return false;
  const opts = { amplifier: amplifier ?? 0, showParticles: !!showParticles };
  const bare = effectId.startsWith("minecraft:")
    ? effectId.slice("minecraft:".length)
    : effectId;
  const aliases = EFFECT_ALIASES[bare] ?? [bare];
  const ids = [];
  for (const a of aliases) {
    ids.push(a, `minecraft:${a}`);
  }
  for (const id of ids) {
    try {
      entity.addEffect(id, Math.max(1, Math.floor(duration)), opts);
      return true;
    } catch {
    }
  }
  return false;
}

function floorKey(dimId, x, y, z) {
  return `${dimId}|${x}|${y}|${z}`;
}

function restoreTideFloorEntry(info) {
  try {
    const dim = world.getDimension(info.dimId);
    const block = dim.getBlock({ x: info.x, y: info.y, z: info.z });
    if (!block) return;
    const id = block.typeId ?? "";
    if (!isTideFooting(id)) return;
    block.setPermutation(BlockPermutation.resolve(info.restore));
  } catch {
  }
}

function restoreExpiredTideFloors() {
  const now = system.currentTick;
  for (const [key, info] of tideFloor) {
    if (now < info.expire) continue;
    restoreTideFloorEntry(info);
    tideFloor.delete(key);
  }
}

function placeTideFloor(dim, x, y, z, liquidId) {
  const water = liquidId.includes("water");
  const lava = liquidId.includes("lava");
  if (!water && !lava) return false;

  const restore = liquidId.startsWith("minecraft:")
    ? liquidId
    : water
      ? "minecraft:water"
      : "minecraft:lava";

  try {
    const block = dim.getBlock({ x, y, z });
    if (!block) return false;
    const cur = block.typeId ?? "";
    if (isTideFooting(cur)) {
      const key = floorKey(dim.id, x, y, z);
      const prev = tideFloor.get(key);
      if (prev) prev.expire = system.currentTick + 25;
      return lava;
    }
    if (!cur.includes("water") && !cur.includes("lava")) return false;

    try {
      if (water) {
        try {
          block.setPermutation(BlockPermutation.resolve(ICE, { age: 0 }));
        } catch {
          block.setPermutation(BlockPermutation.resolve(ICE));
        }
      } else {
        try {
          block.setPermutation(BlockPermutation.resolve(MAGMA));
        } catch {
          block.setPermutation(BlockPermutation.resolve("minecraft:magma_block"));
        }
      }
    } catch {
      return false;
    }
    tideFloor.set(floorKey(dim.id, x, y, z), {
      dimId: dim.id,
      x,
      y,
      z,
      restore,
      expire: system.currentTick + 25,
    });
    return lava;
  } catch {
    return false;
  }
}

function hasTidewalkers(player) {
  for (const { def } of getEquippedAll(player)) {
    if (def.custom === "liquid_sprint" || def.custom === "leviathan_striders") return true;
  }
  return false;
}

export function tickTidewalkers(player) {
  restoreExpiredTideFloors();

  if (!hasTidewalkers(player)) return;
  if (player.isSneaking) return;

  const dim = player.dimension;
  const fx = Math.floor(player.location.x);
  const fy = Math.floor(player.location.y);
  const fz = Math.floor(player.location.z);
  let onLava = false;

  for (let ox = -1; ox <= 1; ox++) {
    for (let oz = -1; oz <= 1; oz++) {
      for (const dy of [-1, 0]) {
        let block;
        try {
          block = dim.getBlock({ x: fx + ox, y: fy + dy, z: fz + oz });
        } catch {
          continue;
        }
        if (!block) continue;
        const id = block.typeId ?? "";
        let liquidId = "";
        if (id.includes("water") || id.includes("lava")) {
          liquidId = id;
        } else {
          try {
            if (block.isWaterlogged) liquidId = "minecraft:water";
          } catch {
          }
        }
        if (!liquidId) continue;
        if (placeTideFloor(dim, fx + ox, fy + dy, fz + oz, liquidId)) onLava = true;
      }
    }
  }

  if (onLava) {
    applyEffect(player, "fire_resistance", TICK * 4, 0, false);
  }
}

function isOnFire(player) {
  try {
    if (player.getComponent?.("minecraft:onfire")) return true;
  } catch {
  }
  try {
    return !!player.isOnFire;
  } catch {
    return false;
  }
}

function causeId(cause) {
  if (cause == null) return "";
  return String(cause);
}

function isFireCause(cause) {
  const c = causeId(cause);
  return (
    cause === EntityDamageCause.fire ||
    cause === EntityDamageCause.fireTick ||
    cause === EntityDamageCause.lava ||
    cause === EntityDamageCause.magma ||
    cause === EntityDamageCause.campfire ||
    c === "fire" ||
    c === "fireTick" ||
    c === "lava" ||
    c === "magma" ||
    c === "campfire"
  );
}

function isFallCause(cause) {
  const c = causeId(cause);
  return cause === EntityDamageCause.fall || c === "fall";
}

EFFECT_ALIASES.glowing = ["glowing"];

const jumpState = new Map();

const ORE_BONUS = {
  "minecraft:coal_ore": "minecraft:coal",
  "minecraft:deepslate_coal_ore": "minecraft:coal",
  "minecraft:iron_ore": "minecraft:raw_iron",
  "minecraft:deepslate_iron_ore": "minecraft:raw_iron",
  "minecraft:copper_ore": "minecraft:raw_copper",
  "minecraft:deepslate_copper_ore": "minecraft:raw_copper",
  "minecraft:gold_ore": "minecraft:raw_gold",
  "minecraft:deepslate_gold_ore": "minecraft:raw_gold",
  "minecraft:nether_gold_ore": "minecraft:gold_nugget",
  "minecraft:diamond_ore": "minecraft:diamond",
  "minecraft:deepslate_diamond_ore": "minecraft:diamond",
  "minecraft:emerald_ore": "minecraft:emerald",
  "minecraft:deepslate_emerald_ore": "minecraft:emerald",
  "minecraft:lapis_ore": "minecraft:lapis_lazuli",
  "minecraft:deepslate_lapis_ore": "minecraft:lapis_lazuli",
  "minecraft:redstone_ore": "minecraft:redstone",
  "minecraft:deepslate_redstone_ore": "minecraft:redstone",
  "minecraft:nether_quartz_ore": "minecraft:quartz",
  "minecraft:ancient_debris": "minecraft:netherite_scrap",
};

function hasCustom(player, custom) {
  for (const { def } of getEquippedAll(player)) {
    if (def.custom === custom) return def;
  }
  return undefined;
}

function isToxinCause(cause) {
  const c = causeId(cause);
  return c === "wither" || c === "poison" || cause === EntityDamageCause.wither;
}

function clearToxins(player) {
  for (const id of ["poison", "wither", "nausea", "blindness"]) {
    try {
      player.removeEffect(id);
    } catch {
    }
    try {
      player.removeEffect(`minecraft:${id}`);
    } catch {
    }
  }
}

function clearWither(player) {
  for (const id of ["wither", "minecraft:wither"]) {
    try {
      player.removeEffect(id);
    } catch {
    }
  }
}

function isWitherCause(cause) {
  const c = causeId(cause);
  return c === "wither" || cause === EntityDamageCause.wither;
}

function revealHostiles(player, radius) {
  let mobs = [];
  try {
    mobs = player.dimension.getEntities({
      location: player.location,
      maxDistance: radius,
      families: ["monster"],
    });
  } catch {
    mobs = player.dimension.getEntities({
      location: player.location,
      maxDistance: radius,
      excludeTypes: ["minecraft:player", "minecraft:item", "minecraft:xp_orb"],
    });
  }
  for (const mob of mobs) {
    applyEffect(mob, "glowing", TICK * 3, 0, false);
    try {
      mob.dimension.spawnParticle("minecraft:mobspell_emitter", {
        x: mob.location.x,
        y: mob.location.y + 1,
        z: mob.location.z,
      });
    } catch {
    }
  }
  if (mobs.length) {
    try {
      showActionBar(player, `§bHunter's Lens: §f${mobs.length} hostile${mobs.length === 1 ? "" : "s"} nearby`);
      player.playSound("random.orb", { volume: 0.25, pitch: 1.6 });
    } catch {
    }
  }
}

function crystalBurst(player, damage, radius) {
  const mobs = player.dimension.getEntities({
    location: player.location,
    maxDistance: radius,
    excludeTypes: ["minecraft:player", "minecraft:item", "minecraft:xp_orb"],
  });
  for (const mob of mobs) {
    try {
      mob.applyDamage(damage, {
        cause: EntityDamageCause.magic,
        damagingEntity: player,
      });
    } catch {
      try {
        mob.applyDamage(damage);
      } catch {
      }
    }
    try {
      mob.dimension.spawnParticle("minecraft:splash_spell_emitter", {
        x: mob.location.x,
        y: mob.location.y + 0.7,
        z: mob.location.z,
      });
    } catch {
    }
  }
  try {
    player.dimension.spawnParticle?.("minecraft:splash_spell_emitter", {
      x: player.location.x,
      y: player.location.y + 1,
      z: player.location.z,
    });
  } catch {
  }
}

function viewForward(player) {
  try {
    const v = player.getViewDirection();
    return { x: v.x, y: v.y, z: v.z };
  } catch {
    return { x: 0, y: 0, z: 1 };
  }
}

function impulse(entity, x, y, z) {
  try {
    entity.applyImpulse({ x, y, z });
    return;
  } catch {
  }
  try {
    entity.applyKnockback({ x, z }, Math.max(0.05, y));
  } catch {
    try {
      entity.applyKnockback(x, z, Math.hypot(x, z), y);
    } catch {
    }
  }
}

function healPlayer(player, amount) {
  try {
    const health = player.getComponent("minecraft:health");
    if (!health) return;
    health.setCurrentValue(Math.min(health.effectiveMax, health.currentValue + amount));
  } catch {
  }
}

function igniteEntity(entity, seconds) {
  if (!entity || seconds <= 0) return false;
  try {
    if (typeof entity.setOnFire === "function") {
      const ok = entity.setOnFire(seconds, true);
      if (ok !== false) return true;
    }
  } catch {
  }
  try {
    return entity.setOnFire?.(seconds, false) === true;
  } catch {
    return false;
  }
}

/**
 * Wear-to-level: grant attune XP to every equipped, attuned relic.
 * @param {number} amount
 * @param {string} tag  cooldown key ("" = no cooldown)
 * @param {number} cd   cooldown ticks (0 = none)
 */
export function grantWearXp(player, amount, tag, cd = 0) {
  if (!player) return;
  if (cd > 0 && isCooling(player, `wx_${tag}`, cd)) return;
  for (const { slot, stack } of attuneLoadout(player)) {
    if (!isAttuned(player, stack)) continue;
    attuneAddXp(player, stack, amount);
    syncExamineRelic(player, stack);
    setEquippedStack(player, slot, stack, { sync: false });
  }
}

/** Apply periodic (mcEffect) attunement effects — called from tickPassiveRelics. */
function applyAttunePassive(player) {
  for (const { stack } of attuneLoadout(player)) {
    for (const eff of resolveAttuneEffects(player, stack)) {
      if (eff.def.kind !== "mcEffect") continue;
      const amp = Math.max(0, Math.round(eff.magnitude));
      applyEffect(player, eff.def.effect, TICK * 3, amp, false);
    }
  }
}

/** On-hit attunement effects. Returns bonus melee damage to add. */
function applyAttuneAttack(player, victim, damage) {
  let bonus = 0;
  for (const { stack } of attuneLoadout(player)) {
    for (const eff of resolveAttuneEffects(player, stack)) {
      const k = eff.def.kind;
      const m = eff.magnitude;
      try {
        if (k === "melee") bonus += m;
        else if (k === "lifesteal" && damage > 0) healPlayer(player, damage * m);
        else if (k === "witherHit") system.run(() => applyEffect(victim, "wither", Math.round(m), eff.def.amp ?? 0, true));
        else if (k === "poisonHit") system.run(() => applyEffect(victim, "poison", Math.round(m), eff.def.amp ?? 0, true));
        else if (k === "slowHit") system.run(() => applyEffect(victim, "slowness", Math.round(m), eff.def.amp ?? 0, true));
        else if (k === "igniteHit") system.run(() => igniteEntity(victim, Math.round(m)));
      } catch {
      }
    }
  }
  return bonus;
}

/** Reflect attunement — called from handlePlayerHurtAfter. */
function applyAttuneHurt(player, attacker, damage) {
  if (!attacker || damage <= 0) return;
  for (const { stack } of attuneLoadout(player)) {
    for (const eff of resolveAttuneEffects(player, stack)) {
      if (eff.def.kind !== "reflect") continue;
      const dmg = damage * eff.magnitude;
      if (dmg <= 0) continue;
      system.run(() => {
        try {
          attacker.applyDamage(dmg, { cause: EntityDamageCause.thorns, damagingEntity: player });
        } catch {
          try {
            attacker.applyDamage(dmg);
          } catch {
          }
        }
      });
    }
  }
}

/** Kill attunement (heal / xp) — called from handlePlayerKill. */
function applyAttuneKill(player, victim) {
  for (const { stack } of attuneLoadout(player)) {
    for (const eff of resolveAttuneEffects(player, stack)) {
      const k = eff.def.kind;
      if (k === "killHeal") healPlayer(player, eff.magnitude);
      else if (k === "killXp") {
        const loc = victim?.location ?? player.location;
        for (let i = 0; i < Math.round(eff.magnitude); i++) {
          try {
            player.dimension.spawnEntity("minecraft:xp_orb", {
              x: loc.x + (Math.random() - 0.5) * 0.6,
              y: loc.y + 0.4,
              z: loc.z + (Math.random() - 0.5) * 0.6,
            });
          } catch {
          }
        }
      }
    }
  }
}

/** Ore-bonus attunement — called from handleOreBreak. */
function applyAttuneMine(player, blockTypeId, blockLocation) {
  if (!blockTypeId || !/ore/.test(blockTypeId)) return;
  for (const { stack } of attuneLoadout(player)) {
    for (const eff of resolveAttuneEffects(player, stack)) {
      if (eff.def.kind !== "oreBonus") continue;
      if (Math.random() < eff.magnitude) {
        try {
          player.dimension.spawnItem(new ItemStack(blockTypeId, 1), blockLocation ?? player.location);
        } catch {
        }
      }
    }
  }
}

export function tickPassiveRelics(player) {
  const equipped = getEquippedAll(player);
  grantWearXp(player, 1, "idle", 600);

  const resonance = resonanceProfile(player);
  if (
    resonance?.affinity === "gale" &&
    player.isSprinting &&
    !isCooling(player, "resonance_gale", [0, 160, 140, 120][resonance.level])
  ) {
    const duration = [0, 60, 80, 100][resonance.level];
    const amplifier = resonance.level >= 2 ? 1 : 0;
    applyEffect(player, "speed", duration, amplifier, true);
    if (resonance.level >= 3) applyEffect(player, "jump_boost", duration, 1, true);
    try {
      player.playSound("random.orb", { volume: 0.35, pitch: 1.65 });
      showActionBar(player, `§bGale Boost ${"I".repeat(resonance.level)} — Tailwind`);
    } catch {
    }
  }

  for (const { def } of equipped) {
    try {
      if (def.passive) {
        const dur =
          def.passive.effect === "night_vision" || def.passive.effect === "minecraft:night_vision"
            ? TICK * 15
            : PASSIVE_DUR;
        applyEffect(player, def.passive.effect, dur, def.passive.amplifier ?? 0, false);
      }

      switch (def.custom) {
        case "purify_effects":
          shortenNegatives(player, 0.35);
          break;
        case "grand_alchemy":
          shortenNegatives(player, 0.3);
          break;
        case "item_magnet":
          break;
        case "fluid_movement":
          if (inLiquid(player)) {
            applyEffect(player, "speed", PASSIVE_DUR, 2, false);
            applyEffect(player, "dolphins_grace", PASSIVE_DUR, 1, false);
          }
          break;
        case "swim_boost":
          if (inLiquid(player)) {
            applyEffect(player, "speed", PASSIVE_DUR, 2, false);
            applyEffect(player, "dolphins_grace", PASSIVE_DUR, 2, false);
          }
          break;
        case "liquid_sprint":
          applyEffect(player, "speed", PASSIVE_DUR, 1, false);
          break;
        case "leviathan_striders":
          if (inLiquid(player)) {
            applyEffect(player, "speed", PASSIVE_DUR, 3, false);
            applyEffect(player, "dolphins_grace", PASSIVE_DUR, 2, false);
            applyEffect(player, "fire_resistance", PASSIVE_DUR, 0, false);
          }
          break;
        case "windsprint_greaves":
          applyEffect(player, "jump_boost", PASSIVE_DUR, 1, false);
          break;
        case "repel_creepers":
          repelCreepers(player, def.repelRadius ?? 5);
          break;
        case "random_noise":
          if (Math.random() < 0.01) {
            try {
              player.playSound("mob.chicken.hurt", { volume: 0.4, pitch: 0.6 });
            } catch {
            }
          }
          break;
        case "knockback_resist":
          applyEffect(player, "resistance", PASSIVE_DUR, 0, false);
          break;
        case "fire_res_on_burn": {
          applyEffect(player, "fire_resistance", TICK * 15, 0, true);
          if (isOnFire(player)) {
            try {
              player.extinguishFire?.(true);
            } catch {
            }
          }
          break;
        }
        case "no_fall_damage":
          if (!player.isOnGround) {
            applyEffect(player, "slow_falling", 10, 0, false);
          }
          break;
        case "reveal_hostiles":
          if (!isCooling(player, "reveal_hostiles", 40)) {
            revealHostiles(player, def.revealRadius ?? 16);
          }
          break;
        case "toxin_filter":
          clearToxins(player);
          break;
        case "wither_cleanse":
          clearWither(player);
          break;
        case "full_toxin_ward":
          clearToxins(player);
          clearWither(player);
          break;
        case "sustaining_cap": {
          try {
            const hunger = player.getComponent("minecraft:player.hunger");
            if (
              hunger &&
              hunger.currentValue < hunger.effectiveMax &&
              !isCooling(player, "sustaining_cap", TICK * 5)
            ) {
              hunger.setCurrentValue(
                Math.min(hunger.effectiveMax, hunger.currentValue + 1)
              );
            }
          } catch {
          }
          break;
        }
        case "second_wind": {
          try {
            const health = player.getComponent("minecraft:health");
            const threshold = def.secondWindHp ?? 8;
            const cooldown = def.secondWindCooldown ?? TICK * 45;
            if (health && health.currentValue <= threshold && !isCooling(player, "second_wind", cooldown)) {
              const duration = def.secondWindDuration ?? TICK * 6;
              const amplifier = def.secondWindAmplifier ?? 1;
              applyEffect(player, "regeneration", duration, amplifier, true);
              applyEffect(player, "speed", duration, 1, true);
              try {
                player.playSound("random.orb", { volume: 0.7, pitch: 1.2 });
              } catch {
              }
              try {
                showActionBar(player, "§aSecond Wind!");
              } catch {
              }
            }
          } catch {
          }
          break;
        }
      }
    } catch (err) {
      console.warn(`[RPG Relics] relic tick error: ${err}`);
    }
  }
}

export function tickMovementRelics(player) {
  if (hasCustom(player, "toxin_filter")) clearToxins(player);
  if (hasCustom(player, "wither_cleanse")) clearWither(player);
  if (hasCustom(player, "full_toxin_ward")) {
    clearToxins(player);
    clearWither(player);
  }

  let jumpDef;
  for (const { def } of getEquippedAll(player)) {
    if (def.custom === "triple_jump" || def.custom === "double_jump") {
      jumpDef = def;
      break;
    }
  }
  if (jumpDef) {
    const maxAirJumps = jumpDef.custom === "triple_jump" ? 2 : 1;
    const st = jumpState.get(player.id) ?? {
      airJumps: 0,
      wasJumping: false,
      leftGround: false,
      releasedInAir: false,
    };
    let jumping = false;
    try {
      jumping = !!player.isJumping;
    } catch {
      jumping = false;
    }
    const onGround = !!player.isOnGround;
    if (onGround) {
      st.airJumps = 0;
      st.leftGround = false;
      st.releasedInAir = false;
    } else if (!st.leftGround) {
      st.leftGround = true;
    } else if (!jumping) {
      st.releasedInAir = true;
    } else if (
      st.releasedInAir &&
      jumping &&
      !st.wasJumping &&
      st.airJumps < maxAirJumps
    ) {
      st.airJumps += 1;
      impulse(player, 0, 0.48, 0);
      try {
        player.playSound("armor.equip_leather", { volume: 0.35, pitch: 1.6 });
      } catch {
      }
      try {
        player.dimension.spawnParticle("minecraft:basic_smoke_particle", {
          x: player.location.x,
          y: player.location.y + 0.1,
          z: player.location.z,
        });
      } catch {
      }
    }
    st.wasJumping = jumping;
    jumpState.set(player.id, st);
  }

  const gale = hasCustom(player, "gale_glide");
  if (gale && !player.isOnGround && player.isSneaking) {
    applyEffect(player, "slow_falling", 6, 0, false);
    const v = viewForward(player);
    impulse(
      player,
      v.x * 0.13,
      Math.max(-0.025, Math.min(0.07, v.y * 0.08)),
      v.z * 0.13
    );
  }
}

export function handleOreBreak(player, blockTypeId, blockLocation) {
  applyAttuneMine(player, blockTypeId, blockLocation);
  grantWearXp(player, 1, "mine", 20);
  const def = hasCustom(player, "double_ore");
  const dropId = ORE_BONUS[blockTypeId];
  if (!dropId) return;
  const resonance = resonanceProfile(player);
  const resonanceChance =
    resonance?.affinity === "fortune"
      ? [0, 0.06, 0.12, 0.2][resonance.level]
      : 0;
  const chance = Math.max(def?.oreChance ?? 0, resonanceChance);
  if (chance <= 0 || Math.random() > chance) return;
  const loc = {
    x: blockLocation.x + 0.5,
    y: blockLocation.y + 0.5,
    z: blockLocation.z + 0.5,
  };
  system.run(() => {
    try {
      player.dimension.spawnItem(new ItemStack(dropId, 1), loc);
      try {
        player.playSound("random.orb", { volume: 0.35, pitch: 1.4 });
        if (!def && resonanceChance > 0) {
          showActionBar(player, 
            `§6Fortune Boost ${"I".repeat(resonance.level)} — bonus ore`
          );
        }
      } catch {
      }
    } catch (err) {
      console.warn(`[RPG Relics] ore bonus failed: ${err}`);
    }
  });
}

export function tickRelicHud(_player) {
}

function shortenNegatives(player, keepRatio = 0.35) {
  const bad = [
    "poison",
    "wither",
    "weakness",
    "slowness",
    "mining_fatigue",
    "nausea",
    "blindness",
    "darkness",
    "bad_omen",
    "raid_omen",
    "trial_omen",
  ];
  for (const id of bad) {
    try {
      const effect = player.getEffect(id) ?? player.getEffect(`minecraft:${id}`);
      if (
        effect &&
        effect.duration > 40 &&
        !isCooling(player, `purify_effects:${id}`, Math.max(40, effect.duration))
      ) {
        player.removeEffect(id);
        try {
          player.removeEffect(`minecraft:${id}`);
        } catch {
        }
        applyEffect(player, id, Math.max(1, Math.floor(effect.duration * keepRatio)), effect.amplifier, false);
      }
    } catch {
    }
  }
}

function inLiquid(player) {
  return (
    isLiquidId(blockId(player)) ||
    isLiquidId(blockId(player, -0.2)) ||
    isLiquidId(blockId(player, -0.9))
  );
}

function pullItems(player, radius) {
  const items = player.dimension.getEntities({
    type: "minecraft:item",
    location: player.location,
    maxDistance: radius,
  });
  for (const ent of items) {
    const dx = player.location.x - ent.location.x;
    const dy = player.location.y + 0.4 - ent.location.y;
    const dz = player.location.z - ent.location.z;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
    const near = len < 2.5;
    if (near) {
      try {
        ent.teleport(
          {
            x: player.location.x,
            y: player.location.y + 0.15,
            z: player.location.z,
          },
          { dimension: player.dimension }
        );
        continue;
      } catch {
      }
    }
    const force = near ? 0.85 : 0.55;
    const yForce = near ? 0.4 : 0.28;
    try {
      ent.applyImpulse({
        x: (dx / len) * force,
        y: (dy / len) * yForce + (near ? 0.05 : 0),
        z: (dz / len) * force,
      });
    } catch {
    }
  }
}

export function tickMagnet(player) {
  let radius = 0;
  for (const { def } of getEquippedAll(player)) {
    if (def.custom === "item_magnet") {
      radius = Math.max(radius, def.magnetRadius ?? 12);
    }
    if (def.custom === "fishing_haul" && def.magnetRadius) {
      radius = Math.max(radius, def.magnetRadius);
    }
  }
  if (radius > 0) pullItems(player, radius);
}

function repelCreepers(player, radius) {
  const creepers = player.dimension.getEntities({
    type: "minecraft:creeper",
    location: player.location,
    maxDistance: radius,
  });
  for (const c of creepers) {
    const dx = c.location.x - player.location.x;
    const dz = c.location.z - player.location.z;
    const len = Math.sqrt(dx * dx + dz * dz) || 1;
    try {
      c.applyImpulse({ x: (dx / len) * 0.35, y: 0.05, z: (dz / len) * 0.35 });
    } catch {
    }
  }
}

export function handlePlayerHurtBefore(player, damageSource, incomingDamage = 0) {
  const attune = handleAttuneHurtBefore(player, damageSource, incomingDamage);
  if (attune.cancel) return attune;
  let cancel = false;
  for (const { def } of getEquippedAll(player)) {
    if (def.custom === "no_fall_damage" && isFallCause(damageSource.cause)) {
      cancel = true;
    }
    if (def.custom === "windsprint_greaves" && isFallCause(damageSource.cause)) {
      cancel = true;
    }
    if (def.custom === "fire_res_on_burn" && isFireCause(damageSource.cause)) {
      cancel = true;
    }
    if (def.custom === "toxin_filter" && isToxinCause(damageSource.cause)) {
      cancel = true;
    }
    if (def.custom === "wither_cleanse" && isWitherCause(damageSource.cause)) {
      cancel = true;
    }
    if (def.custom === "full_toxin_ward" && (isToxinCause(damageSource.cause) || isWitherCause(damageSource.cause))) {
      cancel = true;
    }
    if (
      def.custom === "phase_dodge" &&
      damageSource.damagingEntity &&
      Math.random() < (def.dodgeChance ?? 0.22)
    ) {
      cancel = true;
      system.run(() => {
        try {
          player.playSound("random.endermenportal", { volume: 0.45, pitch: 1.4 });
          showActionBar(player, "§dPhase Pearl blocked the hit");
        } catch {
        }
      });
    }
    if (
      def.custom === "executioners_phantom" &&
      damageSource.damagingEntity &&
      Math.random() < (def.dodgeChance ?? 0.24)
    ) {
      cancel = true;
      system.run(() => {
        try {
          player.playSound("random.endermenportal", { volume: 0.55, pitch: 1.25 });
          showActionBar(player, "§5Executioner's Phantom slipped the hit");
        } catch {
        }
      });
    }
  }
  const resonance = resonanceProfile(player);
  if (!cancel && resonance?.affinity === "ward" && damageSource.damagingEntity) {
    const chance = [0, 0.08, 0.14, 0.2][resonance.level];
    const cooldown = [0, 120, 100, 80][resonance.level];
    if (
      Math.random() < chance &&
      !isCooling(player, "resonance_ward", cooldown)
    ) {
      cancel = true;
      system.run(() => {
        try {
          player.playSound("item.shield.block", { volume: 0.7, pitch: 1.2 });
          showActionBar(player, 
            `§9Ward Boost ${"I".repeat(resonance.level)} — attack deflected`
          );
        } catch {
        }
      });
    }
  }
  return { cancel };
}

export function handlePlayerHurtAfter(player, damageSource, damage) {
  let hadNoFall = false;
  let hadFireWard = false;

  handleAttuneHurtAfter(player, damageSource, damage);
  grantWearXp(player, 1, "hurt", 60);

  for (const { def } of getEquippedAll(player)) {
    try {
      if (def.custom === "no_fall_damage") hadNoFall = true;
      if (def.custom === "fire_res_on_burn") hadFireWard = true;

      if (def.onHurt?.effect) {
        applyEffect(
          player,
          def.onHurt.effect,
          def.onHurt.duration ?? 60,
          def.onHurt.amplifier ?? 0,
          true
        );
      }

      if (def.onHurt?.thorns && Math.random() < def.onHurt.thorns.chance) {
        const attacker = damageSource.damagingEntity;
        if (attacker) {
          try {
            attacker.applyDamage(def.onHurt.thorns.damage, {
              cause: EntityDamageCause.magic,
              damagingEntity: player,
            });
          } catch {
            try {
              attacker.applyDamage(def.onHurt.thorns.damage);
            } catch {
            }
          }
        }
      }

      if (def.custom === "fire_res_on_burn" && isFireCause(damageSource.cause)) {
        applyEffect(player, "fire_resistance", TICK * 30, 0, true);
        try {
          player.extinguishFire?.(true);
        } catch {
        }
      }

      if (def.custom === "toxin_filter") {
        clearToxins(player);
        if (isToxinCause(damageSource.cause) && damage > 0) {
          healPlayer(player, damage);
        }
      }

      if (def.custom === "wither_cleanse") {
        clearWither(player);
        if (isWitherCause(damageSource.cause) && damage > 0) {
          healPlayer(player, damage);
        }
      }

      if (def.custom === "full_toxin_ward") {
        clearToxins(player);
        clearWither(player);
        if ((isToxinCause(damageSource.cause) || isWitherCause(damageSource.cause)) && damage > 0) {
          healPlayer(player, damage);
        }
      }

      if (def.custom === "crystal_shards" && damage > 0 && damageSource.damagingEntity) {
        if (!isCooling(player, "crystal_shards", 15)) {
          crystalBurst(player, def.shardDamage ?? 3, def.shardRadius ?? 3.5);
        }
      }
    } catch (err) {
      console.warn(`[RPG Relics] onHurt after error: ${err}`);
    }
  }

  if (hadNoFall && isFallCause(damageSource.cause) && damage > 0) {
    healPlayer(player, damage);
  }
  if (hadFireWard && isFireCause(damageSource.cause) && damage > 0) {
    healPlayer(player, damage);
    try {
      player.extinguishFire?.(true);
    } catch {
    }
  }
}

export function handlePlayerHurt(player, damageSource) {
  return handlePlayerHurtBefore(player, damageSource);
}

export function handlePlayerAttack(player, victim, damage, context = {}) {
  if (!victim || victim.typeId === "minecraft:player" && victim.id === player.id) return;
  if (isBonusDamageGuarded(player, victim)) return;
  handleAttuneAttack(player, victim, damage, context);

  let bonus = 0;
  const resonance = resonanceProfile(player);
  if (resonance?.affinity === "might") {
    const requiredHits = [0, 5, 4, 3][resonance.level];
    const hits = (resonanceHits.get(player.id) ?? 0) + 1;
    if (hits >= requiredHits) {
      resonanceHits.set(player.id, 0);
      bonus += [0, 2, 3, 4][resonance.level];
      try {
        player.playSound("random.anvil_land", { volume: 0.25, pitch: 1.7 });
        showActionBar(player, 
          `§cMight Boost ${"I".repeat(resonance.level)} — crushing echo`
        );
      } catch {
      }
    } else {
      resonanceHits.set(player.id, hits);
    }
  }

  for (const { def } of getEquippedAll(player)) {
    try {
      const atk = def.onAttack;
      if (!atk) continue;

      if (atk.ignite && Math.random() < atk.ignite.chance) {
        const secs = atk.ignite.seconds ?? 3;
        system.run(() => igniteEntity(victim, secs));
      }

      if (atk.wither) {
        const dur = atk.wither.duration ?? TICK * 5;
        const amp = atk.wither.amplifier ?? 0;
        system.run(() => applyEffect(victim, "wither", dur, amp, true));
      }

      if (atk.lightning && Math.random() < atk.lightning.chance) {
        system.run(() => {
          try {
            player.dimension.spawnEntity("minecraft:lightning_bolt", victim.location);
          } catch {
          }
        });
      }

      if (atk.knockback) {
        const dx = victim.location.x - player.location.x;
        const dz = victim.location.z - player.location.z;
        const len = Math.sqrt(dx * dx + dz * dz) || 1;
        const hx = (dx / len) * atk.knockback;
        const hz = (dz / len) * atk.knockback;
        try {
          victim.applyKnockback({ x: hx, z: hz }, 0.35);
        } catch {
          try {
            victim.applyKnockback(dx / len, dz / len, atk.knockback, 0.35);
          } catch {
            try {
              victim.applyImpulse({ x: hx * 0.2, y: 0.15, z: hz * 0.2 });
            } catch {
            }
          }
        }
      }

      if (atk.bonusDamage) bonus += atk.bonusDamage;

      if (atk.lifesteal && damage > 0) {
        const healing = damage * atk.lifesteal;
        healPlayer(player, healing);
        try {
          showActionBar(player, `§cCrimson Glove: §a+${healing.toFixed(1)} health`);
          player.dimension.spawnParticle("minecraft:heart_particle", {
            x: player.location.x,
            y: player.location.y + 1,
            z: player.location.z,
          });
        } catch {
        }
      }
    } catch (err) {
      console.warn(`[RPG Relics] onAttack error: ${err}`);
    }
  }

  const exec = hasCustom(player, "execute_low_hp") ?? hasCustom(player, "executioners_phantom");
  if (exec && victim) {
    try {
      const health = victim.getComponent("minecraft:health");
      if (health) {
        const pct = health.currentValue / Math.max(1, health.effectiveMax);
        if (pct <= (exec.executeThreshold ?? 0.35)) {
          bonus += exec.executeBonus ?? 4;
        }
      }
    } catch {
    }
  }

  if (bonus > 0) {
    guardBonusDamage(player, victim, 3);
    system.run(() => {
      try {
        victim.applyDamage(bonus, {
          cause: EntityDamageCause.entityAttack,
          damagingEntity: player,
        });
      } catch {
        try {
          victim.applyDamage(bonus);
        } catch {
        }
      }
    });
  }
}

export function handlePlayerKill(player, victim) {
  handleAttuneKill(player, victim);
  grantWearXp(player, 2, "kill", 0);
  for (const { def } of getEquippedAll(player)) {
    const count = def.onKill?.bonusXpOrbs;
    if (count) {
      const loc = victim?.location ?? player.location;
      for (let i = 0; i < count; i++) {
        try {
          player.dimension.spawnEntity("minecraft:xp_orb", {
            x: loc.x + (Math.random() - 0.5) * 0.6,
            y: loc.y + 0.4,
            z: loc.z + (Math.random() - 0.5) * 0.6,
          });
        } catch {
          try {
            player.runCommand("xp 1 @s");
          } catch {
          }
        }
      }
    }
  }
  const resonance = resonanceProfile(player);
  if (resonance?.affinity === "vitality") {
    const healing = [0, 2, 4, 6][resonance.level];
    healPlayer(player, healing);
    if (resonance.level >= 3) {
      applyEffect(player, "regeneration", TICK * 3, 0, true);
    }
    try {
      player.playSound("random.orb", { volume: 0.35, pitch: 0.9 });
      showActionBar(player, 
        `§aVitality Boost ${"I".repeat(resonance.level)} — ${healing / 2} hearts restored`
      );
    } catch {
    }
  }
}

export function handleEndlessRation(player) {
  if (isCooling(player, "endless_ration", 80)) {
    showActionBar(player, "§7Still recharging...");
    return;
  }
  applyEffect(player, "saturation", 8, 3, true);
  try {
    player.playSound("random.burp", { volume: 0.9, pitch: 1 });
  } catch {
  }
}

const DRINK_POTIONS = new Set([
  "minecraft:potion",
  "minecraft:splash_potion",
  "minecraft:lingering_potion",
]);

export function handlePotionDrink(player, itemStack) {
  if (!player || !itemStack) return;
  const typeId = itemStack.typeId;
  if (!DRINK_POTIONS.has(typeId) && !typeId?.includes("potion")) return;
  if (typeId === "minecraft:splash_potion" || typeId === "minecraft:lingering_potion") return;

  const def = hasCustom(player, "potion_linger") ?? hasCustom(player, "grand_alchemy");
  const resonance = resonanceProfile(player);
  const resonanceBonus =
    resonance?.affinity === "alchemy"
      ? [0, 0.15, 0.3, 0.5][resonance.level]
      : 0;
  if (!def && resonanceBonus <= 0) return;
  const bonusMul = Math.max(def?.potionBonus ?? 0, resonanceBonus);

  system.runTimeout(() => {
    try {
      const effects = player.getEffects?.() ?? [];
      for (const effect of effects) {
        const type = effect.typeId ?? effect?.type?.id;
        if (!type) continue;
        const bare = type.replace("minecraft:", "");
        if (effect.duration <= PASSIVE_DUR + 5) continue;
        const extra = Math.max(TICK * 5, Math.floor(effect.duration * bonusMul));
        applyEffect(player, bare, effect.duration + extra, effect.amplifier ?? 0, false);
      }
      try {
        player.playSound("random.drink", { volume: 0.4, pitch: 1.25 });
        if (!def && resonanceBonus > 0) {
          showActionBar(player, 
            `§dAlchemy Boost ${"I".repeat(resonance.level)} — potion extended`
          );
        }
      } catch {
      }
    } catch (err) {
      console.warn(`[RPG Relics] potion linger failed: ${err}`);
    }
  }, 2);
}

const fishingCastAt = new Map();

const FISH_BONUS_LOOT = [
  "minecraft:cod",
  "minecraft:salmon",
  "minecraft:tropical_fish",
  "minecraft:pufferfish",
  "minecraft:bone",
  "minecraft:lily_pad",
  "minecraft:ink_sac",
  "minecraft:nautilus_shell",
  "minecraft:string",
  "minecraft:leather",
];

export function markFishingUse(player, itemStack) {
  if (!player || itemStack?.typeId !== "minecraft:fishing_rod") return;
  if (!hasCustom(player, "fishing_haul")) return;
  fishingCastAt.set(player.id, system.currentTick);
}

export function handleFishingItemSpawn(entity) {
  if (!entity || entity.typeId !== "minecraft:item") return;
  let loc;
  let dim;
  try {
    loc = entity.location;
    dim = entity.dimension;
  } catch {
    return;
  }
  if (!loc || !dim) return;
  let best;
  let bestDist = Infinity;
  let players;
  try {
    players = dim.getPlayers({ location: loc, maxDistance: 16 });
  } catch {
    return;
  }
  for (const player of players) {
    if (!hasCustom(player, "fishing_haul")) continue;
    const castTick = fishingCastAt.get(player.id);
    if (castTick == null || system.currentTick - castTick > 40) continue;
    let dist;
    try {
      const dx = player.location.x - loc.x;
      const dy = player.location.y - loc.y;
      const dz = player.location.z - loc.z;
      dist = dx * dx + dy * dy + dz * dz;
    } catch {
      continue;
    }
    if (dist < bestDist) {
      bestDist = dist;
      best = player;
    }
  }
  if (!best) return;
  fishingCastAt.set(best.id, system.currentTick - 100);
  const dropId = FISH_BONUS_LOOT[Math.floor(Math.random() * FISH_BONUS_LOOT.length)];
  system.run(() => {
    try {
      dim.spawnItem(new ItemStack(dropId, 1), {
        x: loc.x,
        y: loc.y + 0.2,
        z: loc.z,
      });
      try {
        best.playSound("random.orb", { volume: 0.35, pitch: 1.35 });
      } catch {
      }
    } catch (err) {
      console.warn(`[RPG Relics] fishing haul failed: ${err}`);
    }
  });
}

export function tickHeldItems(player) {
  const inv = player.getComponent("minecraft:inventory")?.container;
  if (!inv) return;
  const selected = inv.getItem(player.selectedSlotIndex);
  if (selected?.typeId === "relics:storm_parasol" && !player.isOnGround) {
    applyEffect(player, "slow_falling", PASSIVE_DUR, 0, false);
  }
}

export function statusLines(player) {
  const equipped = getEquippedAll(player);
  if (!equipped.length) return ["§7No relics equipped. Use the Reliquary item or /scriptevent relics:open_menu."];
  const resonance = resonanceProfile(player);
  if (!resonance) {
    return [
      "§8Boosts are disabled in the Relic Tome settings.§r",
      ...equipped.map(
        ({ slot, def }) => `§e${slot}§r: ${def.displayName} §8(${shortBlurb(def)})`
      ),
    ];
  }
  const levelText = "I".repeat(resonance.level);
  let resonanceEffect = "";
  switch (resonance.affinity) {
    case "might":
      resonanceEffect = `every ${[0, 5, 4, 3][resonance.level]} hits echoes for +${[0, 2, 3, 4][resonance.level]} damage`;
      break;
    case "ward":
      resonanceEffect = `${Math.round([0, 0.08, 0.14, 0.2][resonance.level] * 100)}% chance to deflect an attack`;
      break;
    case "gale":
      resonanceEffect = "sprinting periodically triggers Tailwind";
      break;
    case "fortune":
      resonanceEffect = `${Math.round([0, 0.06, 0.12, 0.2][resonance.level] * 100)}% bonus ore chance`;
      break;
    case "vitality":
      resonanceEffect = `kills restore ${[0, 1, 2, 3][resonance.level]} hearts`;
      break;
    case "alchemy":
      resonanceEffect = `drunk potions last ${Math.round([0, 0.15, 0.3, 0.5][resonance.level] * 100)}% longer`;
      break;
  }
  return [
    `§d${resonance.label} Boost ${levelText}§r: §f${resonanceEffect}§r §8(${resonance.score} power)§r`,
    ...equipped.map(
    ({ slot, def }) => `§e${slot}§r: ${def.displayName} §8(${shortBlurb(def)})`
    ),
  ];
}
