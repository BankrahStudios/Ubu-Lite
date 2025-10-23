@echo off
REM Build CRA and run Django to preview at /react-app/
setlocal
cd /d %~dp0\..\templates\ubu-lite-homepage

REM Only install if node_modules is missing
if not exist node_modules (
  echo Installing npm packages (legacy peer deps)...
  cmd /c npm install --legacy-peer-deps --no-audit --no-fund || goto :err
) else (
  echo Skipping npm install (node_modules present)
)

echo Building React app...
set NODE_OPTIONS=--max_old_space_size=4096
cmd /c npm run build || goto :err

cd /d %~dp0\..
echo Collecting static files...
python manage.py collectstatic --noinput || goto :err
echo Starting Django on http://localhost:8000/react-app/
python manage.py runserver
goto :eof

:err
echo.
echo Build or setup failed. See messages above.
exit /b 1
