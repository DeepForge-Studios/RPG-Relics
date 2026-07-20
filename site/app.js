const SLOT_LABELS = {
  face: "Face",
  head: "Head",
  necklace: "Necklace",
  ring: "Ring",
  charm: "Charm",
  back: "Back",
  body: "Body",
  belt: "Belt",
  hands: "Hands",
  feet: "Feet",
  any: "Any slot",
  held: "Held",
};

const SLOT_ORDER = [
  "face", "head", "necklace", "ring", "charm", "back", "body",
  "belt", "hands", "feet", "any", "held",
];

const TIER_ORDER = ["common", "uncommon", "rare", "epic", "legendary", "ascended"];
/** Boost preview tiers (3). */
const TIER_ROMAN = ["I", "II", "III"];
/** Skill ranks — attune skills use four ranks (I–IV). */
const RANK_ROMAN = ["I", "II", "III", "IV", "V"];

function rankLabel(index) {
  return RANK_ROMAN[index] || String(index + 1);
}

function tierRank(tier) {
  const i = TIER_ORDER.indexOf(String(tier || "").toLowerCase());
  return i === -1 ? TIER_ORDER.length : i;
}

/** Common → Uncommon → Rare → … → Ascended, then A–Z by name. */
function compareRelicsByRarity(a, b) {
  return (
    tierRank(a.tier) - tierRank(b.tier) ||
    (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" })
  );
}

const CHAPTERS = {
  "ch-1": "Chapter 1 · Start",
  "ch-2": "Chapter 2 · Find",
  "ch-3": "Chapter 3 · Equip",
  "ch-4": "Chapter 4 · Boosts",
  "ch-5": "Chapter 5 · Attune",
  "ch-6": "Chapter 6 · Relics",
  "ch-7": "Chapter 7 · Ascended",
  materials: "Codex · Materials",
  mimics: "Codex · Mimics",
};

const GROUP_COLORS = {
  might: "var(--might)",
  ward: "var(--ward)",
  gale: "var(--gale)",
  fortune: "var(--fortune)",
  vitality: "var(--vitality)",
  alchemy: "var(--alchemy)",
  necromancy: "var(--necromancy)",
  radiance: "var(--radiance)",
};

/** Fallback boosts when catalog.boosts is absent. */
const FALLBACK_BOOSTS = [
  {
    id: "might",
    name: "Might",
    color: "var(--might)",
    summary: "Stack hits to deal crushing echo damage.",
    tiers: [
      "Every 5 hits, +2 bonus damage",
      "Every 4 hits, +3 bonus damage",
      "Every 3 hits, +4 bonus damage",
    ],
  },
  {
    id: "ward",
    name: "Ward",
    color: "var(--ward)",
    summary: "Chance to deflect incoming attacks.",
    tiers: ["8% deflect", "14% deflect", "20% deflect"],
  },
  {
    id: "gale",
    name: "Gale",
    color: "var(--gale)",
    summary: "Sprinting grants short Tailwind speed bursts.",
    tiers: [
      "Speed burst while sprinting",
      "Stronger Tailwind",
      "Tailwind + Jump Boost",
    ],
  },
  {
    id: "fortune",
    name: "Fortune",
    color: "var(--fortune)",
    summary: "Chance for extra ore when mining.",
    tiers: ["6% bonus ore", "12% bonus ore", "20% bonus ore"],
  },
  {
    id: "vitality",
    name: "Vitality",
    color: "var(--vitality)",
    summary: "Kills restore health.",
    tiers: [
      "1 heart on kill",
      "2 hearts on kill",
      "3 hearts + brief Regeneration",
    ],
  },
  {
    id: "alchemy",
    name: "Alchemy",
    color: "var(--alchemy)",
    summary: "Drunk potions last longer.",
    tiers: ["+15% duration", "+30% duration", "+50% duration"],
  },
];

/** Thin placeholders until catalog.js ships materials / mimics / skills. */
const FALLBACK_MATERIALS = [
  {
    id: "relics:relic_shard",
    name: "Relic Dust",
    blurb: "Ritual fuel — spent at the Forge and in ascended crafts.",
    sources: "Mimics, relic chests, archaeology, hostile kills",
    icon: "textures/items/relic_shard.png",
  },
  {
    id: "relics:arcane_dust",
    name: "Arcane Gem",
    blurb: "Glowing focus for Gale, Alchemy, and Radiance — also used in many crafts.",
    sources: "Witches, endermen, evokers, shulkers",
    icon: "textures/items/arcane_dust.png",
  },
  {
    id: "relics:monster_heart",
    name: "Monster Heart",
    blurb: "Heavy focus for Might, Ward, Vitality, and Necromancy rituals.",
    sources: "Zombies, husks, drowned, brutes, ravagers, wardens",
    icon: "textures/items/monster_heart.png",
  },
  {
    id: "relics:beast_fang",
    name: "Beast Fang",
    blurb: "Sharp focus for Might, Gale, and Fortune rituals.",
    sources: "Spiders, hoglins, ravagers, wardens",
    icon: "textures/items/beast_fang.png",
  },
  {
    id: "relics:mystic_herb",
    name: "Mystic Herb",
    blurb: "Soft focus for Vitality and Alchemy — gathered from plants.",
    sources: "Grass, ferns, flowers, tower chests",
    icon: "textures/items/mystic_herb.png",
  },
  {
    id: "relics:silver_fragment",
    name: "Silver Fragment",
    blurb: "Bright focus for Ward, Fortune, and Radiance rituals.",
    sources: "Skeletons, strays, illagers, relic chests",
    icon: "textures/items/silver_fragment.png",
  },
  {
    id: "relics:crimson_crystal",
    name: "Crimson Crystal",
    blurb: "Dark focus for Necromancy rituals.",
    sources: "Creepers, blazes, magma cubes, wither skeletons",
    icon: "textures/items/crimson_crystal.png",
  },
];

const FALLBACK_MIMICS = [
  { id: "mimic_forest", name: "Forest Mimic", blurb: "A woodland chest that bites back. Hits apply poison and slowness.", where: "Forests, plains, meadows, and similar.", biome: "Forest", icon: "textures/entity/mimic_forest.png", media: "site/media/mimics/forest.png", loot: "Defeat for Relic Dust (~65%) and nearby structure relic loot." },
  { id: "mimic_desert", name: "Desert Mimic", blurb: "A sunbaked chest mimic. Hits drain you with hunger and weakness.", where: "Deserts, beaches, and warm oceans.", biome: "Desert", icon: "textures/entity/mimic_desert.png", media: "site/media/mimics/desert.png", loot: "Defeat for Relic Dust (~65%) and nearby structure relic loot." },
  { id: "mimic_jungle", name: "Jungle Mimic", blurb: "A canopy chest mimic. Hits blind and poison you.", where: "Jungles and bamboo groves.", biome: "Jungle", icon: "textures/entity/mimic_jungle.png", media: "site/media/mimics/jungle.png", loot: "Defeat for Relic Dust (~65%) and nearby structure relic loot." },
  { id: "mimic_swamp", name: "Swamp Mimic", blurb: "A boggy chest mimic. Hits soak you in poison and nausea.", where: "Swamps and mangrove marshes.", biome: "Swamp", icon: "textures/entity/mimic_swamp.png", media: "site/media/mimics/swamp.png", loot: "Defeat for Relic Dust (~65%) and nearby structure relic loot." },
  { id: "mimic_snow", name: "Snow Mimic", blurb: "A frosted chest mimic. Hits numb you with slowness and mining fatigue.", where: "Snow, ice, and cold biomes.", biome: "Snow", icon: "textures/entity/mimic_snow.png", media: "site/media/mimics/snow.png", loot: "Defeat for Relic Dust (~65%) and nearby structure relic loot." },
  { id: "mimic_badlands", name: "Badlands Mimic", blurb: "Clay-banded mesa mimic. Hits weaken you and set you on fire briefly.", where: "Badlands and savanna lands.", biome: "Badlands", icon: "textures/entity/mimic_badlands.png", media: "site/media/mimics/badlands.png", loot: "Defeat for Relic Dust (~65%) and nearby structure relic loot." },
];

const FALLBACK_SKILL_GROUPS = [
  {
    id: "might",
    name: "Might",
    tagline: "combos & finishers",
    skills: [
      { key: "scarbrand", name: "Scarbrand", summary: "Brand a hostile, then break it for bonus damage." },
      { key: "rivet_streak", name: "Rivet Streak", summary: "Build Rivets with fast hits, then shockwave." },
    ],
  },
  {
    id: "ward",
    name: "Ward",
    tagline: "counters & protection",
    skills: [
      { key: "placeholder", name: "Ward skills", summary: "Full skill list arrives with the next catalog build." },
    ],
  },
  {
    id: "gale",
    name: "Gale",
    tagline: "movement & marks",
    skills: [
      { key: "placeholder", name: "Gale skills", summary: "Full skill list arrives with the next catalog build." },
    ],
  },
  {
    id: "fortune",
    name: "Fortune",
    tagline: "wagers & loot",
    skills: [
      { key: "placeholder", name: "Fortune skills", summary: "Full skill list arrives with the next catalog build." },
    ],
  },
  {
    id: "vitality",
    name: "Vitality",
    tagline: "healing & life trades",
    skills: [
      { key: "placeholder", name: "Vitality skills", summary: "Full skill list arrives with the next catalog build." },
    ],
  },
  {
    id: "alchemy",
    name: "Alchemy",
    tagline: "reactions & familiars",
    skills: [
      { key: "placeholder", name: "Alchemy skills", summary: "Full skill list arrives with the next catalog build." },
    ],
  },
];

const state = {
  route: { type: "chapter", id: "ch-1" },
  slot: "all",
  tier: "all",
  query: "",
  ascendedQuery: "",
  materialQuery: "",
  mimicQuery: "",
  filterOpen: false,
  boostTier: {},
};

function catalog() {
  return window.RELIC_CATALOG || {};
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Color-code affinities, numbers, and key phrases in wiki copy. */
function colorizeText(raw, accentCssVar) {
  let t = escapeHtml(raw);
  const accent = accentCssVar || "var(--gold)";
  const groups = [
    ["might", "Might"],
    ["ward", "Ward"],
    ["gale", "Gale"],
    ["fortune", "Fortune"],
    ["vitality", "Vitality"],
    ["alchemy", "Alchemy"],
    ["necromancy", "Necromancy"],
    ["radiance", "Radiance"],
  ];
  for (const [cls, label] of groups) {
    t = t.replace(new RegExp(`\\b${label}\\b`, "g"), `<span class="kw kw-${cls}">${label}</span>`);
  }
  t = t.replace(
    /\b(Relic Dust|Arcane Gems?|Arcane Dust|Monster Heart|Beast Fang|Mystic Herb|Silver Fragment|Crimson Crystal)\b/g,
    (m) => `<span class="kw kw-gold">${m}</span>`
  );
  t = t.replace(/\bshards?\b/gi, (m) => {
    const dust = m.toLowerCase() === "shards" ? "Relic Dust" : "Relic Dust";
    return `<span class="kw kw-gold">${dust}</span>`;
  });
  t = t.replace(
    /\b(Execute Pulse|Execute|Tailwind|Sanguine Pact|Judgment Brand|Thunderbrand|Lumen Chorus|Dirge Mark|Vialmark|Bastion Glyph|Siege Root|Soul Charges?|Chorus Notes?|Scarbrand|Rivets?|Marked Weak|Pact Slam)\b/g,
    (m) => `<span class="kw-em" style="--accent:${accent}">${m}</span>`
  );
  t = t.replace(
    /(\+?\d+(?:\.\d+)?%?|\d+\s*hearts?)/gi,
    (m) => `<span class="kw-num" style="--accent:${accent}">${m}</span>`
  );
  return t;
}

function bareId(id) {
  return String(id || "").replace(/^relics:/, "");
}

function mediaOrRp(path) {
  if (!path) return "RP/textures/ui/curio_gem.png";
  const p = String(path).replace(/^\//, "");
  if (p.startsWith("site/") || p.startsWith("RP/")) return p;
  if (p.startsWith("textures/")) return `RP/${p}`;
  return p;
}

function resolveIcon(entry, fallbackPath) {
  if (entry?.media) return mediaOrRp(entry.media);
  if (entry?.icon) return mediaOrRp(entry.icon);
  if (entry?.texture) return mediaOrRp(entry.texture);
  if (fallbackPath) return mediaOrRp(fallbackPath);
  const id = bareId(entry?.id);
  if (id) return `RP/textures/items/${id}.png`;
  return "RP/textures/ui/curio_gem.png";
}

function allRelics() {
  return catalog().relics || [];
}
function baseRelics() {
  return allRelics().filter((r) => !r.ascended);
}
function ascendedRelics() {
  return allRelics().filter((r) => r.ascended);
}

function findRelic(id) {
  const bare = bareId(id);
  return allRelics().find((r) => bareId(r.id) === bare || r.id === id) || null;
}

function materialsList() {
  const list = catalog().materials;
  return Array.isArray(list) && list.length ? list : FALLBACK_MATERIALS;
}

function mimicsList() {
  const list = catalog().mimics;
  return Array.isArray(list) && list.length ? list : FALLBACK_MIMICS;
}

function findMaterial(id) {
  const bare = bareId(id);
  return materialsList().find((m) => bareId(m.id) === bare || m.id === id) || null;
}

function findMimic(id) {
  const bare = bareId(id);
  return mimicsList().find((m) => bareId(m.id) === bare || m.id === id) || null;
}

function skillGroups() {
  const cat = catalog();
  if (Array.isArray(cat.skillGroups) && cat.skillGroups.length) return cat.skillGroups;
  if (Array.isArray(cat.skills) && cat.skills.length) {
    const map = new Map();
    for (const s of cat.skills) {
      const gid = s.group || s.groupId || "other";
      if (!map.has(gid)) {
        map.set(gid, {
          id: gid,
          name: s.groupName || s.groupLabel || titleCase(gid),
          tagline: s.groupTagline || "",
          skills: [],
        });
      }
      map.get(gid).skills.push(s);
    }
    return [...map.values()];
  }
  return FALLBACK_SKILL_GROUPS;
}

function findSkill(group, key) {
  const g = skillGroups().find((x) => x.id === group || x.name?.toLowerCase() === group?.toLowerCase());
  if (!g) return null;
  const skill = (g.skills || []).find((s) => (s.key || s.id) === key);
  if (!skill) return null;
  return { group: g, skill };
}

function boostsList() {
  const list = catalog().boosts;
  return Array.isArray(list) && list.length ? list : FALLBACK_BOOSTS;
}

function titleCase(s) {
  return String(s || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeTierText(tiers) {
  if (!Array.isArray(tiers) || !tiers.length) return ["Details coming soon.", "Details coming soon.", "Details coming soon."];
  return [0, 1, 2].map((i) => {
    const t = tiers[i] ?? tiers[tiers.length - 1];
    if (t == null) return "—";
    if (typeof t === "string") return t.replace(/^(I|II|III)\s*[—\-–]\s*/i, "");
    return t.text || t.desc || t.summary || String(t);
  });
}

/* ---------- cards ---------- */

function cardHtml(relic) {
  const src = resolveIcon(relic, relic.ascended
    ? `textures/items/tiered/${bareId(relic.id)}.png`
    : `textures/items/${bareId(relic.id)}.png`);
  const href = `#relic/${encodeURIComponent(bareId(relic.id))}`;
  return `
    <a class="card" href="${href}"
      data-tip-title="${escapeHtml(relic.name)}"
      data-tip-body="${escapeHtml(relic.blurb || relic.summary || "")}"
      data-tip-meta="${escapeHtml((SLOT_LABELS[relic.slot] || relic.slot || "") + (relic.tier ? " · " + relic.tier : ""))}"
      data-tip-icon="${escapeHtml(src)}">
      <div class="icon-well sm">
        <img src="${src}" alt="" loading="lazy"
          onerror="this.onerror=null;this.src='RP/textures/ui/curio_gem.png'" />
      </div>
      <div>
        <h3>${escapeHtml(relic.name || bareId(relic.id))}</h3>
        <div class="meta">
          ${relic.slot ? `<span class="badge">${escapeHtml(SLOT_LABELS[relic.slot] || relic.slot)}</span>` : ""}
          ${relic.tier ? `<span class="badge ${escapeHtml(relic.tier)}">${escapeHtml(relic.tier)}</span>` : ""}
        </div>
        <p>${colorizeText(relic.blurb || relic.summary || "—", GROUP_COLORS[(relic.affinity || relic.relicAffinity || relic.boost || "").toLowerCase()] || "var(--gold)")}</p>
      </div>
    </a>`;
}

function simpleCardHtml(entry, href, meta) {
  const src = resolveIcon(entry);
  const title = entry.name || bareId(entry.id) || "Unknown";
  const body = entry.blurb || entry.summary || entry.sources || "";
  const shot = entry.media ? mediaOrRp(entry.media) : "";
  const isShot = Boolean(shot);
  return `
    <a class="card${isShot ? " card-shot" : ""}" href="${href}"
      data-tip-title="${escapeHtml(title)}"
      data-tip-body="${escapeHtml(body)}"
      data-tip-meta="${escapeHtml(meta || "")}"
      data-tip-icon="${escapeHtml(src)}">
      ${
        isShot
          ? `<div class="shot"><img src="${escapeHtml(shot)}" alt="${escapeHtml(title)}" loading="lazy" /></div>`
          : `<div class="icon-well sm">
        <img src="${src}" alt="" loading="lazy"
          onerror="this.onerror=null;this.src='RP/textures/ui/curio_gem.png'" />
      </div>`
      }
      <div>
        <h3>${escapeHtml(title)}</h3>
        ${meta ? `<div class="meta"><span class="badge">${escapeHtml(meta)}</span></div>` : ""}
        <p>${colorizeText(body || "—", isShot ? "var(--gem)" : "var(--gold)")}</p>
      </div>
    </a>`;
}

/* ---------- filters / grids ---------- */

function activeFilterCount() {
  let n = 0;
  if (state.slot !== "all") n += 1;
  if (state.tier !== "all") n += 1;
  return n;
}

function updateFilterBadge() {
  const badge = document.getElementById("filter-badge");
  const n = activeFilterCount();
  if (!badge) return;
  if (n === 0) {
    badge.hidden = true;
    badge.textContent = "";
  } else {
    badge.hidden = false;
    badge.textContent = String(n);
  }
}

function setFilterOpen(open) {
  state.filterOpen = open;
  const panel = document.getElementById("filter-panel");
  const toggle = document.getElementById("filter-toggle");
  if (panel) panel.hidden = !open;
  if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
}

function renderFilters() {
  const slotRow = document.getElementById("slot-filters");
  const tierRow = document.getElementById("tier-filters");
  if (!slotRow || !tierRow) return;

  const slots = SLOT_ORDER.filter((s) => baseRelics().some((r) => r.slot === s));

  slotRow.innerHTML =
    `<button type="button" class="chip ${state.slot === "all" ? "active" : ""}" data-slot="all">All</button>` +
    slots
      .map(
        (s) =>
          `<button type="button" class="chip ${state.slot === s ? "active" : ""}" data-slot="${s}">${SLOT_LABELS[s]}</button>`
      )
      .join("");

  tierRow.innerHTML =
    `<button type="button" class="chip ${state.tier === "all" ? "active" : ""}" data-tier="all">All</button>` +
    ["common", "uncommon", "rare"]
      .map(
        (t) =>
          `<button type="button" class="chip tier-${t} ${state.tier === t ? "active" : ""}" data-tier="${t}">${t}</button>`
      )
      .join("");

  updateFilterBadge();
}

function renderRelicGrid() {
  const grid = document.getElementById("relic-grid");
  const countEl = document.getElementById("relic-count");
  if (!grid) return;

  let list = baseRelics();
  if (state.slot !== "all") list = list.filter((r) => r.slot === state.slot);
  if (state.tier !== "all") list = list.filter((r) => r.tier === state.tier);
  const q = state.query.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (r) =>
        (r.name || "").toLowerCase().includes(q) ||
        (r.blurb || "").toLowerCase().includes(q) ||
        (SLOT_LABELS[r.slot] || "").toLowerCase().includes(q) ||
        (r.tier || "").toLowerCase().includes(q)
    );
  }
  list = [...list].sort(compareRelicsByRarity);

  if (countEl) countEl.textContent = `${list.length} shown`;
  grid.innerHTML = list.length
    ? list.map(cardHtml).join("")
    : `<p class="empty">No relics match. Clear filters or search.</p>`;
}

function renderAscended() {
  const grid = document.getElementById("ascended-grid");
  const countEl = document.getElementById("ascended-count");
  if (!grid) return;
  let list = ascendedRelics();
  const q = state.ascendedQuery.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (r) =>
        (r.name || "").toLowerCase().includes(q) ||
        (r.blurb || "").toLowerCase().includes(q)
    );
  }
  list = [...list].sort(compareRelicsByRarity);
  if (countEl) countEl.textContent = `${list.length} shown`;
  grid.innerHTML = list.length
    ? list.map(cardHtml).join("")
    : `<p class="empty">No ascended relics match.</p>`;
}

function renderMaterials() {
  const grid = document.getElementById("material-grid");
  const countEl = document.getElementById("material-count");
  if (!grid) return;
  let list = materialsList();
  const q = state.materialQuery.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (m) =>
        (m.name || "").toLowerCase().includes(q) ||
        (m.blurb || "").toLowerCase().includes(q) ||
        (m.sources || "").toLowerCase().includes(q)
    );
  }
  if (countEl) countEl.textContent = `${list.length} shown`;
  grid.innerHTML = list.length
    ? list
        .map((m) =>
          simpleCardHtml(
            m,
            `#material/${encodeURIComponent(bareId(m.id))}`,
            m.sources ? "Material" : "Material"
          )
        )
        .join("")
    : `<p class="empty">Materials catalog not loaded yet.</p>`;
}

