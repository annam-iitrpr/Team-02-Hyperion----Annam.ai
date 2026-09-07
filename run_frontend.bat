@echo off
title AASRA Website Frontend (Port 3000)
cd /d "%~dp0frontend"

echo ======================================================================
echo   AASRA Next.js Website Frontend (Port 3000)
echo ======================================================================
echo.
echo Starting Next.js website dev server on http://localhost:3000 ...
echo.

npm run dev
if errorlevel 1 (
    echo.
    echo [ERROR] Frontend failed to start.
)
pause
