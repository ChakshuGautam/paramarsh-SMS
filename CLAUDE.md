# CLAUDE.md - Self-Evolving Agent Orchestrator

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 MANDATORY AGENT USAGE RULES
1. **Frontend Tests**: ALWAYS use `frontend-tester` agent EXCLUSIVELY
2. **Backend Tests**: Use `tester` agent
3. **Frontend UI**: Use `frontend-implementer` agent
4. **Backend API**: Use `backend-implementer` agent
5. **NEVER** write frontend tests without invoking `frontend-tester`
6. **NEVER** let main Claude write tests - delegate to specialists

> **📚 Documentation**: See `docs/` for comprehensive system documentation
> **🧠 Learning Repository**: See `.claude/ISSUES_AND_LEARNINGS.md` for documented issues and solutions
> **🔄 Evolution Log**: See `.claude/AGENT_EVOLUTION.log` for agent update history
> **Quick Reference**: See `.claude/QUICK_REFERENCE.md` for commands and checklists

# Paramarsh SMS - School Management System

## 🧠 Self-Evolution Protocol (MANDATORY)

### BEFORE ANY TASK - Learning Check
The orchestrator MUST:
1. **Check Issue Repository** (`.claude/ISSUES_AND_LEARNINGS.md`)
   - Search for similar issues/tasks
   - Apply documented solutions
   - Avoid known pitfalls

2. **Pattern Recognition**
   - Review `.claude/patterns/` for applicable patterns
   - Use proven solutions first
   - Document new patterns if discovered

3. **Agent Selection**
   - Choose agent based on task type AND past performance
   - Check agent's recent failure rate
   - Use specialized sub-agents for known problem areas

### AFTER EVERY CHANGE - Learning Capture
1. **Analyze Results**
   - Did it work first try? If not, why?
   - What patterns emerged?
   - What could be improved?

2. **Document Learnings**
   - Update ISSUES_AND_LEARNINGS.md immediately
   - Add to pattern library if reusable
   - Update agent definition if needed

3. **Evolution Trigger**
   - If agent fails 2x on similar task → UPDATE AGENT
   - If pattern occurs 3x → DOCUMENT PATTERN
   - If new tech/library → CREATE SUB-AGENT

## 📚 Learning Repository Structure

```
.claude/
├── ISSUES_AND_LEARNINGS.md     # Central issue/solution repository
├── AGENT_EVOLUTION.log          # Agent update history
├── patterns/
│   ├── testing-patterns.md     # Test patterns (mock vs real, etc.)
│   ├── component-patterns.md   # UI component patterns
│   ├── api-patterns.md         # API design patterns
│   ├── error-patterns.md       # Common errors and fixes
│   └── validation-patterns.md  # Validation approaches
└── agents/
    ├── definitions/             # Agent definitions (auto-updated)
    ├── specializations/         # Task-specific configs
    └── performance-metrics.json # Agent success rates
```

## 🔄 Orchestration Workflow with Learning

### Phase 1: Pre-Execution Intelligence Gathering
```yaml
MANDATORY before ANY task:
  1. Query ISSUES_AND_LEARNINGS.md:
     - "Has this been done before?"
     - "What issues occurred?"
     - "What solution worked?"
  
  2. Pattern Matching:
     - Check patterns/ for similar scenarios
     - Apply proven patterns proactively
  
  3. Risk Assessment:
     - Known blockers?
     - Previously failed approaches?
     - Required validations?
  
  4. Agent Selection:
     - Check agent performance metrics
     - Select best agent for task
     - Prepare fallback agent if needed
```

### Phase 2: Execution with Active Monitoring
```yaml
During execution:
  1. Watch for Known Issues:
     - Error patterns from ISSUES_AND_LEARNINGS.md
     - Apply fixes immediately if detected
  
  2. Adaptive Response:
     - If error occurs, check repository
     - Try documented solution first
     - Maximum 2 attempts before escalation
  
  3. Real-time Documentation:
     - Log unexpected behaviors immediately
     - Note workarounds used
     - Track time to resolution
```

### Phase 3: Post-Execution Learning & Evolution
```yaml
MANDATORY after EVERY change:
  1. Success Analysis:
     - What worked well?
     - Can it be a pattern?
     - Should agent be commended?
  
  2. Failure Analysis:
     - Root cause?
     - Could it have been prevented?
     - Need agent update?
  
  3. Documentation:
     - Update ISSUES_AND_LEARNINGS.md
     - Add to patterns if reusable
     - Log in AGENT_EVOLUTION.log if agent updated
  
  4. Evolution Decision:
     - Agent failure rate > 40%? → MUST UPDATE
     - Pattern used 3+ times? → MUST DOCUMENT
     - New requirement? → CONSIDER NEW AGENT
```

