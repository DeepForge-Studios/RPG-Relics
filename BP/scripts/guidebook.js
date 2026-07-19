import { ActionFormData } from "@minecraft/server-ui";
import { RELIC_REGISTRY, SLOT_LABELS } from "./registry.js";
import { RELIC_UPGRADES } from "./upgrades.js";
import { clearRelicSense, startRelicSense } from "./acquisition.js";
import {
  areBoostsEnabled,
  areEffectNotificationsEnabled,
  isRelicSenseEnabled,
  toggleBoosts,
  toggleEffectNotifications,
  toggleRelicSense,
} from "./settings.js";
import {
  describeRelic,
  shortBlurb,
  relicIconPath,
  labeledButton,
} from "./descriptions.js";
import { BOOST_ABILITIES } from "./boosts_data.js";
import { boostLoadout } from "./hooks.js";
import { openAttunement } from "./attunement.js";
import {
  GROUP_ORDER,
  GROUP_LABELS,
  POOL,
  RARITY,
  RARITY_ORDER,
  RITUAL_COSTS,
  groupInk,
} from "./attune_pool.js";
import { TEST_BUILD } from "./build_info.js";
import {
  Ink,
  uiTitle,
  uiAccentTitle,
  uiBody,
  uiMuted,
  uiDim,
  uiHighlight,
  uiBack,
  paint,
} from "./theme.js";

const GUIDE_LABELS = {
  face: "Face",
  head: "Head",
  necklace: "Necklace",
  ring: "Ring",
  charm: "Charm",
  back: "Back",
  body: "Body",
  belt: "Belt",
  hands: "Hands",
  feet: "Feet",
  special: "Special (any slot)",
  master: "Ascended (tier 3)",
};

const openGuidebooks = new Set();

function showGuideForm(form, player) {
  openGuidebooks.add(player.id);
  return form.show(player).then(
    (result) => {
      openGuidebooks.delete(player.id);
      return result;
    },
    () => {
      openGuidebooks.delete(player.id);
      return { canceled: true };
    }
  );
}

export function isGuidebookOpen(player) {
  return !!player && openGuidebooks.has(player.id);
}

function relicsForSlot(slot) {
  if (slot === "master") {
    return RELIC_UPGRADES.map((def) => ({ id: def.id, def })).sort((a, b) =>
      a.def.displayName.localeCompare(b.def.displayName)
    );
  }
  return Object.entries(RELIC_REGISTRY)
    .filter(([, def]) => {
      if (slot === "special") return def.slot === "any";
      if (slot === "hands") return def.slot === "hands";
      if (slot === "feet") return def.slot === "feet";
      return def.slot === slot;
    })
    .map(([id, def]) => ({ id, def }))
    .sort((a, b) => a.def.displayName.localeCompare(b.def.displayName));
}

function showTextPage(player, title, body, back) {
  const form = new ActionFormData()
    .title(uiTitle(title))
    .body(body)
    .button(uiBack());
  showGuideForm(form, player).then((res) => {
    if (!res.canceled) back(player);
  });
}

function showRelicDetail(player, relic, back) {
  const slotLabel =
    relic.def.slot === "any"
      ? "Any slot"
      : GUIDE_LABELS[relic.def.slot] ?? SLOT_LABELS[relic.def.slot] ?? relic.def.slot;
  const body = [
    `${uiMuted("Slot:")} ${slotLabel}`,
    "",
    describeRelic(relic.def),
    "",
    uiDim("Equip via the Reliquary."),
  ].join("\n");

  const form = new ActionFormData().title(uiHighlight(relic.def.displayName)).body(body);
  form.button(uiBack(), relicIconPath(relic.id));
  showGuideForm(form, player).then((res) => {
    if (!res.canceled) back(player);
  });
}

