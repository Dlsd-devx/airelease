#!/bin/bash

# AI Release - Stop Local Services
echo "🛑 Stopping AI Release services..."
echo ""

# Kill processes by PID if files exist
if [ -f "backend.pid" ]; then
    BACKEND_PID=$(cat backend.pid)
    kill $BACKEND_PID 2>/dev/null && echo "✓ Backend stopped (PID: $BACKEND_PID)"
    rm backend.pid
fi

if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    kill $FRONTEND_PID 2>/dev/null && echo "✓ Frontend stopped (PID: $FRONTEND_PID)"
    rm frontend.pid
fi

# Also kill by port just to be sure
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:3002 | xargs kill -9 2>/dev/null

echo ""
echo "✓ All services stopped"
echo ""
echo "To start again, run: ./start-local.sh"
