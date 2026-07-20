/**
 * Dev-only Relic Test Bench. Not for public players.
 *
 * Unlock (Creative + operator + secret message):
 *   /scriptevent relics:__qa curio-forge
 *
 * Wrong/missing secret → silent no-op (no chat hint).
 */
import { ItemStack, GameMode } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { getRelicDef, RELIC_REGISTRY } from "./registry.js";
import { RELIC_UPGRADES } from "./upgrades.js";
import {
  FOCUS_RECIPES,
  SHARD_ID,
  POOL,
  GROUP_ORDER,
  GROUP_LABELS,
  RARITY,
  RARITY_ORDER,
  groupInk,
} from "./attune_pool.js";
import {
  debugMaxAttune,
  debugStampAttune,
  getAttuneProgress,
  MAX_LEVEL,
} from "./attune_data.js";
import {
  debugGrantResources,
  debugClearCooldowns,
  debugForceActivate,
} from "./attune_runtime.js";
import { equipCarriedRelic } from "./relics.js";
import { Ink, paint, uiAccentTitle, uiBack, uiClose, uiMuted } from "./theme.js";

/** Obscure scriptevent id — not listed in player-facing docs. */
export const TEST_BENCH_EVENT = "relics:__qa";
/** Required message body. Change this anytime before a public build. */
export const TEST_BENCH_SECRET = "curio-forge";

/** Base relics safe to duplicate as one-skill test copies. */
const KIT_RELIC_IDS = Object.keys(RELIC_REGISTRY);

function isCreative(player) {
  try {
    return player.getGameMode() === GameMode.Creative;
  } catch {
    return false;
  }
}

function isOperator(player) {
  try {
    if (typeof player.isOp === "function") return !!player.isOp();
  } catch {
  }
  // Older builds may lack isOp — secret + creative still required.
  return true;
}

/**
 * Silent gate: secret message + Creative + operator.
 * Returns false without messaging (so the command stays undiscoverable).
 */
export function canAccessTestBench(player, message = "") {
  if (!player) return false;
  if (String(message).trim() !== TEST_BENCH_SECRET) return false;
  if (!isCreative(player)) return false;
  if (!isOperator(player)) return false;
  return true;
}

/** Session unlock after a successful secret open (form reopens skip the message). */
const unlocked = new Set();

function stillAllowed(player) {
  if (!player || !unlocked.has(player.id)) return false;
  if (!isCreative(player) || !isOperator(player)) {
    unlocked.delete(player.id);
    return false;
  }
  return true;
}

function inventory(player) {
  return player.getComponent("minecraft:inventory")?.container;
}

function heldRelic(player) {
  const inv = inventory(player);
  const slot = player.selectedSlotIndex;
  const stack = inv?.getItem(slot);
  if (!stack || !getRelicDef(stack.typeId)) return undefined;
  return { inv, slot, stack, def: getRelicDef(stack.typeId) };
}

function giveMaterials(player) {
  const inv = inventory(player);
  if (!inv) return;
  const ids = new Set([SHARD_ID, ...Object.values(FOCUS_RECIPES).flat()]);
  for (const id of ids) {
    try {
      inv.addItem(new ItemStack(id, id === SHARD_ID ? 32 : 16));
    } catch {
    }
  }
  player.sendMessage(paint(Ink.good, "Test Bench: ritual materials added."));
}

function maxHeldRelic(player) {
  const held = heldRelic(player);
  if (!held) {
    player.sendMessage(paint(Ink.bad, "Test Bench: hold a relic in your main hand first."));
    return;
  }
  const next = debugMaxAttune(player, held.stack);
  if (!next) {
    player.sendMessage(paint(Ink.bad, "Test Bench: could not update that relic."));
    return;
  }
  held.inv.setItem(held.slot, next);
  const prog = getAttuneProgress(player, next);
  const note = prog.slots.length
    ? `now Lv ${MAX_LEVEL} — all tiers unlocked.`
    : `now Lv ${MAX_LEVEL}, but no skill yet — use Stamp Skill.`;
  player.sendMessage(paint(Ink.good, `Test Bench: held relic ${note}`));
}

