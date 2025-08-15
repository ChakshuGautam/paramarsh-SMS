# Attendance System - Technical Implementation Plan

## Overview
This document provides specific implementation details for the Attendance Management System PRD, mapping requirements to actual code changes.

## 1. Database Schema Changes

### 1.1 Modify Existing Tables

#### `/apps/api/prisma/schema.prisma`

**Current AttendanceRecord model (lines ~180-195):**
```prisma
model AttendanceRecord {
  id        String   @id @default(uuid())
  branchId  String
  studentId String
  date      String
  status    String?
  reason    String?
  markedBy  String?
  source    String?
  
  student   Student  @relation(fields: [studentId], references: [id])
  branch    Branch   @relation(fields: [branchId], references: [id])
}
```

**CHANGE TO:** Add new models for period-wise attendance:
```prisma
// ADD: New attendance session model (line ~196)
model AttendanceSession {
  id               String   @id @default(uuid())
  branchId         String
  date             DateTime
  periodId         String   // From TimetablePeriod
  sectionId        String
  subjectId        String
  assignedTeacherId String  // Originally assigned
  actualTeacherId  String?  // Substitute if different
  startTime        DateTime?
  endTime          DateTime?
  status           String   @default("scheduled") // scheduled, in-progress, completed, cancelled
  lockedAt         DateTime?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  // Relations
  period           TimetablePeriod @relation(fields: [periodId], references: [id])
  section          Section @relation(fields: [sectionId], references: [id])
  subject          Subject @relation(fields: [subjectId], references: [id])
  assignedTeacher  Teacher @relation("AssignedSessions", fields: [assignedTeacherId], references: [id])
  actualTeacher    Teacher? @relation("ActualSessions", fields: [actualTeacherId], references: [id])
  studentRecords   StudentPeriodAttendance[]
  branch           Branch @relation(fields: [branchId], references: [id])
  
  @@index([date, sectionId])
  @@index([date, assignedTeacherId])
}

// ADD: Student attendance per period (line ~220)
model StudentPeriodAttendance {
  id           String   @id @default(uuid())
  sessionId    String
  studentId    String
  status       String   // present, absent, late, excused, medical, suspended, activity
  minutesLate  Int?
  reason       String?
  notes        String?
  markedAt     DateTime
  markedBy     String
  
  // Relations
  session      AttendanceSession @relation(fields: [sessionId], references: [id])
  student      Student @relation(fields: [studentId], references: [id])
  marker       Teacher @relation(fields: [markedBy], references: [id])
  
  @@unique([sessionId, studentId])
  @@index([studentId, status])
}

// ADD: Teacher daily attendance (line ~240)
model TeacherDailyAttendance {
  id           String   @id @default(uuid())
  branchId     String
  teacherId    String
  date         DateTime @db.Date
  checkIn      DateTime?
  checkOut     DateTime?
  status       String   // present, absent, leave, holiday, half-day
  leaveType    String?
  substituteId String?  // Who's substituting for this teacher
  totalHours   Float?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  // Relations
  teacher      Teacher @relation("TeacherAttendance", fields: [teacherId], references: [id])
  substitute   Teacher? @relation("SubstituteFor", fields: [substituteId], references: [id])
  branch       Branch @relation(fields: [branchId], references: [id])
  
  @@unique([teacherId, date])
  @@index([date, status])
}
```

**Update Teacher model (line ~450):**
```prisma
model Teacher {
  // ... existing fields ...
  
  // ADD: New relations
  assignedSessions    AttendanceSession[] @relation("AssignedSessions")
  actualSessions      AttendanceSession[] @relation("ActualSessions")
  markedAttendance    StudentPeriodAttendance[]
  dailyAttendance     TeacherDailyAttendance[] @relation("TeacherAttendance")
  substitutingSessions TeacherDailyAttendance[] @relation("SubstituteFor")
}
```

**Update Student model (line ~350):**
```prisma
model Student {
  // ... existing fields ...
  
  // ADD: New relation
  periodAttendance StudentPeriodAttendance[]
}
```

