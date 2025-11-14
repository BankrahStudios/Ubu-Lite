Param(
  [int]$Port = 8000,
  [switch]$BuildReact
)

$ErrorActionPreference = 'Stop'

Write-Host "==> Bootstrapping Python venv (.venv) and running Django on port $Port..." -ForegroundColor Cyan

# Resolve repo root as this script's parent directory
$here = Split-Path -Parent $MyInvocation.MyCommand.Definition
$root = Resolve-Path (Join-Path $here "..")
Set-Location $root

# Create venv if missing
if (!(Test-Path ".venv")) {
  Write-Host "Creating virtual environment (.venv)" -ForegroundColor Yellow
  py -3 -m venv .venv
}

# Activate
$venv = Join-Path $root ".venv/Scripts/Activate.ps1"
. $venv

# Install Python deps
Write-Host "Installing Python dependencies (pip install -r requirements.txt)" -ForegroundColor Yellow
pip install -r requirements.txt | Out-Null

# Optional: build React
if ($BuildReact) {
  Write-Host "Building React homepage (npm run build)" -ForegroundColor Yellow
  Push-Location (Join-Path $root "templates/ubu-lite-homepage")
  npm install | Out-Null
  npm run build | Out-Null
  Pop-Location
}

# DB migrate
Write-Host "Applying Django migrations" -ForegroundColor Yellow
python manage.py migrate

# Ensure we land on React by default
$env:ROOT_LANDING = "react"

Write-Host "==> Starting Django dev server: http://localhost:$Port/react-app/" -ForegroundColor Green
python manage.py runserver $Port

