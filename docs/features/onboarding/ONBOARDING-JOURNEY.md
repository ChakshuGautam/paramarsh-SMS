# Onboarding Journey - Reference UI

## Overview

This document outlines the complete onboarding journey for new schools setting up Paramarsh SMS. The screens shown in this folder (1.png - 10.png) serve as **reference UI** for understanding the onboarding flow and required functionality.

> **Note**: These screens use a different design system. The implementation should follow Paramarsh's existing design system (shadcn/ui) while replicating the functionality and user experience shown here.

---

## User Roles

The onboarding process accommodates different user roles with varying permission levels:

### 1. School Owner/Principal (Super Admin)
- **Scope**: Full system access and configuration
- **Responsibilities**: Creates and configures account, sets up entire school system
- **Permissions**: All modules, full CRUD access

### 2. Admin/Manager
- **Scope**: Day-to-day operations management
- **Responsibilities**: Manages fees, attendance, timetable
- **Permissions**: Fee Management, Attendance, Timetable, Reports

### 3. Teacher
- **Scope**: Teaching and class management
- **Responsibilities**: Views assigned timetable, marks attendance, manages grades
- **Permissions**: View Timetable, Mark Attendance, Grade Management

### 4. Parent/Student (View-only)
- **Scope**: Information access only
- **Responsibilities**: Monitor student progress
- **Permissions**: View Timetable, View Attendance, View Fee Receipts

---

## Onboarding Journey Modules

The onboarding process is divided into 9 stages, each building upon the previous to create a complete school management system setup.

---

### Stage 1: Account & School Setup
**Reference**: `1.png`
**Step**: 1 of 9

#### Purpose
Initial school profile creation and basic configuration.

#### Screens Required
1. **School Registration Form**
   - School Name (text input, required)
   - School Type (dropdown: Private School, Government School, International School, etc.)
   - Location (text input with city/state)
   - Academic Year (dropdown with year ranges, e.g., 2024-25, 2025-26)

2. **Branding Configuration**
   - School Logo Upload (optional, image file upload with preview)
   - Brand Color Selection (color picker)
   - Upload area with drag-and-drop support

#### Form Fields
```typescript
interface SchoolSetupForm {
  schoolName: string;          // Required, max 256 chars
  schoolType: 'private' | 'government' | 'international' | 'other';
  location: string;             // City, State format
  academicYear: string;         // e.g., "2024-25"
  logo?: File;                  // Optional image upload
  brandColor?: string;          // Hex color code
}
```

#### Seeded Demo Data
```json
{
  "demoSchool": "Paramarsh International School",
  "schoolType": "Private School",
  "location": "Mumbai, Maharashtra",
  "academicYear": "2024-25"
}
```

#### Navigation
- **Back**: Back to Home
- **Next**: Continue Setup (proceeds to Dashboard Tour)

---

### Stage 2: Guided Tour & Dashboard
**Reference**: `2.png`
**Step**: 2 of 9

#### Purpose
Introduce users to the dashboard interface with live demo data, showing what a fully-configured school looks like.

#### Screens Required
1. **Dashboard Tour Progress Tracker**
   - Progress indicator: "1 of 4"
   - Current view label: "Currently viewing: Overview KPIs"

2. **KPI Cards** (4 cards in grid layout)
   - **Total Students**: 1,200 (+5.2% this month)
   - **Teaching Staff**: 85 (+2 this month)
   - **Avg Attendance**: 92% (+1.5%)
   - **Fee Collection**: 85% (₹20L collected)

3. **Revenue Trend Graph**
   - Chart Type: Horizontal bar chart
   - Time Period: Last 6 months (Jan - Jun)
   - Data Points:
     - Jan: ₹18L
     - Feb: ₹20L
     - Mar: ₹22L
     - Apr: ₹24L
     - May: ₹26L
     - Jun: ₹28L

4. **Attendance Heatmap**
   - Student Attendance: 92% (progress bar)
   - Teacher Attendance: 94% (progress bar)
   - Weekly Calendar View (Mon-Sun)
     - Green: Good attendance (Mon-Fri, Thu)
     - Orange: Moderate (Sat)
     - Gray: No data (Sun)

5. **Alerts & Notifications Panel**
   - Icon-based priority indicators
   - **Alert 1**: ⚠️ 3 Complaints Pending Resolution (2 hours ago)
   - **Alert 2**: 📅 2 Teachers On Leave Today (This morning)
   - **Alert 3**: ✅ Monthly Fee Collection Target Achieved (Yesterday)

#### Seeded Demo Data
```json
{
  "kpis": {
    "totalStudents": 1200,
    "studentGrowth": "+5.2%",
    "teachingStaff": 85,
    "staffGrowth": "+2 this month",
    "avgAttendance": "92%",
    "attendanceChange": "+1.5%",
    "feeCollection": "85%",
    "feeCollected": "₹20L"
  },
  "revenueData": [
    { "month": "Jan", "amount": 180000 },
    { "month": "Feb", "amount": 200000 },
    { "month": "Mar", "amount": 220000 },
    { "month": "Apr", "amount": 240000 },
    { "month": "May", "amount": 260000 },
    { "month": "Jun", "amount": 280000 }
  ],
  "attendanceHeatmap": {
    "studentAttendance": 92,
    "teacherAttendance": 94,
    "weeklyData": {
      "Mon": "good",
      "Tue": "good",
      "Wed": "good",
      "Thu": "good",
      "Fri": "good",
      "Sat": "moderate",
      "Sun": "no-data"
    }
  },
  "alerts": [
    {
      "type": "warning",
      "message": "3 Complaints Pending Resolution",
      "timestamp": "2 hours ago"
    },
    {
      "type": "info",
      "message": "2 Teachers On Leave Today",
      "timestamp": "This morning"
    },
    {
      "type": "success",
      "message": "Monthly Fee Collection Target Achieved",
      "timestamp": "Yesterday"
    }
  ]
}
```

