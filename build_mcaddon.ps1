# Build curio_relics.mcaddon (Bedrock: valid ZIP, forward-slash paths).
# Bumps a visible test build label (v.01, v.02, ...) on every run so you know when to reimport.
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Build = Join-Path $Root "_mcaddon_build"
$Mcaddon = Join-Path $Root "curio_relics.mcaddon"
$CounterFile = Join-Path $Root "test_build_counter.txt"

# Regenerate live inventory/HUD icon UI from RELIC_REGISTRY (optional; inventory overlay currently disabled)
# $genIcons = Join-Path $Root "tools\gen_curio_ui_icons.py"
# if (Test-Path $genIcons) {
#     & python $genIcons
#     if ($LASTEXITCODE -ne 0) { throw "gen_curio_ui_icons.py failed" }
# }

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Add-FolderToZip {
    param(
        [System.IO.Compression.ZipArchive]$Zip,
        [string]$SourceDir,
        [string]$ArchiveRoot
    )
    if (-not (Test-Path $SourceDir)) {
        throw "Missing pack folder: $SourceDir"
    }
    $sourceFull = (Resolve-Path $SourceDir).Path.TrimEnd('\')
    Get-ChildItem -Path $sourceFull -Recurse -File | ForEach-Object {
        $rel = $_.FullName.Substring($sourceFull.Length).TrimStart('\', '/')
        $entryName = ($ArchiveRoot.TrimEnd('/') + '/' + $rel).Replace('\', '/')
        [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
            $Zip,
            $_.FullName,
            $entryName,
            [System.IO.Compression.CompressionLevel]::Optimal
        )
    }
}

function Read-BuildCounter {
    if (-not (Test-Path $CounterFile)) { return 0 }
    $raw = (Get-Content $CounterFile -Raw).Trim()
    if ($raw -match '^\d+$') { return [int]$raw }
    return 0
}

function Write-BuildCounter([int]$Value) {
    Set-Content -Path $CounterFile -Value "$Value" -Encoding ascii
}

function Stamp-PackManifests {
    param(
        [string]$BuildRoot,
        [int]$TestBuildNumber
    )
    $label = "v.{0:D2}" -f $TestBuildNumber
    $ver = @(0, 0, $TestBuildNumber)

    $bpPath = Join-Path $BuildRoot "curio_relics_bp\manifest.json"
    $rpPath = Join-Path $BuildRoot "curio_relics_rp\manifest.json"
    $langPath = Join-Path $BuildRoot "curio_relics_rp\texts\en_US.lang"

    $bp = Get-Content $bpPath -Raw | ConvertFrom-Json
    $bp.header.name = "RPG Relics (Behavior) $label"
    $bp.header.version = $ver
    foreach ($mod in $bp.modules) { $mod.version = $ver }
    foreach ($dep in $bp.dependencies) {
        if ($dep.PSObject.Properties.Name -contains "uuid") {
            $dep.version = $ver
        }
    }
    $bp | ConvertTo-Json -Depth 10 | Set-Content -Path $bpPath -Encoding utf8

    $rp = Get-Content $rpPath -Raw | ConvertFrom-Json
    $rp.header.name = "RPG Relics (Resources) $label"
    $rp.header.version = $ver
    foreach ($mod in $rp.modules) { $mod.version = $ver }
    $rp | ConvertTo-Json -Depth 10 | Set-Content -Path $rpPath -Encoding utf8

    if (Test-Path $langPath) {
        $lang = Get-Content $langPath
        $lang = $lang | ForEach-Object {
            if ($_ -match '^pack\.name=') { "pack.name=RPG Relics $label" }
            elseif ($_ -match '^pack\.description=') { "pack.description=Test build $label - reimport when this number goes up" }
            else { $_ }
        }
        Set-Content -Path $langPath -Value $lang -Encoding utf8
    }

    # Stamp test build into a tiny module (never rewrite main.js — regex/encoding broke it before)
    $stampPath = Join-Path $BuildRoot "curio_relics_bp\scripts\build_info.js"
    $stamp = @"
/** Injected at build time by build_mcaddon.ps1 — do not edit by hand. */
export const TEST_BUILD = "$label";
"@
    $utf8 = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($stampPath, $stamp, $utf8)

    return $label
}

$testBuildNumber = (Read-BuildCounter) + 1
if ($testBuildNumber -lt 1) { $testBuildNumber = 1 }
Write-BuildCounter $testBuildNumber

if (Test-Path $Build) { Remove-Item $Build -Recurse -Force }
New-Item -ItemType Directory -Path $Build | Out-Null

Copy-Item (Join-Path $Root "BP") (Join-Path $Build "curio_relics_bp") -Recurse
Copy-Item (Join-Path $Root "RP") (Join-Path $Build "curio_relics_rp") -Recurse

$label = Stamp-PackManifests -BuildRoot $Build -TestBuildNumber $testBuildNumber

if (Test-Path $Mcaddon) { Remove-Item $Mcaddon -Force }

# Remove any old labeled copies from earlier builds (one output file only)
Get-ChildItem -Path $Root -Filter "curio_relics_v.*.mcaddon" -File -ErrorAction SilentlyContinue |
    Remove-Item -Force

$stream = [System.IO.File]::Open($Mcaddon, [System.IO.FileMode]::CreateNew)
try {
    $zip = New-Object System.IO.Compression.ZipArchive($stream, [System.IO.Compression.ZipArchiveMode]::Create, $false)
    try {
        Add-FolderToZip -Zip $zip -SourceDir (Join-Path $Build "curio_relics_bp") -ArchiveRoot "curio_relics_bp"
        Add-FolderToZip -Zip $zip -SourceDir (Join-Path $Build "curio_relics_rp") -ArchiveRoot "curio_relics_rp"
    }
    finally {
        $zip.Dispose()
    }
}
finally {
    $stream.Dispose()
}

Set-Content -Path (Join-Path $Root "LAST_TEST_BUILD.txt") -Value $label -Encoding ascii

Remove-Item $Build -Recurse -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Test build: $label" -ForegroundColor Yellow
Write-Host " Reimport when this number changes." -ForegroundColor Yellow
Write-Host " Pack name in-game: RPG Relics ... $label" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Built $Mcaddon ($((Get-Item $Mcaddon).Length) bytes)"
