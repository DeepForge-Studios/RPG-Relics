import { world, system, BlockPermutation, BlockVolume, ItemStack } from "@minecraft/server";
import {
  pickRelicId,
  defenderCountForTier,
  maxRelicTier,
  relicLootTier,
} from "./loot_pools.js";
import { makeRelicStack, stampContainerRelics } from "./relics.js";
import {
  getMimicIdForLocation,
  handleMimicAttack,
  isMimicType,
} from "./mimics.js";
import { isRelicSenseEnabled } from "./settings.js";
import { TOWER_CHEST_POOLS } from "./tower_chest_pools.js";
import { HOME_CHEST_POOLS } from "./home_chest_pools.js";

const CHEST_TYPES = new Set([
  "minecraft:chest",
  "minecraft:trapped_chest",
  "minecraft:barrel",
  "minecraft:copper_chest",
  "minecraft:exposed_copper_chest",
  "minecraft:weathered_copper_chest",
  "minecraft:oxidized_copper_chest",
  "minecraft:waxed_copper_chest",
  "minecraft:waxed_exposed_copper_chest",
  "minecraft:waxed_weathered_copper_chest",
  "minecraft:waxed_oxidized_copper_chest",
]);

const SUSPICIOUS = [
  "minecraft:suspicious_sand",
  "minecraft:suspicious_gravel",
];

const MOB_DROPS = new Set([
  "minecraft:zombie",
  "minecraft:husk",
  "minecraft:skeleton",
  "minecraft:stray",
  "minecraft:drowned",
  "minecraft:pillager",
  "minecraft:vindicator",
  "minecraft:witch",
]);

const CAMP_MARKERS = new Set([
  "relics:dummy_chest",
  "minecraft:campfire",
  "minecraft:soul_campfire",
  "minecraft:bell",
]);

const TOWER_SIG = new Set([
  "minecraft:spruce_planks",
  "minecraft:dark_oak_planks",
  "minecraft:shroomlight",
  "minecraft:stripped_spruce_log",
  "minecraft:stripped_dark_oak_log",
]);

const HOME_SIG = new Set([
  "minecraft:orange_terracotta",
  "minecraft:smooth_red_sandstone",
  "minecraft:birch_planks",
  "minecraft:stripped_birch_wood",
  "minecraft:red_terracotta",
  "minecraft:polished_diorite",
  "minecraft:sandstone",
  "minecraft:smooth_sandstone",
  "minecraft:red_sandstone_stairs",
  "minecraft:orange_glazed_terracotta",
  "minecraft:cracked_deepslate_bricks",
  "minecraft:deepslate_tiles",
  "minecraft:polished_deepslate",
]);

const STRUCTURE_LAYOUTS = {
  tower: {
    size: [30, 60, 30],
    maxMobY: 40,
    anchor: [15, 14, 14, "minecraft:shroomlight"],
    mimicChest: null,
    chests: Object.values(TOWER_CHEST_POOLS).flat(),
    defenders: [],
    mimics: [],
  },
  home: {
    size: [23, 53, 19],
    maxMobY: 14,
    anchor: [10, 1, 11, "minecraft:brown_wool"],
    mimicChest: null,
    chests: Object.values(HOME_CHEST_POOLS).flat(),
    defenders: [],
    mimics: [],
  },
};

const openedChests = new Set();
const awakeningMimics = new Set();
const relicSenseTargets = new Map();
const activatedDefenderSites = new Set();
/** Sites whose loot chests were already seeded — never re-place / respawn. */
const seededChestSites = new Set();
/** World keys for trapped-chest mimics that still disguise as loot chests. */
const disguisedMimicChests = new Set();
/** Player-placed chests/barrels — never ambush / never stir structure defenders. */
const playerPlacedContainers = new Set();
/** Structure loot chests that already showed the near-chest glint tip. */
const glintTipsShown = new Set();
const DEFENDER_PROP = "relics:tower_defenders_v25";
const CHEST_SEED_PROP = "relics:tower_chests_v19";
const MIMIC_DISGUISE_PROP = "relics:mimic_disguise_v19";
const GLINT_TIP_TICKS = 80; // ~4s action-bar tip
let defendersLoaded = false;
let chestSeedsLoaded = false;
let mimicDisguiseLoaded = false;

function rememberPlayerPlaced(block) {
  if (!block || !CHEST_TYPES.has(block.typeId)) return;
  playerPlacedContainers.add(blockKey(block));
  if (playerPlacedContainers.size > 400) {
    const drop = [...playerPlacedContainers].slice(0, 100);
    for (const k of drop) playerPlacedContainers.delete(k);
  }
}

function isPlayerPlacedContainer(block) {
  if (!block) return false;
  return playerPlacedContainers.has(blockKey(block));
}

function loadActivatedDefenders() {
  if (defendersLoaded) return;
  defendersLoaded = true;
  try {
    const raw = world.getDynamicProperty(DEFENDER_PROP);
    if (typeof raw !== "string" || !raw) return;
    for (const key of raw.split("|")) {
      if (key) activatedDefenderSites.add(key);
    }
  } catch {
  }
}

function saveActivatedDefenders() {
  try {
    world.setDynamicProperty(DEFENDER_PROP, [...activatedDefenderSites].slice(-200).join("|"));
  } catch {
  }
}

function loadChestSeeds() {
  if (chestSeedsLoaded) return;
  chestSeedsLoaded = true;
  try {
    const raw = world.getDynamicProperty(CHEST_SEED_PROP);
    if (typeof raw !== "string" || !raw) return;
    for (const key of raw.split("|")) {
      if (key) seededChestSites.add(key);
    }
  } catch {
  }
}

function saveChestSeeds() {
  try {
    world.setDynamicProperty(CHEST_SEED_PROP, [...seededChestSites].slice(-200).join("|"));
  } catch {
  }
}

function loadMimicDisguises() {
  if (mimicDisguiseLoaded) return;
  mimicDisguiseLoaded = true;
  try {
    const raw = world.getDynamicProperty(MIMIC_DISGUISE_PROP);
    if (typeof raw !== "string" || !raw) return;
    for (const key of raw.split("|")) {
      if (key) disguisedMimicChests.add(key);
    }
  } catch {
  }
}

function saveMimicDisguises() {
  try {
    world.setDynamicProperty(MIMIC_DISGUISE_PROP, [...disguisedMimicChests].slice(-200).join("|"));
  } catch {
  }
}

function siteKey(x, y, z) {
  return `${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`;
}

function blockKey(block) {
  const l = block.location;
  return `${block.dimension.id}:${l.x},${l.y},${l.z}`;
}

/** One key per container ? double chests fire interact on both halves. */
function containerKey(block) {
  const l = block.location;
  const dim = block.dimension;
  const typeId = block.typeId;
  if (!CHEST_TYPES.has(typeId)) return blockKey(block);

  let x = l.x;
  let z = l.z;
  for (const [dx, dz] of [
    [-1, 0],
    [0, -1],
  ]) {
    try {
      const other = dim.getBlock({ x: x + dx, y: l.y, z: z + dz });
      if (other?.typeId === typeId) {
        x = Math.min(x, x + dx);
        z = Math.min(z, z + dz);
      }
    } catch {
    }
  }
  return `${dim.id}:${x},${l.y},${z}`;
}

function relicStack(typeId) {
  return makeRelicStack(typeId);
}

function spawnRelicAt(dim, loc, tier = "any") {
  const id = pickRelicId(tier);
  dim.spawnItem(relicStack(id), loc);
  return id;
}

function giveRelic(player, tier = "any") {
  const id = pickRelicId(tier);
  const inv = player.getComponent("minecraft:inventory")?.container;
  if (!inv) return id;
  const leftover = inv.addItem(relicStack(id));
  if (leftover) {
    player.dimension.spawnItem(leftover, player.location);
  }
  return id;
}

function tryAddRelicToChest(block, tier = "any") {
  const inv = block.getComponent("minecraft:inventory")?.container;
  if (!inv) return false;
  for (let i = 0; i < inv.size; i++) {
    if (inv.getItem(i)) continue;
    inv.setItem(i, relicStack(pickRelicId(tier)));
    return true;
  }
  return false;
}