#### Navigation
- **Back**: Back (to School Setup)
- **Next**: Continue to User Setup

---

### Stage 3: User Roles & Permissions
**Reference**: `3.png`
**Step**: 3 of 9

#### Purpose
Configure user roles and permission levels for the school system.

#### Screens Required
1. **Role Overview Tab**
   - Display 4 predefined role cards with permissions

2. **Role Cards** (4 cards in 2x2 grid)

   **Card 1: School Owner/Principal**
   - Icon: Shield/Crown icon
   - Description: "Full system access and configuration"
   - Permissions (tags):
     - Full Access
     - User Management
     - System Configuration

   **Card 2: Admin/Manager**
   - Icon: Users/Manager icon
   - Description: "Day-to-day operations management"
   - Permissions (tags):
     - Fee Management
     - Attendance
     - Timetable
     - Reports

   **Card 3: Teacher**
   - Icon: Graduation cap icon
   - Description: "Teaching and class management"
   - Permissions (tags):
     - View Timetable
     - Mark Attendance
     - Grade Management

   **Card 4: Parent/Student**
   - Icon: Eye icon
   - Description: "View-only access to relevant information"
   - Permissions (tags):
     - View Timetable
     - View Attendance
     - View Fee Receipts

3. **Additional Tabs**
   - Demo Users (pre-populated user list)
   - Add New User (form for manual user creation)

#### Permission Matrix
```typescript
interface RolePermissions {
  'School Owner/Principal': {
    fullAccess: true;
    userManagement: true;
    systemConfiguration: true;
    allModules: true;
  };
  'Admin/Manager': {
    feeManagement: true;
    attendance: true;
    timetable: true;
    reports: true;
  };
  'Teacher': {
    viewTimetable: true;
    markAttendance: true;
    gradeManagement: true;
  };
  'Parent/Student': {
    viewTimetable: true;
    viewAttendance: true;
    viewFeeReceipts: true;
    readOnly: true;
  };
}
```

#### Seeded Demo Data
```json
{
  "demoUsers": {
    "teachers": [
      {
        "name": "Anita Sharma",
        "subject": "Math",
        "grade": "Grade 8",
        "availability": "Mon-Fri",
        "role": "Teacher"
      },
      {
        "name": "Ravi Verma",
        "subject": "Science",
        "grade": "Grade 9",
        "availability": "Mon-Sat",
        "role": "Teacher"
      }
    ],
    "staff": [
      {
        "name": "Ramesh Gupta",
        "designation": "Admin Manager",
        "role": "Admin/Manager"
      }
    ]
  }
}
```

#### User Upload Options
- **CSV Upload**: Bulk upload with template
- **Manual Entry**: Single user creation form

#### Navigation
- **Back**: Back (to Dashboard Tour)
- **Next**: Continue to Classes

---

### Stage 4: Classes & Curriculum Setup
**Reference**: `4.png`
**Step**: 4 of 9

#### Purpose
Configure school class structure, sections, and subject mappings.

#### Screens Required

1. **Tab Navigation**
   - Class Structure (active)
   - Subject Management
   - Subject Mapping

2. **Add New Class Form** (Left Panel)
   - **Grade/Standard** (text input)
     - Placeholder: "e.g., Grade 6, Class 10"
   - **Section** (text input)
     - Placeholder: "e.g., A, B, C"
   - **Class Capacity** (number input)
     - Placeholder: "Maximum students"
   - **Add Class Button** (primary blue button with + icon)

3. **Class Overview Panel** (Right Panel)
   - **Summary Statistics**:
     - Total Classes: 14
     - Total Students: 484
     - Average Class Size: 35
     - Grade Levels: 6-12

4. **Current Classes Grid** (Main Panel)
   - Display all created classes as cards in responsive grid
   - Each class card shows:
     - Grade & Section (e.g., "Grade 6 A")
     - Students enrolled (e.g., "35/40")
     - Capacity percentage (e.g., "88%")
     - Edit icon (pencil)
     - Delete icon (trash)

   **Example Cards**:
   ```
   [Grade 6 A]  [Grade 6 B]  [Grade 7 A]  [Grade 7 B]
   35/40        38/40        32/40        36/40
   88%          95%          80%          90%

   [Grade 8 A]  [Grade 8 B]  [Grade 9 A]  [Grade 9 B]
   40/40        39/40        38/40        37/40
   100%         98%          95%          93%

   [Grade 10 A] [Grade 10 B] [Grade 11 A] [Grade 11 B]
   35/40        34/40        30/35        28/35
   88%          85%          86%          80%

   [Grade 12 A] [Grade 12 B]
   32/35        30/35
   91%          86%
   ```

#### Data Structure
```typescript
interface ClassSetup {
  id: string;
  grade: string;          // e.g., "6", "10", "12"
  section: string;        // e.g., "A", "B", "C"
  capacity: number;       // Maximum students
  enrolled: number;       // Current students
  subjects?: string[];    // Mapped subjects
}

interface ClassOverview {
  totalClasses: number;
  totalStudents: number;
  averageClassSize: number;
  gradeLevels: string;    // e.g., "6-12"
}
```

