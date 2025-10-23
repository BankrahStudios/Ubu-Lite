# Build the React app and collect static files for Django (PowerShell)
# Usage: .\scripts\build_react.ps1

$here = Split-Path -Parent $MyInvocation.MyCommand.Definition
Push-Location $here\..\templates\ubu-lite-homepage

Write-Output "Installing npm dependencies (skip if already installed)..."
npm install

Write-Output "Running React build..."
npm run build

Pop-Location

Write-Output "Collecting static files into STATIC_ROOT..."
python manage.py collectstatic --noinput

Write-Output "Done. Open http://localhost:8000/react-app/ to view the built app."