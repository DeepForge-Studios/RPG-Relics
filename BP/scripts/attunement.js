/**
 * Direct Attunement Forge forms.
 *
 * A scripted form can open from one block tap; native anvil/smithing container
 * screens cannot be opened or controlled by Script API. Ritual materials are
 * selected and consumed from the player's inventory, while the chosen relic's
 * ItemStack dynamic properties are preserved.
 */
import { ItemStack } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { getRelicDef } from "./registry.js";
import { relicIconPath } from "./descriptions.js";
import {
  GROUP_LABELS,
  GROUP_ORDER,
  POOL,
  RARITY,
  RARITY_ORDER,
  RITUAL_COSTS,
  FOCUS_RECIPES,
  SHARD_ID,
  groupInk,
  rollRitualAttunement,
  describeAttunement,
  eligibleAttunements,
} from "./attune_pool.js";
import {
  SECOND_SLOT_LEVEL,
  MAX_SLOTS,
  ITEM_ATTUNE_PROP,
  getAttuneProgress,
  ensureAttuneIdentity,
  applyRolledAttunement,
  restampExamineStack,
  announceRoll,
} from "./attune_data.js";
import {
  Ink,
  paint,
  uiAccentTitle,
  uiBack,
  uiClose,
  uiDim,
  uiMuted,
} from "./theme.js";

/** Player-facing name — change this string to rebrand the menu. */
export const ATTUNEMENT_NAME = "Attunement Forge";

/** Script event: /scriptevent relics:attune */
export const ATTUNEMENT_EVENT = "relics:attune";

const openForms = new Set();

const MATERIAL_NAMES = Object.freeze({
  "relics:relic_shard": "Relic Shard",
  "relics:monster_heart": "Monster Heart",
  "relics:beast_fang": "Beast Fang",
  "relics:arcane_dust": "Arcane Dust",
  "relics:mystic_herb": "Mystic Herb",
  "relics:silver_fragment": "Silver Fragment",
  "relics:crimson_crystal": "Crimson Crystal",
});

const MATERIAL_SOURCES = Object.freeze({
  "relics:relic_shard": "mimics, relic chests, archaeology, and hostile-mob kills",
  "relics:monster_heart": "zombies, husks, drowned, brutes, ravagers, and wardens",
  "relics:beast_fang": "spiders, hoglins, ravagers, and wardens",
  "relics:arcane_dust": "witches, endermen, evokers, and shulkers",
  "relics:mystic_herb": "grass, ferns, flowers, and relic tower/home chests",
  "relics:silver_fragment": "skeletons, strays, illagers, zombie villagers, and relic chests",
  "relics:crimson_crystal": "creepers, blazes, magma cubes, and wither skeletons",
});

const GROUP_IDENTITY = Object.freeze({
  might: "pressure, combos, and brutal finishers",
  ward: "counters, protection, and holding ground",
  gale: "marks, movement, and repositioning",
  fortune: "wagers, loot, and risky rewards",
  vitality: "healing rituals and life trades",
  alchemy: "reactions, mixtures, and familiars",
  necromancy: "corpses, souls, and undead servants",
  radiance: "brands, lightning, and party support",
});

/** Two-word taglines that fit on a form button line. */
const GROUP_TAGLINE = Object.freeze({
  might: "combos & finishers",
  ward: "counters & protection",
  gale: "movement & marks",
  fortune: "wagers & loot",
  vitality: "healing & life trades",
  alchemy: "reactions & familiars",
  necromancy: "souls & servants",
  radiance: "light & lightning",
});

function materialName(typeId) {
  return MATERIAL_NAMES[typeId] ?? typeId.replace("relics:", "").replace(/_/g, " ");
}

function materialIcon(typeId) {
  return relicIconPath(typeId) ?? `textures/items/${typeId.replace("relics:", "")}.png`;
}

function inventory(player) {
  return player?.getComponent?.("minecraft:inventory")?.container;
}

function countItem(player, typeId) {
  const inv = inventory(player);
  if (!inv) return 0;
  let count = 0;
  for (let i = 0; i < inv.size; i++) {
    try {
      const stack = inv.getItem(i);
      if (stack?.typeId === typeId) count += stack.amount;
    } catch {
    }
  }
  return count;
}

