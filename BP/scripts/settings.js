const SENSE_PROP = "relics:setting_sense";
const BOOSTS_PROP = "relics:setting_boosts";
const NOTIFICATIONS_PROP = "relics:setting_notifications";
const ATTUNEMENT_PROP = "relics:setting_attunement";
const BALANCE_PROP = "relics:setting_balance";

export const BALANCE_STANDARD = "standard";
export const BALANCE_OP = "op";

function readSetting(player, propertyId) {
  try {
    const value = player.getDynamicProperty(propertyId);
    return value === undefined ? true : value === true;
  } catch {
    return true;
  }
}

function writeSetting(player, propertyId, enabled) {
  try {
    player.setDynamicProperty(propertyId, enabled);
  } catch {
  }
  return enabled;
}

export function isRelicSenseEnabled(player) {
  return readSetting(player, SENSE_PROP);
}

export function areBoostsEnabled(player) {
  return readSetting(player, BOOSTS_PROP);
}

export function areEffectNotificationsEnabled(player) {
  return readSetting(player, NOTIFICATIONS_PROP);
}

/** When false, Codex / Forge / skills / focus-material drops are off (relics-only). */
export function isAttunementEnabled(player) {
  return readSetting(player, ATTUNEMENT_PROP);
}

/**
 * Balance mode: Standard (normal cooldowns) or OP (no relic-related cooldowns).
 * @returns {"standard"|"op"}
 */
export function getBalanceMode(player) {
  try {
    const value = player.getDynamicProperty(BALANCE_PROP);
    return value === BALANCE_OP ? BALANCE_OP : BALANCE_STANDARD;
  } catch {
    return BALANCE_STANDARD;
  }
}

/** False in OP mode — relic / boost / attune cooldowns should not apply. */
export function areCooldownsEnabled(player) {
  return getBalanceMode(player) === BALANCE_STANDARD;
}

export function toggleRelicSense(player) {
  return writeSetting(player, SENSE_PROP, !isRelicSenseEnabled(player));
}

export function toggleBoosts(player) {
  return writeSetting(player, BOOSTS_PROP, !areBoostsEnabled(player));
}

export function toggleEffectNotifications(player) {
  return writeSetting(
    player,
    NOTIFICATIONS_PROP,
    !areEffectNotificationsEnabled(player)
  );
}

export function toggleAttunement(player) {
  return writeSetting(player, ATTUNEMENT_PROP, !isAttunementEnabled(player));
}

/** Flip Standard ↔ OP. Returns the new mode. */
export function cycleBalanceMode(player) {
  const next =
    getBalanceMode(player) === BALANCE_OP ? BALANCE_STANDARD : BALANCE_OP;
  try {
    player.setDynamicProperty(BALANCE_PROP, next);
  } catch {
  }
  return next;
}
