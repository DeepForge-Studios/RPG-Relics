import { ActionFormData } from "@minecraft/server-ui";
import { RELIC_REGISTRY, SLOT_LABELS } from "./registry.js";
import { RELIC_UPGRADES } from "./upgrades.js";
import { clearRelicSense, startRelicSense } from "./acquisition.js";
import {
  areBoostsEnabled,
  areEffectNotificationsEnabled,
  BALANCE_OP,
  cycleBalanceMode,
  getBalanceMode,
  isAttunementEnabled,
  isRelicSenseEnabled,
  toggleAttunement,
  toggleBoosts,
  toggleEffectNotifications,
  toggleRelicSense,
} from "./settings.js";
import {
  affinityAndAttuneLines,
  describeRelic,
  shortBlurb,
  relicIconPath,
  labeledButton,
  loreOptsForPlayer,
} from "./descriptions.js";
import { BOOST_ABILITIES } from "./boosts_data.js";
import { boostLoadout } from "./hooks.js";
import {
  GROUP_ORDER,
  GROUP_LABELS,
  POOL,
  RARITY,
  RARITY_ORDER,
  RITUAL_COSTS,
  affinityClassLabel,
  groupInk,
} from "./attune_pool.js";
import { TEST_BUILD } from "./build_info.js";
import { refreshPlayerRelicLore } from "./relics.js";
import {
  Ink,
  uiTitle,
  uiAccentTitle,
  uiBody,
  uiMuted,
  uiDim,
  uiHighlight,
  uiBack,
  uiClose,
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

/** Call as soon as the player uses the tome so heavy ticks pause before the form paints. */
export function markGuidebookPending(player) {
  if (player?.id) openGuidebooks.add(player.id);
}

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
    ...affinityAndAttuneLines(relic.id, relic.def, loreOptsForPlayer(player)),
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
  if (!loadout.enabled) return "§8Affinity is disabled in Settings.§r";
  if (!loadout.equipped) return "§7Equip relics in the Reliquary to activate an Affinity.§r";
  const a = loadout.active;
  if (!a) return "§7No active Affinity.§r";
  const roman = "I".repeat(a.level);
  return `§fActive: ${BOOST_ABILITIES[a.affinity].color}${a.label} Affinity ${roman}§r §8(${a.score} power)§r`;
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
    "§eRank bonuses§r",
    ...info.tiers.map((line, i) => {
      const unlocked = level >= i + 1;
      const mark = unlocked ? "§a●§r" : "§8○§r";
      return `${mark} ${unlocked ? "§f" : "§8"}${line}§r`;
    }),
    "",
    `§7Your power in this class:§r §f${power}§r`,
    level > 0
      ? `§7Your rank:§r §f${"I".repeat(level)}§r §8(from best relic)§r`
      : "§8Equip relics of this class to unlock ranks.§r",
    isActive ? "§aActive Affinity.§r" : "§8Not active — another class has more power.§r",
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
  return affinityClassLabel(key);
}

/** Affinity Codex — loadout class bonuses I–III + live power. */
export function openBoostCodex(player) {
  const loadout = boostLoadout(player);
  const form = new ActionFormData()
    .title(uiAccentTitle("Affinity Codex"))
    .body(
      [
        uiBody("Equip relics. Your strongest class becomes the active Affinity."),
        uiMuted("Rank I–III = best relic of that class (Common / Uncommon / Rare·Ascended)."),
        uiMuted("Power picks the winner (Common +1 · Uncommon +2 · Rare/Ascended +3)."),
        "",
        boostActiveLine(loadout),
        "",
        uiDim("Tap a class for its bonus."),
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
        power > 0 ? `${power} power · rank ${"I".repeat(Math.min(3, loadout.levels[key] || 1))}` : "0 power · unequipped"
      )
    );
  }
  form.button(uiBack());

  showGuideForm(form, player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    if (res.selection >= BOOST_KEYS.length) {
      openSystemsChapter(player);
      return;
    }
    showBoostDetail(player, BOOST_KEYS[res.selection]);
  });
}

