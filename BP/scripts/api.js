/**
 * Optional cross-pack trinket registration via scriptevent.
 * Only other add-on scripts / ops should call this — never trust raw chat.
 *
 * Hardening: whitelist slots, clamp numbers, reject oversized / odd strings,
 * and only allow known vanilla effect ids for passives.
 */
const EXTERNAL_REGISTRY = Object.create(null);

const ALLOWED_SLOTS = new Set([
  "face",
  "head",
  "necklace",
  "ring",
  "charm",
  "back",
  "body",
  "belt",
  "hands",
  "feet",
  "any",
  "trinket",
]);

const ALLOWED_PASSIVE_EFFECTS = new Set([
  "speed",
  "slowness",
  "haste",
  "mining_fatigue",
  "strength",
  "jump_boost",
  "nausea",
  "regeneration",
  "resistance",
  "fire_resistance",
  "water_breathing",
  "invisibility",
  "blindness",
  "night_vision",
  "hunger",
  "weakness",
  "poison",
  "wither",
  "health_boost",
  "absorption",
  "saturation",
  "levitation",
  "slow_falling",
  "conduit_power",
  "bad_omen",
  "hero_of_the_village",
  "darkness",
]);

const MAX_ID_LEN = 64;
const MAX_NAME_LEN = 48;
const MAX_CUSTOM_LEN = 32;
const MAX_REGISTRY = 64;

function cleanId(id) {
  if (typeof id !== "string") return undefined;
  const t = id.trim();
  if (t.length < 3 || t.length > MAX_ID_LEN) return undefined;
  if (!/^[a-z0-9_]+:[a-z0-9_./-]+$/i.test(t)) return undefined;
  return t;
}

function cleanShortString(value, max) {
  if (typeof value !== "string") return undefined;
  const t = value.trim().replace(/[\u0000-\u001f\u007f]/g, "");
  if (!t || t.length > max) return undefined;
  return t;
}

function clampNum(n, min, max) {
  const v = Number(n);
  if (!Number.isFinite(v)) return undefined;
  return Math.min(max, Math.max(min, v));
}

function sanitizeDef(raw) {
  if (!raw || typeof raw !== "object") return undefined;
  const id = cleanId(raw.id);
  if (!id) return undefined;
  const slot = typeof raw.slot === "string" ? raw.slot : "trinket";
  if (!ALLOWED_SLOTS.has(slot)) return undefined;

  const def = {
    slot,
    displayName: cleanShortString(raw.displayName, MAX_NAME_LEN) || id.split(":")[1],
    external: true,
  };

  if (raw.tier === "common" || raw.tier === "uncommon" || raw.tier === "rare") {
    def.tier = raw.tier;
  }
  if (raw.passive && typeof raw.passive === "object" && raw.passive.effect) {
    const effect = String(raw.passive.effect)
      .toLowerCase()
      .replace(/^minecraft:/, "");
    if (!ALLOWED_PASSIVE_EFFECTS.has(effect)) return undefined;
    def.passive = {
      effect,
      amplifier: clampNum(raw.passive.amplifier, 0, 4) ?? 0,
    };
  }
  const custom = cleanShortString(raw.custom, MAX_CUSTOM_LEN);
  if (custom) def.custom = custom;

  // Hook blobs are accepted only as plain objects with numeric fields we already use.
  // We do not eval or run arbitrary code from them.
  if (raw.onHurt && typeof raw.onHurt === "object") def.onHurt = sanitizeHook(raw.onHurt);
  if (raw.onAttack && typeof raw.onAttack === "object") def.onAttack = sanitizeHook(raw.onAttack);
  if (raw.onKill && typeof raw.onKill === "object") def.onKill = sanitizeHook(raw.onKill);

  const oreChance = clampNum(raw.oreChance, 0, 1);
  if (oreChance !== undefined) def.oreChance = oreChance;
  const magnetRadius = clampNum(raw.magnetRadius, 0, 16);
  if (magnetRadius !== undefined) def.magnetRadius = magnetRadius;
  const dodgeChance = clampNum(raw.dodgeChance, 0, 0.75);
  if (dodgeChance !== undefined) def.dodgeChance = dodgeChance;
  const revealRadius = clampNum(raw.revealRadius, 0, 32);
  if (revealRadius !== undefined) def.revealRadius = revealRadius;
  const potionBonus = clampNum(raw.potionBonus, 0, 2);
  if (potionBonus !== undefined) def.potionBonus = potionBonus;
  const repelRadius = clampNum(raw.repelRadius, 0, 16);
  if (repelRadius !== undefined) def.repelRadius = repelRadius;
  const executeThreshold = clampNum(raw.executeThreshold, 0, 20);
  if (executeThreshold !== undefined) def.executeThreshold = executeThreshold;
  const executeBonus = clampNum(raw.executeBonus, 0, 20);
  if (executeBonus !== undefined) def.executeBonus = executeBonus;
  const shardDamage = clampNum(raw.shardDamage, 0, 20);
  if (shardDamage !== undefined) def.shardDamage = shardDamage;
  const shardRadius = clampNum(raw.shardRadius, 0, 12);
  if (shardRadius !== undefined) def.shardRadius = shardRadius;

  return { id, def };
}

