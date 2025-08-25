# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **📚 Documentation**: See `docs/` for comprehensive system documentation
> **🌍 Global Standards**: See `docs/global/` for system-wide conventions
> **📦 Module Guides**: See `docs/modules/` for implementation details
> **Quick Reference**: See `.claude/QUICK_REFERENCE.md` for commands and checklists

# Paramarsh SMS - School Management System

## Overview
Full-stack school management system with multi-tenant architecture:
- **Backend**: NestJS + Prisma + SQLite/PostgreSQL
- **Frontend**: Next.js + React Admin + shadcn/ui (NO MUI!)
- **Architecture**: Monorepo with bun workspaces

## 🤖 Specialized Subagents

This project uses specialized subagents for different tasks. Claude will automatically invoke the appropriate subagent based on context.

### Available Subagents

| Subagent | Purpose | When Used |
|----------|---------|-----------| 
| **backend-implementer** | NestJS API implementation | Creating backend modules |
| **frontend-implementer** | React Admin UI (shadcn/ui only) | Creating frontend resources |
| **tester** | Backend E2E test creation AND fixing | Backend API testing and debugging |
| **frontend-tester** | Frontend test creation AND fixing | Frontend component testing |
| **seed-data-manager** | Seed data generation & validation | Indian contextual demo data |
| **implementation-reviewer** | Code review & validation | After any implementation |

### Manual Invocation
```bash
# You can explicitly invoke subagents:
Use backend-implementer to create guardians API
Use frontend-implementer to create guardians UI
Use tester to create and fix backend tests for guardians
Use frontend-tester to create and fix frontend tests for guardians
Use seed-data-manager to generate Indian demo data
Use implementation-reviewer to review guardians module
```

## 📋 Implementation Workflow

When asked to implement a new module, Claude will orchestrate these subagents:

### Step 1: Backend Implementation
```
→ backend-implementer subagent
  Creates: Controller, Service, DTOs, Module
  Ensures: React Admin format, multi-tenancy
```

### Step 2: Backend Test Creation & Fixing
```
→ tester subagent
  Creates: Backend E2E tests
  Fixes: Failing backend tests
  Tests: All 6 endpoints, multi-tenancy, pagination
```

### Step 3: Frontend Test Creation & Fixing
```
→ frontend-tester subagent
  Creates: Frontend component tests
  Fixes: Failing frontend tests
  Tests: List, Create, Edit components
```

### Step 4: Frontend Implementation
```
→ frontend-implementer subagent
  Creates: List, Create, Edit components
  Uses: ONLY shadcn/ui (never MUI!)
```

### Step 5: Review & Validation
```
→ implementation-reviewer subagent
  Validates: All requirements met
  Reports: PASS/FAIL with fixes
```

## 🚨 Critical Requirements

### API Response Format (MANDATORY)
```typescript
// ALL endpoints MUST return data wrapped:
{ data: T[] | T, total?: number }

// NEVER return raw arrays or objects!
```

### Multi-tenancy (REQUIRED)
- Header: `X-Branch-Id` (defaults to 'branch1')
- Database field: `branchId`
- ALL queries must filter by branchId

### UI Libraries (STRICT)
```typescript
// ✅ ALLOWED
import { Button } from "@/components/ui/button";     // shadcn/ui
import { List } from "@/components/admin";           // React Admin
import { User } from "lucide-react";                 // Icons

// ❌ FORBIDDEN (automatic failure)
import { Button } from "@mui/material";              // NO MUI!
import { Button } from "antd";                       // NO Ant Design!
```

### Port Configuration
Backend runs on port 8080 by default (configured in package.json and main.ts):
```bash
cd apps/api && bun run start:dev  # Automatically uses port 8080
```

### Database Access (CRITICAL)
**MANDATORY**: Use ONLY SQLite MCP tools for ALL database access.

```typescript
// ✅ REQUIRED - Use MCP SQLite tools for all database operations:
mcp__paramarsh-sms__query({ query: "SELECT COUNT(*) FROM Student" })
mcp__paramarsh-sms__list_tables()
mcp__paramarsh-sms__get_table_schema({ table_name: "Student" })
mcp__paramarsh-sms__db_info()

// ❌ FORBIDDEN - Never use bash sqlite3 command:
Bash: sqlite3 prisma/dev.db "SELECT ..."       // PROHIBITED!
Bash: sqlite3 /path/to/dev.db "..."            // PROHIBITED!
```

**IMPORTANT**: The `sqlite3` command via Bash is STRICTLY FORBIDDEN. All database queries, checks, and validations must use the MCP tools exclusively.

**Seed Data Management Requirements:**
- Use `bun run seed:validate:mcp` for validation (not bash sqlite3)
- Use `bun run db:health:mcp` for health checks
- All validation scripts MUST use MCP tools exclusively
- Indian contextual data REQUIRED (authentic names, addresses, phone numbers)
- Minimum 500+ students, 30+ teachers, proper relationships

## 🔧 Common Commands

