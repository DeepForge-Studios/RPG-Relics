import { world, system, ItemStack } from "@minecraft/server";
import {
  tickPassiveRelics,
  tickMagnet,
  tickMovementRelics,
  tickTidewalkers,
  handlePlayerHurtBefore,
  handlePlayerHurtAfter,
  handlePlayerAttack,
  handlePlayerKill,
  handleOreBreak,
  handleEndlessRation,
  handlePotionDrink,
  markFishingUse,
  handleFishingItemSpawn,
  tickHeldItems,
  tickRelicHud,
  statusLines,
} from "./hooks.js";
import { isGuidebookOpen, openGuidebook, openBoostCodex } from "./guidebook.js";
import { isAttunementOpen, openAttunement, clearAttunementForms } from "./attunement.js";
import { TEST_BUILD } from "./build_info.js";
import { refreshInventoryLore, syncCurioContainers, makeRelicStack } from "./relics.js";
import { clearCurioTitleLeak } from "./ui_sync.js";
import { registerReliquary, spawnReliquary, scrubOrphanReliquaries, RELIQUARY_ITEM } from "./reliquary.js";
import {
  registerAcquisition,
  handleCampCommand,
  handleTowerCommand,
  startRelicSense,
  tickRelicSense,
  tickTowerDefenders,
} from "./acquisition.js";
import { openRelicForge } from "./relic_forge.js";
import { openTestBench } from "./test_bench.js";
import { handleApiScriptEvent } from "./api.js";
import { handleMaterialBlockDrop, handleMaterialMobDrop } from "./materials.js";
import {
  handleAttuneItemSpawn,
  handleAttuneFoodUse,
  handleAttuneButton,
  tickAttunementRuntime,
  clearAttunementRuntime,
} from "./attune_runtime.js";

const MENU = "relics:menu";
const GUIDE = "relics:relic_guidebook";
const ATTUNE_TOME = "relics:attunement_tome";
const RATION = "relics:endless_ration";
const GOT_GUIDE_PROP = "relics:got_guidebook";
const GOT_RELIQUARY_PROP = "relics:got_reliquary";
const GOT_ATTUNE_TOME_PROP = "relics:got_attunement_tome";
const GOT_STARTER_GEAR_PROP = "relics:got_starter_gear";

/** Starter relics + materials (once per player). */
const STARTER_GEAR = [
  { id: "relics:lumen_visor", count: 1 },
  { id: "relics:vital_band", count: 1 },
  { id: "relics:relic_shard", count: 5 },
  { id: "relics:arcane_dust", count: 4 },
  { id: "relics:beast_fang", count: 2 },
  { id: "relics:monster_heart", count: 1 },
  { id: "relics:mystic_herb", count: 2 },
];

const USE_HANDLERS = {
  [MENU]: (player) => spawnReliquary(player),
  [GUIDE]: (player) => openGuidebook(player),
  [RELIQUARY_ITEM]: (player) => spawnReliquary(player),
  [ATTUNE_TOME]: (player) => openAttunement(player),
};

const useGuard = new Map();

function playerHasItem(player, typeId) {
  const inv = player.getComponent("minecraft:inventory")?.container;
  if (!inv) return false;
  for (let i = 0; i < inv.size; i++) {
    if (inv.getItem(i)?.typeId === typeId) return true;
  }
  return false;
}

function giveStarterItem(player, propertyId, itemId, message) {
  try {
    if (player.getDynamicProperty(propertyId)) return true;
  } catch {
    return false;
  }
  if (playerHasItem(player, itemId)) {
    try {
      player.setDynamicProperty(propertyId, true);
    } catch {
    }
    return true;
  }
  try {
    const leftover = player
      .getComponent("minecraft:inventory")
      ?.container?.addItem(new ItemStack(itemId, 1));
    if (leftover) player.dimension.spawnItem(leftover, player.location);
    player.setDynamicProperty(propertyId, true);
    player.sendMessage(message);
    return true;
  } catch {
    return false;
  }
}