#### Seeded Demo Data
```json
{
  "classOverview": {
    "totalClasses": 14,
    "totalStudents": 484,
    "averageClassSize": 35,
    "gradeLevels": "6-12"
  },
  "classes": [
    { "grade": "6", "section": "A", "enrolled": 35, "capacity": 40 },
    { "grade": "6", "section": "B", "enrolled": 38, "capacity": 40 },
    { "grade": "7", "section": "A", "enrolled": 32, "capacity": 40 },
    { "grade": "7", "section": "B", "enrolled": 36, "capacity": 40 },
    { "grade": "8", "section": "A", "enrolled": 40, "capacity": 40 },
    { "grade": "8", "section": "B", "enrolled": 39, "capacity": 40 },
    { "grade": "9", "section": "A", "enrolled": 38, "capacity": 40 },
    { "grade": "9", "section": "B", "enrolled": 37, "capacity": 40 },
    { "grade": "10", "section": "A", "enrolled": 35, "capacity": 40 },
    { "grade": "10", "section": "B", "enrolled": 34, "capacity": 40 },
    { "grade": "11", "section": "A", "enrolled": 30, "capacity": 35 },
    { "grade": "11", "section": "B", "enrolled": 28, "capacity": 35 },
    { "grade": "12", "section": "A", "enrolled": 32, "capacity": 35 },
    { "grade": "12", "section": "B", "enrolled": 30, "capacity": 35 }
  ],
  "subjects": [
    "Math",
    "Science",
    "English",
    "History",
    "Geography",
    "Computer Science",
    "Physical Education"
  ]
}
```

#### Subject Mapping
- Each class can have multiple subjects assigned
- Subjects can be shared across grades
- Core subjects vs Electives differentiation

#### Navigation
- **Back**: Back (to User Roles)
- **Next**: Continue to Timetable

---

### Stage 5: Smart Timetable Management
**Reference**: `5.png`
**Step**: 5 of 9

#### Purpose
AI-powered timetable generation with conflict detection and optimization.

#### Screens Required

1. **Tab Navigation**
   - AI Generator (active)
   - Timetable Preview
   - Teacher Workload

2. **AI Timetable Generator Panel** (Left Panel)
   - **Title**: ⚡ AI Timetable Generator
   - **Subtitle**: "Generate optimized timetables automatically"

   - **Configuration Inputs**:
     - **Classes to Schedule**: 14 Classes (read-only/display)
     - **Available Teachers**: 25 Teachers (read-only/display)
     - **Working Hours**: 9 AM - 4 PM (time range selector)
     - **Working Days**: Monday - Saturday (day selector)

   - **Generate AI Timetable Button** (gradient blue-green, prominent)
     - Icon: Lightning bolt
     - Full width

3. **Conflict Detection Panel** (Right Panel)
   - **Title**: ⚠️ Conflict Detection
   - **Subtitle**: "Potential scheduling conflicts"

   - **Conflict List** (Red/Orange alerts):

     **Conflict 1** (Warning):
     - Icon: ⚠️ (yellow/orange)
     - Message: "Grade 8A: Math class overlaps with Science lab for Ravi Verma on Tuesday"
     - Suggestion: "Move Math to Wednesday or assign different teacher"

     **Conflict 2** (Info):
     - Icon: ℹ️ (blue)
     - Message: "Room 201 is double-booked on Friday 2:00 PM"
     - Suggestion: "Use Room 202 as alternative"

#### AI Generator Parameters
```typescript
interface TimetableGeneratorConfig {
  classesToSchedule: number;      // Total classes
  availableTeachers: number;      // Total teachers
  workingHours: {
    start: string;                 // e.g., "09:00"
    end: string;                   // e.g., "16:00"
  };
  workingDays: string[];           // e.g., ["Monday", "Tuesday", ..., "Saturday"]
  constraints: {
    maxPeriodsPerTeacher?: number; // e.g., 6 periods/day
    maxPeriodsPerClass?: number;   // e.g., 7 periods/day
    lunchBreak?: {
      start: string;
      duration: number;             // minutes
    };
  };
}

interface ConflictDetection {
  type: 'warning' | 'error' | 'info';
  entity: string;                   // Class, Teacher, Room
  message: string;
  suggestion: string;
  severity: 'high' | 'medium' | 'low';
}
```

#### Seeded Demo Data
```json
{
  "generatorConfig": {
    "classesToSchedule": 14,
    "availableTeachers": 25,
    "workingHours": {
      "start": "09:00",
      "end": "16:00"
    },
    "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  },
  "conflicts": [
    {
      "type": "warning",
      "entity": "Grade 8A",
      "message": "Math class overlaps with Science lab for Ravi Verma on Tuesday",
      "suggestion": "Move Math to Wednesday or assign different teacher",
      "severity": "medium"
    },
    {
      "type": "info",
      "entity": "Room 201",
      "message": "Room 201 is double-booked on Friday 2:00 PM",
      "suggestion": "Use Room 202 as alternative",
      "severity": "low"
    }
  ],
  "sampleTimetableEntry": {
    "class": "Grade 8A",
    "subject": "Math",
    "day": "Monday",
    "time": "9:00-10:00 AM",
    "room": "201",
    "teacher": "Anita Sharma"
  },
  "teacherWorkload": [
    {
      "name": "Anita Sharma",
      "subject": "Math",
      "periodsPerWeek": 18,
      "classes": ["8A", "8B", "9A"]
    },
    {
      "name": "Ravi Verma",
      "subject": "Science",
      "periodsPerWeek": 20,
      "classes": ["8A", "8B", "9A", "9B"]
    }
  ]
}
```

#### AI Features
- **Conflict Detection**: Real-time validation of:
  - Teacher double-booking
  - Room double-booking
  - Student timetable conflicts
  - Teacher availability constraints

- **Optimization**: AI considers:
  - Teacher preferences
  - Subject distribution (no back-to-back heavy subjects)
  - Room requirements (labs vs regular classrooms)
  - Teacher workload balancing

- **Manual Override**: Drag-and-drop editor for adjustments

#### Navigation
- **Back**: Back (to Classes)
- **Next**: Continue to Attendance

---

### Stage 6: Attendance Management
**Reference**: `6.png`
**Step**: 6 of 9

#### Purpose
Configure attendance tracking for both students and teachers with real-time insights.

#### Screens Required

1. **Tab Navigation**
   - Student Attendance (active)
   - Teacher Attendance
   - Reports & Analytics

2. **Summary KPI Cards** (Top Row - 4 cards)
   - **Total Students**: 40 (with icon: 👥)
   - **Present**: 35 (with icon: ✅ green)
   - **Absent**: 5 (with icon: ❌ red)
   - **Attendance %**: 87.5% (with icon: 📊 blue)

