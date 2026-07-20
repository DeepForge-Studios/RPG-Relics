import { EntityDamageCause, ItemStack, MolangVariableMap, system, world } from "@minecraft/server";
import { getEquippedAll } from "./relics.js";
import { resolveAttuneEffects } from "./attune_data.js";
import { getRelicDef } from "./registry.js";
import { guardBonusDamage, isBonusDamageGuarded } from "./combat_guard.js";
import { areCooldownsEnabled, isAttunementEnabled } from "./settings.js";
import { relicAffinity } from "./attune_pool.js";
import {
  synergyTierForRelic,
  synergyMods,
  synCooldown,
  synDuration,
  synChance,
  playSynergyFeedback,
  playSynergyEchoFeedback,
} from "./attune_synergy.js";

const TICK = 20;
const cooldowns = new Map();
const players = new Map();
const marks = new Map();
const fields = [];
const helpers = [];
const pendingDrops = new Map();
const RETALIATE_CD = 120;
const MAX_FIELDS = 2;
const MAX_HELPERS = 5;

/** Per-victim throttle for synergy echo pulses. */
const echoThrottle = new Map();
/** Per-player throttle for the "◆ Synergy" action-bar / feedback cue. */
const synProcAt = new Map();

function state(player) {
  let value = players.get(player.id);
  if (!value) {
    value = {
      souls: 0,
      notes: 0,
      rumors: 0,
      ledger: 0,
      lastHurt: -1000,
      vialColor: 0,
      activeArmUntil: 0,
      activePick: 0,
      bloodTitheUntil: 0,
      titheRefunded: 0,
      shield: 0,
    };
    players.set(player.id, value);
  }
  return value;
}

function cooldownKey(player, key) {
  return `${player.id}:${key}`;
}

/**
 * Active synergy tier for the skill currently being processed. Set at the top of
 * each `attunements()` loop iteration (and in activate()); reset to "none" when
 * no authored skill number is being produced so field/helper DoT never scales.
 */
function synTier(player) {
  try {
    return state(player)._synTier ?? "none";
  } catch {
    return "none";
  }
}

function setSyn(player, tier, affinityKey) {
  try {
    const st = state(player);
    st._synTier = tier ?? "none";
    if (affinityKey) st._synAffinity = affinityKey;
  } catch {
  }
}

function synAffinity(player) {
  try {
    return state(player)._synAffinity;
  } catch {
    return undefined;
  }
}

/** true/false chance roll with the current skill's synergy bonus applied. */
function synRoll(player, chance) {
  return Math.random() < synChance(synTier(player), chance);
}

/** Throttled "◆ Synergy" cue on a primary-synergy proc. */
function onSynergyProc(player, affinityKey) {
  if (!player?.id) return;
  const now = system.currentTick;
  if ((synProcAt.get(player.id) ?? 0) > now) return;
  synProcAt.set(player.id, now + 60);
  action(player, "§a◆ Synergy§r");
  playSynergyFeedback(player, affinityKey ?? synAffinity(player));
}

/** Half-power numeric follow-up ~15 ticks after a primary-synergy hit. */
function scheduleEcho(player, victim, dealt, affinityKey) {
  if (!victim?.id || dealt < 1) return;
  const now = system.currentTick;
  if ((echoThrottle.get(victim.id) ?? 0) > now) return;
  const mods = synergyMods("primary");
  echoThrottle.set(victim.id, now + mods.echoTicks);
  const half = Math.max(1, Math.round(dealt * mods.echoMult));
  const aff = affinityKey ?? synAffinity(player);
  system.runTimeout(() => {
    try {
      guardBonusDamage(player, victim, 3);
      victim.applyDamage(half, { cause: EntityDamageCause.magic, damagingEntity: player });
    } catch {
    }
    playSynergyEchoFeedback(player, aff);
  }, mods.echoTicks);
}

function isCooling(player, key) {
  if (!areCooldownsEnabled(player)) return false;
  return system.currentTick < (cooldowns.get(cooldownKey(player, key)) ?? 0);
}

function startCooldown(player, key, ticks) {
  if (!areCooldownsEnabled(player)) return;
  // Primary synergy shortens the skill's own cooldown (key === skill key).
  const tier = state(player).synergyByKey?.[key] ?? "none";
  cooldowns.set(cooldownKey(player, key), system.currentTick + synCooldown(tier, ticks));
}

function location(entity, y = 0.7) {
  return {
    x: entity.location.x,
    y: entity.location.y + y,
    z: entity.location.z,
  };
}

/** Forge-purple default tint for vanilla spell emitters. */
const SPELL_TINT = { red: 0.72, green: 0.42, blue: 0.9, alpha: 1 };

function particle(dim, id, loc, tint) {
  try {
    if (id.includes("spell")) {
      // Vanilla mobspell/splash emitters read variable.color (and splash_range)
      // from Molang; without them the content log fills with errors.
      const vars = new MolangVariableMap();
      vars.setColorRGBA("variable.color", tint ?? SPELL_TINT);
      vars.setFloat("variable.splash_range", 6);
      dim.spawnParticle(id, loc, vars);
      return;
    }
    dim.spawnParticle(id, loc);
  } catch {
  }
}

function sound(player, id, pitch = 1, volume = 0.45) {
  try {
    player.playSound(id, { pitch, volume });
  } catch {
  }
}

/** Splash / potion shatter cue used by all alchemy-style skills. */
function potionBreak(player, pitch = 1) {
  sound(player, "random.glass", pitch, 0.9);
  sound(player, "random.pop", Math.max(0.6, pitch * 0.85), 0.4);
}

function action(player, text) {
  try {
    player.onScreenDisplay.setActionBar(text);
  } catch {
  }
}

function titleHint(player, title, subtitle = "") {
  try {
    player.onScreenDisplay.setTitle(title, {
      fadeInDuration: 0,
      stayDuration: 40,
      fadeOutDuration: 10,
      subtitle,
    });
  } catch {
    action(player, subtitle ? `${title} §8· ${subtitle}` : title);
  }
}

function health(entity) {
  try {
    return entity.getComponent("minecraft:health");
  } catch {
    return undefined;
  }
}

function heal(player, amount) {
  const hp = health(player);
  if (!hp || amount <= 0) return 0;
  // Custom heal numbers scale with primary synergy (never vanilla effects).
  const want = synTier(player) === "primary" ? amount * synergyMods("primary").powerMult : amount;
  const before = hp.currentValue;
  try {
    hp.setCurrentValue(Math.min(hp.effectiveMax, before + want));
  } catch {
    return 0;
  }
  return Math.max(0, Math.min(want, hp.effectiveMax - before));
}

function hunger(player) {
  try {
    return player.getComponent("minecraft:player.hunger");
  } catch {
    return undefined;
  }
}

function spendHunger(player, amount) {
  const food = hunger(player);
  if (!food || food.currentValue < amount) return false;
  try {
    food.setCurrentValue(Math.max(0, food.currentValue - amount));
    return true;
  } catch {
    return false;
  }
}

function selfDamage(player, amount) {
  const hp = health(player);
  if (!hp || hp.currentValue <= amount) return false;
  try {
    hp.setCurrentValue(hp.currentValue - amount);
    return true;
  } catch {
    return false;
  }
}

function damage(player, victim, amount, cause = EntityDamageCause.override) {
  if (!victim || amount <= 0) return false;
  // Custom damage numbers scale with primary synergy (never vanilla amplifiers).
  const tier = synTier(player);
  const scaled = tier === "primary" ? amount * synergyMods("primary").powerMult : amount;
  // Script damage is more reliable as whole hearts; keep at least 1.
  const dealt = Math.max(1, Math.round(scaled));
  guardBonusDamage(player, victim, 3);
  let ok = false;
  try {
    victim.applyDamage(dealt, { cause, damagingEntity: player });
    ok = true;
  } catch {
    try {
      victim.applyDamage(dealt, { cause: EntityDamageCause.entityAttack, damagingEntity: player });
      ok = true;
    } catch {
      try {
        victim.applyDamage(dealt);
        ok = true;
      } catch {
        ok = false;
      }
    }
  }
  if (ok && tier === "primary") {
    onSynergyProc(player, synAffinity(player));
    scheduleEcho(player, victim, dealt, synAffinity(player));
  }
  return ok;
}

function impulse(entity, vector) {
  try {
    entity.applyImpulse(vector);
    return true;
  } catch {
  }
  try {
    entity.applyKnockback(
      { x: vector.x, z: vector.z },
      Math.max(0.05, Math.abs(vector.y))
    );
    return true;
  } catch {
    try {
      entity.applyKnockback(
        vector.x,
        vector.z,
        Math.hypot(vector.x, vector.z),
        Math.max(0.05, Math.abs(vector.y))
      );
      return true;
    } catch {
      return false;
    }
  }
}

function forward(player) {
  try {
    return player.getViewDirection();
  } catch {
    return { x: 0, y: 0, z: 1 };
  }
}

