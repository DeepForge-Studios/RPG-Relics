import { world, system, BlockPermutation, BlockVolume } from "@minecraft/server";
import { pickRelicId } from "./loot_pools.js";
import { makeRelicStack, stampContainerRelics } from "./relics.js";
import {
  getMimicIdForLocation,
  handleMimicAttack,
  isMimicType,
} from "./mimics.js";
import { isRelicSenseEnabled } from "./settings.js";

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
    anchor: [15, 14, 14, "minecraft:shroomlight"],
    chests: [
      [14, 24, 15],
      [14, 28, 15],
      [14, 36, 15],
    ],
    defenders: [
      ["minecraft:pillager", 15.5, 5, 15.5],
      ["minecraft:pillager", 13.5, 13, 15.5],
      ["minecraft:pillager", 17.5, 21, 15.5],
      ["minecraft:pillager", 15.5, 13, 15.5],
      ["minecraft:pillager", 15.5, 25, 15.5],
      ["minecraft:pillager", 15.5, 33, 15.5],
      ["minecraft:pillager", 16.5, 45, 15.5],
    ],
    mimics: [
      ["relics:mimic", 14.5, 21, 15.5],
      ["relics:mimic", 16.5, 29, 15.5],
      ["relics:mimic", 15.5, 45, 15.5],
    ],
  },
  home: {
    anchor: [10, 1, 11, "minecraft:brown_wool"],
    chests: [
      [15, 19, 7],
      [8, 19, 15],
      [6, 20, 7],
    ],
    defenders: [
      ["minecraft:pillager", 10.5, 2, 11.5],
      ["minecraft:pillager", 13.5, 2, 11.5],
      ["minecraft:witch", 10.5, 3, 14.5],
      ["minecraft:witch", 13.5, 3, 14.5],
      ["minecraft:pillager", 11.5, 11, 10.5],
      ["minecraft:witch", 11.5, 19, 10.5],
      ["minecraft:pillager", 11.5, 33, 10.5],
      ["minecraft:witch", 12.5, 35, 10.5],
    ],
    mimics: [
      ["relics:mimic", 9.5, 2, 12.5],
      ["relics:mimic", 11.5, 33, 10.5],
      ["relics:mimic", 12.5, 19, 10.5],
    ],
  },
};

