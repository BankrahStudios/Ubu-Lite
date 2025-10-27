param([int]$Port = 0)

if ($Port -eq 0) {
  $inp = Read-Host "Enter port to run Django on (default 8010)"
  if ([string]::IsNullOrWhiteSpace($inp)) { $Port = 8010 } else { $Port = [int]$inp }
}

$env:DJANGO_RUN_PORT = "$Port"
& $PSScriptRoot\run_django.ps1

