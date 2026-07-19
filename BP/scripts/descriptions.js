import { LOOT_COMMON, LOOT_UNCOMMON, LOOT_RARE } from "./loot_pools.js";
import { isUpgradeRelic } from "./upgrades.js";
import { getExternalRelicDef } from "./api.js";
import { BoostInk, TierInk, Ink, AttuneInk } from "./theme.js";
import { ITEM_ICON_TEXTURES } from "./relic_icons.js";
import { FOCUS_RECIPES, GROUP_LABELS, SHARD_ID } from "./attune_pool.js";

const EFFECT_LABELS = {
  night_vision: "Night Vision",
  saturation: "keeps you full",
  water_breathing: "breathe underwater",
  village_hero: "better villager trades",
  resistance: "Resistance",
  speed: "Speed",
  luck: "Luck",
  haste: "Haste",
  invisibility: "Invisibility",
  jump_boost: "Jump Boost",
  health_boost: "extra hearts",
  slow_falling: "Slow Falling",
  strength: "Strength",
  dolphins_grace: "swim faster",
  regeneration: "Regeneration",
  fire_resistance: "Fire Resistance",
};

const CUSTOM_SHORT = {
  fluid_movement: "Faster in water and lava",
  swim_boost: "Strong swim boost",
  purify_effects: "Shortens bad effects",
  fire_res_on_burn: "Fire Resistance while worn",
  item_magnet: "Pulls nearby items",
  liquid_sprint: "Walk on water and lava",
  no_fall_damage: "No fall damage",
  repel_creepers: "Keeps creepers back",
  knockback_resist: "Less knockback",
  random_noise: "Makes silly sounds sometimes",
  reveal_hostiles: "Shows nearby mobs",
  toxin_filter: "Blocks poison and wither",
  wither_cleanse: "Clears Wither",
  full_toxin_ward: "Blocks poison and wither",
  double_ore: "Chance for bonus ore",
  second_wind: "Heals you when low",
  execute_low_hp: "Extra damage to weak foes",
  phase_dodge: "Chance to dodge hits",
  double_jump: "Double jump",
  triple_jump: "Triple jump",
  gale_glide: "Sneak midair to glide",
  crystal_shards: "Hurts foes when you're hit",
  sustaining_cap: "Slowly restores hunger",
  potion_linger: "Potions last longer",
  grand_alchemy: "Purify + longer potions",
  fishing_haul: "Extra fishing loot",
};

const CUSTOM_LONG = {
  fluid_movement: "Move much faster in water or lava (Speed + Dolphin's Grace).",
  swim_boost: "Strong swim boost in water (Dolphin's Grace III + Speed).",
  purify_effects: "Shortens bad potion effects on you.",
  fire_res_on_burn:
    "Always grants Fire Resistance while equipped. Blocks burn/lava hits when possible.",
  item_magnet: "Strongly pulls nearby dropped items toward you.",
  liquid_sprint: "Walk across water and lava (frost ice / magma underfoot). Sneak to sink.",
  no_fall_damage: "Negates fall damage.",
  repel_creepers: "Pushes nearby creepers away.",
  knockback_resist: "Reduces knockback (Resistance stand-in).",
  random_noise: "Random silly sounds while worn.",
  reveal_hostiles: "Periodically outlines nearby hostile creatures with glowing.",
  toxin_filter: "Clears poison/wither and blocks toxin damage while worn.",
  wither_cleanse: "Constantly clears Wither from you and blocks wither damage while worn.",
  full_toxin_ward: "Clears poison and wither every tick and blocks toxin/wither damage.",
  double_ore: "Chance to drop extra ore when mining ore blocks.",
  second_wind: "At 5 hearts or less: Regeneration III + Speed for 10 seconds (30-second cooldown).",
  execute_low_hp: "Deals +4 damage to enemies below 35% health.",
  phase_dodge: "35% chance to completely block an incoming melee hit.",
  double_jump: "Jump again once while airborne.",
  triple_jump: "Jump, release, then jump twice more in mid-air.",
  gale_glide: "Sneak while airborne to glide forward with Slow Falling.",
  crystal_shards: "When struck, blasts nearby mobs with crystal shrapnel.",
  sustaining_cap: "Restores hunger in small pulses without a constantly flickering Saturation effect.",
  potion_linger: "After drinking a potion, its effects last 35% longer.",
  grand_alchemy: "Shortens bad effects by 70% once, and drunk potions last 50% longer.",
  fishing_haul: "Grants Luck III while equipped; every fishing catch also drops an extra haul item.",
};

const ROMAN = ["I", "II", "III", "IV", "V"];

const COMMON_SET = new Set(LOOT_COMMON);
const UNCOMMON_SET = new Set(LOOT_UNCOMMON);
const RARE_SET = new Set(LOOT_RARE);

function ampLabel(amplifier) {
  if (amplifier == null || amplifier <= 0) return "";
  return ` ${ROMAN[Math.min(amplifier, ROMAN.length - 1)] ?? amplifier + 1}`;
}