function showSlotCatalog(player, slotKey) {
  const relics = relicsForSlot(slotKey);
  const title =
    slotKey === "special" ? "Special Relics" : `${GUIDE_LABELS[slotKey] ?? slotKey} Relics`;
  const form = new ActionFormData()
    .title(uiTitle(title))
    .body(`${uiBody("Choose a relic below.")}\n${uiDim(`${relics.length} entries in this category.`)}`);

  for (const relic of relics) {
    form.button(
      labeledButton(relic.def.displayName, shortBlurb(relic.def)),
      relicIconPath(relic.id)
    );
  }
  form.button(uiBack());

  showGuideForm(form, player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    if (res.selection >= relics.length) {
      openRelicCatalog(player);
      return;
    }
    showRelicDetail(player, relics[res.selection], () => showSlotCatalog(player, slotKey));
  });
}

const BOOST_KEYS = ["might", "ward", "gale", "fortune", "vitality", "alchemy"];

function boostActiveLine(loadout) {
  if (!loadout.enabled) return "§8Boosts are disabled in Settings.§r";
  if (!loadout.equipped) return "§7Equip relics in the Reliquary to activate a boost.§r";
  const a = loadout.active;
  if (!a) return "§7No active boost.§r";
  const roman = "I".repeat(a.level);
  return `§fActive: ${BOOST_ABILITIES[a.affinity].color}${a.label} Boost ${roman}§r §8(${a.score} power)§r`;
}

function showBoostDetail(player, key) {
  const info = BOOST_ABILITIES[key];
  const loadout = boostLoadout(player);
  const power = loadout.scores[key] ?? 0;
  const level = loadout.levels[key] ?? 0;
  const isActive = loadout.active?.affinity === key;
  const body = [
    `${info.color}${info.summary}§r`,
    "",
    "§eAbilities§r",
    ...info.tiers.map((line, i) => {
      const unlocked = level >= i + 1;
      const mark = unlocked ? "§a●§r" : "§8○§r";
      return `${mark} ${unlocked ? "§f" : "§8"}${line}§r`;
    }),
    "",
    `§7Your power in this style:§r §f${power}§r`,
    level > 0
      ? `§7Highest tier relic contributing:§r §f${"I".repeat(level)}§r`
      : "§8No equipped relics lean this way yet.§r",
    isActive ? "§aThis is your active boost.§r" : "§8Specialize your loadout to make this active.§r",
    "",
    "§8Common = 1 power · Uncommon = 2 · Rare/Ascended = 3§r",
  ].join("\n");

  const form = new ActionFormData()
    .title(`${info.color}${RESONANCE_TITLE(key)}${Ink.reset}`)
    .body(body)
    .button(uiBack());

  showGuideForm(form, player).then((res) => {
    if (!res.canceled) openBoostCodex(player);
  });
}

function RESONANCE_TITLE(key) {
  return (
    {
      might: "Might",
      ward: "Ward",
      gale: "Gale",
      fortune: "Fortune",
      vitality: "Vitality",
      alchemy: "Alchemy",
    }[key] ?? key
  );
}

/** Simple Bedrock Boost Codex — view I/II/III abilities + live loadout. */
export function openBoostCodex(player) {
  const loadout = boostLoadout(player);
  const form = new ActionFormData()
    .title(uiAccentTitle("Boost Codex"))
    .body(
      [
        uiBody("Loadout bonuses from equipped relics."),
        "Your strongest playstyle becomes Boost I–III.",
        "",
        boostActiveLine(loadout),
        "",
        uiDim("Tap a boost to see its abilities."),
      ].join("\n")
    );

  for (const key of BOOST_KEYS) {
    const info = BOOST_ABILITIES[key];
    const power = loadout.scores[key] ?? 0;
    const active = loadout.active?.affinity === key;
    const tag = active ? " §a◀§r" : "";
    form.button(
      labeledButton(
        `${info.color}${RESONANCE_TITLE(key)}${tag}§r`,
        power > 0 ? `${power} power` : "no power yet"
      )
    );
  }
  form.button(uiBack());

  showGuideForm(form, player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    if (res.selection >= BOOST_KEYS.length) {
      openGuidebook(player);
      return;
    }
    showBoostDetail(player, BOOST_KEYS[res.selection]);
  });
}