function isCampContainer(block) {
  const center = block.location;
  for (let x = center.x - 10; x <= center.x + 10; x++) {
    for (let y = center.y - 5; y <= center.y + 5; y++) {
      for (let z = center.z - 10; z <= center.z + 10; z++) {
        try {
          const id = block.dimension.getBlock({ x, y, z })?.typeId;
          if (id === "minecraft:campfire" || id === "minecraft:soul_campfire") return true;
        } catch {
        }
      }
    }
  }
  return false;
}

export function spawnMimic(dimension, nearLocation) {
  const fx = Math.floor(nearLocation.x) + 0.5;
  const fz = Math.floor(nearLocation.z) + 0.5;
  // Prefer standing on / just above the chest cell so mimics aren't buried.
  const preferredY = Math.floor(nearLocation.y) + 1;
  let open =
    findOpenSpawn(dimension, fx, preferredY, fz) ??
    findOpenSpawn(dimension, fx, nearLocation.y, fz);
  if (!open) {
    open = { x: fx, y: preferredY, z: fz };
  }
  const stood = snapStandingY(dimension, open.x, open.y, open.z);
  if (stood !== undefined) open = { x: open.x, y: stood, z: open.z };
  if (!isAirSpawnCell(dimension, open.x, open.y, open.z)) {
    open.y = preferredY;
  }
  const typeId = getMimicIdForLocation(dimension, open);
  try {
    const mimic = dimension.spawnEntity(typeId, open);
    try {
      
    } catch {
    }
    return mimic;
  } catch (err) {
    console.warn(`[RPG Relics] mimic spawn failed: ${err}`);
    return undefined;
  }
}

function awakenDummyChest(block) {
  const dim = block.dimension;
  const loc = block.location;
  const key = blockKey(block);
  if (awakeningMimics.has(key)) return false;
  awakeningMimics.add(key);

  try {
    const openPermutation = block.permutation.withState("relics:open", true);
    block.setPermutation(openPermutation);
  } catch {
  }

  try {
    dim.playSound("random.chestopen", {
      x: loc.x + 0.5,
      y: loc.y + 0.5,
      z: loc.z + 0.5,
    }, { volume: 1, pitch: 0.85 });
  } catch {
  }

  system.runTimeout(() => {
    try {
      block.setPermutation(BlockPermutation.resolve("minecraft:air"));
    } catch {
    }
    const mimic = spawnMimic(dim, loc);
    try {
      mimic?.triggerEvent("relics:awake_mimic");
      dim.playSound("mob.endermen.scream", {
        x: loc.x + 0.5,
        y: loc.y + 0.5,
        z: loc.z + 0.5,
      }, { volume: 0.8, pitch: 0.75 });
    } catch {
    }
    awakeningMimics.delete(key);
  }, 8);
  return true;
}

/** Trapped-chest disguise in tower/home mimic variants — looks like a normal chest. */
function isDisguisedMimicChest(block) {
  if (!block) return false;
  loadMimicDisguises();
  if (disguisedMimicChests.has(blockKey(block))) return true;
  if (block.typeId === "minecraft:trapped_chest" && block.location.y > 32) {
    const kind = classifySurfaceSite(block);
    return kind === "tower_mimic" || kind === "home_mimic";
  }
  return false;
}

function awakenDisguisedMimic(block) {
  const dim = block.dimension;
  const loc = block.location;
  const key = blockKey(block);
  if (awakeningMimics.has(key)) return false;
  awakeningMimics.add(key);
  loadMimicDisguises();
  disguisedMimicChests.delete(key);
  saveMimicDisguises();

  try {
    dim.playSound("random.chestopen", {
      x: loc.x + 0.5,
      y: loc.y + 0.5,
      z: loc.z + 0.5,
    }, { volume: 1, pitch: 0.85 });
  } catch {
  }

  system.runTimeout(() => {
    try {
      block.setPermutation(BlockPermutation.resolve("minecraft:air"));
    } catch {
    }
    const mimic = spawnMimic(dim, loc);
    try {
      mimic?.triggerEvent("relics:awake_mimic");
      try {
        
      } catch {
      }
      dim.playSound("mob.endermen.scream", {
        x: loc.x + 0.5,
        y: loc.y + 0.5,
        z: loc.z + 0.5,
      }, { volume: 0.8, pitch: 0.75 });
    } catch {
    }
    awakeningMimics.delete(key);
  }, 8);
  return true;
}

function onChestOpen(block, player) {
  // Your own storage is safe — no mimic ambush, no bonus loot spam.
  if (isPlayerPlacedContainer(block)) return;

  system.run(() => {
    try {
      stampContainerRelics(block);
    } catch {
    }
  });
  system.runTimeout(() => {
    try {
      stampContainerRelics(block);
    } catch {
    }
  }, 5);

  const y = block.location.y;

  const key = containerKey(block);
  if (openedChests.has(key)) return;
  openedChests.add(key);

  const deep = y <= 24;
  const camp = isCampContainer(block);

  if (deep && Math.random() < (camp ? 0.28 : 0.24)) {
    try {
      block.setPermutation(BlockPermutation.resolve("minecraft:air"));
    } catch {
    }
    spawnMimic(block.dimension, block.location);
    player.sendMessage("\u00A7cThe chest was a mimic!");
    return;
  }

  // Surface ~village/ruins, shallow caves, deep caves, camps.
  const lootChance = camp ? 0.6 : deep ? 0.32 : y <= 48 ? 0.22 : 0.14;
  if (Math.random() >= lootChance) return;

  const tier = Math.random() < 0.04 ? "rare" : Math.random() < 0.28 ? "uncommon" : "common";
  if (tryAddRelicToChest(block, tier)) {
    player.sendMessage("\u00A7eSomething glints in the bottom of the chest\u2026");
  } else {
    giveRelic(player, tier);
    player.sendMessage("\u00A7eA relic tumbles free as you open the container.");
  }
}

function onEntityDie(ev) {
  const entity = ev.deadEntity;
  const killer = ev.damageSource?.damagingEntity;
  if (killer?.typeId !== "minecraft:player") return;

  if (isMimicType(entity.typeId) || entity.getDynamicProperty?.("relics:is_mimic")) {
    try {
      entity.dimension.playSound("random.chestclosed", entity.location, {
        volume: 1,
        pitch: 0.65,
      });
    } catch {
    }
    if (Math.random() < 0.65) {
      entity.dimension.spawnItem(relicStack("relics:relic_shard"), entity.location);
    }
    return;
  }

  let eligibleMob = MOB_DROPS.has(entity.typeId);
  if (!eligibleMob) {
    try {
      eligibleMob = entity.matches?.({ families: ["monster"] }) === true;
    } catch {
    }
  }
  if (!eligibleMob) return;
  if (Math.random() >= 0.05) return;

  const tier = Math.random() < 0.15 ? "uncommon" : "common";
  spawnRelicAt(entity.dimension, entity.location, tier);

  if (Math.random() < 0.25) {
    entity.dimension.spawnItem(relicStack("relics:relic_shard"), entity.location);
  }
}

function onSuspiciousBrush(ev) {
  const block = ev.block;
  if (!SUSPICIOUS.includes(block.typeId)) return;
  const player = ev.player;
  if (!player) return;

  const tool = player.getComponent("minecraft:equippable")?.getEquipment("Mainhand");
  if (tool?.typeId !== "minecraft:brush") return;
  if (Math.random() >= 0.22) return;

  system.run(() => {
    const tier = Math.random() < 0.14 ? "uncommon" : "common";
    giveRelic(player, tier);
    player.sendMessage("\u00A7eYour brush uncovers a relic in the sediment.");
    if (Math.random() < 0.5) {
      player.dimension.spawnItem(relicStack("relics:relic_shard"), player.location);
    }
  });
}

export function findNearestCamp(player, radius = 80) {
  const dim = player.dimension;
  const ox = Math.floor(player.location.x);
  const oy = Math.floor(player.location.y);
  const oz = Math.floor(player.location.z);
  let best;
  let bestDist = Infinity;
  const step = 2;
  const yMin = Math.max(-64, oy - 48);
  const yMax = Math.min(32, oy + 24);

  for (let dx = -radius; dx <= radius; dx += step) {
    for (let dz = -radius; dz <= radius; dz += step) {
      for (let y = yMin; y <= yMax; y += step) {
        let block;
        try {
          block = dim.getBlock({ x: ox + dx, y, z: oz + dz });
        } catch {
          continue;
        }
        if (!block || !CAMP_MARKERS.has(block.typeId)) continue;
        const dist = dx * dx + (y - oy) * (y - oy) + dz * dz;
        if (dist >= bestDist) continue;
        bestDist = dist;
        best = {
          x: block.location.x,
          y: block.location.y,
          z: block.location.z,
          typeId: block.typeId,
          dist: Math.sqrt(dist),
        };
      }
    }
  }
  return best;
}

