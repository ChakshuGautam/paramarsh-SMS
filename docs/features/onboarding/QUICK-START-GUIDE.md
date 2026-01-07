# Onboarding Feature - Quick Start Guide

## 🎯 What This Is

A comprehensive 9-step onboarding wizard that guides new schools through setting up their complete Paramarsh SMS system, from basic school information to fully configured modules.

## 📚 Documentation Structure

| Document | Purpose | Audience |
|----------|---------|----------|
| **[README.md](./README.md)** | Overview & navigation | Everyone |
| **[ONBOARDING-JOURNEY.md](./ONBOARDING-JOURNEY.md)** | Complete feature specification | Product, Design, Dev |
| **[IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md)** | Technical implementation guide | Developers |
| **Screens (1-10.png)** | UI reference mockups | Design, Dev |

## 🚀 For Developers - Get Started in 5 Minutes

### 1. Read the Implementation Plan
```bash
# Essential reading
open docs/features/onboarding/IMPLEMENTATION-PLAN.md

# Key sections to focus on:
- Database Schema (what tables to add)
- Backend Implementation (API structure)
- Frontend Implementation (React components)
- Routing & Navigation (URL structure)
```

### 2. Understand the Architecture

```
Frontend                    Backend                     Database
========                    =======                     ========
Next.js Routes         →    NestJS Module          →    OnboardingState
/onboarding/*              /api/onboarding/*            + Demo Data
                                                         + Existing Tables

React Context          →    Services               →    Prisma ORM
OnboardingProvider         OnboardingService
                           DemoDataService
                           TimetableGenerator

shadcn/ui              →    DTOs & Validation      →    Multi-tenancy
Components                 class-validator              Branch Isolation
```

### 3. Start Implementation

#### Backend First
```bash
# 1. Add database schema
cd apps/api
# Edit prisma/schema.prisma (see IMPLEMENTATION-PLAN.md)
npx prisma migrate dev --name add_onboarding_state

# 2. Create onboarding module
nest g module modules/onboarding
nest g controller modules/onboarding
nest g service modules/onboarding

# 3. Implement (use backend-implementer agent)
# Copy service code from IMPLEMENTATION-PLAN.md
```

#### Frontend Second
```bash
# 1. Create route structure
cd apps/web
mkdir -p app/onboarding/{dashboard-tour,user-roles,classes,timetable,attendance,fees,reports,complete}

# 2. Create context & provider
touch app/onboarding/OnboardingProvider.tsx

# 3. Implement steps (use frontend-implementer agent)
# Copy component code from IMPLEMENTATION-PLAN.md
```

### 4. Use the Right Agents

```bash
# Backend API
Use: backend-implementer agent
Task: "Implement onboarding API endpoints following IMPLEMENTATION-PLAN.md"

# Frontend Components
Use: frontend-implementer agent
Task: "Create onboarding Step 1 component using shadcn/ui"

# E2E Tests
Use: playwright-e2e-tester agent
Task: "Create E2E test for complete onboarding flow"

# Unit Tests
Use: frontend-tester agent
Task: "Create unit tests for OnboardingProvider"

# Review
Use: implementation-reviewer agent
Task: "Review onboarding implementation for compliance"
```

## 📋 Implementation Checklist

Copy this checklist to track your progress:

### Week 1: Infrastructure
- [ ] Add `OnboardingState` table to Prisma schema
- [ ] Run database migration
- [ ] Create `OnboardingModule` in NestJS
- [ ] Create routing structure in Next.js
- [ ] Set up frontend context/provider

### Week 2-3: Backend
- [ ] Implement `OnboardingService`
- [ ] Implement `DemoDataService`
- [ ] Implement `TimetableGeneratorService`
- [ ] Create all API endpoints (9 steps)
- [ ] Add DTOs and validation
- [ ] Write backend unit tests

### Week 3-4: Frontend
- [ ] Step 1: School Setup
- [ ] Step 2: Dashboard Tour
- [ ] Step 3: User Roles
- [ ] Step 4: Classes
- [ ] Step 5: Timetable
- [ ] Step 6: Attendance
- [ ] Step 7: Fees
- [ ] Step 8: Reports
- [ ] Step 9: Completion
- [ ] Progress bar component
- [ ] Navigation components

### Week 5: Integration
- [ ] Connect frontend to backend
- [ ] Test complete flow end-to-end
- [ ] Fix bugs and issues
- [ ] Performance optimization
- [ ] Add loading states
- [ ] Add error handling

### Week 6: Testing & Polish
- [ ] Write E2E tests (Playwright)
- [ ] Write component tests
- [ ] UI/UX refinements
- [ ] Mobile responsiveness
- [ ] Accessibility audit
- [ ] Documentation updates

### Week 7: Launch
- [ ] Deploy to staging
- [ ] QA testing
- [ ] User acceptance testing
- [ ] Deploy to production
- [ ] Monitor metrics
- [ ] Gather feedback

## 🎨 Design System Notes

**CRITICAL**: The reference screens (1-10.png) use a different design system!

### What to Copy
✅ User flow and navigation
✅ Functionality and features
✅ Data structures and fields
✅ Step sequence and progression
✅ Success states and feedback

### What NOT to Copy
❌ Visual design and layout
❌ Colors and typography (use shadcn/ui)
❌ Component structure (use shadcn/ui)
❌ Icons and illustrations (choose your own)

### Use Existing Components
```typescript
// ✅ Good - Use existing Paramarsh components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

// ❌ Bad - Don't create new components
import { CustomButton } from './CustomButton';
import { NewInput } from './NewInput';
```

