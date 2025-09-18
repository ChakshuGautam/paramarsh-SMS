# Test Scenarios for Self-Evolution System

Test the self-evolving orchestrator with these real scenarios from your codebase.

## 🧪 Test Scenario 1: Module Name Mismatch Issue

### The Problem
Backend uses kebab-case: `academic-years`, `fee-schedules`
Frontend uses camelCase: `academicYears`, `feeSchedules`

### Test Command
```bash
"Implement the holidays module for managing school holidays"
```

### Expected Self-Evolution Behavior
1. **Pre-Check**: System should check ISSUES_AND_LEARNINGS.md
2. **New Issue Detection**: Discover naming convention mismatch
3. **Documentation**: Add Issue #006 about naming conventions
4. **Pattern Creation**: Add to patterns/naming-patterns.md
5. **Agent Update**: Update both backend-implementer and frontend-implementer

### Verification
- Check if `.claude/ISSUES_AND_LEARNINGS.md` gets Issue #006
- Check if agents handle naming correctly in future

---

## 🧪 Test Scenario 2: Missing Audit Module in Frontend

### The Problem
`audit-logs` exists in backend but not in frontend

### Test Command
```bash
"Create the frontend UI for audit-logs module"
```

### Expected Self-Evolution Behavior
1. **Pre-Check**: System finds no prior audit-logs UI issues
2. **Discovery**: Frontend-implementer discovers backend uses different response format
3. **Issue Documentation**: Records audit-specific data structure issues
4. **Pattern**: Creates audit-trail UI pattern
5. **Evolution**: Updates frontend-implementer with audit log display knowledge

### Verification
- New pattern in `.claude/patterns/component-patterns.md#audit-display`
- Agent handles timestamp and user tracking correctly

---

## 🧪 Test Scenario 3: Test the Date Issue Prevention

### The Problem
We documented Issue #002 about date handling

### Test Command
```bash
"Add a birthDate field to the teachers module"
```

### Expected Self-Evolution Behavior
1. **Pre-Check**: ✅ Finds Issue #002 in ISSUES_AND_LEARNINGS.md
2. **Pattern Application**: Uses safe date formatting pattern
3. **Proactive Prevention**: Adds date validation automatically
4. **No New Issues**: Should work first try

### Verification
```bash
# Check the implementation
grep -r "formatDate\|Invalid time" apps/web/app/admin/resources/teachers/

# Should find safe date handling, no "Invalid time value" possible
```

---

## 🧪 Test Scenario 4: Complex Module with Relationships

### The Problem
`library` module needs books, borrowers, due dates, fines

### Test Command
```bash
"Implement a library management module with books and borrowing"
```

### Expected Self-Evolution Behavior
1. **Pattern Recognition**: Identifies similarity to invoices (financial) + attendance (date tracking)
2. **Issue Prevention**: Applies patterns from Issues #002 (dates), #004 (API format)
3. **New Patterns**: Documents library-specific patterns (due date calculations, fine computation)
4. **Agent Specialization**: May create library-specialized sub-agent if complex

### Verification
- Check for new patterns in `.claude/patterns/domain-patterns.md`
- Verify date handling for due dates
- Check API response format compliance

---

## 🧪 Test Scenario 5: Test Repeated Failure (2-Strike Rule)

### The Problem
Intentionally trigger the 2-strike rule

### Test Command
```bash
# First attempt
"Create a notifications module that sends emails"

# When it fails (no email service configured), try again:
"Fix the notifications module email sending"
```

### Expected Self-Evolution Behavior
1. **First Failure**: Documents email configuration issue
2. **Second Failure**: TRIGGERS 2-STRIKE RULE
3. **Agent Evolution**: Updates backend-implementer with email service knowledge
4. **New Sub-Agent**: Might create `notification-specialist` agent

### Verification
```bash
# Check agent evolution log
cat .claude/AGENT_EVOLUTION.log | grep "backend-implementer"

# Should show version update from v1.3 to v1.4
```