export function findNearestTower(player, radius = 160) {
  const dim = player.dimension;
  const center = player.location;
  const height = dim.heightRange ?? { min: -64, max: 320 };
  const volume = new BlockVolume(
    {
      x: Math.floor(center.x - radius),
      y: Math.max(height.min, Math.floor(center.y - 32)),
      z: Math.floor(center.z - radius),
    },
    {
      x: Math.floor(center.x + radius),
      y: Math.min(height.max - 1, Math.floor(center.y + 128)),
      z: Math.floor(center.z + radius),
    }
  );

  let matches;
  try {
    matches = dim.getBlocks(
      volume,
      {
        includeTypes: [
          "minecraft:chest",
          "minecraft:trapped_chest",
          "relics:dummy_chest",
          "minecraft:shroomlight",
          "minecraft:brown_wool",
        ],
      },
      true
    );
  } catch {
    return undefined;
  }

  let best;
  let bestDistance = Infinity;
  for (const location of matches.getBlockLocationIterator()) {
    if (location.y <= 32) continue;
    const dx = location.x + 0.5 - center.x;
    const dy = location.y + 0.5 - center.y;
    const dz = location.z + 0.5 - center.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (distance >= bestDistance) continue;
    const block = dim.getBlock(location);
    if (!block) continue;
    if (isPlayerPlacedContainer(block)) continue;
    const kind = classifyStructureSite(block);
    if (!kind) continue;
    bestDistance = distance;
    best = {
      x: location.x,
      y: location.y,
      z: location.z,
      typeId: block.typeId,
      kind,
      dist: distance,
    };
  }
  return best;
}

function classifyStructureSite(block) {
  const id = block.typeId;
  if (id === "minecraft:shroomlight") return "tower";
  if (id === "minecraft:brown_wool") return "home";
  return classifySurfaceSite(block);
}

function classifySurfaceSite(block) {
  const dim = block.dimension;
  const { x, y, z } = block.location;
  let towerScore = 0;
  let homeScore = 0;
  // Scan around the chest for structure signature blocks (homes can sit at any Y).
  for (let dx = -6; dx <= 6; dx++) {
    for (let dy = -28; dy <= 3; dy++) {
      for (let dz = -6; dz <= 6; dz++) {
        let id;
        try {
          id = dim.getBlock({ x: x + dx, y: y + dy, z: z + dz })?.typeId;
        } catch {
          continue;
        }
        if (!id) continue;
        if (TOWER_SIG.has(id)) towerScore++;
        if (HOME_SIG.has(id)) homeScore++;
      }
    }
  }
  const mimic =
    block.typeId === "relics:dummy_chest" || block.typeId === "minecraft:trapped_chest";
  // Higher thresholds + resolveStructureOrigin gate keep random world chests quiet.
  if (homeScore >= 8 && homeScore >= towerScore) return mimic ? "home_mimic" : "home";
  if (towerScore >= 8) return mimic ? "tower_mimic" : "tower";
  return undefined;
}

function isAirSpawnCell(dim, x, y, z) {
  try {
    const here = dim.getBlock({ x: Math.floor(x), y: Math.floor(y), z: Math.floor(z) });
    const above = dim.getBlock({
      x: Math.floor(x),
      y: Math.floor(y) + 1,
      z: Math.floor(z),
    });
    return !!(here?.isAir && above?.isAir);
  } catch {
    return false;
  }
}

function hasSolidFloor(dim, x, y, z) {
  try {
    const below = dim.getBlock({
      x: Math.floor(x),
      y: Math.floor(y) - 1,
      z: Math.floor(z),
    });
    if (!below || below.isAir) return false;
    const id = below.typeId ?? "";
    if (id === "minecraft:water" || id === "minecraft:lava") return false;
    // Pitched roofs / railings — never seat defenders here.
    if (id.includes("stairs") || id.includes("fence") || id.includes("wall")) return false;
    return true;
  } catch {
    return false;
  }
}

/** True if no real ceiling above — outdoor ledge, balcony, or roof. */
function isSkyExposed(dim, x, y, z) {
  const fx = Math.floor(x);
  const fy = Math.floor(y);
  const fz = Math.floor(z);
  for (let dy = 2; dy <= 32; dy++) {
    try {
      const up = dim.getBlock({ x: fx, y: fy + dy, z: fz });
      if (!up || up.isAir) continue;
      const id = up.typeId ?? "";
      if (
        id.includes("sign") ||
        id.includes("torch") ||
        id.includes("lantern") ||
        id.includes("button") ||
        id.includes("lever") ||
        id.includes("rail") ||
        id.includes("banner") ||
        id.includes("carpet") ||
        id.includes("pressure_plate") ||
        id.includes("flower") ||
        id.includes("sapling") ||
        id.includes("coral_fan") ||
        id.includes("candle")
      ) {
        continue;
      }
      return false;
    } catch {
      return true;
    }
  }
  return true;
}

function isInteriorSpawnCell(dim, x, y, z, relaxed = false) {
  if (!isAirSpawnCell(dim, x, y, z)) return false;
  if (!hasSolidFloor(dim, x, y, z)) return false;
  // Always require a real ceiling — relaxed used to skip this and seated mobs on roofs.
  if (isSkyExposed(dim, x, y, z)) return false;
  // Reject outer ledges/balconies — need walls nearby in most directions.
  const fx = Math.floor(x);
  const fy = Math.floor(y);
  const fz = Math.floor(z);
  let wallHits = 0;
  for (const [dx, dz] of [
    [0, -1],
    [0, 1],
    [1, 0],
    [-1, 0],
  ]) {
    for (let d = 1; d <= 4; d++) {
      try {
        const n = dim.getBlock({ x: fx + dx * d, y: fy, z: fz + dz * d });
        if (n && !n.isAir) {
          wallHits++;
          break;
        }
      } catch {
        break;
      }
    }
  }
  const needWalls = relaxed ? 2 : 3;
  return wallHits >= needWalls;
}

/** Feet in air with solid underfoot — prefers exact Y; never climbs onto roofs. */
function snapStandingY(dim, x, preferredY, z, bounds) {
  const start = Math.floor(preferredY);
  const yTries = [0, 1, -1, 2, -2];
  const relaxed = !!bounds;
  for (const dy of yTries) {
    const y = start + dy;
    if (bounds) {
      if (y < bounds.minY + 1 || y > bounds.maxY) continue;
      if (isInteriorSpawnCell(dim, x, y, z, relaxed)) return y;
    } else if (
      isAirSpawnCell(dim, x, y, z) &&
      hasSolidFloor(dim, x, y, z) &&
      !isSkyExposed(dim, x, y, z)
    ) {
      return y;
    }
  }
  return undefined;
}

/** Chest sits in air/replaceable cell with solid floor below (not inside floor). */
function findChestSurfaceY(dim, x, preferredY, z) {
  const start = Math.floor(preferredY);
  const okHere = (id) =>
    !id ||
    id === "minecraft:air" ||
    id === "minecraft:light_block" ||
    id === "minecraft:structure_void" ||
    id === "minecraft:chest" ||
    id === "minecraft:trapped_chest" ||
    id === "minecraft:barrel" ||
    id === "relics:dummy_chest";
  // Prefer exact Y first — wide dy search was seating chests on exterior ledges.
  for (const dy of [0, 1, -1]) {
    const y = start + dy;
    try {
      const here = dim.getBlock({ x, y, z });
      const below = dim.getBlock({ x, y: y - 1, z });
      if (!here || !below) continue;
      if (!okHere(here.typeId) && !here.isAir) continue;
      if (below.isAir) continue;
      const bid = below.typeId ?? "";
      if (bid === "minecraft:water" || bid === "minecraft:lava") continue;
      if (bid.includes("stairs") || bid.endsWith("_slab") || bid.includes("ladder")) continue;
      if (bid.includes("wall") || bid.includes("fence")) continue;
      // Reject outdoor seats: need a ceiling within a few blocks.
      let covered = false;
      for (let up = 2; up <= 8; up++) {
        const roof = dim.getBlock({ x, y: y + up, z });
        if (roof && !roof.isAir) {
          covered = true;
          break;
        }
      }
      if (!covered) continue;
      return y;
    } catch {
    }
  }
  return undefined;
}

