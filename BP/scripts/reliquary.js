import { world, system, ItemStack } from "@minecraft/server";
import {
  getEquipped,
  getEquippedStack,
  setEquippedStack,
  serializeRelicStack,
  refreshPlayerRelicLore,
} from "./relics.js";
import {
  WARDROBE_SLOT_ORDER,
  matchesSlot,
  getRelicDef,
} from "./registry.js";
import { loreLinesForItem, loreOptsForPlayer } from "./descriptions.js";
import { syncCurioUi, clearCurioTitleLeak } from "./ui_sync.js";
import { Ink, paint } from "./theme.js";
import {
  syncExamineRelic,
  restampExamineStack,
  attuneActionBar,
  getAttuneProgress,
  applyRolledAttunement,
  announceRoll,
  stripGaugeFromPlayer,
  FOCUS_A_SLOT,
  FOCUS_B_SLOT,
  RITUAL_INPUT_SLOTS,
  GAUGE_ID,
} from "./attune_data.js";
import {
  SHARD_ID,
  FOCUS_IDS,
  RITUAL_COSTS,
  groupForFocus,
  ritualRarity,
  rollRitualAttunement,
} from "./attune_pool.js";
import { isAttunementEnabled } from "./settings.js";

function countPlayerItem(player, typeId) {
  const inv = player?.getComponent?.("minecraft:inventory")?.container;
  if (!inv) return 0;
  let n = 0;
  for (let i = 0; i < inv.size; i++) {
    try {
      const s = inv.getItem(i);
      if (s?.typeId === typeId) n += s.amount;
    } catch {
    }
  }
  return n;
}

function consumePlayerItem(player, typeId, amount) {
  const inv = player?.getComponent?.("minecraft:inventory")?.container;
  if (!inv || countPlayerItem(player, typeId) < amount) return false;
  let left = amount;
  for (let i = 0; i < inv.size && left > 0; i++) {
    let s;
    try {
      s = inv.getItem(i);
    } catch {
      continue;
    }
    if (s?.typeId !== typeId) continue;
    const take = Math.min(left, s.amount);
    try {
      if (take === s.amount) inv.setItem(i, undefined);
      else {
        s.amount -= take;
        inv.setItem(i, s);
      }
      left -= take;
    } catch {
    }
  }
  return left === 0;
}

/** Refund items into the player's bag (or drop at feet). */
function givePlayerItem(player, typeId, amount) {
  if (!player || !typeId || amount <= 0) return;
  let left = amount;
  while (left > 0) {
    const n = Math.min(left, 64);
    try {
      giveOrDrop(player, new ItemStack(typeId, n));
    } catch {
      break;
    }
    left -= n;
  }
}

/**
 * Drop Forge bay + focus materials at the entity (orphan scrub safety when no owner).
 * Never touch slots 0–23 — those mirror equipped relics already saved on the player.
 */
function dropForgeBayContents(entity) {
  const inv = getContainer(entity);
  if (!inv) return;
  const loc = entity.location;
  const dim = entity.dimension;
  const slots = [EXAMINE_SLOT, ...RITUAL_INPUT_SLOTS];
  for (const i of slots) {
    let stack;
    try {
      stack = inv.getItem(i);
      if (!stack) continue;
      inv.setItem(i, undefined);
    } catch {
      continue;
    }
    try {
      dim.spawnItem(stack, loc);
    } catch {
    }
  }
}

/** Return Forge bay / focus items to the player (preferred over world drops). */
function returnForgeBayToPlayer(player, entity) {
  if (!player || !entity) return;
  const inv = getContainer(entity);
  if (!inv) return;
  for (const i of [EXAMINE_SLOT, ...RITUAL_INPUT_SLOTS]) {
    let stack;
    try {
      stack = inv.getItem(i);
      if (!stack) continue;
      inv.setItem(i, undefined);
    } catch {
      continue;
    }
    giveOrDrop(player, stack);
  }
}

/**
 * Flush open Reliquary/Forge UI into player dynamic properties, then despawn the
 * temp chest. Safe for death + logout so equipped relics are never lost.
 */
