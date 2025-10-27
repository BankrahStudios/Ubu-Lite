@echo off
REM Runs the Django app locally on Windows CMD.
REM - Activates .venv if present
REM - Installs dependencies
REM - Applies migrations
REM - Starts server on :8000 (falls back to :8010 if busy)

setlocal enabledelayedexpansion
set PORT=0
if not "%1"=="" set PORT=%1

REM Allow env var override
if "%PORT%"=="0" (
  if not "%DJANGO_RUN_PORT%"=="" (
    set PORT=%DJANGO_RUN_PORT%
  ) else (
    set PORT=8000
  )
)

if exist .\.venv\Scripts\activate.bat (
  echo Activating virtualenv .venv
  call .\.venv\Scripts\activate.bat
)

if exist requirements.txt (
  echo Installing dependencies from requirements.txt
  pip install -r requirements.txt
)

echo Applying migrations
python manage.py migrate || goto :error

REM Check if port is busy
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT%" ^| findstr LISTENING') do set BUSY=1
if defined BUSY (
  echo Port %PORT% is busy. Falling back to 8010
  set PORT=8010
)

echo Starting Django at http://localhost:%PORT%
python manage.py runserver 0.0.0.0:%PORT%
goto :eof

:error
echo Migration failed. See errors above.
exit /b 1