function findSpawnY(dim, x, baseY, z) {
  const start = Math.floor(baseY);
  for (let y = start; y >= start - 48; y--) {
    let below;
    let here;
    let above;
    try {
      below = dim.getBlock({ x: Math.floor(x), y: y - 1, z: Math.floor(z) });
      here = dim.getBlock({ x: Math.floor(x), y, z: Math.floor(z) });
      above = dim.getBlock({ x: Math.floor(x), y: y + 1, z: Math.floor(z) });
    } catch {
      continue;
    }
    if (!below || !here || !above) continue;
    if (below.isAir || below.typeId === "minecraft:water") continue;
    if (!here.isAir || !above.isAir) continue;
    return y;
  }
  return undefined;
}

function findOpenSpawn(dim, cx, preferredY, cz) {
  const offsets = [
    [0, 0],
    [2, 0],
    [-2, 0],
    [0, 2],
    [0, -2],
    [3, 1],
    [-3, -1],
    [1, 3],
    [-1, -3],
    [4, 2],
    [-4, 2],
  ];
  for (const [dx, dz] of offsets) {
    const x = cx + dx;
    const z = cz + dz;
    const y = findSpawnY(dim, x, preferredY, z);
    if (y === undefined) continue;
    if (isAirSpawnCell(dim, x, y, z)) return { x, y, z };
  }
  return undefined;
}

function pickLootStack() {
  const roll = Math.random();
  if (roll < 0.08) return new ItemStack("relics:relic_shard", 1 + Math.floor(Math.random() * 3));
  if (roll < 0.14) return new ItemStack("relics:mystic_herb", 1 + Math.floor(Math.random() * 2));
  if (roll < 0.18) return new ItemStack("relics:silver_fragment", 1);
  if (roll < 0.22) return new ItemStack("relics:arcane_dust", 1);
  if (roll < 0.32) return new ItemStack("minecraft:arrow", 4 + Math.floor(Math.random() * 9));
  if (roll < 0.4) return new ItemStack("minecraft:bread", 1 + Math.floor(Math.random() * 4));
  if (roll < 0.48) return new ItemStack("minecraft:iron_ingot", 1 + Math.floor(Math.random() * 3));
  if (roll < 0.55) return new ItemStack("minecraft:bone", 2 + Math.floor(Math.random() * 4));
  if (roll < 0.62) return new ItemStack("minecraft:rotten_flesh", 2 + Math.floor(Math.random() * 4));
  if (roll < 0.68) return new ItemStack("minecraft:torch", 4 + Math.floor(Math.random() * 8));
  if (roll < 0.74) return new ItemStack("minecraft:string", 1 + Math.floor(Math.random() * 5));
  if (roll < 0.8) return new ItemStack("minecraft:wheat", 3 + Math.floor(Math.random() * 5));
  if (roll < 0.85) return new ItemStack("minecraft:emerald", 1);
  if (roll < 0.9) return new ItemStack("minecraft:gold_ingot", 1);
  if (roll < 0.94) return new ItemStack("minecraft:book", 1);
  if (roll < 0.97) return new ItemStack("minecraft:iron_sword", 1);
  return new ItemStack("minecraft:golden_apple", 1);
}

function containerIsEmpty(inv) {
  for (let i = 0; i < inv.size; i++) {
    if (inv.getItem(i)) return false;
  }
  return true;
}

function fillStructureChest(block) {
  const inv = block.getComponent("minecraft:inventory")?.container;
  if (!inv || !containerIsEmpty(inv)) return false;
  const rolls = 3 + Math.floor(Math.random() * 4);
  for (let n = 0; n < rolls; n++) {
    const stack = pickLootStack();
    let placed = false;
    for (let i = 0; i < inv.size; i++) {
      if (inv.getItem(i)) continue;
      inv.setItem(i, stack);
      placed = true;
      break;
    }
    if (!placed) break;
  }
  // Bonus relic — rarer rolls are less common (harder fights when they hit).
  if (Math.random() < 0.41) {
    const r = Math.random();
    const tier = r < 0.1 ? "rare" : r < 0.4 ? "uncommon" : "common";
    tryAddRelicToChest(block, tier);
  }
  return true;
}

function selectChestsPerFloor(chests, maxPerFloor = 2) {
  const sorted = [...chests].sort((a, b) => a[1] - b[1]);
  const out = [];
  let bandY = -999;
  let bandCount = 0;
  for (const c of sorted) {
    if (c[1] - bandY > 3) {
      bandY = c[1];
      bandCount = 0;
    }
    if (bandCount >= maxPerFloor) continue;
    out.push(c);
    bandCount++;
  }
  return out;
}

function ensureStructureChests(dimension, origin, layout, kind) {
  loadChestSeeds();
  loadMimicDisguises();
  const seedKey = siteKey(origin.x, origin.y, origin.z);
  // Destroyed chests must stay gone — never re-place after the first seed.
  if (seededChestSites.has(seedKey)) return 0;

  let placed = 0;
  // Tower + home: fill baked pool seats only (1–3/floor baked at import).
  let chestList;
  let mimicLocal = null;
  if (kind.startsWith("tower")) {
    chestList = Object.values(TOWER_CHEST_POOLS).flat();
    if (kind.endsWith("_mimic") && chestList.length) {
      mimicLocal = null; // trapped mimic chest already baked into mimic structures
    }
  } else if (kind.startsWith("home")) {
    chestList = Object.values(HOME_CHEST_POOLS).flat();
    if (kind.endsWith("_mimic") && chestList.length) {
      mimicLocal = null; // trapped mimic chest already baked into mimic structures
    }
  } else {
    mimicLocal =
      kind.endsWith("_mimic") && layout.mimicChest ? layout.mimicChest : null;
    chestList = selectChestsPerFloor(layout.chests, 2);
  }

  for (const [lx, ly, lz] of chestList) {
    const x = origin.x + lx;
    const y = origin.y + ly;
    const z = origin.z + lz;
    let block;
    try {
      block = dimension.getBlock({ x, y, z });
    } catch {
      continue;
    }
    if (!block) continue;

    const bounds = structureBounds(origin, layout);
    // Never keep / fill roof or exterior chests.
    if (
      (kind.startsWith("tower") || kind.startsWith("home")) &&
      !isIndoorLootSeat(dimension, x, y, z, bounds, false)
    ) {
      const id0 = block.typeId;
      if (
        id0 === "minecraft:chest" ||
        id0 === "minecraft:trapped_chest" ||
        id0 === "relics:dummy_chest"
      ) {
        try {
          block.setPermutation(BlockPermutation.resolve("minecraft:air"));
        } catch {
        }
      }
      continue;
    }

    const wantMimic =
      mimicLocal && mimicLocal[0] === lx && mimicLocal[1] === ly && mimicLocal[2] === lz;
    const id = block.typeId;

    if (wantMimic) {
      // Disguised mimic = trapped chest (looks like a normal chest).
      if (id !== "minecraft:trapped_chest" && id !== "relics:dummy_chest") {
        if (!block.isAir && id !== "minecraft:chest" && id !== "minecraft:light_block") {
          continue;
        }
        try {
          block.setPermutation(
            BlockPermutation.resolve("minecraft:trapped_chest", {
              "minecraft:cardinal_direction": "south",
            })
          );
        } catch {
          try {
            block.setPermutation(BlockPermutation.resolve("minecraft:trapped_chest"));
          } catch {
            continue;
          }
        }
        placed++;
      }
      disguisedMimicChests.add(`${dimension.id}:${x},${y},${z}`);
      continue;
    }

    if (id === "minecraft:chest" || id === "minecraft:trapped_chest" || id === "minecraft:barrel") {
      if (fillStructureChest(block)) placed++;
      continue;
    }

    // Tower/home chests are baked into the .mcstructure (1–3/floor). Never invent extras at runtime.
    if (kind.startsWith("tower") || kind.startsWith("home")) {
      continue;
    }

    if (!block.isAir && id !== "minecraft:light_block" && id !== "minecraft:structure_void") {
      continue;
    }

    try {
      block.setPermutation(
        BlockPermutation.resolve("minecraft:chest", {
          "minecraft:cardinal_direction": "south",
        })
      );
    } catch {
      try {
        block.setPermutation(BlockPermutation.resolve("minecraft:chest"));
      } catch {
        continue;
      }
    }
    const fillX = x;
    const fillY = y;
    const fillZ = z;
    system.run(() => {
      try {
        const again = dimension.getBlock({ x: fillX, y: fillY, z: fillZ });
        if (again) fillStructureChest(again);
      } catch {
      }
    });
    placed++;
  }

  seededChestSites.add(seedKey);
  saveChestSeeds();
  saveMimicDisguises();
  return placed;
}

