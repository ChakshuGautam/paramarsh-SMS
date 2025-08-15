# Product Requirements Document (PRD)
## Indian School Examination System

### 1. Executive Summary
This PRD outlines the requirements for implementing a comprehensive examination management system tailored for Indian schools. The system will support various exam patterns commonly used in Indian education, including Monthly Tests, Half-Yearly Exams, Final Exams, and Unit Tests.

### 2. Problem Statement
Current exam module lacks support for:
- Different types of examinations with varying weightages
- Grade-specific exam patterns
- Subject-specific evaluation methods
- Term-based academic structure
- Co-curricular and extra-curricular assessments

### 3. Goals & Objectives
- Support multiple exam types with configurable weightages
- Enable flexible grading systems (marks, grades, or both)
- Accommodate CBSE, ICSE, and State Board patterns
- Generate standard report cards and progress reports
- Track continuous and comprehensive evaluation (CCE)

### 4. User Personas

#### School Administrator
- Configures exam patterns for the academic year
- Sets weightage for different exam types
- Manages grading scales

#### Teachers
- Creates exam schedules
- Enters marks/grades
- Generates progress reports

#### Students/Parents
- View exam schedules
- Access results and report cards
- Track academic progress

### 5. Functional Requirements

#### 5.1 Exam Types
```typescript
enum ExamType {
  UNIT_TEST = 'UNIT_TEST',           // Small periodic tests (10-20% weightage)
  MONTHLY_TEST = 'MONTHLY_TEST',     // Monthly assessments (10-15% weightage)
  QUARTERLY = 'QUARTERLY',           // Quarter-end exams (20-25% weightage)
  HALF_YEARLY = 'HALF_YEARLY',       // Mid-year exams (30-40% weightage)
  ANNUAL = 'ANNUAL',                 // Final exams (40-50% weightage)
  PRE_BOARD = 'PRE_BOARD',          // Practice exams for board classes
  BOARD_EXAM = 'BOARD_EXAM',        // Board examinations
  REMEDIAL = 'REMEDIAL',            // Re-examination
  PRACTICAL = 'PRACTICAL',          // Lab/practical exams
  ORAL = 'ORAL',                    // Viva/oral examinations
  PROJECT = 'PROJECT',               // Project submissions
  ASSIGNMENT = 'ASSIGNMENT'         // Regular assignments
}
```

#### 5.2 Exam Configuration
```typescript
interface ExamConfig {
  id: string;
  academicYearId: string;
  examType: ExamType;
  name: string;                    // e.g., "First Term Unit Test 1"
  term: 1 | 2 | 3;                // Term number
  weightagePercent: number;        // Contribution to final grade
  minPassingMarks: number;         // Minimum marks to pass
  maxMarks: number;                // Total marks
  isGraded: boolean;              // Uses letter grades
  isOptional: boolean;            // Optional exam
  affectsPromotion: boolean;      // Counts for promotion
  classes: string[];               // Applicable classes
  startDate: string;
  endDate: string;
}
```

#### 5.3 Subject-Exam Mapping
```typescript
interface SubjectExamConfig {
  id: string;
  examConfigId: string;
  subjectId: string;
  maxTheoryMarks: number;
  maxPracticalMarks: number;
  maxProjectMarks: number;
  maxInternalMarks: number;
  passingTheoryMarks: number;
  passingPracticalMarks: number;
  examDate: string;
  examDuration: number;           // in minutes
  syllabus?: string;              // Topics covered
}
```

#### 5.4 Grading System
```typescript
interface GradingScale {
  id: string;
  name: string;                   // e.g., "CBSE 10-point scale"
  type: 'MARKS' | 'GRADE' | 'CGPA' | 'PERCENTAGE';
  scales: GradeRange[];
}

interface GradeRange {
  minMarks: number;
  maxMarks: number;
  grade: string;                  // A+, A, B+, etc.
  gradePoint: number;            // 10, 9, 8, etc.
  description?: string;          // "Outstanding", "Excellent", etc.
}
```

