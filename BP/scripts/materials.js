import { ItemStack } from "@minecraft/server";
import { isAttunementEnabled } from "./settings.js";

const FANG_MOBS = new Set([
  "minecraft:spider",
  "minecraft:cave_spider",
  "minecraft:hoglin",
  "minecraft:ravager",
  "minecraft:warden",
]);

const ARCANE_MOBS = new Set([
  "minecraft:witch",
  "minecraft:enderman",
  "minecraft:evocation_illager",
  "minecraft:shulker",
]);

const HEART_MOBS = new Set([
  "minecraft:zombie",
  "minecraft:husk",
  "minecraft:drowned",
  "minecraft:piglin_brute",
  "minecraft:ravager",
  "minecraft:warden",
]);

const SILVER_MOBS = new Set([
  "minecraft:skeleton",
  "minecraft:stray",
  "minecraft:pillager",
  "minecraft:vindicator",
  "minecraft:zombie_villager",
]);

const CRYSTAL_MOBS = new Set([
  "minecraft:creeper",
  "minecraft:blaze",
  "minecraft:magma_cube",
  "minecraft:wither_skeleton",
]);

const HERB_BLOCKS = new Set([
  "minecraft:grass",
  "minecraft:tall_grass",
  "minecraft:fern",
  "minecraft:large_fern",
  "minecraft:dandelion",
  "minecraft:poppy",
  "minecraft:blue_orchid",
  "minecraft:allium",
  "minecraft:azure_bluet",
  "minecraft:cornflower",
  "minecraft:lily_of_the_valley",
]);

function drop(dimension, location, typeId, count = 1) {
  dimension.spawnItem(new ItemStack(typeId, count), {
    x: location.x + 0.5,
    y: location.y + 0.25,
    z: location.z + 0.5,
  });
}

export function handleMaterialMobDrop(entity, killer) {
  if (!entity || killer?.typeId !== "minecraft:player") return;
  if (!isAttunementEnabled(killer)) return;
  const luck = entity.typeId === "minecraft:warden" || entity.typeId === "minecraft:ravager" ? 0.5 : 0;
  if (HEART_MOBS.has(entity.typeId) && Math.random() < 0.08 + luck) {
    drop(entity.dimension, entity.location, "relics:monster_heart");
  }
  if (FANG_MOBS.has(entity.typeId) && Math.random() < 0.12 + luck) {
    drop(entity.dimension, entity.location, "relics:beast_fang");
  }
  if (ARCANE_MOBS.has(entity.typeId) && Math.random() < 0.16 + luck) {
    drop(entity.dimension, entity.location, "relics:arcane_dust", Math.random() < 0.2 ? 2 : 1);
  }
  if (SILVER_MOBS.has(entity.typeId) && Math.random() < 0.12 + luck) {
    drop(entity.dimension, entity.location, "relics:silver_fragment");
  }
  if (CRYSTAL_MOBS.has(entity.typeId) && Math.random() < 0.1 + luck) {
    drop(entity.dimension, entity.location, "relics:crimson_crystal");
  }
}

export function handleMaterialBlockDrop(player, blockId, location) {
  if (!player || !location || !isAttunementEnabled(player)) return;
  if (HERB_BLOCKS.has(blockId) && Math.random() < 0.12) {
    drop(player.dimension, location, "relics:mystic_herb");
  }
}
