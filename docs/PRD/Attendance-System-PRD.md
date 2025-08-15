# Product Requirements Document: Attendance Management System

## 1. Executive Summary

### 1.1 Purpose
This document outlines the requirements for a comprehensive attendance management system that tracks both teacher and student attendance based on the school's timetable structure. The system will enable period-wise attendance tracking for students and day-level attendance for teachers.

### 1.2 Scope
The attendance system will integrate with the existing timetable module to provide context-aware attendance tracking, ensuring that attendance is taken for the right students, by the right teacher, in the right classroom, at the right time.

## 2. Problem Statement

Current attendance systems often treat attendance as a simple present/absent binary at the day level. However, schools operate on period-based timetables where:
- Students may be present for some periods but absent for others
- Different teachers handle different periods
- Attendance needs to be tracked per subject/period
- Teacher substitutions need to be managed
- Attendance data needs to be aggregated for reporting

## 3. User Personas

### 3.1 Subject Teacher
- **Needs**: Quick and easy way to mark attendance for their class periods
- **Pain Points**: Managing paper registers, calculating attendance percentages
- **Goals**: Spend less time on administrative tasks, focus on teaching

### 3.2 Class Teacher/Homeroom Teacher
- **Needs**: Overview of their class's attendance patterns
- **Pain Points**: Tracking chronic absenteeism, parent communication
- **Goals**: Identify at-risk students, improve class attendance rates

### 3.3 School Administrator
- **Needs**: School-wide attendance analytics and compliance reporting
- **Pain Points**: Manual data aggregation, regulatory compliance
- **Goals**: Meet regulatory requirements, improve overall attendance

### 3.4 Parents
- **Needs**: Real-time notifications about their child's attendance
- **Pain Points**: Finding out about absences after the fact
- **Goals**: Stay informed about their child's school attendance

### 3.5 Students
- **Needs**: View their attendance records and percentages
- **Pain Points**: Not knowing their attendance status for eligibility
- **Goals**: Maintain required attendance percentage

## 4. Functional Requirements

### 4.1 Timetable Integration

#### 4.1.1 Period-Based Structure
- System SHALL retrieve the current period based on timetable slots
- System SHALL identify the subject, teacher, and section for each period
- System SHALL support multiple timetable patterns (weekly, fortnightly, etc.)

#### 4.1.2 Room/Section Mapping
- Each attendance session SHALL be linked to a specific section (class + section combination)
- System SHALL validate that the teacher marking attendance is assigned to that period

### 4.2 Teacher Attendance

#### 4.2.1 Daily Check-in/Check-out
- Teachers SHALL be able to mark their arrival time
- Teachers SHALL be able to mark their departure time
- System SHALL calculate total hours worked

#### 4.2.2 Leave Management Integration
- System SHALL check for approved leaves
- System SHALL mark automatic attendance for approved leave days
- System SHALL support different leave types (sick, casual, earned)

#### 4.2.3 Substitute Management
- System SHALL allow marking of substitute teachers for specific periods
- System SHALL maintain history of who actually took which class

### 4.3 Student Attendance

#### 4.3.1 Period-wise Attendance
- Teachers SHALL mark attendance for each period they teach
- System SHALL support bulk marking with individual overrides
- Attendance statuses:
  - Present
  - Absent
  - Late (with minutes late)
  - Excused (with reason)
  - Medical
  - Suspended
  - Field Trip/School Activity

#### 4.3.2 Attendance Rules
- System SHALL enforce minimum time for marking a student present
- Late arrivals after X minutes SHALL be marked as absent
- System SHALL support school-configurable grace periods

#### 4.3.3 Quick Actions
- One-click "Mark All Present"
- Quick toggle for individual students
- Bulk actions for common scenarios (field trip, school event)

### 4.4 Attendance Workflow

#### 4.4.1 Pre-class
1. System identifies upcoming period from timetable
2. Sends reminder notification to teacher (optional)
3. Prepares attendance roster

#### 4.4.2 During Class
1. Teacher opens attendance for current period
2. System shows:
   - Subject name
   - Section details
   - Student roster with photos
   - Previous period's attendance (for reference)
3. Teacher marks attendance
4. System saves with timestamp

#### 4.4.3 Post-class
1. System locks attendance after configurable time
2. Sends notifications to parents for absences (configurable)
3. Updates attendance analytics

### 4.5 Special Scenarios

