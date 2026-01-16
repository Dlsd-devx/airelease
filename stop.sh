#!/bin/bash

# AI Release - Stop Script
echo "🛑 Stopping AI Release services..."
echo ""

docker stop airelease-backend airelease-frontend 2>/dev/null
docker rm airelease-backend airelease-frontend 2>/dev/null

echo "✓ Services stopped and removed"
echo ""
echo "To start again, run: ./start.sh"
