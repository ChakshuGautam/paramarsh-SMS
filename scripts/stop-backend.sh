#!/bin/bash

# Script to stop the backend server

echo "🛑 Stopping backend server..."

# Check for PID file
if [ -f "$(dirname "$0")/../apps/api/backend.pid" ]; then
    PID=$(cat "$(dirname "$0")/../apps/api/backend.pid")
    kill -9 $PID 2>/dev/null && echo "✅ Backend stopped (PID: $PID)"
    rm "$(dirname "$0")/../apps/api/backend.pid"
else
    # Fallback: Kill any process on port 8080
    lsof -ti:8080 | xargs kill -9 2>/dev/null && echo "✅ Killed process on port 8080" || echo "ℹ️ No backend process found"
fi