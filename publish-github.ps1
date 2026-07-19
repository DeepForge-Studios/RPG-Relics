<#
.SYNOPSIS
  First-time git setup + push to DeepForge-Studios/RPG-Relics as YOU (yungsonix).

.DESCRIPTION
  Cursor will not commit for you — run this in PowerShell so GitHub shows your name.

.EXAMPLE
  .\publish-github.ps1 -Email "you@example.com"
#>
param(
  [Parameter(Mandatory = $true)]
  [string]$Email,

  [string]$Name = "yungsonix",
  [string]$RemoteUrl = "https://github.com/DeepForge-Studios/RPG-Relics.git",
  [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "Git is not installed. Install from https://git-scm.com/download/win then re-run."
}

# Local identity only (does not change your global git config)
git config user.name $Name
git config user.email $Email

if (-not (Test-Path .git)) {
  git init -b $Branch
}

git add -A
git status

$msg = @"
Initial public release of RPG Relics for Bedrock.

DeepForge Studios — Reliquary wardrobe, Boosts, and Attunement.
"@

git commit -m $msg

$existing = git remote get-url origin 2>$null
if (-not $existing) {
  git remote add origin $RemoteUrl
} else {
  git remote set-url origin $RemoteUrl
}

Write-Host ""
Write-Host "Ready to push as $Name <$Email>"
Write-Host "Create the empty repo on GitHub first if it does not exist:"
Write-Host "  https://github.com/organizations/DeepForge-Studios/repositories/new"
Write-Host "  Name: RPG-Relics  (no README / .gitignore — this repo already has them)"
Write-Host ""
$confirm = Read-Host "Push to origin/$Branch now? (y/N)"
if ($confirm -eq "y" -or $confirm -eq "Y") {
  git push -u origin $Branch
  Write-Host "Done: $RemoteUrl"
} else {
  Write-Host "Skipped push. When ready:"
  Write-Host "  git push -u origin $Branch"
}