## 2. Backend API Implementation

### 2.1 New Modules Structure

```
/apps/api/src/modules/
├── attendance-sessions/     # NEW MODULE
│   ├── attendance-sessions.module.ts
│   ├── attendance-sessions.controller.ts
│   ├── attendance-sessions.service.ts
│   └── dto/
│       ├── create-session.dto.ts
│       ├── mark-attendance.dto.ts
│       └── session-query.dto.ts
├── teacher-attendance/      # NEW MODULE
│   ├── teacher-attendance.module.ts
│   ├── teacher-attendance.controller.ts
│   ├── teacher-attendance.service.ts
│   └── dto/
│       ├── check-in.dto.ts
│       └── substitute.dto.ts
└── attendance/             # EXISTING - Modify
    ├── attendance.controller.ts  # Keep for backward compatibility
    └── attendance.service.ts      # Extend with new methods
```

### 2.2 New Service: AttendanceSessionsService

**CREATE: `/apps/api/src/modules/attendance-sessions/attendance-sessions.service.ts`**
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimetableService } from '../timetable/timetable.service';

@Injectable()
export class AttendanceSessionsService {
  constructor(
    private prisma: PrismaService,
    private timetable: TimetableService
  ) {}

  // Line 15-40: Get current period's session
  async getCurrentSession(teacherId: string) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    
    // Get current period from timetable
    const currentPeriod = await this.timetable.getCurrentPeriod();
    if (!currentPeriod) return null;
    
    // Check if session exists, create if not
    let session = await this.prisma.attendanceSession.findFirst({
      where: {
        date: new Date(now.toDateString()),
        periodId: currentPeriod.id,
        assignedTeacherId: teacherId
      }
    });
    
    if (!session) {
      session = await this.createSessionFromPeriod(currentPeriod, now);
    }
    
    return session;
  }

  // Line 45-80: Create session from timetable period
  private async createSessionFromPeriod(period: any, date: Date) {
    return this.prisma.attendanceSession.create({
      data: {
        date,
        periodId: period.id,
        sectionId: period.sectionId,
        subjectId: period.subjectId,
        assignedTeacherId: period.teacherId,
        status: 'scheduled',
        branchId: PrismaService.getScope().branchId
      },
      include: {
        section: {
          include: {
            students: true  // Get all students in this section
          }
        },
        subject: true,
        assignedTeacher: true
      }
    });
  }

  // Line 85-120: Mark attendance for a session
  async markAttendance(sessionId: string, markings: MarkAttendanceDto[]) {
    // Start transaction
    return this.prisma.$transaction(async (tx) => {
      // Update session status
      await tx.attendanceSession.update({
        where: { id: sessionId },
        data: { 
          status: 'in-progress',
          startTime: new Date()
        }
      });
      
      // Bulk create attendance records
      const records = markings.map(mark => ({
        sessionId,
        studentId: mark.studentId,
        status: mark.status,
        minutesLate: mark.minutesLate,
        reason: mark.reason,
        markedAt: new Date(),
        markedBy: mark.teacherId
      }));
      
      await tx.studentPeriodAttendance.createMany({
        data: records,
        skipDuplicates: true
      });
      
      return { success: true, marked: records.length };
    });
  }

  // Line 125-150: Complete and lock session
  async completeSession(sessionId: string) {
    return this.prisma.attendanceSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        endTime: new Date(),
        lockedAt: new Date()
      }
    });
  }

  // Line 155-200: Get attendance roster for a session
  async getSessionRoster(sessionId: string) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        section: {
          include: {
            enrollments: {
              where: { status: 'enrolled' },
              include: {
                student: true
              }
            }
          }
        },
        studentRecords: true
      }
    });
    
    // Map students with their attendance status
    return session.section.enrollments.map(enrollment => {
      const record = session.studentRecords.find(
        r => r.studentId === enrollment.studentId
      );
      
      return {
        studentId: enrollment.student.id,
        rollNumber: enrollment.student.rollNumber,
        firstName: enrollment.student.firstName,
        lastName: enrollment.student.lastName,
        photoUrl: enrollment.student.photoUrl,
        status: record?.status || null,
        markedAt: record?.markedAt || null
      };
    });
  }
}
```

### 2.3 New Controller: AttendanceSessionsController

**CREATE: `/apps/api/src/modules/attendance-sessions/attendance-sessions.controller.ts`**
```typescript
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AttendanceSessionsService } from './attendance-sessions.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Attendance Sessions')
@Controller('attendance/sessions')
@UseGuards(AuthGuard)  // Add your auth guard
export class AttendanceSessionsController {
  constructor(private service: AttendanceSessionsService) {}

