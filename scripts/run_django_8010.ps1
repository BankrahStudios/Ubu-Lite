# Convenience launcher that starts Django on port 8010
$env:DJANGO_RUN_PORT = "8010"
& $PSScriptRoot\run_django.ps1

