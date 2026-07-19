import { EntityDamageCause, ItemStack, MolangVariableMap, system, world } from "@minecraft/server";
import { getEquippedAll } from "./relics.js";
import { resolveAttuneEffects } from "./attune_data.js";
import { guardBonusDamage, isBonusDamageGuarded } from "./combat_guard.js";

const TICK = 20;
const cooldowns = new Map();
const players = new Map();
const marks = new Map();
const fields = [];
const helpers = [];
const pendingDrops = new Map();
const RETALIATE_CD = 120;
const MAX_FIELDS = 2;
const MAX_HELPERS = 1;

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

function isCooling(player, key) {
  return system.currentTick < (cooldowns.get(cooldownKey(player, key)) ?? 0);
}

function startCooldown(player, key, ticks) {
  cooldowns.set(cooldownKey(player, key), system.currentTick + Math.max(1, ticks));
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

function action(player, text) {
  try {
    player.onScreenDisplay.setActionBar(text);
  } catch {
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
  const before = hp.currentValue;
  try {
    hp.setCurrentValue(Math.min(hp.effectiveMax, before + amount));
  } catch {
    return 0;
  }
  return Math.max(0, Math.min(amount, hp.effectiveMax - before));
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
  // Script damage is more reliable as whole hearts; keep at least 1.
  const dealt = Math.max(1, Math.round(amount));
  guardBonusDamage(player, victim, 3);
  try {
    victim.applyDamage(dealt, { cause, damagingEntity: player });
    return true;
  } catch {
    try {
      victim.applyDamage(dealt, { cause: EntityDamageCause.entityAttack, damagingEntity: player });
      return true;
    } catch {
      try {
        victim.applyDamage(dealt);
        return true;
      } catch {
        return false;
      }
    }
  }
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
  const byConflict = new Map();
  const bySkill = new Map();
  for (const { slot, itemId, stack } of getEquippedAll(player)) {
    for (const effect of resolveAttuneEffects(player, stack)) {
      const row = { ...effect, slot, itemId, stack };
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
  return [...byConflict.values()];
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
    expire: system.currentTick + duration,
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
    expire: system.currentTick + duration,
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

/** Visible bone thrall for Pale Conscription (tamed wolf, fallback armor stand). */
function spawnBoneThrall(player) {
  const loc = {
    x: player.location.x + 1.2,
    y: player.location.y,
    z: player.location.z,
  };
  let entity;
  try {
    entity = player.dimension.spawnEntity("minecraft:wolf", loc);
  } catch {
    try {
      entity = player.dimension.spawnEntity("minecraft:armor_stand", loc);
    } catch {
      return undefined;
    }
  }
  try {
    entity.nameTag = "§5Bone Thrall";
    entity.addTag("relics:thrall");
  } catch {
  }
  try {
    const tameable = entity.getComponent("minecraft:tameable");
    if (tameable && typeof tameable.tame === "function") tameable.tame(player);
  } catch {
  }
  sound(player, "mob.wolf.whine", 1.2, 0.5);
  return entity?.id;
}

function addHelper(player, kind, level, duration) {
  for (let i = helpers.length - 1; i >= 0; i--) {
    if (helpers[i].ownerId === player.id) {
      removeTrackedEntity(helpers[i].entityId, helpers[i].dimId);
      helpers.splice(i, 1);
    }
  }
  let entityId;
  if (kind === "bone") entityId = spawnBoneThrall(player);
  helpers.push({
    ownerId: player.id,
    dimId: player.dimension.id,
    kind,
    level,
    expire: system.currentTick + duration,
    nextAttack: system.currentTick,
    angle: 0,
    entityId,
  });
  if (kind === "bone" && entityId) {
    action(player, "§5Bone Thrall summoned");
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
  if (st.rivets < 3) {
    action(player, `§cRivets ${st.rivets}/3`);
    return;
  }
  st.rivets = 0;
  damage(player, victim, 1 + row.level);
  sound(player, "random.anvil_land", 1.35, 0.35);
  if (row.level >= 2) {
    const dx = victim.location.x - player.location.x;
    const dz = victim.location.z - player.location.z;
    const length = Math.hypot(dx, dz) || 1;
    impulse(victim, { x: (dx / length) * 0.45, y: 0.15, z: (dz / length) * 0.45 });
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
    return;
  }
  clearMark(player, victim, "movement");
  const view = forward(player);
  const strength = 0.3 + row.level * 0.08;
  impulse(victim, { x: -view.z * strength, y: 0.12, z: view.x * strength });
}

function applyVialmark(player, victim, row) {
  const colors = ["Caustic", "Frost", "Spark"];
  const st = state(player);
  const color = colors[st.vialColor % colors.length];
  st.vialColor = (st.vialColor + 1) % colors.length;
  const prior = getMark(player, victim, "alchemy");
  setMark(player, victim, "alchemy", { kind: "vial", color, level: row.level }, 160);
  action(player, `§dVialmark: §f${color}`);
  particle(player.dimension, "minecraft:mobspell_emitter", location(victim));
  if (!prior || prior.color === color || isCooling(player, "vial_reaction")) return;
  startCooldown(player, "vial_reaction", 40);
  damage(player, victim, 1.5 + row.level);
  sound(player, "random.orb", 1.7, 0.4);
  if (row.level >= 3) addField(player, "reaction", victim.location, row.level, 60, 3);
  if (row.level >= 4 && prior.color !== color) burst(player, victim.location, 1.5, 4, 5);
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
  const weak = getMark(player, victim, "weak");
  if (weak) damage(player, victim, 0.5 + weak.level * 0.35);
  for (const row of attunements(player)) {
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
        if (Math.random() < 0.25 && !isCooling(player, row.key)) {
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
        if (
          hp &&
          hp.currentValue >= hp.effectiveMax &&
          !getMark(player, victim, "bounty") &&
          !isCooling(player, row.key)
        ) {
          startCooldown(player, row.key, row.def.cooldown);
          setMark(player, victim, "bounty", {
            kind: "wager",
            level: row.level,
            failed: false,
          }, 200);
          action(player, "§6Mimic's Wager: 10 seconds");
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
          particle(player.dimension, "minecraft:mobspell_emitter", location(victim));
        }
        break;
      case "thanatoic_ledger": {
        const st = state(player);
        const hp = health(victim);
        if (
          st.ledger > 0 &&
          hp &&
          hp.currentValue / Math.max(1, hp.effectiveMax) <= 0.2
        ) {
          st.ledger -= 1;
          damage(player, victim, 3 + row.level);
          if (row.level >= 2) heal(player, 2);
          action(player, "§5Thanatoic Execute");
        }
        break;
      }
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
          if (Math.random() < chance) {
            setMark(player, victim, "thunder", { kind: "thunder", level: row.level }, 160);
            particle(player.dimension, "minecraft:mobspell_emitter", location(victim));
          }
        }
        break;
      }
      case "judgment_brand": {
        const current = getMark(player, victim, "attack_brand");
        const count = current?.kind === "judgment" ? current.count + 1 : 1;
        if (count >= 3) {
          clearMark(player, victim, "attack_brand");
          damage(player, victim, 1.5 + row.level);
          if (row.level >= 3) {
            const other = nearbyHostiles(player, victim.location, 4, 3).find((mob) => mob.id !== victim.id);
            if (other) setMark(player, other, "attack_brand", { kind: "judgment", count: 1, level: row.level }, 160);
          }
          particle(player.dimension, "minecraft:villager_happy", location(victim));
        } else {
          setMark(player, victim, "attack_brand", { kind: "judgment", count, level: row.level }, 160);
        }
        break;
      }
    }
  }

  const st = state(player);
  if (st.bloodTitheUntil >= system.currentTick && baseDamage > 0) {
    const refund = Math.min(0.75, 0.2 + baseDamage * 0.08);
    const earned = heal(player, refund);
    st.titheRefunded += earned;
    const tithe = findSkill(player, "blood_tithe");
    if (tithe?.level >= 3 && earned < refund) {
      st.shield = Math.max(st.shield, refund - earned);
    }
    if (st.titheRefunded >= 2) st.bloodTitheUntil = 0;
  }
}

export function handleAttuneHurtBefore(player, damageSource, incomingDamage = 0) {
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
  const attacker = damageSource?.damagingEntity;
  const st = state(player);
  st.lastHurt = system.currentTick;

  if (st.shield > 0 && amount > 0) {
    const restored = Math.min(st.shield, amount);
    st.shield -= restored;
    heal(player, restored);
  }

  for (const row of attunements(player)) {
    switch (row.key) {
      case "quillguard":
        if (attacker && !isCooling(player, "attune_retaliate")) {
          startCooldown(player, "attune_retaliate", Math.max(RETALIATE_CD, row.def.cooldown));
          system.run(() => fireArrow(player, attacker, row.level));
        }
        break;
      case "bastion_glyph":
        if (amount >= 4 && !isCooling(player, row.key)) {
          startCooldown(player, row.key, row.def.cooldown);
          addField(player, "bastion", player.location, row.level, 120, 4, {
            buffer: 2 + row.level,
          });
          action(player, "§9Bastion Glyph");
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
          if (row.level === 1 || (row.level >= 3 && low)) {
            heal(player, 1 + row.level * 0.5);
            particle(player.dimension, "minecraft:heart_particle", location(player, 1));
          } else {
            damage(player, attacker, 1 + row.level);
            particle(player.dimension, "minecraft:splash_spell_emitter", location(attacker));
          }
          if (row.level >= 4) {
            heal(player, 1);
            damage(player, attacker, 2);
          }
          sound(player, "random.glass", 1, 0.6);
          sound(player, "random.bow", 0.7, 0.4);
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
        const judgment = attacker && getMark(player, attacker, "attack_brand");
        if (judgment?.kind === "judgment" && row.level >= 2) {
          damage(player, attacker, 0.75 + row.level * 0.25);
        }
        break;
      }
    }
  }

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
  for (const row of attunements(player)) {
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
          if (wager.level >= 4 && Math.random() < 0.2) spawnFeeder(player, victimLoc);
          action(player, "§6Wager won!");
        }
        break;
      }
      case "debt_of_plenty":
        if (st.debtUntil >= system.currentTick && Math.random() < 0.08 + row.level * 0.03) {
          spawnFeeder(player, victimLoc);
        }
        break;
      case "gilded_rumor":
        st.rumors = Math.min(5, st.rumors + 1);
        if (st.rumors >= 5) {
          st.rumors = 0;
          pendingDrops.set(player.id, {
            expire: system.currentTick + 20,
            dimId: player.dimension.id,
            loc: victimLoc,
            level: row.level,
          });
          action(player, "§6Gilded Rumor: next drop repeats");
        } else {
          action(player, `§6Rumors ${st.rumors}/5`);
        }
        break;
      case "symbiotic_seed":
        if (Math.random() < row.def.chance) {
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
        if (crucible && row.level >= 2 && Math.random() < 0.15) {
          spawnFeeder(player, victimLoc, "relics:arcane_dust");
        }
        break;
      }
      case "dirge_mark": {
        const dirge = getMark(player, victim, "death");
        if (dirge?.kind === "dirge") {
          clearMark(player, victim, "death");
          burst(player, victimLoc, 1 + row.level, 4, 5);
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
        st.ledger = Math.min(row.level >= 3 ? 2 : 1, st.ledger + 1);
        break;
      case "lumen_chorus":
        st.notes = Math.min(3, st.notes + 1);
        action(player, `§eChorus Notes ${st.notes}/3`);
        break;
      case "judgment_brand": {
        const judgment = getMark(player, victim, "attack_brand");
        if (judgment?.kind === "judgment" && row.level >= 4) {
          burst(player, victimLoc, 2, 4, 5);
          heal(player, 1);
        }
        break;
      }
    }
  }
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
    if (pending.dimId !== entity.dimension.id || distance2(loc, pending.loc) > 16) continue;
    const player = playerById(playerId);
    if (!player) continue;
    try {
      const item = entity.getComponent("minecraft:item")?.itemStack;
      if (!item || item.typeId.startsWith("relics:")) continue;
      player.dimension.spawnItem(item.clone(), {
        x: loc.x + 0.2,
        y: loc.y + 0.2,
        z: loc.z,
      });
      pendingDrops.delete(playerId);
      sound(player, "random.orb", 1.7, 0.5);
      if (pending.level >= 3 && Math.random() < 0.15) spawnFeeder(player, loc);
      return;
    } catch {
    }
  }
}

export function handleAttuneFoodUse(player, itemStack) {
  if (!player || !itemStack) return;
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
  switch (row.key) {
    case "cracked_rib_pact":
      if (row.level < 3 || !selfDamage(player, 2)) return false;
      startCooldown(player, row.key, row.def.cooldown);
      st.pactArmedUntil = system.currentTick + 100;
      action(player, "§cPact Slam armed");
      return true;
    case "siege_root": {
      startCooldown(player, row.key, row.def.cooldown);
      const wardId = spawnSiegeWard(player, player.location, 140);
      addField(player, "siege", player.location, row.level, 140, 6, { wardId });
      sound(player, "random.anvil_land", 0.7, 0.45);
      action(player, wardId ? "§9Siege Root — ward golem holds the line" : "§9Siege Root planted");
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
      action(player, "§6Debt of Plenty: 30 seconds");
      return true;
    case "marrow_swap":
      if (!spendHunger(player, 2)) return false;
      startCooldown(player, row.key, row.def.cooldown);
      heal(player, row.level >= 2 ? 3 : 2);
      particle(player.dimension, "minecraft:heart_particle", location(player, 1));
      return true;
    case "blood_tithe":
      if (!selfDamage(player, 2)) return false;
      startCooldown(player, row.key, row.def.cooldown);
      st.bloodTitheUntil = system.currentTick + 120;
      st.titheRefunded = 0;
      if (row.level >= 2) clearOneNegative(player);
      action(player, "§aBlood Tithe: earn it back");
      return true;
    case "crucible_bloom":
      startCooldown(player, row.key, row.def.cooldown);
      addField(player, "crucible", player.location, row.level, 120, 4);
      action(player, "§dCrucible Bloom");
      return true;
    case "phial_familiar":
      startCooldown(player, row.key, row.def.cooldown);
      addHelper(player, "phial", row.level, 300);
      action(player, "§dPhial Familiar called");
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
      addField(player, "dawnwell", player.location, row.level, 120, 5);
      action(player, "§eDawnwell");
      return true;
    case "lumen_chorus":
      if (st.notes < 3) return false;
      st.notes = 0;
      startCooldown(player, row.key, row.def.cooldown);
      for (const mob of nearbyHostiles(player, player.location, 7, 8)) {
        setMark(player, mob, "attack_brand", { kind: "judgment", count: 1, level: row.level }, 160);
      }
      if (row.level >= 4) addHelper(player, "seraph", row.level, 120);
      action(player, "§eLumen Chorus!");
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
      for (const mob of mobs) damage(owner, mob, 0.75 + field.level * 0.35);
      break;
    case "dawnwell":
    case "blossom":
      if (distance2(owner.location, field.loc) <= field.radius * field.radius) {
        heal(owner, 0.5);
      }
      if (field.level >= 3) {
        try {
          for (const ally of owner.dimension.getPlayers({
            location: field.loc,
            maxDistance: field.radius,
          }).slice(0, 4)) {
            if (ally.id !== owner.id) heal(ally, 0.25);
          }
        } catch {
        }
      }
      for (const mob of mobs) {
        damage(owner, mob, isUndead(mob) && field.level >= 2 ? 1.5 : 0.5);
      }
      break;
  }
  particle(owner.dimension, field.kind === "storm" ? "minecraft:basic_smoke_particle" : "minecraft:splash_spell_emitter", {
    x: field.loc.x,
    y: field.loc.y + 0.2,
    z: field.loc.z,
  });
}

function tickHelper(helper, owner) {
  helper.angle += 0.7;
  const loc = {
    x: owner.location.x + Math.cos(helper.angle) * 1.2,
    y: owner.location.y + 1.2,
    z: owner.location.z + Math.sin(helper.angle) * 1.2,
  };
  particle(
    owner.dimension,
    helper.kind === "bone" ? "minecraft:mobspell_emitter" : "minecraft:splash_spell_emitter",
    loc
  );

  // Keep summoned thrall near the owner.
  if (helper.entityId) {
    const thrall = findEntityById(helper.entityId);
    if (!thrall) {
      helper.entityId = undefined;
    } else {
      try {
        const dx = owner.location.x - thrall.location.x;
        const dz = owner.location.z - thrall.location.z;
        if (dx * dx + dz * dz > 100) {
          thrall.teleport({
            x: owner.location.x + 1,
            y: owner.location.y,
            z: owner.location.z,
          });
        }
      } catch {
      }
    }
  }

  if (system.currentTick < helper.nextAttack) return;
  helper.nextAttack = system.currentTick + 20;
  const mobs = nearbyHostiles(owner, owner.location, 10, 8);
  if (!mobs.length) return;
  const target = helper.kind === "seraph"
    ? mobs.sort((a, b) => (health(b)?.currentValue ?? 0) - (health(a)?.currentValue ?? 0))[0]
    : mobs[0];
  damage(owner, target, 1 + helper.level * 0.5);
  particle(owner.dimension, "minecraft:mobspell_emitter", location(target));
}

export function tickAttunementRuntime() {
  const now = system.currentTick;
  for (const [key, row] of marks) {
    if (row.expire >= now) continue;
    if (row.kind === "wager" && !row.failed) {
      const owner = playerById(row.ownerId);
      if (owner) {
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
    tickHelper(helper, owner);
  }

  for (const player of world.getPlayers()) {
    const st = state(player);
    if (
      st.debtUntil >= now &&
      now % 40 === 0 &&
      !spendHunger(player, 1)
    ) {
      st.debtUntil = now - 1;
    }
    if (st.debtUntil && st.debtUntil < now) {
      st.debtUntil = 0;
      if (st.debtLevel >= 3) selfDamage(player, 2);
      action(player, "§6Debt of Plenty came due");
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
