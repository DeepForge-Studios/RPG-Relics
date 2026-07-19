import { applyEffect } from "./hooks.js";

export const MIMIC_VARIANTS = [
  {
    id: "relics:mimic_forest",
    label: "Forest",
    biomes: [
      "forest",
      "plains",
      "meadow",
      "birch",
      "flower",
      "cherry",
      "dark_forest",
      "roofed",
      "sunflower",
      "pale_garden",
    ],
    attackMessage: "§2Thorns dig into you!",
    attackEffects: [
      { id: "poison", duration: 60, amplifier: 0 },
      { id: "slowness", duration: 40, amplifier: 0 },
    ],
  },
  {
    id: "relics:mimic_desert",
    label: "Desert",
    biomes: ["desert", "beach", "warm_ocean", "deep_warm"],
    attackMessage: "§eA dry heat drains your strength!",
    attackEffects: [
      { id: "hunger", duration: 100, amplifier: 1 },
      { id: "weakness", duration: 60, amplifier: 0 },
    ],
  },
  {
    id: "relics:mimic_badlands",
    label: "Badlands",
    biomes: ["mesa", "badlands", "eroded", "savanna", "savanna_mutated"],
    attackMessage: "§cScorching clay sears you!",
    attackEffects: [{ id: "weakness", duration: 40, amplifier: 0 }],
    setOnFireSeconds: 4,
  },
  {
    id: "relics:mimic_snow",
    label: "Snow",
    biomes: ["snow", "ice", "frozen", "cold", "grove", "jagged", "stony_peaks"],
    attackMessage: "§bFrostbite numbs your limbs!",
    attackEffects: [
      { id: "slowness", duration: 80, amplifier: 1 },
      { id: "mining_fatigue", duration: 60, amplifier: 0 },
    ],
  },
  {
    id: "relics:mimic_swamp",
    label: "Swamp",
    biomes: ["swamp", "mangrove", "marsh"],
    attackMessage: "§2Bog venom saturates the wound!",
    attackEffects: [
      { id: "poison", duration: 100, amplifier: 1 },
      { id: "nausea", duration: 60, amplifier: 0 },
    ],
  },
  {
    id: "relics:mimic_jungle",
    label: "Jungle",
    biomes: ["jungle", "bamboo", "sparse_jungle"],
    attackMessage: "§aJungle venom clouds your senses!",
    attackEffects: [
      { id: "blindness", duration: 40, amplifier: 0 },
      { id: "poison", duration: 60, amplifier: 0 },
    ],
  },
];

export const MIMIC_TYPE_IDS = new Set([
  "relics:mimic",
  ...MIMIC_VARIANTS.map((v) => v.id),
]);

const DEFAULT_MIMIC_ID = "relics:mimic_forest";

const VARIANT_BY_ID = new Map(MIMIC_VARIANTS.map((v) => [v.id, v]));
VARIANT_BY_ID.set("relics:mimic", VARIANT_BY_ID.get(DEFAULT_MIMIC_ID));

function biomeHaystack(biome) {
  const id = (biome?.id ?? "").toLowerCase();
  const tags = (biome?.getTags?.() ?? []).map((t) => t.toLowerCase());
  return `${id} ${tags.join(" ")}`;
}

export function getMimicIdForLocation(dimension, location) {
  try {
    const biome = dimension.getBiome(location);
    const hay = biomeHaystack(biome);
    for (const variant of MIMIC_VARIANTS) {
      if (variant.biomes.some((token) => hay.includes(token))) {
        return variant.id;
      }
    }
  } catch (err) {
    console.warn(`[RPG Relics] mimic biome lookup failed: ${err}`);
  }
  return DEFAULT_MIMIC_ID;
}

export function isMimicType(typeId) {
  return MIMIC_TYPE_IDS.has(typeId);
}

export function getMimicVariant(typeId) {
  return VARIANT_BY_ID.get(typeId);
}

export function handleMimicAttack(hurtEntity, damagingEntity) {
  if (!hurtEntity || hurtEntity.typeId !== "minecraft:player") return false;
  if (!damagingEntity || !isMimicType(damagingEntity.typeId)) return false;

  const variant = getMimicVariant(damagingEntity.typeId);
  if (!variant) return false;

  try {
    damagingEntity.dimension.playSound("random.chestopen", damagingEntity.location, {
      volume: 0.9,
      pitch: 0.7,
    });
  } catch {
  }

  for (const fx of variant.attackEffects ?? []) {
    applyEffect(hurtEntity, fx.id, fx.duration, fx.amplifier ?? 0, true);
  }

  if (variant.setOnFireSeconds > 0) {
    try {
      hurtEntity.setOnFire(variant.setOnFireSeconds, true);
    } catch {
    }
  }

  if (variant.attackMessage) {
    try {
      hurtEntity.sendMessage(variant.attackMessage);
    } catch {
    }
  }

  return true;
}