3. **Class Selector & Date** (Header Bar)
   - **Title**: 📅 Grade 8A - Daily Attendance
   - **Subtitle**: "Today's attendance for 07/10/2025"
   - **Action Button**: "Mark All Present" (blue, right-aligned)

4. **Student Attendance List** (Main Panel)
   - Scrollable list with 8+ visible students
   - Each row contains:
     - Serial Number (01, 02, 03...)
     - Student Name (e.g., "Aarav Sharma")
     - Roll Number (e.g., "Roll No: 8A01")
     - Timestamp (e.g., "9:05 AM") - only if present
     - Toggle Switch (Present/Absent)
     - Status Badge (blue "Present" or red "Absent")

   **Example Rows**:
   ```
   01  Aarav Sharma        [9:05 AM]  [Toggle: ON]   [✓ Present]
       Roll No: 8A01

   02  Diya Patel          [9:03 AM]  [Toggle: ON]   [✓ Present]
       Roll No: 8A02

   03  Arjun Singh                    [Toggle: OFF]  [✗ Absent]
       Roll No: 8A03

   04  Kavya Reddy         [9:02 AM]  [Toggle: ON]   [✓ Present]
       Roll No: 8A04

   05  Rohit Kumar         [9:25 AM]  [Toggle: ON]   [⏰ Late]
       Roll No: 8A05

   06  Ananya Gupta        [9:01 AM]  [Toggle: ON]   [✓ Present]
       Roll No: 8A06

   07  Vikram Joshi                   [Toggle: OFF]  [✗ Absent]
       Roll No: 8A07

   08  Priya Nair          [9:04 AM]  [Toggle: ON]   [✓ Present]
       Roll No: 8A08
   ```

5. **Teacher Attendance Tab** (Alternative View)
   - Similar structure but for teaching staff
   - Additional fields:
     - Department/Subject
     - Leave reason (if absent)

#### Data Structure
```typescript
interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  date: Date;
  status: 'present' | 'absent' | 'late';
  timestamp?: Date;           // Check-in time
  markedBy?: string;          // Teacher/Admin ID
}

interface ClassAttendanceSummary {
  classId: string;
  className: string;          // e.g., "Grade 8A"
  date: Date;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  attendancePercentage: number;
}

interface TeacherAttendance {
  teacherId: string;
  teacherName: string;
  date: Date;
  status: 'present' | 'absent' | 'on_leave';
  checkInTime?: Date;
  checkOutTime?: Date;
  leaveReason?: string;
  department: string;
}
```

#### Seeded Demo Data
```json
{
  "classAttendance": {
    "class": "Grade 8A",
    "date": "2025-07-10",
    "totalStudents": 40,
    "present": 35,
    "absent": 5,
    "late": 0,
    "attendancePercentage": 87.5
  },
  "students": [
    {
      "id": "S001",
      "name": "Aarav Sharma",
      "rollNumber": "8A01",
      "status": "present",
      "timestamp": "09:05:00"
    },
    {
      "id": "S002",
      "name": "Diya Patel",
      "rollNumber": "8A02",
      "status": "present",
      "timestamp": "09:03:00"
    },
    {
      "id": "S003",
      "name": "Arjun Singh",
      "rollNumber": "8A03",
      "status": "absent",
      "timestamp": null
    },
    {
      "id": "S004",
      "name": "Kavya Reddy",
      "rollNumber": "8A04",
      "status": "present",
      "timestamp": "09:02:00"
    },
    {
      "id": "S005",
      "name": "Rohit Kumar",
      "rollNumber": "8A05",
      "status": "late",
      "timestamp": "09:25:00"
    },
    {
      "id": "S006",
      "name": "Ananya Gupta",
      "rollNumber": "8A06",
      "status": "present",
      "timestamp": "09:01:00"
    },
    {
      "id": "S007",
      "name": "Vikram Joshi",
      "rollNumber": "8A07",
      "status": "absent",
      "timestamp": null
    },
    {
      "id": "S008",
      "name": "Priya Nair",
      "rollNumber": "8A08",
      "status": "present",
      "timestamp": "09:04:00"
    }
  ],
  "teacherAttendance": {
    "date": "2025-07-10",
    "totalTeachers": 85,
    "present": 80,
    "absent": 5,
    "onLeave": 5
  }
}
```

#### Features
- **Quick Actions**:
  - Mark All Present (bulk action)
  - Individual toggle switches
  - Late arrivals automatically flagged

- **Reports**:
  - Daily attendance summary
  - Monthly attendance report
  - Class-wise comparison
  - Student attendance history

- **Notifications**:
  - SMS/Email to parents for absences
  - Low attendance alerts

#### Navigation
- **Back**: Back (to Timetable)
- **Next**: Continue to Fees

---

### Stage 7: Fee Management System
**Reference**: `7.png`
**Step**: 7 of 9

#### Purpose
Complete fee structure setup with payment tracking and automated reminders.

#### Screens Required

1. **Tab Navigation**
   - Overview (active)
   - Fee Structure
   - Student Records
   - Defaulters

2. **Summary KPI Cards** (Top Row - 4 cards)
   - **Total Fee Amount**: ₹20.0L (with ₹ icon, blue)
   - **Collected**: ₹17.0L (with ✓ icon, green)
   - **Pending**: ₹3.0L (with ⏱ icon, orange)
   - **Collection Rate**: 85% (with ↗ icon, blue)

3. **Monthly Collection Progress** (Left Panel)
   - **Title**: 📈 Monthly Collection Progress
   - Horizontal bar chart showing collection by month
   - Each bar shows:
     - Month name (April, May, June, July, August)
     - Green progress bar
     - Amount in Lakhs (₹15L, ₹18L, ₹21L, ₹24L, ₹27L)
   - Progressive growth visible

