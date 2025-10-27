@echo off
REM Convenience launcher that starts Django on port 8010
set DJANGO_RUN_PORT=8010
call %~dp0run_django.cmd

