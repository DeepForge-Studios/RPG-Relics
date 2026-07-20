/**
 * Attunement V3 catalog and Forge ritual rules.
 * Rarity unlocks behavior clauses; it is not a scalar potion-effect tier.
 */
import { getRelicDef } from "./registry.js";
import { AttuneInk, RarityInk } from "./theme.js";

export const GROUP_ORDER = [
  "might",
  "ward",
  "gale",
  "fortune",
  "vitality",
  "alchemy",
  "necromancy",
  "radiance",
];

export const GROUP_LABELS = {
  might: "Might",
  ward: "Ward",
  gale: "Gale",
  fortune: "Fortune",
  vitality: "Vitality",
  alchemy: "Alchemy",
  necromancy: "Necromancy",
  radiance: "Radiance",
};

/**
 * Player-facing class name for a relic's Affinity (Boost lean).
 * Display only — internal keys stay might|ward|gale|fortune|vitality|alchemy.
 */
export const AFFINITY_CLASS_LABELS = Object.freeze({
  might: "Berserker",
  ward: "Guardian",
  gale: "Scout",
  fortune: "Trickster",
  vitality: "Healer",
  alchemy: "Arcanist",
});

/** Class label for an affinity key (falls back to Arcanist). */
export function affinityClassLabel(key) {
  return AFFINITY_CLASS_LABELS[key] ?? AFFINITY_CLASS_LABELS.alchemy;
}

export const RARITY = {
  common: { cap: 1, ink: RarityInk.common, label: "Common" },
  uncommon: { cap: 2, ink: RarityInk.uncommon, label: "Uncommon" },
  rare: { cap: 3, ink: RarityInk.rare, label: "Rare" },
  epic: { cap: 4, ink: RarityInk.epic, label: "Epic" },
};

export const RARITY_ORDER = ["common", "uncommon", "rare", "epic"];

export const RITUAL_COSTS = {
  common: { shards: 2, focus: 1 },
  uncommon: { shards: 5, focus: 2 },
  rare: { shards: 10, focus: 3 },
  epic: { shards: 20, focus: 5 },
};

export const SHARD_ID = "relics:relic_shard";

export const FOCUS_RECIPES = {
  might: ["relics:monster_heart", "relics:beast_fang"],
  ward: ["relics:silver_fragment", "relics:monster_heart"],
  gale: ["relics:beast_fang", "relics:arcane_dust"],
  fortune: ["relics:silver_fragment", "relics:beast_fang"],
  vitality: ["relics:mystic_herb", "relics:monster_heart"],
  alchemy: ["relics:arcane_dust", "relics:mystic_herb"],
  necromancy: ["relics:crimson_crystal", "relics:monster_heart"],
  radiance: ["relics:silver_fragment", "relics:arcane_dust"],
};

export const FOCUS_IDS = new Set(Object.values(FOCUS_RECIPES).flat());

/** Kept for older callers while the Forge migrates to focus-pair rituals. */
export const FEEDER_GROUP = Object.fromEntries(
  [...FOCUS_IDS, SHARD_ID].map((id) => [id, null])
);
export const NEUTRAL_FEEDER = SHARD_ID;
export const FEEDER_BIAS = 0;

/**
 * @param extra { cooldown?, chance?, when?, cost? } — `when` is the plain
 * trigger sentence, `cost` the cooldown/payment sentence (both player-facing).
 */
function skill(name, kind, conflict, summary, tiers, extra = {}) {
  return { name, kind, conflict, summary, tiers, ...extra };
}