  // Line 15-25
  @Get('current')
  @ApiOperation({ summary: 'Get current period session for teacher' })
  getCurrentSession(@CurrentUser() user: any) {
    return this.service.getCurrentSession(user.teacherId);
  }

  // Line 30-40
  @Get('today')
  @ApiOperation({ summary: 'Get all today sessions for teacher' })
  getTodaySessions(@CurrentUser() user: any) {
    return this.service.getTodaysSessions(user.teacherId);
  }

  // Line 45-55
  @Get(':id/roster')
  @ApiOperation({ summary: 'Get student roster for session' })
  getSessionRoster(@Param('id') id: string) {
    return this.service.getSessionRoster(id);
  }

  // Line 60-70
  @Post(':id/mark')
  @ApiOperation({ summary: 'Mark attendance for session' })
  markAttendance(
    @Param('id') id: string,
    @Body() body: MarkAttendanceDto[],
    @CurrentUser() user: any
  ) {
    return this.service.markAttendance(id, body.map(b => ({
      ...b,
      teacherId: user.teacherId
    })));
  }

  // Line 75-85
  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete and lock attendance session' })
  completeSession(@Param('id') id: string) {
    return this.service.completeSession(id);
  }
}
```

### 2.4 Teacher Attendance Service

**CREATE: `/apps/api/src/modules/teacher-attendance/teacher-attendance.service.ts`**
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TeacherAttendanceService {
  constructor(private prisma: PrismaService) {}

  // Line 10-30: Teacher check-in
  async checkIn(teacherId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.prisma.teacherDailyAttendance.upsert({
      where: {
        teacherId_date: {
          teacherId,
          date: today
        }
      },
      update: {
        checkIn: new Date(),
        status: 'present'
      },
      create: {
        teacherId,
        date: today,
        checkIn: new Date(),
        status: 'present',
        branchId: PrismaService.getScope().branchId
      }
    });
  }

  // Line 35-55: Teacher check-out
  async checkOut(teacherId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendance = await this.prisma.teacherDailyAttendance.findUnique({
      where: {
        teacherId_date: {
          teacherId,
          date: today
        }
      }
    });
    
    if (!attendance || !attendance.checkIn) {
      throw new Error('No check-in found for today');
    }
    
    const checkOut = new Date();
    const totalHours = (checkOut.getTime() - attendance.checkIn.getTime()) / (1000 * 60 * 60);
    
    return this.prisma.teacherDailyAttendance.update({
      where: { id: attendance.id },
      data: {
        checkOut,
        totalHours
      }
    });
  }

  // Line 60-90: Assign substitute
  async assignSubstitute(
    originalTeacherId: string,
    substituteTeacherId: string,
    date: Date,
    periodIds?: string[]
  ) {
    // Update teacher daily attendance
    await this.prisma.teacherDailyAttendance.upsert({
      where: {
        teacherId_date: {
          teacherId: originalTeacherId,
          date
        }
      },
      update: {
        status: 'absent',
        substituteId: substituteTeacherId
      },
      create: {
        teacherId: originalTeacherId,
        date,
        status: 'absent',
        substituteId: substituteTeacherId,
        branchId: PrismaService.getScope().branchId
      }
    });
    
    // Update specific sessions if periodIds provided
    if (periodIds && periodIds.length > 0) {
      await this.prisma.attendanceSession.updateMany({
        where: {
          date,
          assignedTeacherId: originalTeacherId,
          periodId: { in: periodIds }
        },
        data: {
          actualTeacherId: substituteTeacherId
        }
      });
    }
  }
}
```