function inventoryRelics(player) {
  const inv = inventory(player);
  if (!inv) return [];
  const relics = [];
  for (let i = 0; i < inv.size; i++) {
    try {
      const stack = inv.getItem(i);
      const def = stack && getRelicDef(stack.typeId);
      if (stack && def) relics.push({ slot: i, stack, def });
    } catch {
    }
  }
  return relics;
}

function show(form, player) {
  openForms.add(player.id);
  return form.show(player).then(
    (result) => {
      openForms.delete(player.id);
      return result;
    },
    () => {
      openForms.delete(player.id);
      return { canceled: true };
    }
  );
}

function currentRelic(player, slot, expectedTypeId) {
  try {
    const stack = inventory(player)?.getItem(slot);
    if (stack?.typeId === expectedTypeId && getRelicDef(stack.typeId)) return stack;
  } catch {
  }
  return undefined;
}

function addOrDrop(player, typeId, amount) {
  let left = amount;
  const inv = inventory(player);
  while (inv && left > 0) {
    const size = Math.min(left, 64);
    const stack = new ItemStack(typeId, size);
    try {
      const extra = inv.addItem(stack);
      if (extra) player.dimension.spawnItem(extra, player.location);
    } catch {
      try {
        player.dimension.spawnItem(stack, player.location);
      } catch {
      }
    }
    left -= size;
  }
}

/**
 * Inventory transaction for shard + focus costs.
 * Plans against current stacks, snapshots touched slots, and restores on error.
 */
function consumeCosts(player, costs) {
  const inv = inventory(player);
  if (!inv) return false;
  const need = new Map();
  for (const [typeId, amount] of costs) {
    need.set(typeId, (need.get(typeId) ?? 0) + amount);
  }
  for (const [typeId, amount] of need) {
    if (countItem(player, typeId) < amount) return false;
  }

  const plan = [];
  for (const [typeId, amount] of need) {
    let left = amount;
    for (let i = 0; i < inv.size && left > 0; i++) {
      let stack;
      try {
        stack = inv.getItem(i);
      } catch {
        continue;
      }
      if (stack?.typeId !== typeId) continue;
      const take = Math.min(left, stack.amount);
      plan.push({ slot: i, before: stack.clone(), take });
      left -= take;
    }
    if (left > 0) return false;
  }

  try {
    for (const row of plan) {
      const stack = inv.getItem(row.slot);
      if (!stack || stack.typeId !== row.before.typeId || stack.amount < row.take) {
        throw new Error("inventory changed");
      }
      if (stack.amount === row.take) inv.setItem(row.slot, undefined);
      else {
        stack.amount -= row.take;
        inv.setItem(row.slot, stack);
      }
    }
    return true;
  } catch {
    for (const row of plan) {
      try {
        inv.setItem(row.slot, row.before);
      } catch {
      }
    }
    return false;
  }
}

function refundCosts(player, costs) {
  for (const [typeId, amount] of costs) addOrDrop(player, typeId, amount);
}

function slotStatus(prog) {
  const second =
    prog.slotCap >= MAX_SLOTS
      ? prog.slots.length >= MAX_SLOTS
        ? paint(Ink.good, "Slot 2 filled")
        : paint(Ink.good, "Slot 2 open")
      : paint(Ink.muted, `Slot 2 locked — unlocks at Lv ${SECOND_SLOT_LEVEL}`);
  return `Lv ${prog.level} · ${prog.slots.length}/${prog.slotCap} gifts\n${second}`;
}

function showMaterialGuide(player, back) {
  const recipeLines = GROUP_ORDER.map((group) => {
    const [a, b] = FOCUS_RECIPES[group];
    return `${paint(groupInk(group), GROUP_LABELS[group])}: ${materialName(a)} + ${materialName(b)}`;
  });
  const sourceLines = Object.keys(MATERIAL_SOURCES).map(
    (id) => `${paint(Ink.highlight, materialName(id))}: ${MATERIAL_SOURCES[id]}`
  );
  const form = new ActionFormData()
    .title(uiAccentTitle("Affinity & Drop Guide"))
    .body(
      [
        "A focus material has no affinity by itself. Its pair chooses the group.",
        "",
        ...recipeLines,
        "",
        paint(Ink.gold, "Where materials come from"),
        ...sourceLines,
      ].join("\n")
    )
    .button(uiBack());
  show(form, player).then((res) => {
    if (!res.canceled) back(player);
  });
}

