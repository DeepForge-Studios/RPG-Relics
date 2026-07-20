/** Shared Affinity Codex copy + labels (kept out of hooks.js to keep UI opens light). */

import { BoostInk } from "./theme.js";

export const BOOST_ORDER = ["might", "ward", "gale", "fortune", "vitality", "alchemy"];

/** Affinity class display names ("Berserker Affinity II"). */
export const BOOST_LABELS = {
  might: "Berserker",
  ward: "Guardian",
  gale: "Scout",
  fortune: "Trickster",
  vitality: "Healer",
  alchemy: "Arcanist",
};

/**
 * Affinity I–III — kept in sync with BP/scripts/hooks.js resonance numbers.
 * Tuned so rank I feels useful, II is a clear step, III is a payoff (not OP).
 */
export const BOOST_ABILITIES = {
  might: {
    color: BoostInk.might,
    summary: "Stack hits to deal crushing echo damage.",
    tiers: [
      "I — Every 5 hits, +2 bonus damage",
      "II — Every 4 hits, +3 bonus damage",
      "III — Every 3 hits, +5 bonus damage",
    ],
  },
  ward: {
    color: BoostInk.ward,
    summary: "Chance to deflect incoming attacks.",
    tiers: [
      "I — 10% deflect chance",
      "II — 16% deflect chance",
      "III — 24% deflect chance",
    ],
  },
  gale: {
    color: BoostInk.gale,
    summary: "Sprinting grants short Tailwind speed bursts.",
    tiers: [
      "I — Speed I burst while sprinting (~3s)",
      "II — Longer Speed II Tailwind (~4s)",
      "III — Tailwind + Jump Boost II (~5s)",
    ],
  },
  fortune: {
    color: BoostInk.fortune,
    summary: "Chance for extra ore when mining.",
    tiers: [
      "I — 10% bonus ore chance",
      "II — 16% bonus ore chance",
      "III — 24% bonus ore chance",
    ],
  },
  vitality: {
    color: BoostInk.vitality,
    summary: "Kills restore health.",
    tiers: [
      "I — Kills restore 1 heart",
      "II — Kills restore 2 hearts",
      "III — Kills restore 3 hearts + brief Regeneration",
    ],
  },
  alchemy: {
    color: BoostInk.alchemy,
    summary: "Drunk potions last longer — that is the whole Affinity.",
    tiers: [
      "I — Potions last 20% longer",
      "II — Potions last 35% longer",
      "III — Potions last 50% longer (duration only; no extra effects)",
    ],
  },
};