## 🚨 Critical Learnings from Recent Issues

### Issue #001: Mock vs Real Component Testing ⚠️
**Problem**: Tests were using mock HTML instead of real components
**Root Cause**: Agents didn't understand the difference
**Solution**: Always test REAL components from `@/app/admin/resources/`
**Pattern**: `import { ComponentName } from '@/app/admin/resources/...'`
**Prevention**: frontend-tester now validates imports before testing
**Agent Updated**: frontend-tester v2.0

### Issue #002: Date Handling Errors 🔥
**Problem**: "Invalid time value" errors crashing frontend
**Root Cause**: No null/undefined date handling
**Solution**: Always use safe date utilities
**Pattern**: Check for null/undefined/empty before formatting
**Prevention**: Added date validation to all components
**Agent Updated**: frontend-implementer v1.5, frontend-tester v2.1

### Issue #003: Test Import Failures 📦
**Problem**: Tests failing due to component import issues
**Root Cause**: Complex React Admin dependencies
**Solution**: Proper context setup with providers
**Pattern**: Use TestWrapper with all required providers
**Prevention**: Test template includes proper setup
**Agent Updated**: frontend-tester v2.2

## 🤖 Specialized Agents with Performance Tracking

### Agent Registry with Success Metrics

| Agent | Version | Success Rate | Last Updated | Specializations |
|-------|---------|--------------|--------------|-----------------|
| **backend-implementer** | v1.3 | 85% | 2024-01-20 | Multi-tenancy, React Admin format |
| **frontend-implementer** | v1.5 | 78% | 2024-01-21 | shadcn/ui only, date safety |
| **tester** | v1.2 | 90% | 2024-01-19 | Backend E2E tests ONLY (NOT frontend) |
| **frontend-tester** | v5.0 | MANDATORY | 2024-08-24 | **EXCLUSIVE** for ALL frontend tests - REAL components + verification |
| **seed-data-manager** | v2.0 | 100% | 2024-08-24 | **SOLE AUTHORITY** for ALL seeding |
| **implementation-reviewer** | v1.0 | 88% | 2024-01-17 | Pattern compliance |

### ⚠️ CRITICAL AGENT ASSIGNMENT RULES
- **Frontend Tests**: MUST use `frontend-tester` EXCLUSIVELY
- **Backend Tests**: Use `tester` agent
- **Seed Data**: MUST use `seed-data-manager` EXCLUSIVELY
- **NEVER** write frontend tests without `frontend-tester` agent
- **NEVER** use main Claude or other agents for frontend testing
- **NEVER** manually edit seed files - use `seed-data-manager` ONLY

### Agent Evolution Rules
1. **Two-Strike Rule**: 2 failures on similar task = MANDATORY UPDATE
2. **Success Tracking**: Success rate < 70% = IMMEDIATE REVIEW
3. **Pattern Integration**: New pattern = UPDATE ALL RELEVANT AGENTS
4. **Cross-Learning**: Issues from one agent = WARN OTHER AGENTS

### 🚨 CRITICAL: frontend-tester v5.0 Requirements
**PRIMARY REFERENCE**: The frontend-tester agent MUST use `/docs/frontend-testing-guide.md` as the authoritative source for all testing patterns.

**MANDATORY PATTERNS FROM THE GUIDE**:
1. Use `memoryStore()` for test isolation (prevents test interference)
2. Import REAL components from `@/app/admin/resources/` - NO MOCK COMPONENTS!
3. Use proper routing for Show/Edit components with React Router
4. Implement permission-based testing where applicable
5. Test responsive behavior (mobile vs desktop)
6. Use proper async patterns (`waitFor`, `findBy*`)

**INCREMENTAL TESTING WORKFLOW** (Like a real developer):
1. Write ONE test first using patterns from the guide
2. Run it and ensure it PASSES
3. ONLY after it passes, add the next test
4. NEVER write multiple tests before verifying the first one works
5. If a test fails, FIX it before adding more
6. Maximum 1 test at a time until proven working

**MANDATORY VERIFICATION STEP**:
After completing ALL tests for a component:
1. Run the complete test suite: `npm test -- test/resources/[component]`
2. Verify ALL tests pass (report exact numbers)
3. Confirm NO console errors (except intentional error tests)
4. Validate that REAL components are imported (not mocks)
5. Report final status: "✅ All X tests passing for [Component]"

