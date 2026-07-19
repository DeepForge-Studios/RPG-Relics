# Build example_trinket_addon.mcaddon from examples/trinket-addon/
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$ExampleBp = Join-Path $Root "BP"
$ExampleRp = Join-Path $Root "RP"
$Out = Join-Path $Root "example_trinket_addon.mcaddon"
$GenTextures = Join-Path $Root "tools\gen_textures.py"

if (Test-Path $GenTextures) {
  & python $GenTextures
  if ($LASTEXITCODE -ne 0) { throw "gen_textures.py failed" }
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

if (Test-Path $Out) { Remove-Item -Force $Out }

$zip = [System.IO.Compression.ZipFile]::Open($Out, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  function Add-Folder($source, $archiveRoot) {
    $full = (Resolve-Path $source).Path.TrimEnd('\')
    Get-ChildItem -Path $full -Recurse -File | ForEach-Object {
      $rel = $_.FullName.Substring($full.Length).TrimStart('\', '/')
      $entry = ($archiveRoot.TrimEnd('/') + '/' + $rel).Replace('\', '/')
      [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $entry)
    }
  }
  Add-Folder $ExampleBp "BP"
  Add-Folder $ExampleRp "RP"
} finally {
  $zip.Dispose()
}

Write-Host "Built $Out"
