# Runs the Django app locally on Windows PowerShell.
# - Activates .venv if present
# - Installs dependencies
# - Applies migrations
# - Starts the dev server on :8000 (fallbacks to :8010 if busy)

param(
  [int] $Port = 0
)

$ErrorActionPreference = 'Stop'

function Use-Venv {
  if (Test-Path .\.venv\Scripts\Activate.ps1) {
    Write-Host "Activating virtualenv .venv" -ForegroundColor Cyan
    . .\.venv\Scripts\Activate.ps1
  }
}

function Ensure-Deps {
  if (Test-Path .\requirements.txt) {
    Write-Host "Installing dependencies from requirements.txt" -ForegroundColor Cyan
    pip install -r requirements.txt
  }
}

function Port-Free($p) {
  $net = (Get-NetTCPConnection -State Listen -LocalPort $p -ErrorAction SilentlyContinue)
  return -not $net
}

Use-Venv
Ensure-Deps

# Allow overriding port from env var DJANGO_RUN_PORT
if ($Port -eq 0) {
  if ($env:DJANGO_RUN_PORT) {
    $Port = [int]$env:DJANGO_RUN_PORT
  } else {
    $Port = 8000
  }
}

Write-Host "Applying migrations" -ForegroundColor Cyan
python manage.py migrate

if (-not (Port-Free $Port)) {
  Write-Warning "Port $Port is busy. Falling back to 8010"
  $Port = 8010
}

Write-Host "Starting Django at http://localhost:$Port" -ForegroundColor Green
python manage.py runserver 0.0.0.0:$Port
