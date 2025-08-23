# Module: Students

## 📋 Overview

### Purpose
Core module for managing student information, enrollment, academic records, and student lifecycle from admission to graduation.

### Key Features
- Student registration and profile management
- Enrollment and class assignment
- Academic history tracking
- Document management
- Student status management (active, inactive, graduated, transferred)
- Guardian relationship management

### Dependencies
- **guardians**: For parent/guardian relationships
- **classes**: For class assignment
- **sections**: For section allocation
- **enrollments**: For enrollment records

---

## 📊 Data Models

### Primary Entity: Student

```prisma
model Student {
  id          String    @id @default(uuid())
  branchId    String?   // Multi-tenancy
  
  // Personal Information
  firstName   String
  lastName    String
  admissionNo String?   @unique
  dob         DateTime?
  gender      String?   // male, female, other
  bloodGroup  String?
  
  // Academic Information
  classId     String?
  sectionId   String?
  rollNumber  String?
  status      String?   @default("active") // active, inactive, graduated, transferred
  
  // Contact Information
  email       String?
  phone       String?
  address     String?
  
  // Relationships
  class       Class?     @relation(fields: [classId], references: [id])
  section     Section?   @relation(fields: [sectionId], references: [id])
  guardians   StudentGuardian[]
  enrollments Enrollment[]
  attendance  AttendanceRecord[]
  marks       MarksEntry[]
  invoices    Invoice[]
  
  // Documents
  photoUrl    String?
  documents   Json?     // Birth certificate, transfer certificate, etc.
  
  // Audit fields
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime? // Soft delete
  deletedBy   String?
}
```

### Relationships
- Many-to-One with Class
- Many-to-One with Section
- Many-to-Many with Guardian through StudentGuardian
- One-to-Many with Enrollment
- One-to-Many with AttendanceRecord
- One-to-Many with MarksEntry
- One-to-Many with Invoice

---

## 🔌 API Endpoints

### Base URL: `/api/v1/students`

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| GET | / | List all students | Query: page, perPage, sort, filter, q | `{ data: Student[], total: number }` |
| GET | /:id | Get student details | - | `{ data: Student }` |
| POST | / | Create new student | Body: CreateStudentDto | `{ data: Student }` |
| PUT | /:id | Update student | Body: UpdateStudentDto | `{ data: Student }` |
| PATCH | /:id | Partial update | Body: Partial UpdateStudentDto | `{ data: Student }` |
| DELETE | /:id | Soft delete student | - | `{ data: Student }` |
| GET | /deleted | List deleted students | Query params | `{ data: Student[], total: number }` |
| POST | /:id/restore | Restore deleted student | - | `{ data: Student }` |

### DTOs

#### CreateStudentDto
```typescript
export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  admissionNo?: string;

  @IsDateString()
  @IsOptional()
  dob?: string;

  @IsEnum(['male', 'female', 'other'])
  @IsOptional()
  gender?: string;

  @IsUUID()
  @IsOptional()
  classId?: string;

  @IsUUID()
  @IsOptional()
  sectionId?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsPhoneNumber('IN')
  @IsOptional()
  phone?: string;
}
```

---

## 🧮 Business Logic

### Validation Rules
1. **Admission Number**: Must be unique across the branch
2. **Class-Section Match**: Section must belong to the selected class
3. **Age Validation**: Student age must be appropriate for the class
4. **Guardian Required**: At least one guardian for students under 18
5. **Status Transitions**: Can only transition in valid sequences

### Status Workflow
```
admission → active → inactive → active
                   ↓           ↓
              graduated    transferred
```

### Enrollment Process
1. Create student record
2. Assign admission number (auto-generated)
3. Assign to class and section
4. Link guardians
5. Create enrollment record
6. Generate student ID card
7. Send welcome communication

---

## 🎨 Frontend Components