const NON_HOSTILE_TYPES = new Set([
  "minecraft:player",
  "minecraft:item",
  "minecraft:xp_orb",
  "minecraft:armor_stand",
  "minecraft:painting",
  "minecraft:boat",
  "minecraft:chest_boat",
  "minecraft:minecart",
  "minecraft:hopper_minecart",
  "minecraft:chest_minecart",
  "minecraft:tnt_minecart",
  "minecraft:command_block_minecart",
  "minecraft:arrow",
  "minecraft:snowball",
  "minecraft:egg",
  "minecraft:ender_pearl",
  "minecraft:experience_bottle",
  "minecraft:fireball",
  "minecraft:small_fireball",
  "minecraft:shulker_bullet",
  "minecraft:llama_spit",
  "minecraft:fishing_hook",
  "relics:reliquary",
  // Peaceful / utility — nova shouldn't farm these by accident
  "minecraft:villager",
  "minecraft:wandering_trader",
  "minecraft:iron_golem",
  "minecraft:snow_golem",
  "minecraft:allay",
  "minecraft:bat",
  "minecraft:cat",
  "minecraft:chicken",
  "minecraft:cow",
  "minecraft:donkey",
  "minecraft:fox",
  "minecraft:frog",
  "minecraft:goat",
  "minecraft:horse",
  "minecraft:llama",
  "minecraft:mooshroom",
  "minecraft:mule",
  "minecraft:ocelot",
  "minecraft:panda",
  "minecraft:parrot",
  "minecraft:pig",
  "minecraft:polar_bear",
  "minecraft:rabbit",
  "minecraft:sheep",
  "minecraft:skeleton_horse",
  "minecraft:sniffer",
  "minecraft:strider",
  "minecraft:trader_llama",
  "minecraft:turtle",
  "minecraft:wolf",
  "minecraft:camel",
  "minecraft:axolotl",
  "minecraft:bee",
  "minecraft:dolphin",
]);

function isHostileTarget(entity, player) {
  if (!entity || entity.id === player.id) return false;
  const id = entity.typeId ?? "";
  if (NON_HOSTILE_TYPES.has(id)) return false;
  if (id.startsWith("relics:")) return false;
  try {
    if (
      entity.hasTag?.("relics:thrall") ||
      entity.hasTag?.("relics:friendly_thrall") ||
      entity.hasTag?.("relics:siege_ward")
    ) {
      return false;
    }
  } catch {
  }
  // Anything with a health bar that isn't on the exclude list counts —
  // cows/sheep are fine collateral for testing; combat focus is hostiles.
  return !!health(entity);
}

function nearbyHostiles(player, loc, radius = 8, limit = 8) {
  let entities = [];
  // Broad query first — `families: ["monster"]` can succeed with an empty
  // list on some builds, which previously skipped the fallback entirely.
  try {
    entities = player.dimension.getEntities({
      location: loc,
      maxDistance: Math.min(16, radius),
      excludeTypes: [...NON_HOSTILE_TYPES],
    });
  } catch {
    try {
      entities = player.dimension.getEntities({
        location: loc,
        maxDistance: Math.min(16, radius),
      });
    } catch {
      return [];
    }
  }
  return entities.filter((e) => isHostileTarget(e, player)).slice(0, limit);
}

function playerById(id) {
  for (const player of world.getPlayers()) {
    if (player.id === id) return player;
  }
  return undefined;
}

function attunements(player) {
  if (!isAttunementEnabled(player)) return [];
  const byConflict = new Map();
  const bySkill = new Map();
  for (const { slot, itemId, stack } of getEquippedAll(player)) {
    for (const effect of resolveAttuneEffects(player, stack)) {
      const def = getRelicDef(itemId);
      const row = { ...effect, slot, itemId, stack };
      // Primary synergy only when the stamped group is the relic's home path.
      row.affinity = relicAffinity(def);
      row.synergy = synergyTierForRelic(def, effect.group);
      const skillKey = `${effect.group}:${effect.key}`;
      const prior = bySkill.get(skillKey);
      if (!prior || prior.level < row.level) bySkill.set(skillKey, row);
    }
  }
  for (const row of bySkill.values()) {
    const conflict = row.def.conflict ?? `${row.group}:${row.key}`;
    const prior = byConflict.get(conflict);
    if (!prior || prior.level < row.level) byConflict.set(conflict, row);
  }
  const rows = [...byConflict.values()];
  // Map skill key → tier so the generic startCooldown() can discount primaries.
  const synergyByKey = {};
  for (const row of rows) {
    if (row.synergy === "primary") synergyByKey[row.key] = "primary";
  }
  state(player).synergyByKey = synergyByKey;
  return rows;
}

function findSkill(player, key) {
  return attunements(player).find((row) => row.key === key);
}

function markKey(owner, target, lane) {
  return `${owner.id}:${target.id}:${lane}`;
}

function getMark(owner, target, lane) {
  const key = markKey(owner, target, lane);
  const row = marks.get(key);
  if (!row || row.expire < system.currentTick) {
    marks.delete(key);
    return undefined;
  }
  return row;
}

function setMark(owner, target, lane, value, duration = 160) {
  marks.set(markKey(owner, target, lane), {
    ...value,
    ownerId: owner.id,
    targetId: target.id,
    expire: system.currentTick + synDuration(synTier(owner), duration),
  });
}

function clearMark(owner, target, lane) {
  marks.delete(markKey(owner, target, lane));
}

function addField(player, kind, loc, level, duration, radius = 4, data = {}) {
  for (let i = fields.length - 1; i >= 0; i--) {
    if (fields[i].ownerId === player.id && fields[i].kind === kind) {
      removeTrackedEntity(fields[i].wardId, fields[i].dimId);
      fields.splice(i, 1);
    }
  }
  const owned = fields.filter((field) => field.ownerId === player.id);
  if (owned.length >= MAX_FIELDS) {
    const oldest = owned.sort((a, b) => a.expire - b.expire)[0];
    const index = fields.indexOf(oldest);
    if (index >= 0) {
      removeTrackedEntity(fields[index].wardId, fields[index].dimId);
      fields.splice(index, 1);
    }
  }
  fields.push({
    ownerId: player.id,
    dimId: player.dimension.id,
    kind,
    loc: { x: loc.x, y: loc.y, z: loc.z },
    level,
    radius,
    expire: system.currentTick + synDuration(synTier(player), duration),
    nextTick: system.currentTick,
    ...data,
  });
  particle(player.dimension, "minecraft:splash_spell_emitter", loc);
}

function removeTrackedEntity(entityId, dimId) {
  if (!entityId) return;
  try {
    for (const player of world.getPlayers()) {
      if (dimId && player.dimension.id !== dimId) continue;
      for (const e of player.dimension.getEntities({})) {
        if (e.id === entityId) {
          try {
            e.remove();
          } catch {
          }
          return;
        }
      }
    }
  } catch {
  }
}

function findEntityById(entityId) {
  if (!entityId) return undefined;
  try {
    for (const player of world.getPlayers()) {
      for (const e of player.dimension.getEntities({})) {
        if (e.id === entityId) return e;
      }
    }
  } catch {
  }
  return undefined;
}

function applySlow(entity, amplifier = 1, ticks = 40) {
  try {
    entity.addEffect("slowness", ticks, { amplifier, showParticles: false });
    return true;
  } catch {
    try {
      entity.addEffect("minecraft:slowness", ticks, { amplifier, showParticles: false });
      return true;
    } catch {
      return false;
    }
  }
}

function applyResistance(entity, amplifier = 3, ticks = 100) {
  try {
    entity.addEffect("resistance", ticks, { amplifier, showParticles: true });
    return true;
  } catch {
    try {
      entity.addEffect("minecraft:resistance", ticks, { amplifier, showParticles: true });
      return true;
    } catch {
      return false;
    }
  }
}

function ignite(entity, seconds) {
  try {
    entity.setOnFire(Math.max(1, Math.floor(seconds)), true);
    return true;
  } catch {
    try {
      entity.setOnFire(Math.max(1, Math.floor(seconds)));
      return true;
    } catch {
      return false;
    }
  }
}

/** Iron golem ward for Siege Root — attacks hostiles and holds space. */
function spawnSiegeWard(player, loc, durationTicks) {
  try {
    const golem = player.dimension.spawnEntity("minecraft:iron_golem", {
      x: loc.x + 0.5,
      y: loc.y,
      z: loc.z + 0.5,
    });
    try {
      golem.nameTag = "§9Siege Ward";
      golem.addTag("relics:siege_ward");
    } catch {
    }
    return golem.id;
  } catch {
    return undefined;
  }
}

/** Friendly script-driven wither thrall (Bone Thrall / Thanatoic army). */
function spawnWitherThrall(player, offset = 0) {
  const angle = offset * 1.25;
  const loc = {
    x: player.location.x + Math.cos(angle) * (1.4 + offset * 0.35),
    y: player.location.y,
    z: player.location.z + Math.sin(angle) * (1.4 + offset * 0.35),
  };
  let entity;
  try {
    entity = player.dimension.spawnEntity("minecraft:wither_skeleton", loc);
  } catch {
    try {
      entity = player.dimension.spawnEntity("minecraft:skeleton", loc);
    } catch {
      return undefined;
    }
  }
  try {
    entity.nameTag = "§8Bone Thrall";
    entity.addTag("relics:thrall");
    entity.addTag("relics:friendly_thrall");
  } catch {
  }
  try {
    entity.addEffect("resistance", 400, { amplifier: 1, showParticles: false });
  } catch {
  }
  return entity?.id;
}

function thrallArmyCap(level) {
  return Math.min(5, Math.max(1, level | 0));
}

function countBoneHelpers(ownerId) {
  return helpers.filter((h) => h.ownerId === ownerId && h.kind === "bone").length;
}

function summonThrallArmy(player, level, duration = 400) {
  const cap = thrallArmyCap(level);
  let spawned = 0;
  while (countBoneHelpers(player.id) < cap && spawned < cap) {
    const entityId = spawnWitherThrall(player, countBoneHelpers(player.id) + spawned);
    helpers.push({
      ownerId: player.id,
      dimId: player.dimension.id,
      kind: "bone",
      level,
      expire: system.currentTick + duration,
      nextAttack: system.currentTick,
      angle: Math.random() * Math.PI * 2,
      entityId,
      focusId: state(player).focusTarget,
    });
    spawned += 1;
  }
  if (spawned > 0) {
    sound(player, "mob.wither.spawn", 1.4, 0.35);
    sound(player, "mob.skeleton.death", 0.7, 0.45);
    titleHint(player, "§8Thanatoic Army", `§7${spawned} thrall${spawned > 1 ? "s" : ""} · 20s`);
  }
  return spawned;
}

