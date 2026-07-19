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
  "held",
];

const TIER_ORDER = ["common", "uncommon", "rare", "ascended"];

const BOOSTS = [
  {
    id: "might",
    name: "Might",
    color: "var(--might)",
    summary: "Stack hits to deal crushing echo damage.",
    tiers: [
      "I — Every 5 hits, +2 bonus damage",
      "II — Every 4 hits, +3 bonus damage",
      "III — Every 3 hits, +4 bonus damage",
    ],
  },
  {
    id: "ward",
    name: "Ward",
    color: "var(--ward)",
    summary: "Chance to deflect incoming attacks.",
    tiers: ["I — 8% deflect", "II — 14% deflect", "III — 20% deflect"],
  },
  {
    id: "gale",
    name: "Gale",
    color: "var(--gale)",
    summary: "Sprinting grants short Tailwind speed bursts.",
    tiers: [
      "I — Speed burst while sprinting",
      "II — Stronger Tailwind",
      "III — Tailwind + Jump Boost",
    ],
  },
  {
    id: "fortune",
    name: "Fortune",
    color: "var(--fortune)",
    summary: "Chance for extra ore when mining.",
    tiers: ["I — 6% bonus ore", "II — 12% bonus ore", "III — 20% bonus ore"],
  },
  {
    id: "vitality",
    name: "Vitality",
    color: "var(--vitality)",
    summary: "Kills restore health.",
    tiers: [
      "I — 1 heart on kill",
      "II — 2 hearts on kill",
      "III — 3 hearts + brief Regeneration",
    ],
  },
  {
    id: "alchemy",
    name: "Alchemy",
    color: "var(--alchemy)",
    summary: "Drunk potions last longer.",
    tiers: ["I — +15% duration", "II — +30% duration", "III — +50% duration"],
  },
];

const state = { slot: "all", tier: "all" };

function iconUrl(path) {
  if (!path) return "RP/textures/ui/curio_gem.png";
  return `RP/${path}`;
}

function cardHtml(relic) {
  return `
    <article class="card">
      <img src="${iconUrl(relic.icon)}" alt="" loading="lazy" onerror="this.src='RP/textures/ui/curio_gem.png'" />
      <div>
        <h4>${escapeHtml(relic.name)}</h4>
        <div class="meta">
          <span class="badge slot">${escapeHtml(SLOT_LABELS[relic.slot] || relic.slot)}</span>
          <span class="badge ${relic.tier}">${escapeHtml(relic.tier)}</span>
        </div>
        <p>${escapeHtml(relic.blurb)}</p>
      </div>
    </article>
  `;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function baseRelics() {
  return (window.RELIC_CATALOG?.relics || []).filter((r) => !r.ascended);
}

function ascendedRelics() {
  return (window.RELIC_CATALOG?.relics || []).filter((r) => r.ascended);
}

function renderFilters() {
  const slots = SLOT_ORDER.filter((s) =>
    baseRelics().some((r) => r.slot === s)
  );
  const slotRow = document.getElementById("slot-filters");
  slotRow.innerHTML =
    `<button type="button" class="chip ${state.slot === "all" ? "active" : ""}" data-slot="all">All slots</button>` +
    slots
      .map(
        (s) =>
          `<button type="button" class="chip ${state.slot === s ? "active" : ""}" data-slot="${s}">${SLOT_LABELS[s]}</button>`
      )
      .join("");

  const tierRow = document.getElementById("tier-filters");
  tierRow.innerHTML =
    `<button type="button" class="chip ${state.tier === "all" ? "active" : ""}" data-tier="all">All tiers</button>` +
    TIER_ORDER.filter((t) => t !== "ascended")
      .map(
        (t) =>
          `<button type="button" class="chip tier-${t} ${state.tier === t ? "active" : ""}" data-tier="${t}">${t}</button>`
      )
      .join("");

  slotRow.onclick = (e) => {
    const btn = e.target.closest("[data-slot]");
    if (!btn) return;
    state.slot = btn.dataset.slot;
    renderFilters();
    renderRelicGrid();
  };
  tierRow.onclick = (e) => {
    const btn = e.target.closest("[data-tier]");
    if (!btn) return;
    state.tier = btn.dataset.tier;
    renderFilters();
    renderRelicGrid();
  };
}

function renderRelicGrid() {
  let list = baseRelics();
  if (state.slot !== "all") list = list.filter((r) => r.slot === state.slot);
  if (state.tier !== "all") list = list.filter((r) => r.tier === state.tier);
  list = [...list].sort(
    (a, b) =>
      SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot) ||
      TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) ||
      a.name.localeCompare(b.name)
  );

  document.getElementById("relic-count").textContent = `${list.length} relic${list.length === 1 ? "" : "s"}`;
  const grid = document.getElementById("relic-grid");
  grid.innerHTML = list.length
    ? list.map(cardHtml).join("")
    : `<p class="empty">No relics match these filters.</p>`;
}

function renderAscended() {
  const list = [...ascendedRelics()].sort((a, b) => a.name.localeCompare(b.name));
  document.getElementById("ascended-grid").innerHTML = list.map(cardHtml).join("");
}

function renderBoosts() {
  document.getElementById("boost-grid").innerHTML = BOOSTS.map(
    (b) => `
    <article class="boost" style="--boost:${b.color}">
      <h3>${b.name}</h3>
      <p>${b.summary}</p>
      <ul>${b.tiers.map((t) => `<li>${t}</li>`).join("")}</ul>
    </article>`
  ).join("");
}

function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".panel");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.dataset.tab;
      tabs.forEach((t) => t.classList.toggle("active", t === tab));
      panels.forEach((p) => p.classList.toggle("active", p.id === `panel-${id}`));
    });
  });
}

setupTabs();
renderFilters();
renderRelicGrid();
renderAscended();
renderBoosts();
