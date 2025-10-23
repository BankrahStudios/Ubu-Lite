@echo off
REM Start React dev server for UBU Lite (Windows CMD)
REM Uses cmd to avoid PowerShell execution policy issues.
setlocal
cd /d %~dp0\..\templates\ubu-lite-homepage
if "%PORT%"=="" set PORT=3000

REM Only install if node_modules is missing
if not exist node_modules (
  echo Installing npm packages (legacy peer deps)...
  cmd /c npm install --legacy-peer-deps --no-audit --no-fund || goto :err
) else (
  echo Skipping npm install (node_modules present)
)

echo Starting React dev server on port %PORT%...
cmd /c set PORT=%PORT% && npm start
endlocal
goto :eof

:err
echo.
echo npm install failed. See messages above.
exit /b 1