function grantResources(player) {
  const r = debugGrantResources(player);
  player.sendMessage(
    paint(
      Ink.good,
      `Test Bench: resources filled — Souls ${r.souls}/3 · Notes ${r.notes}/3 · Rumors ${r.rumors}/5`
    )
  );
}

function clearCooldowns(player) {
  debugClearCooldowns(player);
  player.sendMessage(paint(Ink.good, "Test Bench: all attunement cooldowns cleared."));
}

function fireActiveNow(player) {
  const name = debugForceActivate(player);
  if (name) {
    player.sendMessage(paint(Ink.good, `Test Bench: fired ${name}.`));
  } else {
    player.sendMessage(
      paint(
        Ink.bad,
        "Test Bench: nothing fired. Equip an attuned relic (Stamp Skill → Equip Held), then try again."
      )
    );
  }
}

function equipHeld(player) {
  const held = heldRelic(player);
  if (!held) {
    player.sendMessage(paint(Ink.bad, "Test Bench: hold a relic in your main hand first."));
    return;
  }
  const ok = equipCarriedRelic(player, held.slot);
  player.sendMessage(
    ok
      ? paint(Ink.good, `Test Bench: equipped ${held.def.displayName}.`)
      : paint(Ink.bad, "Test Bench: could not equip that relic (no matching free slot?).")
  );
}

function spawnHostiles(player) {
  const loc = player.location;
  const dim = player.dimension;
  let spawned = 0;
  for (const [dx, dz, type] of [
    [2, 0, "minecraft:zombie"],
    [-2, 0, "minecraft:skeleton"],
    [0, 2, "minecraft:zombie"],
  ]) {
    try {
      dim.spawnEntity(type, { x: loc.x + dx, y: loc.y, z: loc.z + dz });
      spawned += 1;
    } catch {
    }
  }
  player.sendMessage(
    spawned
      ? paint(Ink.good, `Test Bench: spawned ${spawned} hostiles nearby.`)
      : paint(Ink.bad, "Test Bench: could not spawn hostiles here.")
  );
}

/** One base relic per primary wardrobe job (face/head/necklace/…). */
function giveStarterRelics(player) {
  const inv = inventory(player);
  if (!inv) return;
  const bySlot = new Map();
  for (const [id, def] of Object.entries(RELIC_REGISTRY)) {
    if (!def?.slot || bySlot.has(def.slot)) continue;
    bySlot.set(def.slot, id);
  }
  let n = 0;
  for (const id of bySlot.values()) {
    try {
      inv.addItem(new ItemStack(id, 1));
      n += 1;
    } catch {
    }
  }
  player.sendMessage(paint(Ink.good, `Test Bench: gave ${n} starter relics (one per slot type).`));
}

function giveAscendedRelics(player) {
  const inv = inventory(player);
  if (!inv) return;
  let n = 0;
  for (const u of RELIC_UPGRADES) {
    try {
      inv.addItem(new ItemStack(u.id, 1));
      n += 1;
    } catch {
    }
  }
  player.sendMessage(paint(Ink.good, `Test Bench: gave ${n} Ascended relics.`));
}

/**
 * 32 relics — one per attunement skill, each Epic (Powers IV).
 * NameTag shows the skill so you can find them in the bag.
 */