function renderMimics() {
  const grid = document.getElementById("mimic-grid");
  const countEl = document.getElementById("mimic-count");
  if (!grid) return;
  let list = mimicsList();
  const q = state.mimicQuery.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (m) =>
        (m.name || "").toLowerCase().includes(q) ||
        (m.blurb || "").toLowerCase().includes(q) ||
        (m.biome || "").toLowerCase().includes(q)
    );
  }
  if (countEl) countEl.textContent = `${list.length} shown`;
  grid.innerHTML = list.length
    ? list
        .map((m) =>
          simpleCardHtml(
            m,
            `#mimic/${encodeURIComponent(bareId(m.id))}`,
            m.biome || "Mimic"
          )
        )
        .join("")
    : `<p class="empty">Mimics catalog not loaded yet.</p>`;
}

function renderBoosts() {
  const el = document.getElementById("boost-grid");
  if (!el) return;
  el.innerHTML = boostsList()
    .map((b) => {
      const id = b.id || b.name?.toLowerCase() || "boost";
      const tiers = normalizeTierText(b.tiers);
      const selected = state.boostTier[id] ?? 0;
      const color = b.color || GROUP_COLORS[id] || "var(--gold)";
      return `
      <article class="boost" style="--boost:${color}; --accent:${color}" data-boost-id="${escapeHtml(id)}">
        <h2>${escapeHtml(b.name || titleCase(id))}</h2>
        <p class="boost-summary">${colorizeText(b.summary || b.blurb || "", color)}</p>
        <div class="boost-tiers" role="group" aria-label="${escapeHtml(b.name || id)} tiers">
          ${TIER_ROMAN.map(
            (label, i) =>
              `<button type="button" class="tier-btn ${selected === i ? "active" : ""}" data-tier-idx="${i}" aria-pressed="${selected === i}">${label}</button>`
          ).join("")}
        </div>
        <p class="boost-value" data-boost-value>${colorizeText(tiers[selected], color)}</p>
      </article>`;
    })
    .join("");
}