```bash
# Development
cd apps/api && bun run start:dev    # Backend (runs on 8080)
cd apps/web && bun run dev          # Frontend

# Database
cd apps/api && npx prisma migrate dev          # Run migrations
cd apps/api && npx prisma db seed              # Seed database

# Seed Data Management (use MCP tools only)
cd apps/api && bun run seed:indian             # Generate Indian contextual seed data
cd apps/api && bun run seed:validate:mcp       # Validate using MCP tools (REQUIRED)
cd apps/api && bun run db:health:mcp           # Database health check via MCP
cd apps/api && bun run report:validation       # Generate validation report

# Testing
./scripts/validate-api.sh [module]             # Validate implementation
cd apps/api && bun run test:e2e                # Run E2E tests

# Review
/agents                                        # View available subagents
Use implementation-reviewer to review [module] # Review implementation
```

## 📁 Project Structure

```
apps/
├── api/                                      # NestJS backend
│   ├── src/[module]/                        # Module implementation
│   ├── test/[module].e2e-spec.ts           # E2E tests
│   └── prisma/seed.ts                      # Seed data
└── web/                                     # Next.js frontend
    └── app/admin/resources/[module]/       # React Admin resources
        ├── List.tsx                         # List component
        ├── Create.tsx                       # Create form
        └── Edit.tsx                         # Edit form
```

## ⚡ Quick Implementation

To implement a new module:
```bash
# FIRST: Check if module documentation exists
"Check docs/modules/[module]/README.md"

# If no docs exist, use the template:
"Create module docs using docs/modules/MODULE-TEMPLATE.md"

# Claude will automatically orchestrate subagents:
"Implement the [module] module following docs/modules/[module]/"

# Or manually control the process:
"Use backend-implementer to create [module] API per docs/global/04-API-CONVENTIONS.md"
"Use tester to test [module] per docs/global/08-TESTING-STRATEGY.md"
"Use frontend-implementer to create [module] UI per docs/global/09-UI-GUIDELINES.md"
"Use implementation-reviewer to validate [module] against all docs"
```

## 🎯 Validation

Every implementation MUST pass:
1. **Documentation Compliance**: Follows patterns in `docs/global/` and `docs/modules/`
2. **Validation Script**: `./scripts/validate-api.sh [module]`
3. **E2E Tests**: All tests passing per `docs/global/08-TESTING-STRATEGY.md`
4. **UI Check**: No MUI imports per `docs/global/09-UI-GUIDELINES.md`
5. **API Format**: Follows `docs/global/04-API-CONVENTIONS.md`
6. **Database Design**: Follows `docs/global/05-DATABASE-DESIGN.md`
7. **Review**: implementation-reviewer approval against documentation

## 📚 Documentation Structure

### Primary Documentation (USE THESE FIRST)
- **[docs/README.md](docs/README.md)** - Documentation index and navigation
- **[docs/global/](docs/global/)** - System-wide standards and conventions
  - `00-GETTING-STARTED.md` - Quick start guide
  - `01-ARCHITECTURE.md` - System architecture
  - `04-API-CONVENTIONS.md` - API standards (CRITICAL)
  - `05-DATABASE-DESIGN.md` - Database patterns
  - `09-UI-GUIDELINES.md` - UI standards (NO MUI!)
- **[docs/modules/](docs/modules/)** - Module implementation guides
  - `MODULE-TEMPLATE.md` - Template for new modules
  - Individual module docs (e.g., `students/README.md`)

### Supporting Resources
- **Quick Reference**: `.claude/QUICK_REFERENCE.md` for checklists
- **Subagent Details**: `.claude/agents/` folder for subagent configurations
- **Legacy Details**: `CLAUDE_OLD_FULL.md` for historical reference

## 🤝 Working with Subagents

### View Available Subagents
```bash
/agents
```

### Subagent Capabilities
- **backend-implementer**: Full CRUD API with multi-tenancy
  - References: `docs/global/04-API-CONVENTIONS.md`, `docs/global/05-DATABASE-DESIGN.md`
- **frontend-implementer**: shadcn/ui components only (NO MUI!)
  - References: `docs/global/09-UI-GUIDELINES.md`
- **tester**: Backend E2E test creation, debugging, and fixing
  - References: `docs/global/08-TESTING-STRATEGY.md`
- **frontend-tester**: Frontend component test creation, debugging, and fixing
  - References: `docs/global/08-TESTING-STRATEGY.md`
- **seed-data-manager**: Indian contextual seed data generation and MCP validation
  - References: `docs/global/13-INDIAN-CONTEXT.md`
- **implementation-reviewer**: Validation and compliance checking
  - References: ALL documentation in `docs/global/` and `docs/modules/`

### Subagent Workflow
1. Each subagent operates in its own context
2. Subagents pass results back to main Claude
3. Claude orchestrates the complete implementation
4. Review subagent validates everything at the end

## ⚠️ Common Issues

| Problem | Solution |
|---------|----------|
| Frontend shows "No data" | Ensure API returns `{ data: [...] }` |
| MUI imported | Replace with shadcn/ui components |
| Tests fail | Run backend on PORT=8080 |
| Multi-tenant leak | Add branchId filtering |
| Seed data validation fails | Use `bun run seed:validate:mcp` (never sqlite3 bash) |
| Non-Indian demo data | Use `seed-data-manager` subagent for authentic data |

---

**Remember**: Let the subagents handle the implementation details. Focus on the high-level requirements and orchestration.