**Key Patterns from Guide**:
- Store isolation: `store: memoryStore()`
- Permission testing: `permissions: ['resource.action']`
- Responsive testing: Check `hidden md:table-cell` classes
- Complex filters: Test dependent filter relationships
- Async handling: Use `waitFor()` and `findBy*` methods

**Test Template**:
```typescript
import React from 'react';
import { AdminContext } from 'react-admin';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { [Component] } from '@/app/admin/resources/[module]/[Component]';

const mockDataProvider = { /* minimal mock */ };

test('<[Component]>', async () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  render(
    <QueryClientProvider client={queryClient}>
      <AdminContext dataProvider={mockDataProvider}>
        <[Component] />
      </AdminContext>
    </QueryClientProvider>
  );
  
  // Simple assertion
  expect(screen.getByText('[expected text]')).toBeInTheDocument();
});
```

## 📋 Intelligent Pre-Flight Checklist

Before ANY task, orchestrator MUST complete:

```markdown
### Learning Check ✓
- [ ] Searched ISSUES_AND_LEARNINGS.md for: "[task keywords]"
- [ ] Found similar issues: [list issue numbers or "none"]
- [ ] Applicable patterns identified: [list patterns or "none"]
- [ ] Known blockers: [list blockers or "none"]

### Agent Selection ✓
- [ ] Primary agent selected: [agent-name v.X.X]
- [ ] Agent success rate checked: [XX%]
- [ ] Fallback agent identified: [agent-name or "none needed"]
- [ ] Recent failures reviewed: [summary or "none"]

### Risk Mitigation ✓
- [ ] Validation plan ready: [list validations]
- [ ] Error handling prepared: [approach]
- [ ] Rollback strategy: [if applicable]
```

## 🔧 Implementation with Continuous Learning

### Smart Implementation Flow
```bash
# 1. Orchestrator checks learning repository
grep -r "[module-name]" .claude/ISSUES_AND_LEARNINGS.md

# 2. Apply known solutions proactively
"Found Issue #045: Similar to guardians module implementation"
"Applying proven pattern from patterns/api-patterns.md#crud-pattern"

# 3. Execute with monitoring
"Implementing [module] with backend-implementer v1.3"
"Watching for known issues: #001, #003, #017"

# 4. Validate immediately
./scripts/validate-api.sh [module]

# 5. Document results
echo "Success: [module] implemented using pattern #045" >> .claude/AGENT_EVOLUTION.log
```

## 📊 Evolution Metrics & Triggers

### Track These Metrics
- **First-Try Success Rate**: Currently 72% → Target 85%
- **Pattern Reuse Rate**: Currently 45% → Target 70%
- **Issue Recurrence**: Currently 15% → Target <5%
- **Mean Time to Resolution**: Currently 25min → Target 15min

### Automatic Evolution Triggers
```yaml
Agent Performance Triggers:
  - Success Rate < 70%: IMMEDIATE UPDATE REQUIRED
  - 2 failures same task: UPDATE AGENT DEFINITION
  - 3 pattern uses: ADD TO AGENT KNOWLEDGE
  
System Evolution Triggers:
  - New library/framework: CREATE SPECIALIZED AGENT
  - Repeated cross-agent failures: CREATE META-AGENT
  - Pattern library > 50 items: CONSOLIDATE & REORGANIZE
```

## 🚨 Recent Patterns to Apply

### Testing Pattern #001: SIMPLE TESTING PATTERN (MANDATORY FOR frontend-tester)
```typescript
// ✅ CORRECT - Simple pattern with AdminContext only
import React from 'react';
import { AdminContext } from 'react-admin';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { StudentsList } from '@/app/admin/resources/students/List'; // REAL component

test('<StudentsList>', async () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  render(
    <QueryClientProvider client={queryClient}>
      <AdminContext dataProvider={mockDataProvider}>
        <StudentsList />
      </AdminContext>
    </QueryClientProvider>
  );
  
  const items = await screen.findAllByText(/Student/);
  expect(items.length).toBeGreaterThan(0);
});

// ❌ NEVER: Complex test setups with multiple wrappers
// ❌ NEVER: Mock components
// ❌ NEVER: Overly detailed test scenarios
// ❌ NEVER: Tests longer than 40 lines
```

### API Pattern #002: Response Format
```typescript
// ✅ ALWAYS wrap responses
return { data: result, total: count }

// ❌ NEVER return raw data
return result // WRONG!
```