function giveOrDropStack(player, typeId, count = 1) {
  try {
    const stack = typeId.startsWith("relics:") && count === 1
      ? makeRelicStack(typeId)
      : new ItemStack(typeId, count);
    const leftover = player
      .getComponent("minecraft:inventory")
      ?.container?.addItem(stack);
    if (leftover) player.dimension.spawnItem(leftover, player.location);
  } catch {
  }
}

function giveStarterGear(player) {
  try {
    if (player.getDynamicProperty(GOT_STARTER_GEAR_PROP)) return;
  } catch {
    return;
  }
  for (const { id, count } of STARTER_GEAR) {
    giveOrDropStack(player, id, count);
  }
  try {
    player.setDynamicProperty(GOT_STARTER_GEAR_PROP, true);
  } catch {
  }
  try {
    player.sendMessage(
      "§7Starter kit: §eNightwatch Goggles§7 + §eHeartward Ring§7, plus shards & craft materials. Equip them in the Reliquary!"
    );
  } catch {
  }
}

function giveStarterKit(player) {
  giveStarterItem(
    player,
    GOT_GUIDE_PROP,
    GUIDE,
    "§7You received a §eRelic Tome§r. Use it anytime — or craft another with §ebook + gold nugget§r."
  );
  giveStarterItem(
    player,
    GOT_RELIQUARY_PROP,
    RELIQUARY_ITEM,
    "§7You received a §eRelic Crate§r. Use it to open your Reliquary."
  );
  giveStarterItem(
    player,
    GOT_ATTUNE_TOME_PROP,
    ATTUNE_TOME,
    "§7You received an §dAttunement Forge§r. Use it to attune your relics."
  );
  giveStarterGear(player);
}

function safeSubscribe(eventSignal, handler, label) {
  if (!eventSignal || typeof eventSignal.subscribe !== "function") {
    console.warn(`[RPG Relics] Skip ${label} (not on this Minecraft build)`);
    return;
  }
  eventSignal.subscribe(handler);
}

function handleUsableItem(player, itemId) {
  const handler = USE_HANDLERS[itemId];
  if (!handler || !player) return;

  const key = `${player.id}:${itemId}`;
  const tick = system.currentTick;
  const lastUse = useGuard.get(key) ?? -100;
  if (tick - lastUse < 10) return;
  useGuard.set(key, tick);

  // Defer Guide open so item-use settles; longer delay reduces hitch + weird look while looking around.
  const delay = itemId === GUIDE ? 8 : 1;
  if (itemId === GUIDE) {
    try {
      clearCurioTitleLeak(player);
    } catch {
    }
  }
  system.runTimeout(() => handler(player), delay);
}

safeSubscribe(
  world.afterEvents?.itemUse,
  (ev) => {
    handleUsableItem(ev.source, ev.itemStack?.typeId);
    markFishingUse(ev.source, ev.itemStack);
  },
  "itemUse"
);

function openAttunementForge(player) {
  if (!player || player.typeId !== "minecraft:player") return;
  const key = `${player.id}:forge_block`;
  const tick = system.currentTick;
  if (tick - (useGuard.get(key) ?? -100) < 10) return;
  useGuard.set(key, tick);
  // Scripted forms can open directly; native/container screens cannot.
  system.run(() => openAttunement(player));
}

// Held-item fallback; empty-hand taps use the block custom component below.
safeSubscribe(
  world.afterEvents?.playerInteractWithBlock,
  (ev) => {
    if (ev.isFirstEvent === false) return;
    if (ev.block?.typeId !== "relics:attunement_forge") return;
    openAttunementForge(ev.player);
  },
  "playerInteractWithBlock(attunement_forge)"
);

safeSubscribe(
  world.afterEvents?.itemCompleteUse,
  (ev) => {
    handlePotionDrink(ev.source, ev.itemStack);
    handleAttuneFoodUse(ev.source, ev.itemStack);
    if (ev.itemStack?.typeId === RATION) {
      handleEndlessRation(ev.source);
    }
  },
  "itemCompleteUse"
);