const ATTUNE_GROUP_INFO = {
  might: ["Monster Heart + Beast Fang", "build pressure, then burst"],
  ward: ["Silver Fragment + Monster Heart", "soak hits and hold ground"],
  gale: ["Beast Fang + Arcane Gem", "reposition through combat"],
  fortune: ["Silver Fragment + Beast Fang", "make visible wagers"],
  vitality: ["Mystic Herb + Monster Heart", "perform healing rituals"],
  alchemy: ["Arcane Gem + Mystic Herb", "mix colors into reactions"],
  necromancy: ["Crimson Crystal + Monster Heart", "harvest and spend souls"],
  radiance: ["Silver Fragment + Arcane Gem", "brand and consecrate"],
};

const ATTUNE_ACTIVE_SKILLS = new Set([
  // Kept for Skillbook "movement" labeling only — these still use Jump.
  "tempest_tithe",
  "gale_anchor",
]);

const ATTUNE_TERMS = [
  ["soul charge", "Soul Charge: energy banked from kills. Three charges fire Corpse Lantern or Pale Conscription."],
  ["wager", "Wager: a timed bet. Kill the marked target before time runs out to win."],
  ["catalyst", "Catalyst: a Forge material such as a Heart, Fang, Gem, Herb, Silver, or Crystal."],
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

function showAttuneSkill(player, group, key, back) {
  const skill = POOL[group]?.[key];
  if (!skill) {
    showAttuneGroup(player, group, back);
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
    if (!res.canceled) showAttuneGroup(player, group, back);
  });
}

function showAttuneGroup(player, key, back) {
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
      openAttuneCodex(player, back);
      return;
    }
    showAttuneSkill(player, key, skills[res.selection][0], back);
  });
}

