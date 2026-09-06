@echo off
title AASRA Cloudflare Quick Tunnel (Free Zero-Billing Public URL)
echo ========================================================
echo   AASRA Cloudflare Quick Tunnel
echo   Exposing http://localhost:8000 to public trycloudflare.com
echo ========================================================
echo.

if not exist cloudflared.exe (
    echo Downloading official cloudflared binary...
    curl.exe -L -o cloudflared.exe https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe
)

echo Starting Cloudflare Tunnel...
echo Look for the URL ending with .trycloudflare.com below:
echo (Copy that URL and paste it into Vercel as FASTAPI_URL)
echo.
cloudflared.exe tunnel --url http://localhost:8000
pause