#### 4.5.1 Assembly/Common Periods
- Support for marking attendance for multiple sections simultaneously
- Homeroom teachers mark attendance for their sections

#### 4.5.2 Practical/Lab Sessions
- Support for split sections
- Multiple teachers can mark attendance for sub-groups

#### 4.5.3 Sports/PE Periods
- Outdoor attendance marking via mobile
- Support for different groups/houses

#### 4.5.4 Examinations
- Special attendance mode for exam days
- Integration with exam timetable

### 4.6 Reporting & Analytics

#### 4.6.1 Real-time Dashboards
- Current period attendance status
- Daily attendance summary
- Absentee lists by class/section

#### 4.6.2 Student Reports
- Individual attendance percentage (overall and subject-wise)
- Attendance trends and patterns
- Eligibility status based on minimum attendance requirements

#### 4.6.3 Teacher Reports
- Teacher attendance summary
- Periods taken vs. assigned
- Substitute teaching records

#### 4.6.4 Administrative Reports
- Daily attendance summary (school-wide)
- Chronic absenteeism reports
- Attendance trends by grade/section
- Regulatory compliance reports

#### 4.6.5 Parent Communication
- Daily attendance SMS/Email
- Weekly attendance summary
- Low attendance alerts

## 5. Technical Requirements

### 5.1 Data Model

#### 5.1.1 Core Entities

```typescript
interface AttendanceSession {
  id: string;
  date: Date;
  periodId: string;        // From timetable
  sectionId: string;       // Class + Section
  subjectId: string;
  teacherId: string;       // Assigned teacher
  actualTeacherId?: string; // Substitute if different
  startTime: DateTime;
  endTime: DateTime;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  lockedAt?: DateTime;
}

interface StudentAttendance {
  id: string;
  sessionId: string;       // Links to AttendanceSession
  studentId: string;
  status: AttendanceStatus;
  markedAt: DateTime;
  markedBy: string;        // Teacher ID
  minutesLate?: number;
  reason?: string;
  notes?: string;
}

interface TeacherAttendance {
  id: string;
  teacherId: string;
  date: Date;
  checkIn?: DateTime;
  checkOut?: DateTime;
  status: 'present' | 'absent' | 'leave' | 'holiday' | 'half-day';
  leaveType?: string;
  substituteId?: string;    // If someone else is substituting
}

enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
  MEDICAL = 'medical',
  SUSPENDED = 'suspended',
  ACTIVITY = 'activity'    // School activity/field trip
}
```

### 5.2 API Endpoints

#### 5.2.1 Session Management
- `GET /api/attendance/sessions/current` - Get current period's session
- `GET /api/attendance/sessions/today` - Get all today's sessions
- `POST /api/attendance/sessions/{id}/start` - Start attendance session
- `POST /api/attendance/sessions/{id}/complete` - Complete and lock session

#### 5.2.2 Marking Attendance
- `GET /api/attendance/sessions/{id}/roster` - Get student roster
- `POST /api/attendance/sessions/{id}/mark` - Mark attendance for session
- `PATCH /api/attendance/sessions/{id}/students/{studentId}` - Update individual
- `POST /api/attendance/sessions/{id}/bulk` - Bulk operations

#### 5.2.3 Teacher Attendance
- `POST /api/attendance/teachers/check-in` - Teacher check-in
- `POST /api/attendance/teachers/check-out` - Teacher check-out
- `GET /api/attendance/teachers/today` - Today's teacher attendance
- `POST /api/attendance/teachers/{id}/substitute` - Assign substitute

#### 5.2.4 Reports
- `GET /api/attendance/reports/daily` - Daily summary
- `GET /api/attendance/reports/student/{id}` - Student attendance report
- `GET /api/attendance/reports/section/{id}` - Section attendance report
- `GET /api/attendance/analytics/trends` - Attendance trends

### 5.3 User Interface Requirements

#### 5.3.1 Teacher Mobile App
- Optimized for quick marking on phones/tablets
- Offline capability with sync
- Push notifications for upcoming periods
- Biometric authentication for security

#### 5.3.2 Web Dashboard
- Real-time attendance monitoring
- Drag-and-drop for corrections
- Bulk import/export capabilities
- Print-friendly reports

#### 5.3.3 Parent Portal
- View child's attendance in real-time
- Attendance calendar view
- Download attendance certificates
- Apply for leave/excuse absences

### 5.4 Integration Requirements