function renderAttuneSkills() {
  const el = document.getElementById("attune-skills");
  if (!el) return;
  const groups = skillGroups();
  if (!groups.length) {
    el.innerHTML = `<p class="empty">Skill groups will appear when catalog.js includes them.</p>`;
    return;
  }
  el.innerHTML = groups
    .map((g) => {
      const color = GROUP_COLORS[g.id] || "var(--gem)";
      const skills = g.skills || [];
      return `
      <article class="skill-group" style="--group:${color}; --accent:${color}">
        <h2>${escapeHtml(g.name || titleCase(g.id))}</h2>
        <p class="group-blurb">${colorizeText(g.tagline || g.blurb || g.summary || "", color)}</p>
        <div class="skill-list">
          ${
            skills.length
              ? skills
                  .map((s) => {
                    const key = s.key || s.id || "skill";
                    return `<a class="skill-pill" href="#skill/${encodeURIComponent(g.id)}/${encodeURIComponent(key)}">${escapeHtml(s.name || titleCase(key))}</a>`;
                  })
                  .join("")
              : `<span class="badge">No skills listed yet</span>`
          }
        </div>
      </article>`;
    })
    .join("");
}

/* ---------- detail views ---------- */

function detailShell({ backHash, backLabel, icon, title, metaHtml, bodyHtml, accent, shot }) {
  const accentStyle = accent ? ` style="--accent:${escapeHtml(accent)}"` : "";
  const media = shot
    ? `<div class="detail-shot"><img src="${escapeHtml(shot)}" alt="${escapeHtml(title)}" /></div>`
    : "";
  return `
    <button type="button" class="back-link" data-back="${escapeHtml(backHash)}">← ${escapeHtml(backLabel)}</button>
    <article class="detail-card"${accentStyle}>
      <div class="detail-head">
        <div class="icon-well lg">
          <img src="${escapeHtml(icon)}" alt="" onerror="this.onerror=null;this.src='RP/textures/ui/curio_gem.png'" />
        </div>
        <div>
          <h1>${escapeHtml(title)}</h1>
          <div class="detail-meta meta">${metaHtml || ""}</div>
        </div>
      </div>
      ${media}
      <div class="detail-body">${bodyHtml}</div>
    </article>`;
}

