@echo off
title AASRA Full-Stack Launcher
cd /d "%~dp0"

echo ======================================================================
echo   AASRA All-in-One Full Stack Launcher
echo   Starting Backend (FastAPI :8000) & Frontend (Next.js :3000)
echo ======================================================================
echo.

echo [1/2] Launching Python FastAPI ML Pipeline Server in new window...
start "AASRA Backend (Port 8000)" cmd /k "%~dp0run_backend.bat"

echo Waiting 3 seconds for ML models to load into memory...
timeout /t 3 /nobreak >nul

echo [2/2] Launching Next.js Website Frontend in new window...
start "AASRA Frontend (Port 3000)" cmd /k "%~dp0run_frontend.bat"

echo.
echo ======================================================================
echo   Both servers launched successfully!
echo   - Website URL: http://localhost:3000
echo   - Backend ML API: http://127.0.0.1:8000/docs
echo ======================================================================
echo.
echo Opening website in browser...
timeout /t 2 /nobreak >nul
start http://localhost:3000