function resolveStructureOrigin(dimension, kind, chestX, chestY, chestZ) {
  const layoutName = kind.startsWith("home") ? "home" : "tower";
  const layout = STRUCTURE_LAYOUTS[layoutName];
  if (!layout) return undefined;
  const [anchorX, anchorY, anchorZ, anchorType] = layout.anchor;

  const tryOrigin = (origin) => {
    try {
      const anchor = dimension.getBlock({
        x: origin.x + anchorX,
        y: origin.y + anchorY,
        z: origin.z + anchorZ,
      });
      if (anchor?.typeId === anchorType) {
        return { origin, layout };
      }
    } catch {
    }
    return undefined;
  };

  // Direct hit on the structure anchor block (from findNearestTower scan).
  const direct = tryOrigin({
    x: Math.floor(chestX - anchorX),
    y: Math.floor(chestY - anchorY),
    z: Math.floor(chestZ - anchorZ),
  });
  if (direct) return direct;

  for (const [localX, localY, localZ] of layout.chests) {
    const hit = tryOrigin({
      x: Math.floor(chestX - localX),
      y: Math.floor(chestY - localY),
      z: Math.floor(chestZ - localZ),
    });
    if (hit) return hit;
  }

  // Fallback: scan for anchor near the site (handles odd chest hits / stripped loot tables).
  const [sx, sy, sz] = layout.size ?? [24, 48, 24];
  const scanR = Math.max(sx, sz) + 4;
  for (let dx = -scanR; dx <= scanR; dx += 2) {
    for (let dz = -scanR; dz <= scanR; dz += 2) {
      for (let dy = -sy; dy <= 8; dy += 2) {
        const ax = Math.floor(chestX + dx);
        const ay = Math.floor(chestY + dy);
        const az = Math.floor(chestZ + dz);
        try {
          const block = dimension.getBlock({ x: ax, y: ay, z: az });
          if (block?.typeId !== anchorType) continue;
        } catch {
          continue;
        }
        const hit = tryOrigin({
          x: ax - anchorX,
          y: ay - anchorY,
          z: az - anchorZ,
        });
        if (hit) return hit;
      }
    }
  }
  return undefined;
}

function refineKindWithMimicMarker(dimension, kind, resolved) {
  if (!resolved || kind.endsWith("_mimic")) return kind;
  const mimicPos = resolved.layout.mimicChest;
  if (!mimicPos) return kind;
  const [lx, ly, lz] = mimicPos;
  try {
    const block = dimension.getBlock({
      x: resolved.origin.x + lx,
      y: resolved.origin.y + ly,
      z: resolved.origin.z + lz,
    });
    const id = block?.typeId;
    if (id === "relics:dummy_chest" || id === "minecraft:trapped_chest") {
      return kind.startsWith("home") ? "home_mimic" : "tower_mimic";
    }
  } catch {
  }
  loadMimicDisguises();
  const key = `${dimension.id}:${resolved.origin.x + lx},${resolved.origin.y + ly},${resolved.origin.z + lz}`;
  if (disguisedMimicChests.has(key)) {
    return kind.startsWith("home") ? "home_mimic" : "tower_mimic";
  }
  return kind;
}

function structureBounds(origin, layout) {
  const [sx, sy, sz] = layout.size ?? [24, 48, 24];
  const maxMobY = layout.maxMobY ?? Math.max(8, sy - 12);
  return {
    minX: origin.x,
    minY: origin.y,
    minZ: origin.z,
    maxX: origin.x + sx - 1,
    maxY: origin.y + maxMobY,
    maxZ: origin.z + sz - 1,
  };
}

const STRUCTURE_HOSTILES = new Set([
  "minecraft:witch",
  "minecraft:zombie",
  "minecraft:skeleton",
  "minecraft:wither_skeleton",
  "minecraft:pillager",
  "minecraft:vindicator",
  "minecraft:husk",
  "minecraft:stray",
  "relics:mimic",
]);

/** Plain vanilla hostiles — spawned via spawnEntity, never baked into .mcstructure. */
const STRUCTURE_DEFENDER_TYPES = [
  "minecraft:zombie",
  "minecraft:skeleton",
  "minecraft:wither_skeleton",
  "minecraft:pillager",
  "minecraft:witch",
];

function structureChestLocals(kind, layout) {
  if (kind.startsWith("tower")) return Object.values(TOWER_CHEST_POOLS).flat();
  if (kind.startsWith("home")) return Object.values(HOME_CHEST_POOLS).flat();
  return layout?.chests ?? [];
}

function countNearbyWalls(dim, x, y, z) {
  const fx = Math.floor(x);
  const fy = Math.floor(y);
  const fz = Math.floor(z);
  let wallHits = 0;
  for (const [dx, dz] of [
    [0, -1],
    [0, 1],
    [1, 0],
    [-1, 0],
  ]) {
    for (let d = 1; d <= 4; d++) {
      try {
        const n = dim.getBlock({ x: fx + dx * d, y: fy, z: fz + dz * d });
        if (n && !n.isAir) {
          wallHits++;
          break;
        }
      } catch {
        break;
      }
    }
  }
  return wallHits;
}

/** True if this cell opens to the outside in 2+ directions (ledge / balcony). */
function hasOutdoorOpening(dim, x, y, z, bounds) {
  const fx = Math.floor(x);
  const fy = Math.floor(y);
  const fz = Math.floor(z);
  let openDirs = 0;
  for (const [dx, dz] of [
    [0, -1],
    [0, 1],
    [1, 0],
    [-1, 0],
  ]) {
    let airRun = 0;
    for (let d = 1; d <= 10; d++) {
      const xx = fx + dx * d;
      const zz = fz + dz * d;
      if (bounds) {
        if (xx < bounds.minX || xx > bounds.maxX || zz < bounds.minZ || zz > bounds.maxZ) {
          if (airRun >= 2) openDirs++;
          break;
        }
      }
      try {
        const n = dim.getBlock({ x: xx, y: fy, z: zz });
        if (!n || !n.isAir) break;
        airRun++;
      } catch {
        if (airRun >= 2) openDirs++;
        break;
      }
    }
  }
  return openDirs >= 2;
}

/**
 * Indoor loot/spawn seat: under a ceiling, not a roof/ledge, not stairs.
 * requireAir=true for mob feet; false when checking a chest block cell.
 */
function isIndoorLootSeat(dim, x, y, z, bounds, requireAir = false) {
  if (requireAir) {
    if (!isAirSpawnCell(dim, x, y, z)) return false;
    if (!hasSolidFloor(dim, x, y, z)) return false;
  } else {
    try {
      const below = dim.getBlock({
        x: Math.floor(x),
        y: Math.floor(y) - 1,
        z: Math.floor(z),
      });
      if (!below || below.isAir) return false;
      const bid = below.typeId ?? "";
      if (bid.includes("stairs") || bid.includes("fence")) return false;
    } catch {
      return false;
    }
  }
  if (isSkyExposed(dim, x, y, z)) return false;
  if (countNearbyWalls(dim, x, y, z) < 2) return false;
  if (hasOutdoorOpening(dim, x, y, z, bounds)) return false;
  return true;
}