export const POOL = {
  might: {
    scarbrand: skill(
      "Scarbrand",
      "mark",
      "attack_brand",
      "Your first melee hit brands a hostile. Hit it again to break the brand for bonus damage.",
      [
        "Breaking a brand deals bonus damage.",
        "Branded enemies burst on death, chipping nearby hostiles.",
        "Three brand breaks arm an Execute Pulse on your next hit.",
        "The Execute pulls you to the target and flings nearby hostiles away.",
      ],
      { cooldown: 0, when: "Melee hits. The brand lasts 8 seconds.", cost: "One brand per target." }
    ),
    rivet_streak: skill(
      "Rivet Streak",
      "combo",
      "melee_combo",
      "Fast, consecutive hits build three Rivets. The next hit breaks them in a shockwave.",
      [
        "The shockwave deals bonus impact damage.",
        "The shockwave also knocks enemies back.",
        "Breaking leaves a short-lived shatter disc on the ground.",
        "Enemies inside the disc are Marked Weak.",
      ],
      { cooldown: 0, when: "Melee hits landed within 1.5 seconds of each other.", cost: "Missing the timing window resets your Rivets." }
    ),
    cracked_rib_pact: skill(
      "Cracked-Rib Pact",
      "pact",
      "bloodprice",
      "At low health, your next melee hit becomes a heavy Pact Slam.",
      [
        "Dropping below half health arms the slam.",
        "The slam spends hunger to hit a wider area.",
        "The slam hits harder and reaches farther.",
        "Adds a ground burst, then 3 seconds of vulnerability.",
      ],
      { cooldown: 160, when: "Drop below half health — the next melee hit is a Pact Slam.", cost: "8-second cooldown after the slam." }
    ),
    warhorn_discord: skill(
      "Warhorn Discord",
      "killField",
      "kill_field",
      "Kills sound a warhorn that weakens nearby hostiles.",
      [
        "The horn Marks one nearby hostile Weak.",
        "The horn Marks two hostiles.",
        "The corpse leaves a 3-second discord field.",
        "The field also brands the strongest hostile with Scarbrand.",
      ],
      { cooldown: 240, when: "Kill a hostile while others are nearby.", cost: "12-second cooldown; affects up to five hostiles." }
    ),
  },
  ward: {
    quillguard: skill(
      "Quillguard",
      "retaliateProjectile",
      "hurt_projectile",
      "When a hostile hits you, a spectral arrow fires back at it.",
      [
        "Fires one arrow back.",
        "The arrow hits harder.",
        "The arrow briefly roots the attacker in place.",
        "Fires a fan of three arrows around the attacker.",
      ],
      { cooldown: 120, when: "Take direct damage from a nearby hostile.", cost: "6-second cooldown, shared with other counter skills." }
    ),
    bastion_glyph: skill(
      "Bastion Glyph",
      "defenseField",
      "defense_field",
      "A heavy hit stamps a Protection-style rune and Resistance IV under your feet.",
      [
        "Grants Resistance IV and soaks damage while you stand inside.",
        "Hostiles crossing the rune are slowed.",
        "The rune knocks enemies outward when it expires.",
        "It also sends a counter-wave at hostiles still inside.",
      ],
      { cooldown: 200, when: "Take 2 or more damage in a single hit.", cost: "10-second cooldown; one rune at a time." }
    ),
    oathchain: skill(
      "Oathchain",
      "hurtEcho",
      "hurt_echo",
      "The first hostile to hurt you becomes Oathbound, and later damage you take is partly echoed back to it.",
      [
        "A visible tether echoes part of your damage back.",
        "The echo grows stronger.",
        "Killing the Oathbound target grants a small damage buffer.",
        "Bind two targets; the chain bursts when either dies.",
      ],
      { cooldown: 300, when: "The first hostile that hits you after the cooldown.", cost: "15-second cooldown; one Oathbound target (two at Epic)." }
    ),
    siege_root: skill(
      "Siege Root",
      "wardField",
      "ward_field",
      "When you are surrounded, a ward field and Siege Ward golem hold the line.",
      [
        "You resist knockback while inside the field.",
        "The field roots the first hostile that enters.",
        "A Siege Ward golem joins the defense.",
        "Its edge pushes back every hostile once.",
      ],
      { cooldown: 400, when: "Three or more hostiles within 6 blocks.", cost: "20-second cooldown; the field lasts about 15 seconds." }
    ),
  },
  gale: {
    crosswind_mark: skill(
      "Crosswind Mark",
      "movementMark",
      "movement_mark",
      "Melee hits mark a hostile with wind; the next hit blasts them the way you punch.",
      [
        "Knockback on the marked enemy follows your look.",
        "The redirect is stronger.",
        "A marked death releases a gust ring.",
        "Death passes the mark to the nearest hostile.",
      ],
      { when: "Melee hits. The mark lasts 6 seconds.", cost: "One wind mark per target." }
    ),
    slipstream_cut: skill(
      "Slipstream Cut",
      "combatDash",
      "combat_dash",
      "Sprint into a melee hit to dash straight through the target.",
      [
        "Dash through the target.",
        "The dash leaves a wind ribbon that boosts you once.",
        "The ribbon chips one hostile it touches.",
        "You may make one extra cut midair before landing.",
      ],
      { cooldown: 100, when: "Land a melee hit while sprinting.", cost: "5-second cooldown." }
    ),
    tempest_tithe: skill(
      "Tempest Tithe",
      "paidLeap",
      "paid_leap",
      "Sprint-jump to leap forward; landing releases a knockback ring.",
      [
        "Leap forward.",
        "Landing releases a knockback ring.",
        "A second midair jump spends 1 heart for another leap.",
        "Landing leaves a 3-second storm cell that pushes hostiles out.",
      ],
      { cooldown: 160, when: "Jump while sprinting on the ground.", cost: "8-second cooldown; costs 2 hunger." }
    ),
    gale_anchor: skill(
      "Gale Anchor",
      "anchor",
      "anchor_active",
      "Jump in midair to plant a wind anchor, then midair-jump again to pull to it.",
      [
        "Plant an anchor in the air.",
        "Pulling to it releases a gust.",
        "You can bounce between two anchors.",
        "The last pull leaves a brief cyclone that draws hostiles in.",
      ],
      {
        cooldown: 16,
        when: "Jump while airborne to plant. Jump in the air again to pull.",
        cost: "Short gap between plant and pull; anchors last 8 seconds.",
      }
    ),
  },
  fortune: {
    coinspin_hex: skill(
      "Coinspin Hex",
      "fortuneFlip",
      "fortune_flip",
      "Some melee hits flip a visible coin: heads rewards you, tails stings a little.",
      [
        "Heads adds a bonus strike; tails makes you stumble.",
        "Three heads in a row guarantee a heavy strike.",
        "Tails leaves a mark that heals a little on your next heads.",
        "The coin flips between two hostiles, helping one and harming the other.",
      ],
      { cooldown: 40, when: "Melee hits; about a 1 in 4 chance to flip.", cost: "2-second wait between flips." }
    ),
    mimics_wager: skill(
      "Mimic's Wager",
      "bounty",
      "bounty_mark",
      "Hitting a full-health hostile opens a wager: kill it in time to win a prize.",
      [
        "Winning the wager pays a small material prize.",
        "A shorter timer, but a better prize.",
        "Strike again during the wager to go double-or-nothing.",
        "The jackpot can pay out one themed catalyst.",
      ],
      { cooldown: 400, when: "Your first hit on a full-health hostile.", cost: "20-second cooldown; the wager lasts 10 seconds. Failing costs 2 hunger." }
    ),
    debt_of_plenty: skill(
      "Debt of Plenty",
      "debt",
      "fortune_debt",
      "Kills while well-fed open a hunger debt that briefly improves catalyst drops.",
      [
        "A small debt with a small payoff.",
        "Pay the debt off early with attunement XP.",
        "A harsher debt with richer drops.",
        "A second kill during the debt can jackpot — or sting harder.",
      ],
      { cooldown: 1200, when: "Kill a hostile while you have at least 7 hunger drums.", cost: "60-second cooldown; the debt drains hunger for 30 seconds." }
    ),
    gilded_rumor: skill(
      "Gilded Rumor",
      "rumor",
      "loot_duplicate",
      "Kills collect Rumors. At five, your next eligible mob drop is duplicated.",
      [
        "Bank five Rumors, then duplicate one drop stack.",
        "Spend Rumors early for a smaller payout.",
        "The payout can include a rare catalyst.",
        "Success opens a short gold rift; touch it for one extra material.",
      ],
      { when: "Hostile kills; each Rumor needs a 2-second gap.", cost: "One stored payout. Never duplicates ore, relics, or boss drops." }
    ),
  },
  vitality: {
    marrow_swap: skill(
      "Marrow Swap",
      "resourceHeal",
      "resource_heal",
      "When you drop low, hunger quickly trades into a chunk of health.",
      [
        "Trade 2 hunger for 2 hearts.",
        "The exchange rate improves.",
        "Overdraw into empty hunger for one extra heart.",
        "Leaves a short trade rune nearby allies can also touch.",
      ],
      { cooldown: 80, when: "Your health falls below about 65%.", cost: "Short cooldown; costs 2 hunger." }
    ),
    blood_tithe: skill(
      "Sanguine Pact",
      "bloodTithe",
      "heal_on_hit",
      "Spend a heart to open a crimson pact — melee hits reclaim it with clear feedback.",
      [
        "Hits during the window refund your heart.",
        "Opening the window also clears one negative effect.",
        "Refunds past full become a small damage buffer.",
        "Creates a 4-second circle that shares small refunds with allies.",
      ],
      { cooldown: 300, when: "Your health falls below half.", cost: "15-second cooldown; costs 1 heart (it can never kill you)." }
    ),
    heartforge: skill(
      "Heartforge",
      "heartforge",
      "death_save",
      "After staying unharmed for a while, your next meal forges bonus health.",
      [
        "The meal heals extra.",
        "Extra healing past full becomes a damage buffer.",
        "Rarely, survive a lethal hit at one heart.",
        "Surviving plants a healing blossom well.",
      ],
      { cooldown: 400, when: "Eat food after 8 seconds without taking damage.", cost: "20-second cooldown." }
    ),
    symbiotic_seed: skill(
      "Symbiotic Seed",
      "corpseSeed",
      "corpse_heal",
      "Some hostile deaths leave a seed: grab it now, or let it mature into something stronger.",
      [
        "Touch the seed for a small heal.",
        "A matured seed heals more.",
        "A matured seed also pulses healing to nearby allies.",
        "It can sprout a Vine Latch that roots one hostile.",
      ],
      { chance: 0.25, when: "Hostile kills; about a 1 in 4 seed chance.", cost: "Up to two seeds; each expires after 12 seconds." }
    ),
  },
  alchemy: {
    witchglass_retort: skill(
      "Witchglass Retort",
      "retaliatePotion",
      "hurt_potion",
      "When a hostile hits you, the Retort answers with a splash potion.",
      [
        "Throws a healing splash at your feet.",
        "Throws a harming splash at the attacker.",
        "Chooses the splash based on your health.",
        "Throws both splashes at once.",
      ],
      { cooldown: 160, when: "Take direct damage from a hostile.", cost: "8-second cooldown, shared with other counter skills." }
    ),
    vialmark: skill(
      "Vialmark",
      "reaction",
      "alchemy_mark",
      "Melee hits cycle three colored marks — Caustic, Frost, and Spark. Mixing two colors causes a reaction.",
      [
        "Two different colors react for bonus damage.",
        "Opposite-color reactions hit harder.",
        "Reactions leave a short damaging puddle.",
        "Landing all three colors triggers a Discord Reaction.",
      ],
      { cooldown: 40, when: "Melee hits. Each mark lasts 8 seconds.", cost: "One color per target; reactions have a 2-second wait." }
    ),
    crucible_bloom: skill(
      "Crucible Bloom",
      "alchemyField",
      "alchemy_field",
      "When you are surrounded, a crucible zone blooms underfoot and burns hostiles inside.",
      [
        "The zone chips hostiles inside.",
        "Kills inside the zone can drop Arcane Gems.",
        "The zone lasts longer and hits harder.",
        "When it ends, it pulls marked hostiles inward once.",
      ],
      { cooldown: 400, when: "Three or more hostiles within 6 blocks.", cost: "20-second cooldown; the zone lasts 6 seconds." }
    ),
    phial_familiar: skill(
      "Phial Familiar",
      "temporaryHelper",
      "temporary_familiar",
      "Taking a hit in a fight summons an orbiting phial that splashes your target.",
      [
        "The phial throws one kind of splash.",
        "It picks a stronger color after the first throw.",
        "It shatters into a damage buffer when you take a heavy hit.",
        "It alternates two colors, triggering Vialmark reactions.",
      ],
      { cooldown: 600, when: "Take damage while a hostile is nearby.", cost: "30-second cooldown; the phial lives 15 seconds." }
    ),
  },
  necromancy: {
    dirge_mark: skill(
      "Dirge Mark",
      "deathMark",
      "death_mark",
      "Mark a hostile. If it dies before the mark fades, its soul bursts into nearby enemies.",
      [
        "The death burst chips nearby hostiles.",
        "The mark spreads once to another hostile.",
        "The death leaves a 3-second grave pit.",
        "The pit raises a harmless decoy that soaks one hit.",
      ],
      { cooldown: 160, when: "Your first melee hit after the cooldown.", cost: "8-second cooldown; the mark lasts 10 seconds." }
    ),
    corpse_lantern: skill(
      "Corpse Lantern",
      "soulCharge",
      "soul_charge",
      "Kills bank Soul Charges. At three, a soul nova erupts automatically.",
      [
        "A soul nova bursts around you.",
        "The nova is larger.",
        "Uncollected lanterns become brief grave fields.",
        "If charges remain after the nova, a bone thrall may join.",
      ],
      { when: "Kill to bank charges. Reaching three charges fires the nova.", cost: "Holds up to three charges; lanterns expire after 10 seconds." }
    ),
    thanatoic_ledger: skill(
      "Thanatoic Ledger",
      "execute",
      "execute",
      "Nearby deaths fill your Ledger. At three, summon a wither-skeleton thrall army that hunts whoever you strike.",
      [
        "Summon 1 thrall for 20 seconds.",
        "Summon 2 thralls.",
        "Summon 3 thralls.",
        "Summon up to 5 thralls that chase your current target.",
      ],
      { when: "Deaths within range fill the Ledger; at 3 it summons the army.", cost: "Army lasts about 20 seconds. Max thralls = skill level (capped at 5)." }
    ),
    pale_conscription: skill(
      "Pale Conscription",
      "temporaryHelper",
      "temporary_familiar",
      "At three Soul Charges, a wither-skeleton Bone Thrall is conscripted automatically.",
      [
        "A Bone Thrall fights beside you.",
        "It lives longer.",
        "It bursts when it expires.",
        "Its final hit weakens the target and spreads a Dirge Mark.",
      ],
      { cooldown: 600, when: "Reach three Soul Charges from kills.", cost: "One retainer at a time; it lives about 20 seconds." }
    ),
  },
  radiance: {
    thunderbrand: skill(
      "Thunderbrand",
      "lightningBrand",
      "on_hit_lightning",
      "Some hits place a bright thunder mark; your next hit may call lightning on it.",
      [
        "Lightning strikes the marked target.",
        "The mark chance improves.",
        "The strike arcs to one nearby hostile.",
        "The strike leaves a 3-second storm cell that pulses once.",
      ],
      { cooldown: 200, chance: 0.15, when: "Melee hits; about a 1 in 7 mark chance.", cost: "10-second lightning cooldown; one mark per target." }
    ),
    judgment_brand: skill(
      "Judgment Brand",
      "judgmentBrand",
      "attack_brand",
      "Brand a hostile, then break the brand with your third hit for a burst of light.",
      [
        "The third hit releases a light burst.",
        "Branded attackers are pulsed when they hit you.",
        "The burst chains one brand to another hostile.",
        "A branded death flashes nearby hostiles and heals you a little.",
      ],
      { when: "Consecutive melee hits on the same target.", cost: "The brand lasts 8 seconds; one per target." }
    ),
    dawnwell: skill(
      "Dawnwell",
      "healingField",
      "healing_field",
      "When you drop low, a well of light blooms underfoot to heal and pulse hostiles.",
      [
        "The well slowly heals you.",
        "It judges undead with stronger pulses.",
        "It shares healing with nearby players.",
        "It can discharge once as a Solar Flare.",
      ],
      { cooldown: 500, when: "Your health falls below half.", cost: "25-second cooldown; the well lasts 6 seconds." }
    ),
    lumen_chorus: skill(
      "Lumen Chorus",
      "chorus",
      "note_shield",
      "Kills collect random Notes. At three, a loud Chorus hum damages nearby hostiles.",
      [
        "Each Note plays a random noteblock tone.",
        "The third Note is loud and starts a short damage hum.",
        "Three Notes brand a ring of hostiles.",
        "A full Chorus calls a Seraph Spark that divebombs the strongest hostile.",
      ],
      { cooldown: 400, when: "Kill to collect Notes. Reaching three fires the Chorus.", cost: "Holds three Notes; the ring has a 20-second cooldown." }
    ),
  },
};

