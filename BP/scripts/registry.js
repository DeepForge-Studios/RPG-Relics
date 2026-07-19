import { getUpgradeDef } from "./upgrades.js";
import { getExternalRelicDef } from "./api.js";

export const SLOTS = [
  "face",
  "head",
  "necklace",
  "ring",
  "back",
  "body",
  "hands_left",
  "belt",
  "hands_right",
  "feet_left",
  "feet_right",
  "tome",
  "trinket0",
  "trinket1",
  "trinket2",
  "trinket3",
  "trinket4",
  "trinket5",
  "trinket6",
  "trinket7",
  "trinket8",
  "charm0",
  "charm1",
  "charm2",
];

export const WARDROBE_SLOT_ORDER = [
  "trinket0",
  "trinket1",
  "trinket2",
  "trinket3",
  "trinket4",
  "trinket5",
  "trinket6",
  "trinket7",
  "trinket8",
  "charm0",
  "charm1",
  "charm2",
  "face",
  "head",
  "necklace",
  "ring",
  "back",
  "body",
  "hands_left",
  "belt",
  "hands_right",
  "feet_left",
  "feet_right",
  "tome",
];

export const SLOT_LABELS = {
  face: "Face",
  head: "Head",
  necklace: "Neck",
  ring: "Ring",
  back: "Back",
  body: "Body",
  hands_left: "Hand",
  belt: "Belt",
  hands_right: "Hand",
  feet_left: "Foot",
  feet_right: "Foot",
  tome: "Tome",
  trinket0: "Extra",
  trinket1: "Extra",
  trinket2: "Extra",
  trinket3: "Extra",
  trinket4: "Extra",
  trinket5: "Extra",
  trinket6: "Extra",
  trinket7: "Extra",
  trinket8: "Extra",
  charm0: "Charm",
  charm1: "Charm",
  charm2: "Charm",
};

export const SLOT_GHOST = {
  face: "textures/ui/slot_face.png",
  head: "textures/ui/slot_head.png",
  necklace: "textures/ui/slot_necklace.png",
  ring: "textures/ui/slot_ring.png",
  back: "textures/ui/slot_back.png",
  body: "textures/ui/slot_body.png",
  hands_left: "textures/ui/slot_hands_left.png",
  belt: "textures/ui/slot_belt.png",
  hands_right: "textures/ui/slot_hands_right.png",
  feet_left: "textures/ui/slot_feet_left.png",
  feet_right: "textures/ui/slot_feet_right.png",
  tome: "textures/ui/slot_tome.png",
  trinket0: "textures/ui/slot_ring.png",
  trinket1: "textures/ui/slot_ring.png",
  trinket2: "textures/ui/slot_ring.png",
  trinket3: "textures/ui/slot_ring.png",
  trinket4: "textures/ui/slot_ring.png",
  trinket5: "textures/ui/slot_ring.png",
  trinket6: "textures/ui/slot_ring.png",
  trinket7: "textures/ui/slot_ring.png",
  trinket8: "textures/ui/slot_ring.png",
  charm0: "textures/ui/slot_charm.png",
  charm1: "textures/ui/slot_charm.png",
  charm2: "textures/ui/slot_charm.png",
};

