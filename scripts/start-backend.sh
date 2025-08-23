#!/bin/bash

# Script to start the backend server on port 8080
# Port 8080 is now the default in package.json

echo "🚀 Starting backend server on port 8080..."

# Kill any existing process on port 8080
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

# Navigate to API directory
cd "$(dirname "$0")/../apps/api" || exit 1

# Start the backend in background
nohup bun run start:dev > backend.log 2>&1 &
BACKEND_PID=$!

echo "⏳ Waiting for backend to start..."
sleep 5

# Check if backend is running
MAX_ATTEMPTS=10
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    if curl -s http://localhost:8080/api/v1/health > /dev/null 2>&1 || curl -s http://localhost:8080/api/v1/students > /dev/null 2>&1; then
        echo "✅ Backend is running on port 8080 (PID: $BACKEND_PID)"
        echo $BACKEND_PID > backend.pid
        exit 0
    fi
    echo "Attempt $ATTEMPT/$MAX_ATTEMPTS: Waiting for backend..."
    sleep 2
    ATTEMPT=$((ATTEMPT + 1))
done

echo "❌ Failed to start backend after $MAX_ATTEMPTS attempts"
exit 1