function renderDetail() {
  const root = document.getElementById("detail-root");
  if (!root) return;
  const { type, id, group, key } = state.route;

  if (type === "relic") {
    const r = findRelic(id);
    if (!r) {
      root.innerHTML = detailShell({
        backHash: "#ch-6",
        backLabel: "Relic catalog",
        icon: "RP/textures/ui/curio_gem.png",
        title: titleCase(bareId(id)) || "Unknown relic",
        metaHtml: `<span class="badge">Missing</span>`,
        bodyHtml: `<p>This relic is not in the catalog yet (<code>${escapeHtml(id)}</code>). It will light up when catalog.js includes it.</p>`,
      });
      return;
    }
    const accent = GROUP_COLORS[(r.affinity || r.relicAffinity || r.boost || "").toLowerCase()] || "var(--gold)";
    const src = resolveIcon(r, r.ascended
      ? `textures/items/tiered/${bareId(r.id)}.png`
      : `textures/items/${bareId(r.id)}.png`);
    const notes = Array.isArray(r.notes) ? r.notes : [];
    const hasSide = notes.length > 0 || (r.effect && r.effect !== r.blurb && r.effect !== r.summary);
    const mainHtml = `
      <p>${colorizeText(r.blurb || r.summary || "No description yet.", accent)}</p>
      ${r.effect && r.effect !== r.blurb && r.effect !== r.summary ? `<p>${colorizeText(r.effect, accent)}</p>` : ""}`;
    const sideHtml = notes.length
      ? `<p class="section-label">Notes</p>
         <ul class="detail-list plain">${notes
           .map((n) => `<li>${colorizeText(n, accent)}</li>`)
           .join("")}</ul>`
      : "";
    root.innerHTML = detailShell({
      backHash: r.ascended ? "#ch-7" : "#ch-6",
      backLabel: r.ascended ? "Ascended" : "Relic catalog",
      icon: src,
      title: r.name || bareId(r.id),
      accent,
      metaHtml: `
        ${r.slot ? `<span class="badge">${escapeHtml(SLOT_LABELS[r.slot] || r.slot)}</span>` : ""}
        ${r.tier ? `<span class="badge ${escapeHtml(r.tier)}">${escapeHtml(r.tier)}</span>` : ""}
        ${r.relicAffinity || r.affinity ? `<span class="badge ${escapeHtml((r.relicAffinity || r.affinity || "").toLowerCase())}">${escapeHtml(titleCase(r.relicAffinity || r.affinity))}</span>` : ""}`,
      bodyHtml: hasSide && sideHtml
        ? `<div class="detail-cols"><div class="detail-main">${mainHtml}</div><div class="detail-side">${sideHtml}</div></div>`
        : mainHtml,
    });
    return;
  }

  if (type === "material") {
    const m = findMaterial(id);
    const src = resolveIcon(m || { id });
    root.innerHTML = detailShell({
      backHash: "#materials",
      backLabel: "Materials",
      icon: src,
      title: m?.name || titleCase(bareId(id)),
      metaHtml: `<span class="badge">Material</span>`,
      bodyHtml: m
        ? `<p>${colorizeText(m.blurb || m.summary || "—", "var(--gold)")}</p>
           ${m.sources ? `<p><strong style="color:var(--gold)">Sources:</strong> ${colorizeText(m.sources, "var(--gold)")}</p>` : ""}`
        : `<p>Material <code>${escapeHtml(id)}</code> is not in the catalog yet.</p>`,
    });
    return;
  }

  if (type === "mimic") {
    const m = findMimic(id);
    const src = resolveIcon(m || { id }, `textures/entity/${bareId(id)}.png`);
    const shot = m?.media ? mediaOrRp(m.media) : "";
    root.innerHTML = detailShell({
      backHash: "#mimics",
      backLabel: "Mimics",
      icon: src,
      shot,
      title: m?.name || titleCase(bareId(id)),
      metaHtml: m?.biome
        ? `<span class="badge">${escapeHtml(m.biome)}</span>`
        : `<span class="badge">Mimic</span>`,
      bodyHtml: m
        ? `<p>${colorizeText(m.blurb || m.summary || "Defeat for relic loot and Relic Dust.", "var(--gem)")}</p>
           ${m.where ? `<p><strong style="color:var(--gold)">Where:</strong> ${colorizeText(m.where, "var(--gem)")}</p>` : ""}
           ${m.loot ? `<p><strong style="color:var(--gold)">Loot:</strong> ${colorizeText(m.loot, "var(--gem)")}</p>` : ""}
           <p class="muted-line">Deep and camp chests can awaken as mimics. Kill them standing above the chest — Relic Dust is common; relics often come from nearby structure loot.</p>`
        : `<p>Mimic <code>${escapeHtml(id)}</code> is not in the catalog yet.</p>`,
    });
    return;
  }

  if (type === "skill") {
    const found = findSkill(group, key);
    const g = found?.group;
    const s = found?.skill;
    const accent = GROUP_COLORS[g?.id] || "var(--gem)";
    const groupCls = g?.id || "";
    const ranks = Array.isArray(s?.tiers) ? s.tiers : [];
    const mainHtml = s
      ? `<p>${colorizeText(s.summary || s.blurb || "—", accent)}</p>
         ${s.when ? `<p><strong class="field-label">When:</strong> ${colorizeText(s.when, accent)}</p>` : ""}
         ${s.cost ? `<p><strong class="field-label">Cost:</strong> ${colorizeText(s.cost, accent)}</p>` : ""}`
      : `<p>Skill <code>${escapeHtml(group)}/${escapeHtml(key)}</code> is not in the catalog yet.</p>`;
    const ranksHtml = ranks.length
      ? `<p class="section-label">Ranks</p>
         <ul class="detail-list">${ranks
           .map((t, i) => {
             const text = typeof t === "string" ? t : t.text || t;
             return `<li><span class="rank-label">${rankLabel(i)}</span><span>${colorizeText(text, accent)}</span></li>`;
           })
           .join("")}</ul>`
      : "";
    root.innerHTML = detailShell({
      backHash: "#ch-5",
      backLabel: "Attune",
      icon: "RP/textures/items/attunement_tome.png",
      title: s?.name || titleCase(key),
      accent,
      metaHtml: `<span class="badge ${escapeHtml(groupCls)}">${escapeHtml(g?.name || group || "Skill")}</span>
        ${s?.kind ? `<span class="badge">${escapeHtml(s.kind)}</span>` : ""}`,
      bodyHtml: ranksHtml
        ? `<div class="detail-cols"><div class="detail-main">${mainHtml}</div><div class="detail-side">${ranksHtml}</div></div>`
        : mainHtml,
    });
  }
}

