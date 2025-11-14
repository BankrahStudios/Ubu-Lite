Param(
  [switch]$Open
)

$ErrorActionPreference = 'Stop'

$here = Split-Path -Parent $MyInvocation.MyCommand.Definition
Push-Location (Join-Path $here "..\templates\ubu-lite-homepage")

Write-Host "Building PREVIEW with relative asset paths (PUBLIC_URL=.)" -ForegroundColor Yellow
$env:PUBLIC_URL = '.'
npm run build | Out-Null

$index = Join-Path (Get-Location) "build\index.html"
Write-Host "Preview ready:" -ForegroundColor Green
Write-Host "  $index"

if ($Open) { Start-Process $index }

Pop-Location

