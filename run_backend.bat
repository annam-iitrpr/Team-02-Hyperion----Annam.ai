@echo off
title AASRA ML Pipeline Backend (Port 8000)
echo ========================================================
echo   AASRA Master ML Pipeline Server (Models 1, 2, 3, 5)
echo   Local High-Performance Dual-Serving Runtime
echo ========================================================
echo.

cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
