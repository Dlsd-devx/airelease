#!/bin/bash

# Show logs for both services
echo "📋 Viewing AI Release logs (Ctrl+C to exit)"
echo "============================================"
echo ""

docker logs -f --tail=50 airelease-backend &
BACKEND_PID=$!

docker logs -f --tail=50 airelease-frontend &
FRONTEND_PID=$!

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

wait