const ATTUNE_GROUP_INFO = {
  might: ["Monster Heart + Beast Fang", "build pressure, then burst"],
  ward: ["Silver Fragment + Monster Heart", "counter attacks and hold ground"],
  gale: ["Beast Fang + Arcane Dust", "reposition through combat"],
  fortune: ["Silver Fragment + Beast Fang", "make visible wagers"],
  vitality: ["Mystic Herb + Monster Heart", "perform healing rituals"],
  alchemy: ["Arcane Dust + Mystic Herb", "mix colors into reactions"],
  necromancy: ["Crimson Crystal + Monster Heart", "harvest and spend souls"],
  radiance: ["Silver Fragment + Arcane Dust", "brand and consecrate"],
};

const ATTUNE_ACTIVE_SKILLS = new Set([
  // Kept for Skillbook "movement" labeling only — these still use Jump.
  "tempest_tithe",
  "gale_anchor",
]);

const ATTUNE_TERMS = [
  ["soul charge", "Soul Charge: energy banked from kills. Three charges fire Corpse Lantern or Pale Conscription."],
  ["wager", "Wager: a timed bet. Kill the marked target before time runs out to win."],
  ["catalyst", "Catalyst: a Forge material such as a Heart, Fang, Dust, Herb, Silver, or Crystal."],
  ["marked weak", "Marked Weak: the hostile temporarily takes extra damage from your attacks."],
  ["brand", "Brand: a temporary mark. Strike the marked hostile again to trigger its effect."],
  ["damage buffer", "Damage buffer: protection that absorbs damage before it reaches your hearts."],
  ["rumor", "Rumor: a charge earned from kills. Five Rumors pay out a duplicated drop."],
  ["note", "Note: energy earned from kills. Three Notes fire Lumen Chorus."],
];

function attuneTermLines(skill) {
  const text = [skill.summary, skill.when, skill.cost, ...skill.tiers]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return ATTUNE_TERMS.filter(([term]) => text.includes(term)).map(([, explanation]) =>
    uiMuted(explanation)
  );
}

function showAttuneSkill(player, group, key) {
  const skill = POOL[group]?.[key];
  if (!skill) {
    showAttuneGroup(player, group);
    return;
  }
  const numerals = ["I", "II", "III", "IV"];
  const tierLines = skill.tiers.map((line, index) => {
    const rarityKey = RARITY_ORDER[index];
    const rarity = RARITY[rarityKey];
    return `${rarity.ink}${numerals[index]} ${rarity.label}${Ink.reset} — ${line}`;
  });
  const terms = attuneTermLines(skill);
  const lines = [
    skill.summary,
    "",
    `${paint(Ink.highlight, "Type:")} ${
      ATTUNE_ACTIVE_SKILLS.has(key)
        ? "Movement — uses Jump (sprint-jump or midair jump)."
        : "Automatic — triggers during normal play."
    }`,
  ];
  if (skill.when) lines.push(`${paint(Ink.highlight, "Trigger:")} ${skill.when}`);
  if (skill.cost) lines.push(`${paint(Ink.highlight, "Cost / cooldown:")} ${skill.cost}`);
  lines.push("", paint(Ink.gold, "Rarity upgrades"), ...tierLines);
  if (terms.length) lines.push("", paint(Ink.gold, "Terms"), ...terms);

  const form = new ActionFormData()
    .title(paint(groupInk(group), skill.name))
    .body(lines.join("\n"))
    .button(uiBack());
  showGuideForm(form, player).then((res) => {
    if (!res.canceled) showAttuneGroup(player, group);
  });
}

function showAttuneGroup(player, key) {
  const label = GROUP_LABELS[key] ?? key;
  const [focus, identity] = ATTUNE_GROUP_INFO[key] ?? ["two focus materials", "special abilities"];
  const skills = Object.entries(POOL[key] ?? {});
  const form = new ActionFormData()
    .title(paint(groupInk(key), `${label} Skills`))
    .body(
      [
        `${paint(groupInk(key), `${label} focuses on ${identity}.`)}`,
        `${uiMuted("Forge materials:")} ${focus}`,
        "",
        uiBody("Choose a skill to learn exactly what it does."),
        uiDim("Every skill page shows its trigger, cooldown, and rarity upgrades."),
      ].join("\n")
    );
  for (const [, skill] of skills) {
    form.button(labeledButton(paint(groupInk(key), skill.name), skill.summary));
  }
  form.button(uiBack());

  showGuideForm(form, player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    if (res.selection >= skills.length) {
      openAttuneCodex(player);
      return;
    }
    showAttuneSkill(player, key, skills[res.selection][0]);
  });
}