function nearAnyChest(loc, chests, maxDist = 5.5) {
  for (const c of chests) {
    const dx = loc.x - (c.x + 0.5);
    const dy = loc.y - c.y;
    const dz = loc.z - (c.z + 0.5);
    if (dx * dx + dz * dz <= maxDist * maxDist && Math.abs(dy) <= 3) return true;
  }
  return false;
}

function collectLiveStructureChests(dimension, origin, layout, kind) {
  const bounds = structureBounds(origin, layout);
  const locals = structureChestLocals(kind, layout);
  const live = [];
  for (const [lx, ly, lz] of locals) {
    const x = origin.x + lx;
    const y = origin.y + ly;
    const z = origin.z + lz;
    let block;
    try {
      block = dimension.getBlock({
        x: Math.floor(x),
        y: Math.floor(y),
        z: Math.floor(z),
      });
    } catch {
      continue;
    }
    const id = block?.typeId ?? "";
    if (
      id !== "minecraft:chest" &&
      id !== "minecraft:trapped_chest" &&
      id !== "relics:dummy_chest"
    ) {
      continue;
    }
    if (!isIndoorLootSeat(dimension, x, y, z, bounds, false)) continue;
    live.push({ x, y, z, id });
  }
  return live;
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;
  }
  return arr;
}

/** Red-dot / pool seats from the layer images — mob feet candidates. */
function structureMobSeatLocals(kind) {
  if (kind.startsWith("tower")) return Object.values(TOWER_CHEST_POOLS).flat();
  if (kind.startsWith("home")) return Object.values(HOME_CHEST_POOLS).flat();
  return [];
}

/**
 * Soft standable seat: air feet + solid floor, not sky-exposed roof.
 * Looser than chest indoor checks so red-dot seats actually work.
 */
function isStandableMobSeat(dim, x, y, z) {
  if (!isAirSpawnCell(dim, x, y, z)) return false;
  if (!hasSolidFloor(dim, x, y, z)) return false;
  if (isSkyExposed(dim, x, y, z)) return false;
  return true;
}

/**
 * Spawn natural vanilla hostiles on red-dot layer seats (and near live chests).
 * Count scales a bit with best relic tier among filled chests.
 */
function buildRedDotRoster(dimension, origin, layout, kind) {
  const bounds = structureBounds(origin, layout);
  const chests = collectLiveStructureChests(dimension, origin, layout, kind);
  let bestTier = "none";
  for (const chest of chests) {
    try {
      const block = dimension.getBlock({
        x: Math.floor(chest.x),
        y: Math.floor(chest.y),
        z: Math.floor(chest.z),
      });
      if (!block) continue;
      const inv = block.getComponent("minecraft:inventory")?.container;
      if (!inv) continue;
      for (let i = 0; i < inv.size; i++) {
        const stack = inv.getItem(i);
        if (!stack?.typeId) continue;
        bestTier = maxRelicTier(bestTier, relicLootTier(stack.typeId));
      }
    } catch {
    }
  }
  const want = Math.max(4, defenderCountForTier(bestTier));

  const locals = shuffleInPlace([...structureMobSeatLocals(kind)]);
  const roster = [];
  const used = [];
  let ti = 0;

  const trySeat = (lx, ly, lz) => {
    if (roster.length >= want) return;
    const x = origin.x + lx + 0.5;
    const z = origin.z + lz + 0.5;
    // Prefer exact red-dot Y — soft standable check (not the harsh wall-count indoor gate).
    let y;
    const start = origin.y + ly;
    for (const dy of [0, 1, -1]) {
      const ty = Math.floor(start) + dy;
      if (ty < bounds.minY || ty > bounds.maxY) continue;
      if (isStandableMobSeat(dimension, x, ty, z)) {
        y = ty;
        break;
      }
    }
    if (y === undefined) return;
    for (const u of used) {
      if (Math.hypot(x - u.x, z - u.z) < 1.1 && Math.abs(y - u.y) < 2) return;
    }
    // Don't stand inside a chest block.
    try {
      const here = dimension.getBlock({
        x: Math.floor(x),
        y: Math.floor(y),
        z: Math.floor(z),
      });
      const id = here?.typeId ?? "";
      if (id.includes("chest") || id === "relics:dummy_chest" || id.includes("barrel")) {
        return;
      }
    } catch {
    }
    used.push({ x, y, z });
    roster.push([
      STRUCTURE_DEFENDER_TYPES[ti % STRUCTURE_DEFENDER_TYPES.length],
      x,
      y,
      z,
    ]);
    ti++;
  };

  for (const [lx, ly, lz] of locals) {
    trySeat(lx, ly, lz);
  }

  // Fallback: offset beside live chests if pools didn't yield enough seats.
  if (roster.length < Math.min(want, 3)) {
    for (const chest of chests) {
      if (roster.length >= want) break;
      for (const [dx, dz] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [2, 0],
        [0, 2],
      ]) {
        if (roster.length >= want) break;
        trySeat(
          Math.floor(chest.x) - origin.x + dx,
          Math.floor(chest.y) - origin.y,
          Math.floor(chest.z) - origin.z + dz
        );
      }
    }
  }

  if (kind.endsWith("_mimic") && chests.length) {
    const c = chests[Math.floor(chests.length / 2)];
    const mx = Math.floor(c.x) - origin.x;
    const my = Math.floor(c.y) - origin.y;
    const mz = Math.floor(c.z) - origin.z;
    for (const [dx, dz] of [
      [0, 1],
      [1, 0],
      [-1, 0],
      [0, -1],
    ]) {
      const x = origin.x + mx + dx + 0.5;
      const z = origin.z + mz + dz + 0.5;
      let y;
      const start = origin.y + my;
      for (const dy of [0, 1, -1]) {
        const ty = Math.floor(start) + dy;
        if (isStandableMobSeat(dimension, x, ty, z)) {
          y = ty;
          break;
        }
      }
      if (y === undefined) continue;
      roster.push(["relics:mimic", x, y, z]);
      break;
    }
  }

  return { roster, bounds, chests };
}

/** Spawn a normal vanilla mob — no effects, no NBT bake. */
function spawnVanillaDefender(dim, typeId, x, y, z) {
  try {
    return dim.spawnEntity(typeId, { x, y: Math.floor(y), z });
  } catch (err) {
    console.warn(`[RPG Relics] spawn ${typeId} failed: ${err}`);
    return undefined;
  }
}

/**
 * Only remove hostiles clearly outside (grass skirt / open sky roofs).
 * Never delete indoor red-dot guards — that was wiping spawns every tick.
 */
function scrubExteriorHostiles(dimension, origin, layout, kind) {
  const bounds = structureBounds(origin, layout);
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  const cz = (bounds.minZ + bounds.maxZ) / 2;
  const radius =
    Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY, bounds.maxZ - bounds.minZ) / 2 + 6;
  let removed = 0;
  try {
    const nearby = dimension.getEntities({
      location: { x: cx, y: cy, z: cz },
      maxDistance: radius,
      excludeTypes: ["minecraft:player", "minecraft:item"],
    });
    for (const e of nearby) {
      const id = e.typeId ?? "";
      if (
        !STRUCTURE_HOSTILES.has(id) &&
        !id.startsWith("relics:mimic") &&
        id !== "minecraft:vindicator"
      ) {
        continue;
      }
      const loc = e.location;
      if (!loc) continue;
      if (
        loc.x < bounds.minX - 2 ||
        loc.x > bounds.maxX + 3 ||
        loc.z < bounds.minZ - 2 ||
        loc.z > bounds.maxZ + 3 ||
        loc.y < bounds.minY - 2 ||
        loc.y > bounds.maxY + 12
      ) {
        continue;
      }

      let floorId = "";
      try {
        floorId =
          dimension.getBlock({
            x: Math.floor(loc.x),
            y: Math.floor(loc.y) - 1,
            z: Math.floor(loc.z),
          })?.typeId ?? "";
      } catch {
      }
      const onOutdoorFloor =
        floorId.includes("grass") ||
        floorId.includes("dirt") ||
        floorId.includes("sand") ||
        floorId.includes("gravel") ||
        floorId.includes("path") ||
        floorId.includes("podzol") ||
        floorId.includes("mycelium");
      const onRoof = isSkyExposed(dimension, loc.x, loc.y, loc.z) && onOutdoorFloor;
      if (!onOutdoorFloor && !onRoof) continue;

      try {
        e.remove();
        removed++;
      } catch {
      }
    }
  } catch {
  }
  return removed;
}

