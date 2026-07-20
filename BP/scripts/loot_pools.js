export const LOOT_COMMON = [
  "relics:lumen_visor",
  "relics:quaffers_cap",
  "relics:gillmask",
  "relics:merchants_fedora",
  "relics:prospectors_scarf",
  "relics:marathoners_treads",
  "relics:featherpad_boots",
  "relics:springheel_boots",
  "relics:excavator_gauntlets",
  "relics:fleetstrike_gloves",
  "relics:impact_knuckles",
  "relics:ward_pendant",
  "relics:bramble_charm",
  "relics:zephyr_flask",
  "relics:skybound_charm",
  "relics:jesters_cushion",
  "relics:adrenaline_charm",
  "relics:bloom_band",
  "relics:cloud_vial",
];

export const LOOT_UNCOMMON = [
  "relics:scryglass",
  "relics:filter_mask",
  "relics:fortune_tellers_cap",
  "relics:anchor_charm",
  "relics:ember_locket",
  "relics:phantom_veil",
  "relics:storm_locket",
  "relics:haste_band",
  "relics:purifying_flask",
  "relics:heartstone",
  "relics:cinder_ward",
  "relics:magnetic_sash",
  "relics:crusher_gauntlet",
  "relics:leeching_glove",
  "relics:tidewalkers",
  "relics:finfoot_boots",
  "relics:rootgrip_boots",
  "relics:cinderfist",
  "relics:reapers_hook",
  "relics:blight_vessel",
  "relics:gilt_hook",
  "relics:draught_band",
];

export const LOOT_RARE = [
  "relics:vital_band",
  "relics:lucky_talisman",
  "relics:shrink_charm",
  "relics:cloud_cape",
  "relics:stratos_pack",
  "relics:crystal_harness",
  "relics:obsidian_plate",
  "relics:storm_parasol",
  "relics:endless_ration",
  "relics:marrow_choker",
];

const TIERS = {
  common: LOOT_COMMON,
  uncommon: LOOT_UNCOMMON,
  rare: LOOT_RARE,
};

const TIER_RANK = { none: 0, common: 1, uncommon: 2, rare: 3 };

function pickFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function pickRelicId(tier = "any") {
  if (tier !== "any" && TIERS[tier]) {
    return pickFrom(TIERS[tier]);
  }
  const roll = Math.random();
  if (roll < 0.72) return pickFrom(LOOT_COMMON);
  if (roll < 0.95) return pickFrom(LOOT_UNCOMMON);
  return pickFrom(LOOT_RARE);
}

/** Resolve loot-pool rarity for a relic type id (common / uncommon / rare / none). */
export function relicLootTier(typeId) {
  if (!typeId || typeof typeId !== "string") return "none";
  if (LOOT_RARE.includes(typeId)) return "rare";
  if (LOOT_UNCOMMON.includes(typeId)) return "uncommon";
  if (LOOT_COMMON.includes(typeId)) return "common";
  if (typeId.startsWith("relics:") && !typeId.includes("shard") && !typeId.includes("dust") && !typeId.includes("fragment") && !typeId.includes("herb") && typeId !== "relics:dummy_chest" && !typeId.startsWith("relics:mimic")) {
    return "common";
  }
  return "none";
}

export function maxRelicTier(...tiers) {
  let best = "none";
  for (const t of tiers) {
    if ((TIER_RANK[t] ?? 0) > (TIER_RANK[best] ?? 0)) best = t;
  }
  return best;
}

/** How many structure defenders to spawn for a given loot tier. */
export function defenderCountForTier(tier) {
  switch (tier) {
    case "rare":
      return 7 + Math.floor(Math.random() * 2); // 7–8
    case "uncommon":
      return 5 + Math.floor(Math.random() * 2); // 5–6
    case "common":
      return 4 + Math.floor(Math.random() * 2); // 4–5
    default:
      return 3 + Math.floor(Math.random() * 2); // 3–4 — no relic, still a fight
  }
}