4. **Payment Alerts Panel** (Right Panel)
   - **Title**: ⚠️ Payment Alerts

   **Alert 1** (Red/Critical):
   - Icon: 🔴 (red circle)
   - Message: "45 students with overdue payments"
   - Timestamp: (none - current status)

   **Alert 2** (Orange/Warning):
   - Icon: 🟠 (orange circle)
   - Message: "15 payments due this week"
   - Timestamp: (none - current status)

   **Alert 3** (Green/Success):
   - Icon: 🟢 (green circle)
   - Message: "Target achieved for this quarter"
   - Timestamp: (none - achievement)

#### Data Structure
```typescript
interface FeeStructure {
  id: string;
  name: string;              // e.g., "Tuition Fee", "Transport Fee"
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annually';
  applicableTo: string[];    // Grade levels or classes
  mandatory: boolean;
}

interface StudentFeeRecord {
  studentId: string;
  studentName: string;
  class: string;
  totalFee: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
  lastPaymentDate?: Date;
  dueDate: Date;
}

interface FeeCollectionSummary {
  totalAmount: number;
  collectedAmount: number;
  pendingAmount: number;
  collectionRate: number;    // Percentage
  overdueStudents: number;
  dueThisWeek: number;
}
```

#### Seeded Demo Data
```json
{
  "feeStructure": [
    {
      "name": "Tuition Fee",
      "amount": 50000,
      "frequency": "annually",
      "applicableTo": ["all"],
      "mandatory": true
    },
    {
      "name": "Transport Fee",
      "amount": 10000,
      "frequency": "annually",
      "applicableTo": ["all"],
      "mandatory": false
    },
    {
      "name": "Activity Fee",
      "amount": 5000,
      "frequency": "annually",
      "applicableTo": ["all"],
      "mandatory": false
    }
  ],
  "collectionSummary": {
    "totalAmount": 2000000,      // ₹20.0L
    "collectedAmount": 1700000,  // ₹17.0L
    "pendingAmount": 300000,     // ₹3.0L
    "collectionRate": 85,
    "overdueStudents": 45,
    "dueThisWeek": 15
  },
  "monthlyCollection": [
    { "month": "April", "amount": 150000 },   // ₹15L
    { "month": "May", "amount": 180000 },     // ₹18L
    { "month": "June", "amount": 210000 },    // ₹21L
    { "month": "July", "amount": 240000 },    // ₹24L
    { "month": "August", "amount": 270000 }   // ₹27L
  ],
  "paymentAlerts": [
    {
      "type": "critical",
      "message": "45 students with overdue payments",
      "icon": "🔴"
    },
    {
      "type": "warning",
      "message": "15 payments due this week",
      "icon": "🟠"
    },
    {
      "type": "success",
      "message": "Target achieved for this quarter",
      "icon": "🟢"
    }
  ],
  "studentRecords": {
    "total": 1200,
    "paid": 1020,         // 85%
    "pending": 180,       // 15%
    "overdue": 45,
    "partialPayment": 35
  }
}
```

#### Features

**Fee Structure Tab**:
- Create custom fee categories
- Set amounts per grade/class
- Define payment schedules
- Mandatory vs Optional fees

**Student Records Tab**:
- Individual student fee status
- Payment history
- Receipt generation
- Partial payment tracking

**Defaulters Tab**:
- List of overdue payments
- Filter by grace period
- Bulk reminder system
- Payment plan options

**Payment Gateway Integration**:
- Online payment options
- Payment confirmation
- Auto-receipt generation
- SMS/Email notifications

#### Automated Reminders
- 7 days before due date
- On due date
- 3 days after due date
- 7 days after due date
- 15 days after due date (defaulter alert)

#### Navigation
- **Back**: Back (to Attendance)
- **Next**: Continue to Reports

---

### Stage 8: Reports & Analytics
**Reference**: `8.png`
**Step**: 8 of 9

#### Purpose
Comprehensive reporting and AI-powered insights for data-driven decisions.

#### Screens Required

1. **Tab Navigation**
   - Dashboard Overview (active)
   - Report Library
   - AI Insights

2. **Top KPI Cards** (5 cards in single row)
   - **1200**: Total Students (with 👥 icon, blue)
   - **92%**: Avg Attendance (with ✓ icon, green)
   - **85%**: Fee Collection (with ₹ icon, orange)
   - **94%**: Teacher Satisfaction (with ↗ icon, blue)
   - **+3.2%**: Monthly Growth (with 📊 icon, green)

3. **Performance Trends Panel** (Left Panel)
   - **Title**: 📈 Performance Trends
   - **Subtitle**: "Key metrics over the last 6 months"

   - Horizontal progress bars with percentages:
     - **Attendance Rate**: 80% (blue bar)
     - **Fee Collection**: 84% (blue bar)
     - **Academic Performance**: 88% (blue bar)
     - **Teacher Retention**: 92% (blue bar)

4. **Recent Activities Panel** (Right Panel)
   - **Title**: 📅 Recent Activities
   - **Subtitle**: "Latest system activities and updates"

   **Activity 1**:
   - Icon: ✅ (green check in circle)
   - Message: "Attendance report generated for Grade 8"
   - Timestamp: "2 hours ago"

   **Activity 2**:
   - Icon: 📄 (document icon in blue circle)
   - Message: "Monthly fee collection report updated"
   - Timestamp: "5 hours ago"

   **Activity 3**:
   - Icon: ⚠️ (warning icon in yellow circle)
   - Message: "5 fee defaulters identified"
   - Timestamp: "1 day ago"