### List Component
```tsx
// apps/web/app/admin/resources/students/List.tsx
export const StudentsList = () => (
  <List
    filters={studentFilters}
    sort={{ field: 'firstName', order: 'ASC' }}
  >
    <DataTable>
      <DataTable.Col source="admissionNo" label="Admission No" />
      <DataTable.Col source="firstName" label="First Name" />
      <DataTable.Col source="lastName" label="Last Name" />
      <DataTable.Col source="class.name" label="Class" />
      <DataTable.Col source="section.name" label="Section" />
      <DataTable.Col source="status" label="Status">
        <StatusBadge />
      </DataTable.Col>
    </DataTable>
  </List>
);
```

---

## 🧪 Test Coverage

### E2E Test Scenarios
- ✅ List students with pagination
- ✅ Filter by class, section, status
- ✅ Search by name, admission number
- ✅ Create student with all fields
- ✅ Validate required fields
- ✅ Update student information
- ✅ Soft delete and restore
- ✅ Multi-tenancy isolation
- ✅ Guardian relationship management

---

## 🌱 Seed Data

### Indian Context Requirements
```typescript
// Sample seed data structure
const students = [
  {
    firstName: "Aarav",
    lastName: "Sharma",
    admissionNo: "2024/0001",
    dob: new Date("2010-05-15"),
    gender: "male",
    classId: "class-10-id",
    sectionId: "section-a-id",
    status: "active",
    phone: "+91-9876543210",
    address: "B-42, Sector 15, Noida, UP - 201301",
    branchId: "branch1"
  },
  // ... 500+ students
];
```

### Distribution Requirements
- 500+ total students
- 60-70% active status
- 10-15% graduated
- 5-10% inactive
- 5% transferred
- Realistic Indian names
- Age-appropriate class assignment

---

## 🔒 Security & Permissions

### Required Permissions
- `students.view` - View student records
- `students.create` - Add new students
- `students.update` - Update student information
- `students.delete` - Delete student records
- `students.export` - Export student data

### Role Access Matrix
| Role | View | Create | Update | Delete | Export |
|------|------|--------|--------|--------|--------|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Principal | ✅ | ✅ | ✅ | ✅ | ✅ |
| Teacher | ✅ | ❌ | ⚠️ | ❌ | ❌ |
| Student | ⚠️ | ❌ | ❌ | ❌ | ❌ |
| Parent | ⚠️ | ❌ | ❌ | ❌ | ❌ |

⚠️ = Own records only

---

## 📊 Reports & Analytics

### Available Reports
1. **Enrollment Report**: Students by class, section, status
2. **Demographic Analysis**: Age, gender distribution
3. **Admission Trends**: Monthly/yearly admission patterns
4. **Attrition Report**: Dropout and transfer analysis

### Key Metrics
- Total active students
- Class-wise distribution
- Gender ratio
- Average age by class
- Admission growth rate

---

## 🔄 Integration Points

### This Module Provides Data To:
- **attendance**: For marking attendance
- **exams**: For exam enrollment
- **marks**: For recording marks
- **invoices**: For fee generation
- **library**: For book issuing
- **transport**: For route allocation

### This Module Consumes Data From:
- **classes**: Class information
- **sections**: Section details
- **guardians**: Parent information
- **academic-years**: Current academic year

### Events
- Emitted: `student.created`, `student.updated`, `student.graduated`
- Consumed: `class.updated`, `section.updated`

---

## 🚨 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Duplicate admission numbers | Race condition | Use database unique constraint |
| Student appears in wrong class | Stale enrollment | Check enrollment end dates |
| Cannot delete student | Has related records | Use soft delete |
| Guardian not linked | Missing relationship | Check StudentGuardian table |
| Search not working | Missing index | Add database indexes on searchable fields |

---

## 📚 References

- [Guardian Module](../guardians/README.md)
- [Enrollment Module](../enrollments/README.md)
- [Class Management](../classes/README.md)
- [API Conventions](../../global/04-API-CONVENTIONS.md)
- [Indian Education Context](../../global/13-INDIAN-CONTEXT.md)