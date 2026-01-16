#!/bin/bash

# AI Release - Build and Start Script
echo "🚀 AI Release - Change Note Validator"
echo "======================================"
echo ""

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    exit 1
fi

echo "✓ Docker found: $(docker --version)"
echo ""

# Build backend
echo "📦 Building backend..."
cd backend
docker build -t airelease-backend:latest . || { echo "❌ Backend build failed"; exit 1; }
cd ..
echo "✓ Backend built successfully"
echo ""

# Build frontend  
echo "📦 Building frontend..."
cd frontend
docker build -t airelease-frontend:latest . || { echo "❌ Frontend build failed"; exit 1; }
cd ..
echo "✓ Frontend built successfully"
echo ""

# Create network if it doesn't exist
docker network create airelease-network 2>/dev/null || true

# Stop and remove existing containers
echo "🧹 Cleaning up existing containers..."
docker stop airelease-backend airelease-frontend 2>/dev/null || true
docker rm airelease-backend airelease-frontend 2>/dev/null || true

# Start backend
echo "🚀 Starting backend..."
docker run -d \
  --name airelease-backend \
  --network airelease-network \
  -p 3001:3001 \
  -v "$PWD/data:/app/data:ro" \
  -v "$PWD/change-notes.md:/app/change-notes.md:ro" \
  -e NODE_ENV=production \
  -e PORT=3001 \
  --restart unless-stopped \
  airelease-backend:latest

if [ $? -eq 0 ]; then
    echo "✓ Backend started successfully"
else
    echo "❌ Backend failed to start"
    exit 1
fi

# Start frontend
echo "🚀 Starting frontend..."
docker run -d \
  --name airelease-frontend \
  --network airelease-network \
  -p 3000:80 \
  -e REACT_APP_API_URL=http://localhost:3001/api \
  --restart unless-stopped \
  airelease-frontend:latest

if [ $? -eq 0 ]; then
    echo "✓ Frontend started successfully"
else
    echo "❌ Frontend failed to start"
    exit 1
fi

echo ""
echo "======================================"
echo "✅ AI Release is now running!"
echo ""
echo "📱 Frontend:  http://localhost:3000"
echo "🔧 Backend:   http://localhost:3001"
echo "💚 Health:    http://localhost:3001/api/health"
echo ""
echo "To view logs:"
echo "  docker logs -f airelease-backend"
echo "  docker logs -f airelease-frontend"
echo ""
echo "To stop:"
echo "  ./stop.sh"
echo "======================================"