function addHelper(player, kind, level, duration) {
  if (kind !== "bone") {
    for (let i = helpers.length - 1; i >= 0; i--) {
      if (helpers[i].ownerId === player.id && helpers[i].kind !== "bone") {
        removeTrackedEntity(helpers[i].entityId, helpers[i].dimId);
        helpers.splice(i, 1);
      }
    }
  } else {
    while (countBoneHelpers(player.id) >= thrallArmyCap(level)) {
      const idx = helpers.findIndex((h) => h.ownerId === player.id && h.kind === "bone");
      if (idx < 0) break;
      removeTrackedEntity(helpers[idx].entityId, helpers[idx].dimId);
      helpers.splice(idx, 1);
    }
  }

  let entityId;
  if (kind === "bone") entityId = spawnWitherThrall(player, countBoneHelpers(player.id));
  if (kind === "phial") {
    const colors = [
      { name: "Healing", tint: { red: 0.95, green: 0.2, blue: 0.35, alpha: 1 }, effect: "heal" },
      { name: "Harming", tint: { red: 0.45, green: 0.05, blue: 0.55, alpha: 1 }, effect: "harm" },
      { name: "Poison", tint: { red: 0.25, green: 0.85, blue: 0.2, alpha: 1 }, effect: "poison" },
      { name: "Slowness", tint: { red: 0.35, green: 0.45, blue: 0.95, alpha: 1 }, effect: "slow" },
    ];
    const pick = colors[Math.floor(Math.random() * colors.length)];
    helpers.push({
      ownerId: player.id,
      dimId: player.dimension.id,
      kind,
      level,
      expire: system.currentTick + duration,
      nextAttack: system.currentTick,
      angle: 0,
      entityId,
      phial: pick,
    });
    potionBreak(player, 1.1);
    action(player, `§dPhial Familiar §8· §f${pick.name}`);
    return;
  }

  helpers.push({
    ownerId: player.id,
    dimId: player.dimension.id,
    kind,
    level,
    expire: system.currentTick + duration,
    nextAttack: system.currentTick,
    angle: 0,
    entityId,
    focusId: state(player).focusTarget,
  });
  if (kind === "bone" && entityId) {
    sound(player, "mob.wither.shoot", 1.2, 0.4);
    action(player, "§8Bone Thrall — wither skeleton");
  }
}

function burst(player, loc, amount, radius = 4, limit = 8) {
  let hits = 0;
  for (const mob of nearbyHostiles(player, loc, radius, limit)) {
    if (damage(player, mob, amount)) {
      hits += 1;
      const dx = mob.location.x - loc.x;
      const dz = mob.location.z - loc.z;
      const len = Math.hypot(dx, dz) || 1;
      impulse(mob, { x: (dx / len) * 0.35, y: 0.25, z: (dz / len) * 0.35 });
    }
  }
  particle(player.dimension, "minecraft:splash_spell_emitter", {
    x: loc.x,
    y: loc.y + 0.5,
    z: loc.z,
  });
  particle(player.dimension, "minecraft:critical_hit_emitter", {
    x: loc.x,
    y: loc.y + 1,
    z: loc.z,
  });
  return hits;
}

function isUndead(entity) {
  const id = entity?.typeId ?? "";
  return [
    "zombie",
    "skeleton",
    "drowned",
    "husk",
    "stray",
    "bogged",
    "phantom",
    "wither",
  ].some((part) => id.includes(part));
}

function spawnFeeder(player, loc, preferred) {
  const feeders = [
    "relics:monster_heart",
    "relics:silver_fragment",
    "relics:beast_fang",
    "relics:mystic_herb",
    "relics:arcane_dust",
    "relics:crimson_crystal",
  ];
  const id = preferred ?? feeders[Math.floor(Math.random() * feeders.length)];
  try {
    player.dimension.spawnItem(new ItemStack(id, 1), loc);
    sound(player, "random.orb", 1.5, 0.35);
  } catch {
  }
}

function applyScarbrand(player, victim, row) {
  const mark = getMark(player, victim, "attack_brand");
  if (!mark || mark.kind !== "scarbrand") {
    setMark(player, victim, "attack_brand", { kind: "scarbrand", breaks: 0 }, 160);
    particle(player.dimension, "minecraft:mobspell_emitter", location(victim));
    return;
  }
  clearMark(player, victim, "attack_brand");
  damage(player, victim, 1.5 + row.level);
  const st = state(player);
  st.scarBreaks = (st.scarBreaks ?? 0) + 1;
  sound(player, "random.anvil_land", 1.6, 0.25);
  if (row.level >= 3 && st.scarBreaks >= 3) {
    st.scarBreaks = 0;
    burst(player, victim.location, 2 + row.level, 4);
    if (row.level >= 4) {
      const dx = victim.location.x - player.location.x;
      const dz = victim.location.z - player.location.z;
      const length = Math.hypot(dx, dz) || 1;
      impulse(player, { x: (dx / length) * 0.55, y: 0.12, z: (dz / length) * 0.55 });
      for (const mob of nearbyHostiles(player, victim.location, 4, 5)) {
        if (mob.id === victim.id) continue;
        impulse(mob, {
          x: (mob.location.x - victim.location.x) * 0.12,
          y: 0.15,
          z: (mob.location.z - victim.location.z) * 0.12,
        });
      }
    }
  }
}

function applyRivets(player, victim, row) {
  const st = state(player);
  if (system.currentTick - (st.rivetTick ?? -100) > 30) st.rivets = 0;
  st.rivetTick = system.currentTick;
  st.rivets = (st.rivets ?? 0) + 1;
  const count = st.rivets;
  if (count === 1) {
    sound(player, "note.pling", 0.9, 0.45);
    action(player, "§cRivet §fding §8· §c1/3");
    return;
  }
  if (count === 2) {
    sound(player, "note.pling", 1.35, 0.65);
    action(player, "§cRivet §eDING §8· §c2/3");
    return;
  }
  st.rivets = 0;
  sound(player, "note.pling", 1.9, 1);
  sound(player, "random.anvil_land", 1.15, 0.55);
  action(player, "§cRivet §6BIGGER DING §8· §c3/3 §f— shockwave!");
  damage(player, victim, 1 + row.level);
  if (row.level >= 2) {
    const dx = victim.location.x - player.location.x;
    const dz = victim.location.z - player.location.z;
    const length = Math.hypot(dx, dz) || 1;
    impulse(victim, { x: (dx / length) * 0.55, y: 0.2, z: (dz / length) * 0.55 });
  }
  if (row.level >= 3) {
    addField(player, "shatter", victim.location, row.level, 60, 3);
  }
}

function applyCrosswind(player, victim, row) {
  const mark = getMark(player, victim, "movement");
  if (!mark) {
    setMark(player, victim, "movement", { kind: "crosswind", level: row.level }, 120);
    particle(player.dimension, "minecraft:basic_smoke_particle", location(victim));
    action(player, "§bCrosswind marked");
    return;
  }
  clearMark(player, victim, "movement");
  const view = forward(player);
  const strength = 0.85 + row.level * 0.22;
  // Knock them the way you punch — along your look.
  impulse(victim, {
    x: view.x * strength,
    y: Math.max(0.18, view.y * 0.35 + 0.12),
    z: view.z * strength,
  });
  sound(player, "mob.enderdragon.flap", 1.55, 0.4);
  action(player, "§bCrosswind gust!");
}

function applyVialmark(player, victim, row) {
  const palette = [
    {
      name: "Caustic",
      ink: "§a",
      tint: { red: 0.2, green: 0.85, blue: 0.15, alpha: 1 },
      sound: "mob.witch.throw",
    },
    {
      name: "Frost",
      ink: "§b",
      tint: { red: 0.35, green: 0.65, blue: 1, alpha: 1 },
      sound: "random.glass",
    },
    {
      name: "Spark",
      ink: "§e",
      tint: { red: 1, green: 0.85, blue: 0.2, alpha: 1 },
      sound: "random.explode",
    },
  ];
  const st = state(player);
  const pick = palette[st.vialColor % palette.length];
  st.vialColor = (st.vialColor + 1) % palette.length;
  const prior = getMark(player, victim, "alchemy");
  setMark(player, victim, "alchemy", { kind: "vial", color: pick.name, level: row.level }, 160);
  action(player, `${pick.ink}Vialmark: ${pick.name}`);
  particle(player.dimension, "minecraft:mobspell_emitter", location(victim), pick.tint);
  sound(player, pick.sound, 1.2, 0.45);
  potionBreak(player, 0.85 + st.vialColor * 0.15);
  if (!prior || prior.color === pick.name || isCooling(player, "vial_reaction")) return;
  startCooldown(player, "vial_reaction", 40);
  damage(player, victim, 1.5 + row.level);
  sound(player, "random.orb", 1.7, 0.5);
  action(player, `§dReaction! §f${prior.color} §8+ ${pick.ink}${pick.name}`);
  if (row.level >= 3) addField(player, "reaction", victim.location, row.level, 60, 3);
  if (row.level >= 4 && prior.color !== pick.name) burst(player, victim.location, 1.5, 4, 5);
}

function fireArrow(player, attacker, level) {
  const origin = location(player, 1.2);
  const target = location(attacker, 0.8);
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const dz = target.z - origin.z;
  const length = Math.hypot(dx, dy, dz) || 1;
  try {
    const arrow = player.dimension.spawnEntity("minecraft:arrow", origin);
    const projectile = arrow.getComponent("minecraft:projectile");
    projectile.owner = player;
    projectile.shoot(
      { x: (dx / length) * 1.7, y: (dy / length) * 1.7, z: (dz / length) * 1.7 },
      { uncertainty: level >= 4 ? 1 : 0 }
    );
    sound(player, "random.bow", 1.35, 0.4);
    if (level >= 4) {
      for (const yaw of [-0.18, 0.18]) {
        const extra = player.dimension.spawnEntity("minecraft:arrow", origin);
        const shot = extra.getComponent("minecraft:projectile");
        shot.owner = player;
        shot.shoot({
          x: ((dx / length) - (dz / length) * yaw) * 1.55,
          y: (dy / length) * 1.55,
          z: ((dz / length) + (dx / length) * yaw) * 1.55,
        });
      }
    }
  } catch {
    damage(player, attacker, 1 + level * 0.5, EntityDamageCause.projectile);
  }
}

