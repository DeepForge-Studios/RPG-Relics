import { system, world } from "@minecraft/server";

const TRINKETS = [
  {
    id: "example_trinkets:ruby_ring",
    slot: "ring",
    displayName: "Ruby Ring",
    tier: "rare",
    passive: { effect: "strength", amplifier: 0 },
  },
  {
    id: "example_trinkets:lucky_coin",
    slot: "trinket",
    displayName: "Lucky Coin",
    tier: "uncommon",
    passive: { effect: "haste", amplifier: 0 },
  },
];

function registerAll() {
  for (const def of TRINKETS) {
    system.sendScriptEvent("relics:register", JSON.stringify(def));
  }
}

system.runTimeout(() => registerAll(), 40);

world.afterEvents.playerSpawn.subscribe((ev) => {
  if (!ev.initialSpawn) return;
  system.runTimeout(() => registerAll(), 20);
});

console.warn("[Example Trinkets] Loaded — registers items with RPG Relics on join.");