function effectText(effect, amplifier) {
  const name = EFFECT_LABELS[effect] ?? effect;
  return `${name}${ampLabel(amplifier)}`;
}

function pct(chance) {
  return `${Math.round((chance ?? 0) * 100)}%`;
}

export function getRelicTier(itemId) {
  if (!itemId) return "common";
  const externalTier = getExternalRelicDef(itemId)?.tier;
  if (externalTier === "common" || externalTier === "uncommon" || externalTier === "rare") {
    return externalTier;
  }
  if (isUpgradeRelic(itemId) || RARE_SET.has(itemId)) return "rare";
  if (UNCOMMON_SET.has(itemId)) return "uncommon";
  if (COMMON_SET.has(itemId)) return "common";
  return "common";
}

function tierLoreLine(tier) {
  if (tier === "uncommon") return `${TierInk.uncommon}Uncommon`;
  if (tier === "rare") return `${TierInk.rare}Rare`;
  return `${TierInk.common}Common`;
}

const AFFINITY_GALE = new Set([
  "fluid_movement", "swim_boost", "liquid_sprint", "double_jump",
  "triple_jump", "gale_glide", "no_fall_damage",
]);
const AFFINITY_WARD = new Set([
  "phase_dodge", "knockback_resist", "fire_res_on_burn", "repel_creepers", "crystal_shards",
]);
const AFFINITY_FORTUNE = new Set([
  "double_ore", "item_magnet", "fishing_haul", "reveal_hostiles",
]);
const AFFINITY_VITALITY = new Set(["second_wind", "sustaining_cap"]);
const AFFINITY_ALCHEMY = new Set([
  "purify_effects", "grand_alchemy", "potion_linger",
  "toxin_filter", "wither_cleanse", "full_toxin_ward",
]);

function relicAffinity(def) {
  const eff = def.passive?.effect;
  if (def.onAttack?.lifesteal) return { label: "Vitality", color: BoostInk.vitality };
  if (def.onAttack || def.custom === "execute_low_hp") return { label: "Might", color: BoostInk.might };
  if (def.onHurt || AFFINITY_WARD.has(def.custom) || eff === "resistance" || eff === "fire_resistance")
    return { label: "Ward", color: BoostInk.ward };
  if (AFFINITY_GALE.has(def.custom) || ["speed", "jump_boost", "slow_falling", "dolphins_grace"].includes(eff))
    return { label: "Gale", color: BoostInk.gale };
  if (AFFINITY_FORTUNE.has(def.custom) || def.onKill || ["luck", "village_hero", "haste"].includes(eff))
    return { label: "Fortune", color: BoostInk.fortune };
  if (AFFINITY_VITALITY.has(def.custom) || ["regeneration", "health_boost", "saturation"].includes(eff))
    return { label: "Vitality", color: BoostInk.vitality };
  return { label: "Alchemy", color: BoostInk.alchemy };
}

function slotLoreLine(def) {
  if (!def?.slot) return `${Ink.dim}Relic`;
  if (def.slot === "any") return `${Ink.dim}Any slot`;
  const label = def.slot.charAt(0).toUpperCase() + def.slot.slice(1);
  return `${Ink.dim}${label} slot`;
}

function collectBlurbParts(def) {
  const parts = [];
  if (def.passive?.effect) {
    parts.push(effectText(def.passive.effect, def.passive.amplifier));
  }
  if (def.custom && CUSTOM_SHORT[def.custom]) {
    const custom = CUSTOM_SHORT[def.custom];
    if (!(def.passive?.effect === "fire_resistance" && def.custom === "fire_res_on_burn")) {
      parts.push(custom);
    }
  }
  if (def.onHurt?.effect) {
    parts.push(`When hurt: ${effectText(def.onHurt.effect, def.onHurt.amplifier)}`);
  }
  if (def.onHurt?.thorns) {
    parts.push(
      def.onHurt.thorns.chance >= 1
        ? `Thorns ${def.onHurt.thorns.damage}`
        : `${pct(def.onHurt.thorns.chance)} chance to strike back`
    );
  }
  if (def.onAttack?.ignite) {
    parts.push(
      def.onAttack.ignite.chance >= 1
        ? "Sets enemies on fire"
        : `${pct(def.onAttack.ignite.chance)} chance to ignite`
    );
  }
  if (def.onAttack?.wither) parts.push("Wither on hit");
  if (def.onAttack?.lightning) {
    parts.push(
      def.onAttack.lightning.chance >= 1
        ? "Lightning on hit"
        : `${pct(def.onAttack.lightning.chance)} chance for lightning`
    );
  }
  if (def.onAttack?.knockback) parts.push("Extra knockback");
  if (def.onAttack?.bonusDamage) parts.push(`+${def.onAttack.bonusDamage} damage`);
  if (def.onAttack?.lifesteal) parts.push(`Lifesteal ${pct(def.onAttack.lifesteal)}`);
  if (def.onKill?.bonusXpOrbs) parts.push(`+${def.onKill.bonusXpOrbs} XP on kill`);
  if (typeof def.oreChance === "number") parts.push(`${pct(def.oreChance)} bonus ore`);
  return parts;
}