/** Delete any structure chests sitting on roofs / exterior ledges. */
function scrubExteriorChests(dimension, origin, layout, kind) {
  const bounds = structureBounds(origin, layout);
  const locals = structureChestLocals(kind, layout);
  let removed = 0;
  for (const [lx, ly, lz] of locals) {
    const x = origin.x + lx;
    const y = origin.y + ly;
    const z = origin.z + lz;
    let block;
    try {
      block = dimension.getBlock({
        x: Math.floor(x),
        y: Math.floor(y),
        z: Math.floor(z),
      });
    } catch {
      continue;
    }
    const id = block?.typeId ?? "";
    if (
      id !== "minecraft:chest" &&
      id !== "minecraft:trapped_chest" &&
      id !== "relics:dummy_chest"
    ) {
      continue;
    }
    if (isIndoorLootSeat(dimension, x, y, z, bounds, false)) continue;
    try {
      block.setPermutation(BlockPermutation.resolve("minecraft:air"));
      disguisedMimicChests.delete(`${dimension.id}:${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`);
      removed++;
    } catch {
    }
  }
  return removed;
}

/** Keep structure hostiles at vanilla pace — strip Speed/Slowness if any. */
function paceStructureHostile(entity) {
  if (!entity) return;
  for (const id of ["speed", "minecraft:speed", "slowness", "minecraft:slowness"]) {
    try {
      entity.removeEffect(id);
    } catch {
    }
  }
}

/**
 * Fill loot, scrub roofs/exteriors, then once per site spawn plain vanilla
 * defenders beside indoor chests (spawnEntity — not baked structure NBT).
 */
export function ensureTowerDefenders(blockOrSite) {
  loadActivatedDefenders();
  const x = blockOrSite.x ?? blockOrSite.location?.x;
  const y = blockOrSite.y ?? blockOrSite.location?.y;
  const z = blockOrSite.z ?? blockOrSite.location?.z;
  const dim = blockOrSite.dimension ?? undefined;
  if (x === undefined || y === undefined || z === undefined) return false;

  let kind = blockOrSite.kind;
  let dimension = dim;
  let siteBlock;
  if (!kind || !dimension) {
    let block = blockOrSite.typeId ? blockOrSite : undefined;
    if (!block && dimension) {
      try {
        block = dimension.getBlock({
          x: Math.floor(x),
          y: Math.floor(y),
          z: Math.floor(z),
        });
      } catch {
      }
    }
    if (!block?.dimension) return false;
    dimension = block.dimension;
    siteBlock = block;
    kind = classifyStructureSite(block);
  } else if (dimension) {
    try {
      siteBlock = dimension.getBlock({
        x: Math.floor(x),
        y: Math.floor(y),
        z: Math.floor(z),
      });
    } catch {
    }
  }
  if (siteBlock && isPlayerPlacedContainer(siteBlock)) return false;
  if (!kind || !dimension) return false;

  const resolved = resolveStructureOrigin(dimension, kind, x, y, z);
  if (!resolved) return false;
  kind = refineKindWithMimicMarker(dimension, kind, resolved);

  ensureStructureChests(dimension, resolved.origin, resolved.layout, kind);
  scrubExteriorChests(dimension, resolved.origin, resolved.layout, kind);

  const key = siteKey(resolved.origin.x, resolved.origin.y, resolved.origin.z);
  let spawned = false;
  if (!activatedDefenderSites.has(key)) {
    const { roster } = buildRedDotRoster(
      dimension,
      resolved.origin,
      resolved.layout,
      kind
    );
    for (const [typeId, sx, sy, sz] of roster) {
      if (spawnVanillaDefender(dimension, typeId, sx, sy, sz)) spawned = true;
    }
    // One-time roof/grass cleanup only — never every tick (that deleted indoor guards).
    scrubExteriorHostiles(dimension, resolved.origin, resolved.layout, kind);
    activatedDefenderSites.add(key);
    saveActivatedDefenders();
  }
  return spawned;
}

export function tickTowerDefenders(player) {
  const hit = findNearestTower(player, 96);
  if (!hit) return;
  ensureTowerDefenders({ ...hit, dimension: player.dimension });
  tickNearChestGlint(player, hit);
}

/** Tip when approaching a structure loot chest — before you open it. */
function tickNearChestGlint(player, hit) {
  if (!player || !hit) return;
  const dim = player.dimension;
  const px = player.location.x;
  const py = player.location.y;
  const pz = player.location.z;
  const dx = hit.x + 0.5 - px;
  const dy = hit.y - py;
  const dz = hit.z + 0.5 - pz;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (dist > 5.5) return;

  const tipKey = `${dim.id}:${Math.floor(hit.x)},${Math.floor(hit.y)},${Math.floor(hit.z)}`;
  if (glintTipsShown.has(tipKey)) return;

  let block;
  try {
    block = dim.getBlock({
      x: Math.floor(hit.x),
      y: Math.floor(hit.y),
      z: Math.floor(hit.z),
    });
  } catch {
    return;
  }
  if (!block) return;
  if (!CHEST_TYPES.has(block.typeId) && block.typeId !== "relics:dummy_chest") return;
  if (isPlayerPlacedContainer(block)) return;

  // Only structure sites (tower/home), not random world chests.
  const kind = hit.kind || classifyStructureSite(block);
  if (!kind) return;
  const resolved = resolveStructureOrigin(dim, kind, hit.x, hit.y, hit.z);
  if (!resolved) return;

  glintTipsShown.add(tipKey);
  if (glintTipsShown.size > 120) {
    const drop = [...glintTipsShown].slice(0, 40);
    for (const k of drop) glintTipsShown.delete(k);
  }
  const tip = "\u00A7eSomething glints in the bottom of the chest\u2026";
  try {
    player.onScreenDisplay?.setActionBar?.(tip);
  } catch {
  }
  // Clear action bar after a few seconds so it doesn't stick.
  system.runTimeout(() => {
    try {
      player.onScreenDisplay?.setActionBar?.("");
    } catch {
    }
  }, GLINT_TIP_TICKS);
}

function siteLabel(typeId, y) {
  if (typeId === "relics:dummy_chest") return "Mimic camp";
  return y > 32 ? "Relic tower or home" : "Underground camp";
}

function directionTo(player, target) {
  const dx = target.x - player.location.x;
  const dz = target.z - player.location.z;
  if (Math.abs(dx) > Math.abs(dz)) return dx > 0 ? "east" : "west";
  return dz > 0 ? "south" : "north";
}

function findNearestRelicSite(player, radius = 48) {
  const dim = player.dimension;
  const center = player.location;
  const height = dim.heightRange ?? { min: -64, max: 320 };
  const volume = new BlockVolume(
    {
      x: Math.floor(center.x - radius),
      y: Math.max(height.min, Math.floor(center.y - 72)),
      z: Math.floor(center.z - radius),
    },
    {
      x: Math.floor(center.x + radius),
      y: Math.min(height.max - 1, Math.floor(center.y + 72)),
      z: Math.floor(center.z + radius),
    }
  );

  let matches;
  try {
    matches = dim.getBlocks(
      volume,
      {
        includeTypes: [
          "relics:dummy_chest",
          "minecraft:campfire",
          "minecraft:soul_campfire",
          "minecraft:bell",
        ],
      },
      true
    );
  } catch {
    return undefined;
  }

  let best;
  let bestDistance = Infinity;
  for (const location of matches.getBlockLocationIterator()) {
    const dx = location.x + 0.5 - center.x;
    const dy = location.y + 0.5 - center.y;
    const dz = location.z + 0.5 - center.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (distance >= bestDistance) continue;
    const block = dim.getBlock(location);
    if (!block) continue;
    bestDistance = distance;
    best = {
      dimensionId: dim.id,
      x: location.x + 0.5,
      y: location.y + 0.5,
      z: location.z + 0.5,
      label: siteLabel(block.typeId, location.y),
      lastDistance: distance,
    };
  }
  return best;
}