export const RELIC_REGISTRY = {
  // Face
  "relics:scryglass": {
    slot: "face",
    displayName: "Hunter's Lens",
    custom: "reveal_hostiles",
    revealRadius: 20,
  },
  "relics:filter_mask": {
    slot: "face",
    displayName: "Plague Mask",
    custom: "toxin_filter",
  },

  // Head
  "relics:lumen_visor": {
    slot: "head",
    displayName: "Nightwatch Goggles",
    passive: { effect: "night_vision", amplifier: 0 },
  },
  "relics:quaffers_cap": {
    slot: "head",
    displayName: "Feast Cap",
    custom: "sustaining_cap",
  },
  "relics:gillmask": {
    slot: "head",
    displayName: "Tide Fin",
    passive: { effect: "water_breathing", amplifier: 0 },
  },
  "relics:fortune_tellers_cap": {
    slot: "head",
    displayName: "Fate Circlet",
    onKill: { bonusXpOrbs: 4 },
  },
  "relics:merchants_fedora": {
    slot: "head",
    displayName: "Guildmaster's Hat",
    passive: { effect: "village_hero", amplifier: 0 },
  },

  // Necklace
  "relics:anchor_charm": {
    slot: "necklace",
    displayName: "Mariner's Pendant",
    custom: "fluid_movement",
  },
  "relics:ward_pendant": {
    slot: "necklace",
    displayName: "Aegis Locket",
    onHurt: { effect: "resistance", amplifier: 1, duration: 40 },
  },
  "relics:ember_locket": {
    slot: "necklace",
    displayName: "Twinstone Locket",
    onAttack: { ignite: { chance: 1, seconds: 5 } },
  },
  "relics:adrenaline_charm": {
    slot: "necklace",
    displayName: "Rush Cord",
    onHurt: { effect: "speed", amplifier: 1, duration: 60 },
  },
  "relics:prospectors_scarf": {
    slot: "necklace",
    displayName: "Guildweaver's Cord",
    passive: { effect: "haste", amplifier: 0 },
  },
  "relics:phantom_veil": {
    slot: "necklace",
    displayName: "Ghost Shroud",
    passive: { effect: "invisibility", amplifier: 0 },
  },
  "relics:storm_locket": {
    slot: "necklace",
    displayName: "Tempest Locket",
    onAttack: { lightning: { chance: 1 } },
  },
  "relics:bramble_charm": {
    slot: "necklace",
    displayName: "Briar Charm",
    onHurt: { thorns: { chance: 1, damage: 2 } },
  },
  "relics:marrow_choker": {
    slot: "necklace",
    displayName: "Marrow Choker",
    onAttack: { wither: { duration: 100, amplifier: 0 } },
  },

  // Ring
  "relics:haste_band": {
    slot: "ring",
    displayName: "Miner's Ring",
    custom: "double_ore",
    oreChance: 0.45,
  },
  "relics:vital_band": {
    slot: "ring",
    displayName: "Heartward Ring",
    custom: "second_wind",
    secondWindHp: 10,
    secondWindDuration: 200,
    secondWindAmplifier: 2,
    secondWindCooldown: 600,
  },
  "relics:bloom_band": {
    slot: "ring",
    displayName: "Bloom Band",
    passive: { effect: "regeneration", amplifier: 0 },
  },
  "relics:draught_band": {
    slot: "ring",
    displayName: "Alchemist's Loop",
    custom: "potion_linger",
    potionBonus: 0.35,
  },

  // Charm
  "relics:lucky_talisman": {
    slot: "charm",
    displayName: "Executioner's Sigil",
    custom: "execute_low_hp",
    executeThreshold: 0.35,
    executeBonus: 4,
  },
  "relics:shrink_charm": {
    slot: "charm",
    displayName: "Phase Pearl",
    custom: "phase_dodge",
    dodgeChance: 0.35,
  },

  // Back
  "relics:cloud_cape": {
    slot: "back",
    displayName: "Cloud Plume",
    custom: "double_jump",
  },
  "relics:stratos_pack": {
    slot: "back",
    displayName: "Windrunner Pack",
    custom: "gale_glide",
  },

  // Body
  "relics:crystal_harness": {
    slot: "body",
    displayName: "Prism Gem",
    custom: "crystal_shards",
    shardDamage: 3,
    shardRadius: 3.5,
  },
  "relics:obsidian_plate": {
    slot: "body",
    displayName: "Obsidian Aegis",
    passive: { effect: "resistance", amplifier: 0 },
    custom: "fire_res_on_burn",
  },

  // Belt
  "relics:purifying_flask": {
    slot: "belt",
    displayName: "Antidote Flask",
    custom: "purify_effects",
  },
  "relics:zephyr_flask": {
    slot: "belt",
    displayName: "Hare's Bounding Sash",
    passive: { effect: "jump_boost", amplifier: 1 },
  },
  "relics:heartstone": {
    slot: "belt",
    displayName: "Bloodheart Stone",
    passive: { effect: "health_boost", amplifier: 1 },
  },
  "relics:skybound_charm": {
    slot: "belt",
    displayName: "Drift Feather",
    passive: { effect: "slow_falling", amplifier: 0 },
  },
  "relics:cinder_ward": {
    slot: "belt",
    displayName: "Emberflare Girdle",
    onHurt: { effect: "strength", amplifier: 1, duration: 120 },
  },
  "relics:magnetic_sash": {
    slot: "belt",
    displayName: "Lodestone Charm",
    custom: "item_magnet",
    magnetRadius: 12,
  },
  "relics:blight_vessel": {
    slot: "belt",
    displayName: "Ashen Vessel",
    custom: "wither_cleanse",
  },
  "relics:cloud_vial": {
    slot: "belt",
    displayName: "Puff Bottle",
    custom: "double_jump",
  },

  // Hands
  "relics:excavator_gauntlets": {
    slot: "hands",
    displayName: "Delver's Warbrace",
    passive: { effect: "haste", amplifier: 1 },
  },
  "relics:fleetstrike_gloves": {
    slot: "hands",
    displayName: "Fleetstrike Wraps",
    passive: { effect: "strength", amplifier: 0 },
  },
  "relics:cinderfist": {
    slot: "hands",
    displayName: "Gold Bracer",
    onAttack: { ignite: { chance: 1, seconds: 3 } },
  },
  "relics:reapers_hook": {
    slot: "hands",
    displayName: "Wraithreaper's Hook",
    onKill: { bonusXpOrbs: 6 },
  },
  "relics:impact_knuckles": {
    slot: "hands",
    displayName: "Skullbreaker Knuckles",
    onAttack: { knockback: 1.6 },
  },
  "relics:crusher_gauntlet": {
    slot: "hands",
    displayName: "Ore-Crusher Fist",
    onAttack: { bonusDamage: 3 },
  },
  "relics:leeching_glove": {
    slot: "hands",
    displayName: "Crimson Glove",
    onAttack: { lifesteal: 0.35 },
  },
  "relics:gilt_hook": {
    slot: "hands",
    displayName: "Gilded Angler",
    passive: { effect: "luck", amplifier: 2 },
    custom: "fishing_haul",
  },

  // Feet
  "relics:tidewalkers": {
    slot: "feet",
    displayName: "Tide Striders",
    custom: "liquid_sprint",
  },
  "relics:springheel_boots": {
    slot: "feet",
    displayName: "Spring Boots",
    passive: { effect: "jump_boost", amplifier: 1 },
    custom: "no_fall_damage",
  },
  "relics:finfoot_boots": {
    slot: "feet",
    displayName: "Riptide Boots",
    passive: { effect: "dolphins_grace", amplifier: 2 },
    custom: "swim_boost",
  },
  "relics:featherpad_boots": {
    slot: "feet",
    displayName: "Softstep Boots",
    custom: "repel_creepers",
    repelRadius: 5,
  },
  "relics:marathoners_treads": {
    slot: "feet",
    displayName: "Wayfarer's Shoes",
    passive: { effect: "speed", amplifier: 2 },
  },
  "relics:rootgrip_boots": {
    slot: "feet",
    displayName: "Earth Boots",
    custom: "knockback_resist",
  },

  // Any slot
  "relics:jesters_cushion": {
    slot: "any",
    displayName: "Fool's Whoopee Charm",
    custom: "random_noise",
  },
};

export function matchesSlot(def, slot) {
  if (!def || !slot) return false;
  if (def.slot === "any") return true;
  if (def.slot === "trinket" && slot.startsWith("trinket")) return true;
  if (def.slot === slot) return true;
  if (def.slot === "hands" && (slot === "hands_left" || slot === "hands_right")) return true;
  if (def.slot === "feet" && (slot === "feet_left" || slot === "feet_right")) return true;
  if (slot.startsWith("trinket")) return true;
  if (slot === "charm0" || slot === "charm1" || slot === "charm2") {
    return (
      def.slot === "charm" ||
      def.slot === "necklace" ||
      def.slot === "ring" ||
      def.slot === "any"
    );
  }
  return false;
}

export function getRelicDef(itemId) {
  return RELIC_REGISTRY[itemId] ?? getUpgradeDef(itemId) ?? getExternalRelicDef(itemId);
}
