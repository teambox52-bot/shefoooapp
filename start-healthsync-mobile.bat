@echo off
setlocal
cd /d "%~dp0"
where python >nul 2>nul
if %errorlevel%==0 (
  python tools\healthsync_mobile_cli.py
  exit /b %errorlevel%
)
where py >nul 2>nul
if %errorlevel%==0 (
  py tools\healthsync_mobile_cli.py
  exit /b %errorlevel%
)
echo Python is not installed or not in PATH.
exit /b 1
