@echo off
setlocal
REM Start Django dev server and serve the built React homepage at /react-app/
REM This batch uses PowerShell to run the helper script with policy bypass.

set PORT=8000
if not "%1"=="" set PORT=%1

powershell -ExecutionPolicy Bypass -File "%~dp0run_dev.ps1" -Port %PORT% -BuildReact

endlocal

