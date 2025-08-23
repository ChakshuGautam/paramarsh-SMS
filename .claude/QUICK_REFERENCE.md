# 🚀 Paramarsh SMS - Quick Reference Card

## 🎯 Implementation Workflow

### Step 1: Start Implementation
```bash
# When asked to implement a new module
1. Create todo list from API Development Checklist
2. Follow the template in CLAUDE.md
3. Use shadcn-admin-kit-demo patterns for UI
```

### Step 2: Validate During Development
```bash
# Check your work as you go
./scripts/validate-api.sh [module]
cd apps/api && bun run start:dev  # runs on port 8080
cd apps/api && bun run test:e2e
```

### Step 3: Review Implementation
```bash
# Switch to review mode
/output-style implementation-reviewer

# Review the implementation
Review the [module] implementation

# Or create a review sub-agent
Task: "Review [module] using implementation-reviewer output style"
```

## ⚠️ Critical Rules

### Backend APIs
✅ ALWAYS return `{ data: result }`
✅ Use `page/pageSize` not `offset/limit`  
✅ Filter by `branchId` in all queries
✅ Extend `BaseCrudService`
✅ Implement ALL 6 endpoints

### Frontend Components  
❌ NO Material-UI (@mui/*)
❌ NO Ant Design (antd)
❌ NO Bootstrap
✅ ONLY shadcn/ui (@/components/ui/*)
✅ React Admin (@/components/admin/*)
✅ lucide-react icons

### Testing
✅ E2E tests are MANDATORY
✅ Test multi-tenant isolation
✅ Update seed data
✅ Test pagination/sorting/filtering

## 📋 Required API Response Formats

```typescript
// List
GET /resource → { data: T[], total: number }

// Get One  
GET /resource/:id → { data: T }

// Create
POST /resource → { data: T }

// Update
PUT /resource/:id → { data: T }

// Delete
DELETE /resource/:id → { data: T }

// Get Many
GET /resource?ids=1,2,3 → { data: T[] }
```

## 🛠️ Common Commands

```bash
# Backend
cd apps/api && bun run start:dev  # runs on port 8080
cd apps/api && npx prisma migrate dev
cd apps/api && npx prisma db seed
cd apps/api && bun run test:e2e

# Frontend  
cd apps/web && bun run dev

# Validation
./scripts/validate-api.sh [module]
bun run lint && bun run typecheck

# Review Mode
/output-style implementation-reviewer
```

## 🔍 File Locations

### Backend
- Module: `apps/api/src/[module]/`
- Tests: `apps/api/test/[module].e2e-spec.ts`
- Seed: `apps/api/prisma/seed.ts`

### Frontend
- Components: `apps/web/app/admin/resources/[module]/`
- Registration: `apps/web/app/admin/AdminApp.tsx`
- Examples: `apps/web/shadcn-admin-kit-demo/`

## 🚨 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "No data" in frontend | Wrap response in `{ data: ... }` |
| Pagination broken | Use `page/pageSize` not `offset/limit` |
| Data leakage | Add `branchId` filter |
| MUI imported | Replace with shadcn/ui components |
| Tests fail | Ensure backend is running (port 8080) |

## 📊 Review Scorecard

When reviewing, check:
- [ ] 6/6 API endpoints implemented
- [ ] Response format compliance
- [ ] Multi-tenancy working
- [ ] No prohibited UI libraries
- [ ] 8/8 test scenarios covered
- [ ] Frontend components complete

## 💡 Pro Tips

1. **Always validate first**: Run `./scripts/validate-api.sh` before anything else
2. **Use templates**: Copy from CLAUDE.md templates
3. **Check examples**: Look at `shadcn-admin-kit-demo` for UI patterns
4. **Test early**: Write E2E tests as you build
5. **Review at end**: Use implementation-reviewer to catch issues

---
*Remember: When in doubt, check CLAUDE.md for detailed instructions*