/** Skills / info browser. Rituals stay on the placed Attunement Forge. */
export function openAttuneCodex(player, back) {
  if (!isAttunementEnabled(player)) {
    try {
      player.sendMessage(
        "§8Attunement is disabled in Relic Tome settings (Relics-only mode)."
      );
    } catch {
    }
    if (back) back(player);
    return;
  }
  const rarityLine = [
    `${RARITY.common.ink}Common§r ${RITUAL_COSTS.common.shards}+${RITUAL_COSTS.common.focus}/${RITUAL_COSTS.common.focus} (I)`,
    `${RARITY.uncommon.ink}Uncommon§r ${RITUAL_COSTS.uncommon.shards}+${RITUAL_COSTS.uncommon.focus}/${RITUAL_COSTS.uncommon.focus} (II)`,
    `${RARITY.rare.ink}Rare§r ${RITUAL_COSTS.rare.shards}+${RITUAL_COSTS.rare.focus}/${RITUAL_COSTS.rare.focus} (III)`,
    `${RARITY.epic.ink}Epic§r ${RITUAL_COSTS.epic.shards}+${RITUAL_COSTS.epic.focus}/${RITUAL_COSTS.epic.focus} (IV)`,
  ].join(" · ");
  const form = new ActionFormData()
    .title(uiAccentTitle("Attunement Codex"))
    .body(
      [
        uiBody("Browse every attunement skill — triggers, costs, and tiers."),
        "Choose an attune path, then choose a skill.",
        uiMuted("Class (Affinity) = the relic's class, e.g. Healer."),
        uiMuted("◆ Synergy = forging its primary path (stronger effects, −1 Arcane Dust)."),
        "Relics keep their base passive; attunements stack on top.",
        "Wear an attuned relic to level it. Relic level 5 opens slot two.",
        "",
        paint(Ink.purple, "Rituals: place an Attunement Forge and tap it."),
        "",
        rarityLine,
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
  form.button(back ? uiBack() : uiClose());

  showGuideForm(form, player).then((res) => {
    if (res.canceled || res.selection === undefined) return;
    if (res.selection < GROUP_ORDER.length) {
      showAttuneGroup(player, GROUP_ORDER[res.selection], back);
      return;
    }
    if (back) back(player);
  });
}

function showWhatsNew(player) {
  showTextPage(
    player,
    "What's New",
    [
      `${paint(Ink.gold, `Test Build ${TEST_BUILD}`)}`,
      "",
      `${paint(Ink.purple, "Affinity updates")}`,
      "Guardian — take less damage (15% / 25% / 35%), not deflect.",
      "Trickster — each ore block can roll a big multiplier drop:",
      "30% for 3× · 45% for 6× · 50% for 12× (no cooldown).",
      "",
      `${paint(Ink.purple, "Attunement Forge")}`,
      "Tap the placed Forge once to open its ritual menu directly.",
      "Choose a relic, attune path, and rarity; the menu shows",
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
  const attunement = isAttunementEnabled(player);
  const balance = getBalanceMode(player);
  const balanceOp = balance === BALANCE_OP;
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
        `${uiHighlight("Affinity")} — loadout class bonuses`,
        "(Berserker, Guardian, Scout, Trickster, Healer, Arcanist).",
        `Status: ${boosts ? paint(Ink.good, "Enabled") : paint(Ink.bad, "Disabled")}`,
        "",
        `${uiHighlight("Effect notifications")} — short action-bar`,
        "messages when relic effects trigger.",
        `Status: ${notifications ? paint(Ink.good, "Enabled") : paint(Ink.bad, "Disabled")}`,
        "",
        `${uiHighlight("Attunement")} — Codex, Forge rituals, skills,`,
        "and focus material drops (hearts, fangs, herbs…).",
        "Off = relics-only: base relics & Arcane Dust stay.",
        `Status: ${attunement ? paint(Ink.good, "Enabled") : paint(Ink.bad, "Disabled")}`,
        "",
        `${uiHighlight("Balance")} — Standard keeps normal cooldowns.`,
        "OP removes relic, Affinity, and attunement cooldowns.",
        `Status: ${
          balanceOp
            ? paint(Ink.highlight, "OP (no cooldowns)")
            : paint(Ink.good, "Standard")
        }`,
        "",
        uiDim("Equipped relic effects still work when Affinity is off."),
      ].join("\n")
    )
    .button(`${sense ? paint(Ink.good, "ON") : paint(Ink.bad, "OFF")} ${uiBody("Relic Sense")}`)
    .button(`${boosts ? paint(Ink.good, "ON") : paint(Ink.bad, "OFF")} ${uiBody("Affinity")}`)
    .button(
      `${notifications ? paint(Ink.good, "ON") : paint(Ink.bad, "OFF")} ${uiBody("Effect notifications")}`
    )
    .button(
      `${attunement ? paint(Ink.good, "ON") : paint(Ink.bad, "OFF")} ${uiBody("Attunement")}`
    )
    .button(
      `${
        balanceOp ? paint(Ink.highlight, "OP") : paint(Ink.good, "Standard")
      } ${uiBody("Balance")}`
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
      refreshPlayerRelicLore(player);
      openSettings(player);
      return;
    }
    if (res.selection === 2) {
      toggleEffectNotifications(player);
      openSettings(player);
      return;
    }
    if (res.selection === 3) {
      toggleAttunement(player);
      refreshPlayerRelicLore(player);
      openSettings(player);
      return;
    }
    if (res.selection === 4) {
      cycleBalanceMode(player);
      openSettings(player);
      return;
    }
    openGuidebook(player);
  });
}

