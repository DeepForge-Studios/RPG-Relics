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

const TIER_ORDER = ["common", "uncommon", "rare", "ascended"];

const CHAPTERS = {
  "ch-1": "Chapter 1 · Start",
  "ch-2": "Chapter 2 · Find",
  "ch-3": "Chapter 3 · Equip",
  "ch-4": "Chapter 4 · Boosts",
  "ch-5": "Chapter 5 · Attune",
  "ch-6": "Chapter 6 · Relics",
  "ch-7": "Chapter 7 · Ascended",
};

const BOOSTS = [
  {
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
    name: "Ward",
    color: "var(--ward)",
    summary: "Chance to deflect incoming attacks.",
    tiers: ["I — 8% deflect", "II — 14% deflect", "III — 20% deflect"],
  },
  {
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
    name: "Fortune",
    color: "var(--fortune)",
    summary: "Chance for extra ore when mining.",
    tiers: ["I — 6% bonus ore", "II — 12% bonus ore", "III — 20% bonus ore"],
  },
  {
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
    name: "Alchemy",
    color: "var(--alchemy)",
    summary: "Drunk potions last longer.",
    tiers: ["I — +15% duration", "II — +30% duration", "III — +50% duration"],
  },
];

const state = {
  tab: "ch-1",
  slot: "all",
  tier: "all",
  query: "",
  ascendedQuery: "",
  filterOpen: false,
};

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function iconUrl(relic) {
  const id = (relic.id || "").replace("relics:", "");
  if (!id) return "RP/textures/ui/curio_gem.png";
  if (relic.ascended) return `RP/textures/items/tiered/${id}.png`;
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
  const src = iconUrl(relic);
  return `
    <article class="card" tabindex="0"
      data-tip-title="${escapeHtml(relic.name)}"
      data-tip-body="${escapeHtml(relic.blurb)}"
      data-tip-meta="${escapeHtml((SLOT_LABELS[relic.slot] || relic.slot) + " · " + relic.tier)}"
      data-tip-icon="${escapeHtml(src)}">
      <div class="icon-well sm">
        <img src="${src}" alt="" loading="lazy"
          onerror="this.onerror=null;this.src='RP/textures/ui/curio_gem.png'" />
      </div>
      <div>
        <h3>${escapeHtml(relic.name)}</h3>
        <div class="meta">
          <span class="badge">${escapeHtml(SLOT_LABELS[relic.slot] || relic.slot)}</span>
          <span class="badge ${escapeHtml(relic.tier)}">${escapeHtml(relic.tier)}</span>
        </div>
        <p>${escapeHtml(relic.blurb)}</p>
      </div>
    </article>`;
}

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
        r.name.toLowerCase().includes(q) ||
        r.blurb.toLowerCase().includes(q) ||
        (SLOT_LABELS[r.slot] || "").toLowerCase().includes(q) ||
        r.tier.toLowerCase().includes(q)
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

function closeMobileNav() {
  document.querySelector(".sidebar")?.classList.remove("open");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (backdrop) backdrop.hidden = true;
}

function showTab(id) {
  if (!CHAPTERS[id]) id = "ch-1";
  state.tab = id;
  setFilterOpen(false);
  hideTooltip();

  document.querySelectorAll(".chapter").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === id);
  });

  document.querySelectorAll(".panel").forEach((panel) => {
    panel.hidden = panel.id !== `panel-${id}`;
  });

  const crumb = document.getElementById("crumb");
  if (crumb) crumb.textContent = CHAPTERS[id];

  const hash = `#${id}`;
  if (location.hash !== hash) history.replaceState(null, "", hash);

  closeMobileNav();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

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

function setupNav() {
  document.querySelector(".chapters")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tab]");
    if (!btn) return;
    e.preventDefault();
    showTab(btn.dataset.tab);
  });

  document.querySelectorAll(".path-link, .next-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.tab;
      if (id) showTab(id);
    });
  });

  document.querySelector(".brand")?.addEventListener("click", (e) => {
    e.preventDefault();
    showTab("ch-1");
  });

  window.addEventListener("hashchange", () => {
    showTab(location.hash.replace(/^#/, "") || "ch-1");
  });

  document.getElementById("menu-btn")?.addEventListener("click", () => {
    const side = document.querySelector(".sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    const open = !side?.classList.contains("open");
    side?.classList.toggle("open", open);
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

  document.addEventListener("click", (e) => {
    if (!state.filterOpen) return;
    const wrap = document.querySelector(".filter-wrap");
    if (wrap && !wrap.contains(e.target)) setFilterOpen(false);
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
  setupTooltips();
  renderFilters();
  renderRelicGrid();
  renderAscended();
  renderBoosts();
  showTab(location.hash.replace(/^#/, "") || "ch-1");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
