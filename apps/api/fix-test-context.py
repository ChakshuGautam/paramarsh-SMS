#!/usr/bin/env python3
"""Fix SeedContext issues in test files"""
import re
import glob
import os

def fix_duplicate_options(content):
    """Fix duplicate options field"""
    # Pattern for duplicate options
    pattern = r'const context: SeedContext = \{[^}]*?options:[^}]+?options:[^}]+?\}'
    
    # Find all matches
    matches = re.finditer(pattern, content, re.DOTALL)
    
    for match in reversed(list(matches)):
        context_block = match.group(0)
        # Remove first options line (keep the second)
        lines = context_block.split('\n')
        new_lines = []
        found_options = False
        for line in lines:
            if 'options:' in line and not found_options:
                found_options = True
                continue  # Skip first options
            new_lines.append(line)
        new_block = '\n'.join(new_lines)
        content = content[:match.start()] + new_block + content[match.end():]
    
    return content

def fix_missing_schoolid(content):
    """Add missing schoolId to SeedContext"""
    # Pattern for SeedContext without schoolId
    pattern = r'(const context: SeedContext = \{[^}]*?branchId: testBranchId,)(\s+(?!schoolId))'
    
    def replacer(match):
        return match.group(1) + '\n      schoolId: \'test\',' + match.group(2)
    
    content = re.sub(pattern, replacer, content, flags=re.DOTALL)
    return content

def fix_logger_missing_metrics(content):
    """Add missing metrics to logger"""
    # Pattern for logger without metrics
    pattern = r'(logger: \{[^}]*?progress: jest\.fn\(\))(\s*\} as any)'
    
    def replacer(match):
        return match.group(1) + ',\n        metrics: jest.fn()' + match.group(2)
    
    content = re.sub(pattern, replacer, content, flags=re.DOTALL)
    return content

def fix_options_in_create(content):
    """Remove options field from prisma.create calls"""
    # Pattern for options field in invoice create
    pattern = r'(await prisma\.invoice\.create\(\{[^}]*?)options: \{ batchSize: 50[^}]+?\},\s*'
    content = re.sub(pattern, r'\1', content, flags=re.DOTALL)
    
    # Pattern for options field in academicYear create  
    pattern = r'(await prisma\.academicYear\.create\(\{[^}]*?)options: \{ batchSize: 50[^}]+?\},\s*'
    content = re.sub(pattern, r'\1', content, flags=re.DOTALL)
    
    return content

def main():
    test_files = glob.glob('/Users/__chaks__/repos/paramarsh-SMS/apps/api/src/seed/__tests__/entities/*.test.ts')
    
    for filepath in test_files:
        print(f"Processing {os.path.basename(filepath)}...")
        
        with open(filepath, 'r') as f:
            content = f.read()
        
        original = content
        
        # Apply fixes
        content = fix_duplicate_options(content)
        content = fix_missing_schoolid(content)
        content = fix_logger_missing_metrics(content)
        content = fix_options_in_create(content)
        
        if content != original:
            with open(filepath, 'w') as f:
                f.write(content)
            print(f"  Fixed {os.path.basename(filepath)}")
        else:
            print(f"  No changes needed for {os.path.basename(filepath)}")

if __name__ == '__main__':
    main()