export function openGuidebook(player) {
  refreshPlayerRelicLore(player);
  const loadout = boostLoadout(player);
  const form = new ActionFormData()
    .title(uiTitle("RPG Relics Guide"))
    .body(
      [
        uiBody("Pick a chapter — shorter lists inside."),
        "",
        boostActiveLine(loadout),
        "",
        uiMuted("Active Affinity also flashes on the action bar when it procs."),
      ].join("\n")
    );

  form.button(labeledButton(paint(Ink.gold, "Start Here"), "basics & crate"));
  form.button(labeledButton(paint(Ink.aqua, "Adventure"), "find relics"));
  form.button(labeledButton(paint(Ink.violet, "Systems"), "Affinity & Forge"));
  form.button(labeledButton(paint(Ink.highlight, "Relic Catalog"), "browse relics"));
  form.button(labeledButton(paint(Ink.white, "Settings"), "toggles & balance"));
  form.button(uiDim("Close"));

  const chapters = ["start_hub", "adventure", "systems", "catalog", "settings"];
  showGuideForm(form, player).then((res) => {
    if (res.canceled || res.selection === undefined || res.selection >= chapters.length) return;
    const ch = chapters[res.selection];
    if (ch === "settings") {
      openSettings(player);
      return;
    }
    if (ch === "catalog") {
      openRelicCatalog(player);
      return;
    }
    if (ch === "start_hub") {
      openStartChapter(player);
      return;
    }
    if (ch === "adventure") {
      openAdventureChapter(player);
      return;
    }
    if (ch === "systems") {
      openSystemsChapter(player);
      return;
    }
  });
}

function openStartChapter(player) {
  const form = new ActionFormData()
    .title(uiTitle("Start Here"))
    .body(
      [
        uiBody("New to RPG Relics?"),
        `${paint(Ink.gold, "What's New")} — latest pack notes`,
        `${paint(Ink.good, "Getting Started")} — Reliquary, Affinity, Attunement`,
      ].join("\n")
    )
    .button(paint(Ink.gold, "What's New"))
    .button(paint(Ink.good, "Getting Started"))
    .button(uiBack());

  showGuideForm(form, player).then((res) => {
    if (res.canceled || res.selection === undefined || res.selection >= 2) {
      openGuidebook(player);
      return;
    }
    if (res.selection === 0) {
      showWhatsNew(player);
      return;
    }
    showGettingStarted(player);
  });
}

function openAdventureChapter(player) {
  const form = new ActionFormData()
    .title(uiTitle("Adventure"))
    .body(
      [
        uiBody("Find relics in the world."),
        `${paint(Ink.aqua, "Find Relics")} — loot, towers, homes, camps`,
        `${paint(Ink.bad, "Mimics")} — living chests`,
        `${paint(Ink.purple, "Relic Sense")} — track the nearest site`,
      ].join("\n")
    )
    .button(paint(Ink.aqua, "Find Relics"))
    .button(paint(Ink.bad, "Mimics"))
    .button(paint(Ink.purple, "Relic Sense"))
    .button(uiBack());

  showGuideForm(form, player).then((res) => {
    if (res.canceled || res.selection === undefined || res.selection >= 3) {
      openGuidebook(player);
      return;
    }
    if (res.selection === 0) {
      showFindRelics(player);
      return;
    }
    if (res.selection === 1) {
      showMimicsPage(player);
      return;
    }
    startRelicSense(player);
  });
}

function openSystemsChapter(player) {
  const attunementOn = isAttunementEnabled(player);
  const loadout = boostLoadout(player);
  const form = new ActionFormData()
    .title(uiAccentTitle("Systems"))
    .body(
      [
        uiBody("Your loadout class and Forge skills."),
        boostActiveLine(loadout),
        "",
        `${paint(Ink.violet, "Affinity Codex")} — classes, ranks I–III, live power`,
        attunementOn
          ? `${paint(Ink.purple, "Attunement Codex")} — skills, triggers, levels`
          : `${paint(Ink.dim, "Attunement Codex")} — disabled in Settings`,
        `${paint(Ink.purple, "Craft & Upgrade")} — Dust, Forge, Ascended fusions`,
      ].join("\n")
    )
    .button(paint(Ink.violet, "Affinity Codex"))
    .button(
      attunementOn
        ? paint(Ink.purple, "Attunement Codex")
        : paint(Ink.dim, "Attunement Codex (off)")
    )
    .button(paint(Ink.purple, "Craft & Upgrade"))
    .button(uiBack());

  showGuideForm(form, player).then((res) => {
    if (res.canceled || res.selection === undefined || res.selection >= 3) {
      openGuidebook(player);
      return;
    }
    if (res.selection === 0) {
      openBoostCodex(player);
      return;
    }
    if (res.selection === 1) {
      openAttuneCodex(player, () => openSystemsChapter(player));
      return;
    }
    showCraftUpgrade(player);
  });
}