function clearOneNegative(player) {
  for (const id of ["poison", "wither", "weakness", "slowness", "blindness", "darkness"]) {
    try {
      if (!player.getEffect(id) && !player.getEffect(`minecraft:${id}`)) continue;
      player.removeEffect(id);
      try {
        player.removeEffect(`minecraft:${id}`);
      } catch {
      }
      return true;
    } catch {
    }
  }
  return false;
}

export function handleAttuneAttack(player, victim, baseDamage, context = {}) {
  if (!player || !victim || context.isProjectile || isBonusDamageGuarded(player, victim)) return;
  if (!isAttunementEnabled(player)) return;
  setSyn(player, "none");
  const stFocus = state(player);
  stFocus.focusTarget = victim.id;
  for (const helper of helpers) {
    if (helper.ownerId === player.id && helper.kind === "bone") helper.focusId = victim.id;
  }

  const weak = getMark(player, victim, "weak");
  if (weak) damage(player, victim, 0.5 + weak.level * 0.35);
  for (const row of attunements(player)) {
    setSyn(player, row.synergy, row.affinity);
    switch (row.key) {
      case "scarbrand":
        applyScarbrand(player, victim, row);
        break;
      case "rivet_streak":
        applyRivets(player, victim, row);
        break;
      case "cracked_rib_pact": {
        const hp = health(player);
        const st = state(player);
        const manuallyArmed = (st.pactArmedUntil ?? 0) >= system.currentTick;
        if (
          hp &&
          (hp.currentValue <= hp.effectiveMax / 2 || manuallyArmed) &&
          !isCooling(player, row.key)
        ) {
          st.pactArmedUntil = 0;
          startCooldown(player, row.key, row.def.cooldown);
          damage(player, victim, 1.5 + row.level);
          if (row.level >= 2) spendHunger(player, 1);
          if (row.level >= 4) addField(player, "pact_burst", victim.location, row.level, 40, 4);
          action(player, "§cCracked-Rib Pact!");
        }
        break;
      }
      case "crosswind_mark":
        applyCrosswind(player, victim, row);
        break;
      case "slipstream_cut":
        if (player.isSprinting && !isCooling(player, row.key)) {
          startCooldown(player, row.key, row.def.cooldown);
          const view = forward(player);
          impulse(player, { x: view.x * 0.75, y: Math.max(0.05, view.y * 0.2), z: view.z * 0.75 });
          if (row.level >= 2) addField(player, "slipstream", player.location, row.level, 80, 2);
          sound(player, "random.endermenportal", 1.65, 0.25);
        }
        break;
      case "coinspin_hex":
        if (synRoll(player, 0.25) && !isCooling(player, row.key)) {
          startCooldown(player, row.key, row.def.cooldown);
          const st = state(player);
          if (Math.random() < 0.5) {
            st.coinHeads = (st.coinHeads ?? 0) + 1;
            damage(player, victim, st.coinHeads >= 3 && row.level >= 2 ? 4 : 1.5);
            if (st.coinHeads >= 3) st.coinHeads = 0;
            if (row.level >= 3 && st.coinConsolation) {
              heal(player, 1);
              st.coinConsolation = false;
            }
            action(player, "§6Coinspin: Heads!");
          } else {
            st.coinHeads = 0;
            st.coinConsolation = row.level >= 3;
            const view = forward(player);
            impulse(player, { x: -view.x * 0.18, y: 0.05, z: -view.z * 0.18 });
            action(player, "§7Coinspin: Tails.");
          }
        }
        break;
      case "mimics_wager": {
        const hp = health(victim);
        // Attack hooks run after damage — treat "was full" as nearly full + this hit.
        const wasFull =
          hp &&
          (hp.currentValue + Math.max(0, baseDamage) >= hp.effectiveMax * 0.92 ||
            hp.currentValue / Math.max(1, hp.effectiveMax) >= 0.9);
        const existing = getMark(player, victim, "bounty");
        if (existing?.kind === "wager" && row.level >= 3 && !existing.doubled) {
          existing.doubled = true;
          existing.expire = system.currentTick + 160;
          action(player, "§6Mimic's Wager — DOUBLE OR NOTHING!");
          sound(player, "mob.villager.haggle", 1.3, 0.5);
          break;
        }
        if (wasFull && !existing && !isCooling(player, row.key)) {
          startCooldown(player, row.key, row.def.cooldown);
          setMark(player, victim, "bounty", {
            kind: "wager",
            level: row.level,
            failed: false,
            doubled: false,
          }, 200);
          particle(player.dimension, "minecraft:villager_happy", location(victim));
          sound(player, "mob.villager.haggle", 0.9, 0.55);
          titleHint(player, "§6Mimic's Wager", "§7Kill in 10s for a prize");
        }
        break;
      }
      case "vialmark":
        applyVialmark(player, victim, row);
        break;
      case "dirge_mark":
        if (!getMark(player, victim, "death") && !isCooling(player, row.key)) {
          startCooldown(player, row.key, row.def.cooldown);
          setMark(player, victim, "death", { kind: "dirge", level: row.level }, 200);
          particle(player.dimension, "minecraft:mobspell_emitter", location(victim), {
            red: 0.15,
            green: 0.05,
            blue: 0.2,
            alpha: 1,
          });
          sound(player, "mob.wither.hurt", 1.4, 0.35);
          action(player, "§5Dirge Mark");
        }
        break;
      case "thunderbrand": {
        const branded = getMark(player, victim, "thunder");
        if (branded && !isCooling(player, row.key)) {
          clearMark(player, victim, "thunder");
          startCooldown(player, row.key, row.def.cooldown);
          system.run(() => {
            try {
              player.dimension.spawnEntity("minecraft:lightning_bolt", victim.location);
            } catch {
              damage(player, victim, 4 + row.level);
            }
          });
          if (row.level >= 3) {
            const other = nearbyHostiles(player, victim.location, 5, 3).find((mob) => mob.id !== victim.id);
            if (other) damage(player, other, 2 + row.level * 0.5);
          }
          if (row.level >= 4) addField(player, "storm", victim.location, row.level, 60, 4);
        } else {
          const chance = row.def.chance + (row.level >= 2 ? 0.1 : 0);
          if (synRoll(player, chance)) {
            setMark(player, victim, "thunder", { kind: "thunder", level: row.level }, 160);
            particle(player.dimension, "minecraft:mobspell_emitter", location(victim));
            action(player, "§eThunderbrand ready");
          }
        }
        break;
      }
      case "judgment_brand": {
        // Separate mark type so Scarbrand / Thunderbrand can't steal the brand.
        const current = getMark(player, victim, "judgment");
        const count = current?.kind === "judgment" ? current.count + 1 : 1;
        if (count >= 3) {
          clearMark(player, victim, "judgment");
          damage(player, victim, 2 + row.level);
          sound(player, "beacon.power", 1.2, 0.7);
          sound(player, "random.orb", 0.6, 0.55);
          particle(player.dimension, "minecraft:endrod", location(victim, 1));
          particle(player.dimension, "minecraft:villager_happy", location(victim));
          action(player, "§eJudgment Brand — light burst!");
          if (row.level >= 3) {
            const other = nearbyHostiles(player, victim.location, 4, 3).find((mob) => mob.id !== victim.id);
            if (other) setMark(player, other, "judgment", { kind: "judgment", count: 1, level: row.level }, 160);
          }
        } else {
          setMark(player, victim, "judgment", { kind: "judgment", count, level: row.level }, 160);
          sound(player, "note.pling", 0.8 + count * 0.35, 0.4);
          action(player, `§eJudgment Brand §f${count}/3`);
        }
        break;
      }
    }
  }
  setSyn(player, "none");

  const st = state(player);
  if (st.bloodTitheUntil >= system.currentTick && baseDamage > 0) {
    const refund = Math.min(1.25, 0.35 + baseDamage * 0.12);
    const earned = heal(player, refund);
    st.titheRefunded += earned;
    particle(player.dimension, "minecraft:heart_particle", location(player, 1));
    sound(player, "random.orb", 1.6, 0.3);
    action(
      player,
      `§cSanguine Pact §8· §a+${(earned / 2).toFixed(1)}❤ §7(${Math.min(2, st.titheRefunded).toFixed(1)}/2)`
    );
    const tithe = findSkill(player, "blood_tithe");
    if (tithe?.level >= 3 && earned < refund) {
      st.shield = Math.max(st.shield, refund - earned);
    }
    if (st.titheRefunded >= 2) st.bloodTitheUntil = 0;
  }
}

export function handleAttuneHurtBefore(player, damageSource, incomingDamage = 0) {
  if (!isAttunementEnabled(player)) return { cancel: false };
  const hp = health(player);
  if (!hp) return { cancel: false };
  const heartforge = findSkill(player, "heartforge");
  if (
    heartforge?.level >= 3 &&
    incomingDamage >= hp.currentValue &&
    !isCooling(player, "heartforge_save")
  ) {
    startCooldown(player, "heartforge_save", 2400);
    try {
      hp.setCurrentValue(1);
    } catch {
    }
    sound(player, "random.anvil_land", 0.7, 0.8);
    action(player, "§aHeartforge refused death");
    if (heartforge.level >= 4) addField(player, "blossom", player.location, 4, 120, 4);
    return { cancel: true };
  }
  return { cancel: false };
}

