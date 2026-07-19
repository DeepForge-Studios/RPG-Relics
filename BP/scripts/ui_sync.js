export function syncCurioUi(player) {
  clearCurioTitleLeak(player);
}

export function buildCurioSyncString(_player) {
  return "";
}

export function clearCurioTitleLeak(player) {
  if (!player) return;
  try {
    player.onScreenDisplay.setTitle("§r", {
      fadeInDuration: 0,
      stayDuration: 1,
      fadeOutDuration: 0,
    });
  } catch {
  }
  try {
    player.onScreenDisplay.updateSubtitle("§r");
  } catch {
  }
  try {
    player.runCommand("title @s clear");
  } catch {
  }
}