### 2.5 Update Existing Attendance Module

**MODIFY: `/apps/api/src/modules/attendance/attendance.service.ts`**

Add these methods after line 68:
```typescript
  // Line 70-120: Add aggregation methods
  async getStudentAttendanceSummary(studentId: string, startDate?: Date, endDate?: Date) {
    const where: any = { studentId };
    if (startDate) where.session = { date: { gte: startDate } };
    if (endDate) where.session = { date: { lte: endDate } };
    
    const records = await this.prisma.studentPeriodAttendance.findMany({
      where,
      include: {
        session: {
          include: {
            subject: true
          }
        }
      }
    });
    
    // Calculate statistics
    const totalPeriods = records.length;
    const presentCount = records.filter(r => r.status === 'present').length;
    const absentCount = records.filter(r => r.status === 'absent').length;
    const lateCount = records.filter(r => r.status === 'late').length;
    
    // Group by subject
    const subjectWise = records.reduce((acc, record) => {
      const subjectName = record.session.subject.name;
      if (!acc[subjectName]) {
        acc[subjectName] = { total: 0, present: 0, percentage: 0 };
      }
      acc[subjectName].total++;
      if (record.status === 'present' || record.status === 'late') {
        acc[subjectName].present++;
      }
      acc[subjectName].percentage = (acc[subjectName].present / acc[subjectName].total) * 100;
      return acc;
    }, {});
    
    return {
      overall: {
        totalPeriods,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        percentage: ((presentCount + lateCount) / totalPeriods) * 100
      },
      subjectWise
    };
  }

  // Line 125-150: Daily attendance report
  async generateDailyReport(date: Date) {
    const sessions = await this.prisma.attendanceSession.findMany({
      where: { date },
      include: {
        section: true,
        subject: true,
        studentRecords: true
      }
    });
    
    const sectionReports = sessions.reduce((acc, session) => {
      const sectionName = session.section.name;
      if (!acc[sectionName]) {
        acc[sectionName] = {
          totalStudents: 0,
          present: 0,
          absent: 0,
          periods: []
        };
      }
      
      const present = session.studentRecords.filter(r => 
        r.status === 'present' || r.status === 'late'
      ).length;
      
      acc[sectionName].periods.push({
        subject: session.subject.name,
        present,
        absent: session.studentRecords.length - present
      });
      
      return acc;
    }, {});
    
    return { date, sections: sectionReports };
  }
```

### 2.6 Update App Module

**MODIFY: `/apps/api/src/app.module.ts`**

Add imports at line 26:
```typescript
import { AttendanceSessionsModule } from './modules/attendance-sessions/attendance-sessions.module';
import { TeacherAttendanceModule } from './modules/teacher-attendance/teacher-attendance.module';
```

Add to imports array at line 56:
```typescript
    AttendanceSessionsModule,
    TeacherAttendanceModule,
```

## 3. Frontend Implementation

### 3.1 New Components Structure

```
/apps/web/app/admin/
├── attendance/              # NEW FOLDER
│   ├── SessionView.tsx     # Current period attendance
│   ├── RosterGrid.tsx      # Student grid with photos
│   ├── QuickActions.tsx    # Bulk marking buttons
│   └── AttendanceStats.tsx # Real-time statistics
├── resources/
│   ├── attendanceRecords/  # MODIFY existing
│   │   └── List.tsx        # Add period view
│   └── attendanceSessions/ # NEW RESOURCE
│       ├── List.tsx
│       ├── Show.tsx
│       └── Edit.tsx
└── teacher-portal/          # NEW FOLDER
    ├── CheckInOut.tsx      # Teacher attendance
    └── MySchedule.tsx      # Today's periods
```