safeSubscribe(
  world.afterEvents?.entitySpawn,
  (ev) => {
    handleFishingItemSpawn(ev.entity);
    handleAttuneItemSpawn(ev.entity);
  },
  "entitySpawn"
);

if (system.beforeEvents?.startup?.subscribe) {
  system.beforeEvents.startup.subscribe((ev) => {
    try {
      ev.itemComponentRegistry.registerCustomComponent("relics:on_use", {
        onUse(e) {
          const player = e.source;
          if (!player || player.typeId !== "minecraft:player") return;
          handleUsableItem(player, e.itemStack?.typeId);
        },
      });
    } catch (err) {
      console.warn(`[RPG Relics] item custom component register failed: ${err}`);
    }
    try {
      ev.blockComponentRegistry.registerCustomComponent("relics:forge_interact", {
        onPlayerInteract(e) {
          openAttunementForge(e.player);
        },
      });
    } catch (err) {
      console.warn(`[RPG Relics] forge block component register failed: ${err}`);
    }
  });
}

safeSubscribe(
  system.afterEvents?.scriptEventReceive,
  (ev) => {
    if (handleApiScriptEvent(ev)) return;
    if (ev.id === "relics:open_menu" && ev.sourceEntity?.typeId === "minecraft:player") {
      spawnReliquary(ev.sourceEntity);
    } else if (ev.id === "relics:open_guide" && ev.sourceEntity?.typeId === "minecraft:player") {
      openGuidebook(ev.sourceEntity);
    } else if (ev.id === "relics:camp" && ev.sourceEntity?.typeId === "minecraft:player") {
      handleCampCommand(ev.sourceEntity, false);
    } else if (ev.id === "relics:camp_tp" && ev.sourceEntity?.typeId === "minecraft:player") {
      handleCampCommand(ev.sourceEntity, true);
    } else if (ev.id === "relics:tower" && ev.sourceEntity?.typeId === "minecraft:player") {
      handleTowerCommand(ev.sourceEntity, false);
    } else if (ev.id === "relics:tower_tp" && ev.sourceEntity?.typeId === "minecraft:player") {
      handleTowerCommand(ev.sourceEntity, true);
    } else if (ev.id === "relics:sense" && ev.sourceEntity?.typeId === "minecraft:player") {
      startRelicSense(ev.sourceEntity);
    } else if (ev.id === "relics:status" && ev.sourceEntity?.typeId === "minecraft:player") {
      for (const line of statusLines(ev.sourceEntity)) ev.sourceEntity.sendMessage(line);
    } else if (ev.id === "relics:boosts" && ev.sourceEntity?.typeId === "minecraft:player") {
      openBoostCodex(ev.sourceEntity);
    } else if (ev.id === "relics:attune" && ev.sourceEntity?.typeId === "minecraft:player") {
      openAttunement(ev.sourceEntity);
    } else if (ev.id === "relics:open_forge" && ev.sourceEntity?.typeId === "minecraft:player") {
      openRelicForge(ev.sourceEntity);
    } else if (ev.id === "relics:test" && ev.sourceEntity?.typeId === "minecraft:player") {
      openTestBench(ev.sourceEntity);
    } else if (ev.id.startsWith("relics:open_slot_") && ev.sourceEntity?.typeId === "minecraft:player") {
      spawnReliquary(ev.sourceEntity);
    }
  },
  "scriptEventReceive"
);

safeSubscribe(
  world.afterEvents?.playerButtonInput,
  (ev) => {
    handleAttuneButton(ev.player, String(ev.button ?? ""), String(ev.newButtonState ?? ""));
  },
  "playerButtonInput(attunement)"
);

safeSubscribe(
  world.beforeEvents?.playerLeave,
  (ev) => {
    if (ev.playerId) clearAttunementRuntime(ev.playerId);
    else if (ev.player?.id) clearAttunementRuntime(ev.player.id);
    if (ev.player) clearAttunementForms(ev.player);
  },
  "playerLeave(attunement)"
);