function showGettingStarted(player) {
  showTextPage(
    player,
    "Getting Started",
    [
      "§61. Open the Reliquary§r",
      "Use your §eRelic Crate§r.",
      "A wardrobe appears — interact, then drop relics into slots.",
      "",
      "§62. Equipped relics§r",
      "Effects apply while equipped. They stay on you when you die or log out.",
      "",
      "§63. Affinity (Class)§r",
      "Each relic has one §dAffinity class§r (e.g. Healer, Berserker).",
      "Your strongest equipped class is active (rank I–III).",
      "See: Tome → Systems → Affinity Codex.",
      "",
      "§64. Attunement & Synergy§r",
      "Study skills in the §dAttunement Codex§r.",
      "Place an §dAttunement Forge§r, pick a relic and path, then forge.",
      "◆ Synergy = the relic's §aprimary§r path — stronger effects and −1 Arcane Dust.",
      "Wear attuned relics to level them.",
      "",
      "Craft §eReliquary§r: chest + book + iron. Guidebook: book + gold nugget.",
      "§aFirst join gives Relic Tome, Relic Crate, and Attunement Codex.§r",
    ].join("\n"),
    () => openStartChapter(player)
  );
}

function showFindRelics(player) {
  showTextPage(
    player,
    "Find Relics",
    [
      "§6Exploration loot§r",
      "Relics drop from chests, camps, mimics, archaeology, and mobs.",
      "§eArcane Dust§r also drops — used for crafting and Forge rituals.",
      "",
      "§eDungeon & mine chests§r",
      "§714%§r surface · §e22%§r shallow · §632%§r deep, first open.",
      "",
      "§eRelic towers & homes§r",
      "Two surface structures in new chunks.",
      "§7~1/20§r normal · §7~1/28§r mimic variants.",
      "Spruce tower or sandstone-roof witch house (50/50).",
      "Interior loot chests; undead hostiles and mimics.",
      "§8Dev: /scriptevent relics:tower · relics:tower_tp§r",
      "",
      "§eMimics§r",
      "§724%§r deep chests · §728%§r camp chests — defeat for relics + shards.",
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
      "§8Dev: /scriptevent relics:camp · relics:camp_tp§r",
    ].join("\n"),
    () => openAdventureChapter(player)
  );
}

function showCraftUpgrade(player) {
  showTextPage(
    player,
    "Craft & Upgrade",
    [
      "§6Arcane Dust§r",
      "Found in loot tables, mimics, mobs, and archaeology.",
      "Spend it at the Attunement Forge and Relic Forge.",
      "",
      "§6Relic Forge§r",
      "Craft with amethyst, book, deepslate bricks + crafting table.",
      "Looks like a purple/gold crafting table.",
      "Open it for the §ereal Bedrock crafting UI§r — Relic recipes only.",
      "",
      "§eRPG materials§r",
      "Monster Hearts: zombies, husks, drowned, brutes, ravagers, wardens.",
      "Beast Fangs: spiders, hoglins, ravagers, wardens.",
      "Arcane Gem: witches, endermen, evokers, shulkers.",
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
    () => openSystemsChapter(player)
  );
}

function showMimicsPage(player) {
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
      "§7•§r Deep real chests (§bY ≤ 24§r) — §724%§r ambush (§728%§r camps)",
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
      "Drops relic loot + §eArcane Dust§r on defeat.",
      "",
      "§8Craft a Reliquary (chest + book + iron) before caving.",
    ].join("\n"),
    () => openAdventureChapter(player)
  );
}