#### 5.5 Result Processing
```typescript
interface ExamResult {
  id: string;
  studentId: string;
  examConfigId: string;
  subjectResults: SubjectResult[];
  totalMarksObtained: number;
  totalMaxMarks: number;
  percentage: number;
  grade?: string;
  cgpa?: number;
  rank?: number;                  // Class rank
  attendance: number;              // Attendance percentage
  remarks?: string;
  status: 'PASS' | 'FAIL' | 'ABSENT' | 'WITHHELD' | 'COMPARTMENT';
}

interface SubjectResult {
  subjectId: string;
  theoryMarks?: number;
  practicalMarks?: number;
  projectMarks?: number;
  internalMarks?: number;
  totalMarks: number;
  grade?: string;
  remarks?: string;
  evaluatedBy: string;            // Teacher ID
  evaluatedAt: Date;
}
```

### 6. Database Schema Changes

#### Multi-Tenant Architecture
The system follows a master-instance pattern where:
- **Master Tables**: Define templates and standards (can be shared across branches or system-wide)
- **Instance Tables**: Actual branch-specific implementations with `branchId`

#### Master Tables (Shared/Template)

```prisma
model ExamTemplate {
  id               String      @id @default(uuid())
  boardType        String?     // CBSE, ICSE, STATE_BOARD, CUSTOM
  examType         String      // ExamType enum value
  name             String      // Template name e.g., "CBSE Class 10 Board Exam"
  description      String?
  term             Int?        // 1, 2, or 3
  weightagePercent Float?      // 0-100
  minPassingMarks  Float?
  maxMarks         Float?
  isGraded         Boolean     @default(false)
  affectsPromotion Boolean     @default(true)
  applicableClasses Json?      // Array of applicable class levels
  suggestedDuration Int?       // Suggested exam duration in days
  isSystemTemplate Boolean     @default(false) // System-provided vs custom
  createdBy        String?     // User who created custom template
  
  // Relations
  examInstances    Exam[]      // Actual exams created from this template
}

model GradingScaleTemplate {
  id              String       @id @default(uuid())
  boardType       String?      // CBSE, ICSE, STATE_BOARD
  name            String       // e.g., "CBSE 10-point scale"
  type            String       // MARKS, GRADE, CGPA, PERCENTAGE
  grades          Json         // Array of GradeRange
  isSystemTemplate Boolean     @default(false)
  
  // Relations
  gradingScales   GradingScale[] // Branch-specific instances
}
```

#### Branch-Specific Instance Tables