export function handleAttuneHurtAfter(player, damageSource, amount) {
  if (!isAttunementEnabled(player)) return;
  const attacker = damageSource?.damagingEntity;
  const st = state(player);
  st.lastHurt = system.currentTick;

  if (st.shield > 0 && amount > 0) {
    const restored = Math.min(st.shield, amount);
    st.shield -= restored;
    heal(player, restored);
  }

  setSyn(player, "none");
  for (const row of attunements(player)) {
    setSyn(player, row.synergy, row.affinity);
    switch (row.key) {
      case "quillguard":
        if (attacker && !isCooling(player, "attune_retaliate")) {
          startCooldown(player, "attune_retaliate", Math.max(RETALIATE_CD, row.def.cooldown));
          system.run(() => fireArrow(player, attacker, row.level));
        }
        break;
      case "bastion_glyph":
        if (amount >= 2 && !isCooling(player, row.key)) {
          startCooldown(player, row.key, row.def.cooldown);
          // Protection IV-style ward (Resistance IV = amplifier 3).
          applyResistance(player, 3, 100);
          addField(player, "bastion", player.location, row.level, 140, 4, {
            buffer: 3 + row.level,
          });
          sound(player, "beacon.activate", 1.1, 0.55);
          particle(player.dimension, "minecraft:villager_happy", location(player));
          titleHint(player, "§9Bastion Glyph", "§7Resistance IV · soak rune");
        }
        break;
      case "oathchain":
        if (attacker) {
          let oath = getMark(player, attacker, "oath");
          if (!oath && !isCooling(player, row.key)) {
            startCooldown(player, row.key, row.def.cooldown);
            setMark(player, attacker, "oath", { kind: "oath", level: row.level }, 300);
            oath = getMark(player, attacker, "oath");
          }
          if (oath) damage(player, attacker, Math.min(4, amount * (0.15 + row.level * 0.05)));
        }
        break;
      case "witchglass_retort":
        if (attacker && !isCooling(player, "attune_retaliate")) {
          startCooldown(player, "attune_retaliate", Math.max(RETALIATE_CD, row.def.cooldown));
          const hp = health(player);
          const low = hp && hp.currentValue < hp.effectiveMax / 2;
          // Prefer offensive retort — healing splash only when critically low / Epic both.
          if (row.level >= 4) {
            heal(player, 1);
            damage(player, attacker, 2 + row.level * 0.5);
            try {
              attacker.addEffect("wither", 60, { amplifier: 0, showParticles: true });
            } catch {
            }
            particle(player.dimension, "minecraft:heart_particle", location(player, 1));
            particle(player.dimension, "minecraft:splash_spell_emitter", location(attacker), {
              red: 0.55,
              green: 0.1,
              blue: 0.65,
              alpha: 1,
            });
          } else if (row.level === 1 || (row.level >= 3 && low)) {
            heal(player, 1 + row.level * 0.35);
            particle(player.dimension, "minecraft:heart_particle", location(player, 1));
            particle(player.dimension, "minecraft:splash_spell_emitter", location(player), {
              red: 0.95,
              green: 0.25,
              blue: 0.35,
              alpha: 1,
            });
          } else {
            damage(player, attacker, 1.5 + row.level);
            try {
              attacker.addEffect("wither", 40, { amplifier: 0, showParticles: true });
            } catch {
            }
            particle(player.dimension, "minecraft:splash_spell_emitter", location(attacker), {
              red: 0.45,
              green: 0.05,
              blue: 0.55,
              alpha: 1,
            });
          }
          potionBreak(player, 1.05);
          action(player, "§dWitchglass Retort");
        }
        break;
      case "lumen_chorus":
        if (st.notes > 0) {
          st.notes -= 1;
          heal(player, Math.min(amount, 1 + row.level * 0.5));
          particle(player.dimension, "minecraft:villager_happy", location(player, 1));
        }
        break;
      case "judgment_brand": {
        const judgment = attacker && getMark(player, attacker, "judgment");
        if (judgment?.kind === "judgment" && row.level >= 2) {
          damage(player, attacker, 0.75 + row.level * 0.25);
          sound(player, "note.pling", 1.5, 0.35);
        }
        break;
      }
    }
  }
  setSyn(player, "none");

  const bastion = fields.find(
    (field) =>
      field.ownerId === player.id &&
      field.kind === "bastion" &&
      field.expire >= system.currentTick &&
      distance2(player.location, field.loc) <= field.radius * field.radius
  );
  if (bastion?.buffer > 0 && amount > 0) {
    const restored = Math.min(amount, bastion.buffer);
    bastion.buffer -= restored;
    heal(player, restored);
  }
  tryContextOnHurt(player);
}

