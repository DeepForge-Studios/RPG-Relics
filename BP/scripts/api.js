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

function sanitizeDef(raw) {
  if (!raw || typeof raw !== "object") return undefined;
  const id = typeof raw.id === "string" ? raw.id : undefined;
  if (!id || !id.includes(":")) return undefined;
  const slot = typeof raw.slot === "string" ? raw.slot : "trinket";
  if (!ALLOWED_SLOTS.has(slot)) return undefined;

  const def = {
    slot,
    displayName: typeof raw.displayName === "string" ? raw.displayName : id.split(":")[1],
    external: true,
  };

  if (raw.tier === "common" || raw.tier === "uncommon" || raw.tier === "rare") {
    def.tier = raw.tier;
  }
  if (raw.passive && typeof raw.passive === "object" && raw.passive.effect) {
    def.passive = {
      effect: String(raw.passive.effect),
      amplifier: Number(raw.passive.amplifier) || 0,
    };
  }
  if (typeof raw.custom === "string") def.custom = raw.custom;
  if (raw.onHurt && typeof raw.onHurt === "object") def.onHurt = raw.onHurt;
  if (raw.onAttack && typeof raw.onAttack === "object") def.onAttack = raw.onAttack;
  if (raw.onKill && typeof raw.onKill === "object") def.onKill = raw.onKill;
  if (typeof raw.oreChance === "number") def.oreChance = raw.oreChance;
  if (typeof raw.magnetRadius === "number") def.magnetRadius = raw.magnetRadius;
  if (typeof raw.dodgeChance === "number") def.dodgeChance = raw.dodgeChance;
  if (typeof raw.revealRadius === "number") def.revealRadius = raw.revealRadius;
  if (typeof raw.potionBonus === "number") def.potionBonus = raw.potionBonus;
  if (typeof raw.repelRadius === "number") def.repelRadius = raw.repelRadius;
  if (typeof raw.executeThreshold === "number") def.executeThreshold = raw.executeThreshold;
  if (typeof raw.executeBonus === "number") def.executeBonus = raw.executeBonus;
  if (typeof raw.shardDamage === "number") def.shardDamage = raw.shardDamage;
  if (typeof raw.shardRadius === "number") def.shardRadius = raw.shardRadius;

  return { id, def };
}

export function registerTrinket(raw) {
  const parsed = sanitizeDef(raw);
  if (!parsed) return { ok: false, error: "invalid_trinket_definition" };
  EXTERNAL_REGISTRY[parsed.id] = parsed.def;
  return { ok: true, id: parsed.id };
}

export function unregisterTrinket(id) {
  if (!id || !EXTERNAL_REGISTRY[id]) return { ok: false, error: "not_found" };
  delete EXTERNAL_REGISTRY[id];
  return { ok: true, id };
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
      payload = JSON.parse(ev.message || "{}");
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
