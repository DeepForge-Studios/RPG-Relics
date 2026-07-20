import { ItemStack } from "@minecraft/server";
import { SLOTS, getRelicDef, matchesSlot } from "./registry.js";
import { loreLinesForItem, loreOptsForPlayer } from "./descriptions.js";
import { syncCurioUi } from "./ui_sync.js";

const PROP = "relics:slot_";

const LEGACY_CURIO = {
  head: 27,
  necklace: 28,
  belt: 29,
  hands: 30,
  feet: 31,
};

export { SLOTS };

function getInv(player) {
  return player.getComponent("minecraft:inventory")?.container;
}

function encodeDynamicValue(value) {
  if (
    value == null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (
    typeof value === "object" &&
    Number.isFinite(value.x) &&
    Number.isFinite(value.y) &&
    Number.isFinite(value.z)
  ) {
    return { x: value.x, y: value.y, z: value.z };
  }
  return undefined;
}

/** Serialize the player-visible and dynamic state carried by a relic ItemStack. */
export function serializeRelicStack(stack) {
  if (!stack?.typeId) return undefined;
  const data = { id: stack.typeId };
  try {
    if (stack.nameTag) data.nameTag = stack.nameTag;
  } catch {
  }
  try {
    const lore = stack.getLore?.() ?? [];
    if (lore.length) data.lore = lore;
  } catch {
  }
  try {
    const dynamic = {};
    for (const id of stack.getDynamicPropertyIds?.() ?? []) {
      const value = encodeDynamicValue(stack.getDynamicProperty(id));
      if (value !== undefined) dynamic[id] = value;
    }
    if (Object.keys(dynamic).length) data.dynamic = dynamic;
  } catch {
  }
  return data;
}

/** Rebuild one non-stackable relic from equipped-slot storage. */
export function deserializeRelicStack(data) {
  if (!data) return undefined;
  const row = typeof data === "string" ? { id: data } : data;
  if (typeof row.id !== "string" || !getRelicDef(row.id)) return undefined;
  try {
    const stack = new ItemStack(row.id, 1);
    if (typeof row.nameTag === "string") stack.nameTag = row.nameTag;
    if (Array.isArray(row.lore)) stack.setLore(row.lore);
    if (row.dynamic && typeof row.dynamic === "object") {
      for (const [id, value] of Object.entries(row.dynamic)) {
        try {
          stack.setDynamicProperty(id, value);
        } catch {
        }
      }
    }
    return stack;
  } catch {
    return undefined;
  }
}

function readEquippedData(player, slot) {
  const raw = player.getDynamicProperty(PROP + slot);
  if (typeof raw !== "string" || !raw) return undefined;
  if (!raw.startsWith("{")) return { id: raw };
  try {
    const data = JSON.parse(raw);
    return typeof data?.id === "string" ? data : undefined;
  } catch {
    return undefined;
  }
}

export function stampLore(stack, opts) {
  if (!stack?.typeId?.startsWith("relics:")) return stack;
  const def = getRelicDef(stack.typeId);
  const lines = loreLinesForItem(stack.typeId, def, opts);
  if (!lines.length) return stack;
  try {
    // Keep display name stable — attune status lives in Forge UI / action bar.
    if (stack.nameTag) stack.nameTag = undefined;
  } catch {
    try {
      if (stack.nameTag) stack.nameTag = "";
    } catch {
    }
  }
  try {
    const current = typeof stack.getLore === "function" ? stack.getLore() : [];
    if (current.length === lines.length && current.every((l, i) => l === lines[i])) {
      return stack;
    }
    stack.setLore(lines);
  } catch {
  }
  return stack;
}

export function stampContainerRelics(block) {
  const inv = block?.getComponent?.("minecraft:inventory")?.container;
  if (!inv) return 0;
  let n = 0;
  for (let i = 0; i < inv.size; i++) {
    const stack = inv.getItem(i);
    if (!stack?.typeId?.startsWith("relics:")) continue;
    try {
      const before = typeof stack.getLore === "function" ? stack.getLore() : [];
      stampLore(stack);
      const after = typeof stack.getLore === "function" ? stack.getLore() : [];
      if (
        before.length !== after.length ||
        before.some((line, idx) => line !== after[idx])
      ) {
        inv.setItem(i, stack);
        n++;
      }
    } catch {
    }
  }
  return n;
}

export function makeRelicStack(typeId, opts) {
  return stampLore(new ItemStack(typeId, 1), opts);
}

function giveOrDrop(player, itemIdOrStack) {
  const inv = getInv(player);
  if (!inv) return;
  const opts = loreOptsForPlayer(player);
  const stack =
    typeof itemIdOrStack === "string"
      ? stampLore(new ItemStack(itemIdOrStack, 1), opts)
      : stampLore(itemIdOrStack, opts);
  const leftover = inv.addItem(stack);
  if (leftover) {
    player.dimension.spawnItem(leftover, player.location);
  }
}

export function getEquipped(player, slot) {
  return readEquippedData(player, slot)?.id;
}

export function setEquipped(player, slot, itemId) {
  if (!itemId) {
    player.setDynamicProperty(PROP + slot, undefined);
  } else {
    const stack = makeRelicStack(itemId, loreOptsForPlayer(player));
    const data = serializeRelicStack(stack);
    player.setDynamicProperty(PROP + slot, JSON.stringify(data));
  }
  syncCurioUi(player);
}

export function getEquippedStack(player, slot) {
  return deserializeRelicStack(readEquippedData(player, slot));
}

export function setEquippedStack(player, slot, stack, opts = {}) {
  if (!stack) {
    player.setDynamicProperty(PROP + slot, undefined);
  } else {
    const data = serializeRelicStack(stack);
    if (!data) return;
    player.setDynamicProperty(PROP + slot, JSON.stringify(data));
  }
  if (opts.sync !== false) syncCurioUi(player);
}

export function getEquippedAll(player) {
  const out = [];
  for (const slot of SLOTS) {
    const stack = getEquippedStack(player, slot);
    const itemId = stack?.typeId;
    if (!stack || !itemId) continue;
    const def = getRelicDef(itemId);
    if (def) out.push({ slot, itemId, def, stack });
  }
  return out;
}

export function findEquippableInInventory(player, slot) {
  const inv = getInv(player);
  if (!inv) return [];

  const results = [];
  for (let i = 0; i < inv.size; i++) {
    const stack = inv.getItem(i);
    if (!stack) continue;
    const def = getRelicDef(stack.typeId);
    if (def && matchesSlot(def, slot)) {
      results.push({
        itemId: stack.typeId,
        containerSlotIndex: i,
        displayName: def.displayName,
      });
    }
  }
  return results;
}

export function listCarriedRelics(player) {
  const inv = getInv(player);
  if (!inv) return [];

  const results = [];
  for (let i = 0; i < inv.size; i++) {
    const stack = inv.getItem(i);
    if (!stack?.typeId?.startsWith("relics:")) continue;
    const def = getRelicDef(stack.typeId);
    if (!def) continue;
    results.push({
      itemId: stack.typeId,
      containerSlotIndex: i,
      displayName: def.displayName,
      slot: def.slot,
      def,
    });
  }
  return results;
}

export function refreshInventoryLore(player) {
  const inv = getInv(player);
  if (!inv) return;
  const opts = loreOptsForPlayer(player);
  for (let i = 0; i < inv.size; i++) {
    const stack = inv.getItem(i);
    if (!stack?.typeId?.startsWith("relics:")) continue;
    const stamped = stampLore(stack, opts);
    try {
      inv.setItem(i, stamped);
    } catch {
    }
  }
}

/** Re-stamp lore on equipped Reliquary slots (DP storage) for current settings. */
export function refreshEquippedLore(player) {
  if (!player) return;
  const opts = loreOptsForPlayer(player);
  let changed = false;
  for (const slot of SLOTS) {
    const stack = getEquippedStack(player, slot);
    if (!stack?.typeId?.startsWith("relics:")) continue;
    const before = typeof stack.getLore === "function" ? stack.getLore() : [];
    stampLore(stack, opts);
    const after = typeof stack.getLore === "function" ? stack.getLore() : [];
    const same =
      before.length === after.length && before.every((l, i) => l === after[i]);
    if (!same) {
      setEquippedStack(player, slot, stack, { sync: false });
      changed = true;
    }
  }
  if (changed) syncCurioUi(player);
}

/** Inventory + equipped relics — call after Affinity/Attunement settings toggle. */
export function refreshPlayerRelicLore(player) {
  refreshInventoryLore(player);
  refreshEquippedLore(player);
}

export function migrateLegacyCurioSlots(player) {
  const inv = getInv(player);
  if (!inv) return;

  for (const slot of SLOTS) {
    const idx = LEGACY_CURIO[slot];
    if (idx == null) continue;
    const stack = inv.getItem(idx);
    if (!stack) continue;

    const def = getRelicDef(stack.typeId);
    const dp = getEquipped(player, slot);

    if (def && matchesSlot(def, slot) && !dp) {
      const equipped = stack.clone();
      equipped.amount = 1;
      setEquippedStack(player, slot, equipped);
      inv.setItem(idx, undefined);
      if (stack.amount > 1) {
        const extra = stack.clone();
        extra.amount = stack.amount - 1;
        giveOrDrop(player, extra);
      }
    } else {
      inv.setItem(idx, undefined);
      giveOrDrop(player, stack);
    }
  }

  for (let i = 32; i <= 35; i++) {
    const stack = inv.getItem(i);
    if (!stack) continue;
    inv.setItem(i, undefined);
    giveOrDrop(player, stack);
  }
}

export function syncCurioContainers(player) {
  migrateLegacyCurioSlots(player);
  try {
    const oldHands = player.getDynamicProperty(PROP + "hands");
    if (typeof oldHands === "string" && !getEquipped(player, "hands_left")) {
      setEquipped(player, "hands_left", oldHands);
      player.setDynamicProperty(PROP + "hands", undefined);
    }
    const oldFeet = player.getDynamicProperty(PROP + "feet");
    if (typeof oldFeet === "string" && !getEquipped(player, "feet_left")) {
      setEquipped(player, "feet_left", oldFeet);
      player.setDynamicProperty(PROP + "feet", undefined);
    }
  } catch {
  }
}

export function unequip(player, slot) {
  const current = getEquippedStack(player, slot);
  if (!current) return;
  setEquippedStack(player, slot, undefined);
  giveOrDrop(player, current);
}

export function equipFromInventory(player, slot, containerSlotIndex) {
  const inv = getInv(player);
  if (!inv) return;

  const incoming = inv.getItem(containerSlotIndex);
  if (!incoming) return;

  const def = getRelicDef(incoming.typeId);
  if (!def || !matchesSlot(def, slot)) return;

  unequip(player, slot);
  const equipped = incoming.clone();
  equipped.amount = 1;
  setEquippedStack(player, slot, equipped);

  if (incoming.amount > 1) {
    incoming.amount -= 1;
    inv.setItem(containerSlotIndex, incoming);
  } else {
    inv.setItem(containerSlotIndex, undefined);
  }
}

export function equipCarriedRelic(player, containerSlotIndex, slotOverride) {
  const inv = getInv(player);
  if (!inv) return false;
  const stack = inv.getItem(containerSlotIndex);
  if (!stack) return false;
  const def = getRelicDef(stack.typeId);
  if (!def) return false;

  let slot = slotOverride && matchesSlot(def, slotOverride) ? slotOverride : undefined;
  if (!slot) {
    if (def.slot === "any") {
      slot = SLOTS.find((s) => !getEquipped(player, s));
    } else if (def.slot === "hands") {
      slot = !getEquipped(player, "hands_left")
        ? "hands_left"
        : !getEquipped(player, "hands_right")
          ? "hands_right"
          : "hands_left";
    } else if (def.slot === "feet") {
      slot = !getEquipped(player, "feet_left")
        ? "feet_left"
        : !getEquipped(player, "feet_right")
          ? "feet_right"
          : "feet_left";
    } else if (def.slot === "ring") {
      slot = !getEquipped(player, "ring")
        ? "ring"
        : SLOTS.find((s) => s.startsWith("trinket") && !getEquipped(player, s)) ?? "ring";
    } else if (def.slot === "charm") {
      slot = !getEquipped(player, "charm0")
        ? "charm0"
        : !getEquipped(player, "charm1")
          ? "charm1"
          : !getEquipped(player, "charm2")
            ? "charm2"
            : SLOTS.find((s) => s.startsWith("trinket") && !getEquipped(player, s)) ?? "charm0";
    } else {
      slot = def.slot;
      if (slot && getEquipped(player, slot)) {
        const overflow = SLOTS.find((s) => s.startsWith("trinket") && !getEquipped(player, s));
        if (overflow) slot = overflow;
      }
    }
  }

  if (!slot || !SLOTS.includes(slot)) return false;
  if (!matchesSlot(def, slot)) return false;
  equipFromInventory(player, slot, containerSlotIndex);
  return true;
}

export function getSlotSummary(player) {
  return SLOTS.map((slot) => {
    const itemId = getEquipped(player, slot);
    return {
      slot,
      itemId,
      displayName: itemId ? getRelicDef(itemId)?.displayName : undefined,
    };
  });
}