export function startRelicSense(player) {
  if (!isRelicSenseEnabled(player)) {
    player.sendMessage("\u00A78Relic Sense is disabled. Enable it in the Relic Tome settings.");
    return;
  }
  player.sendMessage("\u00A77The Relic Tome searches nearby\u2026");
  system.run(() => {
    const target = findNearestRelicSite(player);
    if (!target) {
      relicSenseTargets.delete(player.id);
      player.sendMessage("\u00A78The pages remain still. No relic site is nearby.");
      return;
    }
    relicSenseTargets.set(player.id, target);
    const direction = directionTo(player, target);
    player.sendMessage(
      `\u00A7dRelic Sense: \u00A7f${target.label} \u00A77? ${Math.round(target.lastDistance)}m ${direction}.`
    );
  });
}

export function clearRelicSense(player) {
  relicSenseTargets.delete(player.id);
}

export function tickRelicSense(player) {
  const target = relicSenseTargets.get(player.id);
  if (!target) return;
  if (!isRelicSenseEnabled(player)) {
    relicSenseTargets.delete(player.id);
    return;
  }
  if (player.dimension.id !== target.dimensionId) {
    relicSenseTargets.delete(player.id);
    return;
  }

  const dx = target.x - player.location.x;
  const dy = target.y - player.location.y;
  const dz = target.z - player.location.z;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (distance <= 5) {
    player.onScreenDisplay.setActionBar(`\u00A7dRelic Sense: \u00A7a${target.label} found!`);
    player.playSound("random.orb", { volume: 0.7, pitch: 1.3 });
    relicSenseTargets.delete(player.id);
    return;
  }

  const change = target.lastDistance - distance;
  const warmth = change > 1 ? "\u00A7a warmer" : change < -1 ? "\u00A7c colder" : "";
  const direction = directionTo(player, target);
  player.onScreenDisplay.setActionBar(
    `\u00A7dRelic Sense: \u00A7f${target.label} \u00A77${Math.round(distance)}m ${direction}${warmth}`
  );
  target.lastDistance = distance;
}

export function handleCampCommand(player, teleport = false) {
  player.sendMessage("\u00A77Scanning for camps\u2026");
  system.run(() => {
    const hit = findNearestCamp(player, 96);
    if (!hit) {
      player.sendMessage(
        "\u00A7cNo camp found within \u00A7e96\u00A7c blocks. Dig to Y \u2264 0 in \u00A7enew chunks\u00A7c, or:\n\u00A7e/structure load mystructure:mimic_campsite ~ ~ ~"
      );
      return;
    }
    const label = hit.typeId === "relics:dummy_chest" ? "mimic camp" : "camp";
    player.sendMessage(
      `\u00A7aNearest ${label}: \u00A7e${hit.x} ${hit.y} ${hit.z}\u00A7a (\u00A77${hit.dist.toFixed(0)}m\u00A7a)`
    );
    if (teleport) {
      try {
        player.teleport(
          { x: hit.x + 0.5, y: hit.y + 1, z: hit.z + 0.5 },
          { dimension: player.dimension }
        );
        player.sendMessage("\u00A7aTeleported.");
      } catch (err) {
        player.sendMessage(`\u00A7cTeleport failed: ${err}`);
      }
    } else {
      player.sendMessage("\u00A78Use \u00A7e/scriptevent relics:camp_tp\u00A78 to teleport there.");
    }
  });
}

export function handleTowerCommand(player, teleport = false) {
  player.sendMessage("\u00A77Scanning for towers and homes\u2026");
  system.run(() => {
    const hit = findNearestTower(player, 192);
    if (!hit) {
      player.sendMessage(
        "\u00A7cNo tower/home chest found within \u00A7e192\u00A7c blocks. Explore \u00A7enew chunks\u00A7c, or test with:\n\u00A7e/structure load mystructure:relic_tower_spruce ~ ~ ~\n\u00A7e/structure load mystructure:relic_home_fantasy ~ ~ ~"
      );
      return;
    }
    const label =
      hit.kind === "home" || hit.kind === "home_mimic"
        ? hit.kind === "home_mimic"
          ? "mimic witch home"
          : "witch home"
        : hit.kind === "tower_mimic"
          ? "mimic spruce tower"
          : "spruce tower";
    player.sendMessage(
      `\u00A7aNearest ${label}: \u00A7e${hit.x} ${hit.y} ${hit.z}\u00A7a (\u00A77${hit.dist.toFixed(0)}m\u00A7a)`
    );
    ensureTowerDefenders({ ...hit, dimension: player.dimension });
    if (teleport) {
      try {
        player.teleport(
          { x: hit.x + 0.5, y: hit.y + 1, z: hit.z + 0.5 },
          { dimension: player.dimension }
        );
        player.sendMessage("\u00A7aTeleported.");
      } catch (err) {
        player.sendMessage(`\u00A7cTeleport failed: ${err}`);
      }
    } else {
      player.sendMessage("\u00A78Use \u00A7e/scriptevent relics:tower_tp\u00A78 to teleport there.");
    }
  });
}

export function registerAcquisition() {
  world.afterEvents.playerPlaceBlock.subscribe((ev) => {
    rememberPlayerPlaced(ev.block);
  });

  world.afterEvents.playerInteractWithBlock.subscribe((ev) => {
    if (ev.isFirstEvent === false) return;
    if (ev.block.typeId === "relics:dummy_chest") {
      system.run(() => {
        if (!awakenDummyChest(ev.block)) return;
        ev.player.sendMessage("\u00A77The chest creaks open\u2026");
        system.runTimeout(() => {
          ev.player.sendMessage("\u00A7cIt was a mimic!");
        }, 8);
      });
      return;
    }
    if (!CHEST_TYPES.has(ev.block.typeId)) return;
    if (isPlayerPlacedContainer(ev.block)) return;
    if (isDisguisedMimicChest(ev.block)) {
      system.run(() => {
        if (!awakenDisguisedMimic(ev.block)) return;
        ev.player.sendMessage("\u00A77The chest creaks open\u2026");
        system.runTimeout(() => {
          ev.player.sendMessage("\u00A7cIt was a mimic!");
        }, 8);
      });
      return;
    }
    // Only structure loot chests (confirmed tower/home origin) stir defenders.
    system.run(() => {
      if (isPlayerPlacedContainer(ev.block)) return;
      const kind = classifyStructureSite(ev.block);
      if (!kind) return;
      const resolved = resolveStructureOrigin(
        ev.block.dimension,
        kind,
        ev.block.location.x,
        ev.block.location.y,
        ev.block.location.z
      );
      if (!resolved) return;
      ensureTowerDefenders({
        ...ev.block.location,
        kind,
        dimension: ev.block.dimension,
        typeId: ev.block.typeId,
      });
    });
    onChestOpen(ev.block, ev.player);
  });

  world.afterEvents.playerBreakBlock.subscribe((ev) => {
    try {
      playerPlacedContainers.delete(blockKey(ev.block));
    } catch {
    }
    const brokenId = ev.brokenBlockPermutation?.type?.id;
    const loc = ev.block.location;
    const dim = ev.player?.dimension ?? ev.block.dimension;
    const brokenKey = `${dim?.id}:${loc.x},${loc.y},${loc.z}`;

    if (brokenId === "relics:dummy_chest") {
      if (awakeningMimics.has(blockKey(ev.block))) return;
      system.run(() => {
        spawnMimic(dim, loc);
        ev.player?.sendMessage("\u00A7cA mimic lunges out of the chest!");
      });
      return;
    }

    loadMimicDisguises();
    if (
      (brokenId === "minecraft:trapped_chest" || brokenId === "minecraft:chest") &&
      disguisedMimicChests.has(brokenKey)
    ) {
      if (awakeningMimics.has(brokenKey)) return;
      disguisedMimicChests.delete(brokenKey);
      saveMimicDisguises();
      system.run(() => {
        const mimic = spawnMimic(dim, loc);
        try {
          mimic?.triggerEvent("relics:awake_mimic");
          
        } catch {
        }
        ev.player?.sendMessage("\u00A7cA mimic lunges out of the chest!");
      });
      return;
    }

    if (!SUSPICIOUS.includes(brokenId)) return;
    onSuspiciousBrush(ev);
  });

  world.afterEvents.entityHurt.subscribe((ev) => {
    handleMimicAttack(ev.hurtEntity, ev.damageSource?.damagingEntity);
  });

  world.afterEvents.entityDie.subscribe(onEntityDie);
}
