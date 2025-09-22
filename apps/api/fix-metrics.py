#!/usr/bin/env python3
import re
import glob
import os

def fix_metrics_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Pattern to find metrics blocks without startTime/endTime
    # Look for metrics: { with totalRecords but no startTime
    pattern = r'metrics: \{\s*totalRecords:'
    
    if re.search(pattern, content) and 'startTime: new Date(' not in content:
        print(f"Fixing {filepath}")
        
        # Replace metrics blocks that don't have startTime/endTime
        # Pattern to match the entire metrics block
        metrics_pattern = r'(metrics: \{)(\s*totalRecords:.*?duration: [^}]+)(})'
        
        def replace_metrics(match):
            return match.group(1) + '\n            startTime: new Date(startTime),\n            endTime: new Date(),' + match.group(2) + match.group(3)
        
        content = re.sub(metrics_pattern, replace_metrics, content, flags=re.DOTALL)
        
        # Also ensure the return statement has data, errors, warnings
        return_pattern = r'return \{([^}]*metrics:[^}]*\})\s*\};'
        
        def check_and_add_missing(match):
            block = match.group(1)
            result = 'return {' + block
            
            if 'data:' not in block and 'data?' not in block:
                result += ',\n          data: []'
            if 'errors:' not in block:
                result += ',\n          errors: []'
            if 'warnings:' not in block:
                result += ',\n          warnings: []'
            
            result += '\n        };'
            return result
        
        content = re.sub(return_pattern, check_and_add_missing, content, flags=re.DOTALL)
        
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    return False

# Process all seeder files
seeder_files = glob.glob('/Users/__chaks__/repos/paramarsh-SMS/apps/api/src/seed/entities/*.ts')
fixed_count = 0

for file in seeder_files:
    if fix_metrics_in_file(file):
        fixed_count += 1

print(f"Fixed {fixed_count} files")