/* ---------- routing ---------- */

function parseHash(hash) {
  const raw = (hash || "").replace(/^#/, "").trim();
  if (!raw) return { type: "chapter", id: "ch-1" };

  const relic = raw.match(/^relic\/(.+)$/i);
  if (relic) return { type: "relic", id: decodeURIComponent(relic[1]) };

  const material = raw.match(/^material\/(.+)$/i);
  if (material) return { type: "material", id: decodeURIComponent(material[1]) };

  const mimic = raw.match(/^mimic\/(.+)$/i);
  if (mimic) return { type: "mimic", id: decodeURIComponent(mimic[1]) };

  const skill = raw.match(/^skill\/([^/]+)\/(.+)$/i);
  if (skill) {
    return {
      type: "skill",
      group: decodeURIComponent(skill[1]),
      key: decodeURIComponent(skill[2]),
      id: `${skill[1]}/${skill[2]}`,
    };
  }

  if (raw === "materials" || raw === "mimics") return { type: "chapter", id: raw };
  if (CHAPTERS[raw]) return { type: "chapter", id: raw };

  // Legacy / unknown → start
  if (/^ch-\d+$/.test(raw)) return { type: "chapter", id: raw };
  return { type: "chapter", id: "ch-1" };
}

function routeToHash(route) {
  if (route.type === "chapter") return `#${route.id}`;
  if (route.type === "relic") return `#relic/${encodeURIComponent(bareId(route.id))}`;
  if (route.type === "material") return `#material/${encodeURIComponent(bareId(route.id))}`;
  if (route.type === "mimic") return `#mimic/${encodeURIComponent(bareId(route.id))}`;
  if (route.type === "skill") {
    return `#skill/${encodeURIComponent(route.group)}/${encodeURIComponent(route.key)}`;
  }
  return "#ch-1";
}

function crumbFor(route) {
  if (route.type === "chapter") return CHAPTERS[route.id] || "Wiki";
  if (route.type === "relic") {
    const r = findRelic(route.id);
    return `Relic · ${r?.name || titleCase(bareId(route.id))}`;
  }
  if (route.type === "material") {
    const m = findMaterial(route.id);
    return `Material · ${m?.name || titleCase(bareId(route.id))}`;
  }
  if (route.type === "mimic") {
    const m = findMimic(route.id);
    return `Mimic · ${m?.name || titleCase(bareId(route.id))}`;
  }
  if (route.type === "skill") {
    const found = findSkill(route.group, route.key);
    return `Skill · ${found?.skill?.name || titleCase(route.key)}`;
  }
  return "Wiki";
}

function panelIdFor(route) {
  if (route.type === "chapter") {
    if (route.id === "materials") return "panel-materials";
    if (route.id === "mimics") return "panel-mimics";
    return `panel-${route.id}`;
  }
  return "panel-detail";
}

function closeMobileNav() {
  document.getElementById("topnav")?.classList.remove("nav-open");
  document.querySelector(".sidebar")?.classList.remove("open");
  const btn = document.getElementById("menu-btn");
  if (btn) btn.setAttribute("aria-expanded", "false");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (backdrop) backdrop.hidden = true;
}

function navigate(route, { replace = false } = {}) {
  state.route = route;
  setFilterOpen(false);
  hideTooltip();

  const chapterId = route.type === "chapter" ? route.id : null;
  document.querySelectorAll(".chapter").forEach((btn) => {
    const r = btn.dataset.route;
    let active = false;
    if (chapterId && r === chapterId) active = true;
    if (route.type === "relic" && (r === "ch-6" || r === "ch-7")) {
      const relic = findRelic(route.id);
      active = r === (relic?.ascended ? "ch-7" : "ch-6");
    }
    if (route.type === "material" && r === "materials") active = true;
    if (route.type === "mimic" && r === "mimics") active = true;
    if (route.type === "skill" && r === "ch-5") active = true;
    btn.classList.toggle("active", active);
  });

  const showId = panelIdFor(route);
  document.querySelectorAll(".panel").forEach((panel) => {
    panel.hidden = panel.id !== showId;
  });

  if (route.type !== "chapter") renderDetail();

  const crumb = document.getElementById("crumb");
  if (crumb) crumb.textContent = crumbFor(route);

  const hash = routeToHash(route);
  if (location.hash !== hash) {
    if (replace) history.replaceState(null, "", hash);
    else history.pushState(null, "", hash);
  }

  closeMobileNav();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function go(hashOrRoute, opts) {
  if (typeof hashOrRoute === "string") {
    navigate(parseHash(hashOrRoute.startsWith("#") ? hashOrRoute : `#${hashOrRoute}`), opts);
  } else {
    navigate(hashOrRoute, opts);
  }
}

/* ---------- tooltips ---------- */

function tipEl() {
  return document.getElementById("tooltip");
}

function hideTooltip() {
  const el = tipEl();
  if (!el) return;
  el.hidden = true;
  el.innerHTML = "";
}

function showTooltip(card, x, y) {
  const el = tipEl();
  if (!el) return;
  const icon = card.dataset.tipIcon || "RP/textures/ui/curio_gem.png";
  el.innerHTML = `
    <div class="tooltip-row">
      <div class="tip-icon"><img src="${escapeHtml(icon)}" alt="" onerror="this.src='RP/textures/ui/curio_gem.png'" /></div>
      <div>
        <strong>${escapeHtml(card.dataset.tipTitle)}</strong>
        <div class="tip-meta">${escapeHtml(card.dataset.tipMeta || "")}</div>
        <div class="tip-body">${escapeHtml(card.dataset.tipBody || "")}</div>
      </div>
    </div>`;
  el.hidden = false;
  const left = Math.min(window.innerWidth - 150, Math.max(150, x));
  const top = Math.max(56, y - 8);
  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
}

/* ---------- setup ---------- */

function setupNav() {
  document.querySelectorAll(".chapter[data-route]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      go(btn.dataset.route, { replace: true });
    });
  });

  document.querySelectorAll(".path-link, .next-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.route;
      if (id) go(id, { replace: true });
    });
  });

  document.querySelector(".brand")?.addEventListener("click", (e) => {
    e.preventDefault();
    go("ch-1", { replace: true });
  });

  document.getElementById("detail-root")?.addEventListener("click", (e) => {
    const back = e.target.closest("[data-back]");
    if (!back) return;
    e.preventDefault();
    go(back.dataset.back, { replace: true });
  });

  window.addEventListener("hashchange", () => {
    navigate(parseHash(location.hash), { replace: true });
  });

  document.getElementById("menu-btn")?.addEventListener("click", () => {
    const nav = document.getElementById("topnav");
    const backdrop = document.getElementById("sidebar-backdrop");
    const open = !nav?.classList.contains("nav-open");
    nav?.classList.toggle("nav-open", open);
    const btn = document.getElementById("menu-btn");
    if (btn) btn.setAttribute("aria-expanded", String(open));
    if (backdrop) backdrop.hidden = !open;
  });

  document.getElementById("sidebar-backdrop")?.addEventListener("click", closeMobileNav);
}

