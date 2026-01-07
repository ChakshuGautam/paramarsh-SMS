#!/bin/bash

# Single script to reset, seed, and verify the test database
# No need to set environment variables - all hardcoded for test DB

echo "🔄 Resetting and seeding test database..."
echo "================================================"

# Set the test database URL
export DATABASE_URL='postgresql://test_user:test_pass@localhost:55058/test_db?schema=public'

# Reset the database
echo "📦 Resetting database schema..."
npx prisma db push --force-reset --skip-generate

# Run the seed
echo ""
echo "🌱 Seeding database..."
echo "================================================"
npx prisma db seed

# The seed script now includes verification built-in
# It will show the summary at the end automatically

echo ""
echo "✅ Process complete! Check the summary above."