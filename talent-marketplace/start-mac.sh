#!/bin/bash
# ==============================================================================
# ATELIER Talent — One-Click Mac/Linux Viva Voce Demonstration Launcher
# Candidate: Sandun Prabath (28607) — NSBM Green University
# Target: macOS (Apple Silicon M1/M2/M3/M4 & Intel)
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=========================================================="
echo "  ✨ ATELIER Talent — One-Click macOS Demonstration Launcher"
echo "  BSc (Hons) Software Engineering — NSBM Green University"
echo "  Candidate: Sandun Prabath (28607)"
echo "=========================================================="

# 1. Resolve Node.js PATH (Check default, Homebrew, and NVM)
if ! command -v node &> /dev/null; then
    if [ -s "$HOME/.nvm/nvm.sh" ]; then
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    elif [ -x "/opt/homebrew/bin/node" ]; then
        export PATH="/opt/homebrew/bin:$PATH"
    elif [ -x "/usr/local/bin/node" ]; then
        export PATH="/usr/local/bin:$PATH"
    fi
fi

if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not found in PATH."
    echo "   Please install Node.js 20+ from https://nodejs.org or via Homebrew: 'brew install node'"
    exit 1
fi

echo "✅ Node.js detected: $(node -v) ($(which node))"

# 2. Check for Windows-compiled native binaries (from USB/SSD manual transfers)
WINDOWS_BINARIES_DETECTED=false
if [ -d "backend/node_modules" ]; then
    if [ -n "$(find backend/node_modules/.bin -name "*.cmd" -o -name "*.exe" 2>/dev/null | head -n 1)" ] || [ -d "frontend/node_modules/@esbuild/win32-x64" ]; then
        WINDOWS_BINARIES_DETECTED=true
    fi
fi

if [ "$1" == "--install" ] || [ "$1" == "--clean" ] || [ "$WINDOWS_BINARIES_DETECTED" = true ]; then
    if [ "$WINDOWS_BINARIES_DETECTED" = true ]; then
        echo ""
        echo "⚠️  [WINDOWS BINARIES DETECTED IN NODE_MODULES]"
        echo "   You copied this folder from a Windows PC via SSD/USB."
        echo "   Windows compiled binaries cannot execute on macOS Apple Silicon / ARM64."
        echo "   Automatically wiping and reinstalling native macOS dependencies now..."
    else
        echo "📦 Reinstalling native macOS dependencies..."
    fi
    rm -rf backend/node_modules frontend/node_modules package-lock.json backend/package-lock.json frontend/package-lock.json
    echo "   Installing backend dependencies..."
    (cd backend && npm install)
    echo "   Installing frontend dependencies..."
    (cd frontend && npm install)
    echo "✅ Dependencies successfully installed for macOS!"
fi

# 3. Auto-install if node_modules are missing
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Backend dependencies missing. Installing for macOS..."
    (cd backend && npm install)
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Frontend dependencies missing. Installing for macOS..."
    (cd frontend && npm install)
fi

# 4. macOS AirPlay Receiver port 5000 conflict detection & resolution
BACKEND_PORT=5000
FRONTEND_PORT=5173

if command -v lsof &> /dev/null; then
    PORT_5000_PID=$(lsof -ti :5000 -sTCP:LISTEN 2>/dev/null || true)
    if [ -n "$PORT_5000_PID" ]; then
        PROC_NAME=$(ps -p "$PORT_5000_PID" -o comm= 2>/dev/null || true)
        echo ""
        echo "⚠️  [PORT 5000 IN USE: AIRPLAY RECEIVER DETECTED]"
        echo "   Process '$PROC_NAME' (PID: $PORT_5000_PID) is currently listening on port 5000."
        echo "   On macOS (Monterey, Ventura, Sonoma, Sequoia), Apple AirPlay uses port 5000 by default."
        echo ""
        echo "   👉 Option 1 (Recommended): Turn OFF AirPlay Receiver:"
        echo "      System Settings > General > AirDrop & AirPlay > Turn OFF 'AirPlay Receiver'."
        echo "      (Then hit Enter to continue on Port 5000)"
        echo ""
        echo "   👉 Option 2 (Instant Fallback): Switch to fallback Port 5001"
        echo "      (Type 'f' and hit Enter)"
        echo "----------------------------------------------------------"
        read -p "Select option [Enter = proceed on 5000 / 'f' = fallback to 5001]: " PORT_INPUT
        if [ "$PORT_INPUT" == "f" ] || [ "$PORT_INPUT" == "F" ]; then
            BACKEND_PORT=5001
            echo "⚡ Switched Backend to Port 5001!"
        fi
    fi
fi

# 5. Auto-configure backend/.env if missing
# Never hardcode real credentials here — this script is committed to git.
# Generate a fresh random JWT secret and leave MONGO_URI/Cloudinary as
# placeholders the user must fill in (or point at the local dev-mongo.js
# instance — see backend/README / MAC_SETUP.md).
if [ ! -f "backend/.env" ]; then
    echo "⚙️ Creating backend/.env from the example template..."
    cp backend/.env.example backend/.env
    GENERATED_JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
    sed -i.bak "s#^PORT=.*#PORT=$BACKEND_PORT#" backend/.env
    sed -i.bak "s#^JWT_SECRET=.*#JWT_SECRET=$GENERATED_JWT_SECRET#" backend/.env
    rm -f backend/.env.bak
    echo "⚠️  backend/.env created with a generated JWT_SECRET but PLACEHOLDER"
    echo "    MONGO_URI and Cloudinary values. Edit backend/.env and fill in:"
    echo "      - MONGO_URI (your MongoDB Atlas URI, or run"
    echo "        'node backend/scripts/dev-mongo.js' for a disposable local DB)"
    echo "      - CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET"
fi

# 6. Launch Backend and Frontend in parallel
echo ""
echo "🚀 Launching Backend API & WebSocket Server on Port $BACKEND_PORT..."
PORT=$BACKEND_PORT (cd backend && npm run dev) &
BACKEND_PID=$!

echo "🚀 Launching Frontend Client on Port $FRONTEND_PORT..."
if [ "$BACKEND_PORT" -ne 5000 ]; then
    VITE_API_URL="http://localhost:$BACKEND_PORT/api" VITE_SOCKET_URL="http://localhost:$BACKEND_PORT" (cd frontend && npm run dev) &
else
    (cd frontend && npm run dev) &
fi
FRONTEND_PID=$!

echo ""
echo "=========================================================="
echo "  🎉 ATELIER Talent is RUNNING LIKE BUTTER on macOS!"
echo "  - Frontend App:   http://localhost:5173"
echo "  - Backend API:    http://localhost:$BACKEND_PORT"
echo "  - Superadmin:     admin@demo.talent / Password123"
echo "  - Model Talent:   model1@demo.talent / Password123"
echo "  - Recruiter:      organizer1@demo.talent / Password123"
echo "=========================================================="
echo "💡 Press Ctrl+C at any time to gracefully shut down."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit 0" SIGINT SIGTERM
wait
