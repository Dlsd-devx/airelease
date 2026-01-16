#!/bin/bash

# AI Release - Local Development Start (No Docker Required)
echo "🚀 AI Release - Change Note Validator (Local Mode)"
echo "=================================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js found: $(node --version)"
echo "✓ npm found: $(npm --version)"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install || { echo "❌ Backend npm install failed"; exit 1; }
fi
echo "✓ Backend dependencies ready"
cd ..
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install || { echo "❌ Frontend npm install failed"; exit 1; }
fi
echo "✓ Frontend dependencies ready"
cd ..
echo ""

# Kill any existing processes on the ports
echo "🧹 Cleaning up old processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3002 | xargs kill -9 2>/dev/null || true
sleep 1
echo ""

# Start backend
echo "🚀 Starting backend on port 3001..."
cd backend
nohup npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../backend.pid
cd ..
echo "✓ Backend started (PID: $BACKEND_PID)"
echo ""

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✓ Backend is responding"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo "⚠️  Backend not responding, but continuing..."
    fi
done
echo ""

# Start frontend
echo "🚀 Starting frontend on port 3002..."
cd frontend
nohup npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../frontend.pid
cd ..
echo "✓ Frontend started (PID: $FRONTEND_PID)"
echo ""

echo "=================================================="
echo "✅ AI Release is now running!"
echo ""
echo "📱 Frontend:  http://localhost:3002"
echo "🔧 Backend:   http://localhost:3001"
echo "💚 Health:    http://localhost:3001/api/health"
echo ""
echo "ℹ️  Note: Port 3000 is used by Homepage"
echo "   AI Release frontend runs on port 3002"
echo ""
echo "View logs:"
echo "  tail -f backend.log"
echo "  tail -f frontend.log"
echo ""
echo "Stop services:"
echo "  ./stop-local.sh"
echo ""
echo "⏳ Frontend is starting (this may take 30-60 seconds)..."
echo "   Watch progress: tail -f frontend.log"
echo "=================================================="