export function shortBlurb(def) {
  if (!def) return "";
  const parts = collectBlurbParts(def);
  return parts.length ? parts.join(" · ") : "Wearable relic";
}

export function describeRelic(def) {
  const lines = [];
  if (def.passive?.effect) {
    lines.push(`§aPassive:§r ${effectText(def.passive.effect, def.passive.amplifier)}`);
  }
  if (def.onHurt?.effect) {
    lines.push(`§cWhen hurt:§r ${effectText(def.onHurt.effect, def.onHurt.amplifier)}`);
  }
  if (def.onHurt?.thorns) {
    const chance = def.onHurt.thorns.chance ?? 1;
    lines.push(
      chance >= 1
        ? `§cThorns:§r Deals ${def.onHurt.thorns.damage} damage whenever struck`
        : `§cWhen hurt:§r ${pct(chance)} chance to strike back for ${def.onHurt.thorns.damage}`
    );
  }
  if (def.onAttack?.ignite) {
    const chance = def.onAttack.ignite.chance ?? 1;
    const secs = def.onAttack.ignite.seconds ?? 3;
    lines.push(
      chance >= 1
        ? `§6On hit:§r Sets target on fire (${secs}s)`
        : `§6On hit:§r ${pct(chance)} chance to set target on fire (${secs}s)`
    );
  }
  if (def.onAttack?.wither) {
    const amp = ampLabel(def.onAttack.wither.amplifier);
    lines.push(`§6On hit:§r Applies Wither${amp} (every hit)`);
  }
  if (def.onAttack?.lightning) {
    const chance = def.onAttack.lightning.chance ?? 1;
    lines.push(
      chance >= 1
        ? "§6On hit:§r Calls lightning every hit"
        : `§6On hit:§r ${pct(chance)} chance to call lightning`
    );
  }
  if (def.onAttack?.knockback) lines.push(`§6On hit:§r Extra knockback`);
  if (def.onAttack?.bonusDamage) {
    lines.push(`§6On hit:§r +${def.onAttack.bonusDamage} bonus damage`);
  }
  if (def.onAttack?.lifesteal) {
    lines.push(`§6On hit:§r Heal ${pct(def.onAttack.lifesteal)} of damage dealt`);
  }
  if (def.onKill?.bonusXpOrbs) {
    lines.push(`§eOn kill:§r Drops ${def.onKill.bonusXpOrbs} visible bonus XP orbs`);
  }
  if (typeof def.oreChance === "number") {
    lines.push(`§eMining:§r ${pct(def.oreChance)} chance for bonus ore`);
  }
  if (def.custom && CUSTOM_LONG[def.custom]) {
    lines.push(`§bSpecial:§r ${CUSTOM_LONG[def.custom]}`);
  }
  return lines.length ? lines.join("\n") : "§7Wearable exploration relic.";
}

export function relicIconPath(itemId) {
  if (!itemId?.startsWith("relics:")) return undefined;
  const mapped = ITEM_ICON_TEXTURES[itemId];
  if (mapped) return mapped;
  const short = itemId.slice("relics:".length);
  const file = short === "menu" ? "relics_menu" : short;
  return `textures/items/${file}.png`;
}

export function labeledButton(title, blurb) {
  if (!blurb) return title;
  return `${title}\n§7${blurb}`;
}

const HELD_BLURBS = {
  "relics:endless_ration": "Hold to eat (~1.6s). Short recharge after.",
  "relics:storm_parasol": "Hold while airborne for Slow Falling",
  "relics:menu": "Opens the Reliquary",
  "relics:relic_guidebook": "How to find & use relics",
  "relics:attunement_tome": "Attunement Forge — bind relics with shards and paired focuses",
};

/** Forge material lore: which affinity groups each focus can attune. */
const MATERIAL_LORE = (() => {
  const byMaterial = {};
  for (const [group, pair] of Object.entries(FOCUS_RECIPES)) {
    for (const id of pair) (byMaterial[id] ??= []).push(group);
  }
  const out = {};
  for (const [id, groups] of Object.entries(byMaterial)) {
    out[id] = [
      "§7Attunement Forge focus",
      groups.map((g) => `${AttuneInk[g]}${GROUP_LABELS[g]}§r`).join(" §8· "),
    ];
  }
  out[SHARD_ID] = ["§7Fuel for every Forge ritual"];
  return out;
})();

export function loreLinesForItem(itemId, def) {
  const lines = [];
  if (def) {
    if (isUpgradeRelic(itemId)) {
      lines.push("§d✦ Ascended Relic");
    }
    const aff = relicAffinity(def);
    lines.push(`${tierLoreLine(getRelicTier(itemId))} §8• ${aff.color}${aff.label} Boost`);
    lines.push(slotLoreLine(def));
    lines.push(`§7${shortBlurb(def)}`);
  } else if (MATERIAL_LORE[itemId]) {
    lines.push(...MATERIAL_LORE[itemId]);
  } else if (HELD_BLURBS[itemId]) {
    lines.push(`§7${HELD_BLURBS[itemId]}`);
  }
  return lines;
}
