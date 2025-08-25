#!/bin/bash

# Script to refactor controllers to use constants and base controller

echo "🔄 Refactoring controllers to use shared constants..."

# Find all controller files
CONTROLLERS=$(find apps/api/src/modules -name "*.controller.ts" -type f)

for file in $CONTROLLERS; do
  echo "Processing: $file"
  
  # Check if file imports from common/constants
  if ! grep -q "from.*common/constants" "$file"; then
    # Add import for constants at the top of imports
    sed -i '' "1s/^/import { DEFAULT_BRANCH_ID } from '..\/..\/common\/constants';\n/" "$file"
  fi
  
  # Replace 'branch1' with DEFAULT_BRANCH_ID
  sed -i '' "s/'branch1'/DEFAULT_BRANCH_ID/g" "$file"
  sed -i '' 's/"branch1"/DEFAULT_BRANCH_ID/g' "$file"
  
  # Fix the import path based on module depth
  if [[ $file == *"modules/"*"/"*"/"*.controller.ts ]]; then
    # Three levels deep
    sed -i '' "s|from '\.\./\.\./common/constants'|from '../../../common/constants'|g" "$file"
  else
    # Two levels deep (most modules)
    sed -i '' "s|from '\.\./\.\./common/constants'|from '../../common/constants'|g" "$file"
  fi
done

echo "✅ Controllers refactored successfully!"