#### Data Structure
```typescript
interface ReportSummary {
  totalStudents: number;
  avgAttendance: number;
  feeCollection: number;
  teacherSatisfaction: number;
  monthlyGrowth: number;
}

interface PerformanceTrend {
  metric: string;
  value: number;           // Percentage
  trend: 'up' | 'down' | 'stable';
  change?: number;         // Change from previous period
}

interface RecentActivity {
  id: string;
  type: 'report' | 'alert' | 'update' | 'action';
  icon: string;
  message: string;
  timestamp: string;
  severity?: 'info' | 'warning' | 'success';
}

interface Report {
  id: string;
  name: string;
  category: 'attendance' | 'financial' | 'academic' | 'administrative';
  description: string;
  format: 'PDF' | 'Excel' | 'CSV';
  lastGenerated?: Date;
}
```

#### Seeded Demo Data
```json
{
  "kpiSummary": {
    "totalStudents": 1200,
    "avgAttendance": 92,
    "feeCollection": 85,
    "teacherSatisfaction": 94,
    "monthlyGrowth": 3.2
  },
  "performanceTrends": [
    {
      "metric": "Attendance Rate",
      "value": 80,
      "trend": "up",
      "change": 2.5
    },
    {
      "metric": "Fee Collection",
      "value": 84,
      "trend": "up",
      "change": 3.1
    },
    {
      "metric": "Academic Performance",
      "value": 88,
      "trend": "stable",
      "change": 0.5
    },
    {
      "metric": "Teacher Retention",
      "value": 92,
      "trend": "up",
      "change": 1.8
    }
  ],
  "recentActivities": [
    {
      "id": "ACT001",
      "type": "report",
      "icon": "✅",
      "message": "Attendance report generated for Grade 8",
      "timestamp": "2 hours ago",
      "severity": "success"
    },
    {
      "id": "ACT002",
      "type": "update",
      "icon": "📄",
      "message": "Monthly fee collection report updated",
      "timestamp": "5 hours ago",
      "severity": "info"
    },
    {
      "id": "ACT003",
      "type": "alert",
      "icon": "⚠️",
      "message": "5 fee defaulters identified",
      "timestamp": "1 day ago",
      "severity": "warning"
    }
  ],
  "availableReports": [
    {
      "name": "Attendance Summary",
      "category": "attendance",
      "description": "Daily, weekly, monthly attendance reports",
      "format": "PDF"
    },
    {
      "name": "Fee Collection Report",
      "category": "financial",
      "description": "Payment status, defaulters, revenue analysis",
      "format": "Excel"
    },
    {
      "name": "Timetable Utilization",
      "category": "administrative",
      "description": "Room usage, teacher workload distribution",
      "format": "PDF"
    },
    {
      "name": "Teacher Workload Report",
      "category": "administrative",
      "description": "Period distribution, class assignments",
      "format": "Excel"
    }
  ],
  "aiInsights": [
    {
      "category": "Academic",
      "insight": "Grade 9 performance improving",
      "confidence": 85,
      "recommendation": "Continue current teaching methods"
    },
    {
      "category": "Attendance",
      "insight": "Attendance drop in Grade 7",
      "confidence": 92,
      "recommendation": "Investigate reasons and engage parents"
    }
  ]
}
```

#### Report Library Features

**Available Reports**:
1. **Attendance Reports**
   - Daily attendance summary
   - Monthly attendance trends
   - Class-wise comparison
   - Student attendance history
   - Teacher attendance records

2. **Financial Reports**
   - Fee collection summary
   - Defaulter list
   - Revenue analysis
   - Payment method breakdown
   - Month-over-month comparison

3. **Academic Reports**
   - Grade-wise performance
   - Subject-wise analysis
   - Student progress reports
   - Exam results summary

4. **Administrative Reports**
   - Timetable utilization
   - Teacher workload
   - Room allocation
   - Staff directory

#### AI-Powered Insights

**Automated Analysis**:
- Attendance pattern detection
- Fee collection predictions
- Academic performance trends
- Resource optimization suggestions

**Sample AI Insights**:
- "Grade 9 performance improving" (85% confidence)
- "Attendance drop in Grade 7" (92% confidence)
- "Fee collection trending above target" (88% confidence)

#### Export Options
- PDF (formatted reports)
- Excel (data analysis)
- CSV (bulk data)

#### Navigation
- **Back**: Back (to Fees)
- **Next**: Complete Setup

---

### Stage 9: Setup Completion
**Reference**: `9.png` and `10.png`
**Step**: 9 of 9

#### Purpose
Congratulate users on completing setup and provide next steps for full system utilization.

#### Screens Required

1. **Success Header**
   - Large success icon (trophy/checkmark in green circle)
   - Celebration emoji: 🎉
   - **Title**: "Congratulations!"
   - **Subtitle**: "Paramarsh International School Setup Complete"
   - **Description**: "Your school management system is now fully configured and ready to streamline your operations. Let's get your team started!"

2. **Setup Achievements Section**
   - **Title**: ⭐ Setup Achievements Unlocked
   - Grid of achievement badges (2x3 layout):

   **Badge 1**: 🎯 Complete onboarding in record time
   **Badge 2**: ⚡ AI-powered timetable generated
   **Badge 3**: 📊 Full analytics dashboard ready
   **Badge 4**: 💳 Fee management system configured
   **Badge 5**: 👥 User roles and permissions set

3. **Modules Successfully Configured**
   - **Title**: ✅ Modules Successfully Configured
   - **Subtitle**: "All core modules are set up and ready for use"

   - Grid of module cards (2x4 layout):

   **Card 1: School Setup**
   - Icon: 🏫 (school building in circle)
   - Status: ✅ (green checkmark)
   - Description: "Basic school information and branding configured"

   **Card 2: User & Role Management**
   - Icon: 👥 (users in circle)
   - Status: ✅
   - Description: "Teachers and staff roles assigned with proper permissions"

   **Card 3: Class & Curriculum**
   - Icon: 📚 (books in circle)
   - Status: ✅
   - Description: "14 classes with subject mappings configured"

   **Card 4: Smart Timetable**
   - Icon: 🕐 (clock in circle)
   - Status: ✅
   - Description: "AI-generated timetable with optimized teacher allocation"

   **Card 5: Attendance System**
   - Icon: ✓ (checkmark in circle)
   - Status: ✅
   - Description: "Student and teacher attendance tracking enabled"

   **Card 6: Fee Management**
   - Icon: 💳 (card in circle)
   - Status: ✅
   - Description: "Complete fee structure with payment tracking setup"

   **Card 7: Reports & Analytics**
   - Icon: 📊 (chart in circle)
   - Status: ✅
   - Description: "AI-powered insights and downloadable reports ready"