function sanitizeHook(hook) {
  const out = {};
  for (const [k, v] of Object.entries(hook)) {
    if (typeof k !== "string" || k.length > 32) continue;
    if (!/^[a-zA-Z0-9_]+$/.test(k)) continue;
    if (typeof v === "number" && Number.isFinite(v)) {
      out[k] = clampNum(v, -100, 100);
    } else if (typeof v === "boolean") {
      out[k] = v;
    } else if (typeof v === "string") {
      const s = cleanShortString(v, 24);
      if (s) out[k] = s;
    }
  }
  return out;
}

export function registerTrinket(raw) {
  if (Object.keys(EXTERNAL_REGISTRY).length >= MAX_REGISTRY) {
    return { ok: false, error: "registry_full" };
  }
  const parsed = sanitizeDef(raw);
  if (!parsed) return { ok: false, error: "invalid_trinket_definition" };
  EXTERNAL_REGISTRY[parsed.id] = parsed.def;
  return { ok: true, id: parsed.id };
}

export function unregisterTrinket(id) {
  const clean = cleanId(id);
  if (!clean || !EXTERNAL_REGISTRY[clean]) return { ok: false, error: "not_found" };
  delete EXTERNAL_REGISTRY[clean];
  return { ok: true, id: clean };
}

export function getExternalRelicDef(itemId) {
  return EXTERNAL_REGISTRY[itemId];
}

export function listExternalTrinkets() {
  return Object.keys(EXTERNAL_REGISTRY);
}

export function handleApiScriptEvent(ev) {
  if (ev.id === "relics:register") {
    let payload;
    try {
      const msg = String(ev.message || "");
      if (msg.length > 2048) {
        console.warn("[RPG Relics] relics:register payload too large");
        return true;
      }
      payload = JSON.parse(msg || "{}");
    } catch {
      console.warn("[RPG Relics] relics:register needs JSON message");
      return true;
    }
    const result = registerTrinket(payload);
    if (result.ok) {
      console.warn(`[RPG Relics] registered trinket ${result.id}`);
    } else {
      console.warn(`[RPG Relics] register failed: ${result.error}`);
    }
    return true;
  }

  if (ev.id === "relics:unregister") {
    const id = (ev.message || "").trim();
    const result = unregisterTrinket(id);
    if (result.ok) {
      console.warn(`[RPG Relics] unregistered trinket ${result.id}`);
    } else {
      console.warn(`[RPG Relics] unregister failed: ${result.error}`);
    }
    return true;
  }

  if (ev.id === "relics:list_external") {
    const ids = listExternalTrinkets();
    console.warn(`[RPG Relics] external trinkets (${ids.length}): ${ids.join(", ") || "(none)"}`);
    return true;
  }

  return false;
}