const BLOCKED_BY_RELIC = {
  "relics:ward_pendant": ["bastion_glyph"],
  "relics:bramble_charm": ["oathchain", "quillguard"],
  "relics:crystal_harness": ["oathchain", "quillguard"],
  "relics:obsidian_plate": ["bastion_glyph"],
  "relics:vital_band": ["heartforge"],
  "relics:lucky_talisman": ["thanatoic_ledger"],
  "relics:cloud_cape": ["tempest_tithe", "gale_anchor"],
  "relics:stratos_pack": ["tempest_tithe", "gale_anchor"],
  "relics:springheel_boots": ["tempest_tithe"],
  "relics:zephyr_flask": ["tempest_tithe"],
  "relics:cloud_vial": ["tempest_tithe", "gale_anchor"],
  "relics:storm_locket": ["thunderbrand"],
  "relics:crusher_gauntlet": ["scarbrand", "rivet_streak"],
  "relics:impact_knuckles": ["rivet_streak"],
  "relics:leeching_glove": ["blood_tithe"],
  "relics:vital_bloom": ["heartforge", "dawnwell", "symbiotic_seed"],
  "relics:tempest_choker": ["thunderbrand"],
  "relics:gale_aegis": ["tempest_tithe", "gale_anchor"],
  "relics:bulwark_plate": ["bastion_glyph", "oathchain"],
  "relics:treasure_lure": ["gilded_rumor"],
  "relics:executioners_phantom": ["thanatoic_ledger"],
  "relics:leviathan_striders": ["tempest_tithe", "gale_anchor"],
  "relics:sanguine_heartguard": ["bastion_glyph", "heartforge"],
  "relics:warhammer_fist": ["scarbrand", "rivet_streak"],
  "relics:crimson_wargrip": ["blood_tithe"],
  "relics:thornroot_ward": ["oathchain", "quillguard"],
  "relics:windsprint_greaves": ["tempest_tithe", "gale_anchor"],
};