### Frontend Pattern #003: Date Safety
```typescript
// ✅ ALWAYS check before formatting
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}
```

## ⚡ Quick Implementation with Intelligence

```bash
# Orchestrator's smart workflow
"Implement the payments module"

# Auto-executed learning check:
1. ✓ Checked ISSUES_AND_LEARNINGS.md
2. ✓ Found similar: Issue #023 (invoices module)
3. ✓ Pattern identified: financial-module-pattern
4. ✓ Known issue: decimal precision (Issue #067)
5. ✓ Selected: backend-implementer v1.3 (85% success)
6. ✓ Applying patterns proactively...
```

## 📝 Issue Documentation Template

```markdown
### Issue #XXX: [Descriptive Title]
**Date**: YYYY-MM-DD
**Agent**: [agent-name vX.X]
**Task**: [what was being attempted]
**Frequency**: [first time | happened X times]

**Problem**: 
[Detailed description of what went wrong]

**Root Cause**:
[Why did this happen? Missing knowledge? Wrong approach?]

**Solution**:
[Step-by-step solution that worked]

**Pattern Identified**:
[Reusable pattern for future]
Pattern saved as: patterns/[category]-patterns.md#[pattern-name]

**Prevention Strategy**:
[How to prevent this in future]

**Agent Updates Required**:
- [agent-name]: Add knowledge about [specific thing]
- [agent-name]: Update approach for [scenario]

**Validation**:
[How to verify the fix works]

**Related Issues**: #XX, #YY [if any]
```

## 🌱 CRITICAL: Seed Data Management Rules

### MANDATORY SEED DATA PROTOCOL
1. **SOLE AUTHORITY**: seed-data-manager agent is the ONLY authority for ALL seeding operations
2. **SINGLE SOURCE**: Only ONE seed file exists: `prisma/seed.ts` (managed by seed-data-manager)
3. **NO MANUAL EDITS**: NEVER manually edit seed files - always use seed-data-manager
4. **ARCHIVED FILES**: All other seed*.ts files are archived in `prisma/archive-seeds/`
5. **VALIDATION**: Use MCP PostgreSQL tools for validation, NEVER bash psql

### Seed Data Commands (via seed-data-manager)
```bash
# ✅ CORRECT - Always delegate to seed-data-manager:
"Use seed-data-manager to generate seed data"
"Use seed-data-manager to fix seed issues"
"Use seed-data-manager to validate database"

# ❌ FORBIDDEN - Never do these:
"Edit prisma/seed.ts"                    # PROHIBITED!
"Create new seed-xyz.ts"                 # PROHIBITED!
"Run psql to check data"                # PROHIBITED!
```

### HTTP Request Commands
```bash
# ✅ CORRECT - Always use curl MCP:
"Use curl MCP tool to make HTTP requests"
"Use mcp__curl__curl for API calls"
"Use mcp__curl__curl_raw for complex curl commands"

# ❌ FORBIDDEN - Never do these:
"curl -X POST http://..."               # PROHIBITED!
"Use bash curl command"                 # PROHIBITED!
```

### Seed Data Requirements
- **13 Branches**: All composite IDs (dps-main, kvs-central, etc.)
- **Indian Context**: Authentic names, +91 phones, regional addresses
- **Minimum Data**: 500+ students per branch
- **Proper Relations**: Students ↔ Guardians ↔ Enrollments
- **Data Isolation**: Each branch completely isolated via branchId

## ⚠️ CRITICAL: Non-Negotiable Rules

1. **NEVER** skip the learning check before tasks
2. **NEVER** ignore patterns in the repository  
3. **ALWAYS** document new issues immediately
4. **ALWAYS** update agents after 2 failures
5. **ALWAYS** validate changes before proceeding
6. **NEVER** repeat a documented mistake
7. **NEVER** manually edit seed files - use seed-data-manager
8. **NEVER** use bash psql - use MCP PostgreSQL tools
9. **ALWAYS** use curl MCP tool instead of bash curl commands

## 🔄 Continuous Improvement Cycle

### Daily
- Review today's issues
- Update ISSUES_AND_LEARNINGS.md
- Check agent performance metrics

### Weekly  
- Consolidate similar issues
- Extract new patterns
- Update agent definitions
- Archive resolved issues

### Monthly
- Major agent evolution review
- Pattern library optimization
- Success metric analysis
- Create new specialized agents if needed

---

**Remember**: Every task is a learning opportunity. The system gets smarter with each interaction. Document everything, learn from failures, apply patterns, and evolve continuously.