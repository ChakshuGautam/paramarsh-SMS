# Onboarding Feature - Implementation Plan

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [State Management](#state-management)
6. [Routing & Navigation](#routing--navigation)
7. [Integration Points](#integration-points)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Plan](#deployment-plan)
10. [Implementation Steps](#implementation-steps)

---

## Architecture Overview

### Current Stack
- **Frontend**: Next.js 14+ with React Admin + shadcn/ui
- **Backend**: NestJS with Prisma ORM
- **Database**: PostgreSQL
- **Auth**: Clerk authentication
- **Multi-tenancy**: Branch-based isolation (X-Branch-Id header)

### Onboarding Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│                                                             │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │  Onboarding    │  │   React Admin  │  │   shadcn/ui  │ │
│  │    Routes      │──│   Components   │──│  Components  │ │
│  │  /onboarding/* │  │                │  │              │ │
│  └────────────────┘  └────────────────┘  └──────────────┘ │
│           │                   │                   │         │
└───────────┼───────────────────┼───────────────────┼─────────┘
            │                   │                   │
            ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (NestJS)                         │
│                                                             │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │  Onboarding    │  │   Existing     │  │    Prisma    │ │
│  │    Module      │──│    Modules     │──│     ORM      │ │
│  │  /onboarding   │  │                │  │              │ │
│  └────────────────┘  └────────────────┘  └──────────────┘ │
│           │                   │                   │         │
└───────────┼───────────────────┼───────────────────┼─────────┘
            │                   │                   │
            ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                  Database (PostgreSQL)                      │
│                                                             │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │ OnboardingState│  │  Existing      │  │   Branch     │ │
│  │     Table      │  │   Tables       │  │  Isolation   │ │
│  └────────────────┘  └────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Separate Onboarding Flow**: Not part of main React Admin - standalone routes
2. **Progressive State Persistence**: Save after each step
3. **Resume Capability**: Users can exit and return later
4. **Demo Data**: Pre-seed demo data for dashboard tour (Step 2)
5. **No Branch Switching**: Onboarding creates ONE new branch
6. **Post-Onboarding Redirect**: Redirect to main admin after completion

---

## Database Schema

### 1. New Table: `OnboardingState`

Track onboarding progress for each school/branch being created.

```prisma
model OnboardingState {
  id                    String   @id @default(cuid())
  userId                String   // Clerk user ID

  // Progress tracking
  currentStep           Int      @default(1) // 1-9
  completedSteps        Int[]    // Array of completed step numbers
  completed             Boolean  @default(false)

  // Step 1: School Setup
  schoolName            String?
  schoolType            String?
  location              String?
  academicYear          String?
  logoUrl               String?
  brandColor            String?

  // Step 2: Dashboard Tour (no data, just viewed)
  dashboardTourViewed   Boolean  @default(false)

  // Step 3: User Roles (references created users)
  demoUsersCreated      Boolean  @default(false)
  adminUserId           String?
  teacherUserIds        String[] // Array of teacher IDs

  // Step 4: Classes Setup
  classesCreated        Boolean  @default(false)
  classIds              String[] // Array of class IDs

  // Step 5: Timetable
  timetableGenerated    Boolean  @default(false)
  timetableId           String?

  // Step 6: Attendance
  attendanceConfigured  Boolean  @default(false)

  // Step 7: Fee Management
  feeStructureCreated   Boolean  @default(false)
  feeStructureIds       String[] // Array of fee structure IDs

  // Step 8: Reports
  reportsViewed         Boolean  @default(false)

  // Linked resources
  branchId              String?  @unique // Composite ID (e.g., "school-branch")
  tenantId              String?  // If using tenant system

  // Metadata
  startedAt             DateTime @default(now())
  lastUpdatedAt         DateTime @updatedAt
  completedAt           DateTime?

  // Session management
  sessionId             String?  // For anonymous/guest onboarding

  @@index([userId])
  @@index([branchId])
  @@index([completed])
}
```

### 2. Schema Additions to Existing Tables

#### `Branch` Table
```prisma
model Branch {
  // ... existing fields

  // Onboarding metadata
  onboardingCompleted   Boolean  @default(false)
  onboardingCompletedAt DateTime?
  setupAchievements     Json?    // Store achievement badges
}
```

#### `User` Table (if you have one)
```prisma
model User {
  // ... existing fields

  isOnboarding          Boolean  @default(false)
  onboardingStateId     String?
}
```

### 3. Demo Data Tables

For Step 2 (Dashboard Tour), we need demo data that's pre-seeded but marked as demo.

**Option A**: Use existing tables with a `isDemo` flag
**Option B**: Create separate demo tables (recommended for isolation)

```prisma
// Add to existing tables
model Student {
  // ... existing fields
  isDemo                Boolean  @default(false)
  demoOnboardingId      String?
}

model Teacher {
  // ... existing fields
  isDemo                Boolean  @default(false)
  demoOnboardingId      String?
}

// Similar for: AttendanceSession, Invoice, Payment, etc.
```

---

## Backend Implementation

### 1. New Module: `OnboardingModule`

Location: `apps/api/src/modules/onboarding/`

```typescript
// apps/api/src/modules/onboarding/onboarding.module.ts
import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { DemoDataService } from './demo-data.service';
import { TimetableGeneratorService } from './timetable-generator.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OnboardingController],
  providers: [
    OnboardingService,
    DemoDataService,
    TimetableGeneratorService,
  ],
  exports: [OnboardingService],
})
export class OnboardingModule {}
```

### 2. Controller Endpoints

```typescript
// apps/api/src/modules/onboarding/onboarding.controller.ts
import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../../auth/clerk-auth.guard';
import { OnboardingService } from './onboarding.service';
import { CurrentUser } from '../../auth/current-user.decorator';

@Controller('onboarding')
@UseGuards(ClerkAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  // Get or create onboarding state
  @Get('state')
  async getState(@CurrentUser() user: any) {
    return this.onboardingService.getOrCreateState(user.sub);
  }

  // Update onboarding state
  @Put('state')
  async updateState(
    @CurrentUser() user: any,
    @Body() data: UpdateOnboardingStateDto
  ) {
    return this.onboardingService.updateState(user.sub, data);
  }

  // Step 1: School Setup
  @Post('school-setup')
  async setupSchool(
    @CurrentUser() user: any,
    @Body() data: SchoolSetupDto
  ) {
    return this.onboardingService.setupSchool(user.sub, data);
  }

  // Step 2: Get demo data for dashboard tour
  @Get('demo-data')
  async getDemoData(@CurrentUser() user: any) {
    return this.onboardingService.getDemoData(user.sub);
  }

  // Step 3: Create users and roles
  @Post('users')
  async createUsers(
    @CurrentUser() user: any,
    @Body() data: CreateUsersDto
  ) {
    return this.onboardingService.createUsers(user.sub, data);
  }

  // Step 4: Create classes
  @Post('classes')
  async createClasses(
    @CurrentUser() user: any,
    @Body() data: CreateClassesDto
  ) {
    return this.onboardingService.createClasses(user.sub, data);
  }

  // Step 5: Generate timetable
  @Post('timetable/generate')
  async generateTimetable(
    @CurrentUser() user: any,
    @Body() data: GenerateTimetableDto
  ) {
    return this.onboardingService.generateTimetable(user.sub, data);
  }

  // Step 6: Configure attendance
  @Post('attendance')
  async configureAttendance(
    @CurrentUser() user: any,
    @Body() data: ConfigureAttendanceDto
  ) {
    return this.onboardingService.configureAttendance(user.sub, data);
  }

  // Step 7: Create fee structure
  @Post('fee-structure')
  async createFeeStructure(
    @CurrentUser() user: any,
    @Body() data: CreateFeeStructureDto
  ) {
    return this.onboardingService.createFeeStructure(user.sub, data);
  }

  // Step 8: Mark reports viewed
  @Post('reports/viewed')
  async markReportsViewed(@CurrentUser() user: any) {
    return this.onboardingService.markReportsViewed(user.sub);
  }

  // Step 9: Complete onboarding
  @Post('complete')
  async completeOnboarding(@CurrentUser() user: any) {
    return this.onboardingService.completeOnboarding(user.sub);
  }

  // Resume onboarding
  @Get('resume')
  async resumeOnboarding(@CurrentUser() user: any) {
    return this.onboardingService.getResumeData(user.sub);
  }
}
```

### 3. Service Implementation

```typescript
// apps/api/src/modules/onboarding/onboarding.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DemoDataService } from './demo-data.service';

@Injectable()
export class OnboardingService {
  constructor(
    private prisma: PrismaService,
    private demoDataService: DemoDataService,
  ) {}

  async getOrCreateState(userId: string) {
    let state = await this.prisma.onboardingState.findFirst({
      where: { userId, completed: false },
    });

    if (!state) {
      state = await this.prisma.onboardingState.create({
        data: {
          userId,
          currentStep: 1,
          completedSteps: [],
        },
      });
    }

    return state;
  }

  async updateState(userId: string, data: UpdateOnboardingStateDto) {
    const state = await this.getOrCreateState(userId);

    // Update completed steps
    const completedSteps = new Set(state.completedSteps);
    if (data.completedStep) {
      completedSteps.add(data.completedStep);
    }

    return this.prisma.onboardingState.update({
      where: { id: state.id },
      data: {
        currentStep: data.currentStep ?? state.currentStep,
        completedSteps: Array.from(completedSteps),
        lastUpdatedAt: new Date(),
        ...data.stepData,
      },
    });
  }

  async setupSchool(userId: string, data: SchoolSetupDto) {
    const state = await this.getOrCreateState(userId);

    // Create branch with composite ID
    const branchId = this.generateBranchId(data.schoolName);

    const branch = await this.prisma.branch.create({
      data: {
        id: branchId,
        schoolName: data.schoolName,
        schoolType: data.schoolType,
        location: data.location,
        academicYear: data.academicYear,
        logoUrl: data.logoUrl,
        brandColor: data.brandColor,
        onboardingCompleted: false,
      },
    });

    // Update onboarding state
    await this.prisma.onboardingState.update({
      where: { id: state.id },
      data: {
        branchId: branch.id,
        schoolName: data.schoolName,
        schoolType: data.schoolType,
        location: data.location,
        academicYear: data.academicYear,
        logoUrl: data.logoUrl,
        brandColor: data.brandColor,
        currentStep: 2,
        completedSteps: [1],
      },
    });

    return { branch, state };
  }

  async getDemoData(userId: string) {
    const state = await this.getOrCreateState(userId);

    // Generate or retrieve demo data
    const demoData = await this.demoDataService.generateDemoData(state.id);

    // Mark dashboard tour as viewed
    await this.prisma.onboardingState.update({
      where: { id: state.id },
      data: {
        dashboardTourViewed: true,
        currentStep: 3,
        completedSteps: [1, 2],
      },
    });

    return demoData;
  }

  async createClasses(userId: string, data: CreateClassesDto) {
    const state = await this.getOrCreateState(userId);

    if (!state.branchId) {
      throw new Error('Branch not created yet');
    }

    // Create classes in bulk
    const classes = await Promise.all(
      data.classes.map(cls =>
        this.prisma.class.create({
          data: {
            branchId: state.branchId,
            grade: cls.grade,
            section: cls.section,
            capacity: cls.capacity,
          },
        })
      )
    );

    const classIds = classes.map(c => c.id);

    await this.prisma.onboardingState.update({
      where: { id: state.id },
      data: {
        classesCreated: true,
        classIds,
        currentStep: 5,
        completedSteps: [1, 2, 3, 4],
      },
    });

    return { classes };
  }

  async generateTimetable(userId: string, data: GenerateTimetableDto) {
    const state = await this.getOrCreateState(userId);

    // Use AI/algorithm to generate optimized timetable
    // (Implementation details in separate service)
    const timetable = await this.timetableGeneratorService.generate({
      branchId: state.branchId,
      classIds: state.classIds,
      teacherIds: state.teacherUserIds,
      workingHours: data.workingHours,
      workingDays: data.workingDays,
    });

    await this.prisma.onboardingState.update({
      where: { id: state.id },
      data: {
        timetableGenerated: true,
        timetableId: timetable.id,
        currentStep: 6,
        completedSteps: [1, 2, 3, 4, 5],
      },
    });

    return { timetable };
  }

  async completeOnboarding(userId: string) {
    const state = await this.getOrCreateState(userId);

    // Mark branch as onboarding complete
    if (state.branchId) {
      await this.prisma.branch.update({
        where: { id: state.branchId },
        data: {
          onboardingCompleted: true,
          onboardingCompletedAt: new Date(),
        },
      });
    }

    // Mark onboarding state as complete
    await this.prisma.onboardingState.update({
      where: { id: state.id },
      data: {
        completed: true,
        completedAt: new Date(),
        currentStep: 9,
        completedSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
    });

    return {
      success: true,
      branchId: state.branchId,
      redirectTo: `/admin?branch=${state.branchId}`,
    };
  }

  private generateBranchId(schoolName: string): string {
    // Generate composite ID from school name
    // e.g., "Paramarsh International School" -> "paramarsh-main"
    const slug = schoolName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(' ')
      .slice(0, 2)
      .join('-');

    const suffix = Math.random().toString(36).substring(2, 6);
    return `${slug}-${suffix}`;
  }
}
```

### 4. DTOs (Data Transfer Objects)

```typescript
// apps/api/src/modules/onboarding/dto/school-setup.dto.ts
import { IsString, IsOptional, IsUrl } from 'class-validator';

export class SchoolSetupDto {
  @IsString()
  schoolName: string;

  @IsString()
  schoolType: string;

  @IsString()
  location: string;

  @IsString()
  academicYear: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  brandColor?: string;
}

export class CreateClassesDto {
  @IsArray()
  classes: Array<{
    grade: string;
    section: string;
    capacity: number;
  }>;
}

export class GenerateTimetableDto {
  workingHours: {
    start: string;
    end: string;
  };
  workingDays: string[];
}

// ... more DTOs
```

### 5. Demo Data Service

```typescript
// apps/api/src/modules/onboarding/demo-data.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DemoDataService {
  constructor(private prisma: PrismaService) {}

  async generateDemoData(onboardingStateId: string) {
    // Check if demo data already exists
    const existing = await this.prisma.student.findFirst({
      where: {
        isDemo: true,
        demoOnboardingId: onboardingStateId,
      },
    });

    if (existing) {
      return this.getDemoData(onboardingStateId);
    }

    // Create demo data
    await this.createDemoStudents(onboardingStateId);
    await this.createDemoTeachers(onboardingStateId);
    await this.createDemoAttendance(onboardingStateId);
    await this.createDemoFinancials(onboardingStateId);

    return this.getDemoData(onboardingStateId);
  }

  private async createDemoStudents(onboardingStateId: string) {
    // Create realistic demo students
    const demoStudents = [
      { firstName: 'Aarav', lastName: 'Sharma', rollNumber: '8A01' },
      { firstName: 'Diya', lastName: 'Patel', rollNumber: '8A02' },
      // ... more students
    ];

    await this.prisma.student.createMany({
      data: demoStudents.map(s => ({
        ...s,
        isDemo: true,
        demoOnboardingId: onboardingStateId,
        branchId: 'demo-branch', // Special demo branch
      })),
    });
  }

  private async getDemoData(onboardingStateId: string) {
    return {
      kpis: {
        totalStudents: 1200,
        teachingStaff: 85,
        avgAttendance: 92,
        feeCollection: 85,
      },
      students: await this.prisma.student.findMany({
        where: { isDemo: true, demoOnboardingId: onboardingStateId },
        take: 50,
      }),
      // ... more demo data
    };
  }
}
```

---

## Frontend Implementation

### 1. Routing Structure

```
apps/web/app/
├── onboarding/
│   ├── layout.tsx                  # Onboarding-specific layout
│   ├── page.tsx                    # Step 1: School Setup
│   ├── dashboard-tour/
│   │   └── page.tsx               # Step 2: Dashboard Tour
│   ├── user-roles/
│   │   └── page.tsx               # Step 3: User Roles
│   ├── classes/
│   │   └── page.tsx               # Step 4: Classes
│   ├── timetable/
│   │   └── page.tsx               # Step 5: Timetable
│   ├── attendance/
│   │   └── page.tsx               # Step 6: Attendance
│   ├── fees/
│   │   └── page.tsx               # Step 7: Fees
│   ├── reports/
│   │   └── page.tsx               # Step 8: Reports
│   └── complete/
│       └── page.tsx               # Step 9: Complete
└── admin/
    └── ... (existing admin app)
```

### 2. Onboarding Layout

```typescript
// apps/web/app/onboarding/layout.tsx
'use client';

import { OnboardingProvider } from './OnboardingProvider';
import { OnboardingProgressBar } from './components/OnboardingProgressBar';
import { OnboardingHeader } from './components/OnboardingHeader';

export default function OnboardingLayout({
  children,
}: {
  children: React.Node;
}) {
  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-background">
        <OnboardingHeader />
        <OnboardingProgressBar />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </OnboardingProvider>
  );
}
```

### 3. Onboarding Context & Provider

```typescript
// apps/web/app/onboarding/OnboardingProvider.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface OnboardingState {
  currentStep: number;
  completedSteps: number[];
  schoolData?: SchoolSetupData;
  branchId?: string;
  // ... other state
}

interface OnboardingContextType {
  state: OnboardingState | null;
  updateState: (data: Partial<OnboardingState>) => Promise<void>;
  completeStep: (step: number) => Promise<void>;
  goToStep: (step: number) => void;
  isLoading: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.Node }) {
  const [state, setState] = useState<OnboardingState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadOnboardingState();
  }, []);

  async function loadOnboardingState() {
    try {
      const response = await fetch('/api/onboarding/state');
      const data = await response.json();
      setState(data);
    } catch (error) {
      console.error('Failed to load onboarding state:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateState(data: Partial<OnboardingState>) {
    try {
      const response = await fetch('/api/onboarding/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const updated = await response.json();
      setState(updated);
    } catch (error) {
      console.error('Failed to update state:', error);
      throw error;
    }
  }

  async function completeStep(step: number) {
    await updateState({
      completedSteps: [...(state?.completedSteps || []), step],
      currentStep: step + 1,
    });
  }

  function goToStep(step: number) {
    const routes = [
      '/onboarding',
      '/onboarding/dashboard-tour',
      '/onboarding/user-roles',
      '/onboarding/classes',
      '/onboarding/timetable',
      '/onboarding/attendance',
      '/onboarding/fees',
      '/onboarding/reports',
      '/onboarding/complete',
    ];

    router.push(routes[step - 1]);
  }

  return (
    <OnboardingContext.Provider
      value={{ state, updateState, completeStep, goToStep, isLoading }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
```

### 4. Progress Bar Component

```typescript
// apps/web/app/onboarding/components/OnboardingProgressBar.tsx
'use client';

import { useOnboarding } from '../OnboardingProvider';
import { cn } from '@/lib/utils';

const STEPS = [
  { number: 1, label: 'School Setup' },
  { number: 2, label: 'Dashboard Tour' },
  { number: 3, label: 'User Roles' },
  { number: 4, label: 'Classes' },
  { number: 5, label: 'Timetable' },
  { number: 6, label: 'Attendance' },
  { number: 7, label: 'Fees' },
  { number: 8, label: 'Reports' },
  { number: 9, label: 'Complete' },
];

export function OnboardingProgressBar() {
  const { state } = useOnboarding();

  if (!state) return null;

  const progress = (state.completedSteps.length / STEPS.length) * 100;

  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        {/* Progress bar */}
        <div className="mb-4 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                  state.completedSteps.includes(step.number)
                    ? 'bg-primary text-primary-foreground'
                    : state.currentStep === step.number
                    ? 'bg-primary/20 text-primary border-2 border-primary'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {state.completedSteps.includes(step.number) ? '✓' : step.number}
              </div>
              <span
                className={cn(
                  'hidden md:block text-xs',
                  state.currentStep === step.number
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 5. Step Components

#### Step 1: School Setup

```typescript
// apps/web/app/onboarding/page.tsx
'use client';

import { useState } from 'react';
import { useOnboarding } from './OnboardingProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SchoolSetupPage() {
  const { completeStep, goToStep } = useOnboarding();
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolType: '',
    location: '',
    academicYear: '',
    logoUrl: '',
    brandColor: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const response = await fetch('/api/onboarding/school-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await completeStep(1);
        goToStep(2);
      }
    } catch (error) {
      console.error('Failed to setup school:', error);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <span className="text-3xl">🏫</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Welcome to Paramarsh</h1>
        <p className="text-muted-foreground">
          Let's set up your school profile to get started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="schoolName">School Name *</Label>
          <Input
            id="schoolName"
            value={formData.schoolName}
            onChange={(e) =>
              setFormData({ ...formData, schoolName: e.target.value })
            }
            placeholder="Paramarsh International School"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="schoolType">School Type</Label>
          <Select
            value={formData.schoolType}
            onValueChange={(value) =>
              setFormData({ ...formData, schoolType: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select school type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">Private School</SelectItem>
              <SelectItem value="government">Government School</SelectItem>
              <SelectItem value="international">International School</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            placeholder="Mumbai, Maharashtra"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="academicYear">Academic Year *</Label>
          <Select
            value={formData.academicYear}
            onValueChange={(value) =>
              setFormData({ ...formData, academicYear: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select academic year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-25">2024-25</SelectItem>
              <SelectItem value="2025-26">2025-26</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logo upload and color picker would go here */}

        <div className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Back to Home
          </Button>
          <Button type="submit">Continue Setup</Button>
        </div>
      </form>
    </div>
  );
}
```

#### Step 2: Dashboard Tour

```typescript
// apps/web/app/onboarding/dashboard-tour/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useOnboarding } from '../OnboardingProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardTourPage() {
  const { completeStep, goToStep } = useOnboarding();
  const [demoData, setDemoData] = useState(null);

  useEffect(() => {
    loadDemoData();
  }, []);

  async function loadDemoData() {
    const response = await fetch('/api/onboarding/demo-data');
    const data = await response.json();
    setDemoData(data);
  }

  async function handleContinue() {
    await completeStep(2);
    goToStep(3);
  }

  if (!demoData) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Your School Dashboard</h1>
        <p className="text-muted-foreground">
          Here's a live preview with demo data from Paramarsh International School
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{demoData.kpis.totalStudents}</div>
            <p className="text-sm text-green-600">+5.2%</p>
          </CardContent>
        </Card>
        {/* More KPI cards */}
      </div>

      {/* Charts and other demo data visualizations */}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={() => goToStep(1)}>
          Back
        </Button>
        <Button onClick={handleContinue}>Continue to User Setup</Button>
      </div>
    </div>
  );
}
```

### 6. API Route Handlers (Next.js)

```typescript
// apps/web/app/api/onboarding/state/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  const { userId, getToken } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = await getToken();

  const response = await fetch(`${BACKEND_URL}/onboarding/state`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const { userId, getToken } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = await getToken();
  const body = await request.json();

  const response = await fetch(`${BACKEND_URL}/onboarding/state`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data);
}
```

---

## State Management

### Strategy: Server-Side State with Client-Side Caching

1. **Source of Truth**: PostgreSQL via Prisma
2. **Client Caching**: React Context + SWR/React Query (optional)
3. **Persistence**: Auto-save after each step
4. **Resume**: Fetch state on mount, redirect to current step

### State Flow

```
User Action → Frontend Component → API Route → Backend Service → Database
                ↓                                                      ↓
          Update Context                                      Persist State
                ↓
          Re-render UI
```

---

## Routing & Navigation

### Navigation Rules

1. **Linear Progression**: Users must complete steps in order
2. **Back Navigation**: Allowed to previous completed steps
3. **Skip Prevention**: Cannot skip to future steps
4. **Resume Logic**: Redirect to `currentStep` on page load
5. **Completion Redirect**: Redirect to main admin after step 9

### Implementation

```typescript
// apps/web/app/onboarding/middleware.ts
export function onboardingMiddleware(state: OnboardingState, requestedStep: number) {
  // User trying to access future step
  if (requestedStep > state.currentStep) {
    return { redirect: `/onboarding/${getStepRoute(state.currentStep)}` };
  }

  // User trying to access already completed onboarding
  if (state.completed) {
    return { redirect: `/admin?branch=${state.branchId}` };
  }

  // Allow access
  return { allowed: true };
}
```

---

## Integration Points

### 1. Clerk Authentication
- Use existing Clerk setup
- No changes needed to auth flow
- Use `@CurrentUser()` decorator in backend

### 2. Existing Modules
Onboarding calls existing backend modules:
- `StudentsModule` - Create demo students
- `TeachersModule` - Create demo teachers
- `ClassesModule` - Create classes
- `TimetableModule` - Generate timetable
- `FeeStructuresModule` - Create fee structures

### 3. Multi-Tenancy
- Onboarding creates a new `branchId`
- All subsequent operations use this `branchId`
- Stored in `OnboardingState.branchId`
- Set as selected branch after completion

### 4. React Admin Integration
- **Separate from Admin**: Onboarding is NOT part of React Admin
- **No Admin Resources**: Don't add onboarding as a Resource
- **Post-Onboarding**: After completion, user enters normal React Admin flow

---

## Testing Strategy

### Backend Tests

```typescript
// apps/api/src/modules/onboarding/onboarding.service.spec.ts
describe('OnboardingService', () => {
  describe('setupSchool', () => {
    it('should create branch and update state', async () => {
      const result = await service.setupSchool(userId, schoolData);
      expect(result.branch).toBeDefined();
      expect(result.branch.schoolName).toBe(schoolData.schoolName);
    });
  });

  describe('generateTimetable', () => {
    it('should generate conflict-free timetable', async () => {
      const result = await service.generateTimetable(userId, config);
      expect(result.timetable.conflicts).toHaveLength(0);
    });
  });
});
```

### Frontend Tests

Use `frontend-tester` agent for component tests:

```typescript
// apps/web/app/onboarding/__tests__/SchoolSetup.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import SchoolSetupPage from '../page';

describe('SchoolSetupPage', () => {
  it('should render school setup form', () => {
    render(<SchoolSetupPage />);
    expect(screen.getByLabelText(/school name/i)).toBeInTheDocument();
  });

  it('should submit form and navigate to next step', async () => {
    render(<SchoolSetupPage />);

    fireEvent.change(screen.getByLabelText(/school name/i), {
      target: { value: 'Test School' },
    });

    fireEvent.click(screen.getByText(/continue setup/i));

    // Assert navigation happened
  });
});
```

### E2E Tests

Use `playwright-e2e-tester` agent for full flow:

```typescript
// apps/web/e2e/onboarding.spec.ts
import { test, expect } from '@playwright/test';

test('complete onboarding flow', async ({ page }) => {
  await page.goto('/onboarding');

  // Step 1: School Setup
  await page.fill('[name="schoolName"]', 'Test School');
  await page.selectOption('[name="schoolType"]', 'private');
  await page.fill('[name="location"]', 'Mumbai, Maharashtra');
  await page.click('button:has-text("Continue Setup")');

  // Step 2: Dashboard Tour
  await expect(page).toHaveURL('/onboarding/dashboard-tour');
  await page.click('button:has-text("Continue to User Setup")');

  // ... continue through all steps

  // Step 9: Completion
  await expect(page).toHaveURL('/onboarding/complete');
  await expect(page.locator('text=Congratulations')).toBeVisible();

  await page.click('button:has-text("Go to Dashboard")');
  await expect(page).toHaveURL(/\/admin/);
});
```

---

## Deployment Plan

### Phase 1: Infrastructure (Week 1)
- [ ] Database migration: Add `OnboardingState` table
- [ ] Backend: Create `OnboardingModule` skeleton
- [ ] Frontend: Create routing structure
- [ ] CI/CD: Update deployment scripts

### Phase 2: Backend Development (Week 2-3)
- [ ] Implement `OnboardingService`
- [ ] Create all API endpoints
- [ ] Implement `DemoDataService`
- [ ] Write unit tests
- [ ] API documentation

### Phase 3: Frontend Development (Week 3-4)
- [ ] Build Step 1: School Setup
- [ ] Build Step 2: Dashboard Tour
- [ ] Build Steps 3-8
- [ ] Build Step 9: Completion
- [ ] Progress bar and navigation
- [ ] Component tests

### Phase 4: Integration (Week 5)
- [ ] Connect frontend to backend
- [ ] Test full flow
- [ ] Fix bugs and issues
- [ ] Performance optimization
- [ ] E2E tests

### Phase 5: Polish (Week 6)
- [ ] UI/UX refinements
- [ ] Error handling
- [ ] Loading states
- [ ] Documentation
- [ ] User acceptance testing

### Phase 6: Launch (Week 7)
- [ ] Deploy to staging
- [ ] QA testing
- [ ] Deploy to production
- [ ] Monitor and iterate

---

## Implementation Steps

### Step-by-Step Guide

#### Step 1: Database Setup

```bash
# 1. Create migration file
cd apps/api
npx prisma migrate dev --name add_onboarding_state

# 2. Add OnboardingState model to schema.prisma
# (See Database Schema section above)

# 3. Run migration
npx prisma migrate deploy
```

#### Step 2: Backend Module

```bash
# 1. Create module structure
mkdir -p apps/api/src/modules/onboarding
cd apps/api/src/modules/onboarding

# 2. Generate files
nest g module onboarding
nest g controller onboarding
nest g service onboarding
nest g service demo-data
nest g service timetable-generator

# 3. Implement services (see Backend Implementation section)
```

#### Step 3: Frontend Routes

```bash
# 1. Create onboarding directory
mkdir -p apps/web/app/onboarding

# 2. Create all step directories
mkdir -p apps/web/app/onboarding/{dashboard-tour,user-roles,classes,timetable,attendance,fees,reports,complete}

# 3. Create page files for each step
touch apps/web/app/onboarding/page.tsx
touch apps/web/app/onboarding/dashboard-tour/page.tsx
# ... etc for all steps

# 4. Implement components (see Frontend Implementation section)
```

#### Step 4: State Management

```bash
# 1. Create context
touch apps/web/app/onboarding/OnboardingProvider.tsx

# 2. Create components
mkdir -p apps/web/app/onboarding/components
touch apps/web/app/onboarding/components/{OnboardingProgressBar,OnboardingHeader,StepNavigation}.tsx

# 3. Implement (see State Management section)
```

#### Step 5: API Routes

```bash
# 1. Create API routes
mkdir -p apps/web/app/api/onboarding/{state,school-setup,demo-data,classes,timetable,attendance,fees,complete}

# 2. Implement route handlers
# (See API Route Handlers section)
```

#### Step 6: Testing

```bash
# Backend tests
cd apps/api
npm run test:e2e -- --testPathPattern=onboarding

# Frontend tests
cd apps/web
npm test -- onboarding

# E2E tests
npm run test:e2e -- onboarding.spec.ts
```

---

## Key Considerations

### 1. Performance
- **Lazy Load**: Load demo data on-demand (Step 2)
- **Batch Operations**: Create multiple classes in one transaction
- **Caching**: Cache demo data generation
- **Optimistic Updates**: Update UI immediately, sync in background

### 2. Error Handling
- **Graceful Degradation**: Allow partial completion
- **Retry Logic**: Retry failed API calls
- **Error Boundaries**: Catch and display errors properly
- **Rollback**: Allow reverting to previous step on error

### 3. Security
- **Authentication**: All endpoints require Clerk auth
- **Authorization**: Users can only access their own onboarding
- **Validation**: Validate all inputs (DTOs)
- **Rate Limiting**: Prevent abuse

### 4. Accessibility
- **Keyboard Navigation**: All steps accessible via keyboard
- **Screen Readers**: Proper ARIA labels
- **Focus Management**: Focus management between steps
- **Color Contrast**: WCAG AA compliant

### 5. Mobile Responsiveness
- **Responsive Design**: Works on all screen sizes
- **Touch-Friendly**: Large touch targets
- **Progressive Disclosure**: Hide complexity on mobile

---

## Success Metrics

### Technical Metrics
- **Completion Rate**: % of users completing all 9 steps
- **Average Time**: Average time to complete onboarding
- **Drop-off Points**: Which steps have highest abandonment
- **Error Rate**: % of API calls that fail
- **Load Time**: Page load time for each step

### Business Metrics
- **User Activation**: % of users who reach main admin after onboarding
- **Data Quality**: % of schools with complete profiles
- **Feature Adoption**: % of users using each module
- **User Satisfaction**: NPS score for onboarding experience

---

## Appendix

### A. Technology Stack Summary
- **Frontend Framework**: Next.js 14+ (App Router)
- **UI Library**: shadcn/ui (NOT the reference design)
- **Admin Framework**: React Admin
- **Backend Framework**: NestJS
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: Clerk
- **State Management**: React Context
- **Testing**: Jest, React Testing Library, Playwright

### B. File Structure Summary

```
apps/
├── api/
│   └── src/
│       └── modules/
│           └── onboarding/
│               ├── onboarding.module.ts
│               ├── onboarding.controller.ts
│               ├── onboarding.service.ts
│               ├── demo-data.service.ts
│               ├── timetable-generator.service.ts
│               └── dto/
│                   ├── school-setup.dto.ts
│                   ├── create-classes.dto.ts
│                   └── ...
└── web/
    └── app/
        ├── onboarding/
        │   ├── layout.tsx
        │   ├── page.tsx (Step 1)
        │   ├── OnboardingProvider.tsx
        │   ├── components/
        │   │   ├── OnboardingProgressBar.tsx
        │   │   ├── OnboardingHeader.tsx
        │   │   └── StepNavigation.tsx
        │   ├── dashboard-tour/
        │   │   └── page.tsx (Step 2)
        │   ├── user-roles/
        │   │   └── page.tsx (Step 3)
        │   ├── classes/
        │   │   └── page.tsx (Step 4)
        │   ├── timetable/
        │   │   └── page.tsx (Step 5)
        │   ├── attendance/
        │   │   └── page.tsx (Step 6)
        │   ├── fees/
        │   │   └── page.tsx (Step 7)
        │   ├── reports/
        │   │   └── page.tsx (Step 8)
        │   └── complete/
        │       └── page.tsx (Step 9)
        └── api/
            └── onboarding/
                ├── state/
                │   └── route.ts
                ├── school-setup/
                │   └── route.ts
                └── ...
```

### C. Agent Assignments

| Task | Agent | Rationale |
|------|-------|-----------|
| Backend API development | `backend-implementer` | NestJS + React Admin format |
| Frontend components | `frontend-implementer` | shadcn/ui + React components |
| Component unit tests | `frontend-tester` | Real component testing |
| E2E onboarding flow | `playwright-e2e-tester` | Browser automation |
| Backend API tests | `tester` | NestJS E2E tests |
| Code review | `implementation-reviewer` | Validation & compliance |

### D. Related Documentation
- [ONBOARDING-JOURNEY.md](./ONBOARDING-JOURNEY.md) - Feature specification
- [README.md](./README.md) - Quick reference
- `/docs/PRD.md` - Product requirements
- `/docs/react-admin-api-spec.md` - API standards
- `/docs/frontend-testing-guide.md` - Testing patterns

---

**Document Version**: 1.0
**Last Updated**: 2025-10-07
**Author**: Paramarsh Team
**Status**: Ready for Implementation
**Estimated Effort**: 6-7 weeks (1 senior full-stack developer)