function openAttuneCodex(player) {
  const rarityLine = [
    `${RARITY.common.ink}Common§r ${RITUAL_COSTS.common.shards}+${RITUAL_COSTS.common.focus}/${RITUAL_COSTS.common.focus} (I)`,
    `${RARITY.uncommon.ink}Uncommon§r ${RITUAL_COSTS.uncommon.shards}+${RITUAL_COSTS.uncommon.focus}/${RITUAL_COSTS.uncommon.focus} (II)`,
    `${RARITY.rare.ink}Rare§r ${RITUAL_COSTS.rare.shards}+${RITUAL_COSTS.rare.focus}/${RITUAL_COSTS.rare.focus} (III)`,
    `${RARITY.epic.ink}Epic§r ${RITUAL_COSTS.epic.shards}+${RITUAL_COSTS.epic.focus}/${RITUAL_COSTS.epic.focus} (IV)`,
  ].join(" · ");
  const form = new ActionFormData()
    .title(uiAccentTitle("Attunement Skillbook"))
    .body(
      [
        uiBody("Read every attunement skill before using the Forge."),
        "Choose an affinity, then choose a skill.",
        "Relics keep their base passive; attunements stack on top.",
        "Wear an attuned relic to level it. Relic level 5 opens slot two.",
        "",
        rarityLine,
        "",
        uiDim("Numbers mean Relic Shards (from your bag) + focus A / focus B. The pair guarantees the group."),
      ].join("\n")
    );

  for (const key of GROUP_ORDER) {
    const [focus, identity] = ATTUNE_GROUP_INFO[key];
    form.button(
      labeledButton(
        paint(groupInk(key), GROUP_LABELS[key]),
        `${identity} · ${focus}`
      )
    );
  }
  form.button(paint(Ink.purple, "Open Attunement Forge"));
  form.button(uiBack());

  showGuideForm(form, player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    if (res.selection < GROUP_ORDER.length) {
      showAttuneGroup(player, GROUP_ORDER[res.selection]);
      return;
    }
    if (res.selection === GROUP_ORDER.length) {
      openAttunement(player, openAttuneCodex);
      return;
    }
    openGuidebook(player);
  });
}

function showWhatsNew(player) {
  showTextPage(
    player,
    "What's New",
    [
      `${paint(Ink.gold, `Test Build ${TEST_BUILD}`)}`,
      "",
      `${paint(Ink.purple, "Attunement Forge")}`,
      "Tap the placed Forge once to open its ritual menu directly.",
      "Choose a relic, affinity recipe, and rarity; the menu shows",
      "both required focus materials and your current inventory counts.",
      "",
      `${paint(Ink.highlight, "32 behavior-evolving attunements")}`,
      "Eight color-coded groups: Might, Ward, Gale, Fortune,",
      "Vitality, Alchemy, Necromancy, and Radiance.",
      "Marks, combos, fields, wagers, reactions, summons, and lightning",
      "replace the old potion-effect pool.",
      "",
      `${paint(Ink.good, "Wear-to-level progression")}`,
      "Attuned relics gain XP from combat, mining, and active play.",
      "Common caps at I, Uncommon II, Rare III, and Epic IV.",
      "Each unlocked level adds behavior, not only a larger number.",
      "A second attunement slot opens at relic level 5.",
      "",
      `${paint(Ink.aqua, "Individual relics")}`,
      "Every physical relic copy now keeps its own rolls and XP.",
      "Blocked same-job combinations are filtered before materials are spent.",
      "",
      uiDim("Most skills fire automatically in combat. Sprint-jump = Tempest Tithe. Midair jump = Gale Anchor."),
    ].join("\n"),
    openGuidebook
  );
}

