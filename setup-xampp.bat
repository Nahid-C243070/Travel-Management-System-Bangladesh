@echo off
setlocal
cd /d "%~dp0"

echo =============================================
echo Travel Management System Bangladesh Setup
echo =============================================

if not exist .env (
  copy .env.example .env >nul
  echo Created .env from .env.example
) else (
  echo Existing .env found. It will not be overwritten.
)

echo.
echo Make sure XAMPP MySQL is running before database setup.
echo Installing Node dependencies...
call npm install
if errorlevel 1 goto :error

echo.
echo Creating and seeding travel_management_bd...
call npm run db:setup
if errorlevel 1 goto :error

echo.
echo Setup completed. Run start-dev.bat to launch the API.
pause
exit /b 0

:error
echo.
echo Setup failed. Read docs\XAMPP_SETUP_BN.md for troubleshooting.
pause
exit /b 1
