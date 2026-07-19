const SENSE_PROP = "relics:setting_sense";
const BOOSTS_PROP = "relics:setting_boosts";
const NOTIFICATIONS_PROP = "relics:setting_notifications";

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
