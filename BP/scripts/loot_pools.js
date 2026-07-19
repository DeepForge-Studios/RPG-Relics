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
