#!/bin/bash

# Fix remaining options lines that appear inside where clauses
files=$(find src/seed/__tests__/entities -name "*.ts")

for file in $files; do
  echo "Cleaning $file"
  
  # Remove options line that appears inside where clause
  sed -i '' '/where: {/,/}/{
    /options: .*skipValidation/d
  }' "$file"
  
  # Remove empty lines before branchId (fixing duplicate issue)
  sed -i '' '/^[[:space:]]*$/,/branchId: testBranchId/{
    /^[[:space:]]*$/d
  }' "$file"
done

echo "Cleaned all test files"