4. **Recommended Next Steps Section** (Reference: `10.png`)
   - **Title**: → Recommended Next Steps
   - **Subtitle**: "Complete these actions to get the most out of your system"

   **Action Cards** (4 cards with priority badges):

   **Card 1: Invite Your Team**
   - Priority Badge: "High Priority" (red)
   - Description: "Send invitations to teachers and staff members"
   - Button: "Invite Users" (blue, right-aligned)

   **Card 2: Import Student Data**
   - Priority Badge: "High Priority" (red)
   - Description: "Upload existing student records and information"
   - Button: "Import Data" (blue, right-aligned)

   **Card 3: Configure Notifications**
   - Priority Badge: "Medium Priority" (yellow)
   - Description: "Set up automated reminders and alerts"
   - Button: "Setup Alerts" (outlined, right-aligned)

   **Card 4: Payment Gateway**
   - Priority Badge: "Medium Priority" (yellow)
   - Description: "Connect payment gateway for online fee collection"
   - Button: "Connect Gateway" (outlined, right-aligned)

5. **Setup Summary Stats** (Bottom Row - 4 cards)
   - **1,200**: Students Ready (with icon)
   - **85**: Teachers Added (with icon)
   - **14**: Classes Setup (with icon)
   - **₹20L**: Fee Structure (with icon)

6. **Final Action Buttons**
   - **Primary**: "Go to Dashboard" (large blue button, prominent)
   - **Secondary**: "View Help Center" (outlined button)

7. **Support Information** (Footer)
   - **Message**: "Need help getting started? Our support team is here to help you succeed."
   - **Contact**: "Contact us at support@paramarsh.edu or call +91 22 1234 5678"

#### Data Structure
```typescript
interface SetupCompletionSummary {
  schoolName: string;
  completedSteps: number;
  totalSteps: number;
  setupDuration?: number;        // Time taken in minutes
  achievements: Achievement[];
  modulesConfigured: ModuleStatus[];
  nextSteps: NextStepAction[];
  summaryStats: SummaryStats;
}

interface Achievement {
  id: string;
  title: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

interface ModuleStatus {
  module: string;
  icon: string;
  configured: boolean;
  description: string;
  recordCount?: number;         // e.g., 14 classes, 85 teachers
}

interface NextStepAction {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionLabel: string;
  actionUrl: string;
  completed: boolean;
}

interface SummaryStats {
  studentsReady: number;
  teachersAdded: number;
  classesSetup: number;
  feeStructureAmount: number;
}
```

#### Seeded Demo Data
```json
{
  "setupSummary": {
    "schoolName": "Paramarsh International School",
    "completedSteps": 9,
    "totalSteps": 9,
    "setupDuration": 45
  },
  "achievements": [
    {
      "id": "ACH001",
      "title": "Complete onboarding in record time",
      "icon": "🎯",
      "unlocked": true
    },
    {
      "id": "ACH002",
      "title": "AI-powered timetable generated",
      "icon": "⚡",
      "unlocked": true
    },
    {
      "id": "ACH003",
      "title": "Full analytics dashboard ready",
      "icon": "📊",
      "unlocked": true
    },
    {
      "id": "ACH004",
      "title": "Fee management system configured",
      "icon": "💳",
      "unlocked": true
    },
    {
      "id": "ACH005",
      "title": "User roles and permissions set",
      "icon": "👥",
      "unlocked": true
    }
  ],
  "modulesConfigured": [
    {
      "module": "School Setup",
      "icon": "🏫",
      "configured": true,
      "description": "Basic school information and branding configured"
    },
    {
      "module": "User & Role Management",
      "icon": "👥",
      "configured": true,
      "description": "Teachers and staff roles assigned with proper permissions"
    },
    {
      "module": "Class & Curriculum",
      "icon": "📚",
      "configured": true,
      "description": "14 classes with subject mappings configured",
      "recordCount": 14
    },
    {
      "module": "Smart Timetable",
      "icon": "🕐",
      "configured": true,
      "description": "AI-generated timetable with optimized teacher allocation"
    },
    {
      "module": "Attendance System",
      "icon": "✓",
      "configured": true,
      "description": "Student and teacher attendance tracking enabled"
    },
    {
      "module": "Fee Management",
      "icon": "💳",
      "configured": true,
      "description": "Complete fee structure with payment tracking setup"
    },
    {
      "module": "Reports & Analytics",
      "icon": "📊",
      "configured": true,
      "description": "AI-powered insights and downloadable reports ready"
    }
  ],
  "nextSteps": [
    {
      "id": "NS001",
      "title": "Invite Your Team",
      "description": "Send invitations to teachers and staff members",
      "priority": "high",
      "actionLabel": "Invite Users",
      "actionUrl": "/users/invite",
      "completed": false
    },
    {
      "id": "NS002",
      "title": "Import Student Data",
      "description": "Upload existing student records and information",
      "priority": "high",
      "actionLabel": "Import Data",
      "actionUrl": "/students/import",
      "completed": false
    },
    {
      "id": "NS003",
      "title": "Configure Notifications",
      "description": "Set up automated reminders and alerts",
      "priority": "medium",
      "actionLabel": "Setup Alerts",
      "actionUrl": "/settings/notifications",
      "completed": false
    },
    {
      "id": "NS004",
      "title": "Payment Gateway",
      "description": "Connect payment gateway for online fee collection",
      "priority": "medium",
      "actionLabel": "Connect Gateway",
      "actionUrl": "/settings/payment-gateway",
      "completed": false
    }
  ],
  "summaryStats": {
    "studentsReady": 1200,
    "teachersAdded": 85,
    "classesSetup": 14,
    "feeStructureAmount": 2000000
  },
  "support": {
    "email": "support@paramarsh.edu",
    "phone": "+91 22 1234 5678",
    "helpCenterUrl": "/help"
  }
}
```

