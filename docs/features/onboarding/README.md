# Onboarding Feature Documentation

This folder contains the complete documentation and design reference for the Paramarsh SMS school onboarding feature.

## 📂 Contents

### Documentation
- **[ONBOARDING-JOURNEY.md](./ONBOARDING-JOURNEY.md)** - Complete onboarding flow documentation
  - All 9 stages explained in detail
  - User roles and permissions
  - Screen specifications
  - Data structures
  - Seeded demo data
  - Implementation notes

### Design Reference Screens

The following screens serve as **reference UI** for understanding the onboarding flow. Implementation should use Paramarsh's existing design system (shadcn/ui).

| Screen | Stage | Description |
|--------|-------|-------------|
| [1.png](./1.png) | Step 1 of 9 | **School Setup** - Basic school information form with name, type, location, academic year, and logo upload |
| [2.png](./2.png) | Step 2 of 9 | **Dashboard Tour** - Live dashboard preview with demo data showing KPIs, revenue trends, attendance heatmap, and alerts |
| [3.png](./3.png) | Step 3 of 9 | **User Roles** - Role overview with 4 predefined roles (Owner, Admin, Teacher, Parent) and their permissions |
| [4.png](./4.png) | Step 4 of 9 | **Classes & Curriculum** - Class structure setup with grade/section management and capacity tracking |
| [5.png](./5.png) | Step 5 of 9 | **Smart Timetable** - AI-powered timetable generator with conflict detection and optimization |
| [6.png](./6.png) | Step 6 of 9 | **Attendance Management** - Daily attendance tracking with quick mark-all and individual toggles |
| [7.png](./7.png) | Step 7 of 9 | **Fee Management** - Fee structure setup with collection tracking and payment alerts |
| [8.png](./8.png) | Step 8 of 9 | **Reports & Analytics** - Dashboard with performance trends and recent activities |
| [9.png](./9.png) | Step 9 of 9 | **Setup Complete** - Success screen with achievements and configured modules |
| [10.png](./10.png) | Step 9 of 9 | **Next Steps** - Recommended post-onboarding actions with priorities |

## 🎯 Quick Overview

### What is this feature?
A comprehensive 9-step onboarding flow that guides new schools through setting up their complete school management system in Paramarsh SMS.

### Key Highlights
- **9 Stages**: From basic school setup to completion
- **Demo Data**: Pre-populated with realistic Indian school data
- **AI-Powered**: Smart timetable generation with conflict detection
- **Role-Based**: 4 user roles with granular permissions
- **Interactive**: Dashboard tour with live KPIs and analytics
- **Guided**: Progress tracking with achievements and next steps

### Modules Configured
1. School Information & Branding
2. Dashboard & Analytics Preview
3. User Roles & Permissions
4. Class Structure & Curriculum
5. AI Timetable Management
6. Attendance System (Student & Teacher)
7. Fee Management & Payment Tracking
8. Reports & AI Insights
9. Setup Completion & Next Actions

## 🚀 Implementation Status

- [ ] **Backend APIs** - Onboarding endpoints
- [ ] **Frontend Routes** - 9 onboarding step routes
- [ ] **State Management** - Onboarding progress tracking
- [ ] **Demo Data Seeding** - Pre-populated school data
- [ ] **AI Timetable Service** - Conflict detection & optimization
- [ ] **Progress Persistence** - Resume incomplete onboarding
- [ ] **E2E Tests** - Complete onboarding flow testing

## 📊 User Roles

| Role | Access Level | Primary Functions |
|------|--------------|-------------------|
| **School Owner/Principal** | Super Admin | Full system access and configuration |
| **Admin/Manager** | Operations | Fee management, attendance, timetable |
| **Teacher** | Limited | View timetable, mark attendance, grade management |
| **Parent/Student** | View-only | View timetable, attendance, fee receipts |

## 🎨 Design Notes

> **Important**: The screens shown (1.png - 10.png) use a different design system and serve as **reference only**.

When implementing:
- ✅ Use Paramarsh's existing shadcn/ui design system
- ✅ Replicate functionality and user experience
- ✅ Maintain consistent spacing and typography
- ❌ Do NOT copy visual design exactly
- ❌ Do NOT introduce new UI components

## 📈 Demo Data

All stages use realistic Indian-context demo data:

- **Demo School**: Paramarsh International School
- **Location**: Mumbai, Maharashtra
- **Students**: 1,200 students across grades 6-12
- **Teachers**: 85 teaching staff
- **Classes**: 14 classes (2 sections per grade)
- **Academic Year**: 2024-25
- **Names**: Indian names (Aarav, Diya, Ananya, Ravi, etc.)
- **Currency**: Indian Rupees (₹)
- **Phone**: +91 country code

## 🔧 Technical Stack

### Frontend
- **Framework**: Next.js with React Admin
- **UI Library**: shadcn/ui (NOT the design in screenshots)
- **State**: React Query + React Admin data provider
- **Routing**: Next.js App Router

### Backend
- **API**: NestJS REST API
- **Database**: PostgreSQL with Prisma
- **Multi-tenancy**: Branch-based isolation
- **AI**: Timetable optimization service

### Testing
- **E2E**: Playwright (use `playwright-e2e-tester` agent)
- **Unit**: Jest + React Testing Library (use `frontend-tester` agent)

## 📝 Related Documentation

- **Main PRD**: [/docs/PRD.md](/docs/PRD.md)
- **API Spec**: [/docs/react-admin-api-spec.md](/docs/react-admin-api-spec.md)
- **Testing Guide**: [/docs/frontend-testing-guide.md](/docs/frontend-testing-guide.md)
- **Multi-tenancy**: [/docs/Tenancy/](/docs/Tenancy/)

## 🎯 Success Metrics

### Completion Rate
- **Target**: 80% of schools complete all 9 steps
- **Time**: Average < 60 minutes
- **Engagement**: 90% view dashboard tour

### Data Quality
- **Profiles**: 95% complete all required fields
- **Logo Upload**: 60% upload school branding
- **Users**: Average 10+ users created per school

## 🚦 Next Steps

### For Developers
1. Review `ONBOARDING-JOURNEY.md` for complete specifications
2. Examine reference screens (1.png - 10.png) for UX understanding
3. Use **backend-implementer** agent for API development
4. Use **frontend-implementer** agent for UI development
5. Use **playwright-e2e-tester** agent for E2E testing
6. Use **frontend-tester** agent for component unit tests

### For Product/Design
1. Review reference screens for UX flow
2. Adapt to Paramarsh design system
3. Validate data structures match business requirements
4. Provide additional UI/UX specifications if needed

### For QA
1. Validate all 9 stages flow correctly
2. Test with different school types and sizes
3. Verify demo data is realistic and complete
4. Check progress persistence and resume functionality
5. Test role-based access for each user type

---

**Feature Status**: 📋 Documentation Complete - Ready for Implementation
**Last Updated**: 2025-10-07
**Owner**: Paramarsh Team