function setupFilters() {
  document.getElementById("filter-toggle")?.addEventListener("click", (e) => {
    e.stopPropagation();
    setFilterOpen(!state.filterOpen);
  });

  document.getElementById("filter-clear")?.addEventListener("click", () => {
    state.slot = "all";
    state.tier = "all";
    renderFilters();
    renderRelicGrid();
  });

  document.getElementById("slot-filters")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-slot]");
    if (!btn) return;
    state.slot = btn.dataset.slot;
    renderFilters();
    renderRelicGrid();
  });

  document.getElementById("tier-filters")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tier]");
    if (!btn) return;
    state.tier = btn.dataset.tier;
    renderFilters();
    renderRelicGrid();
  });

  document.getElementById("relic-search")?.addEventListener("input", (e) => {
    state.query = e.target.value;
    renderRelicGrid();
  });

  document.getElementById("ascended-search")?.addEventListener("input", (e) => {
    state.ascendedQuery = e.target.value;
    renderAscended();
  });

  document.getElementById("material-search")?.addEventListener("input", (e) => {
    state.materialQuery = e.target.value;
    renderMaterials();
  });

  document.getElementById("mimic-search")?.addEventListener("input", (e) => {
    state.mimicQuery = e.target.value;
    renderMimics();
  });

  document.addEventListener("click", (e) => {
    if (!state.filterOpen) return;
    const wrap = document.querySelector(".filter-wrap");
    if (wrap && !wrap.contains(e.target)) setFilterOpen(false);
  });
}