const openedChests = new Set();
const awakeningMimics = new Set();
const relicSenseTargets = new Map();
const activatedDefenderSites = new Set();
/** Player-placed chests/barrels — never ambush / never stir structure defenders. */
const playerPlacedContainers = new Set();
const DEFENDER_PROP = "relics:tower_defenders_v4";
let defendersLoaded = false;

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
  const preferred = {
    x: nearLocation.x + 0.5,
    y: nearLocation.y,
    z: nearLocation.z + 0.5,
  };
  const open =
    findOpenSpawn(dimension, preferred.x, preferred.y, preferred.z) ?? preferred;
  if (!isAirSpawnCell(dimension, open.x, open.y, open.z)) {
    // Last resort: one block above the chest so they don't suffocate in dirt.
    open.y = Math.floor(nearLocation.y) + 1;
  }
  const typeId = getMimicIdForLocation(dimension, open);
  try {
    return dimension.spawnEntity(typeId, open);
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

  if (deep && Math.random() < (camp ? 0.22 : 0.18)) {
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
          "relics:dummy_chest",
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
    const kind = classifySurfaceSite(block);
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

function classifySurfaceSite(block) {
  if (block.location.y <= 32) return undefined;
  const dim = block.dimension;
  const { x, y, z } = block.location;
  let towerScore = 0;
  let homeScore = 0;
  // House loot chests sit near the roof ? scan far downward.
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
  const mimic = block.typeId === "relics:dummy_chest";
  if (homeScore >= 6 && homeScore >= towerScore) return mimic ? "home_mimic" : "home";
  if (towerScore >= 6) return mimic ? "tower_mimic" : "tower";
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

function spawnAt(dim, typeId, x, y, z) {
  let sx = x;
  let sy = y;
  let sz = z;
  if (!isAirSpawnCell(dim, sx, sy, sz)) {
    const open = findOpenSpawn(dim, sx, sy, sz);
    if (!open) return undefined;
    sx = open.x;
    sy = open.y;
    sz = open.z;
  }
  if (!isAirSpawnCell(dim, sx, sy, sz)) return undefined;
  try {
    return dim.spawnEntity(typeId, { x: sx, y: sy, z: sz });
  } catch (err) {
    console.warn(`[RPG Relics] spawn ${typeId} failed: ${err}`);
    return undefined;
  }
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

function resolveStructureOrigin(dimension, kind, chestX, chestY, chestZ) {
  const layoutName = kind.startsWith("home") ? "home" : "tower";
  const layout = STRUCTURE_LAYOUTS[layoutName];
  if (!layout) return undefined;
  const [anchorX, anchorY, anchorZ, anchorType] = layout.anchor;
  for (const [localX, localY, localZ] of layout.chests) {
    const origin = {
      x: Math.floor(chestX - localX),
      y: Math.floor(chestY - localY),
      z: Math.floor(chestZ - localZ),
    };
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
  }
  return undefined;
}

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
    kind = classifySurfaceSite(block);
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
  const key = resolved
    ? siteKey(resolved.origin.x, resolved.origin.y, resolved.origin.z)
    : siteKey(x, y, z);
  if (activatedDefenderSites.has(key)) return false;

  // Skip if defenders already nearby (reload / second player).
  try {
    const nearby = dimension.getEntities({
      location: { x: x + 0.5, y: Math.max(1, y - 12), z: z + 0.5 },
      maxDistance: 28,
      excludeTypes: ["minecraft:player", "minecraft:item"],
    });
    const hostiles = nearby.filter(
      (e) =>
        e.typeId === "minecraft:pillager" ||
        e.typeId === "minecraft:witch" ||
        e.typeId === "relics:mimic" ||
        e.typeId?.startsWith?.("relics:mimic")
    );
    if (hostiles.length >= 6) {
      activatedDefenderSites.add(key);
      saveActivatedDefenders();
      return false;
    }
  } catch {
  }

  let roster;
  if (resolved) {
    roster = resolved.layout.defenders.map(([typeId, lx, ly, lz]) => [
      typeId,
      resolved.origin.x + lx,
      resolved.origin.y + ly,
      resolved.origin.z + lz,
    ]);
    if (kind.endsWith("_mimic")) {
      roster.push(
        ...resolved.layout.mimics.map(([typeId, lx, ly, lz]) => [
          typeId,
          resolved.origin.x + lx,
          resolved.origin.y + ly,
          resolved.origin.z + lz,
        ])
      );
    }
  } else {
    const cx = x + 0.5;
    const cz = z + 0.5;
    const lowerSpot = findOpenSpawn(dimension, cx, y - 8, cz);
    const upperSpot = findOpenSpawn(dimension, cx, y - 2, cz) ?? lowerSpot;
    if (!lowerSpot) return false;
    roster =
      kind === "home" || kind === "home_mimic"
        ? [
            ["minecraft:witch", lowerSpot.x - 1.5, lowerSpot.y, lowerSpot.z],
            ["minecraft:witch", upperSpot.x + 1.5, upperSpot.y, upperSpot.z - 1],
            ["minecraft:pillager", lowerSpot.x + 2, lowerSpot.y, lowerSpot.z + 1.5],
            ["minecraft:pillager", upperSpot.x - 1, upperSpot.y, upperSpot.z + 1],
          ]
        : [
            ["minecraft:pillager", lowerSpot.x, lowerSpot.y, lowerSpot.z + 2],
            ["minecraft:pillager", lowerSpot.x + 2, lowerSpot.y, lowerSpot.z - 1],
            ["minecraft:pillager", upperSpot.x - 1.5, upperSpot.y, upperSpot.z],
          ];
    if (kind.endsWith("_mimic")) {
      roster.push(
        ["relics:mimic", lowerSpot.x - 2.5, lowerSpot.y, lowerSpot.z],
        ["relics:mimic", upperSpot.x + 2, upperSpot.y, upperSpot.z - 2]
      );
    }
  }

  let spawned = 0;
  for (const [typeId, sx, sy, sz] of roster) {
    if (spawnAt(dimension, typeId, sx, sy, sz)) spawned++;
  }
  if (spawned <= 0) return false;

  activatedDefenderSites.add(key);
  saveActivatedDefenders();
  return true;
}

export function tickTowerDefenders(player) {
  const hit = findNearestTower(player, 72);
  if (!hit) return;
  ensureTowerDefenders({ ...hit, dimension: player.dimension });
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
    if (ensureTowerDefenders({ ...hit, dimension: player.dimension })) {
      player.sendMessage("\u00A77Defenders stir inside the structure\u2026");
    }
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
    if (ev.block.location.y > 32) {
      system.run(() => {
        const kind = classifySurfaceSite(ev.block);
        if (!kind) return;
        if (ensureTowerDefenders({ ...ev.block.location, kind, dimension: ev.block.dimension, typeId: ev.block.typeId })) {
          ev.player.sendMessage("\u00A77Defenders stir inside the structure\u2026");
        }
      });
    }
    onChestOpen(ev.block, ev.player);
  });

  world.afterEvents.playerBreakBlock.subscribe((ev) => {
    try {
      playerPlacedContainers.delete(blockKey(ev.block));
    } catch {
    }
    const brokenId = ev.brokenBlockPermutation?.type?.id;
    if (brokenId === "relics:dummy_chest") {
      if (awakeningMimics.has(blockKey(ev.block))) return;
      const dim = ev.player?.dimension ?? ev.block.dimension;
      system.run(() => {
        spawnMimic(dim, ev.block.location);
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