function giveFullSkillKit(player) {
  const inv = inventory(player);
  if (!inv || !KIT_RELIC_IDS.length) {
    player.sendMessage(paint(Ink.bad, "Test Bench: no inventory / relics available."));
    return;
  }
  let n = 0;
  let i = 0;
  for (const group of GROUP_ORDER) {
    for (const [key, def] of Object.entries(POOL[group] ?? {})) {
      const relicId = KIT_RELIC_IDS[i % KIT_RELIC_IDS.length];
      i += 1;
      let stack;
      try {
        stack = new ItemStack(relicId, 1);
      } catch {
        continue;
      }
      const stamped = debugStampAttune(player, stack, group, key, "epic");
      if (!stamped) continue;
      try {
        inv.addItem(stamped);
        n += 1;
      } catch {
        try {
          player.dimension.spawnItem(stamped, player.location);
          n += 1;
        } catch {
        }
      }
    }
  }
  player.sendMessage(
    paint(
      Ink.good,
      `Test Bench: gave ${n} skill relics (one per skill, Epic IV). Equip one, then Fire Active Now or fight.`
    )
  );
}

function stampAndEquip(player, group, key, rarity) {
  const held = heldRelic(player);
  if (!held) {
    player.sendMessage(paint(Ink.bad, "Test Bench: hold a relic in your main hand first."));
    return false;
  }
  const next = debugStampAttune(player, held.stack, group, key, rarity);
  if (!next) {
    player.sendMessage(paint(Ink.bad, "Test Bench: stamp failed."));
    return false;
  }
  held.inv.setItem(held.slot, next);
  // Equip so runtime hooks can see it immediately.
  const equipped = equipCarriedRelic(player, held.slot);
  const skill = POOL[group]?.[key]?.name ?? key;
  const rar = RARITY[rarity]?.label ?? rarity;
  player.sendMessage(
    paint(
      Ink.good,
      `Test Bench: stamped ${skill} (${rar}) onto ${held.def.displayName}${
        equipped ? " and equipped it." : ". Equip it from the Reliquary to test."
      }`
    )
  );
  return true;
}

function showRarityPicker(player, group, key) {
  const def = POOL[group]?.[key];
  if (!def) return;
  const form = new ActionFormData()
    .title(uiAccentTitle(def.name))
    .body(
      [
        paint(groupInk(group), GROUP_LABELS[group] ?? group),
        uiMuted(def.summary),
        "",
        uiMuted("Pick a rarity. Epic unlocks the full tier list."),
      ].join("\n")
    );
  for (const rar of RARITY_ORDER) {
    const r = RARITY[rar];
    form.button(`${r.ink}${r.label}§r\n§7Powers up to tier ${["", "I", "II", "III", "IV"][r.cap] ?? r.cap}§r`);
  }
  form.button(uiBack());
  form
    .show(player)
    .then((res) => {
      if (res.canceled || res.selection === undefined) return;
      if (res.selection >= RARITY_ORDER.length) {
        showSkillPicker(player, group);
        return;
      }
      stampAndEquip(player, group, key, RARITY_ORDER[res.selection]);
      openTestBench(player);
    })
    .catch(() => {});
}

function showSkillPicker(player, group) {
  const skills = Object.entries(POOL[group] ?? {});
  const form = new ActionFormData()
    .title(uiAccentTitle(GROUP_LABELS[group] ?? group))
    .body(uiMuted("Pick a skill to stamp onto the relic in your hand."));
  for (const [key, def] of skills) {
    const kind = def.when?.toLowerCase?.().includes("sneak") ? "Active" : "Auto";
    form.button(`${paint(groupInk(group), def.name)}\n§7${kind}§r`);
  }
  form.button(uiBack());
  form
    .show(player)
    .then((res) => {
      if (res.canceled || res.selection === undefined) return;
      if (res.selection >= skills.length) {
        showAffinityPicker(player);
        return;
      }
      const [key] = skills[res.selection];
      showRarityPicker(player, group, key);
    })
    .catch(() => {});
}

