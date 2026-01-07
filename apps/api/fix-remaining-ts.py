#!/usr/bin/env python3
"""Fix remaining TypeScript issues"""
import re
import glob

def fix_missing_schoolid_checkpoint(content):
    """Add missing schoolId to SeedContext in checkpoint test helper"""
    # Pattern for SeedContext without schoolId in checkpoint file
    pattern = r'(const context: SeedContext = \{\s+branchId: this\.branchId,\s+prisma: this\.prisma,)'
    
    def replacer(match):
        return match.group(1).rstrip(',') + ',\n      schoolId: \'test\','
    
    content = re.sub(pattern, replacer, content, flags=re.MULTILINE)
    return content

def fix_test_files_missing_schoolid(content):
    """Add missing schoolId to test files"""
    # Pattern for context without schoolId
    pattern = r'(const context: SeedContext = \{[^}]*?)(options: \{ batchSize:)'
    
    def replacer(match):
        # Check if schoolId already exists
        if 'schoolId:' in match.group(1):
            return match.group(0)
        # Add schoolId before options
        return match.group(1) + 'schoolId: \'test\',\n      ' + match.group(2)
    
    content = re.sub(pattern, replacer, content, flags=re.DOTALL)
    return content

def fix_duplicate_options_v2(content):
    """Remove duplicate options lines more aggressively"""
    lines = content.split('\n')
    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        # Check if this is the first of duplicate options lines
        if 'options: { batchSize: 50' in line and i > 0:
            # Look back to see if we just added an options line
            if i < len(lines) - 1 and 'options: { batchSize: 50' in lines[i+1]:
                # Skip this line
                i += 1
                continue
        new_lines.append(line)
        i += 1
    return '\n'.join(new_lines)

def main():
    # Fix checkpoint test helper
    filepath = '/Users/__chaks__/repos/paramarsh-SMS/apps/api/src/seed/__tests__/checkpoint-test-helper.ts'
    print(f"Processing {filepath}...")
    with open(filepath, 'r') as f:
        content = f.read()
    
    content = fix_missing_schoolid_checkpoint(content)
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    # Fix test files
    test_files = [
        '/Users/__chaks__/repos/paramarsh-SMS/apps/api/src/seed/__tests__/entities/ClassSubjectTeacherSeeder.test.ts',
        '/Users/__chaks__/repos/paramarsh-SMS/apps/api/src/seed/__tests__/entities/ExamSeeder.test.ts',
        '/Users/__chaks__/repos/paramarsh-SMS/apps/api/src/seed/__tests__/entities/ExamSessionSeeder.test.ts',
        '/Users/__chaks__/repos/paramarsh-SMS/apps/api/src/seed/__tests__/entities/FeeComponentSeeder.test.ts',
        '/Users/__chaks__/repos/paramarsh-SMS/apps/api/src/seed/__tests__/entities/FeeScheduleSeeder.test.ts',
        '/Users/__chaks__/repos/paramarsh-SMS/apps/api/src/seed/__tests__/entities/FeeStructureSeeder.test.ts',
        '/Users/__chaks__/repos/paramarsh-SMS/apps/api/src/seed/__tests__/entities/InvoiceSeeder.test.ts',
        '/Users/__chaks__/repos/paramarsh-SMS/apps/api/src/seed/__tests__/entities/MarkSeeder.test.ts',
        '/Users/__chaks__/repos/paramarsh-SMS/apps/api/src/seed/__tests__/entities/PaymentSeeder.test.ts',
        '/Users/__chaks__/repos/paramarsh-SMS/apps/api/src/seed/__tests__/entities/StudentPeriodAttendanceSeeder.test.ts',
        '/Users/__chaks__/repos/paramarsh-SMS/apps/api/src/seed/__tests__/entities/TeacherAttendanceSeeder.test.ts',
        '/Users/__chaks__/repos/paramarsh-SMS/apps/api/src/seed/__tests__/entities/TimetablePeriodSeeder.test.ts',
    ]
    
    for filepath in test_files:
        print(f"Processing {filepath.split('/')[-1]}...")
        with open(filepath, 'r') as f:
            content = f.read()
        
        original = content
        content = fix_test_files_missing_schoolid(content)
        content = fix_duplicate_options_v2(content)
        
        if content != original:
            with open(filepath, 'w') as f:
                f.write(content)
            print(f"  Fixed {filepath.split('/')[-1]}")

if __name__ == '__main__':
    main()