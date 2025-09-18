#!/bin/bash

echo "🔄 Starting services for Paramarsh SMS..."

# Start PostgreSQL if not running
if ! sudo service postgresql status > /dev/null 2>&1; then
    echo "Starting PostgreSQL..."
    sudo service postgresql start
    sleep 2
fi

# Verify PostgreSQL is accessible
if pg_isready -h localhost -p 5432 -U paramarsh > /dev/null 2>&1; then
    echo "✅ PostgreSQL is running"
else
    echo "⚠️  PostgreSQL is not accessible. Attempting to fix..."
    sudo service postgresql restart
    sleep 3
fi

# Optional: Start backend and frontend in background (commented out by default)
# Uncomment these lines if you want services to auto-start

# echo "Starting backend server..."
# cd /workspace/apps/api && nohup pnpm run start:dev > /tmp/backend.log 2>&1 &
# echo "Backend started (PID: $!). Logs at /tmp/backend.log"

# echo "Starting frontend server..."
# cd /workspace/apps/web && nohup pnpm run dev > /tmp/frontend.log 2>&1 &
# echo "Frontend started (PID: $!). Logs at /tmp/frontend.log"

echo ""
echo "✅ Services ready!"
echo ""
echo "🌐 Access points:"
echo "  Frontend:    http://localhost:3001"
echo "  Backend API: http://localhost:3005"
echo "  PostgreSQL:  localhost:5432"
echo ""
echo "💡 Tip: Use 'code .' to open VS Code in the workspace"
echo ""