export function flushReliquarySession(player, opts = {}) {
  if (!player) return false;
  const sess = sessions.get(player.id);
  let entity =
    opts.entity ??
    (sess?.entityId ? findEntityById(player.dimension, sess.entityId) : undefined);
  if (!entity) {
    try {
      for (const e of player.dimension.getEntities({ type: RELIQUARY_ID })) {
        if (ownerOf(e) === player.id && isTemp(e)) {
          entity = e;
          break;
        }
      }
    } catch {
    }
  }
  if (!entity) {
    sessions.delete(player.id);
    return false;
  }
  try {
    returnExamineToPlayer(player, entity);
  } catch {
  }
  try {
    returnForgeBayToPlayer(player, entity);
  } catch {
  }
  try {
    pullReliquaryToEquipped(player, entity);
  } catch {
  }
  try {
    stripGaugeFromPlayer(player);
  } catch {
  }
  destroyEntity(entity, { dropForgeBay: false });
  sessions.delete(player.id);
  return true;
}

export function isReliquarySessionOpen(player) {
  if (!player) return false;
  const sess = sessions.get(player.id);
  return !!(sess && !sess.closing && sess.entityId);
}

export const RELIQUARY_ID = "relics:reliquary";
export const RELIQUARY_ITEM = "relics:reliquary";
export const RELIQUARY_TITLE = "Reliquary";
export const ATTUNE_TITLE = "Attunement Forge";

/** Examine bay on Attune UI — not equipment. */
export const EXAMINE_SLOT = 24;

const ACCESSORY_COUNT = WARDROBE_SLOT_ORDER.length;
const OWNER_PROP = "relics:owner";
const TEMP_PROP = "relics:temp";
const MODE_PROP = "relics:ui_mode";
const IDLE_TICKS = 200;
// 5 blocks — forge sessions spawn on the anvil, which can be a few blocks away.
const MAX_AWAY2 = 25;

const sessions = new Map();

function stampLore(stack, opts) {
  if (!stack?.typeId?.startsWith("relics:")) return false;
  const def = getRelicDef(stack.typeId);
  const lines = loreLinesForItem(stack.typeId, def, opts);
  if (!lines.length) return false;
  try {
    const current = typeof stack.getLore === "function" ? stack.getLore() : [];
    if (current.length === lines.length && current.every((l, i) => l === lines[i])) {
      return false;
    }
    stack.setLore(lines);
    return true;
  } catch {
    return false;
  }
}

function loreStack(itemIdOrStack, opts) {
  if (typeof itemIdOrStack !== "string") {
    stampLore(itemIdOrStack, opts);
    return itemIdOrStack;
  }
  const stack = new ItemStack(itemIdOrStack, 1);
  stampLore(stack, opts);
  return stack;
}

function giveOrDrop(player, itemIdOrStack) {
  const inv = player.getComponent("minecraft:inventory")?.container;
  if (!inv) return;
  const stack = loreStack(itemIdOrStack, loreOptsForPlayer(player));
  const leftover = inv.addItem(stack);
  if (leftover) player.dimension.spawnItem(leftover, player.location);
}

function getContainer(entity) {
  return entity.getComponent("minecraft:inventory")?.container;
}

function ownerOf(entity) {
  try {
    const v = entity.getDynamicProperty(OWNER_PROP);
    return typeof v === "string" ? v : undefined;
  } catch {
    return undefined;
  }
}

function isTemp(entity) {
  try {
    return entity.getDynamicProperty(TEMP_PROP) === true;
  } catch {
    return false;
  }
}

function destroyEntity(entity, opts = {}) {
  if (opts.dropForgeBay) {
    try {
      dropForgeBayContents(entity);
    } catch {
    }
  }
  try {
    entity.triggerEvent("relics:despawn_event");
  } catch {
    try {
      entity.remove();
    } catch {
    }
  }
}

function findEntityById(dimension, entityId) {
  try {
    for (const e of dimension.getEntities({ type: RELIQUARY_ID })) {
      if (e.id === entityId) return e;
    }
  } catch {
  }
  return undefined;
}