#### 5.4.1 Timetable System
- Real-time sync with timetable changes
- Handle timetable swaps and special days

#### 5.4.2 SMS/Email Gateway
- Automated absence notifications
- Daily attendance summary to parents
- Low attendance alerts

#### 5.4.3 Biometric Devices (Optional)
- Integration with fingerprint/RFID devices
- Automatic check-in/check-out for teachers
- Student entry/exit tracking

#### 5.4.4 Academic System
- Sync with exam eligibility rules
- Integration with grade calculation (attendance weightage)

## 6. Non-Functional Requirements

### 6.1 Performance
- Attendance marking should complete within 2 seconds
- Support concurrent marking by 100+ teachers
- Reports should generate within 5 seconds

### 6.2 Reliability
- 99.9% uptime during school hours
- Automatic backup every hour
- Disaster recovery within 1 hour

### 6.3 Security
- Role-based access control
- Audit trail for all attendance changes
- Data encryption at rest and in transit
- GDPR/FERPA compliance

### 6.4 Usability
- Maximum 3 clicks to mark attendance
- Mobile-responsive design
- Support for multiple languages
- Accessibility compliance (WCAG 2.1)

### 6.5 Scalability
- Support schools with 5000+ students
- Handle 50+ concurrent sections
- Archive historical data beyond 7 years

## 7. User Stories

### 7.1 Teacher Stories
1. As a teacher, I want to quickly mark attendance for my current period so that I can start teaching promptly
2. As a teacher, I want to see photos of students while marking attendance so that I can identify them easily
3. As a teacher, I want to correct attendance mistakes within a grace period so that errors can be fixed
4. As a substitute teacher, I want to access the attendance roster for classes I'm covering

### 7.2 Administrator Stories
1. As an administrator, I want to see real-time attendance across all classes so that I can monitor school operations
2. As an administrator, I want to generate regulatory reports automatically so that compliance is maintained
3. As an administrator, I want to identify attendance patterns so that I can intervene early

### 7.3 Parent Stories
1. As a parent, I want to receive immediate notification if my child is absent so that I'm aware of their whereabouts
2. As a parent, I want to see my child's attendance percentage so that I know their eligibility status

### 7.4 Student Stories
1. As a student, I want to view my attendance record so that I can track my eligibility
2. As a student, I want to report errors in my attendance so that corrections can be made

## 8. Success Metrics

### 8.1 Operational Metrics
- Reduce attendance marking time by 70%
- Achieve 95% same-day attendance completion
- Reduce attendance-related queries by 50%

### 8.2 Educational Metrics
- Improve overall attendance by 5%
- Reduce chronic absenteeism by 20%
- Increase parent engagement by 30%

### 8.3 Technical Metrics
- 99.9% system availability
- <2 second response time for marking
- Zero data loss incidents

## 9. Implementation Phases

### Phase 1: Core Attendance (Month 1-2)
- Basic period-wise attendance marking
- Teacher daily attendance
- Simple reports

### Phase 2: Advanced Features (Month 3-4)
- Substitute management
- Parent notifications
- Analytics dashboard
- Mobile app

### Phase 3: Integrations (Month 5-6)
- Biometric integration
- SMS/Email automation
- Advanced analytics
- Compliance reports

### Phase 4: Optimization (Month 7+)
- AI-based pattern detection
- Predictive analytics
- Automated interventions
- Custom workflows

## 10. Risks and Mitigation

### 10.1 Technical Risks
- **Risk**: Internet connectivity issues
- **Mitigation**: Offline mode with automatic sync

### 10.2 Adoption Risks
- **Risk**: Teacher resistance to digital system
- **Mitigation**: Comprehensive training and support

### 10.3 Data Risks
- **Risk**: Data loss or corruption
- **Mitigation**: Multiple backups and audit trails

## 11. Appendices

### 11.1 Glossary
- **Period**: A time slot in the timetable (typically 40-60 minutes)
- **Session**: An instance of a period on a specific date
- **Section**: A combination of class and division (e.g., "10-A")
- **Homeroom**: First period where general attendance is taken

### 11.2 Regulatory Requirements
- Maintain attendance records for 7 years
- Minimum 75% attendance for exam eligibility
- Daily attendance reports to education department

### 11.3 Sample Workflows
[Detailed workflow diagrams would be included here]

---

*Document Version: 1.0*
*Last Updated: 2025-08-15*
*Author: System Architect*