safeSubscribe(
  world.beforeEvents?.entityHurt,
  (ev) => {
    if (ev.hurtEntity.typeId !== "minecraft:player") return;
    if (handlePlayerHurtBefore(ev.hurtEntity, ev.damageSource, ev.damage).cancel) {
      ev.cancel = true;
    }
  },
  "entityHurt.before"
);

safeSubscribe(
  world.afterEvents?.entityHurt,
  (ev) => {
    if (ev.hurtEntity.typeId === "minecraft:player") {
      handlePlayerHurtAfter(ev.hurtEntity, ev.damageSource, ev.damage);
    }
    let damager = ev.damageSource.damagingEntity;
    if (damager?.typeId !== "minecraft:player") {
      const proj = ev.damageSource.damagingProjectile;
      try {
        const owner = proj?.getComponent?.("minecraft:projectile")?.owner;
        if (owner?.typeId === "minecraft:player") damager = owner;
      } catch {
      }
    }
    if (damager?.typeId === "minecraft:player") {
      handlePlayerAttack(damager, ev.hurtEntity, ev.damage, {
        isProjectile: !!ev.damageSource.damagingProjectile,
      });
    }
  },
  "entityHurt.after"
);

safeSubscribe(
  world.afterEvents?.entityDie,
  (ev) => {
    let killer = ev.damageSource.damagingEntity;
    if (killer?.typeId !== "minecraft:player") {
      try {
        const owner = ev.damageSource.damagingProjectile
          ?.getComponent?.("minecraft:projectile")
          ?.owner;
        if (owner?.typeId === "minecraft:player") killer = owner;
      } catch {
      }
    }
    handleMaterialMobDrop(ev.deadEntity, killer);
    if (killer?.typeId === "minecraft:player") {
      handlePlayerKill(killer, ev.deadEntity);
    }
  },
  "entityDie"
);

safeSubscribe(
  world.afterEvents?.playerBreakBlock,
  (ev) => {
    const id = ev.brokenBlockPermutation?.type?.id ?? ev.brokenBlockPermutation?.type?.typeId;
    const blockId =
      id ??
      ev.brokenBlockPermutation?.typeId ??
      ev.block?.typeId;
    if (!blockId) return;
    handleOreBreak(ev.player, blockId, ev.block?.location ?? ev.player.location);
    handleMaterialBlockDrop(ev.player, blockId, ev.block?.location ?? ev.player.location);
  },
  "playerBreakBlock"
);

safeSubscribe(
  world.afterEvents?.playerSpawn,
  (ev) => {
    system.runTimeout(() => {
      scrubOrphanReliquaries();
      syncCurioContainers(ev.player);
      clearCurioTitleLeak(ev.player);
      refreshInventoryLore(ev.player);
      if (ev.initialSpawn) giveStarterKit(ev.player);
    }, 20);
    system.runTimeout(() => clearCurioTitleLeak(ev.player), 40);
  },
  "playerSpawn"
);

system.runTimeout(() => {
  scrubOrphanReliquaries();
  for (const player of world.getAllPlayers()) {
    syncCurioContainers(player);
  }
}, 40);

function isModalUiOpen(player) {
  return isGuidebookOpen(player) || isAttunementOpen(player);
}

system.runInterval(() => {
  tickAttunementRuntime();
}, 5);

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    tickPassiveRelics(player);
    tickHeldItems(player);
  }
}, 20);

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    if (isModalUiOpen(player)) continue;
    tickTidewalkers(player);
    tickMovementRelics(player);
  }
}, 1);

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    if (isModalUiOpen(player)) continue;
    tickMagnet(player);
  }
}, 2);

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    if (isModalUiOpen(player)) continue;
    refreshInventoryLore(player);
  }
}, 40);

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    tickRelicHud(player);
    tickRelicSense(player);
    tickTowerDefenders(player);
  }
}, 30);

registerReliquary();
registerAcquisition();

console.warn(
  `[RPG Relics] Ready (${TEST_BUILD}) — Reliquary / Guidebook`
);