function openRelicCatalog(player) {
  const form = new ActionFormData()
    .title(uiTitle("Relic Catalog"))
    .body(
      `${uiBody("Browse by equipment slot.")}\n${uiDim("Every entry includes its icon and exact effect.")}`
    );

  const categories = [
    "face",
    "head",
    "necklace",
    "ring",
    "charm",
    "back",
    "body",
    "belt",
    "hands",
    "feet",
    "special",
    "master",
  ];
  for (const slot of categories) {
    const label = GUIDE_LABELS[slot];
    const count = relicsForSlot(slot).length;
    form.button(`§e${label}§r §8(${count})§r`);
  }
  form.button(uiBack());

  showGuideForm(form, player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    if (res.selection >= categories.length) {
      openGuidebook(player);
      return;
    }
    showSlotCatalog(player, categories[res.selection]);
  });
}

function openSettings(player) {
  const sense = isRelicSenseEnabled(player);
  const boosts = areBoostsEnabled(player);
  const notifications = areEffectNotificationsEnabled(player);
  const form = new ActionFormData()
    .title(uiTitle("RPG Relics Settings"))
    .body(
      [
        uiBody("Personal toggles — saved per player."),
        "",
        `${uiHighlight("Relic Sense")} — points you toward a nearby`,
        "tower, home, or underground camp.",
        `Status: ${sense ? paint(Ink.good, "Enabled") : paint(Ink.bad, "Disabled")}`,
        "",
        `${uiHighlight("Boosts")} — loadout playstyle bonuses`,
        "(Might, Ward, Gale, Fortune, Vitality, Alchemy).",
        `Status: ${boosts ? paint(Ink.good, "Enabled") : paint(Ink.bad, "Disabled")}`,
        "",
        `${uiHighlight("Effect notifications")} — short action-bar`,
        "messages when relic effects trigger.",
        `Status: ${notifications ? paint(Ink.good, "Enabled") : paint(Ink.bad, "Disabled")}`,
        "",
        uiDim("Equipped relic effects still work when Boosts are off."),
      ].join("\n")
    )
    .button(`${sense ? paint(Ink.good, "ON") : paint(Ink.bad, "OFF")} ${uiBody("Relic Sense")}`)
    .button(`${boosts ? paint(Ink.good, "ON") : paint(Ink.bad, "OFF")} ${uiBody("Boosts")}`)
    .button(
      `${notifications ? paint(Ink.good, "ON") : paint(Ink.bad, "OFF")} ${uiBody("Effect notifications")}`
    )
    .button(uiBack());

  showGuideForm(form, player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    if (res.selection === 0) {
      const enabled = toggleRelicSense(player);
      if (!enabled) clearRelicSense(player);
      openSettings(player);
      return;
    }
    if (res.selection === 1) {
      toggleBoosts(player);
      openSettings(player);
      return;
    }
    if (res.selection === 2) {
      toggleEffectNotifications(player);
      openSettings(player);
      return;
    }
    openGuidebook(player);
  });
}