```prisma
model Exam {
  id               String      @id @default(uuid())
  branchId         String      // REQUIRED - Identifies the school/branch
  templateId       String?     // Optional reference to ExamTemplate
  academicYearId   String
  examType         String      // ExamType enum value
  name             String
  term             Int?        // 1, 2, or 3
  weightagePercent Float?      // 0-100
  minPassingMarks  Float?
  maxMarks         Float?
  isGraded         Boolean     @default(false)
  isOptional       Boolean     @default(false)
  affectsPromotion Boolean     @default(true)
  startDate        String
  endDate          String
  status           String      @default("SCHEDULED") // SCHEDULED, ONGOING, COMPLETED, CANCELLED
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt
  
  // Relations
  branch           Branch      @relation(fields: [branchId], references: [id])
  template         ExamTemplate? @relation(fields: [templateId], references: [id])
  academicYear     AcademicYear @relation(fields: [academicYearId], references: [id])
  examSubjects     ExamSubject[]
  examResults      ExamResult[]
  examSchedules    ExamSchedule[]
  
  @@index([branchId, academicYearId])
  @@index([branchId, status])
}

model ExamSubject {
  id                  String   @id @default(uuid())
  branchId            String   // REQUIRED - Same as parent exam's branchId
  examId              String
  subjectId           String
  sectionId           String?  // Optional: for section-specific exams
  maxTheoryMarks      Float?
  maxPracticalMarks   Float?
  maxProjectMarks     Float?
  maxInternalMarks    Float?
  passingTheoryMarks  Float?
  passingPracticalMarks Float?
  examDate            String?
  examDuration        Int?     // in minutes
  syllabus            String?  @db.Text
  
  // Relations
  branch              Branch   @relation(fields: [branchId], references: [id])
  exam                Exam     @relation(fields: [examId], references: [id])
  subject             Subject  @relation(fields: [subjectId], references: [id])
  section             Section? @relation(fields: [sectionId], references: [id])
  marks               Mark[]
  
  @@index([branchId, examId])
}

model ExamResult {
  id                  String   @id @default(uuid())
  branchId            String   // REQUIRED - For efficient querying
  examId              String
  studentId           String
  totalMarksObtained  Float
  totalMaxMarks       Float
  percentage          Float
  grade               String?
  cgpa                Float?
  classRank           Int?
  sectionRank         Int?
  attendance          Float?
  remarks             String?  @db.Text
  status              String   // PASS, FAIL, ABSENT, WITHHELD, COMPARTMENT
  publishedAt         DateTime?
  
  // Relations
  branch              Branch   @relation(fields: [branchId], references: [id])
  exam                Exam     @relation(fields: [examId], references: [id])
  student             Student  @relation(fields: [studentId], references: [id])
  subjectResults      Mark[]
  
  @@index([branchId, studentId])
  @@index([branchId, examId])
}

model Mark {
  id              String      @id @default(uuid())
  branchId        String      // REQUIRED - For data isolation
  examSubjectId   String
  studentId       String
  theoryMarks     Float?
  practicalMarks  Float?
  projectMarks    Float?
  internalMarks   Float?
  totalMarks      Float
  grade           String?
  remarks         String?
  isAbsent        Boolean     @default(false)
  evaluatedBy     String?     // Teacher ID
  evaluatedAt     DateTime?
  
  // Relations
  branch          Branch      @relation(fields: [branchId], references: [id])
  examSubject     ExamSubject @relation(fields: [examSubjectId], references: [id])
  student         Student     @relation(fields: [studentId], references: [id])
  examResult      ExamResult? @relation(fields: [examResultId], references: [id])
  examResultId    String?
  
  @@index([branchId, studentId])
  @@index([branchId, examSubjectId])
}

model GradingScale {
  id              String       @id @default(uuid())
  branchId        String       // REQUIRED - Branch-specific grading
  templateId      String?      // Optional reference to GradingScaleTemplate
  name            String
  type            String       // MARKS, GRADE, CGPA, PERCENTAGE
  isDefault       Boolean      @default(false)
  grades          Json         // Array of GradeRange
  applicableFrom  String?      // Academic year
  applicableTo    String?      // Academic year
  classes         Json?        // Applicable classes
  
  // Relations
  branch          Branch       @relation(fields: [branchId], references: [id])
  template        GradingScaleTemplate? @relation(fields: [templateId], references: [id])
  
  @@index([branchId, isDefault])
}

model AcademicYear {
  id              String       @id @default(uuid())
  branchId        String       // REQUIRED - Each branch has its own academic calendar
  name            String       // "2024-25"
  startDate       String
  endDate         String
  terms           Json         // Array of terms with dates
  isActive        Boolean      @default(false)
  
  // Relations
  branch          Branch       @relation(fields: [branchId], references: [id])
  exams           Exam[]
  
  @@unique([branchId, name])
  @@index([branchId, isActive])
}
```

### 7. Service Layer & Multi-Tenancy

#### Branch Scoping Implementation
All services must enforce branch-level data isolation:

```typescript
// Example: ExamService
class ExamService {
  async findAll(params: QueryParams) {
    const { branchId } = PrismaService.getScope(); // Get from auth context
    const where = { branchId, ...params.filters };
    
    return this.prisma.exam.findMany({ where });
  }
  
  async createFromTemplate(templateId: string, data: CreateExamDto) {
    const { branchId } = PrismaService.getScope();
    const template = await this.prisma.examTemplate.findUnique({
      where: { id: templateId }
    });
    
    return this.prisma.exam.create({
      data: {
        branchId, // Always set branchId
        templateId,
        name: data.name || template.name,
        examType: template.examType,
        weightagePercent: template.weightagePercent,
        ...data
      }
    });
  }
  
  async cascadeCreate(examId: string) {
    const { branchId } = PrismaService.getScope();
    const exam = await this.prisma.exam.findFirst({
      where: { id: examId, branchId } // Always filter by branchId
    });
    
    // Create ExamSubjects with same branchId
    const subjects = await this.prisma.subject.findMany({
      where: { branchId }
    });
    
    const examSubjects = subjects.map(subject => ({
      branchId, // Propagate branchId
      examId,
      subjectId: subject.id,
      // ... other fields
    }));
    
    return this.prisma.examSubject.createMany({ data: examSubjects });
  }
}
```

#### Template Usage Flow
1. **System Templates**: Pre-defined exam patterns (CBSE, ICSE, etc.)
2. **Custom Branch Templates**: Branch creates its own templates
3. **Exam Instances**: Actual exams with branchId, optionally based on templates

