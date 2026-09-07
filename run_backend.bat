@echo off
title AASRA ML Pipeline Backend (Port 8000)
cd /d "%~dp0backend"

echo ======================================================================
echo   AASRA Master ML Pipeline Server (Models 1, 2, 3, 5, 6)
echo   PS-02 Stress Risk, Action Gate, PS-03 Ranker, PS-07 Yield & Double ML
echo ======================================================================
echo.
echo Starting FastAPI ML server on http://127.0.0.1:8000 ...
echo.

python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
if errorlevel 1 (
    echo.
    echo [ERROR] Backend failed to start. Ensure Python 3.11+ is installed.
)
pause
