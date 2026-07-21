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
    summary: "Take less damage from hits.",
    tiers: [
      "I — Take 15% less damage",
      "II — Take 25% less damage",
      "III — Take 35% less damage",
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
    summary: "Each ore block can burst into a much larger drop.",
    tiers: [
      "I — 30% chance for 3× ore from that block",
      "II — 45% chance for 6× ore from that block",
      "III — 50% chance for 12× ore from that block",
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