export function openGuidebook(player) {
  const form = new ActionFormData()
    .title(uiTitle("RPG Relics Guide"))
    .body(
      [
        uiBody("Tap a page for a short guide."),
        "",
        `${paint(Ink.gold, "What's New")} — latest features and changes`,
        `${paint(Ink.good, "Getting Started")} — open & use the Reliquary`,
        `${paint(Ink.aqua, "Find Relics")} — loot, towers, homes, camps`,
        `${paint(Ink.purple, "Relic Sense")} — track the nearest relic site`,
        `${paint(Ink.purple, "Craft & Upgrade")} — shards, forge, fusions`,
        `${paint(Ink.violet, "Boosts")} — playstyle abilities (Might, Ward, Gale…)`,
        `${paint(Ink.purple, "Attunement Skillbook")} — every skill, trigger, and level`,
        `${paint(Ink.bad, "Mimics")} — living chests that ambush & drop loot`,
        `${paint(Ink.highlight, "Relic Catalog")} — every relic, icon & exact effect`,
        `${paint(Ink.white, "Settings")} — Sense, Boosts, and notifications`,
      ].join("\n")
    );

  const pages = [
    "whatsnew",
    "start",
    "loot",
    "sense",
    "craft",
    "resonance",
    "attune",
    "mimics",
    "catalog",
    "settings",
  ];
  form.button(paint(Ink.gold, "What's New"));
  form.button(paint(Ink.good, "Getting Started"));
  form.button(paint(Ink.aqua, "Find Relics"));
  form.button(paint(Ink.purple, "Relic Sense"));
  form.button(paint(Ink.purple, "Craft & Upgrade"));
  form.button(paint(Ink.violet, "Boosts"));
  form.button(paint(Ink.purple, "Attunement Skillbook"));
  form.button(paint(Ink.bad, "Mimics"));
  form.button(paint(Ink.highlight, "Relic Catalog"));
  form.button(paint(Ink.white, "Settings"));
  form.button(uiDim("Close"));

  showGuideForm(form, player).then((res) => {
    if (res.canceled || res.selection === undefined || res.selection >= pages.length) return;
    const page = pages[res.selection];
    if (page === "settings") {
      openSettings(player);
      return;
    }
    if (page === "whatsnew") {
      showWhatsNew(player);
      return;
    }
    if (page === "sense") {
      startRelicSense(player);
      return;
    }
    if (page === "catalog") {
      openRelicCatalog(player);
      return;
    }
    if (page === "attune") {
      openAttuneCodex(player);
      return;
    }
    if (page === "resonance") {
      openBoostCodex(player);
      return;
    }
    if (page === "start") {
      showTextPage(
        player,
        "Getting Started",
        [
          "§61. Open the Reliquary§r",
          "Use your §eRelic Crate§r or §e/scriptevent relics:open_menu§r.",
          "",
          "§62. Interact§r",
          "A wardrobe appears at your feet — interact to open it.",
          "",
          "§63. Drag relics in§r",
          "Drop relics into slots. Effects apply while equipped.",
          "",
          "§64. Close when done§r",
          "Closing the menu despawns it. Idle sessions last ~10s.",
          "",
          "§65. Attunement Forge§r",
          "Use your §dAttunement Forge§r item — or place the",
          "§dAttunement Forge§r anvil block and tap it.",
          "Choose a relic, then an affinity. Every affinity",
          "shows its exact two-material recipe and your counts.",
          "Choose rarity and confirm; all costs come from your bag.",
          "Arcane Dust must pair with Fang, Herb, or Silver.",
          "Wear attuned relics to level them up.",
          "Most skills fire automatically while you fight, heal, or get surrounded.",
          "Sprint-jump for Tempest Tithe. Midair jump for Gale Anchor.",
          "",
          "Craft a §eReliquary§r: §echest + book + iron ingot§r.",
          "Guidebook: §ebook + gold nugget§r.",
          "",
          "§aFirst join gives Relic Tome, Relic Crate, and Attunement Forge.§r",
        ].join("\n"),
        openGuidebook
      );
      return;
    }
    if (page === "loot") {
      showTextPage(
        player,
        "Find Relics",
        [
          "§6Exploration loot§r",
          "Relics drop from chests, camps, mimics, archaeology, and mobs.",
          "§eRelic Shards§r also drop — used for crafting.",
          "",
          "§eDungeon & mine chests§r",
          "§714%§r surface · §e22%§r shallow · §632%§r deep, first open.",
          "",
          "§eRelic towers & homes§r",
          "Two surface structures in new chunks.",
          "§7~1/80§r normal · §7~1/110§r mimic variants.",
          "Spruce pillager tower or sandstone-roof witch house.",
          "Interior loot chests; witches, pillagers, and mimics.",
          "Find: §e/scriptevent relics:tower§r",
          "TP: §e/scriptevent relics:tower_tp§r",
          "",
          "§eMimics§r",
          "§718%§r chance when opening deep chests — defeat for relics + shards.",
          "",
          "§eArchaeology§r",
          "Brush suspicious sand/gravel — §e22%§r chance to uncover a relic.",
          "",
          "§eHostile mobs§r",
          "§75%§r relic drop; §725%§r bonus shard chance.",
          "",
          "§eUnderground camps§r",
          "Frequent campsites around §bY -50..0§r.",
          "Camp chests/barrels use §erelics:§r loot tables (60% scripted bonus).",
          "Find: §e/scriptevent relics:camp§r",
          "TP: §e/scriptevent relics:camp_tp§r",
        ].join("\n"),
        openGuidebook
      );
      return;
    }
    if (page === "craft") {
      showTextPage(
        player,
        "Craft & Upgrade",
        [
          "§6Relic Shards§r",
          "Found in loot tables, mimics, mobs, and archaeology.",
          "",
          "§6Relic Forge§r",
          "Craft with amethyst, book, deepslate bricks + crafting table.",
          "Looks like a purple/gold crafting table.",
          "Open it for the §ereal Bedrock crafting UI§r — Relic recipes only.",
          "Test: §e/give @s relics:relic_forge§r",
          "",
          "§eRPG materials§r",
          "Monster Hearts: zombies, husks, drowned, brutes, ravagers, wardens.",
          "Beast Fangs: spiders, hoglins, ravagers, wardens.",
          "Arcane Dust: witches, endermen, evokers, shulkers.",
          "Mystic Herbs: grass/flowers, plus relic tower & home chests.",
          "Silver Fragments: skeletons, strays, illagers, zombie villagers, relic chests.",
          "Crimson Crystals: creepers, blazes, magma cubes, wither skeletons.",
          "§8Custom ore blocks are planned for a future update/add-on.§r",
          "",
          "§eStarter crafts§r",
          "Bloom Band, Miner's Ring, Plague Mask, Puff Bottle,",
          "Excavator Gauntlets, Ashen Vessel — forge only.",
          "",
          "§6Ascended relics (tier 3)§r",
          "Fuse two similar relics + a §ethemed RPG material§r at the Relic Forge.",
          "Catalysts include hearts, dust, herbs, silver, crystals, and shards.",
          "Example: Plague Mask + Ashen Vessel → §eVenom Ward§r.",
          "",
          "§eAll 10 fusions§r",
          "Venom Ward · Nimbus Mantle · Inferno Brand",
          "Veinheart Gauntlets · Vital Bloom · Alchemist's Focus",
          "Tempest Choker · Gale Aegis · Bulwark Plate · Treasure Lure",
          "",
          "Browse §eAscended§r in the Relic Catalog for exact effects.",
        ].join("\n"),
        openGuidebook
      );
      return;
    }
    if (page === "mimics") {
      showTextPage(
        player,
        "Mimics",
        [
          "§cWhat is a Mimic?§r",
          "A living chest — looks like loot until you get close,",
          "then it wakes and bites (toothy chest monster).",
          "",
          "§6Where they spawn§r",
          "§7•§r Mimic camps underground (§bdormant chests§r)",
          "§7•§r Deep real chests (§bY ≤ 24§r) — rare ambush",
          "§7•§r Biome-themed skins: forest, desert, swamp,",
          "    snow, jungle, badlands",
          "",
          "§6How to fight§r",
          "Sleeps until you approach. Jaw snaps open when it attacks.",
          "Each biome bite carries a different status effect:",
          "§7• Forest§r poison + slow   §7• Desert§r hunger + weak",
          "§7• Badlands§r fire            §7• Snow§r frost + fatigue",
          "§7• Swamp§r strong poison    §7• Jungle§r blind + poison",
          "Test: §e/give @s relics:spawn_mimic_forest§r",
          "Creative: §eMimics§r item group",
          "",
          "§6Rewards§r",
          "Drops relic loot + §eRelic Shards§r on defeat.",
          "",
          "§8Craft a Reliquary (chest + book + iron) before caving.",
        ].join("\n"),
        openGuidebook
      );
      return;
    }
  });
}