/** Affinity → attune paths that relic may Forge into. */
export const AFFINITY_ATTUNE_GROUPS = Object.freeze({
  might: ["might", "necromancy"],
  ward: ["ward", "radiance"],
  gale: ["gale", "fortune"],
  fortune: ["fortune", "alchemy"],
  vitality: ["vitality", "ward"],
  alchemy: ["alchemy", "radiance"],
});

/** Primary (Synergy) attune path for an affinity — the first forged path. */
export function primaryAttuneGroup(affinityKey) {
  return (AFFINITY_ATTUNE_GROUPS[affinityKey] ?? AFFINITY_ATTUNE_GROUPS.alchemy)[0];
}

const AFFINITY_GALE = new Set([
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
const AFFINITY_WARD = new Set([
  "phase_dodge",
  "knockback_resist",
  "fire_res_on_burn",
  "repel_creepers",
  "crystal_shards",
]);
const AFFINITY_FORTUNE = new Set([
  "double_ore",
  "item_magnet",
  "fishing_haul",
  "reveal_hostiles",
]);
const AFFINITY_VITALITY = new Set(["second_wind", "sustaining_cap"]);
const AFFINITY_ALCHEMY = new Set([
  "purify_effects",
  "grand_alchemy",
  "potion_linger",
  "toxin_filter",
  "wither_cleanse",
  "full_toxin_ward",
]);

/** Boost lean key for a relic def (shared with Boost scoring). */
export function relicAffinity(def) {
  if (!def) return "alchemy";
  const eff = def.passive?.effect;
  if (def.onAttack?.lifesteal) return "vitality";
  if (def.onAttack || def.custom === "execute_low_hp") return "might";
  if (
    def.onHurt ||
    AFFINITY_WARD.has(def.custom) ||
    eff === "resistance" ||
    eff === "fire_resistance"
  ) {
    return "ward";
  }
  if (
    AFFINITY_GALE.has(def.custom) ||
    ["speed", "jump_boost", "slow_falling", "dolphins_grace"].includes(eff)
  ) {
    return "gale";
  }
  if (
    AFFINITY_FORTUNE.has(def.custom) ||
    def.onKill ||
    ["luck", "village_hero", "haste"].includes(eff)
  ) {
    return "fortune";
  }
  if (
    AFFINITY_VITALITY.has(def.custom) ||
    ["regeneration", "health_boost", "saturation"].includes(eff)
  ) {
    return "vitality";
  }
  if (AFFINITY_ALCHEMY.has(def.custom)) return "alchemy";
  return "alchemy";
}

export function allowedAttuneGroups(relicId) {
  const affinity = relicAffinity(getRelicDef(relicId));
  return AFFINITY_ATTUNE_GROUPS[affinity] ?? AFFINITY_ATTUNE_GROUPS.alchemy;
}

export function groupInk(group) {
  return AttuneInk[group] ?? AttuneInk.might;
}

export function getAttuneDef(group, key) {
  return POOL[group]?.[key];
}

export function rarityCap(rarity) {
  return RARITY[rarity]?.cap ?? 1;
}

export function describeAttunement(def) {
  if (!def) return "Unknown attunement.";
  return `${def.summary}\n§7I→IV: ${def.tiers.join(" → ")}`;
}

export function groupForFocus(focusA, focusB) {
  if (!focusA || !focusB || focusA === focusB) return undefined;
  for (const [group, pair] of Object.entries(FOCUS_RECIPES)) {
    if (
      (pair[0] === focusA && pair[1] === focusB) ||
      (pair[0] === focusB && pair[1] === focusA)
    ) {
      return group;
    }
  }
  return undefined;
}

export function ritualRarity(shardCount, focusACount, focusBCount) {
  let result;
  for (const rarity of RARITY_ORDER) {
    const cost = RITUAL_COSTS[rarity];
    if (
      shardCount >= cost.shards &&
      focusACount >= cost.focus &&
      focusBCount >= cost.focus
    ) {
      result = rarity;
    }
  }
  return result;
}

export function isAttunementAllowed(relicId, group, key, existingSlots = []) {
  if (!POOL[group]?.[key]) return false;
  if (relicId && !allowedAttuneGroups(relicId).includes(group)) return false;
  if ((BLOCKED_BY_RELIC[relicId] ?? []).includes(key)) return false;
  const def = POOL[group][key];
  for (const slot of existingSlots) {
    const other = getAttuneDef(slot.group, slot.key);
    if (!other) continue;
    if (slot.group === group && slot.key === key) return false;
    if (other.conflict && other.conflict === def.conflict) return false;
    if (
      def.conflict === "temporary_familiar" &&
      other.conflict === "temporary_familiar"
    ) {
      return false;
    }
  }
  return true;
}

export function eligibleAttunements(relicId, group, existingSlots = []) {
  return Object.keys(POOL[group] ?? {}).filter((key) =>
    isAttunementAllowed(relicId, group, key, existingSlots)
  );
}

export function rollRitualAttunement(relicId, group, rarity, existingSlots = []) {
  const keys = eligibleAttunements(relicId, group, existingSlots);
  if (!keys.length || !RARITY[rarity]) return undefined;
  const key = keys[Math.floor(Math.random() * keys.length)];
  return { group, key, rarity, level: 1, name: POOL[group][key].name };
}

/** Legacy random caller retained only for safe migration/testing. */
export function rollAttunement() {
  const group = GROUP_ORDER[Math.floor(Math.random() * GROUP_ORDER.length)];
  return rollRitualAttunement("", group, "common", []);
}

/** V3 behavior uses level clauses; magnitude is the unlocked clause count. */
export function attuneMagnitude(slot) {
  return Math.max(1, Math.min(4, Number(slot.level) || 1));
}
