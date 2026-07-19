# Generates BP/items/*.json, en_US.lang entries, and item_texture.json
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$BpItems = Join-Path $Root "BP\items"
$RpLang = Join-Path $Root "RP\texts\en_US.lang"
$RpTex = Join-Path $Root "RP\textures\item_texture.json"

$Slotted = @(
  "scryglass","filter_mask",
  "lumen_visor","quaffers_cap","gillmask","fortune_tellers_cap","merchants_fedora",
  "anchor_charm","ward_pendant","ember_locket","adrenaline_charm","prospectors_scarf",
  "phantom_veil","storm_locket","bramble_charm",
  "haste_band","vital_band","bloom_band","draught_band",
  "lucky_talisman","shrink_charm",
  "cloud_cape","stratos_pack",
  "crystal_harness","obsidian_plate",
  "purifying_flask","zephyr_flask","heartstone","skybound_charm","cinder_ward","magnetic_sash",
  "blight_vessel","cloud_vial",
  "excavator_gauntlets","fleetstrike_gloves","cinderfist","reapers_hook","impact_knuckles",
  "crusher_gauntlet","leeching_glove","gilt_hook",
  "tidewalkers","springheel_boots","finfoot_boots","featherpad_boots","marathoners_treads","rootgrip_boots",
  "jesters_cushion","marrow_choker"
)

$Loose = @("endless_ration","storm_parasol")

$Names = @{
  scryglass = "Hunter's Lens"
  filter_mask = "Plague Mask"
  lumen_visor = "Nightwatch Goggles"
  quaffers_cap = "Feast Cap"
  gillmask = "Tide Fin"
  fortune_tellers_cap = "Fate Circlet"
  merchants_fedora = "Guildmaster's Hat"
  anchor_charm = "Mariner's Pendant"
  ward_pendant = "Aegis Locket"
  ember_locket = "Ember Locket"
  adrenaline_charm = "Rush Cord"
  prospectors_scarf = "Guildweaver's Cord"
  phantom_veil = "Phantom Veil"
  storm_locket = "Tempest Locket"
  bramble_charm = "Briar Charm"
  haste_band = "Miner's Ring"
  vital_band = "Heartward Ring"
  bloom_band = "Bloom Band"
  draught_band = "Alchemist's Loop"
  lucky_talisman = "Executioner's Sigil"
  shrink_charm = "Phase Pearl"
  cloud_cape = "Cloud Plume"
  stratos_pack = "Windrunner Pack"
  crystal_harness = "Crystal Harness"
  obsidian_plate = "Obsidian Aegis"
  purifying_flask = "Antidote Flask"
  zephyr_flask = "Hare's Bounding Sash"
  heartstone = "Bloodheart Stone"
  skybound_charm = "Drift Feather"
  cinder_ward = "Emberflare Girdle"
  magnetic_sash = "Lodestone Charm"
  blight_vessel = "Ashen Vessel"
  cloud_vial = "Puff Bottle"
  excavator_gauntlets = "Delver's Warbrace"
  fleetstrike_gloves = "Fleetstrike Wraps"
  cinderfist = "Gold Bracer"
  reapers_hook = "Wraithreaper's Hook"
  impact_knuckles = "Skullbreaker Knuckles"
  crusher_gauntlet = "Ore-Crusher Fist"
  leeching_glove = "Crimson Glove"
  gilt_hook = "Gilded Angler"
  tidewalkers = "Tide Striders"
  springheel_boots = "Spring Boots"
  finfoot_boots = "Riptide Boots"
  featherpad_boots = "Softstep Boots"
  marathoners_treads = "Wayfarer's Shoes"
  rootgrip_boots = "Earth Boots"
  jesters_cushion = "Fool's Whoopee Charm"
  marrow_choker = "Marrow Choker"
  endless_ration = "Travel Sandwich"
  storm_parasol = "Gale Lantern"
}

function Write-ItemJson($id) {
  $path = Join-Path $BpItems "$id.json"
  $json = @"
{
  "format_version": "1.21.0",
  "minecraft:item": {
    "description": {
      "identifier": "relics:$id",
      "menu_category": {
        "category": "equipment"
      }
    },
    "components": {
      "minecraft:max_stack_size": 1,
      "minecraft:icon": "relics_$id",
      "minecraft:display_name": { "value": "item.relics:$id" }
    }
  }
}
"@
  Set-Content -Path $path -Value $json -Encoding utf8NoBOM
}

# Remove old placeholders
@("ring_of_haste","amulet_of_vitality","belt_of_sprinting","trinket_of_lifesaving") | ForEach-Object {
  Remove-Item (Join-Path $BpItems "$_.json") -ErrorAction SilentlyContinue
}

foreach ($id in ($Slotted + $Loose)) { Write-ItemJson $id }

# Menu item
$menuJson = @"
{
  "format_version": "1.21.0",
  "minecraft:item": {
    "description": {
      "identifier": "relics:menu",
      "menu_category": {
        "category": "equipment"
      }
    },
    "components": {
      "minecraft:max_stack_size": 1,
      "minecraft:icon": "relics_menu",
      "minecraft:display_name": { "value": "item.relics:menu" },
      "minecraft:hand_equipped": true,
      "minecraft:custom_components": ["relics:on_use"],
      "minecraft:use_modifiers": {
        "use_duration": 0.05,
        "movement_modifier": 1.0
      }
    }
  }
}
"@
Set-Content -Path (Join-Path $BpItems "relics_menu.json") -Value $menuJson -Encoding UTF8

$guideJson = @"
{
  "format_version": "1.21.0",
  "minecraft:item": {
    "description": {
      "identifier": "relics:relic_guidebook",
      "menu_category": {
        "category": "equipment"
      }
    },
    "components": {
      "minecraft:max_stack_size": 1,
      "minecraft:icon": "relics_relic_guidebook",
      "minecraft:display_name": { "value": "item.relics:relic_guidebook" },
      "minecraft:hand_equipped": true,
      "minecraft:custom_components": ["relics:on_use"],
      "minecraft:use_modifiers": {
        "use_duration": 0.05,
        "movement_modifier": 1.0
      }
    }
  }
}
"@
Set-Content -Path (Join-Path $BpItems "relic_guidebook.json") -Value $guideJson -Encoding UTF8

$lang = @()
$lang += "item.relics:menu=Relic Ledger"
$lang += "item.relics:relic_guidebook=Curio Guidebook"
foreach ($id in ($Slotted + $Loose)) {
  $lang += "item.relics:$id=$($Names[$id])"
}
$lang += ""
$lang += "pack.name=RPG Relics"
$lang += "pack.description=Equipable relics and Reliquary wardrobe"
Set-Content -Path $RpLang -Value ($lang -join "`n") -Encoding UTF8

$texData = @{}
$texData["relics_menu"] = @{ textures = "textures/items/relics_menu" }
$texData["relics_relic_guidebook"] = @{ textures = "textures/items/relic_guidebook" }
foreach ($id in ($Slotted + $Loose)) {
  $texData["relics_$id"] = @{ textures = "textures/items/$id" }
}

$atlas = @{
  resource_pack_name = "curio_relics"
  texture_name = "atlas.items"
  texture_data = $texData
} | ConvertTo-Json -Depth 5

Set-Content -Path $RpTex -Value $atlas -Encoding UTF8
Write-Host "Generated $($Slotted.Count) slotted + $($Loose.Count) held items"
