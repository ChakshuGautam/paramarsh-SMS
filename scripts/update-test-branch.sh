#!/bin/bash

# Update all test files to use 'test-branch' instead of 'branch1' for test isolation

echo "🔄 Updating test files to use 'test-branch' instead of 'branch1'..."

# Find all test files and replace branch1 with test-branch
find apps/api/test -name "*.ts" -type f | while read file; do
  if grep -q "'branch1'" "$file"; then
    echo "Updating: $file"
    sed -i '' "s/'branch1'/'test-branch'/g" "$file"
  fi
done

echo "✅ Test files updated to use 'test-branch'"
echo ""
echo "Note: You'll need to create test data for 'test-branch' by running:"
echo "  cd apps/api && npx prisma db seed -- --test"