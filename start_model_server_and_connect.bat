@echo off
setlocal enabledelayedexpansion

title AASRA AI Models — One-Click Live Connection Bridge
color 0B

echo ==============================================================================
echo              AASRA EVIDENCE-BASED AGRICULTURAL INTELLIGENCE                   
echo          One-Click Model Server & Live Deployed Website Auto-Connector        
echo ==============================================================================
echo.

cd /d "%~dp0"

:: Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python was not found on your system PATH.
    echo Please ensure Python 3.9+ is installed and available in PATH.
    echo.
    pause
    exit /b 1
)

:: Check if DEPLOYED_URL.txt exists
if not exist "DEPLOYED_URL.txt" (
    echo http://localhost:3000 > DEPLOYED_URL.txt
    echo [INFO] Created DEPLOYED_URL.txt with default (http://localhost:3000).
    echo When your website is deployed, paste its public URL into DEPLOYED_URL.txt
    echo (for example: https://your-aasra-app.vercel.app)
    echo.
)

set /p DEPLOYED_URL=<DEPLOYED_URL.txt
set DEPLOYED_URL=%DEPLOYED_URL: =%

echo [CONFIG] Target Website: %DEPLOYED_URL%
echo [INFO] Starting local FastAPI ML server and generating secure HTTPS tunnel...
echo.

python backend/tunnel_bridge.py %DEPLOYED_URL%

echo.
echo [INFO] Model bridge process closed.
pause
