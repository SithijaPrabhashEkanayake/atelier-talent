@echo off
REM ==============================================================================
REM ATELIER Talent — One-Click Windows Viva Voce Demonstration Launcher
REM Candidate: Sandun Prabath (28607) - NSBM Green University
REM ==============================================================================

echo ==========================================================
echo   ATELIER Talent -- Starting Presentation Environment (PC)
echo   Candidate: Sandun Prabath (28607)
echo ==========================================================

cd /d "%~dp0"

if not exist "backend\.env" (
    echo Creating backend\.env from .env.example...
    copy backend\.env.example backend\.env
)

echo Starting Backend API and Socket.io server...
start "ATELIER Backend (Port 5000)" cmd /k "cd backend && npm run dev"

timeout /t 2 /nobreak >nul

echo Starting Frontend Vite Client...
start "ATELIER Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo ==========================================================
echo   Backend and Frontend running in separate terminals!
echo   Frontend URL: http://localhost:5173
echo   Admin Login:  admin@demo.talent / Password123
echo   Model Login:  model1@demo.talent / Password123
echo ==========================================================
