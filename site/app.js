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

const TABS = ["start", "relics", "ascended", "boosts", "attune", "world"];

const state = {
  tab: "start",
  slot: "all",
  tier: "all",
  query: "",
  ascendedQuery: "",
};

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Prefer clean base icons on the wiki (tiered outlines read muddy on dark UI). */
function iconUrl(relic) {
  const id = (relic.id || "").replace("relics:", "");
  if (!id) return "RP/textures/ui/curio_gem.png";
  if (relic.ascended) {
    return `RP/textures/items/tiered/${id}.png`;
  }
  return `RP/textures/items/${id}.png`;
}

function allRelics() {
  return window.RELIC_CATALOG?.relics || [];
}

function baseRelics() {
  return allRelics().filter((r) => !r.ascended);
}

function ascendedRelics() {
  return allRelics().filter((r) => r.ascended);
}

function cardHtml(relic) {
  const tip = `${relic.name} · ${SLOT_LABELS[relic.slot] || relic.slot} · ${relic.tier}\n${relic.blurb}`;
  return `
    <article class="card" tabindex="0"
      data-tip-title="${escapeHtml(relic.name)}"
      data-tip-body="${escapeHtml(relic.blurb)}"
      data-tip-meta="${escapeHtml((SLOT_LABELS[relic.slot] || relic.slot) + " · " + relic.tier)}"
      title="${escapeHtml(tip)}">
      <div class="icon-well sm">
        <img src="${iconUrl(relic)}" alt="" loading="lazy"
          onerror="this.onerror=null;this.src='RP/textures/ui/curio_gem.png'" />
      </div>
      <div class="body">
        <h3>${escapeHtml(relic.name)}</h3>
        <div class="meta">
          <span class="badge">${escapeHtml(SLOT_LABELS[relic.slot] || relic.slot)}</span>
          <span class="badge ${escapeHtml(relic.tier)}">${escapeHtml(relic.tier)}</span>
        </div>
        <p>${escapeHtml(relic.blurb)}</p>
      </div>
    </article>
  `;
}

function renderFilters() {
  const slotRow = document.getElementById("slot-filters");
  const tierRow = document.getElementById("tier-filters");
  if (!slotRow || !tierRow) return;

  const slots = SLOT_ORDER.filter((s) => baseRelics().some((r) => r.slot === s));

  slotRow.innerHTML =
    chip("all", "All slots", state.slot === "all", "slot") +
    slots
      .map((s) => chip(s, SLOT_LABELS[s], state.slot === s, "slot"))
      .join("");

  tierRow.innerHTML =
    chip("all", "All tiers", state.tier === "all", "tier") +
    TIER_ORDER.filter((t) => t !== "ascended")
      .map((t) => chip(t, t, state.tier === t, "tier", `tier-${t}`))
      .join("");
}

function chip(value, label, active, kind, extraClass = "") {
  return `<button type="button" class="chip ${extraClass} ${active ? "active" : ""}" data-${kind}="${value}">${escapeHtml(label)}</button>`;
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
        r.name.toLowerCase().includes(q) ||
        r.blurb.toLowerCase().includes(q) ||
        (SLOT_LABELS[r.slot] || "").toLowerCase().includes(q)
    );
  }

  list = [...list].sort(
    (a, b) =>
      SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot) ||
      TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) ||
      a.name.localeCompare(b.name)
  );

  if (countEl) countEl.textContent = `${list.length} shown`;
  grid.innerHTML = list.length
    ? list.map(cardHtml).join("")
    : `<p class="empty">No relics match. Clear search or filters.</p>`;
}

function renderAscended() {
  const grid = document.getElementById("ascended-grid");
  const countEl = document.getElementById("ascended-count");
  if (!grid) return;

  let list = ascendedRelics();
  const q = state.ascendedQuery.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (r) => r.name.toLowerCase().includes(q) || r.blurb.toLowerCase().includes(q)
    );
  }
  list = [...list].sort((a, b) => a.name.localeCompare(b.name));

  if (countEl) countEl.textContent = `${list.length} shown`;
  grid.innerHTML = list.length
    ? list.map(cardHtml).join("")
    : `<p class="empty">No ascended relics match.</p>`;
}

function renderBoosts() {
  const el = document.getElementById("boost-grid");
  if (!el) return;
  el.innerHTML = BOOSTS.map(
    (b) => `
    <article class="boost" style="--boost:${b.color}">
      <h2>${escapeHtml(b.name)}</h2>
      <p>${escapeHtml(b.summary)}</p>
      <ul>${b.tiers.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
    </article>`
  ).join("");
}

function showTab(id) {
  if (!TABS.includes(id)) id = "start";
  state.tab = id;

  document.querySelectorAll(".tab").forEach((tab) => {
    const on = tab.dataset.tab === id;
    tab.classList.toggle("active", on);
    tab.setAttribute("aria-selected", on ? "true" : "false");
  });

  document.querySelectorAll(".panel").forEach((panel) => {
    const on = panel.id === `panel-${id}`;
    panel.hidden = !on;
  });

  const nextHash = `#${id}`;
  if (location.hash !== nextHash) {
    history.replaceState(null, "", nextHash);
  }

  hideTooltip();
}

function setupTabs() {
  document.querySelector(".tabs")?.addEventListener("click", (e) => {
    const tab = e.target.closest(".tab");
    if (!tab) return;
    e.preventDefault();
    showTab(tab.dataset.tab);
  });

  window.addEventListener("hashchange", () => {
    const id = location.hash.replace(/^#/, "") || "start";
    showTab(id);
  });
}

function setupFilters() {
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
}

const tipEl = () => document.getElementById("tooltip");

function hideTooltip() {
  const el = tipEl();
  if (!el) return;
  el.hidden = true;
  el.innerHTML = "";
}

function showTooltip(card, clientX, clientY) {
  const el = tipEl();
  if (!el) return;
  el.innerHTML = `<strong>${card.dataset.tipTitle}</strong>${escapeHtml(card.dataset.tipMeta || "")}<br>${card.dataset.tipBody}`;
  el.hidden = false;
  const pad = 12;
  const x = Math.min(window.innerWidth - 140, Math.max(140, clientX));
  const y = Math.max(48, clientY - pad);
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
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
    const to = e.relatedTarget;
    if (to && card.contains(to)) return;
    hideTooltip();
  });

  document.addEventListener("focusin", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const rect = card.getBoundingClientRect();
    showTooltip(card, rect.left + rect.width / 2, rect.top);
  });

  document.addEventListener("focusout", (e) => {
    if (!e.target.closest?.(".card")) return;
    hideTooltip();
  });
}

function init() {
  if (!window.RELIC_CATALOG?.relics?.length) {
    console.warn("[wiki] catalog missing — check site/catalog.js");
  }

  setupTabs();
  setupFilters();
  setupTooltips();
  renderFilters();
  renderRelicGrid();
  renderAscended();
  renderBoosts();

  const initial = location.hash.replace(/^#/, "") || "start";
  showTab(initial);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
