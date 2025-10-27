@echo off
REM Interactive launcher: prompts for a port and starts Django.
setlocal enabledelayedexpansion

echo.
echo Enter port to run Django on ^(default 8010^):
set PORT=
set /p PORT=
if "%PORT%"=="" set PORT=8010

set DJANGO_RUN_PORT=%PORT%
call %~dp0run_django.cmd