## 🔧 Common Tasks

### Task 1: Add a New Onboarding Step

```typescript
// 1. Add database field
model OnboardingState {
  // ... existing fields
  newStepCompleted Boolean @default(false)
  newStepData      Json?
}

// 2. Add API endpoint
@Post('new-step')
async handleNewStep(@CurrentUser() user, @Body() data) {
  return this.onboardingService.handleNewStep(user.sub, data);
}

// 3. Add frontend route
// Create: apps/web/app/onboarding/new-step/page.tsx

// 4. Update progress bar
const STEPS = [
  // ... existing steps
  { number: 10, label: 'New Step' },
];
```

### Task 2: Modify Demo Data

```typescript
// Edit: apps/api/src/modules/onboarding/demo-data.service.ts

async createDemoStudents(onboardingStateId: string) {
  const demoStudents = [
    // Add/modify demo students here
    { firstName: 'New', lastName: 'Student', rollNumber: '8A99' },
  ];

  // ... rest of implementation
}
```

### Task 3: Add Validation

```typescript
// Create/edit DTO
export class SchoolSetupDto {
  @IsString()
  @MinLength(3)
  @MaxLength(256)
  schoolName: string;

  @IsString()
  @IsIn(['private', 'government', 'international'])
  schoolType: string;

  // ... more validations
}
```

## 🐛 Troubleshooting

### Issue: Onboarding state not persisting
**Solution**: Check database connection and Prisma schema

```bash
# Verify Prisma schema
npx prisma validate

# Check database connection
npx prisma db push

# Regenerate Prisma client
npx prisma generate
```

### Issue: Demo data not loading
**Solution**: Check DemoDataService implementation

```typescript
// Verify demo data is being created
const students = await prisma.student.findMany({
  where: { isDemo: true, demoOnboardingId: state.id }
});
console.log('Demo students:', students.length);
```

### Issue: Navigation not working
**Solution**: Check routing and state updates

```typescript
// Verify state is updating
console.log('Current step:', state.currentStep);
console.log('Completed steps:', state.completedSteps);

// Verify route matches step
const routes = [
  '/onboarding',           // Step 1
  '/onboarding/dashboard-tour', // Step 2
  // ... etc
];
```

## 📊 Success Metrics to Track

### During Development
- [ ] All 9 steps load without errors
- [ ] State persists correctly between steps
- [ ] Demo data generates successfully
- [ ] Navigation works forward and backward
- [ ] Form validation works correctly
- [ ] Error handling is graceful

### After Launch
- [ ] Completion rate > 80%
- [ ] Average time < 60 minutes
- [ ] Drop-off rate < 20%
- [ ] Error rate < 5%
- [ ] User satisfaction > 4/5

## 🎓 Learning Resources

### React Admin
- [React Admin Docs](https://marmelab.com/react-admin/)
- [Data Provider](https://marmelab.com/react-admin/DataProviders.html)
- Your existing implementation: `apps/web/app/admin/DataProvider.tsx`

### NestJS
- [NestJS Docs](https://docs.nestjs.com/)
- [Prisma with NestJS](https://docs.nestjs.com/recipes/prisma)
- Your existing modules: `apps/api/src/modules/`

### shadcn/ui
- [shadcn/ui Docs](https://ui.shadcn.com/)
- [Component Examples](https://ui.shadcn.com/examples)

### Multi-tenancy
- Your implementation: `apps/web/app/admin/DataProvider.tsx` (see `getScopeHeaders()`)
- Branch isolation via `X-Branch-Id` header

## 🤝 Getting Help

### Documentation
1. Read [IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md) thoroughly
2. Review [ONBOARDING-JOURNEY.md](./ONBOARDING-JOURNEY.md) for feature details
3. Check reference screens (1-10.png) for UX guidance

### Code Review
Use `implementation-reviewer` agent:
```bash
"Review my onboarding implementation for:
- API synchronization
- React Admin compliance
- Multi-tenancy
- Testing coverage"
```

### Ask Questions
When stuck, provide:
- What you're trying to do
- What you've tried
- Error messages or unexpected behavior
- Relevant code snippets

## 🎯 Quick Commands Reference

```bash
# Backend
cd apps/api
npm run start:dev              # Start backend server
npm run test                   # Run unit tests
npm run test:e2e              # Run E2E tests

# Frontend
cd apps/web
npm run dev                    # Start dev server
npm run build                  # Production build
npm test                       # Run tests

# Database
cd apps/api
npx prisma migrate dev         # Create migration
npx prisma migrate deploy      # Apply migrations
npx prisma studio             # Open database GUI
npx prisma generate           # Regenerate client

# Full stack
npm run dev                    # Run both (from root)
```

## 📦 Deliverables

### Minimum Viable Product (MVP)
- [ ] All 9 steps functional
- [ ] State persistence working
- [ ] Demo data generation
- [ ] Basic error handling
- [ ] Mobile responsive

### Full Launch
- [ ] All MVP features
- [ ] Comprehensive testing
- [ ] Loading states
- [ ] Error recovery
- [ ] Accessibility compliant
- [ ] Performance optimized
- [ ] Documentation complete

---

**Ready to start?** Begin with the [IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md)!

**Questions?** Check the troubleshooting section or ask for help.

**Stuck?** Use the appropriate agent for your task (see "Use the Right Agents" section).

---

**Document Version**: 1.0
**Last Updated**: 2025-10-07
**Estimated Reading Time**: 10 minutes
**Difficulty Level**: Intermediate to Advanced