#### Features

**Progress Tracking**:
- Visual confirmation of all completed steps
- Achievement badges for motivation
- Setup duration tracking

**Module Verification**:
- Each module shows configuration status
- Record counts where applicable
- Quick access links to each module

**Guided Next Steps**:
- Prioritized action items
- High priority items flagged in red
- Medium priority items in yellow
- Direct action buttons for each step

**Support Resources**:
- Help center access
- Contact information
- Email and phone support

#### Navigation
- **Primary Action**: "Go to Dashboard" (launches main application)
- **Secondary Action**: "View Help Center" (opens documentation)
- No "Back" button (setup complete)

---

## Implementation Notes

### Design System
- All screens shown use a **reference design system**
- Implementation should use **Paramarsh's existing design system** (shadcn/ui)
- Focus on replicating **functionality and UX**, not exact visual design
- Maintain consistent spacing, typography, and component patterns from existing Paramarsh modules

### Data Seeding
- All demo data should be realistic and Indian-context appropriate
- Use authentic Indian names (Aarav, Diya, Ananya, etc.)
- Currency in INR (₹)
- Phone numbers with +91 country code
- Cities and locations from India

### Multi-tenancy
- Each school setup creates a new tenant (branchId)
- All data isolated by tenant
- User permissions scoped to tenant

### Progressive Disclosure
- Show advanced features only after basic setup
- Use tabs and panels to reduce cognitive load
- Provide helpful tooltips and guidance text
- Show success states and progress indicators

### Validation & Error Handling
- Validate each step before allowing progression
- Show inline validation errors
- Prevent moving to next step if current step incomplete
- Allow skipping optional steps with clear indication

### State Management
- Track onboarding progress in database
- Allow users to resume incomplete onboarding
- Save draft data between steps
- Provide option to exit and return later

---

## Technical Requirements

### Backend APIs Needed
1. **School Setup**: POST /api/schools (create tenant)
2. **User Management**: POST /api/users/bulk (bulk user creation)
3. **Class Setup**: POST /api/classes, POST /api/subjects
4. **Timetable**: POST /api/timetable/generate (AI generation)
5. **Attendance**: POST /api/attendance/sessions
6. **Fee Structure**: POST /api/fee-structures
7. **Reports**: GET /api/reports/summary

### Frontend Routes
- `/onboarding/school-setup` (Step 1)
- `/onboarding/dashboard-tour` (Step 2)
- `/onboarding/user-roles` (Step 3)
- `/onboarding/classes` (Step 4)
- `/onboarding/timetable` (Step 5)
- `/onboarding/attendance` (Step 6)
- `/onboarding/fees` (Step 7)
- `/onboarding/reports` (Step 8)
- `/onboarding/complete` (Step 9)

### State Persistence
```typescript
interface OnboardingState {
  currentStep: number;
  completedSteps: number[];
  schoolData?: SchoolSetupForm;
  userRoles?: UserRole[];
  classes?: ClassSetup[];
  timetable?: TimetableConfig;
  feeStructure?: FeeStructure[];
  startedAt: Date;
  lastUpdated: Date;
  completed: boolean;
}
```

---

## Success Metrics

### Onboarding Completion
- **Target**: 80% of schools complete all 9 steps
- **Time to Complete**: Average < 60 minutes
- **Drop-off Points**: Track which steps have highest abandonment

### User Engagement
- **Dashboard Tour**: 90% view at least 2 slides
- **Demo Data Usage**: 70% interact with demo data
- **AI Timetable**: 85% generate AI timetable

### Data Quality
- **Complete Profiles**: 95% of schools fill all required fields
- **Logo Upload**: 60% upload school logo
- **User Creation**: Average 10+ users created per school

---

## Future Enhancements

### Phase 2 Features
- Video tutorials at each step
- Interactive walkthroughs
- Sample data import from CSV
- Integration with existing systems
- Mobile onboarding experience

### AI Enhancements
- Smart recommendations based on school size
- Automated subject-teacher mapping
- Predictive class capacity planning
- Personalized onboarding flow based on school type

### Gamification
- Progress badges
- Setup leaderboard (for training institutions)
- Achievement unlocks
- Celebration animations

---

## Appendix

### Screen Reference Map
| Screen File | Stage | Description |
|------------|-------|-------------|
| 1.png | Stage 1 | School Setup - Basic Information Form |
| 2.png | Stage 2 | Dashboard Tour - Live Demo with KPIs |
| 3.png | Stage 3 | User Roles - Permission Setup |
| 4.png | Stage 4 | Classes - Class Structure & Curriculum |
| 5.png | Stage 5 | Timetable - AI Generator & Conflicts |
| 6.png | Stage 6 | Attendance - Daily Tracking Interface |
| 7.png | Stage 7 | Fees - Collection & Payment Alerts |
| 8.png | Stage 8 | Reports - Analytics Dashboard |
| 9.png | Stage 9 | Complete - Success & Achievements |
| 10.png | Stage 9 | Complete - Next Steps & Actions |

### Related Documentation
- Main PRD: `/docs/PRD.md`
- API Specification: `/docs/react-admin-api-spec.md`
- Testing Guide: `/docs/frontend-testing-guide.md`
- Design System: Refer to existing shadcn/ui components

---

**Document Version**: 1.0
**Last Updated**: 2025-10-07
**Author**: Paramarsh Team
**Status**: Draft for Implementation