function showAffinityPicker(player) {
  if (!heldRelic(player)) {
    player.sendMessage(paint(Ink.bad, "Test Bench: hold a relic in your main hand first."));
    openTestBench(player);
    return;
  }
  const form = new ActionFormData()
    .title(uiAccentTitle("Stamp Skill"))
    .body(uiMuted("Choose an attune path, then a skill and rarity. It equips automatically."));
  for (const group of GROUP_ORDER) {
    const count = Object.keys(POOL[group] ?? {}).length;
    form.button(
      `${paint(groupInk(group), GROUP_LABELS[group] ?? group)}\n§7${count} skills§r`
    );
  }
  form.button(uiBack());
  form
    .show(player)
    .then((res) => {
      if (res.canceled || res.selection === undefined) return;
      if (res.selection >= GROUP_ORDER.length) {
        openTestBench(player);
        return;
      }
      showSkillPicker(player, GROUP_ORDER[res.selection]);
    })
    .catch(() => {});
}

export function openTestBench(player, message) {
  if (!player) return;
  // First open must pass secret; later form reopens use the session unlock.
  if (typeof message === "string") {
    if (!canAccessTestBench(player, message)) return;
    unlocked.add(player.id);
  } else if (!stillAllowed(player)) {
    return;
  }
  const held = heldRelic(player);
  const form = new ActionFormData()
    .title(uiAccentTitle("Relic Test Bench"))
    .body(
      [
        paint(Ink.muted, "Creative QA kit — stamp skills, fire actives, spawn hostiles."),
        "",
        held
          ? paint(Ink.highlight, `Holding: ${held.def.displayName}`)
          : paint(Ink.bad, "Holding: (no relic — pick one up first)"),
        "",
        paint(Ink.muted, "Typical loop: Stamp / Full Kit → Spawn Hostiles → fight (skills auto-fire)"),
        paint(Ink.muted, "Movement: sprint-jump = Tempest · midair jump = Gale Anchor."),
      ].join("\n")
    )
    .button(`${paint(Ink.gold, "Stamp Skill on Held Relic")}\n§7Pick attune path → skill → rarity, then auto-equip§r`)
    .button(`${paint(Ink.gold, "Give Full Skill Kit (32)")}\n§7One Epic IV relic per skill — named for testing§r`)
    .button(`${paint(Ink.gold, "Fire Active Now")}\n§7Skip crouch+jump — fires equipped active§r`)
    .button(`${paint(Ink.gold, "Fill All Resources")}\n§7Souls 3 · Notes 3 · Rumors 5§r`)
    .button(`${paint(Ink.gold, "Clear Cooldowns")}\n§7Reset every active skill timer§r`)
    .button(`${paint(Ink.gold, "Max Out Held Relic")}\n§7Level ${MAX_LEVEL}§r`)
    .button(`${paint(Ink.gold, "Equip Held Relic")}\n§7Put main-hand relic into its wardrobe slot§r`)
    .button(`${paint(Ink.gold, "Spawn Test Hostiles")}\n§7Zombies + skeleton next to you§r`)
    .button(`${paint(Ink.gold, "Give Ritual Materials")}\n§7Shards + every focus§r`)
    .button(`${paint(Ink.gold, "Give Starter Relics")}\n§7One base relic per slot type§r`)
    .button(`${paint(Ink.gold, "Give Ascended Relics")}\n§7All Ascended recipes as items§r`)
    .button(uiClose());

  const actions = [
    () => showAffinityPicker(player),
    () => {
      giveFullSkillKit(player);
      openTestBench(player);
    },
    () => {
      fireActiveNow(player);
      openTestBench(player);
    },
    () => {
      grantResources(player);
      openTestBench(player);
    },
    () => {
      clearCooldowns(player);
      openTestBench(player);
    },
    () => {
      maxHeldRelic(player);
      openTestBench(player);
    },
    () => {
      equipHeld(player);
      openTestBench(player);
    },
    () => {
      spawnHostiles(player);
      openTestBench(player);
    },
    () => {
      giveMaterials(player);
      openTestBench(player);
    },
    () => {
      giveStarterRelics(player);
      openTestBench(player);
    },
    () => {
      giveAscendedRelics(player);
      openTestBench(player);
    },
  ];

  form
    .show(player)
    .then((res) => {
      if (res.canceled || res.selection === undefined) return;
      const fn = actions[res.selection];
      if (fn) fn();
    })
    .catch(() => {});
}