function showRelicPicker(player, back) {
  const relics = inventoryRelics(player);
  const body = relics.length
    ? [
        "Choose the exact relic you want to attune.",
        uiMuted("Each copy keeps its own level and gifts."),
        "",
        uiDim("Next: choose an affinity. Every affinity shows its exact two-material recipe."),
      ].join("\n")
    : [
        paint(Ink.bad, "No relics found in your inventory."),
        "",
        "Unequip one from the Reliquary, then return.",
      ].join("\n");
  const form = new ActionFormData().title(uiAccentTitle(ATTUNEMENT_NAME)).body(body);

  for (const row of relics) {
    let hadState = false;
    try {
      hadState = !!row.stack.getDynamicProperty?.(ITEM_ATTUNE_PROP);
    } catch {
    }
    ensureAttuneIdentity(player, row.stack);
    const prog = getAttuneProgress(player, row.stack);
    if (!hadState) {
      try {
        inventory(player).setItem(row.slot, row.stack);
      } catch {
      }
    }
    form.button(
      `${paint(Ink.gold, row.def.displayName)}\n§7${slotStatus(prog)}§r`,
      relicIconPath(row.stack.typeId)
    );
  }
  form.button(paint(Ink.highlight, "Affinity & Drop Guide"), materialIcon(SHARD_ID));
  form.button(back ? uiBack() : uiClose());

  show(form, player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    if (res.selection === relics.length) {
      showMaterialGuide(player, () => showRelicPicker(player, back));
      return;
    }
    if (res.selection > relics.length) {
      if (back) back(player);
      return;
    }
    const chosen = relics[res.selection];
    showAffinityPicker(player, chosen.slot, chosen.stack.typeId, back);
  });
}

function showAffinityPicker(player, relicSlot, relicTypeId, back) {
  const stack = currentRelic(player, relicSlot, relicTypeId);
  if (!stack) {
    showRelicPicker(player, back);
    return;
  }
  let hadState = false;
  try {
    hadState = !!stack.getDynamicProperty?.(ITEM_ATTUNE_PROP);
  } catch {
  }
  ensureAttuneIdentity(player, stack);
  if (!hadState) {
    try {
      inventory(player).setItem(relicSlot, stack);
    } catch {
    }
  }
  const def = getRelicDef(relicTypeId);
  const prog = getAttuneProgress(player, stack);
  const shards = countItem(player, SHARD_ID);
  const form = new ActionFormData()
    .title(uiAccentTitle(def?.displayName ?? ATTUNEMENT_NAME))
    .body(
      [
        slotStatus(prog),
        "",
        `${paint(Ink.highlight, "Relic Shards:")} ${shards}`,
        uiMuted("Choose an affinity. Materials and costs show on the next screen."),
      ].join("\n")
    );

  for (const group of GROUP_ORDER) {
    form.button(
      `${paint(groupInk(group), GROUP_LABELS[group])}\n§7${GROUP_TAGLINE[group]}§r`,
      materialIcon(FOCUS_RECIPES[group][0])
    );
  }
  form.button(uiBack());

  show(form, player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    if (res.selection >= GROUP_ORDER.length) {
      showRelicPicker(player, back);
      return;
    }
    showRarityPicker(player, relicSlot, relicTypeId, GROUP_ORDER[res.selection], back);
  });
}

const TIER_NUMERALS = ["I", "II", "III", "IV"];

function conflictSlots(prog) {
  return prog.slots.length < prog.slotCap ? prog.slots : prog.slots.slice(1);
}

function rollChanceText(eligibleCount) {
  if (eligibleCount <= 0) return paint(Ink.bad, "Can't roll on this relic");
  if (eligibleCount === 1) return paint(Ink.good, "Guaranteed on this relic");
  return `1 in ${eligibleCount} each ritual`;
}