```typescript
// Template to Instance flow
async function createExamFromTemplate(templateId: string, overrides: Partial<Exam>) {
  const template = await getTemplate(templateId);
  const { branchId } = getCurrentBranch();
  
  const exam = await createExam({
    branchId,        // Always required
    templateId,      // Reference to template
    ...template,     // Copy template fields
    ...overrides,    // Branch-specific overrides
  });
  
  // Also create related entities with branchId
  await createExamSubjects(exam.id, branchId);
  await createGradingScale(exam.id, branchId);
  
  return exam;
}
```

### 8. API Endpoints

#### Exam Management
- `GET /api/exams` - List exams with filters
- `GET /api/exams/:id` - Get exam details
- `POST /api/exams` - Create new exam
- `PUT /api/exams/:id` - Update exam
- `DELETE /api/exams/:id` - Delete exam
- `POST /api/exams/:id/schedule` - Schedule exam subjects
- `POST /api/exams/:id/publish-results` - Publish results

#### Marks Entry
- `GET /api/exams/:examId/marks` - Get marks for an exam
- `POST /api/exams/:examId/marks` - Bulk enter marks
- `PUT /api/marks/:id` - Update individual marks
- `POST /api/marks/import` - Import marks from Excel/CSV

#### Results & Reports
- `GET /api/students/:id/results` - Get student results
- `GET /api/exams/:id/results` - Get exam results
- `GET /api/reports/progress-card/:studentId` - Generate progress card
- `GET /api/reports/marksheet/:examId/:studentId` - Generate marksheet
- `GET /api/analytics/class-performance` - Class performance analytics

### 8. UI/UX Requirements

#### Admin Dashboard
- Exam calendar view
- Quick exam creation wizard
- Bulk operations for scheduling
- Result publication workflow

#### Teacher Interface
- Mark entry grid (spreadsheet-like)
- Subject-wise student list
- Quick navigation between classes/sections
- Marks validation and auto-save
- Absent student marking

#### Student/Parent Portal
- Exam schedule calendar
- Result cards
- Performance trends
- Downloadable report cards

### 9. Business Rules

1. **Weightage Validation**: Total weightage of all exams in an academic year should equal 100%
2. **Promotion Criteria**: Minimum 33% in each subject and 40% aggregate for promotion
3. **Compartment Rules**: Students failing in 1-2 subjects get compartment exam opportunity
4. **Grace Marks**: Up to 5% grace marks can be awarded (configurable)
5. **Attendance Requirement**: Minimum 75% attendance to appear in exams
6. **Result Declaration**: Results locked after publication (admin override available)

### 10. Integration Requirements

- **SMS Integration**: Send exam schedules and results via SMS
- **Email Notifications**: Automated emails for important updates
- **Parent App API**: Real-time sync with mobile app
- **Report Generation**: PDF generation for report cards
- **Excel Import/Export**: Bulk data operations

### 11. Performance Requirements

- Mark entry should auto-save every 30 seconds
- Report card generation < 3 seconds
- Support concurrent mark entry by multiple teachers
- Handle 10,000+ student records efficiently

### 12. Security & Compliance

- Role-based access control for marks entry
- Audit trail for all mark modifications
- Data encryption for sensitive information
- Compliance with education board guidelines
- Backup and recovery procedures

### 13. Success Metrics

- Reduction in result processing time by 70%
- Zero data entry errors in final results
- 100% parent engagement with digital report cards
- Teacher satisfaction score > 4.5/5
- Compliance with board examination standards

### 14. Implementation Phases

#### Phase 1 (Week 1-2)
- Basic exam CRUD operations
- Exam type enumeration
- Database schema updates

#### Phase 2 (Week 3-4)
- Marks entry interface
- Result calculation engine
- Basic reporting

#### Phase 3 (Week 5-6)
- Advanced features (weightage, grading scales)
- Report card generation
- Analytics dashboard

#### Phase 4 (Week 7-8)
- Testing and bug fixes
- Performance optimization
- Documentation and training

### 15. Open Questions

1. Should we support custom exam types beyond the standard ones?
2. How should we handle re-evaluation requests?
3. Should practical exam scheduling be integrated with lab/room booking?
4. Do we need to support different grading scales per subject?
5. How should we handle special cases (medical leave, sports quota)?

---

**Document Version**: 1.0  
**Created Date**: 2024-12-15  
**Author**: System Architect  
**Status**: Draft - Pending Review