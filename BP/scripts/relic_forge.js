export const RELIC_FORGE = "relics:relic_forge";

export function openRelicForge(player) {
  player.sendMessage(
    "§6Relic Forge§r uses the real crafting-table UI.\n§7Place §erelics:relic_forge§7 and open it to craft Relic recipes only."
  );
  player.sendMessage("§8/give @s relics:relic_forge");
}