function setupBoosts() {
  document.getElementById("boost-grid")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".tier-btn");
    if (!btn) return;
    const card = btn.closest("[data-boost-id]");
    if (!card) return;
    const id = card.dataset.boostId;
    const idx = Number(btn.dataset.tierIdx);
    state.boostTier[id] = idx;
    const boost = boostsList().find((b) => (b.id || b.name?.toLowerCase()) === id);
    const tiers = normalizeTierText(boost?.tiers);
    const color = boost?.color || GROUP_COLORS[id] || "var(--gold)";
    card.querySelectorAll(".tier-btn").forEach((b, i) => {
      b.classList.toggle("active", i === idx);
      b.setAttribute("aria-pressed", i === idx ? "true" : "false");
    });
    const val = card.querySelector("[data-boost-value]");
    if (val) val.innerHTML = colorizeText(tiers[idx] || "—", color);
  });
}

function setupTooltips() {
  document.addEventListener("pointerover", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    showTooltip(card, e.clientX, e.clientY);
  });
  document.addEventListener("pointermove", (e) => {
    const card = e.target.closest(".card");
    if (!card || tipEl()?.hidden) return;
    showTooltip(card, e.clientX, e.clientY);
  });
  document.addEventListener("pointerout", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    if (e.relatedTarget && card.contains(e.relatedTarget)) return;
    hideTooltip();
  });
  document.addEventListener("focusin", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const r = card.getBoundingClientRect();
    showTooltip(card, r.left + r.width / 2, r.top);
  });
  document.addEventListener("focusout", () => hideTooltip());
}

function init() {
  setupNav();
  setupFilters();
  setupBoosts();
  setupTooltips();
  renderFilters();
  renderRelicGrid();
  renderAscended();
  renderBoosts();
  renderAttuneSkills();
  renderMaterials();
  renderMimics();
  navigate(parseHash(location.hash), { replace: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
