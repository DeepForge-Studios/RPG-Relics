/** Shared Boost Codex copy + labels (kept out of hooks.js to keep UI opens light). */
import { BoostInk } from "./theme.js";

export const BOOST_ORDER = ["might", "ward", "gale", "fortune", "vitality", "alchemy"];

export const BOOST_LABELS = {
  might: "Might",
  ward: "Ward",
  gale: "Gale",
  fortune: "Fortune",
  vitality: "Vitality",
  alchemy: "Alchemy",
};

export const BOOST_ABILITIES = {
  might: {
    color: BoostInk.might,
    summary: "Stack hits to deal crushing echo damage.",
    tiers: [
      "I — Every 5 hits, +2 bonus damage",
      "II — Every 4 hits, +3 bonus damage",
      "III — Every 3 hits, +4 bonus damage",
    ],
  },
  ward: {
    color: BoostInk.ward,
    summary: "Chance to deflect incoming attacks.",
    tiers: [
      "I — 8% deflect chance",
      "II — 14% deflect chance",
      "III — 20% deflect chance",
    ],
  },
  gale: {
    color: BoostInk.gale,
    summary: "Sprinting grants short Tailwind speed bursts.",
    tiers: [
      "I — Speed burst while sprinting",
      "II — Longer / stronger Tailwind",
      "III — Tailwind + Jump Boost",
    ],
  },
  fortune: {
    color: BoostInk.fortune,
    summary: "Chance for extra ore when mining.",
    tiers: [
      "I — 6% bonus ore chance",
      "II — 12% bonus ore chance",
      "III — 20% bonus ore chance",
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
    summary: "Drunk potions last longer.",
    tiers: [
      "I — Potions last 15% longer",
      "II — Potions last 30% longer",
      "III — Potions last 50% longer",
    ],
  },
};
