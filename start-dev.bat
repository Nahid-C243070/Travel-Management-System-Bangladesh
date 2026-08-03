@echo off
cd /d "%~dp0"
if not exist .env (
  echo .env is missing. Run setup-xampp.bat first.
  pause
  exit /b 1
)
call npm run dev
pause