/** Plain-language footnotes, matched against the skill's own text. */
const GLOSSARY = [
  ["sneak + jump", "Movement skills use Jump: sprint-jump for Tempest Tithe, midair jump for Gale Anchor."],
  ["wager", "Wager: a timed bet — kill the target before the timer ends to win the prize."],
  ["catalyst", "Catalyst: a monster drop used at the Forge (Hearts, Fangs, Dust, Herbs, Silver, Crystals)."],
  ["marked weak", "Marked Weak: that enemy briefly takes extra damage from your hits."],
  ["brand", "Brand: a glowing mark on an enemy. Hitting them again \"breaks\" it and triggers the effect."],
  ["soul charge", "Soul Charge: banked from kills. Three charges fire Corpse Lantern or Pale Conscription."],
  ["damage buffer", "Damage buffer: soaks a bit of incoming damage before your hearts do."],
  ["rumor", "Rumor: banked from kills — five of them pay out the duplicate."],
  ["note", "Note: banked from kills; three Notes fire Lumen Chorus automatically."],
];

function glossaryLines(text) {
  const lower = text.toLowerCase();
  return GLOSSARY.filter(([term]) => lower.includes(term))
    .slice(0, 3)
    .map(([, line]) => uiMuted(line));
}

function showSkillDetail(player, relicTypeId, group, key, eligible, back) {
  const def = POOL[group][key];
  const canRoll = eligible.includes(key);
  const tierLines = def.tiers.map((tier, i) => {
    const rarity = RARITY_ORDER[i];
    return `${RARITY[rarity].ink}${TIER_NUMERALS[i]} ${RARITY[rarity].label}§7 — ${tier}${Ink.reset}`;
  });
  const allText = [def.summary, def.when ?? "", def.cost ?? "", ...def.tiers].join(" ");
  const terms = glossaryLines(allText);
  const lines = [def.summary, ""];
  if (def.when) lines.push(`${paint(Ink.highlight, "How to trigger:")} ${def.when}`);
  if (def.cost) lines.push(`${paint(Ink.highlight, "Cost:")} ${def.cost}`);
  lines.push("", paint(Ink.gold, "What each tier unlocks"), ...tierLines, "");
  lines.push(
    `${paint(Ink.highlight, "Roll chance:")} ${
      canRoll ? rollChanceText(eligible.length) : paint(Ink.bad, "Blocked — this relic (or an equipped gift) already covers it")
    }`
  );
  if (terms.length) lines.push("", paint(Ink.gold, "Terms"), ...terms);
  const form = new ActionFormData()
    .title(paint(groupInk(group), def.name))
    .body(lines.join("\n"))
    .button(uiBack());
  show(form, player).then((res) => {
    if (!res.canceled) back(player);
  });
}

function showSkillBrowser(player, relicSlot, relicTypeId, group, back) {
  const stack = currentRelic(player, relicSlot, relicTypeId);
  if (!stack) {
    showRelicPicker(player, back);
    return;
  }
  const prog = getAttuneProgress(player, stack);
  const eligible = eligibleAttunements(relicTypeId, group, conflictSlots(prog));
  const keys = Object.keys(POOL[group] ?? {});
  const form = new ActionFormData()
    .title(paint(groupInk(group), `${GROUP_LABELS[group]} Skills`))
    .body(
      [
        `The ritual picks one of these at random.`,
        uiMuted(`Right now this relic can roll ${eligible.length} of ${keys.length}.`),
        "",
        uiMuted("Tap a skill to see its tiers."),
      ].join("\n")
    );
  for (const key of keys) {
    const def = POOL[group][key];
    const canRoll = eligible.includes(key);
    form.button(
      `${paint(groupInk(group), def.name)}\n${
        canRoll ? `§7${rollChanceText(eligible.length)}§r` : paint(Ink.bad, "Blocked on this relic")
      }`,
      relicIconPath(relicTypeId)
    );
  }
  form.button(uiBack());

  show(form, player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    if (res.selection >= keys.length) {
      showRarityPicker(player, relicSlot, relicTypeId, group, back);
      return;
    }
    showSkillDetail(player, relicTypeId, group, keys[res.selection], eligible, () =>
      showSkillBrowser(player, relicSlot, relicTypeId, group, back)
    );
  });
}