function dist2(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

function playerForEntity(entity) {
  const ownerId = ownerOf(entity);
  if (ownerId) {
    for (const p of world.getPlayers()) {
      if (p.id === ownerId) return p;
    }
  }
  for (const p of world.getPlayers()) {
    if (sessions.get(p.id)?.entityId === entity.id) return p;
  }
  return undefined;
}

export function pushEquippedToReliquary(player, entity) {
  const inv = getContainer(entity);
  if (!inv) return;
  const opts = loreOptsForPlayer(player);

  for (let i = 0; i < ACCESSORY_COUNT; i++) {
    const slot = WARDROBE_SLOT_ORDER[i];
    const equipped = getEquippedStack(player, slot);
    try {
      if (equipped) {
        stampLore(equipped, opts);
        const existing = inv.getItem(i);
        const same =
          existing?.typeId === equipped.typeId &&
          JSON.stringify(serializeRelicStack(existing)) ===
            JSON.stringify(serializeRelicStack(equipped));
        if (!same) {
          inv.setItem(i, equipped);
        }
      } else if (inv.getItem(i)) {
        inv.setItem(i, undefined);
      }
    } catch {
    }
  }
  for (let i = ACCESSORY_COUNT; i < inv.size; i++) {
    if (i === EXAMINE_SLOT || RITUAL_INPUT_SLOTS.includes(i)) continue;
    try {
      const junk = inv.getItem(i);
      if (junk) {
        inv.setItem(i, undefined);
        giveOrDrop(player, junk);
      }
    } catch {
    }
  }
}

function getUiMode(entity) {
  try {
    const m = entity.getDynamicProperty(MODE_PROP);
    if (m === "attune") return "attune";
  } catch {
  }
  try {
    if (entity.nameTag === ATTUNE_TITLE) return "attune";
  } catch {
  }
  return "equip";
}

function applyUiMode(entity, mode) {
  const next = mode === "attune" ? "attune" : "equip";
  try {
    entity.setDynamicProperty(MODE_PROP, next);
  } catch {
  }
  try {
    entity.nameTag = next === "attune" ? ATTUNE_TITLE : RELIQUARY_TITLE;
  } catch {
  }
}

function takeExamineStack(entity) {
  const inv = getContainer(entity);
  if (!inv) return undefined;
  try {
    const stack = inv.getItem(EXAMINE_SLOT);
    if (!stack) return undefined;
    inv.setItem(EXAMINE_SLOT, undefined);
    return stack;
  } catch {
    return undefined;
  }
}

function returnExamineToPlayer(player, entity) {
  const stack = takeExamineStack(entity);
  if (stack && player) giveOrDrop(player, stack);
  // Also return all leftover ritual materials.
  const inv = getContainer(entity);
  if (inv && player) {
    for (const slot of RITUAL_INPUT_SLOTS) {
      try {
        const input = inv.getItem(slot);
        if (input && input.typeId !== GAUGE_ID) {
          inv.setItem(slot, undefined);
          giveOrDrop(player, input);
        }
      } catch {
      }
    }
  }
}

function refreshExamineAfterTrain(player, entity, inv, sourceStack) {
  const stack = sourceStack ?? inv.getItem(EXAMINE_SLOT);
  if (!stack) return undefined;
  // Clear + replace with a fresh stack so Bedrock refreshes nameTag/lore/tooltip.
  const next = restampExamineStack(player, stack) ?? stack;
  try {
    inv.setItem(EXAMINE_SLOT, undefined);
  } catch {
  }
  try {
    inv.setItem(EXAMINE_SLOT, next);
  } catch {
    try {
      inv.setItem(EXAMINE_SLOT, stack);
    } catch {
    }
  }
  attuneActionBar(player, next);
  return next;
}

function consumeInput(inv, slot, amount) {
  const stack = inv.getItem(slot);
  if (!stack || stack.amount < amount) return false;
  if (stack.amount === amount) inv.setItem(slot, undefined);
  else {
    stack.amount -= amount;
    inv.setItem(slot, stack);
  }
  return true;
}

function ritualHint(player, sess, message) {
  const now = system.currentTick;
  if (now - (sess?.hintTick ?? -100) < 40) return;
  sessions.set(player.id, { ...(sessions.get(player.id) ?? sess), hintTick: now });
  try {
    player.onScreenDisplay.setActionBar(`${paint(Ink.purple, "Forge")} · ${message}`);
  } catch {
  }
}

/** Attunement Forge V3: two focus materials + Arcane Dust from your bag. */
function tryCatalystFeed(player, entity, sess) {
  if (!player || !entity || sess?.closing) return;
  if (!isAttunementEnabled(player)) return;
  if (getUiMode(entity) !== "attune") return;

  const inv = getContainer(entity);
  if (!inv) return;

  // Sweep legacy hidden gauge items out of the ritual slots and player bags.
  for (const slot of RITUAL_INPUT_SLOTS) {
    try {
      if (inv.getItem(slot)?.typeId === GAUGE_ID) inv.setItem(slot, undefined);
    } catch {
    }
  }
  stripGaugeFromPlayer(player);

  const examine = inv.getItem(EXAMINE_SLOT);
  const hasRelic = !!(examine && getRelicDef(examine.typeId));
  if (!hasRelic) return;

  let focusA;
  let focusB;
  try {
    focusA = inv.getItem(FOCUS_A_SLOT);
    focusB = inv.getItem(FOCUS_B_SLOT);
  } catch {
    return;
  }

  if (!focusA && !focusB) {
    if (sess?.ritualLocked) {
      sessions.set(player.id, { ...(sessions.get(player.id) ?? sess), ritualLocked: false });
    }
    return;
  }

  if (!focusA || !focusB) {
    if (sess?.ritualLocked) {
      sessions.set(player.id, { ...(sessions.get(player.id) ?? sess), ritualLocked: false });
    }
    ritualHint(player, sessions.get(player.id) ?? sess, "add both focus materials");
    return;
  }

  if (!FOCUS_IDS.has(focusA?.typeId) || !FOCUS_IDS.has(focusB?.typeId)) {
    ritualHint(player, sess, "add two different focus materials");
    return;
  }
  const group = groupForFocus(focusA.typeId, focusB.typeId);
  if (!group) {
    ritualHint(player, sess, "that focus pair has no attune path");
    return;
  }
  const shardCount = countPlayerItem(player, SHARD_ID);
  const rarity = ritualRarity(shardCount, focusA.amount, focusB.amount);
  if (!rarity) {
    ritualHint(player, sess, "Common needs 2 Arcane Dust in your bag + 1 of each focus");
    return;
  }
  if (sess?.ritualLocked) {
    ritualHint(player, sess, "remove and replace a focus to forge again");
    return;
  }

  const prog = getAttuneProgress(player, examine);
  const conflicts =
    prog.slots.length < prog.slotCap ? prog.slots : prog.slots.slice(1);
  const rolled = rollRitualAttunement(examine.typeId, group, rarity, conflicts);
  if (!rolled) {
    ritualHint(player, sess, "no compatible skill exists for this relic");
    return;
  }

  const cost = RITUAL_COSTS[rarity];
  // Consume focuses first, then shards — if shards fail, refund focuses.
  let tookA = false;
  let tookB = false;
  try {
    tookA = consumeInput(inv, FOCUS_A_SLOT, cost.focus);
    tookB = consumeInput(inv, FOCUS_B_SLOT, cost.focus);
    if (!tookA || !tookB) {
      if (tookA) givePlayerItem(player, focusA.typeId, cost.focus);
      if (tookB) givePlayerItem(player, focusB.typeId, cost.focus);
      ritualHint(player, sess, "ritual materials changed; try again");
      return;
    }
    if (!consumePlayerItem(player, SHARD_ID, cost.shards)) {
      givePlayerItem(player, focusA.typeId, cost.focus);
      givePlayerItem(player, focusB.typeId, cost.focus);
      ritualHint(player, sess, "need more Arcane Dust in your bag");
      return;
    }
  } catch {
    if (tookA) givePlayerItem(player, focusA.typeId, cost.focus);
    if (tookB) givePlayerItem(player, focusB.typeId, cost.focus);
    return;
  }

  const result = applyRolledAttunement(player, examine, rolled);
  if (!result) {
    ritualHint(player, sess, "could not save attunement; try again");
    return;
  }
  refreshExamineAfterTrain(player, entity, inv, examine);
  announceRoll(player, examine.typeId, result);
  sessions.set(player.id, {
    ...(sessions.get(player.id) ?? sess),
    ritualLocked: true,
    feedTick: system.currentTick,
  });
}

/** Examine bay (Attune UI only): keep relics; eject junk; refresh Attune info. */
function tryExamineBay(player, entity, sess) {
  if (!player || !entity || sess?.closing) return;
  if (getUiMode(entity) !== "attune") return;

  const inv = getContainer(entity);
  if (!inv) return;

  let stack;
  try {
    stack = inv.getItem(EXAMINE_SLOT);
  } catch {
    return;
  }
  if (!stack) {
    stripGaugeFromPlayer(player);
    if (sess?.examineId) {
      sessions.set(player.id, { ...sess, examineId: undefined });
    }
    return;
  }

  const def = getRelicDef(stack.typeId);
  if (!def) {
    try {
      inv.setItem(EXAMINE_SLOT, undefined);
    } catch {
    }
    stripGaugeFromPlayer(player);
    giveOrDrop(player, stack);
    try {
      player.sendMessage(`${paint(Ink.dim, "Forge:")} only relics go in this bay.`);
    } catch {
    }
    return;
  }

  const changed = syncExamineRelic(player, stack);
  if (changed) {
    const next = restampExamineStack(player, stack) ?? stack;
    try {
      inv.setItem(EXAMINE_SLOT, undefined);
      inv.setItem(EXAMINE_SLOT, next);
    } catch {
      try {
        inv.setItem(EXAMINE_SLOT, stack);
      } catch {
      }
    }
  }

  const prog = getAttuneProgress(player, stack);
  if (sess?.examineId !== prog.instanceId || changed) {
    sessions.set(player.id, { ...(sessions.get(player.id) ?? sess), examineId: prog.instanceId });
    attuneActionBar(player, stack);
  }
}

export function pullReliquaryToEquipped(player, entity) {
  const inv = getContainer(entity);
  if (!inv) return false;
  let changed = false;
  const opts = loreOptsForPlayer(player);

  for (let i = 0; i < ACCESSORY_COUNT; i++) {
    let stack;
    try {
      stack = inv.getItem(i);
    } catch {
      continue;
    }
    if (!stack) continue;

    const def = getRelicDef(stack.typeId);
    if (!def) continue;

    const slot = WARDROBE_SLOT_ORDER[i];
    const wrong = !matchesSlot(def, slot);
    const overflow =
      slot.startsWith("trinket") ||
      (slot.startsWith("charm") && def.slot !== "charm" && def.slot !== "any");

    let dest = -1;
    if (wrong) {
      dest = findEmptyMatchingIndex(inv, def, i);
    } else if (overflow && def.slot !== "any") {
      dest = findEmptyPrimaryIndex(inv, def, i);
    } else {
      continue;
    }
    if (dest < 0 || dest === i) continue;
    try {
      inv.setItem(i, undefined);
      inv.setItem(dest, loreStack(stack, opts));
      changed = true;
    } catch {
    }
  }

  for (let i = 0; i < ACCESSORY_COUNT; i++) {
    const slot = WARDROBE_SLOT_ORDER[i];
    let stack;
    try {
      stack = inv.getItem(i);
    } catch {
      continue;
    }

    if (!stack) {
      if (getEquipped(player, slot)) {
        setEquippedStack(player, slot, undefined, { sync: false });
        changed = true;
      }
      continue;
    }

    const def = getRelicDef(stack.typeId);
    if (!def || !matchesSlot(def, slot)) {
      try {
        inv.setItem(i, undefined);
      } catch {
      }
      giveOrDrop(player, stack);
      changed = true;
      continue;
    }

    if (stack.amount > 1) {
      const extra = stack.clone();
      extra.amount = stack.amount - 1;
      stack.amount = 1;
      stampLore(stack, opts);
      try {
        inv.setItem(i, stack);
      } catch {
      }
      giveOrDrop(player, extra);
      changed = true;
    } else if (stampLore(stack, opts)) {
      try {
        inv.setItem(i, stack);
      } catch {
      }
      changed = true;
    }

    const equipped = getEquippedStack(player, slot);
    const same =
      equipped?.typeId === stack.typeId &&
      JSON.stringify(serializeRelicStack(equipped)) ===
        JSON.stringify(serializeRelicStack(stack));
    if (!same) {
      setEquippedStack(player, slot, stack, { sync: false });
      changed = true;
    }
  }

  // Avoid title spam every pull — only when loadout actually changed.
  if (changed) syncCurioUi(player);
  return changed;
}

function findEmptyMatchingIndex(inv, def, skip = -1) {
  const ranked = [];
  for (let i = 0; i < ACCESSORY_COUNT; i++) {
    if (i === skip) continue;
    const slot = WARDROBE_SLOT_ORDER[i];
    if (!matchesSlot(def, slot)) continue;
    let rank = 2;
    if (def.slot === slot) rank = 0;
    else if (def.slot === "feet" && slot.startsWith("feet")) rank = 0;
    else if (def.slot === "hands" && slot.startsWith("hands")) rank = 0;
    else if (def.slot === "charm" && slot.startsWith("charm")) rank = 0;
    else if (def.slot === "any") rank = 1;
    else if (slot.startsWith("trinket")) rank = 3;
    else if (slot.startsWith("charm") && def.slot !== "charm") rank = 3;
    else rank = 1;
    ranked.push({ i, rank });
  }
  ranked.sort((a, b) => a.rank - b.rank || a.i - b.i);

  for (const { i } of ranked) {
    try {
      if (!inv.getItem(i)) return i;
    } catch {
    }
  }
  return -1;
}

function findEmptyPrimaryIndex(inv, def, skip = -1) {
  for (let i = 0; i < ACCESSORY_COUNT; i++) {
    if (i === skip) continue;
    const slot = WARDROBE_SLOT_ORDER[i];
    if (slot.startsWith("trinket")) continue;
    if (slot.startsWith("charm") && def.slot !== "charm") continue;
    if (!matchesSlot(def, slot)) continue;
    try {
      if (!inv.getItem(i)) return i;
    } catch {
    }
  }
  return -1;
}

function endSession(player, entity, opts = {}) {
  const soft = !!opts.softKeepEntity;
  if (player) {
    const prev = sessions.get(player.id);
    if (prev?.closing && !soft) return;
    if (soft) return;
    sessions.set(player.id, {
      entityId: prev?.entityId ?? entity?.id,
      opened: true,
      born: prev?.born ?? system.currentTick,
      closing: true,
    });
  }

  if (entity && player) {
    try {
      returnExamineToPlayer(player, entity);
    } catch {
    }
    try {
      stripGaugeFromPlayer(player);
    } catch {
    }
    try {
      pullReliquaryToEquipped(player, entity);
    } catch {
    }
  }

  if (player) {
    try {
      clearCurioTitleLeak(player);
    } catch {
    }
  }

  if (entity) {
    try {
      entity.nameTag = "";
    } catch {
    }
    destroyEntity(entity);
  }

  if (player) sessions.delete(player.id);
}

function clearPlayerPortable(player) {
  try {
    for (const e of player.dimension.getEntities({ type: RELIQUARY_ID })) {
      if (ownerOf(e) === player.id && isTemp(e)) {
        try {
          returnExamineToPlayer(player, e);
        } catch {
        }
        try {
          pullReliquaryToEquipped(player, e);
        } catch {
        }
        destroyEntity(e);
      }
    }
  } catch {
  }
  sessions.delete(player.id);
}

export function scrubOrphanReliquaries() {
  const keep = new Set();
  for (const s of sessions.values()) {
    if (s?.entityId && !s.closing) keep.add(s.entityId);
  }
  const dims = ["overworld", "nether", "the_end"];
  for (const id of dims) {
    try {
      const dim = world.getDimension(id);
      for (const e of dim.getEntities({ type: RELIQUARY_ID })) {
        if (keep.has(e.id)) continue;
        const ownerId = ownerOf(e);
        let owner;
        if (ownerId) {
          for (const p of world.getPlayers()) {
            if (p.id === ownerId) {
              owner = p;
              break;
            }
          }
        }
        if (owner) {
          try {
            returnExamineToPlayer(owner, e);
          } catch {
          }
          try {
            returnForgeBayToPlayer(owner, e);
          } catch {
          }
          try {
            pullReliquaryToEquipped(owner, e);
          } catch {
          }
          destroyEntity(e, { dropForgeBay: false });
        } else {
          // No online owner — drop bay/focus only; equipment slots already live on player DPs.
          destroyEntity(e, { dropForgeBay: true });
        }
      }
    } catch {
    }
  }
}

function sparkle(player, loc) {
  try {
    player.dimension.spawnParticle("minecraft:villager_happy", {
      x: loc.x,
      y: loc.y + 0.4,
      z: loc.z,
    });
  } catch {
  }
  try {
    player.playSound("random.orb", { location: loc, volume: 0.35, pitch: 1.2 });
  } catch {
  }
}

/**
 * @param {{ mode?: "equip"|"attune", location?: {x,y,z}, reuse?: boolean }} [opts]
 * `location` spawns the session chest somewhere other than the player's feet
 * (e.g. on top of the Forge anvil). `reuse` keeps an existing live session
 * instead of respawning, so repeat block taps don't reset the bay.
 */
export function spawnReliquary(player, opts = {}) {
  const wantMode =
    opts.mode === "attune" && isAttunementEnabled(player) ? "attune" : "equip";
  const loc = opts.location ?? {
    x: player.location.x,
    y: player.location.y + 0.1,
    z: player.location.z,
  };

  if (opts.reuse) {
    try {
      for (const e of player.dimension.getEntities({ type: RELIQUARY_ID })) {
        if (ownerOf(e) !== player.id || !isTemp(e)) continue;
        // Only reuse a chest that already matches the requested mode AND is near
        // the intended spawn (so an open Reliquary at your feet never becomes
        // the Forge UI, and a handheld Forge chest isn't left stranded).
        if (getUiMode(e) !== wantMode) continue;
        if (opts.location && dist2(e.location, loc) > 4) continue;
        applyUiMode(e, wantMode);
        const prev = sessions.get(player.id);
        sessions.set(player.id, {
          entityId: e.id,
          opened: prev?.opened ?? false,
          born: prev?.born ?? system.currentTick,
          mode: wantMode,
          lastLoc: prev?.lastLoc,
          ritualLocked: prev?.ritualLocked,
          examineId: prev?.examineId,
        });
        return e;
      }
    } catch {
    }
  }
  clearPlayerPortable(player);

  let entity;
  try {
    entity = player.dimension.spawnEntity(RELIQUARY_ID, loc);
  } catch (err) {
    try {
      player.sendMessage(`§cCould not open Reliquary: ${err}`);
    } catch {
    }
    return undefined;
  }

  applyUiMode(entity, wantMode);
  try {
    entity.setDynamicProperty(OWNER_PROP, player.id);
    entity.setDynamicProperty(TEMP_PROP, true);
  } catch {
  }

  refreshPlayerRelicLore(player);
  pushEquippedToReliquary(player, entity);
  sessions.set(player.id, {
    entityId: entity.id,
    opened: false,
    born: system.currentTick,
    mode: wantMode,
  });

  sparkle(player, loc);

  try {
    if (!player.getDynamicProperty("relics:tip_reliquary")) {
      player.setDynamicProperty("relics:tip_reliquary", true);
      player.sendMessage(
        "§7Reliquary ready — interact to open your wardrobe. Use the §dAttunement Forge§r to attune."
      );
    }
  } catch {
  }

  return entity;
}

/** Open Reliquary on the separate Attunement Forge JSON UI. */
export function spawnAttuneReliquary(player, opts = {}) {
  if (player && !isAttunementEnabled(player)) {
    try {
      player.sendMessage(
        "§8Attunement is disabled in Relic Tome settings (Relics-only mode)."
      );
    } catch {
    }
    return spawnReliquary(player, { ...opts, mode: "equip" });
  }
  const entity = spawnReliquary(player, { ...opts, mode: "attune" });
  try {
    if (player && !player.getDynamicProperty("relics:tip_attune")) {
      player.setDynamicProperty("relics:tip_attune", true);
      player.sendMessage(
        "§dAttunement Forge§r — tap the forge chest to open it. Relic + two focuses; shards come from your bag."
      );
    }
  } catch {
  }
  return entity;
}

function packAway(player, entity) {
  const temp = isTemp(entity);
  endSession(player, entity);
  if (!temp) {
    giveOrDrop(player, RELIQUARY_ITEM);
    try {
      player.sendMessage("§7Reliquary packed away.");
    } catch {
    }
  }
}

function safeSub(signal, handler) {
  if (signal && typeof signal.subscribe === "function") signal.subscribe(handler);
}

export function registerReliquary() {
  // Logout while Reliquary/Forge is open — flush equipped relics first (never wipe).
  safeSub(world.beforeEvents?.playerLeave, (ev) => {
    const player = ev.player;
    if (!player) return;
    try {
      flushReliquarySession(player);
    } catch {
      const sess = sessions.get(player.id);
      if (sess?.entityId) {
        const entity = findEntityById(player.dimension, sess.entityId);
        if (entity) {
          try {
            pullReliquaryToEquipped(player, entity);
          } catch {
          }
          try {
            destroyEntity(entity, { dropForgeBay: true });
          } catch {
          }
        }
        sessions.delete(player.id);
      }
    }
  });

  safeSub(world.beforeEvents?.playerInteractWithEntity, (ev) => {
    if (ev.target?.typeId !== RELIQUARY_ID) return;
    const player = ev.player;
    const entity = ev.target;
    const owner = ownerOf(entity);

    if (owner && owner !== player.id) {
      ev.cancel = true;
      system.run(() => {
        try {
          player.sendMessage("§cThat Reliquary isn't yours.");
        } catch {
        }
      });
      return;
    }

    if (player.isSneaking) {
      ev.cancel = true;
      system.run(() => packAway(player, entity));
      return;
    }

    // Restricted before-event: defer all writes (owner/mode/push/session).
    system.run(() => {
      if (!owner) {
        try {
          entity.setDynamicProperty(OWNER_PROP, player.id);
        } catch {
        }
      }
      const prev = sessions.get(player.id);
      const wantAttune =
        isAttunementEnabled(player) &&
        (prev?.mode === "attune" || getUiMode(entity) === "attune");
      const mode = wantAttune ? "attune" : "equip";
      applyUiMode(entity, mode);
      pushEquippedToReliquary(player, entity);
      sessions.set(player.id, {
        entityId: entity.id,
        opened: true,
        born: prev?.born ?? system.currentTick,
        mode,
        lastLoc: {
          x: player.location.x,
          y: player.location.y,
          z: player.location.z,
        },
      });
    });
  });

  safeSub(world.afterEvents?.entityContainerOpened, (ev) => {
    if (ev.entity?.typeId !== RELIQUARY_ID) return;
    const src = ev.openSource?.entity;
    const player =
      src?.typeId === "minecraft:player" ? src : playerForEntity(ev.entity);
    if (!player) return;
    const prev = sessions.get(player.id);
    const wantAttune =
      isAttunementEnabled(player) &&
      (prev?.mode === "attune" || getUiMode(ev.entity) === "attune");
    const mode = wantAttune ? "attune" : "equip";
    applyUiMode(ev.entity, mode);
    sessions.set(player.id, {
      entityId: ev.entity.id,
      opened: true,
      born: prev?.born ?? system.currentTick,
      mode,
      lastLoc: prev?.lastLoc ?? {
        x: player.location.x,
        y: player.location.y,
        z: player.location.z,
      },
    });
  });

  safeSub(world.afterEvents?.entityContainerClosed, (ev) => {
    if (ev.entity?.typeId !== RELIQUARY_ID) return;
    const src = ev.closeSource?.entity;
    const player =
      src?.typeId === "minecraft:player" ? src : playerForEntity(ev.entity);

    if (!isTemp(ev.entity)) {
      if (player) {
        try {
          returnExamineToPlayer(player, ev.entity);
        } catch {
        }
        try {
          pullReliquaryToEquipped(player, ev.entity);
        } catch {
        }
      }
      return;
    }
    endSession(player, ev.entity);
  });

  safeSub(world.afterEvents?.playerButtonInput, (ev) => {
    const state = String(ev.newButtonState ?? "");
    if (state !== "Pressed") return;
    if (String(ev.button ?? "") !== "Jump") return;
    const sess = sessions.get(ev.player.id);
    if (!sess?.opened || sess.closing) return;
    const entity = findEntityById(ev.player.dimension, sess.entityId);
    if (entity && isTemp(entity)) endSession(ev.player, entity);
  });

  const hasCloseEvent = !!(
    world.afterEvents?.entityContainerClosed &&
    typeof world.afterEvents.entityContainerClosed.subscribe === "function"
  );

  system.runInterval(() => {
    const now = system.currentTick;
    for (const player of world.getPlayers()) {
      const sess = sessions.get(player.id);
      if (!sess || sess.closing) continue;

      const entity = findEntityById(player.dimension, sess.entityId);
      if (!entity) {
        sessions.delete(player.id);
        continue;
      }

      const temp = isTemp(entity);

      if (temp && !sess.opened && now - sess.born >= IDLE_TICKS) {
        endSession(player, entity);
        continue;
      }

      // Don't yank the Forge out from under an open ritual session.
      if (temp && !sess.opened && dist2(player.location, entity.location) > MAX_AWAY2) {
        endSession(player, entity);
        continue;
      }

      if (temp && sess.opened && !hasCloseEvent) {
        let moving = false;
        if (sess.lastLoc && dist2(player.location, sess.lastLoc) > 0.01) moving = true;
        try {
          const v = player.getVelocity?.();
          if (v && Math.abs(v.x) + Math.abs(v.y) + Math.abs(v.z) > 0.02) moving = true;
        } catch {
        }
        if (moving) {
          endSession(player, entity);
          continue;
        }
      }

      // Interval is already 5 ticks — sync loadout every pass; bay/examine half as often.
      try {
        pullReliquaryToEquipped(player, entity);
      } catch {
      }
      const live = sessions.get(player.id) ?? sess;
      const n = (live.uiTick = (live.uiTick ?? 0) + 1);
      sessions.set(player.id, live);
      if (n % 2 === 0) {
        try {
          tryCatalystFeed(player, entity, live);
        } catch {
        }
        try {
          tryExamineBay(player, entity, sessions.get(player.id) ?? live);
        } catch {
        }
      }
    }
  }, 5);
}
