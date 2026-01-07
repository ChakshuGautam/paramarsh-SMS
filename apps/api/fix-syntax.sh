#!/bin/bash

# Fix TypeScript syntax errors in E2E test files

echo "Fixing TypeScript syntax errors in E2E test files..."

# Fix object property syntax: branchId', 'value', -> branchId: 'value',
find test -name "*.e2e-spec.ts" -exec sed -i '' "s/branchId', 'dps-main',/branchId: 'dps-main',/g" {} \;
find test -name "*.e2e-spec.ts" -exec sed -i '' "s/branchId', 'dps-north',/branchId: 'dps-north',/g" {} \;
find test -name "*.e2e-spec.ts" -exec sed -i '' "s/branchId', 'dps-south',/branchId: 'dps-south',/g" {} \;
find test -name "*.e2e-spec.ts" -exec sed -i '' "s/branchId', 'dps-east',/branchId: 'dps-east',/g" {} \;
find test -name "*.e2e-spec.ts" -exec sed -i '' "s/branchId', 'dps-west',/branchId: 'dps-west',/g" {} \;
find test -name "*.e2e-spec.ts" -exec sed -i '' "s/branchId', 'kvs-central',/branchId: 'kvs-central',/g" {} \;

# Fix where clause syntax: where: { branchId', 'value' } -> where: { branchId: 'value' }
find test -name "*.e2e-spec.ts" -exec sed -i '' "s/{ branchId', 'dps-main' }/{ branchId: 'dps-main' }/g" {} \;
find test -name "*.e2e-spec.ts" -exec sed -i '' "s/{ branchId', 'dps-north' }/{ branchId: 'dps-north' }/g" {} \;
find test -name "*.e2e-spec.ts" -exec sed -i '' "s/{ branchId', 'dps-south' }/{ branchId: 'dps-south' }/g" {} \;
find test -name "*.e2e-spec.ts" -exec sed -i '' "s/{ branchId', 'dps-east' }/{ branchId: 'dps-east' }/g" {} \;
find test -name "*.e2e-spec.ts" -exec sed -i '' "s/{ branchId', 'dps-west' }/{ branchId: 'dps-west' }/g" {} \;
find test -name "*.e2e-spec.ts" -exec sed -i '' "s/{ branchId', 'kvs-central' }/{ branchId: 'kvs-central' }/g" {} \;

# Fix expect syntax: expect(obj.prop', 'value'); -> expect(obj.prop).toBe('value');
find test -name "*.e2e-spec.ts" -exec sed -i '' "s/expect(\([^']*\)', '\([^']*\)');/expect(\1).toBe('\2');/g" {} \;

# Fix expect syntax for specific patterns with branchId
find test -name "*.e2e-spec.ts" -exec sed -i '' "s/expect(\([^']*\.branchId\)', '\([^']*\)');/expect(\1).toBe('\2');/g" {} \;

echo "Syntax fixes completed!"

# Check for any remaining syntax errors
echo "Checking for remaining TypeScript compilation errors..."
npx tsc --noEmit test/*.e2e-spec.ts 2>&1 | head -20