function distance2(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

export function handleAttuneKill(player, victim) {
  const st = state(player);
  const victimLoc = { ...victim.location };
  setSyn(player, "none");
  for (const row of attunements(player)) {
    setSyn(player, row.synergy, row.affinity);
    switch (row.key) {
      case "warhorn_discord":
        if (!isCooling(player, row.key)) {
          const nearby = nearbyHostiles(player, victimLoc, 8, Math.min(5, row.level + 1));
          if (nearby.length >= 1) {
            startCooldown(player, row.key, row.def.cooldown);
            for (const mob of nearby) {
              setMark(player, mob, "weak", { kind: "weak", level: row.level }, 120);
            }
            if (row.level >= 3) addField(player, "discord", victimLoc, row.level, 60, 5);
            if (row.level >= 4 && nearby[0]) {
              setMark(player, nearby[0], "attack_brand", { kind: "scarbrand", breaks: 0 }, 160);
            }
            sound(player, "random.anvil_land", 0.65, 0.5);
          }
        }
        break;
      case "mimics_wager": {
        const wager = getMark(player, victim, "bounty");
        if (wager?.kind === "wager") {
          clearMark(player, victim, "bounty");
          spawnFeeder(player, victimLoc);
          if (wager.doubled) spawnFeeder(player, victimLoc);
          if (wager.level >= 4 && Math.random() < 0.25) spawnFeeder(player, victimLoc);
          sound(player, "random.levelup", 1.2, 0.55);
          titleHint(player, "§6Wager won!", wager.doubled ? "§eDouble payout" : "§7Prize dropped");
        }
        break;
      }
      case "debt_of_plenty":
        if (st.debtUntil >= system.currentTick && synRoll(player, 0.12 + row.level * 0.04)) {
          spawnFeeder(player, victimLoc);
          action(player, "§6Debt of Plenty §8· §eextra drop");
        }
        break;
      case "gilded_rumor":
        st.rumors = Math.min(5, st.rumors + 1);
        if (st.rumors >= 5) {
          st.rumors = 0;
          pendingDrops.set(player.id, {
            expire: system.currentTick + 200,
            dimId: player.dimension.id,
            loc: victimLoc,
            level: row.level,
          });
          sound(player, "random.orb", 1.5, 0.5);
          titleHint(player, "§6Gilded Rumor", "§7Next mob drop duplicates");
        } else {
          action(player, `§6Rumors ${st.rumors}/5`);
        }
        break;
      case "symbiotic_seed":
        if (synRoll(player, row.def.chance)) {
          addField(player, "seed", victimLoc, row.level, 240, 1.4, {
            mature: system.currentTick + 100,
          });
        }
        break;
      case "crucible_bloom": {
        const crucible = fields.find(
          (field) =>
            field.ownerId === player.id &&
            field.kind === "crucible" &&
            distance2(victimLoc, field.loc) <= field.radius * field.radius
        );
        if (crucible && row.level >= 2 && synRoll(player, 0.15)) {
          spawnFeeder(player, victimLoc, "relics:arcane_dust");
        }
        break;
      }
      case "dirge_mark": {
        const dirge = getMark(player, victim, "death");
        if (dirge?.kind === "dirge") {
          clearMark(player, victim, "death");
          burst(player, victimLoc, 1.5 + row.level, 5, 6);
          sound(player, "random.explode", 0.85, 0.75);
          sound(player, "mob.wither.death", 1.3, 0.35);
          particle(player.dimension, "minecraft:huge_explosion_emitter", {
            x: victimLoc.x,
            y: victimLoc.y + 0.5,
            z: victimLoc.z,
          });
          particle(player.dimension, "minecraft:mobspell_emitter", {
            x: victimLoc.x,
            y: victimLoc.y + 0.8,
            z: victimLoc.z,
          }, { red: 0.2, green: 0.05, blue: 0.25, alpha: 1 });
          action(player, "§5Dirge — soul burst!");
          if (row.level >= 2) {
            const next = nearbyHostiles(player, victimLoc, 5, 4)[0];
            if (next) setMark(player, next, "death", { kind: "dirge", level: row.level }, 160);
          }
          if (row.level >= 3) addField(player, "grave", victimLoc, row.level, 60, 3);
        }
        break;
      }
      case "corpse_lantern":
        st.souls = Math.min(3, st.souls + 1);
        particle(player.dimension, "minecraft:mobspell_emitter", {
          x: victimLoc.x,
          y: victimLoc.y + 0.8,
          z: victimLoc.z,
        });
        action(player, `§5Soul Charges ${st.souls}/3`);
        if (row.level >= 3) addField(player, "grave", victimLoc, row.level, 80, 2.5);
        break;
      case "thanatoic_ledger":
        st.ledger = Math.min(3, st.ledger + 1);
        action(player, `§8Thanatoic Ledger §f${st.ledger}/3`);
        if (st.ledger >= 3) {
          st.ledger = 0;
          summonThrallArmy(player, thrallArmyCap(row.level), 400);
        }
        break;
      case "lumen_chorus": {
        st.notes = Math.min(3, st.notes + 1);
        const noteIds = ["note.harp", "note.pling", "note.bass", "note.hat", "note.flute"];
        const noteId = noteIds[Math.floor(Math.random() * noteIds.length)];
        const pitch = 0.55 + Math.random() * 1.35;
        sound(player, noteId, pitch, st.notes >= 3 ? 1 : 0.55);
        if (st.notes < 3) {
          action(player, `§eChorus Note §f${st.notes}/3`);
        }
        break;
      }
      case "judgment_brand": {
        const judgment = getMark(player, victim, "judgment");
        if (judgment?.kind === "judgment" && row.level >= 4) {
          burst(player, victimLoc, 2, 4, 5);
          heal(player, 1);
          sound(player, "beacon.power", 1, 0.5);
        }
        break;
      }
    }
  }
  setSyn(player, "none");
  // Context spends after charge grants this kill.
  tryContextAfterKill(player);
}

function tryContextAfterKill(player) {
  const st = state(player);
  const pale = findSkill(player, "pale_conscription");
  if (pale && st.souls >= 3 && activate(player, pale)) return;
  const lantern = findSkill(player, "corpse_lantern");
  if (lantern && st.souls >= 3 && activate(player, lantern)) return;
  const chorus = findSkill(player, "lumen_chorus");
  if (chorus && st.notes >= 3) activate(player, chorus);
  const debt = findSkill(player, "debt_of_plenty");
  if (debt && (hunger(player)?.currentValue ?? 0) >= 14) activate(player, debt);
}

export function handleAttuneItemSpawn(entity) {
  if (entity?.typeId !== "minecraft:item") return;
  const loc = entity.location;
  for (const [playerId, pending] of pendingDrops) {
    if (pending.expire < system.currentTick) {
      pendingDrops.delete(playerId);
      continue;
    }
    if (pending.dimId !== entity.dimension.id || distance2(loc, pending.loc) > 100) continue;
    const player = playerById(playerId);
    if (!player) continue;
    try {
      const item = entity.getComponent("minecraft:item")?.itemStack;
      if (!item || item.typeId.startsWith("relics:")) continue;
      const copy = new ItemStack(item.typeId, item.amount);
      try {
        if (typeof item.getLore === "function" && typeof copy.setLore === "function") {
          copy.setLore(item.getLore());
        }
      } catch {
      }
      player.dimension.spawnItem(copy, {
        x: loc.x + 0.35,
        y: loc.y + 0.25,
        z: loc.z + 0.15,
      });
      pendingDrops.delete(playerId);
      sound(player, "random.levelup", 1.4, 0.55);
      action(player, "§6Gilded Rumor — drop duplicated!");
      if (pending.level >= 3 && Math.random() < 0.2) spawnFeeder(player, loc);
      return;
    } catch {
    }
  }
}

export function handleAttuneFoodUse(player, itemStack) {
  if (!player || !itemStack || !isAttunementEnabled(player)) return;
  let isFood = false;
  try {
    isFood = !!itemStack.getComponent("minecraft:food");
  } catch {
  }
  if (!isFood) return;
  const row = findSkill(player, "heartforge");
  const st = state(player);
  if (!row || system.currentTick - st.lastHurt < 160 || isCooling(player, "heartforge_meal")) return;
  startCooldown(player, "heartforge_meal", row.def.cooldown);
  const restored = heal(player, 1 + row.level * 0.5);
  if (row.level >= 2 && restored < 1) st.shield = Math.max(st.shield, 1 + row.level);
  sound(player, "random.anvil_land", 1.45, 0.3);
}

function activeCandidates(player) {
  // Only movement skills still use the Jump button.
  return attunements(player).filter((row) =>
    ["tempest_tithe", "gale_anchor"].includes(row.key)
  );
}

function canActivate(player, row) {
  const st = state(player);
  if (isCooling(player, row.key)) return false;
  switch (row.key) {
    case "siege_root":
    case "crucible_bloom":
    case "phial_familiar":
    case "dawnwell":
    case "gale_anchor":
      return true;
    case "tempest_tithe":
    case "marrow_swap":
      return (hunger(player)?.currentValue ?? 0) >= 2;
    case "debt_of_plenty":
      return (hunger(player)?.currentValue ?? 0) >= 14;
    case "blood_tithe":
      return (health(player)?.currentValue ?? 0) > 2;
    case "corpse_lantern":
      return st.souls >= 3;
    case "pale_conscription":
      return st.souls >= 3;
    case "lumen_chorus":
      return st.notes >= 3;
    default:
      return false;
  }
}

/** Low-HP / surrounded / combat-entry casts — no shared button. */
function tryContextTick(player) {
  if (!player) return;
  const hp = health(player);
  const low = hp && hp.currentValue <= hp.effectiveMax * 0.5;
  const mobs = nearbyHostiles(player, player.location, 6, 8);

  if (low) {
    const marrow = findSkill(player, "marrow_swap");
    if (marrow) activate(player, marrow);
    const tithe = findSkill(player, "blood_tithe");
    if (tithe) activate(player, tithe);
    const dawn = findSkill(player, "dawnwell");
    if (dawn) activate(player, dawn);
  } else {
    const hpNow = health(player);
    // Marrow Swap also fires earlier so it feels responsive.
    if (hpNow && hpNow.currentValue <= hpNow.effectiveMax * 0.65) {
      const marrow = findSkill(player, "marrow_swap");
      if (marrow) activate(player, marrow);
    }
  }

  if (mobs.length >= 3) {
    const siege = findSkill(player, "siege_root");
    if (siege) activate(player, siege);
    const bloom = findSkill(player, "crucible_bloom");
    if (bloom) activate(player, bloom);
  }
}

function tryContextOnHurt(player) {
  const mobs = nearbyHostiles(player, player.location, 8, 4);
  if (!mobs.length) return;
  const phial = findSkill(player, "phial_familiar");
  if (phial) activate(player, phial);
  tryContextTick(player);
}

/**
 * Sprint-jump = Tempest Tithe.
 * Midair jump (not a fresh sprint-leap) = Gale Anchor plant/pull.
 */
export function handleAttuneButton(player, button, stateName) {
  if (!player || String(stateName) !== "Pressed") return;
  if (String(button) !== "Jump") return;
  if (!isAttunementEnabled(player)) return;

  let onGround = true;
  let sprinting = false;
  try {
    onGround = !!player.isOnGround;
  } catch {
  }
  try {
    sprinting = !!player.isSprinting;
  } catch {
  }

  const st = state(player);

  // Prefer Tempest whenever sprinting — including the first airborne frame of a sprint-jump.
  if (sprinting) {
    const tempest = findSkill(player, "tempest_tithe");
    if (tempest && activate(player, tempest)) return;
    if (
      tempest &&
      tempest.level >= 3 &&
      !onGround &&
      st.tempestLanding &&
      st.tempestLanding.expire >= system.currentTick &&
      !isCooling(player, "tempest_air")
    ) {
      if (selfDamage(player, 2)) {
        startCooldown(player, "tempest_air", 40);
        const view = forward(player);
        impulse(player, { x: view.x * 0.75, y: 0.5, z: view.z * 0.75 });
        action(player, "§bTempest Tithe — second leap!");
        return;
      }
    }
  }

  if (!onGround) {
    const gale = findSkill(player, "gale_anchor");
    if (gale) activate(player, gale);
  }
}

function activate(player, row) {
  const st = state(player);
  if (isCooling(player, row.key)) return false;
  setSyn(player, row.synergy, row.affinity);
  switch (row.key) {
    case "cracked_rib_pact":
      if (row.level < 3 || !selfDamage(player, 2)) return false;
      startCooldown(player, row.key, row.def.cooldown);
      st.pactArmedUntil = system.currentTick + 100;
      action(player, "§cPact Slam armed");
      return true;
    case "siege_root": {
      startCooldown(player, row.key, row.def.cooldown);
      const wardTicks = 300;
      const wardId = spawnSiegeWard(player, player.location, wardTicks);
      addField(player, "siege", player.location, row.level, wardTicks, 6, { wardId });
      sound(player, "random.anvil_land", 0.7, 0.45);
      action(player, wardId ? "§9Siege Root — ward holds 15s" : "§9Siege Root planted");
      return true;
    }
    case "tempest_tithe": {
      if (!spendHunger(player, 2)) return false;
      startCooldown(player, row.key, row.def.cooldown);
      const view = forward(player);
      impulse(player, { x: view.x * 0.85, y: 0.6, z: view.z * 0.85 });
      st.tempestLanding = { level: row.level, startY: player.location.y, expire: system.currentTick + 100 };
      sound(player, "random.orb", 1.8, 0.35);
      action(player, "§bTempest Tithe — leap!");
      return true;
    }
    case "gale_anchor": {
      // Place on ground or in air; next activate pulls you to it.
      if (st.anchor && st.anchor.expire >= system.currentTick) {
        const dx = st.anchor.loc.x - player.location.x;
        const dy = st.anchor.loc.y - player.location.y;
        const dz = st.anchor.loc.z - player.location.z;
        const length = Math.hypot(dx, dy, dz) || 1;
        impulse(player, {
          x: (dx / length) * 1.35,
          y: Math.max(0.35, (dy / length) * 1.2),
          z: (dz / length) * 1.35,
        });
        if (row.level >= 2) burst(player, st.anchor.loc, 1.5, 4, 5);
        sound(player, "mob.enderdragon.flap", 1.4, 0.35);
        action(player, "§bGale Anchor — pulled!");
        if (row.level < 3) st.anchor = undefined;
        else st.anchor.expire = system.currentTick + 100;
      } else {
        st.anchor = { loc: location(player, 0.4), expire: system.currentTick + 160 };
        particle(player.dimension, "minecraft:basic_smoke_particle", st.anchor.loc);
        particle(player.dimension, "minecraft:splash_spell_emitter", st.anchor.loc);
        sound(player, "random.pop", 1.2, 0.4);
        action(player, "§bGale Anchor planted — jump in air again to pull");
      }
      startCooldown(player, row.key, 16);
      return true;
    }
    case "debt_of_plenty":
      if (!spendHunger(player, 2)) return false;
      startCooldown(player, row.key, row.def.cooldown);
      st.debtUntil = system.currentTick + 600;
      st.debtLevel = row.level;
      st.debtWarned = false;
      titleHint(player, "§6Debt of Plenty", "§7Fortune debt · 30s");
      return true;
    case "marrow_swap":
      if (!spendHunger(player, 2)) return false;
      startCooldown(player, row.key, Math.max(60, Math.floor(row.def.cooldown * 0.35)));
      heal(player, row.level >= 2 ? 5 : 4);
      particle(player.dimension, "minecraft:heart_particle", location(player, 1));
      sound(player, "random.orb", 1.35, 0.45);
      action(player, "§aMarrow Swap — hunger for health");
      return true;
    case "blood_tithe":
      if (!selfDamage(player, 2)) return false;
      startCooldown(player, row.key, row.def.cooldown);
      st.bloodTitheUntil = system.currentTick + 160;
      st.titheRefunded = 0;
      if (row.level >= 2) clearOneNegative(player);
      particle(player.dimension, "minecraft:heart_particle", location(player, 1));
      sound(player, "mob.zombie.unfect", 1.2, 0.5);
      titleHint(player, "§cSanguine Pact", "§7Strike to reclaim your heart");
      return true;
    case "crucible_bloom":
      startCooldown(player, row.key, row.def.cooldown);
      addField(player, "crucible", player.location, row.level, 140, 4);
      potionBreak(player, 0.9);
      action(player, "§6Crucible Bloom — foes catch fire");
      return true;
    case "phial_familiar":
      startCooldown(player, row.key, row.def.cooldown);
      addHelper(player, "phial", row.level, 300);
      return true;
    case "corpse_lantern":
      if (st.souls < 3) {
        st.activateHint = "Corpse Lantern needs 3 Soul Charges";
        return false;
      }
      st.souls -= 1;
      {
        const hits = burst(player, player.location, 2 + row.level * 1.5, 6, 10);
        sound(player, "mob.wither.shoot", 1.3, 0.4);
        action(
          player,
          hits > 0
            ? `§5Soul Nova! §7hit ${hits} · ${st.souls}/3 charges`
            : `§5Soul Nova! §7no hostiles nearby · ${st.souls}/3 charges`
        );
      }
      if (row.level >= 4 && st.souls >= 2) {
        st.souls -= 2;
        addHelper(player, "bone", row.level, 400);
      }
      return true;
    case "pale_conscription":
      if (st.souls < 3) {
        st.activateHint = `Pale Conscription needs 3 Soul Charges (${st.souls}/3)`;
        return false;
      }
      st.souls -= 3;
      startCooldown(player, row.key, row.def.cooldown);
      addHelper(player, "bone", row.level, 400);
      sound(player, "mob.skeleton.death", 0.8, 0.45);
      action(player, "§5Pale Conscription — thrall called");
      return true;
    case "dawnwell":
      startCooldown(player, row.key, row.def.cooldown);
      addField(player, "dawnwell", player.location, row.level, 140, 5);
      sound(player, "beacon.activate", 1.35, 0.55);
      sound(player, "random.orb", 0.7, 0.5);
      particle(player.dimension, "minecraft:heart_particle", location(player, 1));
      titleHint(player, "§cDawnwell", "§7Healing light");
      return true;
    case "lumen_chorus":
      if (st.notes < 3) return false;
      st.notes = 0;
      startCooldown(player, row.key, row.def.cooldown);
      // Loud third note + humming damage ticks — no flashy spell particles.
      sound(player, "note.pling", 0.5 + Math.random(), 1);
      sound(player, "note.bass", 0.4 + Math.random() * 0.6, 1);
      st.chorusHumUntil = system.currentTick + 100;
      st.chorusLevel = row.level;
      for (const mob of nearbyHostiles(player, player.location, 8, 10)) {
        damage(player, mob, 1.5 + row.level * 0.75);
      }
      if (row.level >= 4) addHelper(player, "seraph", row.level, 120);
      action(player, "§eLumen Chorus — the third note!");
      return true;
  }
  return false;
}

/** Test Bench helper: fill Soul Charges so soul-fueled actives can fire immediately. */
export function debugGrantSouls(player, count = 3) {
  const st = state(player);
  st.souls = Math.max(st.souls, Math.min(3, count));
  return st.souls;
}

/** Test Bench helper: fill souls, chorus notes, and rumors. */
export function debugGrantResources(player) {
  const st = state(player);
  st.souls = 3;
  st.notes = 3;
  st.rumors = 5;
  return { souls: st.souls, notes: st.notes, rumors: st.rumors };
}

/** Test Bench helper: wipe every attunement cooldown for this player. */
export function debugClearCooldowns(player) {
  if (!player?.id) return;
  const prefix = `${player.id}:`;
  for (const key of [...cooldowns.keys()]) {
    if (key.startsWith(prefix)) cooldowns.delete(key);
  }
}

/**
 * Test Bench helper: clear CDs, fill resources, then fire the first ready context skill.
 * @returns {string|undefined} fired skill name
 */
export function debugForceActivate(player) {
  if (!player) return undefined;
  debugClearCooldowns(player);
  const st = state(player);
  if (st.souls < 3) st.souls = 3;
  if (st.notes < 3) st.notes = 3;
  const keys = [
    "pale_conscription",
    "corpse_lantern",
    "lumen_chorus",
    "siege_root",
    "crucible_bloom",
    "dawnwell",
    "marrow_swap",
    "blood_tithe",
    "phial_familiar",
    "debt_of_plenty",
    "tempest_tithe",
    "gale_anchor",
  ];
  for (const key of keys) {
    const row = findSkill(player, key);
    if (row && activate(player, row)) return row.def.name;
  }
  return undefined;
}

function tickField(field, owner) {
  // Field DoT is not authored synergy power — keep it at baseline.
  setSyn(owner, "none");
  if (field.kind === "seed") {
    const mature = system.currentTick >= field.mature;
    if (distance2(owner.location, field.loc) <= field.radius * field.radius) {
      heal(owner, mature ? 2 + field.level : 1 + field.level * 0.5);
      field.expire = 0;
      particle(owner.dimension, "minecraft:heart_particle", field.loc);
    } else {
      particle(owner.dimension, "minecraft:villager_happy", field.loc);
    }
    return;
  }

  const mobs = nearbyHostiles(owner, field.loc, field.radius, 8);
  switch (field.kind) {
    case "discord":
    case "reaction":
    case "grave":
    case "shatter":
    case "pact_burst":
      for (const mob of mobs) damage(owner, mob, 0.5 + field.level * 0.35);
      break;
    case "storm":
    case "siege":
      for (const mob of mobs) {
        const dx = mob.location.x - field.loc.x;
        const dz = mob.location.z - field.loc.z;
        const length = Math.hypot(dx, dz) || 1;
        const force = field.kind === "siege" ? 0.75 : 0.18;
        impulse(mob, {
          x: (dx / length) * force,
          y: field.kind === "siege" ? 0.28 : 0.05,
          z: (dz / length) * force,
        });
        if (field.kind === "siege") applySlow(mob, Math.min(3, field.level), 35);
      }
      if (field.kind === "siege") {
        // Visible ring so the ward reads as a real zone.
        for (let i = 0; i < 6; i++) {
          const a = (system.currentTick / 8 + i) * (Math.PI / 3);
          particle(owner.dimension, "minecraft:villager_angry", {
            x: field.loc.x + Math.cos(a) * field.radius,
            y: field.loc.y + 0.4,
            z: field.loc.z + Math.sin(a) * field.radius,
          });
        }
      }
      break;
    case "slipstream":
      if (distance2(owner.location, field.loc) <= field.radius * field.radius) {
        const view = forward(owner);
        impulse(owner, { x: view.x * 0.18, y: 0.02, z: view.z * 0.18 });
        field.expire = 0;
      }
      break;
    case "crucible":
      for (const mob of mobs) {
        damage(owner, mob, 0.75 + field.level * 0.35);
        ignite(mob, 2 + field.level);
      }
      particle(owner.dimension, "minecraft:basic_flame_particle", {
        x: field.loc.x,
        y: field.loc.y + 0.3,
        z: field.loc.z,
      });
      break;
    case "dawnwell":
    case "blossom":
      if (distance2(owner.location, field.loc) <= field.radius * field.radius) {
        heal(owner, 0.65);
        if (system.currentTick % 20 === 0) sound(owner, "random.orb", 1.4, 0.25);
      }
      if (field.level >= 3) {
        try {
          for (const ally of owner.dimension.getPlayers({
            location: field.loc,
            maxDistance: field.radius,
          }).slice(0, 4)) {
            if (ally.id !== owner.id) heal(ally, 0.3);
          }
        } catch {
        }
      }
      for (const mob of mobs) {
        damage(owner, mob, isUndead(mob) && field.level >= 2 ? 1.5 : 0.5);
      }
      particle(owner.dimension, "minecraft:heart_particle", {
        x: field.loc.x,
        y: field.loc.y + 0.35,
        z: field.loc.z,
      });
      particle(owner.dimension, "minecraft:mobspell_emitter", {
        x: field.loc.x,
        y: field.loc.y + 0.2,
        z: field.loc.z,
      }, { red: 0.95, green: 0.2, blue: 0.25, alpha: 1 });
      break;
  }
  if (field.kind !== "dawnwell" && field.kind !== "blossom" && field.kind !== "crucible") {
    particle(owner.dimension, field.kind === "storm" ? "minecraft:basic_smoke_particle" : "minecraft:splash_spell_emitter", {
      x: field.loc.x,
      y: field.loc.y + 0.2,
      z: field.loc.z,
    });
  }
}

function tickHelper(helper, owner) {
  // Helper/thrall damage is not authored synergy power — keep it at baseline.
  setSyn(owner, "none");
  helper.angle += 0.7;
  const loc = {
    x: owner.location.x + Math.cos(helper.angle) * 1.2,
    y: owner.location.y + 1.2,
    z: owner.location.z + Math.sin(helper.angle) * 1.2,
  };

  if (helper.kind === "phial") {
    const tint = helper.phial?.tint ?? SPELL_TINT;
    particle(owner.dimension, "minecraft:splash_spell_emitter", loc, tint);
    particle(owner.dimension, "minecraft:mobspell_emitter", loc, tint);
  } else if (helper.kind === "bone") {
    particle(owner.dimension, "minecraft:basic_smoke_particle", loc);
  } else {
    particle(owner.dimension, "minecraft:splash_spell_emitter", loc);
  }

  // Keep summoned thrall near the owner / focus target.
  if (helper.entityId) {
    const thrall = findEntityById(helper.entityId);
    if (!thrall) {
      helper.entityId = undefined;
    } else {
      try {
        let tx = owner.location.x;
        let ty = owner.location.y;
        let tz = owner.location.z;
        const focus = helper.focusId ? findEntityById(helper.focusId) : undefined;
        if (focus && focus.isValid !== false) {
          tx = focus.location.x;
          ty = focus.location.y;
          tz = focus.location.z;
        }
        const dx = tx - thrall.location.x;
        const dy = ty - thrall.location.y;
        const dz = tz - thrall.location.z;
        const dist2 = dx * dx + dz * dz;
        if (dist2 > 4) {
          const len = Math.hypot(dx, dy, dz) || 1;
          impulse(thrall, {
            x: (dx / len) * 0.45,
            y: Math.max(-0.05, (dy / len) * 0.2),
            z: (dz / len) * 0.45,
          });
        }
        if (dist2 > 220) {
          thrall.teleport({
            x: tx + (Math.random() - 0.5),
            y: ty,
            z: tz + (Math.random() - 0.5),
          });
        }
      } catch {
      }
    }
  }

  if (system.currentTick < helper.nextAttack) return;
  helper.nextAttack = system.currentTick + (helper.kind === "bone" ? 12 : 20);

  if (helper.kind === "phial") {
    const mobs = nearbyHostiles(owner, owner.location, 10, 8);
    if (!mobs.length) return;
    const target = mobs[0];
    const effect = helper.phial?.effect ?? "harm";
    const name = helper.phial?.name ?? "Phial";
    if (effect === "heal") {
      heal(owner, 1 + helper.level * 0.35);
    } else if (effect === "slow") {
      applySlow(target, 1 + Math.min(2, helper.level), 60);
      damage(owner, target, 0.75 + helper.level * 0.35);
    } else if (effect === "poison") {
      try {
        target.addEffect("poison", 60, { amplifier: Math.min(2, helper.level), showParticles: true });
      } catch {
      }
      damage(owner, target, 0.75 + helper.level * 0.35);
    } else {
      damage(owner, target, 1.25 + helper.level * 0.5);
    }
    particle(owner.dimension, "minecraft:splash_spell_emitter", location(target), helper.phial?.tint);
    potionBreak(owner, 1.15);
    action(owner, `§dPhial §8· §f${name}`);
    // Alternate color next throw at higher levels.
    if (helper.level >= 2) {
      const colors = [
        { name: "Healing", tint: { red: 0.95, green: 0.2, blue: 0.35, alpha: 1 }, effect: "heal" },
        { name: "Harming", tint: { red: 0.45, green: 0.05, blue: 0.55, alpha: 1 }, effect: "harm" },
        { name: "Poison", tint: { red: 0.25, green: 0.85, blue: 0.2, alpha: 1 }, effect: "poison" },
        { name: "Slowness", tint: { red: 0.35, green: 0.45, blue: 0.95, alpha: 1 }, effect: "slow" },
      ];
      helper.phial = colors[Math.floor(Math.random() * colors.length)];
    }
    return;
  }

  const mobs = nearbyHostiles(owner, owner.location, 12, 8);
  if (!mobs.length) return;
  let target = mobs[0];
  if (helper.focusId) {
    const focused = mobs.find((m) => m.id === helper.focusId) ?? findEntityById(helper.focusId);
    if (focused) target = focused;
  }
  if (helper.kind === "seraph") {
    target = mobs.sort((a, b) => (health(b)?.currentValue ?? 0) - (health(a)?.currentValue ?? 0))[0];
  }
  damage(owner, target, 1.25 + helper.level * 0.55);
  if (helper.kind === "bone") {
    particle(owner.dimension, "minecraft:critical_hit_emitter", location(target));
  } else {
    particle(owner.dimension, "minecraft:mobspell_emitter", location(target));
  }
}

/**
 * @param {(player: import("@minecraft/server").Player) => boolean} [isUiOpen]
 *        When true for a player, skip their expensive field/helper/status ticks.
 */
export function tickAttunementRuntime(isUiOpen) {
  const now = system.currentTick;
  const uiClosed = (player) => !(typeof isUiOpen === "function" && player && isUiOpen(player));

  if (now % 200 === 0) {
    for (const [id, until] of echoThrottle) if (until < now) echoThrottle.delete(id);
  }

  for (const [key, row] of marks) {
    if (row.expire >= now) continue;
    if (row.kind === "wager" && !row.failed) {
      const owner = playerById(row.ownerId);
      if (owner && uiClosed(owner)) {
        spendHunger(owner, 2);
        action(owner, "§7Mimic's Wager lost");
      }
    }
    marks.delete(key);
  }

  for (let i = fields.length - 1; i >= 0; i--) {
    const field = fields[i];
    if (field.expire < now) {
      removeTrackedEntity(field.wardId, field.dimId);
      fields.splice(i, 1);
      continue;
    }
    if (field.nextTick > now) continue;
    field.nextTick = now + 10;
    const owner = playerById(field.ownerId);
    if (!owner || owner.dimension.id !== field.dimId) {
      removeTrackedEntity(field.wardId, field.dimId);
      fields.splice(i, 1);
      continue;
    }
    if (!uiClosed(owner)) continue;
    tickField(field, owner);
  }

  for (let i = helpers.length - 1; i >= 0; i--) {
    const helper = helpers[i];
    if (helper.expire < now) {
      removeTrackedEntity(helper.entityId, helper.dimId);
      helpers.splice(i, 1);
      continue;
    }
    const owner = playerById(helper.ownerId);
    if (!owner || owner.dimension.id !== helper.dimId) {
      removeTrackedEntity(helper.entityId, helper.dimId);
      helpers.splice(i, 1);
      continue;
    }
    if (!uiClosed(owner)) continue;
    tickHelper(helper, owner);
  }

  for (const player of world.getPlayers()) {
    if (!uiClosed(player)) continue;
    setSyn(player, "none");
    const st = state(player);
    if (st.debtUntil >= now) {
      const secs = Math.ceil((st.debtUntil - now) / 20);
      if (now % 20 === 0) {
        action(player, `§6Debt of Plenty §8· §e${secs}s §7fortune debt`);
        particle(player.dimension, "minecraft:villager_happy", location(player, 1.2));
      }
      if (now % 40 === 0 && !spendHunger(player, 1)) {
        st.debtUntil = now - 1;
      }
    }
    if (st.debtUntil && st.debtUntil < now) {
      st.debtUntil = 0;
      if (st.debtLevel >= 3) selfDamage(player, 2);
      action(player, "§6Debt of Plenty came due");
    }
    if (st.chorusHumUntil >= now) {
      if (now % 8 === 0) {
        const noteIds = ["note.harp", "note.bass", "note.pling"];
        sound(player, noteIds[Math.floor(Math.random() * noteIds.length)], 0.5 + Math.random(), 0.35);
        for (const mob of nearbyHostiles(player, player.location, 7, 6)) {
          damage(player, mob, 0.35 + (st.chorusLevel ?? 1) * 0.15);
        }
      }
    } else if (st.chorusHumUntil && st.chorusHumUntil < now) {
      st.chorusHumUntil = 0;
    }
    if (st.bloodTitheUntil >= now && now % 20 === 0) {
      const left = Math.ceil((st.bloodTitheUntil - now) / 20);
      action(player, `§cSanguine Pact §8· §7${left}s to reclaim`);
    }
    if (st.tempestLanding && (player.isOnGround || st.tempestLanding.expire < now)) {
      const landing = st.tempestLanding;
      st.tempestLanding = undefined;
      burst(player, player.location, 1 + landing.level * 0.5, 4, 6);
      for (const mob of nearbyHostiles(player, player.location, 4, 6)) {
        const dx = mob.location.x - player.location.x;
        const dz = mob.location.z - player.location.z;
        const length = Math.hypot(dx, dz) || 1;
        impulse(mob, { x: (dx / length) * 0.3, y: 0.12, z: (dz / length) * 0.3 });
      }
      if (landing.level >= 4) addField(player, "storm", player.location, landing.level, 60, 4);
    }
    if (st.anchor?.expire < now) st.anchor = undefined;
    if (now % 10 === 0) tryContextTick(player);
  }
}

export function clearAttunementRuntime(playerId) {
  players.delete(playerId);
  pendingDrops.delete(playerId);
  synProcAt.delete(playerId);
  for (const [key, row] of marks) {
    if (row.ownerId === playerId) marks.delete(key);
  }
  for (let i = fields.length - 1; i >= 0; i--) {
    if (fields[i].ownerId === playerId) fields.splice(i, 1);
  }
  for (let i = helpers.length - 1; i >= 0; i--) {
    if (helpers[i].ownerId === playerId) helpers.splice(i, 1);
  }
}