---

## 🧪 Test Scenario 6: Test Cross-Module Pattern

### The Problem
Many modules need "bulk operations" (bulk delete, bulk update status)

### Test Command
```bash
"Add bulk operations to the exams module"
```

### Expected Self-Evolution Behavior
1. **Pattern Detection**: After 3rd bulk operation implementation
2. **Pattern Documentation**: Creates patterns/api-patterns.md#bulk-operations
3. **Cross-Agent Update**: Updates both backend-implementer and frontend-implementer
4. **Reusability**: Future modules get bulk operations automatically

### Verification
- Pattern documented after 3 uses
- Next module gets bulk operations without asking

---

## 🧪 Test Scenario 7: Test Real Component Import Issue

### The Problem
We fixed Issue #001 about mock vs real components

### Test Command
```bash
"Create tests for the rooms module frontend"
```

### Expected Self-Evolution Behavior
1. **Pre-Check**: ✅ Finds Issue #001
2. **Correct Implementation**: Uses real components from start
3. **No Mock Components**: Imports from `@/app/admin/resources/rooms/`
4. **Success First Try**: No need for fixes

### Verification
```bash
# Check the test file
grep "import.*from.*app/admin/resources" test/resources/rooms/*.test.tsx

# Should find real imports, no mock components
```

---

## 📊 How to Run the Tests

### Step 1: Clear the Learning Repository (Optional)
```bash
# To test from scratch
mv .claude/ISSUES_AND_LEARNINGS.md .claude/ISSUES_AND_LEARNINGS.backup.md
```

### Step 2: Run Test Scenarios
Execute each test command and observe:
1. Does it check the learning repository?
2. Does it apply known patterns?
3. Does it document new issues?
4. Does it update agents after failures?

### Step 3: Verify Evolution
```bash
# Check issues were documented
cat .claude/ISSUES_AND_LEARNINGS.md

# Check patterns were created
ls .claude/patterns/

# Check agent evolution
cat .claude/AGENT_EVOLUTION.log

# Check agent performance metrics
cat .claude/agents/performance-metrics.json
```

---

## 🎯 Success Criteria

### Immediate Success:
- [ ] System checks ISSUES_AND_LEARNINGS.md before each task
- [ ] Known issues are avoided (like date handling)
- [ ] New issues are documented immediately
- [ ] Patterns are created after 3 uses

### Evolution Success:
- [ ] Agents are updated after 2 failures
- [ ] Performance metrics are tracked
- [ ] Success rate improves over time
- [ ] Mean time to resolution decreases

### Advanced Success:
- [ ] New sub-agents created for complex domains
- [ ] Cross-agent learning occurs
- [ ] Pattern library grows and consolidates
- [ ] System handles new scenarios better over time

---

## 🔍 Real Issues to Test

### From Your Codebase:
1. **Files module**: Has backend but no frontend
2. **Preferences**: Has frontend but incomplete backend
3. **Rooms**: Has frontend but might need backend fixes
4. **Health module**: Backend only, needs frontend
5. **Tenant management**: Critical multi-tenancy features missing

### Known Pain Points:
1. **Date formatting**: Already documented but test prevention
2. **Mock vs Real**: Already documented but test prevention
3. **API format**: Test consistent application
4. **Multi-tenancy**: Test X-Branch-Id handling

---

## 📝 Test Execution Log Template

Use this to track your tests:

```markdown
### Test: [Scenario Name]
**Date**: [Date]
**Command**: [What you asked]

**Pre-Check Performed?**: Yes/No
**Issues Found**: [List any found]
**Patterns Applied**: [List any used]

**Result**: Success/Failure
**New Issues Documented?**: Yes/No - [Issue number]
**Agent Updated?**: Yes/No - [Version change]

**Notes**: [Any observations]
```

---

Start with Test Scenario 1 (holidays module) - it's simple and will test multiple aspects of the self-evolution system!