### 3.2 Session View Component

**CREATE: `/apps/web/app/admin/attendance/SessionView.tsx`**
```typescript
"use client";

import { useState, useEffect } from 'react';
import { useDataProvider, useNotify } from 'react-admin';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, BookOpen, Calendar } from 'lucide-react';
import RosterGrid from './RosterGrid';
import QuickActions from './QuickActions';

export const SessionView = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const [session, setSession] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);

  // Line 20-40: Fetch current session
  useEffect(() => {
    const fetchCurrentSession = async () => {
      try {
        const { data } = await dataProvider.getOne('attendance/sessions/current');
        setSession(data);
        
        if (data) {
          const { data: rosterData } = await dataProvider.getList(
            `attendance/sessions/${data.id}/roster`
          );
          setRoster(rosterData);
        }
      } catch (error) {
        notify('Error fetching session', { type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrentSession();
    // Refresh every 30 seconds
    const interval = setInterval(fetchCurrentSession, 30000);
    return () => clearInterval(interval);
  }, [dataProvider, notify]);

  // Line 45-70: Mark attendance handler
  const handleMarkAttendance = async (studentId: string, status: string) => {
    try {
      await dataProvider.update(
        `attendance/sessions/${session.id}/students`,
        { 
          id: studentId,
          data: { status }
        }
      );
      
      // Update local state
      setRoster(prev => prev.map(student => 
        student.studentId === studentId 
          ? { ...student, status, markedAt: new Date() }
          : student
      ));
      
      notify('Attendance marked', { type: 'success' });
    } catch (error) {
      notify('Error marking attendance', { type: 'error' });
    }
  };

  // Line 75-100: Bulk actions handler
  const handleBulkAction = async (action: string) => {
    try {
      const updates = roster.map(student => ({
        studentId: student.studentId,
        status: action === 'all-present' ? 'present' : student.status
      }));
      
      await dataProvider.create(
        `attendance/sessions/${session.id}/mark`,
        { data: updates }
      );
      
      notify(`Marked all as ${action}`, { type: 'success' });
      // Refresh roster
      const { data: rosterData } = await dataProvider.getList(
        `attendance/sessions/${session.id}/roster`
      );
      setRoster(rosterData);
    } catch (error) {
      notify('Error in bulk action', { type: 'error' });
    }
  };

  // Line 105-150: Render UI
  if (loading) return <div>Loading...</div>;
  
  if (!session) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No active period</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Session Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <BookOpen className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">{session.subject.name}</h2>
                <p className="text-sm text-gray-500">
                  {session.section.name} • Period {session.period.number}
                </p>
              </div>
            </div>
            <Badge variant={session.status === 'in-progress' ? 'default' : 'secondary'}>
              {session.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      <QuickActions onAction={handleBulkAction} />

      {/* Student Roster Grid */}
      <RosterGrid 
        roster={roster}
        onMarkAttendance={handleMarkAttendance}
      />

      {/* Complete Session */}
      <div className="flex justify-end">
        <Button 
          size="lg"
          onClick={async () => {
            await dataProvider.update(
              `attendance/sessions/${session.id}/complete`,
              { id: session.id }
            );
            notify('Session completed', { type: 'success' });
          }}
        >
          Complete & Lock Attendance
        </Button>
      </div>
    </div>
  );
};
```

### 3.3 Roster Grid Component

