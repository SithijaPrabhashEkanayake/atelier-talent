#!/bin/bash
# ==============================================================================
# ATELIER Talent — One-Click Mac/Linux Viva Voce Demonstration Launcher
# Designed for Sandun Prabath's Final Viva Voce Presentation on macOS
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=========================================================="
echo "  ATELIER Talent — Starting Mac Presentation Environment"
echo "  BSc (Hons) Software Engineering — NSBM Green University"
echo "  Candidate: Sandun Prabath (28607)"
echo "=========================================================="

# Check Node version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ from https://nodejs.org"
    exit 1
fi

NODE_VER=$(node -v)
echo "✅ Node.js detected: $NODE_VER"

# Check macOS AirPlay Receiver port 5000 conflict
if command -v lsof &> /dev/null; then
    AIRPLAY_PID=$(lsof -ti :5000 -sTCP:LISTEN || true)
    if [ -n "$AIRPLAY_PID" ]; then
        PROC_NAME=$(ps -p "$AIRPLAY_PID" -o comm= || true)
        echo ""
        echo "⚠️  [WARNING: PORT 5000 CONFLICT DETECTED]"
        echo "   Process '$PROC_NAME' (PID $AIRPLAY_PID) is listening on port 5000."
        echo "   On macOS, 'ControlCenter' (AirPlay Receiver) uses port 5000 by default."
        echo "   To prevent backend crashes, please disable AirPlay Receiver:"
        echo "   👉 System Settings > General > AirDrop & AirPlay > Turn OFF 'AirPlay Receiver'."
        echo "----------------------------------------------------------"
        read -p "Press [Enter] to continue once verified, or Ctrl+C to cancel..."
    fi
fi

# Ensure .env exists in backend
if [ ! -f "backend/.env" ]; then
    echo "⚙️ Creating backend/.env from .env.example..."
    cp backend/.env.example backend/.env
fi

# Start Backend and Frontend
echo ""
echo "🚀 Launching Backend API & Socket.io Server (Port 5000)..."
(cd backend && npm run dev) &
BACKEND_PID=$!

echo "🚀 Launching Frontend Client with Vite (Port 5173)..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "=========================================================="
echo "  ✨ Platform is booting up!"
echo "  - Backend API:    http://localhost:5000"
echo "  - Frontend App:   http://localhost:5173"
echo "  - Admin Login:    admin@demo.talent / Password123"
echo "  - Model Login:    model1@demo.talent / Password123"
echo "  - Recruiter:      organizer1@demo.talent / Password123"
echo "=========================================================="
echo "Press Ctrl+C to shut down all services."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit 0" SIGINT SIGTERM
wait
