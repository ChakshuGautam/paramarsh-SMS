#!/bin/bash

# Seed Remote Database Script for Paramarsh SMS
# Run this inside the API container or on server with Node.js

set -e

echo "🌱 Setting up Paramarsh SMS database schema and seed data..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this from the API directory."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🔄 Generating Prisma client..."
npx prisma generate

echo "🗄️ Setting up database schema..."
npx prisma db push --force-reset

echo "🌱 Running seed data generation..."
npm run seed

echo "✅ Database setup and seeding complete!"

# Verify seed data
echo "📊 Verifying seed data..."
npx prisma db execute --stdin << 'EOF'
SELECT 
    'Students' as entity, 
    COUNT(*) as count 
FROM "Student"
UNION ALL
SELECT 'Teachers', COUNT(*) FROM "Teacher"
UNION ALL
SELECT 'Guardians', COUNT(*) FROM "Guardian"
UNION ALL
SELECT 'Classes', COUNT(*) FROM "Class"
UNION ALL
SELECT 'FeeStructures', COUNT(*) FROM "FeeStructure"
UNION ALL
SELECT 'Invoices', COUNT(*) FROM "Invoice"
ORDER BY entity;
EOF

echo "🎉 Remote database setup complete!"
echo ""
echo "Database contains:"
echo "- Multiple branches with composite IDs (dps-main, kvs-central, etc.)"
echo "- 500+ students per branch with Indian names and context"
echo "- Teachers, guardians, classes, and fee structures"
echo "- Sample invoices and payments"
echo ""
echo "You can now connect to the database using:"
echo "postgresql://paramarsh:paramarsh123@localhost:5432/paramarsh_sms"