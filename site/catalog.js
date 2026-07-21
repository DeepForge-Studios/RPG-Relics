/* Generated catalog — do not edit by hand. */
window.RELIC_CATALOG = {
  "relics": [
    {
      "id": "relics:scryglass",
      "name": "Hunter's Lens",
      "icon": "textures/items/tiered/scryglass.png",
      "tier": "uncommon",
      "slot": "face",
      "ascended": false,
      "blurb": "Shows nearby mobs",
      "effect": "Shows nearby mobs",
      "relicAffinity": "fortune",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:nightseers_gaze",
        "inputs": [
          "relics:scryglass",
          "relics:lumen_visor"
        ]
      },
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "fortune",
        "alchemy"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: uncommon. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Trickster",
        "Attunement paths: Fortune, Alchemy",
        "Upgrades into: Nightseer's Gaze",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:filter_mask",
      "name": "Plague Mask",
      "icon": "textures/items/tiered/filter_mask.png",
      "tier": "uncommon",
      "slot": "face",
      "ascended": false,
      "blurb": "Blocks poison and wither",
      "effect": "Blocks poison and wither",
      "relicAffinity": "alchemy",
      "recipe": {
        "ingredients": [
          {
            "id": "relics:relic_shard",
            "count": 1
          },
          {
            "id": "relics:beast_fang",
            "count": 2
          },
          {
            "id": "minecraft:leather",
            "count": 1
          }
        ],
        "resultId": "relics:filter_mask"
      },
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:venom_ward",
        "inputs": [
          "relics:filter_mask",
          "relics:blight_vessel"
        ]
      },
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "alchemy",
        "radiance"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: uncommon. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Arcanist",
        "Attunement paths: Alchemy, Radiance",
        "Craft (Relic Forge): Arcane Dust + Beast Fang ×2 + leather",
        "Upgrades into: Venom Ward",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:lumen_visor",
      "name": "Nightwatch Goggles",
      "icon": "textures/items/tiered/lumen_visor.png",
      "tier": "common",
      "slot": "head",
      "ascended": false,
      "blurb": "Grants night vision",
      "effect": "Grants night vision",
      "relicAffinity": "alchemy",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:nightseers_gaze",
        "inputs": [
          "relics:scryglass",
          "relics:lumen_visor"
        ]
      },
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "alchemy",
        "radiance"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: common. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Arcanist",
        "Attunement paths: Alchemy, Radiance",
        "Upgrades into: Nightseer's Gaze",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:quaffers_cap",
      "name": "Feast Cap",
      "icon": "textures/items/tiered/quaffers_cap.png",
      "tier": "common",
      "slot": "head",
      "ascended": false,
      "blurb": "Slowly restores hunger",
      "effect": "Slowly restores hunger",
      "relicAffinity": "vitality",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": null,
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "vitality",
        "ward"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: common. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Healer",
        "Attunement paths: Vitality, Ward",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:gillmask",
      "name": "Tide Fin",
      "icon": "textures/items/tiered/gillmask.png",
      "tier": "common",
      "slot": "head",
      "ascended": false,
      "blurb": "Grants water breathing",
      "effect": "Grants water breathing",
      "relicAffinity": "alchemy",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:abyssal_gillchain",
        "inputs": [
          "relics:anchor_charm",
          "relics:gillmask"
        ]
      },
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "alchemy",
        "radiance"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: common. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Arcanist",
        "Attunement paths: Alchemy, Radiance",
        "Upgrades into: Abyssal Gillchain",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:fortune_tellers_cap",
      "name": "Fate Circlet",
      "icon": "textures/items/tiered/fortune_tellers_cap.png",
      "tier": "uncommon",
      "slot": "head",
      "ascended": false,
      "blurb": "Triggers on kill",
      "effect": "Triggers on kill",
      "relicAffinity": "fortune",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:soothsayers_reap",
        "inputs": [
          "relics:fortune_tellers_cap",
          "relics:reapers_hook"
        ]
      },
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "fortune",
        "alchemy"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: uncommon. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Trickster",
        "Attunement paths: Fortune, Alchemy",
        "Upgrades into: Soothsayer's Reap",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:merchants_fedora",
      "name": "Guildmaster's Hat",
      "icon": "textures/items/tiered/merchants_fedora.png",
      "tier": "common",
      "slot": "head",
      "ascended": false,
      "blurb": "Grants village hero",
      "effect": "Grants village hero",
      "relicAffinity": "fortune",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": null,
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "fortune",
        "alchemy"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: common. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Trickster",
        "Attunement paths: Fortune, Alchemy",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:anchor_charm",
      "name": "Mariner's Pendant",
      "icon": "textures/items/tiered/anchor_charm.png",
      "tier": "uncommon",
      "slot": "necklace",
      "ascended": false,
      "blurb": "Faster in water and lava",
      "effect": "Faster in water and lava",
      "relicAffinity": "gale",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:abyssal_gillchain",
        "inputs": [
          "relics:anchor_charm",
          "relics:gillmask"
        ]
      },
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "gale",
        "fortune"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: uncommon. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Scout",
        "Attunement paths: Gale, Fortune",
        "Upgrades into: Abyssal Gillchain",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:ward_pendant",
      "name": "Aegis Locket",
      "icon": "textures/items/tiered/ward_pendant.png",
      "tier": "common",
      "slot": "necklace",
      "ascended": false,
      "blurb": "Triggers when hurt",
      "effect": "Triggers when hurt",
      "relicAffinity": "ward",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:sanguine_heartguard",
        "inputs": [
          "relics:heartstone",
          "relics:ward_pendant"
        ]
      },
      "blockedSkills": [
        "bastion_glyph"
      ],
      "allowedAttuneGroups": [
        "ward",
        "radiance"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: common. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Guardian",
        "Attunement paths: Ward, Radiance",
        "Blocked skills: bastion glyph",
        "Upgrades into: Sanguine Heartguard",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:ember_locket",
      "name": "Twinstone Locket",
      "icon": "textures/items/tiered/ember_locket.png",
      "tier": "uncommon",
      "slot": "necklace",
      "ascended": false,
      "blurb": "Triggers on attack",
      "effect": "Triggers on attack",
      "relicAffinity": "might",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:inferno_brand",
        "inputs": [
          "relics:ember_locket",
          "relics:cinderfist"
        ]
      },
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "might",
        "necromancy"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: uncommon. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Berserker",
        "Attunement paths: Might, Necromancy",
        "Upgrades into: Inferno Brand",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:adrenaline_charm",
      "name": "Rush Cord",
      "icon": "textures/items/tiered/adrenaline_charm.png",
      "tier": "common",
      "slot": "necklace",
      "ascended": false,
      "blurb": "Triggers when hurt",
      "effect": "Triggers when hurt",
      "relicAffinity": "ward",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": null,
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "ward",
        "radiance"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: common. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Guardian",
        "Attunement paths: Ward, Radiance",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:prospectors_scarf",
      "name": "Guildweaver's Cord",
      "icon": "textures/items/tiered/prospectors_scarf.png",
      "tier": "common",
      "slot": "necklace",
      "ascended": false,
      "blurb": "Grants haste",
      "effect": "Grants haste",
      "relicAffinity": "fortune",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": null,
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "fortune",
        "alchemy"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: common. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Trickster",
        "Attunement paths: Fortune, Alchemy",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:phantom_veil",
      "name": "Ghost Shroud",
      "icon": "textures/items/tiered/phantom_veil.png",
      "tier": "uncommon",
      "slot": "necklace",
      "ascended": false,
      "blurb": "Grants invisibility",
      "effect": "Grants invisibility",
      "relicAffinity": "alchemy",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": null,
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "alchemy",
        "radiance"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: uncommon. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Arcanist",
        "Attunement paths: Alchemy, Radiance",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:storm_locket",
      "name": "Tempest Locket",
      "icon": "textures/items/tiered/storm_locket.png",
      "tier": "uncommon",
      "slot": "necklace",
      "ascended": false,
      "blurb": "Triggers on attack",
      "effect": "Triggers on attack",
      "relicAffinity": "might",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:tempest_choker",
        "inputs": [
          "relics:storm_locket",
          "relics:marrow_choker"
        ]
      },
      "blockedSkills": [
        "thunderbrand"
      ],
      "allowedAttuneGroups": [
        "might",
        "necromancy"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: uncommon. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Berserker",
        "Attunement paths: Might, Necromancy",
        "Blocked skills: thunderbrand",
        "Upgrades into: Tempest Choker",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:bramble_charm",
      "name": "Briar Charm",
      "icon": "textures/items/tiered/bramble_charm.png",
      "tier": "common",
      "slot": "necklace",
      "ascended": false,
      "blurb": "Triggers when hurt",
      "effect": "Triggers when hurt",
      "relicAffinity": "ward",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:thornroot_ward",
        "inputs": [
          "relics:bramble_charm",
          "relics:rootgrip_boots"
        ]
      },
      "blockedSkills": [
        "oathchain",
        "quillguard"
      ],
      "allowedAttuneGroups": [
        "ward",
        "radiance"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: common. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Guardian",
        "Attunement paths: Ward, Radiance",
        "Blocked skills: oathchain, quillguard",
        "Upgrades into: Thornroot Ward",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:marrow_choker",
      "name": "Marrow Choker",
      "icon": "textures/items/tiered/marrow_choker.png",
      "tier": "rare",
      "slot": "necklace",
      "ascended": false,
      "blurb": "Triggers on attack",
      "effect": "Triggers on attack",
      "relicAffinity": "might",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:tempest_choker",
        "inputs": [
          "relics:storm_locket",
          "relics:marrow_choker"
        ]
      },
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "might",
        "necromancy"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: rare. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Berserker",
        "Attunement paths: Might, Necromancy",
        "Upgrades into: Tempest Choker",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:haste_band",
      "name": "Miner's Ring",
      "icon": "textures/items/tiered/haste_band.png",
      "tier": "uncommon",
      "slot": "ring",
      "ascended": false,
      "blurb": "Chance for bonus ore",
      "effect": "Chance for bonus ore",
      "relicAffinity": "fortune",
      "recipe": {
        "ingredients": [
          {
            "id": "relics:relic_shard",
            "count": 2
          },
          {
            "id": "relics:silver_fragment",
            "count": 2
          },
          {
            "id": "minecraft:redstone",
            "count": 1
          }
        ],
        "resultId": "relics:haste_band"
      },
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:veinheart_gauntlets",
        "inputs": [
          "relics:haste_band",
          "relics:excavator_gauntlets"
        ]
      },
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "fortune",
        "alchemy"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: uncommon. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Trickster",
        "Attunement paths: Fortune, Alchemy",
        "Craft (Relic Forge): Arcane Dust ×2 + Silver Fragment ×2 + redstone",
        "Upgrades into: Veinheart Gauntlets",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:vital_band",
      "name": "Heartward Ring",
      "icon": "textures/items/tiered/vital_band.png",
      "tier": "rare",
      "slot": "ring",
      "ascended": false,
      "blurb": "Heals you when low",
      "effect": "Heals you when low",
      "relicAffinity": "vitality",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:vital_bloom",
        "inputs": [
          "relics:bloom_band",
          "relics:vital_band"
        ]
      },
      "blockedSkills": [
        "heartforge"
      ],
      "allowedAttuneGroups": [
        "vitality",
        "ward"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: rare. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Healer",
        "Attunement paths: Vitality, Ward",
        "Blocked skills: heartforge",
        "Upgrades into: Vital Bloom",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:bloom_band",
      "name": "Bloom Band",
      "icon": "textures/items/tiered/bloom_band.png",
      "tier": "common",
      "slot": "ring",
      "ascended": false,
      "blurb": "Grants regeneration",
      "effect": "Grants regeneration",
      "relicAffinity": "vitality",
      "recipe": {
        "ingredients": [
          {
            "id": "relics:relic_shard",
            "count": 2
          },
          {
            "id": "relics:mystic_herb",
            "count": 2
          },
          {
            "id": "minecraft:gold_nugget",
            "count": 1
          }
        ],
        "resultId": "relics:bloom_band"
      },
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:vital_bloom",
        "inputs": [
          "relics:bloom_band",
          "relics:vital_band"
        ]
      },
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "vitality",
        "ward"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: common. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Healer",
        "Attunement paths: Vitality, Ward",
        "Craft (Relic Forge): Arcane Dust ×2 + Mystic Herb ×2 + gold nugget",
        "Upgrades into: Vital Bloom",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:draught_band",
      "name": "Alchemist's Loop",
      "icon": "textures/items/tiered/draught_band.png",
      "tier": "uncommon",
      "slot": "ring",
      "ascended": false,
      "blurb": "Potions last longer",
      "effect": "Potions last longer",
      "relicAffinity": "alchemy",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:alchemists_focus",
        "inputs": [
          "relics:purifying_flask",
          "relics:draught_band"
        ]
      },
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "alchemy",
        "radiance"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: uncommon. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Arcanist",
        "Attunement paths: Alchemy, Radiance",
        "Upgrades into: Alchemist's Focus",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:lucky_talisman",
      "name": "Executioner's Sigil",
      "icon": "textures/items/tiered/lucky_talisman.png",
      "tier": "rare",
      "slot": "charm",
      "ascended": false,
      "blurb": "Extra damage to weak foes",
      "effect": "Extra damage to weak foes",
      "relicAffinity": "might",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:executioners_phantom",
        "inputs": [
          "relics:lucky_talisman",
          "relics:shrink_charm"
        ]
      },
      "blockedSkills": [
        "thanatoic_ledger"
      ],
      "allowedAttuneGroups": [
        "might",
        "necromancy"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: rare. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Berserker",
        "Attunement paths: Might, Necromancy",
        "Blocked skills: thanatoic ledger",
        "Upgrades into: Executioner's Phantom",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:shrink_charm",
      "name": "Phase Pearl",
      "icon": "textures/items/tiered/shrink_charm.png",
      "tier": "rare",
      "slot": "charm",
      "ascended": false,
      "blurb": "Chance to dodge hits",
      "effect": "Chance to dodge hits",
      "relicAffinity": "ward",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:executioners_phantom",
        "inputs": [
          "relics:lucky_talisman",
          "relics:shrink_charm"
        ]
      },
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "ward",
        "radiance"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: rare. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Guardian",
        "Attunement paths: Ward, Radiance",
        "Upgrades into: Executioner's Phantom",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:cloud_cape",
      "name": "Cloud Plume",
      "icon": "textures/items/tiered/cloud_cape.png",
      "tier": "rare",
      "slot": "back",
      "ascended": false,
      "blurb": "Double jump",
      "effect": "Double jump",
      "relicAffinity": "gale",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:nimbus_mantle",
        "inputs": [
          "relics:cloud_cape",
          "relics:cloud_vial"
        ]
      },
      "blockedSkills": [
        "tempest_tithe",
        "gale_anchor"
      ],
      "allowedAttuneGroups": [
        "gale",
        "fortune"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: rare. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Scout",
        "Attunement paths: Gale, Fortune",
        "Blocked skills: tempest tithe, gale anchor",
        "Upgrades into: Nimbus Mantle",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:stratos_pack",
      "name": "Windrunner Pack",
      "icon": "textures/items/tiered/stratos_pack.png",
      "tier": "rare",
      "slot": "back",
      "ascended": false,
      "blurb": "Sneak midair to glide",
      "effect": "Sneak midair to glide",
      "relicAffinity": "gale",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:gale_aegis",
        "inputs": [
          "relics:stratos_pack",
          "relics:skybound_charm"
        ]
      },
      "blockedSkills": [
        "tempest_tithe",
        "gale_anchor"
      ],
      "allowedAttuneGroups": [
        "gale",
        "fortune"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: rare. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Scout",
        "Attunement paths: Gale, Fortune",
        "Blocked skills: tempest tithe, gale anchor",
        "Upgrades into: Gale Aegis",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:crystal_harness",
      "name": "Prism Gem",
      "icon": "textures/items/tiered/crystal_harness.png",
      "tier": "rare",
      "slot": "body",
      "ascended": false,
      "blurb": "Hurts foes when you're hit",
      "effect": "Hurts foes when you're hit",
      "relicAffinity": "ward",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": null,
      "blockedSkills": [
        "oathchain",
        "quillguard"
      ],
      "allowedAttuneGroups": [
        "ward",
        "radiance"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: rare. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Guardian",
        "Attunement paths: Ward, Radiance",
        "Blocked skills: oathchain, quillguard",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:obsidian_plate",
      "name": "Obsidian Aegis",
      "icon": "textures/items/tiered/obsidian_plate.png",
      "tier": "rare",
      "slot": "body",
      "ascended": false,
      "blurb": "Fire Resistance while worn",
      "effect": "Fire Resistance while worn",
      "relicAffinity": "ward",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:bulwark_plate",
        "inputs": [
          "relics:obsidian_plate",
          "relics:cinder_ward"
        ]
      },
      "blockedSkills": [
        "bastion_glyph"
      ],
      "allowedAttuneGroups": [
        "ward",
        "radiance"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: rare. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Guardian",
        "Attunement paths: Ward, Radiance",
        "Blocked skills: bastion glyph",
        "Upgrades into: Bulwark Plate",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:purifying_flask",
      "name": "Antidote Flask",
      "icon": "textures/items/tiered/purifying_flask.png",
      "tier": "uncommon",
      "slot": "belt",
      "ascended": false,
      "blurb": "Shortens bad effects",
      "effect": "Shortens bad effects",
      "relicAffinity": "alchemy",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:alchemists_focus",
        "inputs": [
          "relics:purifying_flask",
          "relics:draught_band"
        ]
      },
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "alchemy",
        "radiance"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: uncommon. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Arcanist",
        "Attunement paths: Alchemy, Radiance",
        "Upgrades into: Alchemist's Focus",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:zephyr_flask",
      "name": "Hare's Bounding Sash",
      "icon": "textures/items/tiered/zephyr_flask.png",
      "tier": "common",
      "slot": "belt",
      "ascended": false,
      "blurb": "Grants jump boost",
      "effect": "Grants jump boost",
      "relicAffinity": "gale",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": null,
      "blockedSkills": [
        "tempest_tithe"
      ],
      "allowedAttuneGroups": [
        "gale",
        "fortune"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: common. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Scout",
        "Attunement paths: Gale, Fortune",
        "Blocked skills: tempest tithe",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:heartstone",
      "name": "Bloodheart Stone",
      "icon": "textures/items/tiered/heartstone.png",
      "tier": "uncommon",
      "slot": "belt",
      "ascended": false,
      "blurb": "Grants health boost",
      "effect": "Grants health boost",
      "relicAffinity": "vitality",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:sanguine_heartguard",
        "inputs": [
          "relics:heartstone",
          "relics:ward_pendant"
        ]
      },
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "vitality",
        "ward"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: uncommon. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Healer",
        "Attunement paths: Vitality, Ward",
        "Upgrades into: Sanguine Heartguard",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:skybound_charm",
      "name": "Drift Feather",
      "icon": "textures/items/tiered/skybound_charm.png",
      "tier": "common",
      "slot": "belt",
      "ascended": false,
      "blurb": "Grants slow falling",
      "effect": "Grants slow falling",
      "relicAffinity": "gale",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:gale_aegis",
        "inputs": [
          "relics:stratos_pack",
          "relics:skybound_charm"
        ]
      },
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "gale",
        "fortune"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: common. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Scout",
        "Attunement paths: Gale, Fortune",
        "Upgrades into: Gale Aegis",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:cinder_ward",
      "name": "Emberflare Girdle",
      "icon": "textures/items/tiered/cinder_ward.png",
      "tier": "uncommon",
      "slot": "belt",
      "ascended": false,
      "blurb": "Triggers when hurt",
      "effect": "Triggers when hurt",
      "relicAffinity": "ward",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:bulwark_plate",
        "inputs": [
          "relics:obsidian_plate",
          "relics:cinder_ward"
        ]
      },
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "ward",
        "radiance"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: uncommon. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Guardian",
        "Attunement paths: Ward, Radiance",
        "Upgrades into: Bulwark Plate",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:magnetic_sash",
      "name": "Lodestone Charm",
      "icon": "textures/items/tiered/magnetic_sash.png",
      "tier": "uncommon",
      "slot": "belt",
      "ascended": false,
      "blurb": "Pulls nearby items",
      "effect": "Pulls nearby items",
      "relicAffinity": "fortune",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:treasure_lure",
        "inputs": [
          "relics:gilt_hook",
          "relics:magnetic_sash"
        ]
      },
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "fortune",
        "alchemy"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: uncommon. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Trickster",
        "Attunement paths: Fortune, Alchemy",
        "Upgrades into: Treasure Lure",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:blight_vessel",
      "name": "Ashen Vessel",
      "icon": "textures/items/tiered/blight_vessel.png",
      "tier": "uncommon",
      "slot": "belt",
      "ascended": false,
      "blurb": "Clears Wither",
      "effect": "Clears Wither",
      "relicAffinity": "alchemy",
      "recipe": {
        "ingredients": [
          {
            "id": "relics:monster_heart",
            "count": 1
          },
          {
            "id": "relics:arcane_dust",
            "count": 2
          },
          {
            "id": "relics:relic_shard",
            "count": 2
          }
        ],
        "resultId": "relics:blight_vessel"
      },
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:venom_ward",
        "inputs": [
          "relics:filter_mask",
          "relics:blight_vessel"
        ]
      },
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "alchemy",
        "radiance"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: uncommon. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Arcanist",
        "Attunement paths: Alchemy, Radiance",
        "Craft (Relic Forge): Monster Heart + Arcane Gem ×2 + Arcane Dust ×2",
        "Upgrades into: Venom Ward",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:cloud_vial",
      "name": "Puff Bottle",
      "icon": "textures/items/tiered/cloud_vial.png",
      "tier": "common",
      "slot": "belt",
      "ascended": false,
      "blurb": "Double jump",
      "effect": "Double jump",
      "relicAffinity": "gale",
      "recipe": {
        "ingredients": [
          {
            "id": "relics:arcane_dust",
            "count": 2
          },
          {
            "id": "minecraft:glass_bottle",
            "count": 1
          },
          {
            "id": "minecraft:phantom_membrane",
            "count": 1
          }
        ],
        "resultId": "relics:cloud_vial"
      },
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:nimbus_mantle",
        "inputs": [
          "relics:cloud_cape",
          "relics:cloud_vial"
        ]
      },
      "blockedSkills": [
        "tempest_tithe",
        "gale_anchor"
      ],
      "allowedAttuneGroups": [
        "gale",
        "fortune"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: common. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Scout",
        "Attunement paths: Gale, Fortune",
        "Blocked skills: tempest tithe, gale anchor",
        "Craft (Relic Forge): Arcane Gem ×2 + glass bottle + phantom membrane",
        "Upgrades into: Nimbus Mantle",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:excavator_gauntlets",
      "name": "Delver's Warbrace",
      "icon": "textures/items/tiered/excavator_gauntlets.png",
      "tier": "common",
      "slot": "hands",
      "ascended": false,
      "blurb": "Grants haste",
      "effect": "Grants haste",
      "relicAffinity": "fortune",
      "recipe": {
        "ingredients": [
          {
            "id": "relics:silver_fragment",
            "count": 3
          },
          {
            "id": "relics:relic_shard",
            "count": 2
          },
          {
            "id": "minecraft:diamond",
            "count": 1
          }
        ],
        "resultId": "relics:excavator_gauntlets"
      },
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:veinheart_gauntlets",
        "inputs": [
          "relics:haste_band",
          "relics:excavator_gauntlets"
        ]
      },
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "fortune",
        "alchemy"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: common. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Trickster",
        "Attunement paths: Fortune, Alchemy",
        "Craft (Relic Forge): Silver Fragment ×3 + Arcane Dust ×2 + diamond",
        "Upgrades into: Veinheart Gauntlets",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:fleetstrike_gloves",
      "name": "Fleetstrike Wraps",
      "icon": "textures/items/tiered/fleetstrike_gloves.png",
      "tier": "common",
      "slot": "hands",
      "ascended": false,
      "blurb": "Grants strength",
      "effect": "Grants strength",
      "relicAffinity": "alchemy",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:crimson_wargrip",
        "inputs": [
          "relics:fleetstrike_gloves",
          "relics:leeching_glove"
        ]
      },
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "alchemy",
        "radiance"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: common. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Arcanist",
        "Attunement paths: Alchemy, Radiance",
        "Upgrades into: Crimson Wargrip",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:cinderfist",
      "name": "Gold Bracer",
      "icon": "textures/items/tiered/cinderfist.png",
      "tier": "uncommon",
      "slot": "hands",
      "ascended": false,
      "blurb": "Triggers on attack",
      "effect": "Triggers on attack",
      "relicAffinity": "might",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:inferno_brand",
        "inputs": [
          "relics:ember_locket",
          "relics:cinderfist"
        ]
      },
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "might",
        "necromancy"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: uncommon. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Berserker",
        "Attunement paths: Might, Necromancy",
        "Upgrades into: Inferno Brand",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:reapers_hook",
      "name": "Wraithreaper's Hook",
      "icon": "textures/items/tiered/reapers_hook.png",
      "tier": "uncommon",
      "slot": "hands",
      "ascended": false,
      "blurb": "Triggers on kill",
      "effect": "Triggers on kill",
      "relicAffinity": "fortune",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:soothsayers_reap",
        "inputs": [
          "relics:fortune_tellers_cap",
          "relics:reapers_hook"
        ]
      },
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "fortune",
        "alchemy"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: uncommon. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Trickster",
        "Attunement paths: Fortune, Alchemy",
        "Upgrades into: Soothsayer's Reap",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:impact_knuckles",
      "name": "Skullbreaker Knuckles",
      "icon": "textures/items/tiered/impact_knuckles.png",
      "tier": "common",
      "slot": "hands",
      "ascended": false,
      "blurb": "Triggers on attack",
      "effect": "Triggers on attack",
      "relicAffinity": "might",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:warhammer_fist",
        "inputs": [
          "relics:crusher_gauntlet",
          "relics:impact_knuckles"
        ]
      },
      "blockedSkills": [
        "rivet_streak"
      ],
      "allowedAttuneGroups": [
        "might",
        "necromancy"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: common. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Berserker",
        "Attunement paths: Might, Necromancy",
        "Blocked skills: rivet streak",
        "Upgrades into: Warhammer Fist",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:crusher_gauntlet",
      "name": "Ore-Crusher Fist",
      "icon": "textures/items/tiered/crusher_gauntlet.png",
      "tier": "uncommon",
      "slot": "hands",
      "ascended": false,
      "blurb": "Triggers on attack",
      "effect": "Triggers on attack",
      "relicAffinity": "might",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:warhammer_fist",
        "inputs": [
          "relics:crusher_gauntlet",
          "relics:impact_knuckles"
        ]
      },
      "blockedSkills": [
        "scarbrand",
        "rivet_streak"
      ],
      "allowedAttuneGroups": [
        "might",
        "necromancy"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: uncommon. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Berserker",
        "Attunement paths: Might, Necromancy",
        "Blocked skills: scarbrand, rivet streak",
        "Upgrades into: Warhammer Fist",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:leeching_glove",
      "name": "Crimson Glove",
      "icon": "textures/items/tiered/leeching_glove.png",
      "tier": "uncommon",
      "slot": "hands",
      "ascended": false,
      "blurb": "Triggers on attack",
      "effect": "Triggers on attack",
      "relicAffinity": "vitality",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:crimson_wargrip",
        "inputs": [
          "relics:fleetstrike_gloves",
          "relics:leeching_glove"
        ]
      },
      "blockedSkills": [
        "blood_tithe"
      ],
      "allowedAttuneGroups": [
        "vitality",
        "ward"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: uncommon. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Healer",
        "Attunement paths: Vitality, Ward",
        "Blocked skills: blood tithe",
        "Upgrades into: Crimson Wargrip",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:gilt_hook",
      "name": "Gilded Angler",
      "icon": "textures/items/tiered/gilt_hook.png",
      "tier": "uncommon",
      "slot": "hands",
      "ascended": false,
      "blurb": "Extra fishing loot",
      "effect": "Extra fishing loot",
      "relicAffinity": "fortune",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:treasure_lure",
        "inputs": [
          "relics:gilt_hook",
          "relics:magnetic_sash"
        ]
      },
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "fortune",
        "alchemy"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: uncommon. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Trickster",
        "Attunement paths: Fortune, Alchemy",
        "Upgrades into: Treasure Lure",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:tidewalkers",
      "name": "Tide Striders",
      "icon": "textures/items/tiered/tidewalkers.png",
      "tier": "uncommon",
      "slot": "feet",
      "ascended": false,
      "blurb": "Walk on water and lava",
      "effect": "Walk on water and lava",
      "relicAffinity": "gale",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:leviathan_striders",
        "inputs": [
          "relics:tidewalkers",
          "relics:finfoot_boots"
        ]
      },
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "gale",
        "fortune"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: uncommon. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Scout",
        "Attunement paths: Gale, Fortune",
        "Upgrades into: Leviathan Striders",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:springheel_boots",
      "name": "Spring Boots",
      "icon": "textures/items/tiered/springheel_boots.png",
      "tier": "common",
      "slot": "feet",
      "ascended": false,
      "blurb": "No fall damage",
      "effect": "No fall damage",
      "relicAffinity": "gale",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:windsprint_greaves",
        "inputs": [
          "relics:springheel_boots",
          "relics:marathoners_treads"
        ]
      },
      "blockedSkills": [
        "tempest_tithe"
      ],
      "allowedAttuneGroups": [
        "gale",
        "fortune"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: common. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Scout",
        "Attunement paths: Gale, Fortune",
        "Blocked skills: tempest tithe",
        "Upgrades into: Windsprint Greaves",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:finfoot_boots",
      "name": "Riptide Boots",
      "icon": "textures/items/tiered/finfoot_boots.png",
      "tier": "uncommon",
      "slot": "feet",
      "ascended": false,
      "blurb": "Strong swim boost",
      "effect": "Strong swim boost",
      "relicAffinity": "gale",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:leviathan_striders",
        "inputs": [
          "relics:tidewalkers",
          "relics:finfoot_boots"
        ]
      },
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "gale",
        "fortune"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: uncommon. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Scout",
        "Attunement paths: Gale, Fortune",
        "Upgrades into: Leviathan Striders",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:featherpad_boots",
      "name": "Softstep Boots",
      "icon": "textures/items/tiered/featherpad_boots.png",
      "tier": "common",
      "slot": "feet",
      "ascended": false,
      "blurb": "Keeps creepers back",
      "effect": "Keeps creepers back",
      "relicAffinity": "ward",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": null,
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "ward",
        "radiance"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: common. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Guardian",
        "Attunement paths: Ward, Radiance",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:marathoners_treads",
      "name": "Wayfarer's Shoes",
      "icon": "textures/items/tiered/marathoners_treads.png",
      "tier": "common",
      "slot": "feet",
      "ascended": false,
      "blurb": "Grants speed",
      "effect": "Grants speed",
      "relicAffinity": "gale",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:windsprint_greaves",
        "inputs": [
          "relics:springheel_boots",
          "relics:marathoners_treads"
        ]
      },
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "gale",
        "fortune"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: common. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Scout",
        "Attunement paths: Gale, Fortune",
        "Upgrades into: Windsprint Greaves",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:rootgrip_boots",
      "name": "Earth Boots",
      "icon": "textures/items/tiered/rootgrip_boots.png",
      "tier": "uncommon",
      "slot": "feet",
      "ascended": false,
      "blurb": "Less knockback",
      "effect": "Less knockback",
      "relicAffinity": "ward",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": {
        "resultId": "relics:thornroot_ward",
        "inputs": [
          "relics:bramble_charm",
          "relics:rootgrip_boots"
        ]
      },
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "ward",
        "radiance"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: uncommon. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Guardian",
        "Attunement paths: Ward, Radiance",
        "Upgrades into: Thornroot Ward",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:jesters_cushion",
      "name": "Fool's Whoopee Charm",
      "icon": "textures/items/tiered/jesters_cushion.png",
      "tier": "common",
      "slot": "any",
      "ascended": false,
      "blurb": "Makes silly sounds sometimes",
      "effect": "Makes silly sounds sometimes",
      "relicAffinity": "alchemy",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": null,
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "alchemy",
        "radiance"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: common. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Arcanist",
        "Attunement paths: Alchemy, Radiance",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:endless_ration",
      "name": "Endless Ration",
      "icon": "textures/items/tiered/endless_ration.png",
      "tier": "rare",
      "slot": "held",
      "ascended": false,
      "blurb": "Hold to eat. Short recharge after.",
      "effect": "Hold to eat. Short recharge after.",
      "relicAffinity": "alchemy",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": null,
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "alchemy",
        "radiance"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: rare. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Arcanist",
        "Attunement paths: Alchemy, Radiance",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:storm_parasol",
      "name": "Storm Parasol",
      "icon": "textures/items/tiered/storm_parasol.png",
      "tier": "rare",
      "slot": "held",
      "ascended": false,
      "blurb": "Hold while airborne for Slow Falling",
      "effect": "Hold while airborne for Slow Falling",
      "relicAffinity": "alchemy",
      "recipe": null,
      "upgradeFrom": null,
      "upgradesTo": null,
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "alchemy",
        "radiance"
      ],
      "sources": [
        {
          "kind": "chests",
          "chance": {
            "surface": 0.14,
            "shallow": 0.22,
            "deep": 0.32,
            "camp": 0.6
          },
          "tierMix": {
            "rare": 0.04,
            "uncommon": 0.2688,
            "common": 0.6912
          },
          "note": "First-open container bonus. Depth-based chance; then picks a relic by tier (Loot pool: rare. When a source rolls \"any\" tier: ~72% common / ~23% uncommon / ~5% rare.)."
        },
        {
          "kind": "towers_homes",
          "chance": 0.45,
          "tierMix": {
            "uncommon": 0.2,
            "common": 0.8
          },
          "note": "Structure chests (~45% extra relic stamp; mostly common/uncommon)."
        },
        {
          "kind": "mimics",
          "chance": {
            "deepChestAmbush": 0.18,
            "campAmbush": 0.22,
            "killShard": 0.65
          },
          "note": "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot)."
        },
        {
          "kind": "archaeology",
          "chance": 0.22,
          "tierMix": {
            "uncommon": 0.14,
            "common": 0.86
          },
          "note": "Brush suspicious sand/gravel — 22% relic; mostly common."
        },
        {
          "kind": "mobs",
          "chance": 0.05,
          "tierMix": {
            "uncommon": 0.15,
            "common": 0.85
          },
          "note": "Hostile / monster family kills — 5% relic drop (+25% shard chance)."
        }
      ],
      "notes": [
        "Affinity: Arcanist",
        "Attunement paths: Alchemy, Radiance",
        "Chests: ~14% surface / 22% shallow / 32% deep / 60% camp (first open)",
        "Towers & homes: ~45% structure chest stamp",
        "Deep/camp chests can awaken as mimics; kill for shards (relics via nearby loot).",
        "Archaeology: ~22% when brushing suspicious blocks",
        "Hostile mobs: ~5% relic drop"
      ]
    },
    {
      "id": "relics:venom_ward",
      "name": "Venom Ward",
      "icon": "textures/items/tiered/venom_ward.png",
      "tier": "ascended",
      "slot": "face",
      "ascended": true,
      "blurb": "Blocks poison and wither",
      "effect": "Blocks poison and wither",
      "relicAffinity": "alchemy",
      "recipe": null,
      "upgradeFrom": {
        "inputs": [
          "relics:filter_mask",
          "relics:blight_vessel"
        ],
        "resultId": "relics:venom_ward",
        "recipeIngredients": [
          {
            "id": "relics:filter_mask",
            "count": 1
          },
          {
            "id": "relics:blight_vessel",
            "count": 1
          },
          {
            "id": "relics:monster_heart",
            "count": 1
          }
        ]
      },
      "upgradesTo": null,
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "alchemy",
        "radiance"
      ],
      "sources": [
        {
          "kind": "forge_upgrade",
          "note": "Crafted at the Relic Forge from two base relics + a catalyst material."
        }
      ],
      "notes": [
        "Affinity: Arcanist",
        "Attunement paths: Alchemy, Radiance",
        "Ascended from: Plague Mask + Ashen Vessel + Monster Heart",
        "Crafted at the Relic Forge from two base relics + a catalyst material."
      ]
    },
    {
      "id": "relics:nimbus_mantle",
      "name": "Nimbus Mantle",
      "icon": "textures/items/tiered/nimbus_mantle.png",
      "tier": "ascended",
      "slot": "back",
      "ascended": true,
      "blurb": "Triple jump",
      "effect": "Triple jump",
      "relicAffinity": "gale",
      "recipe": null,
      "upgradeFrom": {
        "inputs": [
          "relics:cloud_cape",
          "relics:cloud_vial"
        ],
        "resultId": "relics:nimbus_mantle",
        "recipeIngredients": [
          {
            "id": "relics:cloud_cape",
            "count": 1
          },
          {
            "id": "relics:cloud_vial",
            "count": 1
          },
          {
            "id": "relics:arcane_dust",
            "count": 1
          }
        ]
      },
      "upgradesTo": null,
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "gale",
        "fortune"
      ],
      "sources": [
        {
          "kind": "forge_upgrade",
          "note": "Crafted at the Relic Forge from two base relics + a catalyst material."
        }
      ],
      "notes": [
        "Affinity: Scout",
        "Attunement paths: Gale, Fortune",
        "Ascended from: Cloud Plume + Puff Bottle + Arcane Gem",
        "Crafted at the Relic Forge from two base relics + a catalyst material."
      ]
    },
    {
      "id": "relics:inferno_brand",
      "name": "Inferno Brand",
      "icon": "textures/items/tiered/inferno_brand.png",
      "tier": "ascended",
      "slot": "necklace",
      "ascended": true,
      "blurb": "Triggers on attack",
      "effect": "Triggers on attack",
      "relicAffinity": "might",
      "recipe": null,
      "upgradeFrom": {
        "inputs": [
          "relics:ember_locket",
          "relics:cinderfist"
        ],
        "resultId": "relics:inferno_brand",
        "recipeIngredients": [
          {
            "id": "relics:ember_locket",
            "count": 1
          },
          {
            "id": "relics:cinderfist",
            "count": 1
          },
          {
            "id": "relics:crimson_crystal",
            "count": 1
          }
        ]
      },
      "upgradesTo": null,
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "might",
        "necromancy"
      ],
      "sources": [
        {
          "kind": "forge_upgrade",
          "note": "Crafted at the Relic Forge from two base relics + a catalyst material."
        }
      ],
      "notes": [
        "Affinity: Berserker",
        "Attunement paths: Might, Necromancy",
        "Ascended from: Twinstone Locket + Gold Bracer + Crimson Crystal",
        "Crafted at the Relic Forge from two base relics + a catalyst material."
      ]
    },
    {
      "id": "relics:veinheart_gauntlets",
      "name": "Veinheart Gauntlets",
      "icon": "textures/items/tiered/veinheart_gauntlets.png",
      "tier": "ascended",
      "slot": "hands",
      "ascended": true,
      "blurb": "Chance for bonus ore",
      "effect": "Chance for bonus ore",
      "relicAffinity": "fortune",
      "recipe": null,
      "upgradeFrom": {
        "inputs": [
          "relics:haste_band",
          "relics:excavator_gauntlets"
        ],
        "resultId": "relics:veinheart_gauntlets",
        "recipeIngredients": [
          {
            "id": "relics:haste_band",
            "count": 1
          },
          {
            "id": "relics:excavator_gauntlets",
            "count": 1
          },
          {
            "id": "relics:silver_fragment",
            "count": 1
          }
        ]
      },
      "upgradesTo": null,
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "fortune",
        "alchemy"
      ],
      "sources": [
        {
          "kind": "forge_upgrade",
          "note": "Crafted at the Relic Forge from two base relics + a catalyst material."
        }
      ],
      "notes": [
        "Affinity: Trickster",
        "Attunement paths: Fortune, Alchemy",
        "Ascended from: Miner's Ring + Delver's Warbrace + Silver Fragment",
        "Crafted at the Relic Forge from two base relics + a catalyst material."
      ]
    },
    {
      "id": "relics:vital_bloom",
      "name": "Vital Bloom",
      "icon": "textures/items/tiered/vital_bloom.png",
      "tier": "ascended",
      "slot": "ring",
      "ascended": true,
      "blurb": "Heals you when low",
      "effect": "Heals you when low",
      "relicAffinity": "vitality",
      "recipe": null,
      "upgradeFrom": {
        "inputs": [
          "relics:bloom_band",
          "relics:vital_band"
        ],
        "resultId": "relics:vital_bloom",
        "recipeIngredients": [
          {
            "id": "relics:bloom_band",
            "count": 1
          },
          {
            "id": "relics:vital_band",
            "count": 1
          },
          {
            "id": "relics:mystic_herb",
            "count": 1
          }
        ]
      },
      "upgradesTo": null,
      "blockedSkills": [
        "heartforge",
        "dawnwell",
        "symbiotic_seed"
      ],
      "allowedAttuneGroups": [
        "vitality",
        "ward"
      ],
      "sources": [
        {
          "kind": "forge_upgrade",
          "note": "Crafted at the Relic Forge from two base relics + a catalyst material."
        }
      ],
      "notes": [
        "Affinity: Healer",
        "Attunement paths: Vitality, Ward",
        "Blocked skills: heartforge, dawnwell, symbiotic seed",
        "Ascended from: Bloom Band + Heartward Ring + Mystic Herb",
        "Crafted at the Relic Forge from two base relics + a catalyst material."
      ]
    },
    {
      "id": "relics:alchemists_focus",
      "name": "Alchemist's Focus",
      "icon": "textures/items/tiered/alchemists_focus.png",
      "tier": "ascended",
      "slot": "ring",
      "ascended": true,
      "blurb": "Purify + longer potions",
      "effect": "Purify + longer potions",
      "relicAffinity": "alchemy",
      "recipe": null,
      "upgradeFrom": {
        "inputs": [
          "relics:purifying_flask",
          "relics:draught_band"
        ],
        "resultId": "relics:alchemists_focus",
        "recipeIngredients": [
          {
            "id": "relics:purifying_flask",
            "count": 1
          },
          {
            "id": "relics:draught_band",
            "count": 1
          },
          {
            "id": "relics:arcane_dust",
            "count": 1
          }
        ]
      },
      "upgradesTo": null,
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "alchemy",
        "radiance"
      ],
      "sources": [
        {
          "kind": "forge_upgrade",
          "note": "Crafted at the Relic Forge from two base relics + a catalyst material."
        }
      ],
      "notes": [
        "Affinity: Arcanist",
        "Attunement paths: Alchemy, Radiance",
        "Ascended from: Antidote Flask + Alchemist's Loop + Arcane Gem",
        "Crafted at the Relic Forge from two base relics + a catalyst material."
      ]
    },
    {
      "id": "relics:tempest_choker",
      "name": "Tempest Choker",
      "icon": "textures/items/tiered/tempest_choker.png",
      "tier": "ascended",
      "slot": "necklace",
      "ascended": true,
      "blurb": "Triggers on attack",
      "effect": "Triggers on attack",
      "relicAffinity": "might",
      "recipe": null,
      "upgradeFrom": {
        "inputs": [
          "relics:storm_locket",
          "relics:marrow_choker"
        ],
        "resultId": "relics:tempest_choker",
        "recipeIngredients": [
          {
            "id": "relics:storm_locket",
            "count": 1
          },
          {
            "id": "relics:marrow_choker",
            "count": 1
          },
          {
            "id": "relics:crimson_crystal",
            "count": 1
          }
        ]
      },
      "upgradesTo": null,
      "blockedSkills": [
        "thunderbrand"
      ],
      "allowedAttuneGroups": [
        "might",
        "necromancy"
      ],
      "sources": [
        {
          "kind": "forge_upgrade",
          "note": "Crafted at the Relic Forge from two base relics + a catalyst material."
        }
      ],
      "notes": [
        "Affinity: Berserker",
        "Attunement paths: Might, Necromancy",
        "Blocked skills: thunderbrand",
        "Ascended from: Tempest Locket + Marrow Choker + Crimson Crystal",
        "Crafted at the Relic Forge from two base relics + a catalyst material."
      ]
    },
    {
      "id": "relics:gale_aegis",
      "name": "Gale Aegis",
      "icon": "textures/items/tiered/gale_aegis.png",
      "tier": "ascended",
      "slot": "back",
      "ascended": true,
      "blurb": "Sneak midair to glide",
      "effect": "Sneak midair to glide",
      "relicAffinity": "gale",
      "recipe": null,
      "upgradeFrom": {
        "inputs": [
          "relics:stratos_pack",
          "relics:skybound_charm"
        ],
        "resultId": "relics:gale_aegis",
        "recipeIngredients": [
          {
            "id": "relics:stratos_pack",
            "count": 1
          },
          {
            "id": "relics:skybound_charm",
            "count": 1
          },
          {
            "id": "relics:arcane_dust",
            "count": 1
          }
        ]
      },
      "upgradesTo": null,
      "blockedSkills": [
        "tempest_tithe",
        "gale_anchor"
      ],
      "allowedAttuneGroups": [
        "gale",
        "fortune"
      ],
      "sources": [
        {
          "kind": "forge_upgrade",
          "note": "Crafted at the Relic Forge from two base relics + a catalyst material."
        }
      ],
      "notes": [
        "Affinity: Scout",
        "Attunement paths: Gale, Fortune",
        "Blocked skills: tempest tithe, gale anchor",
        "Ascended from: Windrunner Pack + Drift Feather + Arcane Gem",
        "Crafted at the Relic Forge from two base relics + a catalyst material."
      ]
    },
    {
      "id": "relics:bulwark_plate",
      "name": "Bulwark Plate",
      "icon": "textures/items/tiered/bulwark_plate.png",
      "tier": "ascended",
      "slot": "body",
      "ascended": true,
      "blurb": "Fire Resistance while worn",
      "effect": "Fire Resistance while worn",
      "relicAffinity": "ward",
      "recipe": null,
      "upgradeFrom": {
        "inputs": [
          "relics:obsidian_plate",
          "relics:cinder_ward"
        ],
        "resultId": "relics:bulwark_plate",
        "recipeIngredients": [
          {
            "id": "relics:obsidian_plate",
            "count": 1
          },
          {
            "id": "relics:cinder_ward",
            "count": 1
          },
          {
            "id": "relics:silver_fragment",
            "count": 1
          }
        ]
      },
      "upgradesTo": null,
      "blockedSkills": [
        "bastion_glyph",
        "oathchain"
      ],
      "allowedAttuneGroups": [
        "ward",
        "radiance"
      ],
      "sources": [
        {
          "kind": "forge_upgrade",
          "note": "Crafted at the Relic Forge from two base relics + a catalyst material."
        }
      ],
      "notes": [
        "Affinity: Guardian",
        "Attunement paths: Ward, Radiance",
        "Blocked skills: bastion glyph, oathchain",
        "Ascended from: Obsidian Aegis + Emberflare Girdle + Silver Fragment",
        "Crafted at the Relic Forge from two base relics + a catalyst material."
      ]
    },
    {
      "id": "relics:treasure_lure",
      "name": "Treasure Lure",
      "icon": "textures/items/tiered/treasure_lure.png",
      "tier": "ascended",
      "slot": "belt",
      "ascended": true,
      "blurb": "Extra fishing loot",
      "effect": "Extra fishing loot",
      "relicAffinity": "fortune",
      "recipe": null,
      "upgradeFrom": {
        "inputs": [
          "relics:gilt_hook",
          "relics:magnetic_sash"
        ],
        "resultId": "relics:treasure_lure",
        "recipeIngredients": [
          {
            "id": "relics:gilt_hook",
            "count": 1
          },
          {
            "id": "relics:magnetic_sash",
            "count": 1
          },
          {
            "id": "relics:relic_shard",
            "count": 1
          }
        ]
      },
      "upgradesTo": null,
      "blockedSkills": [
        "gilded_rumor"
      ],
      "allowedAttuneGroups": [
        "fortune",
        "alchemy"
      ],
      "sources": [
        {
          "kind": "forge_upgrade",
          "note": "Crafted at the Relic Forge from two base relics + a catalyst material."
        }
      ],
      "notes": [
        "Affinity: Trickster",
        "Attunement paths: Fortune, Alchemy",
        "Blocked skills: gilded rumor",
        "Ascended from: Gilded Angler + Lodestone Charm + Arcane Dust",
        "Crafted at the Relic Forge from two base relics + a catalyst material."
      ]
    },
    {
      "id": "relics:soothsayers_reap",
      "name": "Soothsayer's Reap",
      "icon": "textures/items/tiered/soothsayers_reap.png",
      "tier": "ascended",
      "slot": "head",
      "ascended": true,
      "blurb": "Triggers on kill",
      "effect": "Triggers on kill",
      "relicAffinity": "fortune",
      "recipe": null,
      "upgradeFrom": {
        "inputs": [
          "relics:fortune_tellers_cap",
          "relics:reapers_hook"
        ],
        "resultId": "relics:soothsayers_reap",
        "recipeIngredients": [
          {
            "id": "relics:fortune_tellers_cap",
            "count": 1
          },
          {
            "id": "relics:reapers_hook",
            "count": 1
          },
          {
            "id": "relics:crimson_crystal",
            "count": 1
          }
        ]
      },
      "upgradesTo": null,
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "fortune",
        "alchemy"
      ],
      "sources": [
        {
          "kind": "forge_upgrade",
          "note": "Crafted at the Relic Forge from two base relics + a catalyst material."
        }
      ],
      "notes": [
        "Affinity: Trickster",
        "Attunement paths: Fortune, Alchemy",
        "Ascended from: Fate Circlet + Wraithreaper's Hook + Crimson Crystal",
        "Crafted at the Relic Forge from two base relics + a catalyst material."
      ]
    },
    {
      "id": "relics:executioners_phantom",
      "name": "Executioner's Phantom",
      "icon": "textures/items/tiered/executioners_phantom.png",
      "tier": "ascended",
      "slot": "charm",
      "ascended": true,
      "blurb": "Relic effect",
      "effect": "Relic effect",
      "relicAffinity": "alchemy",
      "recipe": null,
      "upgradeFrom": {
        "inputs": [
          "relics:lucky_talisman",
          "relics:shrink_charm"
        ],
        "resultId": "relics:executioners_phantom",
        "recipeIngredients": [
          {
            "id": "relics:lucky_talisman",
            "count": 1
          },
          {
            "id": "relics:shrink_charm",
            "count": 1
          },
          {
            "id": "relics:arcane_dust",
            "count": 1
          }
        ]
      },
      "upgradesTo": null,
      "blockedSkills": [
        "thanatoic_ledger"
      ],
      "allowedAttuneGroups": [
        "alchemy",
        "radiance"
      ],
      "sources": [
        {
          "kind": "forge_upgrade",
          "note": "Crafted at the Relic Forge from two base relics + a catalyst material."
        }
      ],
      "notes": [
        "Affinity: Arcanist",
        "Attunement paths: Alchemy, Radiance",
        "Blocked skills: thanatoic ledger",
        "Ascended from: Executioner's Sigil + Phase Pearl + Arcane Gem",
        "Crafted at the Relic Forge from two base relics + a catalyst material."
      ]
    },
    {
      "id": "relics:leviathan_striders",
      "name": "Leviathan Striders",
      "icon": "textures/items/tiered/leviathan_striders.png",
      "tier": "ascended",
      "slot": "feet",
      "ascended": true,
      "blurb": "Relic effect",
      "effect": "Relic effect",
      "relicAffinity": "gale",
      "recipe": null,
      "upgradeFrom": {
        "inputs": [
          "relics:tidewalkers",
          "relics:finfoot_boots"
        ],
        "resultId": "relics:leviathan_striders",
        "recipeIngredients": [
          {
            "id": "relics:tidewalkers",
            "count": 1
          },
          {
            "id": "relics:finfoot_boots",
            "count": 1
          },
          {
            "id": "relics:beast_fang",
            "count": 1
          }
        ]
      },
      "upgradesTo": null,
      "blockedSkills": [
        "tempest_tithe",
        "gale_anchor"
      ],
      "allowedAttuneGroups": [
        "gale",
        "fortune"
      ],
      "sources": [
        {
          "kind": "forge_upgrade",
          "note": "Crafted at the Relic Forge from two base relics + a catalyst material."
        }
      ],
      "notes": [
        "Affinity: Scout",
        "Attunement paths: Gale, Fortune",
        "Blocked skills: tempest tithe, gale anchor",
        "Ascended from: Tide Striders + Riptide Boots + Beast Fang",
        "Crafted at the Relic Forge from two base relics + a catalyst material."
      ]
    },
    {
      "id": "relics:sanguine_heartguard",
      "name": "Sanguine Heartguard",
      "icon": "textures/items/tiered/sanguine_heartguard.png",
      "tier": "ascended",
      "slot": "necklace",
      "ascended": true,
      "blurb": "Grants health boost",
      "effect": "Grants health boost",
      "relicAffinity": "ward",
      "recipe": null,
      "upgradeFrom": {
        "inputs": [
          "relics:heartstone",
          "relics:ward_pendant"
        ],
        "resultId": "relics:sanguine_heartguard",
        "recipeIngredients": [
          {
            "id": "relics:heartstone",
            "count": 1
          },
          {
            "id": "relics:ward_pendant",
            "count": 1
          },
          {
            "id": "relics:monster_heart",
            "count": 1
          }
        ]
      },
      "upgradesTo": null,
      "blockedSkills": [
        "bastion_glyph",
        "heartforge"
      ],
      "allowedAttuneGroups": [
        "ward",
        "radiance"
      ],
      "sources": [
        {
          "kind": "forge_upgrade",
          "note": "Crafted at the Relic Forge from two base relics + a catalyst material."
        }
      ],
      "notes": [
        "Affinity: Guardian",
        "Attunement paths: Ward, Radiance",
        "Blocked skills: bastion glyph, heartforge",
        "Ascended from: Bloodheart Stone + Aegis Locket + Monster Heart",
        "Crafted at the Relic Forge from two base relics + a catalyst material."
      ]
    },
    {
      "id": "relics:warhammer_fist",
      "name": "Warhammer Fist",
      "icon": "textures/items/tiered/warhammer_fist.png",
      "tier": "ascended",
      "slot": "hands",
      "ascended": true,
      "blurb": "Triggers on attack",
      "effect": "Triggers on attack",
      "relicAffinity": "might",
      "recipe": null,
      "upgradeFrom": {
        "inputs": [
          "relics:crusher_gauntlet",
          "relics:impact_knuckles"
        ],
        "resultId": "relics:warhammer_fist",
        "recipeIngredients": [
          {
            "id": "relics:crusher_gauntlet",
            "count": 1
          },
          {
            "id": "relics:impact_knuckles",
            "count": 1
          },
          {
            "id": "relics:silver_fragment",
            "count": 1
          }
        ]
      },
      "upgradesTo": null,
      "blockedSkills": [
        "scarbrand",
        "rivet_streak"
      ],
      "allowedAttuneGroups": [
        "might",
        "necromancy"
      ],
      "sources": [
        {
          "kind": "forge_upgrade",
          "note": "Crafted at the Relic Forge from two base relics + a catalyst material."
        }
      ],
      "notes": [
        "Affinity: Berserker",
        "Attunement paths: Might, Necromancy",
        "Blocked skills: scarbrand, rivet streak",
        "Ascended from: Ore-Crusher Fist + Skullbreaker Knuckles + Silver Fragment",
        "Crafted at the Relic Forge from two base relics + a catalyst material."
      ]
    },
    {
      "id": "relics:crimson_wargrip",
      "name": "Crimson Wargrip",
      "icon": "textures/items/tiered/crimson_wargrip.png",
      "tier": "ascended",
      "slot": "hands",
      "ascended": true,
      "blurb": "Grants strength",
      "effect": "Grants strength",
      "relicAffinity": "vitality",
      "recipe": null,
      "upgradeFrom": {
        "inputs": [
          "relics:fleetstrike_gloves",
          "relics:leeching_glove"
        ],
        "resultId": "relics:crimson_wargrip",
        "recipeIngredients": [
          {
            "id": "relics:fleetstrike_gloves",
            "count": 1
          },
          {
            "id": "relics:leeching_glove",
            "count": 1
          },
          {
            "id": "relics:crimson_crystal",
            "count": 1
          }
        ]
      },
      "upgradesTo": null,
      "blockedSkills": [
        "blood_tithe"
      ],
      "allowedAttuneGroups": [
        "vitality",
        "ward"
      ],
      "sources": [
        {
          "kind": "forge_upgrade",
          "note": "Crafted at the Relic Forge from two base relics + a catalyst material."
        }
      ],
      "notes": [
        "Affinity: Healer",
        "Attunement paths: Vitality, Ward",
        "Blocked skills: blood tithe",
        "Ascended from: Fleetstrike Wraps + Crimson Glove + Crimson Crystal",
        "Crafted at the Relic Forge from two base relics + a catalyst material."
      ]
    },
    {
      "id": "relics:nightseers_gaze",
      "name": "Nightseer's Gaze",
      "icon": "textures/items/tiered/nightseers_gaze.png",
      "tier": "ascended",
      "slot": "face",
      "ascended": true,
      "blurb": "Shows nearby mobs",
      "effect": "Shows nearby mobs",
      "relicAffinity": "fortune",
      "recipe": null,
      "upgradeFrom": {
        "inputs": [
          "relics:scryglass",
          "relics:lumen_visor"
        ],
        "resultId": "relics:nightseers_gaze",
        "recipeIngredients": [
          {
            "id": "relics:scryglass",
            "count": 1
          },
          {
            "id": "relics:lumen_visor",
            "count": 1
          },
          {
            "id": "relics:arcane_dust",
            "count": 1
          }
        ]
      },
      "upgradesTo": null,
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "fortune",
        "alchemy"
      ],
      "sources": [
        {
          "kind": "forge_upgrade",
          "note": "Crafted at the Relic Forge from two base relics + a catalyst material."
        }
      ],
      "notes": [
        "Affinity: Trickster",
        "Attunement paths: Fortune, Alchemy",
        "Ascended from: Hunter's Lens + Nightwatch Goggles + Arcane Gem",
        "Crafted at the Relic Forge from two base relics + a catalyst material."
      ]
    },
    {
      "id": "relics:thornroot_ward",
      "name": "Thornroot Ward",
      "icon": "textures/items/tiered/thornroot_ward.png",
      "tier": "ascended",
      "slot": "feet",
      "ascended": true,
      "blurb": "Less knockback",
      "effect": "Less knockback",
      "relicAffinity": "ward",
      "recipe": null,
      "upgradeFrom": {
        "inputs": [
          "relics:bramble_charm",
          "relics:rootgrip_boots"
        ],
        "resultId": "relics:thornroot_ward",
        "recipeIngredients": [
          {
            "id": "relics:bramble_charm",
            "count": 1
          },
          {
            "id": "relics:rootgrip_boots",
            "count": 1
          },
          {
            "id": "relics:mystic_herb",
            "count": 1
          }
        ]
      },
      "upgradesTo": null,
      "blockedSkills": [
        "oathchain",
        "quillguard"
      ],
      "allowedAttuneGroups": [
        "ward",
        "radiance"
      ],
      "sources": [
        {
          "kind": "forge_upgrade",
          "note": "Crafted at the Relic Forge from two base relics + a catalyst material."
        }
      ],
      "notes": [
        "Affinity: Guardian",
        "Attunement paths: Ward, Radiance",
        "Blocked skills: oathchain, quillguard",
        "Ascended from: Briar Charm + Earth Boots + Mystic Herb",
        "Crafted at the Relic Forge from two base relics + a catalyst material."
      ]
    },
    {
      "id": "relics:windsprint_greaves",
      "name": "Windsprint Greaves",
      "icon": "textures/items/tiered/windsprint_greaves.png",
      "tier": "ascended",
      "slot": "feet",
      "ascended": true,
      "blurb": "Grants speed",
      "effect": "Grants speed",
      "relicAffinity": "gale",
      "recipe": null,
      "upgradeFrom": {
        "inputs": [
          "relics:springheel_boots",
          "relics:marathoners_treads"
        ],
        "resultId": "relics:windsprint_greaves",
        "recipeIngredients": [
          {
            "id": "relics:springheel_boots",
            "count": 1
          },
          {
            "id": "relics:marathoners_treads",
            "count": 1
          },
          {
            "id": "relics:beast_fang",
            "count": 1
          }
        ]
      },
      "upgradesTo": null,
      "blockedSkills": [
        "tempest_tithe",
        "gale_anchor"
      ],
      "allowedAttuneGroups": [
        "gale",
        "fortune"
      ],
      "sources": [
        {
          "kind": "forge_upgrade",
          "note": "Crafted at the Relic Forge from two base relics + a catalyst material."
        }
      ],
      "notes": [
        "Affinity: Scout",
        "Attunement paths: Gale, Fortune",
        "Blocked skills: tempest tithe, gale anchor",
        "Ascended from: Spring Boots + Wayfarer's Shoes + Beast Fang",
        "Crafted at the Relic Forge from two base relics + a catalyst material."
      ]
    },
    {
      "id": "relics:abyssal_gillchain",
      "name": "Abyssal Gillchain",
      "icon": "textures/items/tiered/abyssal_gillchain.png",
      "tier": "ascended",
      "slot": "necklace",
      "ascended": true,
      "blurb": "Faster in water and lava",
      "effect": "Faster in water and lava",
      "relicAffinity": "gale",
      "recipe": null,
      "upgradeFrom": {
        "inputs": [
          "relics:anchor_charm",
          "relics:gillmask"
        ],
        "resultId": "relics:abyssal_gillchain",
        "recipeIngredients": [
          {
            "id": "relics:anchor_charm",
            "count": 1
          },
          {
            "id": "relics:gillmask",
            "count": 1
          },
          {
            "id": "relics:silver_fragment",
            "count": 1
          }
        ]
      },
      "upgradesTo": null,
      "blockedSkills": [],
      "allowedAttuneGroups": [
        "gale",
        "fortune"
      ],
      "sources": [
        {
          "kind": "forge_upgrade",
          "note": "Crafted at the Relic Forge from two base relics + a catalyst material."
        }
      ],
      "notes": [
        "Affinity: Scout",
        "Attunement paths: Gale, Fortune",
        "Ascended from: Mariner's Pendant + Tide Fin + Silver Fragment",
        "Crafted at the Relic Forge from two base relics + a catalyst material."
      ]
    }
  ],
  "slots": [
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
    "held"
  ],
  "materials": [
    {
      "id": "relics:relic_shard",
      "name": "Arcane Dust",
      "icon": "textures/items/arcane_dust.png",
      "role": "fuel",
      "blurb": "Fuel for every Attunement Forge ritual and Relic Forge crafts.",
      "sources": "Chest / structure loot tables · Mimic kills (~65%) · Hostile mob relic rolls (+25% shard) · Archaeology brush finds (~50% with relic)",
      "sourceLines": [
        "Chest / structure loot tables",
        "Mimic kills (~65%)",
        "Hostile mob relic rolls (+25% shard)",
        "Archaeology brush finds (~50% with relic)"
      ],
      "focusGroups": []
    },
    {
      "id": "relics:monster_heart",
      "name": "Monster Heart",
      "icon": "textures/items/monster_heart.png",
      "role": "focus",
      "blurb": "Forge focus / upgrade catalyst.",
      "sources": "Mob drops (~8%): zombie, husk, drowned, piglin_brute, ravager, warden · Also appears in relic tower / home / camp loot tables",
      "sourceLines": [
        "Mob drops (~8%): zombie, husk, drowned, piglin_brute, ravager, warden",
        "Also appears in relic tower / home / camp loot tables"
      ],
      "focusGroups": [
        "might",
        "ward",
        "vitality",
        "necromancy"
      ]
    },
    {
      "id": "relics:beast_fang",
      "name": "Beast Fang",
      "icon": "textures/items/beast_fang.png",
      "role": "focus",
      "blurb": "Forge focus / upgrade catalyst.",
      "sources": "Mob drops (~12%): spider, cave_spider, hoglin, ravager, warden · Also appears in relic tower / home / camp loot tables",
      "sourceLines": [
        "Mob drops (~12%): spider, cave_spider, hoglin, ravager, warden",
        "Also appears in relic tower / home / camp loot tables"
      ],
      "focusGroups": [
        "might",
        "gale",
        "fortune"
      ]
    },
    {
      "id": "relics:arcane_dust",
      "name": "Arcane Gem",
      "icon": "textures/items/relic_shard.png",
      "role": "focus",
      "blurb": "Arcane Gem — Forge focus / upgrade catalyst.",
      "sources": "Mob drops (~16%): witch, enderman, evocation_illager, shulker · Also appears in relic tower / home / camp loot tables",
      "sourceLines": [
        "Mob drops (~16%): witch, enderman, evocation_illager, shulker",
        "Also appears in relic tower / home / camp loot tables"
      ],
      "focusGroups": [
        "gale",
        "alchemy",
        "radiance"
      ]
    },
    {
      "id": "relics:silver_fragment",
      "name": "Silver Fragment",
      "icon": "textures/items/silver_fragment.png",
      "role": "focus",
      "blurb": "Forge focus / upgrade catalyst.",
      "sources": "Mob drops (~12%): skeleton, stray, pillager, vindicator, zombie_villager · Also appears in relic tower / home / camp loot tables",
      "sourceLines": [
        "Mob drops (~12%): skeleton, stray, pillager, vindicator, zombie_villager",
        "Also appears in relic tower / home / camp loot tables"
      ],
      "focusGroups": [
        "ward",
        "fortune",
        "radiance"
      ]
    },
    {
      "id": "relics:crimson_crystal",
      "name": "Crimson Crystal",
      "icon": "textures/items/crimson_crystal.png",
      "role": "focus",
      "blurb": "Forge focus / upgrade catalyst.",
      "sources": "Mob drops (~10%): creeper, blaze, magma_cube, wither_skeleton · Also appears in relic tower / home / camp loot tables",
      "sourceLines": [
        "Mob drops (~10%): creeper, blaze, magma_cube, wither_skeleton",
        "Also appears in relic tower / home / camp loot tables"
      ],
      "focusGroups": [
        "necromancy"
      ]
    },
    {
      "id": "relics:mystic_herb",
      "name": "Mystic Herb",
      "icon": "textures/items/mystic_herb.png",
      "role": "focus",
      "blurb": "Forge focus / upgrade catalyst. Gathered from plants.",
      "sources": "Breaking plants (~12%): grass, tall_grass, fern, large_fern, dandelion, poppy, blue_orchid, allium, … · Relic tower & home chests",
      "sourceLines": [
        "Breaking plants (~12%): grass, tall_grass, fern, large_fern, dandelion, poppy, blue_orchid, allium, …",
        "Relic tower & home chests"
      ],
      "focusGroups": [
        "vitality",
        "alchemy"
      ]
    }
  ],
  "mimics": [
    {
      "id": "relics:mimic_forest",
      "name": "Forest Mimic",
      "label": "Forest",
      "biome": "Forest",
      "biomes": [
        "forest",
        "plains",
        "meadow",
        "birch",
        "flower",
        "cherry",
        "dark_forest",
        "roofed",
        "sunflower",
        "pale_garden"
      ],
      "blurb": "Thorns dig into you! Effects: poison, slowness.",
      "attackMessage": "§2Thorns dig into you!",
      "attackEffects": [
        {
          "id": "poison",
          "duration": 60,
          "amplifier": 0
        },
        {
          "id": "slowness",
          "duration": 40,
          "amplifier": 0
        }
      ],
      "loot": "Defeat for Relic Shards (~65%) and nearby structure relic loot.",
      "texture": "textures/entity/mimic_forest.png",
      "icon": "textures/entity/mimic_forest.png"
    },
    {
      "id": "relics:mimic_desert",
      "name": "Desert Mimic",
      "label": "Desert",
      "biome": "Desert",
      "biomes": [
        "desert",
        "beach",
        "warm_ocean",
        "deep_warm"
      ],
      "blurb": "A dry heat drains your strength! Effects: hunger, weakness.",
      "attackMessage": "§eA dry heat drains your strength!",
      "attackEffects": [
        {
          "id": "hunger",
          "duration": 100,
          "amplifier": 1
        },
        {
          "id": "weakness",
          "duration": 60,
          "amplifier": 0
        }
      ],
      "loot": "Defeat for Relic Shards (~65%) and nearby structure relic loot.",
      "texture": "textures/entity/mimic_desert.png",
      "icon": "textures/entity/mimic_desert.png"
    },
    {
      "id": "relics:mimic_badlands",
      "name": "Badlands Mimic",
      "label": "Badlands",
      "biome": "Badlands",
      "biomes": [
        "mesa",
        "badlands",
        "eroded",
        "savanna",
        "savanna_mutated"
      ],
      "blurb": "Scorching clay sears you! Effects: weakness; sets you on fire (4s).",
      "attackMessage": "§cScorching clay sears you!",
      "attackEffects": [
        {
          "id": "weakness",
          "duration": 40,
          "amplifier": 0
        }
      ],
      "setOnFireSeconds": 4,
      "loot": "Defeat for Relic Shards (~65%) and nearby structure relic loot.",
      "texture": "textures/entity/mimic_badlands.png",
      "icon": "textures/entity/mimic_badlands.png"
    },
    {
      "id": "relics:mimic_snow",
      "name": "Snow Mimic",
      "label": "Snow",
      "biome": "Snow",
      "biomes": [
        "snow",
        "ice",
        "frozen",
        "cold",
        "grove",
        "jagged",
        "stony_peaks"
      ],
      "blurb": "Frostbite numbs your limbs! Effects: slowness, mining fatigue.",
      "attackMessage": "§bFrostbite numbs your limbs!",
      "attackEffects": [
        {
          "id": "slowness",
          "duration": 80,
          "amplifier": 1
        },
        {
          "id": "mining_fatigue",
          "duration": 60,
          "amplifier": 0
        }
      ],
      "loot": "Defeat for Relic Shards (~65%) and nearby structure relic loot.",
      "texture": "textures/entity/mimic_snow.png",
      "icon": "textures/entity/mimic_snow.png"
    },
    {
      "id": "relics:mimic_swamp",
      "name": "Swamp Mimic",
      "label": "Swamp",
      "biome": "Swamp",
      "biomes": [
        "swamp",
        "mangrove",
        "marsh"
      ],
      "blurb": "Bog venom saturates the wound! Effects: poison, nausea.",
      "attackMessage": "§2Bog venom saturates the wound!",
      "attackEffects": [
        {
          "id": "poison",
          "duration": 100,
          "amplifier": 1
        },
        {
          "id": "nausea",
          "duration": 60,
          "amplifier": 0
        }
      ],
      "loot": "Defeat for Relic Shards (~65%) and nearby structure relic loot.",
      "texture": "textures/entity/mimic_swamp.png",
      "icon": "textures/entity/mimic_swamp.png"
    },
    {
      "id": "relics:mimic_jungle",
      "name": "Jungle Mimic",
      "label": "Jungle",
      "biome": "Jungle",
      "biomes": [
        "jungle",
        "bamboo",
        "sparse_jungle"
      ],
      "blurb": "Jungle venom clouds your senses! Effects: blindness, poison.",
      "attackMessage": "§aJungle venom clouds your senses!",
      "attackEffects": [
        {
          "id": "blindness",
          "duration": 40,
          "amplifier": 0
        },
        {
          "id": "poison",
          "duration": 60,
          "amplifier": 0
        }
      ],
      "loot": "Defeat for Relic Shards (~65%) and nearby structure relic loot.",
      "texture": "textures/entity/mimic_jungle.png",
      "icon": "textures/entity/mimic_jungle.png"
    }
  ],
  "skillGroups": [
    {
      "id": "might",
      "name": "Might",
      "tagline": "build pressure, then burst",
      "ink": "#FF5555",
      "focusPair": [
        "relics:monster_heart",
        "relics:beast_fang"
      ],
      "skills": [
        {
          "key": "scarbrand",
          "name": "Scarbrand",
          "kind": "mark",
          "conflict": "attack_brand",
          "summary": "Your first melee hit brands a hostile. Hit it again to break the brand for bonus damage.",
          "tiers": [
            "Breaking a brand deals bonus damage.",
            "Branded enemies burst on death, chipping nearby hostiles.",
            "Three brand breaks arm an Execute Pulse on your next hit.",
            "The Execute pulls you to the target and flings nearby hostiles away."
          ],
          "cooldown": 0,
          "when": "Melee hits. The brand lasts 8 seconds.",
          "cost": "One brand per target."
        },
        {
          "key": "rivet_streak",
          "name": "Rivet Streak",
          "kind": "combo",
          "conflict": "melee_combo",
          "summary": "Fast, consecutive hits build three Rivets. The next hit breaks them in a shockwave.",
          "tiers": [
            "The shockwave deals bonus impact damage.",
            "The shockwave also knocks enemies back.",
            "Breaking leaves a short-lived shatter disc on the ground.",
            "Enemies inside the disc are Marked Weak."
          ],
          "cooldown": 0,
          "when": "Melee hits landed within 1.5 seconds of each other.",
          "cost": "Missing the timing window resets your Rivets."
        },
        {
          "key": "cracked_rib_pact",
          "name": "Cracked-Rib Pact",
          "kind": "pact",
          "conflict": "bloodprice",
          "summary": "At low health, your next melee hit becomes a heavy Pact Slam.",
          "tiers": [
            "Dropping below half health arms the slam.",
            "The slam spends hunger to hit a wider area.",
            "The slam hits harder and reaches farther.",
            "Adds a ground burst, then 3 seconds of vulnerability."
          ],
          "cooldown": 160,
          "when": "Drop below half health — the next melee hit is a Pact Slam.",
          "cost": "8-second cooldown after the slam."
        },
        {
          "key": "warhorn_discord",
          "name": "Warhorn Discord",
          "kind": "killField",
          "conflict": "kill_field",
          "summary": "Kills sound a warhorn that weakens nearby hostiles.",
          "tiers": [
            "The horn Marks one nearby hostile Weak.",
            "The horn Marks two hostiles.",
            "The corpse leaves a 3-second discord field.",
            "The field also brands the strongest hostile with Scarbrand."
          ],
          "cooldown": 240,
          "when": "Kill a hostile while others are nearby.",
          "cost": "12-second cooldown; affects up to five hostiles."
        }
      ]
    },
    {
      "id": "ward",
      "name": "Ward",
      "tagline": "counter attacks and hold ground",
      "ink": "#5555FF",
      "focusPair": [
        "relics:silver_fragment",
        "relics:monster_heart"
      ],
      "skills": [
        {
          "key": "quillguard",
          "name": "Quillguard",
          "kind": "retaliateProjectile",
          "conflict": "hurt_projectile",
          "summary": "When a hostile hits you, a spectral arrow fires back at it.",
          "tiers": [
            "Fires one arrow back.",
            "The arrow hits harder.",
            "The arrow briefly roots the attacker in place.",
            "Fires a fan of three arrows around the attacker."
          ],
          "cooldown": 120,
          "when": "Take direct damage from a nearby hostile.",
          "cost": "6-second cooldown, shared with other counter skills."
        },
        {
          "key": "bastion_glyph",
          "name": "Bastion Glyph",
          "kind": "defenseField",
          "conflict": "defense_field",
          "summary": "A heavy hit stamps a Protection-style rune and Resistance IV under your feet.",
          "tiers": [
            "Grants Resistance IV and soaks damage while you stand inside.",
            "Hostiles crossing the rune are slowed.",
            "The rune knocks enemies outward when it expires.",
            "It also sends a counter-wave at hostiles still inside."
          ],
          "cooldown": 200,
          "when": "Take 2 or more damage in a single hit.",
          "cost": "10-second cooldown; one rune at a time."
        },
        {
          "key": "oathchain",
          "name": "Oathchain",
          "kind": "hurtEcho",
          "conflict": "hurt_echo",
          "summary": "The first hostile to hurt you becomes Oathbound, and later damage you take is partly echoed back to it.",
          "tiers": [
            "A visible tether echoes part of your damage back.",
            "The echo grows stronger.",
            "Killing the Oathbound target grants a small damage buffer.",
            "Bind two targets; the chain bursts when either dies."
          ],
          "cooldown": 300,
          "when": "The first hostile that hits you after the cooldown.",
          "cost": "15-second cooldown; one Oathbound target (two at Epic)."
        },
        {
          "key": "siege_root",
          "name": "Siege Root",
          "kind": "wardField",
          "conflict": "ward_field",
          "summary": "When you are surrounded, a ward field and Siege Ward golem hold the line.",
          "tiers": [
            "You resist knockback while inside the field.",
            "The field roots the first hostile that enters.",
            "A Siege Ward golem joins the defense.",
            "Its edge pushes back every hostile once."
          ],
          "cooldown": 400,
          "when": "Three or more hostiles within 6 blocks.",
          "cost": "20-second cooldown; the field lasts about 15 seconds."
        }
      ]
    },
    {
      "id": "gale",
      "name": "Gale",
      "tagline": "reposition through combat",
      "ink": "#55FFFF",
      "focusPair": [
        "relics:beast_fang",
        "relics:arcane_dust"
      ],
      "skills": [
        {
          "key": "crosswind_mark",
          "name": "Crosswind Mark",
          "kind": "movementMark",
          "conflict": "movement_mark",
          "summary": "Melee hits mark a hostile with wind; the next hit blasts them the way you punch.",
          "tiers": [
            "Knockback on the marked enemy follows your look.",
            "The redirect is stronger.",
            "A marked death releases a gust ring.",
            "Death passes the mark to the nearest hostile."
          ],
          "when": "Melee hits. The mark lasts 6 seconds.",
          "cost": "One wind mark per target."
        },
        {
          "key": "slipstream_cut",
          "name": "Slipstream Cut",
          "kind": "combatDash",
          "conflict": "combat_dash",
          "summary": "Sprint into a melee hit to dash straight through the target.",
          "tiers": [
            "Dash through the target.",
            "The dash leaves a wind ribbon that boosts you once.",
            "The ribbon chips one hostile it touches.",
            "You may make one extra cut midair before landing."
          ],
          "cooldown": 100,
          "when": "Land a melee hit while sprinting.",
          "cost": "5-second cooldown."
        },
        {
          "key": "tempest_tithe",
          "name": "Tempest Tithe",
          "kind": "paidLeap",
          "conflict": "paid_leap",
          "summary": "Sprint-jump to leap forward; landing releases a knockback ring.",
          "tiers": [
            "Leap forward.",
            "Landing releases a knockback ring.",
            "A second midair jump spends 1 heart for another leap.",
            "Landing leaves a 3-second storm cell that pushes hostiles out."
          ],
          "cooldown": 160,
          "when": "Jump while sprinting on the ground.",
          "cost": "8-second cooldown; costs 2 hunger."
        },
        {
          "key": "gale_anchor",
          "name": "Gale Anchor",
          "kind": "anchor",
          "conflict": "anchor_active",
          "summary": "Jump in midair to plant a wind anchor, then midair-jump again to pull to it.",
          "tiers": [
            "Plant an anchor in the air.",
            "Pulling to it releases a gust.",
            "You can bounce between two anchors.",
            "The last pull leaves a brief cyclone that draws hostiles in."
          ],
          "cooldown": 16,
          "when": "Jump while airborne to plant. Jump in the air again to pull.",
          "cost": "Short gap between plant and pull; anchors last 8 seconds."
        }
      ]
    },
    {
      "id": "fortune",
      "name": "Fortune",
      "tagline": "make visible wagers",
      "ink": "#FFAA00",
      "focusPair": [
        "relics:silver_fragment",
        "relics:beast_fang"
      ],
      "skills": [
        {
          "key": "coinspin_hex",
          "name": "Coinspin Hex",
          "kind": "fortuneFlip",
          "conflict": "fortune_flip",
          "summary": "Some melee hits flip a visible coin: heads rewards you, tails stings a little.",
          "tiers": [
            "Heads adds a bonus strike; tails makes you stumble.",
            "Three heads in a row guarantee a heavy strike.",
            "Tails leaves a mark that heals a little on your next heads.",
            "The coin flips between two hostiles, helping one and harming the other."
          ],
          "cooldown": 40,
          "when": "Melee hits; about a 1 in 4 chance to flip.",
          "cost": "2-second wait between flips."
        },
        {
          "key": "mimics_wager",
          "name": "Mimic's Wager",
          "kind": "bounty",
          "conflict": "bounty_mark",
          "summary": "Hitting a full-health hostile opens a wager: kill it in time to win a prize.",
          "tiers": [
            "Winning the wager pays a small material prize.",
            "A shorter timer, but a better prize.",
            "Strike again during the wager to go double-or-nothing.",
            "The jackpot can pay out one themed catalyst."
          ],
          "cooldown": 400,
          "when": "Your first hit on a full-health hostile.",
          "cost": "20-second cooldown; the wager lasts 10 seconds. Failing costs 2 hunger."
        },
        {
          "key": "debt_of_plenty",
          "name": "Debt of Plenty",
          "kind": "debt",
          "conflict": "fortune_debt",
          "summary": "Kills while well-fed open a hunger debt that briefly improves catalyst drops.",
          "tiers": [
            "A small debt with a small payoff.",
            "Pay the debt off early with attunement XP.",
            "A harsher debt with richer drops.",
            "A second kill during the debt can jackpot — or sting harder."
          ],
          "cooldown": 1200,
          "when": "Kill a hostile while you have at least 7 hunger drums.",
          "cost": "60-second cooldown; the debt drains hunger for 30 seconds."
        },
        {
          "key": "gilded_rumor",
          "name": "Gilded Rumor",
          "kind": "rumor",
          "conflict": "loot_duplicate",
          "summary": "Kills collect Rumors. At five, your next eligible mob drop is duplicated.",
          "tiers": [
            "Bank five Rumors, then duplicate one drop stack.",
            "Spend Rumors early for a smaller payout.",
            "The payout can include a rare catalyst.",
            "Success opens a short gold rift; touch it for one extra material."
          ],
          "when": "Hostile kills; each Rumor needs a 2-second gap.",
          "cost": "One stored payout. Never duplicates ore, relics, or boss drops."
        }
      ]
    },
    {
      "id": "vitality",
      "name": "Vitality",
      "tagline": "perform healing rituals",
      "ink": "#55FF55",
      "focusPair": [
        "relics:mystic_herb",
        "relics:monster_heart"
      ],
      "skills": [
        {
          "key": "marrow_swap",
          "name": "Marrow Swap",
          "kind": "resourceHeal",
          "conflict": "resource_heal",
          "summary": "When you drop low, hunger quickly trades into a chunk of health.",
          "tiers": [
            "Trade 2 hunger for 2 hearts.",
            "The exchange rate improves.",
            "Overdraw into empty hunger for one extra heart.",
            "Leaves a short trade rune nearby allies can also touch."
          ],
          "cooldown": 80,
          "when": "Your health falls below about 65%.",
          "cost": "Short cooldown; costs 2 hunger."
        },
        {
          "key": "blood_tithe",
          "name": "Sanguine Pact",
          "kind": "bloodTithe",
          "conflict": "heal_on_hit",
          "summary": "Spend a heart to open a crimson pact — melee hits reclaim it with clear feedback.",
          "tiers": [
            "Hits during the window refund your heart.",
            "Opening the window also clears one negative effect.",
            "Refunds past full become a small damage buffer.",
            "Creates a 4-second circle that shares small refunds with allies."
          ],
          "cooldown": 300,
          "when": "Your health falls below half.",
          "cost": "15-second cooldown; costs 1 heart (it can never kill you)."
        },
        {
          "key": "heartforge",
          "name": "Heartforge",
          "kind": "heartforge",
          "conflict": "death_save",
          "summary": "After staying unharmed for a while, your next meal forges bonus health.",
          "tiers": [
            "The meal heals extra.",
            "Extra healing past full becomes a damage buffer.",
            "Rarely, survive a lethal hit at one heart.",
            "Surviving plants a healing blossom well."
          ],
          "cooldown": 400,
          "when": "Eat food after 8 seconds without taking damage.",
          "cost": "20-second cooldown."
        },
        {
          "key": "symbiotic_seed",
          "name": "Symbiotic Seed",
          "kind": "corpseSeed",
          "conflict": "corpse_heal",
          "summary": "Some hostile deaths leave a seed: grab it now, or let it mature into something stronger.",
          "tiers": [
            "Touch the seed for a small heal.",
            "A matured seed heals more.",
            "A matured seed also pulses healing to nearby allies.",
            "It can sprout a Vine Latch that roots one hostile."
          ],
          "when": "Hostile kills; about a 1 in 4 seed chance.",
          "cost": "Up to two seeds; each expires after 12 seconds."
        }
      ]
    },
    {
      "id": "alchemy",
      "name": "Alchemy",
      "tagline": "mix colors into reactions",
      "ink": "#FF55FF",
      "focusPair": [
        "relics:arcane_dust",
        "relics:mystic_herb"
      ],
      "skills": [
        {
          "key": "witchglass_retort",
          "name": "Witchglass Retort",
          "kind": "retaliatePotion",
          "conflict": "hurt_potion",
          "summary": "When a hostile hits you, the Retort answers with a splash potion.",
          "tiers": [
            "Throws a healing splash at your feet.",
            "Throws a harming splash at the attacker.",
            "Chooses the splash based on your health.",
            "Throws both splashes at once."
          ],
          "cooldown": 160,
          "when": "Take direct damage from a hostile.",
          "cost": "8-second cooldown, shared with other counter skills."
        },
        {
          "key": "vialmark",
          "name": "Vialmark",
          "kind": "reaction",
          "conflict": "alchemy_mark",
          "summary": "Melee hits cycle three colored marks — Caustic, Frost, and Spark. Mixing two colors causes a reaction.",
          "tiers": [
            "Two different colors react for bonus damage.",
            "Opposite-color reactions hit harder.",
            "Reactions leave a short damaging puddle.",
            "Landing all three colors triggers a Discord Reaction."
          ],
          "cooldown": 40,
          "when": "Melee hits. Each mark lasts 8 seconds.",
          "cost": "One color per target; reactions have a 2-second wait."
        },
        {
          "key": "crucible_bloom",
          "name": "Crucible Bloom",
          "kind": "alchemyField",
          "conflict": "alchemy_field",
          "summary": "When you are surrounded, a crucible zone blooms underfoot and burns hostiles inside.",
          "tiers": [
            "The zone chips hostiles inside.",
            "Kills inside the zone can drop Arcane Gems.",
            "The zone lasts longer and hits harder.",
            "When it ends, it pulls marked hostiles inward once."
          ],
          "cooldown": 400,
          "when": "Three or more hostiles within 6 blocks.",
          "cost": "20-second cooldown; the zone lasts 6 seconds."
        },
        {
          "key": "phial_familiar",
          "name": "Phial Familiar",
          "kind": "temporaryHelper",
          "conflict": "temporary_familiar",
          "summary": "Taking a hit in a fight summons an orbiting phial that splashes your target.",
          "tiers": [
            "The phial throws one kind of splash.",
            "It picks a stronger color after the first throw.",
            "It shatters into a damage buffer when you take a heavy hit.",
            "It alternates two colors, triggering Vialmark reactions."
          ],
          "cooldown": 600,
          "when": "Take damage while a hostile is nearby.",
          "cost": "30-second cooldown; the phial lives 15 seconds."
        }
      ]
    },
    {
      "id": "necromancy",
      "name": "Necromancy",
      "tagline": "harvest and spend souls",
      "ink": "#AA00AA",
      "focusPair": [
        "relics:crimson_crystal",
        "relics:monster_heart"
      ],
      "skills": [
        {
          "key": "dirge_mark",
          "name": "Dirge Mark",
          "kind": "deathMark",
          "conflict": "death_mark",
          "summary": "Mark a hostile. If it dies before the mark fades, its soul bursts into nearby enemies.",
          "tiers": [
            "The death burst chips nearby hostiles.",
            "The mark spreads once to another hostile.",
            "The death leaves a 3-second grave pit.",
            "The pit raises a harmless decoy that soaks one hit."
          ],
          "cooldown": 160,
          "when": "Your first melee hit after the cooldown.",
          "cost": "8-second cooldown; the mark lasts 10 seconds."
        },
        {
          "key": "corpse_lantern",
          "name": "Corpse Lantern",
          "kind": "soulCharge",
          "conflict": "soul_charge",
          "summary": "Kills bank Soul Charges. At three, a soul nova erupts automatically.",
          "tiers": [
            "A soul nova bursts around you.",
            "The nova is larger.",
            "Uncollected lanterns become brief grave fields.",
            "If charges remain after the nova, a bone thrall may join."
          ],
          "when": "Kill to bank charges. Reaching three charges fires the nova.",
          "cost": "Holds up to three charges; lanterns expire after 10 seconds."
        },
        {
          "key": "thanatoic_ledger",
          "name": "Thanatoic Ledger",
          "kind": "execute",
          "conflict": "execute",
          "summary": "Nearby deaths fill your Ledger. At three, summon a wither-skeleton thrall army that hunts whoever you strike.",
          "tiers": [
            "Summon 1 thrall for 20 seconds.",
            "Summon 2 thralls.",
            "Summon 3 thralls.",
            "Summon up to 5 thralls that chase your current target."
          ],
          "when": "Deaths within range fill the Ledger; at 3 it summons the army.",
          "cost": "Army lasts about 20 seconds. Max thralls = skill level (capped at 5)."
        },
        {
          "key": "pale_conscription",
          "name": "Pale Conscription",
          "kind": "temporaryHelper",
          "conflict": "temporary_familiar",
          "summary": "At three Soul Charges, a wither-skeleton Bone Thrall is conscripted automatically.",
          "tiers": [
            "A Bone Thrall fights beside you.",
            "It lives longer.",
            "It bursts when it expires.",
            "Its final hit weakens the target and spreads a Dirge Mark."
          ],
          "cooldown": 600,
          "when": "Reach three Soul Charges from kills.",
          "cost": "One retainer at a time; it lives about 20 seconds."
        }
      ]
    },
    {
      "id": "radiance",
      "name": "Radiance",
      "tagline": "brand and consecrate",
      "ink": "#FFFF55",
      "focusPair": [
        "relics:silver_fragment",
        "relics:arcane_dust"
      ],
      "skills": [
        {
          "key": "thunderbrand",
          "name": "Thunderbrand",
          "kind": "lightningBrand",
          "conflict": "on_hit_lightning",
          "summary": "Some hits place a bright thunder mark; your next hit may call lightning on it.",
          "tiers": [
            "Lightning strikes the marked target.",
            "The mark chance improves.",
            "The strike arcs to one nearby hostile.",
            "The strike leaves a 3-second storm cell that pulses once."
          ],
          "cooldown": 200,
          "when": "Melee hits; about a 1 in 7 mark chance.",
          "cost": "10-second lightning cooldown; one mark per target."
        },
        {
          "key": "judgment_brand",
          "name": "Judgment Brand",
          "kind": "judgmentBrand",
          "conflict": "attack_brand",
          "summary": "Brand a hostile, then break the brand with your third hit for a burst of light.",
          "tiers": [
            "The third hit releases a light burst.",
            "Branded attackers are pulsed when they hit you.",
            "The burst chains one brand to another hostile.",
            "A branded death flashes nearby hostiles and heals you a little."
          ],
          "when": "Consecutive melee hits on the same target.",
          "cost": "The brand lasts 8 seconds; one per target."
        },
        {
          "key": "dawnwell",
          "name": "Dawnwell",
          "kind": "healingField",
          "conflict": "healing_field",
          "summary": "When you drop low, a well of light blooms underfoot to heal and pulse hostiles.",
          "tiers": [
            "The well slowly heals you.",
            "It judges undead with stronger pulses.",
            "It shares healing with nearby players.",
            "It can discharge once as a Solar Flare."
          ],
          "cooldown": 500,
          "when": "Your health falls below half.",
          "cost": "25-second cooldown; the well lasts 6 seconds."
        },
        {
          "key": "lumen_chorus",
          "name": "Lumen Chorus",
          "kind": "chorus",
          "conflict": "note_shield",
          "summary": "Kills collect random Notes. At three, a loud Chorus hum damages nearby hostiles.",
          "tiers": [
            "Each Note plays a random noteblock tone.",
            "The third Note is loud and starts a short damage hum.",
            "Three Notes brand a ring of hostiles.",
            "A full Chorus calls a Seraph Spark that divebombs the strongest hostile."
          ],
          "cooldown": 400,
          "when": "Kill to collect Notes. Reaching three fires the Chorus.",
          "cost": "Holds three Notes; the ring has a 20-second cooldown."
        }
      ]
    }
  ],
  "attuneGroups": [
    {
      "id": "might",
      "name": "Might",
      "tagline": "build pressure, then burst",
      "ink": "#FF5555",
      "focusPair": [
        "relics:monster_heart",
        "relics:beast_fang"
      ],
      "skills": [
        {
          "key": "scarbrand",
          "name": "Scarbrand",
          "kind": "mark",
          "conflict": "attack_brand",
          "summary": "Your first melee hit brands a hostile. Hit it again to break the brand for bonus damage.",
          "tiers": [
            "Breaking a brand deals bonus damage.",
            "Branded enemies burst on death, chipping nearby hostiles.",
            "Three brand breaks arm an Execute Pulse on your next hit.",
            "The Execute pulls you to the target and flings nearby hostiles away."
          ],
          "cooldown": 0,
          "when": "Melee hits. The brand lasts 8 seconds.",
          "cost": "One brand per target."
        },
        {
          "key": "rivet_streak",
          "name": "Rivet Streak",
          "kind": "combo",
          "conflict": "melee_combo",
          "summary": "Fast, consecutive hits build three Rivets. The next hit breaks them in a shockwave.",
          "tiers": [
            "The shockwave deals bonus impact damage.",
            "The shockwave also knocks enemies back.",
            "Breaking leaves a short-lived shatter disc on the ground.",
            "Enemies inside the disc are Marked Weak."
          ],
          "cooldown": 0,
          "when": "Melee hits landed within 1.5 seconds of each other.",
          "cost": "Missing the timing window resets your Rivets."
        },
        {
          "key": "cracked_rib_pact",
          "name": "Cracked-Rib Pact",
          "kind": "pact",
          "conflict": "bloodprice",
          "summary": "At low health, your next melee hit becomes a heavy Pact Slam.",
          "tiers": [
            "Dropping below half health arms the slam.",
            "The slam spends hunger to hit a wider area.",
            "The slam hits harder and reaches farther.",
            "Adds a ground burst, then 3 seconds of vulnerability."
          ],
          "cooldown": 160,
          "when": "Drop below half health — the next melee hit is a Pact Slam.",
          "cost": "8-second cooldown after the slam."
        },
        {
          "key": "warhorn_discord",
          "name": "Warhorn Discord",
          "kind": "killField",
          "conflict": "kill_field",
          "summary": "Kills sound a warhorn that weakens nearby hostiles.",
          "tiers": [
            "The horn Marks one nearby hostile Weak.",
            "The horn Marks two hostiles.",
            "The corpse leaves a 3-second discord field.",
            "The field also brands the strongest hostile with Scarbrand."
          ],
          "cooldown": 240,
          "when": "Kill a hostile while others are nearby.",
          "cost": "12-second cooldown; affects up to five hostiles."
        }
      ]
    },
    {
      "id": "ward",
      "name": "Ward",
      "tagline": "counter attacks and hold ground",
      "ink": "#5555FF",
      "focusPair": [
        "relics:silver_fragment",
        "relics:monster_heart"
      ],
      "skills": [
        {
          "key": "quillguard",
          "name": "Quillguard",
          "kind": "retaliateProjectile",
          "conflict": "hurt_projectile",
          "summary": "When a hostile hits you, a spectral arrow fires back at it.",
          "tiers": [
            "Fires one arrow back.",
            "The arrow hits harder.",
            "The arrow briefly roots the attacker in place.",
            "Fires a fan of three arrows around the attacker."
          ],
          "cooldown": 120,
          "when": "Take direct damage from a nearby hostile.",
          "cost": "6-second cooldown, shared with other counter skills."
        },
        {
          "key": "bastion_glyph",
          "name": "Bastion Glyph",
          "kind": "defenseField",
          "conflict": "defense_field",
          "summary": "A heavy hit stamps a Protection-style rune and Resistance IV under your feet.",
          "tiers": [
            "Grants Resistance IV and soaks damage while you stand inside.",
            "Hostiles crossing the rune are slowed.",
            "The rune knocks enemies outward when it expires.",
            "It also sends a counter-wave at hostiles still inside."
          ],
          "cooldown": 200,
          "when": "Take 2 or more damage in a single hit.",
          "cost": "10-second cooldown; one rune at a time."
        },
        {
          "key": "oathchain",
          "name": "Oathchain",
          "kind": "hurtEcho",
          "conflict": "hurt_echo",
          "summary": "The first hostile to hurt you becomes Oathbound, and later damage you take is partly echoed back to it.",
          "tiers": [
            "A visible tether echoes part of your damage back.",
            "The echo grows stronger.",
            "Killing the Oathbound target grants a small damage buffer.",
            "Bind two targets; the chain bursts when either dies."
          ],
          "cooldown": 300,
          "when": "The first hostile that hits you after the cooldown.",
          "cost": "15-second cooldown; one Oathbound target (two at Epic)."
        },
        {
          "key": "siege_root",
          "name": "Siege Root",
          "kind": "wardField",
          "conflict": "ward_field",
          "summary": "When you are surrounded, a ward field and Siege Ward golem hold the line.",
          "tiers": [
            "You resist knockback while inside the field.",
            "The field roots the first hostile that enters.",
            "A Siege Ward golem joins the defense.",
            "Its edge pushes back every hostile once."
          ],
          "cooldown": 400,
          "when": "Three or more hostiles within 6 blocks.",
          "cost": "20-second cooldown; the field lasts about 15 seconds."
        }
      ]
    },
    {
      "id": "gale",
      "name": "Gale",
      "tagline": "reposition through combat",
      "ink": "#55FFFF",
      "focusPair": [
        "relics:beast_fang",
        "relics:arcane_dust"
      ],
      "skills": [
        {
          "key": "crosswind_mark",
          "name": "Crosswind Mark",
          "kind": "movementMark",
          "conflict": "movement_mark",
          "summary": "Melee hits mark a hostile with wind; the next hit blasts them the way you punch.",
          "tiers": [
            "Knockback on the marked enemy follows your look.",
            "The redirect is stronger.",
            "A marked death releases a gust ring.",
            "Death passes the mark to the nearest hostile."
          ],
          "when": "Melee hits. The mark lasts 6 seconds.",
          "cost": "One wind mark per target."
        },
        {
          "key": "slipstream_cut",
          "name": "Slipstream Cut",
          "kind": "combatDash",
          "conflict": "combat_dash",
          "summary": "Sprint into a melee hit to dash straight through the target.",
          "tiers": [
            "Dash through the target.",
            "The dash leaves a wind ribbon that boosts you once.",
            "The ribbon chips one hostile it touches.",
            "You may make one extra cut midair before landing."
          ],
          "cooldown": 100,
          "when": "Land a melee hit while sprinting.",
          "cost": "5-second cooldown."
        },
        {
          "key": "tempest_tithe",
          "name": "Tempest Tithe",
          "kind": "paidLeap",
          "conflict": "paid_leap",
          "summary": "Sprint-jump to leap forward; landing releases a knockback ring.",
          "tiers": [
            "Leap forward.",
            "Landing releases a knockback ring.",
            "A second midair jump spends 1 heart for another leap.",
            "Landing leaves a 3-second storm cell that pushes hostiles out."
          ],
          "cooldown": 160,
          "when": "Jump while sprinting on the ground.",
          "cost": "8-second cooldown; costs 2 hunger."
        },
        {
          "key": "gale_anchor",
          "name": "Gale Anchor",
          "kind": "anchor",
          "conflict": "anchor_active",
          "summary": "Jump in midair to plant a wind anchor, then midair-jump again to pull to it.",
          "tiers": [
            "Plant an anchor in the air.",
            "Pulling to it releases a gust.",
            "You can bounce between two anchors.",
            "The last pull leaves a brief cyclone that draws hostiles in."
          ],
          "cooldown": 16,
          "when": "Jump while airborne to plant. Jump in the air again to pull.",
          "cost": "Short gap between plant and pull; anchors last 8 seconds."
        }
      ]
    },
    {
      "id": "fortune",
      "name": "Fortune",
      "tagline": "make visible wagers",
      "ink": "#FFAA00",
      "focusPair": [
        "relics:silver_fragment",
        "relics:beast_fang"
      ],
      "skills": [
        {
          "key": "coinspin_hex",
          "name": "Coinspin Hex",
          "kind": "fortuneFlip",
          "conflict": "fortune_flip",
          "summary": "Some melee hits flip a visible coin: heads rewards you, tails stings a little.",
          "tiers": [
            "Heads adds a bonus strike; tails makes you stumble.",
            "Three heads in a row guarantee a heavy strike.",
            "Tails leaves a mark that heals a little on your next heads.",
            "The coin flips between two hostiles, helping one and harming the other."
          ],
          "cooldown": 40,
          "when": "Melee hits; about a 1 in 4 chance to flip.",
          "cost": "2-second wait between flips."
        },
        {
          "key": "mimics_wager",
          "name": "Mimic's Wager",
          "kind": "bounty",
          "conflict": "bounty_mark",
          "summary": "Hitting a full-health hostile opens a wager: kill it in time to win a prize.",
          "tiers": [
            "Winning the wager pays a small material prize.",
            "A shorter timer, but a better prize.",
            "Strike again during the wager to go double-or-nothing.",
            "The jackpot can pay out one themed catalyst."
          ],
          "cooldown": 400,
          "when": "Your first hit on a full-health hostile.",
          "cost": "20-second cooldown; the wager lasts 10 seconds. Failing costs 2 hunger."
        },
        {
          "key": "debt_of_plenty",
          "name": "Debt of Plenty",
          "kind": "debt",
          "conflict": "fortune_debt",
          "summary": "Kills while well-fed open a hunger debt that briefly improves catalyst drops.",
          "tiers": [
            "A small debt with a small payoff.",
            "Pay the debt off early with attunement XP.",
            "A harsher debt with richer drops.",
            "A second kill during the debt can jackpot — or sting harder."
          ],
          "cooldown": 1200,
          "when": "Kill a hostile while you have at least 7 hunger drums.",
          "cost": "60-second cooldown; the debt drains hunger for 30 seconds."
        },
        {
          "key": "gilded_rumor",
          "name": "Gilded Rumor",
          "kind": "rumor",
          "conflict": "loot_duplicate",
          "summary": "Kills collect Rumors. At five, your next eligible mob drop is duplicated.",
          "tiers": [
            "Bank five Rumors, then duplicate one drop stack.",
            "Spend Rumors early for a smaller payout.",
            "The payout can include a rare catalyst.",
            "Success opens a short gold rift; touch it for one extra material."
          ],
          "when": "Hostile kills; each Rumor needs a 2-second gap.",
          "cost": "One stored payout. Never duplicates ore, relics, or boss drops."
        }
      ]
    },
    {
      "id": "vitality",
      "name": "Vitality",
      "tagline": "perform healing rituals",
      "ink": "#55FF55",
      "focusPair": [
        "relics:mystic_herb",
        "relics:monster_heart"
      ],
      "skills": [
        {
          "key": "marrow_swap",
          "name": "Marrow Swap",
          "kind": "resourceHeal",
          "conflict": "resource_heal",
          "summary": "When you drop low, hunger quickly trades into a chunk of health.",
          "tiers": [
            "Trade 2 hunger for 2 hearts.",
            "The exchange rate improves.",
            "Overdraw into empty hunger for one extra heart.",
            "Leaves a short trade rune nearby allies can also touch."
          ],
          "cooldown": 80,
          "when": "Your health falls below about 65%.",
          "cost": "Short cooldown; costs 2 hunger."
        },
        {
          "key": "blood_tithe",
          "name": "Sanguine Pact",
          "kind": "bloodTithe",
          "conflict": "heal_on_hit",
          "summary": "Spend a heart to open a crimson pact — melee hits reclaim it with clear feedback.",
          "tiers": [
            "Hits during the window refund your heart.",
            "Opening the window also clears one negative effect.",
            "Refunds past full become a small damage buffer.",
            "Creates a 4-second circle that shares small refunds with allies."
          ],
          "cooldown": 300,
          "when": "Your health falls below half.",
          "cost": "15-second cooldown; costs 1 heart (it can never kill you)."
        },
        {
          "key": "heartforge",
          "name": "Heartforge",
          "kind": "heartforge",
          "conflict": "death_save",
          "summary": "After staying unharmed for a while, your next meal forges bonus health.",
          "tiers": [
            "The meal heals extra.",
            "Extra healing past full becomes a damage buffer.",
            "Rarely, survive a lethal hit at one heart.",
            "Surviving plants a healing blossom well."
          ],
          "cooldown": 400,
          "when": "Eat food after 8 seconds without taking damage.",
          "cost": "20-second cooldown."
        },
        {
          "key": "symbiotic_seed",
          "name": "Symbiotic Seed",
          "kind": "corpseSeed",
          "conflict": "corpse_heal",
          "summary": "Some hostile deaths leave a seed: grab it now, or let it mature into something stronger.",
          "tiers": [
            "Touch the seed for a small heal.",
            "A matured seed heals more.",
            "A matured seed also pulses healing to nearby allies.",
            "It can sprout a Vine Latch that roots one hostile."
          ],
          "when": "Hostile kills; about a 1 in 4 seed chance.",
          "cost": "Up to two seeds; each expires after 12 seconds."
        }
      ]
    },
    {
      "id": "alchemy",
      "name": "Alchemy",
      "tagline": "mix colors into reactions",
      "ink": "#FF55FF",
      "focusPair": [
        "relics:arcane_dust",
        "relics:mystic_herb"
      ],
      "skills": [
        {
          "key": "witchglass_retort",
          "name": "Witchglass Retort",
          "kind": "retaliatePotion",
          "conflict": "hurt_potion",
          "summary": "When a hostile hits you, the Retort answers with a splash potion.",
          "tiers": [
            "Throws a healing splash at your feet.",
            "Throws a harming splash at the attacker.",
            "Chooses the splash based on your health.",
            "Throws both splashes at once."
          ],
          "cooldown": 160,
          "when": "Take direct damage from a hostile.",
          "cost": "8-second cooldown, shared with other counter skills."
        },
        {
          "key": "vialmark",
          "name": "Vialmark",
          "kind": "reaction",
          "conflict": "alchemy_mark",
          "summary": "Melee hits cycle three colored marks — Caustic, Frost, and Spark. Mixing two colors causes a reaction.",
          "tiers": [
            "Two different colors react for bonus damage.",
            "Opposite-color reactions hit harder.",
            "Reactions leave a short damaging puddle.",
            "Landing all three colors triggers a Discord Reaction."
          ],
          "cooldown": 40,
          "when": "Melee hits. Each mark lasts 8 seconds.",
          "cost": "One color per target; reactions have a 2-second wait."
        },
        {
          "key": "crucible_bloom",
          "name": "Crucible Bloom",
          "kind": "alchemyField",
          "conflict": "alchemy_field",
          "summary": "When you are surrounded, a crucible zone blooms underfoot and burns hostiles inside.",
          "tiers": [
            "The zone chips hostiles inside.",
            "Kills inside the zone can drop Arcane Gems.",
            "The zone lasts longer and hits harder.",
            "When it ends, it pulls marked hostiles inward once."
          ],
          "cooldown": 400,
          "when": "Three or more hostiles within 6 blocks.",
          "cost": "20-second cooldown; the zone lasts 6 seconds."
        },
        {
          "key": "phial_familiar",
          "name": "Phial Familiar",
          "kind": "temporaryHelper",
          "conflict": "temporary_familiar",
          "summary": "Taking a hit in a fight summons an orbiting phial that splashes your target.",
          "tiers": [
            "The phial throws one kind of splash.",
            "It picks a stronger color after the first throw.",
            "It shatters into a damage buffer when you take a heavy hit.",
            "It alternates two colors, triggering Vialmark reactions."
          ],
          "cooldown": 600,
          "when": "Take damage while a hostile is nearby.",
          "cost": "30-second cooldown; the phial lives 15 seconds."
        }
      ]
    },
    {
      "id": "necromancy",
      "name": "Necromancy",
      "tagline": "harvest and spend souls",
      "ink": "#AA00AA",
      "focusPair": [
        "relics:crimson_crystal",
        "relics:monster_heart"
      ],
      "skills": [
        {
          "key": "dirge_mark",
          "name": "Dirge Mark",
          "kind": "deathMark",
          "conflict": "death_mark",
          "summary": "Mark a hostile. If it dies before the mark fades, its soul bursts into nearby enemies.",
          "tiers": [
            "The death burst chips nearby hostiles.",
            "The mark spreads once to another hostile.",
            "The death leaves a 3-second grave pit.",
            "The pit raises a harmless decoy that soaks one hit."
          ],
          "cooldown": 160,
          "when": "Your first melee hit after the cooldown.",
          "cost": "8-second cooldown; the mark lasts 10 seconds."
        },
        {
          "key": "corpse_lantern",
          "name": "Corpse Lantern",
          "kind": "soulCharge",
          "conflict": "soul_charge",
          "summary": "Kills bank Soul Charges. At three, a soul nova erupts automatically.",
          "tiers": [
            "A soul nova bursts around you.",
            "The nova is larger.",
            "Uncollected lanterns become brief grave fields.",
            "If charges remain after the nova, a bone thrall may join."
          ],
          "when": "Kill to bank charges. Reaching three charges fires the nova.",
          "cost": "Holds up to three charges; lanterns expire after 10 seconds."
        },
        {
          "key": "thanatoic_ledger",
          "name": "Thanatoic Ledger",
          "kind": "execute",
          "conflict": "execute",
          "summary": "Nearby deaths fill your Ledger. At three, summon a wither-skeleton thrall army that hunts whoever you strike.",
          "tiers": [
            "Summon 1 thrall for 20 seconds.",
            "Summon 2 thralls.",
            "Summon 3 thralls.",
            "Summon up to 5 thralls that chase your current target."
          ],
          "when": "Deaths within range fill the Ledger; at 3 it summons the army.",
          "cost": "Army lasts about 20 seconds. Max thralls = skill level (capped at 5)."
        },
        {
          "key": "pale_conscription",
          "name": "Pale Conscription",
          "kind": "temporaryHelper",
          "conflict": "temporary_familiar",
          "summary": "At three Soul Charges, a wither-skeleton Bone Thrall is conscripted automatically.",
          "tiers": [
            "A Bone Thrall fights beside you.",
            "It lives longer.",
            "It bursts when it expires.",
            "Its final hit weakens the target and spreads a Dirge Mark."
          ],
          "cooldown": 600,
          "when": "Reach three Soul Charges from kills.",
          "cost": "One retainer at a time; it lives about 20 seconds."
        }
      ]
    },
    {
      "id": "radiance",
      "name": "Radiance",
      "tagline": "brand and consecrate",
      "ink": "#FFFF55",
      "focusPair": [
        "relics:silver_fragment",
        "relics:arcane_dust"
      ],
      "skills": [
        {
          "key": "thunderbrand",
          "name": "Thunderbrand",
          "kind": "lightningBrand",
          "conflict": "on_hit_lightning",
          "summary": "Some hits place a bright thunder mark; your next hit may call lightning on it.",
          "tiers": [
            "Lightning strikes the marked target.",
            "The mark chance improves.",
            "The strike arcs to one nearby hostile.",
            "The strike leaves a 3-second storm cell that pulses once."
          ],
          "cooldown": 200,
          "when": "Melee hits; about a 1 in 7 mark chance.",
          "cost": "10-second lightning cooldown; one mark per target."
        },
        {
          "key": "judgment_brand",
          "name": "Judgment Brand",
          "kind": "judgmentBrand",
          "conflict": "attack_brand",
          "summary": "Brand a hostile, then break the brand with your third hit for a burst of light.",
          "tiers": [
            "The third hit releases a light burst.",
            "Branded attackers are pulsed when they hit you.",
            "The burst chains one brand to another hostile.",
            "A branded death flashes nearby hostiles and heals you a little."
          ],
          "when": "Consecutive melee hits on the same target.",
          "cost": "The brand lasts 8 seconds; one per target."
        },
        {
          "key": "dawnwell",
          "name": "Dawnwell",
          "kind": "healingField",
          "conflict": "healing_field",
          "summary": "When you drop low, a well of light blooms underfoot to heal and pulse hostiles.",
          "tiers": [
            "The well slowly heals you.",
            "It judges undead with stronger pulses.",
            "It shares healing with nearby players.",
            "It can discharge once as a Solar Flare."
          ],
          "cooldown": 500,
          "when": "Your health falls below half.",
          "cost": "25-second cooldown; the well lasts 6 seconds."
        },
        {
          "key": "lumen_chorus",
          "name": "Lumen Chorus",
          "kind": "chorus",
          "conflict": "note_shield",
          "summary": "Kills collect random Notes. At three, a loud Chorus hum damages nearby hostiles.",
          "tiers": [
            "Each Note plays a random noteblock tone.",
            "The third Note is loud and starts a short damage hum.",
            "Three Notes brand a ring of hostiles.",
            "A full Chorus calls a Seraph Spark that divebombs the strongest hostile."
          ],
          "cooldown": 400,
          "when": "Kill to collect Notes. Reaching three fires the Chorus.",
          "cost": "Holds three Notes; the ring has a 20-second cooldown."
        }
      ]
    }
  ],
  "boosts": [
    {
      "id": "might",
      "name": "Berserker",
      "color": "var(--might)",
      "summary": "Stack hits to deal crushing echo damage.",
      "tiers": [
        "Every 5 hits, +2 bonus damage",
        "Every 4 hits, +3 bonus damage",
        "Every 3 hits, +5 bonus damage"
      ],
      "levels": [
        {
          "level": 1,
          "roman": "I",
          "text": "Every 5 hits, +2 bonus damage",
          "display": "I — Every 5 hits, +2 bonus damage"
        },
        {
          "level": 2,
          "roman": "II",
          "text": "Every 4 hits, +3 bonus damage",
          "display": "II — Every 4 hits, +3 bonus damage"
        },
        {
          "level": 3,
          "roman": "III",
          "text": "Every 3 hits, +5 bonus damage",
          "display": "III — Every 3 hits, +5 bonus damage"
        }
      ]
    },
    {
      "id": "ward",
      "name": "Guardian",
      "color": "var(--ward)",
      "summary": "Take less damage from hits.",
      "tiers": [
        "15% less damage",
        "25% less damage",
        "35% less damage"
      ],
      "levels": [
        {
          "level": 1,
          "roman": "I",
          "text": "Take 15% less damage",
          "display": "I — Take 15% less damage"
        },
        {
          "level": 2,
          "roman": "II",
          "text": "Take 25% less damage",
          "display": "II — Take 25% less damage"
        },
        {
          "level": 3,
          "roman": "III",
          "text": "Take 35% less damage",
          "display": "III — Take 35% less damage"
        }
      ]
    },
    {
      "id": "gale",
      "name": "Scout",
      "color": "var(--gale)",
      "summary": "Sprinting grants short Tailwind speed bursts.",
      "tiers": [
        "Speed I burst while sprinting (~3s)",
        "Longer Speed II Tailwind (~4s)",
        "Tailwind + Jump Boost II (~5s)"
      ],
      "levels": [
        {
          "level": 1,
          "roman": "I",
          "text": "Speed I burst while sprinting (~3s)",
          "display": "I — Speed I burst while sprinting (~3s)"
        },
        {
          "level": 2,
          "roman": "II",
          "text": "Longer Speed II Tailwind (~4s)",
          "display": "II — Longer Speed II Tailwind (~4s)"
        },
        {
          "level": 3,
          "roman": "III",
          "text": "Tailwind + Jump Boost II (~5s)",
          "display": "III — Tailwind + Jump Boost II (~5s)"
        }
      ]
    },
    {
      "id": "fortune",
      "name": "Trickster",
      "color": "var(--fortune)",
      "summary": "Each ore block can burst into a much larger drop.",
      "tiers": [
        "30% chance for 3× ore from that block",
        "45% chance for 6× ore from that block",
        "50% chance for 12× ore from that block"
      ],
      "levels": [
        {
          "level": 1,
          "roman": "I",
          "text": "30% chance for 3× ore from that block",
          "display": "I — 30% chance for 3× ore from that block"
        },
        {
          "level": 2,
          "roman": "II",
          "text": "45% chance for 6× ore from that block",
          "display": "II — 45% chance for 6× ore from that block"
        },
        {
          "level": 3,
          "roman": "III",
          "text": "50% chance for 12× ore from that block",
          "display": "III — 50% chance for 12× ore from that block"
        }
      ]
    },
    {
      "id": "vitality",
      "name": "Healer",
      "color": "var(--vitality)",
      "summary": "Kills restore health.",
      "tiers": [
        "Kills restore 1 heart",
        "Kills restore 2 hearts",
        "Kills restore 3 hearts + brief Regeneration"
      ],
      "levels": [
        {
          "level": 1,
          "roman": "I",
          "text": "Kills restore 1 heart",
          "display": "I — Kills restore 1 heart"
        },
        {
          "level": 2,
          "roman": "II",
          "text": "Kills restore 2 hearts",
          "display": "II — Kills restore 2 hearts"
        },
        {
          "level": 3,
          "roman": "III",
          "text": "Kills restore 3 hearts + brief Regeneration",
          "display": "III — Kills restore 3 hearts + brief Regeneration"
        }
      ]
    },
    {
      "id": "alchemy",
      "name": "Arcanist",
      "color": "var(--alchemy)",
      "summary": "Drunk potions last longer.",
      "tiers": [
        "Potions last 20% longer",
        "Potions last 35% longer",
        "Potions last 50% longer"
      ],
      "levels": [
        {
          "level": 1,
          "roman": "I",
          "text": "Potions last 20% longer",
          "display": "I — Potions last 20% longer"
        },
        {
          "level": 2,
          "roman": "II",
          "text": "Potions last 35% longer",
          "display": "II — Potions last 35% longer"
        },
        {
          "level": 3,
          "roman": "III",
          "text": "Potions last 50% longer",
          "display": "III — Potions last 50% longer"
        }
      ]
    }
  ],
  "ritualCosts": {
    "common": {
      "shards": 2,
      "focus": 1
    },
    "uncommon": {
      "shards": 5,
      "focus": 2
    },
    "rare": {
      "shards": 10,
      "focus": 3
    },
    "epic": {
      "shards": 20,
      "focus": 5
    }
  },
  "affinityAttuneGroups": {
    "might": [
      "might",
      "necromancy"
    ],
    "ward": [
      "ward",
      "radiance"
    ],
    "gale": [
      "gale",
      "fortune"
    ],
    "fortune": [
      "fortune",
      "alchemy"
    ],
    "vitality": [
      "vitality",
      "ward"
    ],
    "alchemy": [
      "alchemy",
      "radiance"
    ]
  },
  "meta": {
    "generatedAt": "2026-07-20T20:42:27.017Z",
    "relicCount": 71,
    "materialCount": 7,
    "mimicCount": 6,
    "attuneGroupCount": 8,
    "boostCount": 6,
    "skillCount": 32
  }
};