**CREATE: `/apps/web/app/admin/attendance/RosterGrid.tsx`**
```typescript
"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Check, X, Clock, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Student {
  studentId: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  status?: string;
  markedAt?: Date;
}

interface RosterGridProps {
  roster: Student[];
  onMarkAttendance: (studentId: string, status: string) => void;
}

export default function RosterGrid({ roster, onMarkAttendance }: RosterGridProps) {
  // Line 30-50: Status button component
  const StatusButton = ({ status, icon: Icon, label, color, studentId }) => {
    const isActive = roster.find(s => s.studentId === studentId)?.status === status;
    
    return (
      <Button
        size="sm"
        variant={isActive ? 'default' : 'outline'}
        className={cn(
          'p-1',
          isActive && color
        )}
        onClick={() => onMarkAttendance(studentId, status)}
      >
        <Icon className="w-4 h-4" />
      </Button>
    );
  };

  // Line 55-120: Render grid
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {roster.map((student) => (
        <Card 
          key={student.studentId}
          className={cn(
            'p-4',
            student.status === 'present' && 'border-green-500',
            student.status === 'absent' && 'border-red-500',
            student.status === 'late' && 'border-yellow-500'
          )}
        >
          <div className="flex flex-col items-center space-y-3">
            {/* Student Photo */}
            <Avatar className="w-20 h-20">
              <AvatarImage src={student.photoUrl} />
              <AvatarFallback>
                {student.firstName[0]}{student.lastName[0]}
              </AvatarFallback>
            </Avatar>

            {/* Student Info */}
            <div className="text-center">
              <p className="font-medium">
                {student.firstName} {student.lastName}
              </p>
              <p className="text-sm text-gray-500">
                Roll: {student.rollNumber}
              </p>
            </div>

            {/* Current Status */}
            {student.status && (
              <Badge variant={
                student.status === 'present' ? 'success' :
                student.status === 'absent' ? 'destructive' :
                student.status === 'late' ? 'warning' : 'default'
              }>
                {student.status}
              </Badge>
            )}

            {/* Action Buttons */}
            <div className="flex gap-1">
              <StatusButton
                status="present"
                icon={Check}
                label="Present"
                color="bg-green-500"
                studentId={student.studentId}
              />
              <StatusButton
                status="absent"
                icon={X}
                label="Absent"
                color="bg-red-500"
                studentId={student.studentId}
              />
              <StatusButton
                status="late"
                icon={Clock}
                label="Late"
                color="bg-yellow-500"
                studentId={student.studentId}
              />
              <StatusButton
                status="excused"
                icon={Shield}
                label="Excused"
                color="bg-blue-500"
                studentId={student.studentId}
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

### 3.4 Teacher Check-in/out Component

**CREATE: `/apps/web/app/admin/teacher-portal/CheckInOut.tsx`**
```typescript
"use client";

import { useState, useEffect } from 'react';
import { useDataProvider, useNotify } from 'react-admin';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { format } from 'date-fns';