function showRarityPicker(player, relicSlot, relicTypeId, group, back) {
  const stack = currentRelic(player, relicSlot, relicTypeId);
  if (!stack) {
    showRelicPicker(player, back);
    return;
  }
  const [focusA, focusB] = FOCUS_RECIPES[group];
  const counts = {
    shards: countItem(player, SHARD_ID),
    a: countItem(player, focusA),
    b: countItem(player, focusB),
  };
  const form = new ActionFormData()
    .title(`${groupInk(group)}${GROUP_LABELS[group]}${Ink.reset}`)
    .body(
      [
        GROUP_IDENTITY[group],
        "",
        paint(Ink.gold, "Your materials"),
        `${materialName(focusA)}: ${counts.a}`,
        `${materialName(focusB)}: ${counts.b}`,
        `Relic Shards: ${counts.shards}`,
        "",
        uiMuted("Pick a tier. Higher tiers unlock more of the skill."),
      ].join("\n")
    );

  form.button(
    `${paint(Ink.highlight, `View ${GROUP_LABELS[group]} Skills`)}\n§7What you can roll & the odds§r`,
    relicIconPath("relics:relic_guidebook")
  );
  for (const rarity of RARITY_ORDER) {
    const cost = RITUAL_COSTS[rarity];
    const cap = RARITY[rarity].cap;
    const ready =
      counts.shards >= cost.shards && counts.a >= cost.focus && counts.b >= cost.focus;
    form.button(
      `${RARITY[rarity].ink}${RARITY[rarity].label} · Powers ${
        cap === 1 ? "I" : `I-${TIER_NUMERALS[cap - 1]}`
      }${Ink.reset}\n` +
        `${ready ? "§a" : "§c"}${cost.shards} shards + ${cost.focus} each focus§r`,
      materialIcon(SHARD_ID)
    );
  }
  form.button(uiBack());

  show(form, player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    if (res.selection === 0) {
      showSkillBrowser(player, relicSlot, relicTypeId, group, back);
      return;
    }
    if (res.selection > RARITY_ORDER.length) {
      showAffinityPicker(player, relicSlot, relicTypeId, back);
      return;
    }
    const rarity = RARITY_ORDER[res.selection - 1];
    const cost = RITUAL_COSTS[rarity];
    if (
      countItem(player, SHARD_ID) < cost.shards ||
      countItem(player, focusA) < cost.focus ||
      countItem(player, focusB) < cost.focus
    ) {
      try {
        player.onScreenDisplay.setActionBar("§cForge · missing ritual materials");
      } catch {
      }
      showRarityPicker(player, relicSlot, relicTypeId, group, back);
      return;
    }
    showConfirmation(player, relicSlot, relicTypeId, group, rarity, back);
  });
}

function showConfirmation(player, relicSlot, relicTypeId, group, rarity, back) {
  const stack = currentRelic(player, relicSlot, relicTypeId);
  if (!stack) {
    showRelicPicker(player, back);
    return;
  }
  const def = getRelicDef(relicTypeId);
  const prog = getAttuneProgress(player, stack);
  const [focusA, focusB] = FOCUS_RECIPES[group];
  const cost = RITUAL_COSTS[rarity];
  const replacing = prog.slots.length >= prog.slotCap;
  const form = new ActionFormData()
    .title(uiAccentTitle("Confirm Ritual"))
    .body(
      [
        `${paint(Ink.gold, "Relic:")} ${def?.displayName ?? relicTypeId}`,
        `${paint(groupInk(group), "Affinity:")} ${GROUP_LABELS[group]}`,
        `${RARITY[rarity].ink}Tier: ${RARITY[rarity].label}${Ink.reset}`,
        "",
        `${cost.shards} Relic Shards`,
        `${cost.focus} ${materialName(focusA)} + ${cost.focus} ${materialName(focusB)}`,
        "",
        replacing
          ? paint(Ink.highlight, "Outcome: reforge the Core Gift")
          : paint(Ink.good, `Outcome: fill attunement slot ${prog.slots.length + 1}`),
        prog.slotCap < MAX_SLOTS
          ? paint(Ink.dim, `Attunement slot 2 unlocks at relic Lv ${SECOND_SLOT_LEVEL}.`)
          : "",
        "",
        uiMuted("The exact gift is revealed when the ritual completes."),
      ]
        .filter(Boolean)
        .join("\n")
    )
    .button(paint(Ink.purple, "Forge Attunement"), relicIconPath(relicTypeId))
    .button(uiBack());

  show(form, player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    if (res.selection !== 0) {
      showRarityPicker(player, relicSlot, relicTypeId, group, back);
      return;
    }
    performRitual(player, relicSlot, relicTypeId, group, rarity, back);
  });
}

