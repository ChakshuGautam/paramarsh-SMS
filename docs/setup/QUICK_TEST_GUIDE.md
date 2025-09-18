# Quick Test Guide for Self-Evolution System

## 🚀 Immediate Test Commands

Try these commands to test the self-evolution system:

### Test 1: Missing Tests (Rooms Module)
```bash
"Create comprehensive tests for the rooms module frontend"
```
**Watch for**: 
- Should check Issue #001 (mock vs real components)
- Should use real imports from the start
- Should handle dates safely (Issue #002)

### Test 2: New Module (Holidays)
```bash
"Implement the holidays module for managing school holidays and vacations"
```
**Watch for**:
- Naming convention discovery (kebab vs camel case)
- Should document as new issue
- Should create pattern for future modules

### Test 3: Missing Frontend (Audit Logs)
```bash
"Create the frontend UI for the audit-logs module"
```
**Watch for**:
- Discovery of backend structure
- Pattern creation for audit displays
- Timestamp handling patterns

### Test 4: Add Feature with Known Issue (Dates)
```bash
"Add dateOfJoining field to the staff module"
```
**Watch for**:
- Should find Issue #002 immediately
- Should implement safe date handling
- No "Invalid time value" errors

### Test 5: Bulk Operations Pattern
```bash
"Add bulk delete and bulk status update to the payments module"
```
**Watch for**:
- Pattern recognition after 3rd implementation
- Documentation in patterns/api-patterns.md
- Reuse in future modules

## 🔍 What to Look For

### Before Task Execution:
```yaml
✅ "Checking ISSUES_AND_LEARNINGS.md for similar issues..."
✅ "Found Issue #001: Mock vs Real Component Testing"
✅ "Applying pattern from patterns/testing-patterns.md"
```

### During Execution:
```yaml
✅ "Watching for known issues: #001, #002, #003"
✅ "Applying safe date formatting pattern"
✅ "Using real component imports"
```

### After Execution:
```yaml
✅ "Documenting new pattern: bulk-operations"
✅ "Updating ISSUES_AND_LEARNINGS.md with Issue #006"
✅ "Agent backend-implementer updated to v1.4"
```

## 📋 Verification Commands

After running test scenarios:

```bash
# Check if issues were documented
cat .claude/ISSUES_AND_LEARNINGS.md | grep "Issue #" | tail -5

# Check if patterns were created
ls -la .claude/patterns/

# Check agent evolution (if created)
cat .claude/AGENT_EVOLUTION.log 2>/dev/null || echo "No evolution log yet"

# Check the actual implementation
ls test/resources/rooms/  # Should have real test files
grep "import.*from.*app/admin" test/resources/rooms/*.test.tsx  # Real imports

# Check for date safety
grep -r "formatDate\|Invalid time" apps/web/app/admin/resources/staff/
```

## 🎯 Success Indicators

### ✅ System is Working If:
1. It mentions checking ISSUES_AND_LEARNINGS.md before starting
2. It applies patterns without you asking
3. It documents new issues automatically
4. It avoids known problems (like mock components)

### ❌ System Needs Improvement If:
1. Makes same mistake twice (like using mock components)
2. Doesn't check learning repository
3. Doesn't document new patterns
4. Doesn't update agents after failures

## 💡 Pro Tips

1. **Start with Test 1** (rooms tests) - it should immediately use real components
2. **Then try Test 4** (date field) - it should handle dates safely without being told
3. **Watch the output** - the system should mention checking issues and applying patterns
4. **Check the files** - `.claude/ISSUES_AND_LEARNINGS.md` should grow with new issues

---

**Ready to test?** Start with:
```bash
"Create comprehensive tests for the rooms module frontend"
```

The system should automatically avoid all the mistakes we documented!