export default function CheckInOut() {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);

  // Line 20-35: Fetch today's attendance
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const { data } = await dataProvider.getOne(
          'teacher-attendance/today'
        );
        setAttendance(data);
      } catch (error) {
        // No attendance yet
      }
    };
    fetchAttendance();
  }, [dataProvider]);

  // Line 40-60: Handle check-in
  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const { data } = await dataProvider.create(
        'teacher-attendance/check-in',
        { data: {} }
      );
      setAttendance(data);
      notify('Checked in successfully', { type: 'success' });
    } catch (error) {
      notify('Error checking in', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Line 65-85: Handle check-out
  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const { data } = await dataProvider.create(
        'teacher-attendance/check-out',
        { data: {} }
      );
      setAttendance(data);
      notify('Checked out successfully', { type: 'success' });
    } catch (error) {
      notify('Error checking out', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Line 90-150: Render UI
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Daily Attendance
        </h2>
        <p className="text-sm text-gray-500">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {attendance?.checkIn && (
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Check-in Time</p>
            <p className="text-lg font-medium text-green-700">
              {format(new Date(attendance.checkIn), 'h:mm a')}
            </p>
          </div>
        )}

        {attendance?.checkOut && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Check-out Time</p>
            <p className="text-lg font-medium text-blue-700">
              {format(new Date(attendance.checkOut), 'h:mm a')}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Total Hours: {attendance.totalHours?.toFixed(2)}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {!attendance?.checkIn && (
            <Button
              onClick={handleCheckIn}
              disabled={loading}
              className="flex-1"
              size="lg"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Check In
            </Button>
          )}

          {attendance?.checkIn && !attendance?.checkOut && (
            <Button
              onClick={handleCheckOut}
              disabled={loading}
              className="flex-1"
              size="lg"
              variant="outline"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Check Out
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 3.5 Update Admin Configuration

**MODIFY: `/apps/web/app/admin/page.tsx`**

Add new resources at line 150:
```typescript
// Import new components
import { AttendanceSessionsList } from './resources/attendanceSessions/List';
import { AttendanceSessionsShow } from './resources/attendanceSessions/Show';

// Add to resources array
<Resource
  name="attendance/sessions"
  list={AttendanceSessionsList}
  show={AttendanceSessionsShow}
  options={{ label: 'Period Attendance' }}
  icon={ClockIcon}
/>
```

**MODIFY: `/apps/web/app/admin/layout.tsx`**

Add teacher portal link at line 85:
```typescript
// In navigation items
{
  title: "Teacher Portal",
  items: [
    { 
      title: "My Attendance", 
      href: "/admin/teacher-portal/attendance",
      icon: Clock 
    },
    { 
      title: "Mark Attendance", 
      href: "/admin/attendance/session",
      icon: Users 
    },
    { 
      title: "My Schedule", 
      href: "/admin/teacher-portal/schedule",
      icon: Calendar 
    }
  ]
}
```

## 4. Database Migrations

**RUN: In `/apps/api/` directory**
```bash
# Generate migration
npx prisma migrate dev --name add-period-attendance

# This will create: 
# prisma/migrations/[timestamp]_add_period_attendance/migration.sql
```

## 5. Testing Files

**CREATE: `/apps/api/src/modules/attendance-sessions/attendance-sessions.service.spec.ts`**
```typescript
// Test file for attendance sessions service
// Lines 1-200: Test cases for all service methods
```

**CREATE: `/apps/api/test/attendance-flow.e2e-spec.ts`**
```typescript
// E2E test for complete attendance flow
// Lines 1-150: End-to-end test scenarios
```

## 6. Configuration Updates

**MODIFY: `/apps/api/.env`**
```env
# Add attendance configuration
ATTENDANCE_LOCK_AFTER_MINUTES=30
ATTENDANCE_LATE_THRESHOLD_MINUTES=10
ATTENDANCE_GRACE_PERIOD_MINUTES=5
```

**MODIFY: `/apps/web/.env.local`**
```env
# Add feature flags
NEXT_PUBLIC_ENABLE_PERIOD_ATTENDANCE=true
NEXT_PUBLIC_ENABLE_TEACHER_PORTAL=true
```

## 7. Deployment Considerations

### 7.1 Database Migration Order
1. Run schema migration first
2. Migrate existing attendance data to new structure
3. Deploy backend changes
4. Deploy frontend changes

### 7.2 Data Migration Script

**CREATE: `/apps/api/scripts/migrate-attendance.ts`**
```typescript
// Script to migrate existing daily attendance to period-based
// This maintains backward compatibility
// Lines 1-100: Migration logic
```

## Summary of Changes

### Backend (15 files)
1. `prisma/schema.prisma` - Add 3 new models, update 2 existing
2. `attendance-sessions/` module - 4 new files
3. `teacher-attendance/` module - 4 new files  
4. `attendance/attendance.service.ts` - Add aggregation methods
5. `app.module.ts` - Register new modules
6. Test files - 2 new test files
7. Migration script - 1 new file

### Frontend (12 files)
1. `attendance/` folder - 4 new components
2. `attendanceSessions/` resource - 3 new files
3. `teacher-portal/` - 2 new components
4. `admin/page.tsx` - Add new resources
5. `admin/layout.tsx` - Add navigation items
6. `attendanceRecords/List.tsx` - Enhance existing

### Configuration (2 files)
1. `.env` files - Add configuration variables

Total: **29 files** to modify/create