function performRitual(player, relicSlot, relicTypeId, group, rarity, back) {
  const stack = currentRelic(player, relicSlot, relicTypeId);
  if (!stack) {
    showRelicPicker(player, back);
    return;
  }
  ensureAttuneIdentity(player, stack);
  const beforeId = getAttuneProgress(player, stack).instanceId;
  const prog = getAttuneProgress(player, stack);
  const rolled = rollRitualAttunement(relicTypeId, group, rarity, conflictSlots(prog));
  if (!rolled) {
    try {
      player.sendMessage("§cForge: no compatible gift exists for that relic and affinity.");
    } catch {
    }
    showAffinityPicker(player, relicSlot, relicTypeId, back);
    return;
  }

  const [focusA, focusB] = FOCUS_RECIPES[group];
  const cost = RITUAL_COSTS[rarity];
  const costs = [
    [SHARD_ID, cost.shards],
    [focusA, cost.focus],
    [focusB, cost.focus],
  ];
  if (!consumeCosts(player, costs)) {
    try {
      player.onScreenDisplay.setActionBar("§cForge · inventory changed; nothing consumed");
    } catch {
    }
    showRarityPicker(player, relicSlot, relicTypeId, group, back);
    return;
  }

  // Re-validate the same ItemStack after spending materials.
  const live = currentRelic(player, relicSlot, relicTypeId);
  if (!live || getAttuneProgress(player, live).instanceId !== beforeId) {
    refundCosts(player, costs);
    try {
      player.sendMessage("§cForge: relic moved; materials refunded.");
    } catch {
    }
    showRelicPicker(player, back);
    return;
  }

  const result = applyRolledAttunement(player, live, rolled);
  if (!result) {
    refundCosts(player, costs);
    try {
      player.sendMessage("§cForge: could not save attunement; materials refunded.");
    } catch {
    }
    showRarityPicker(player, relicSlot, relicTypeId, group, back);
    return;
  }
  const stamped = restampExamineStack(player, live) ?? live;
  try {
    inventory(player).setItem(relicSlot, stamped);
  } catch {
    refundCosts(player, costs);
    try {
      player.sendMessage("§cForge: could not update the relic; materials refunded.");
    } catch {
    }
    return;
  }
  announceRoll(player, relicTypeId, result);
  const attuneDef = POOL[group]?.[result.slot.key];
  const form = new ActionFormData()
    .title(uiAccentTitle("Ritual Complete"))
    .body(
      [
        `${paint(Ink.gold, getRelicDef(relicTypeId)?.displayName ?? relicTypeId)}`,
        `${paint(groupInk(group), attuneDef?.name ?? result.slot.key)} ${RARITY[rarity].ink}(${RARITY[rarity].label})${Ink.reset}`,
        "",
        describeAttunement(attuneDef),
        "",
        result.prog.slotCap < MAX_SLOTS
          ? paint(Ink.dim, `Slot 2: Unlocks at Lv ${SECOND_SLOT_LEVEL}`)
          : paint(Ink.good, "Slot 2: Open"),
      ].join("\n")
    )
    .button(paint(Ink.purple, "Attune Another"))
    .button(uiClose());
  show(form, player).then((res) => {
    if (!res.canceled && res.selection === 0) showRelicPicker(player, back);
  });
}

export function isAttunementOpen(player) {
  return !!player && openForms.has(player.id);
}

/** Open directly from one block/item tap. */
export function openAttunement(player, back) {
  if (!player || openForms.has(player.id)) return;
  showRelicPicker(player, back);
}

export function openAttunementFor(player, itemId, back) {
  if (!player || openForms.has(player.id)) return false;
  const match = inventoryRelics(player).find((row) => row.stack.typeId === itemId);
  if (!match) {
    openAttunement(player, back);
    return false;
  }
  showAffinityPicker(player, match.slot, match.stack.typeId, back);
  return true;
}

/** Clear open-form tracking when the player leaves mid-menu. */
export function clearAttunementForms(player) {
  if (player?.id) openForms.delete(player.id);
}
