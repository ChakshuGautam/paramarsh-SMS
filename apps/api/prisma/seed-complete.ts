import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting complete database seed...');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await cleanDatabase();

  // Create tenant
  console.log('🏢 Creating tenant...');
  const tenant = await prisma.tenant.create({
    data: {
      id: 'tenant_default',
      name: 'Default School District',
      subdomain: 'default'
    }
  });

  // Create classes
  console.log('📚 Creating classes...');
  const classes = [];
  for (let i = 1; i <= 10; i++) {
    const cls = await prisma.class.create({
      data: {
        name: `Grade ${i}`,
        gradeLevel: i
      }
    });
    classes.push(cls);
  }

  // Create sections for each class
  console.log('📝 Creating sections...');
  const sections = [];
  for (const cls of classes) {
    for (const sectionName of ['A', 'B']) {
      const section = await prisma.section.create({
        data: {
          name: sectionName,
          classId: cls.id,
          capacity: 30
        }
      });
      sections.push(section);
    }
  }

  // Create staff members
  console.log('👥 Creating staff...');
  const staff = [];
  const departments = ['Academic', 'Administration', 'Support'];
  const designations = ['Principal', 'Vice Principal', 'Teacher', 'Coordinator', 'Secretary'];
  
  for (let i = 1; i <= 30; i++) {
    const staffMember = await prisma.staff.create({
      data: {
        firstName: `Staff${i}`,
        lastName: `Member${i}`,
        email: `staff${i}@school.edu`,
        phone: `555-${String(1000 + i).padStart(4, '0')}`,
        department: departments[i % departments.length],
        designation: designations[i % designations.length],
        employmentType: 'FULL_TIME',
        joinDate: '2020-01-01',
        status: 'ACTIVE'
      }
    });
    staff.push(staffMember);
  }

  // Create teachers from some staff members
  console.log('👩‍🏫 Creating teachers...');
  const teachers = [];
  const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology'];
  const qualifications = ['B.Ed', 'M.Ed', 'B.Sc', 'M.Sc', 'B.A', 'M.A'];
  
  for (let i = 0; i < 15; i++) {
    const teacher = await prisma.teacher.create({
      data: {
        staffId: staff[i].id,
        subjects: subjects[i % subjects.length],
        qualifications: qualifications[i % qualifications.length],
        experienceYears: Math.floor(Math.random() * 15) + 1
      }
    });
    teachers.push(teacher);
  }

  // Create students with guardians
  console.log('👨‍👩‍👧‍👦 Creating students and guardians...');
  const students = [];
  const guardians = [];
  let studentCount = 1;
  
  for (const section of sections) {
    for (let i = 0; i < 5; i++) {
      const student = await prisma.student.create({
        data: {
          admissionNo: `ADM${String(studentCount).padStart(4, '0')}`,
          firstName: `Student${studentCount}`,
          lastName: `LastName${studentCount}`,
          dob: '2010-01-01',
          gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
          classId: section.classId,
          sectionId: section.id
        }
      });
      students.push(student);

      // Create guardian for each student
      const guardian = await prisma.guardian.create({
        data: {
          studentId: student.id,
          name: `Parent of ${student.firstName}`,
          relation: i % 2 === 0 ? 'Father' : 'Mother',
          email: `parent${studentCount}@example.com`,
          phone: `555-${String(studentCount).padStart(4, '0')}`,
          address: `${studentCount} Main Street, City`
        }
      });
      guardians.push(guardian);
      studentCount++;
    }
  }

  // Create enrollments
  console.log('📋 Creating enrollments...');
  const enrollments = [];
  for (const student of students) {
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: student.id,
        sectionId: student.sectionId,
        startDate: '2024-09-01',
        status: 'ACTIVE'
      }
    });
    enrollments.push(enrollment);
  }

  // Create admission applications
  console.log('📄 Creating admission applications...');
  const applications = [];
  const applicationStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED'];
  
  for (let i = 1; i <= 20; i++) {
    const application = await prisma.application.create({
      data: {
        studentProfileRef: `PROFILE${String(i).padStart(4, '0')}`,
        status: applicationStatuses[i % applicationStatuses.length],
        score: Math.floor(Math.random() * 100),
        priorityTag: i % 3 === 0 ? 'HIGH' : i % 3 === 1 ? 'MEDIUM' : 'LOW'
      }
    });
    applications.push(application);
  }

  // Create attendance records
  console.log('✅ Creating attendance records...');
  const attendanceStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
  const today = new Date();
  
  for (let day = 0; day < 10; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() - day);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    for (const student of students.slice(0, 50)) {
      await prisma.attendanceRecord.create({
        data: {
          studentId: student.id,
          date: date.toISOString().split('T')[0],
          status: attendanceStatuses[Math.floor(Math.random() * attendanceStatuses.length)],
          reason: Math.random() > 0.8 ? 'Late arrival' : null
        }
      });
    }
  }

  // Create subjects
  console.log('📖 Creating subjects...');
  const subjectList = [];
  const subjectData = [
    { name: 'Mathematics', code: 'MATH', credits: 4 },
    { name: 'English Language', code: 'ENG', credits: 4 },
    { name: 'Science', code: 'SCI', credits: 4 },
    { name: 'Social Studies', code: 'SOC', credits: 3 },
    { name: 'Physical Education', code: 'PE', credits: 2 },
    { name: 'Art', code: 'ART', credits: 2 },
    { name: 'Computer Science', code: 'CS', credits: 3 }
  ];
  
  for (const subject of subjectData) {
    const sub = await prisma.subject.create({
      data: subject
    });
    subjectList.push(sub);
  }

  // Create exams
  console.log('📊 Creating exams...');
  const exams = [];
  const examTypes = ['Mid-term', 'Final', 'Quiz'];
  
  for (const cls of classes.slice(0, 5)) {
    for (const examType of examTypes) {
      const exam = await prisma.exam.create({
        data: {
          name: `${cls.name} ${examType} Exam`,
          type: examType,
          classId: cls.id,
          startDate: '2024-10-01',
          endDate: '2024-10-05',
          totalMarks: 100,
          passingMarks: 40
        }
      });
      exams.push(exam);
    }
  }

  // Create marks entries
  console.log('✏️ Creating marks entries...');
  const grades = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];
  
  for (const exam of exams.slice(0, 5)) {
    for (const student of students.slice(0, 20)) {
      for (const subject of subjectList.slice(0, 3)) {
        const marksObtained = Math.floor(Math.random() * 60) + 40;
        await prisma.marksEntry.create({
          data: {
            studentId: student.id,
            examId: exam.id,
            subjectId: subject.id,
            marksObtained,
            grade: grades[Math.floor(marksObtained / 12.5)],
            remarks: marksObtained >= 80 ? 'Excellent' : marksObtained >= 60 ? 'Good' : 'Needs Improvement'
          }
        });
      }
    }
  }

  // Create fee structures
  console.log('💰 Creating fee structures...');
  const feeStructures = [];
  for (const cls of classes) {
    const feeStructure = await prisma.feeStructure.create({
      data: {
        name: `${cls.name} Fee Structure 2024-25`,
        classId: cls.id,
        academicYear: '2024-2025',
        components: {
          tuition: 5000,
          lab: 500,
          library: 300,
          sports: 400,
          activities: 600
        },
        totalAmount: 6800
      }
    });
    feeStructures.push(feeStructure);
  }

  // Create fee schedules
  console.log('📅 Creating fee schedules...');
  const feeSchedules = [];
  const terms = ['Term 1', 'Term 2', 'Term 3'];
  
  for (const cls of classes) {
    for (const term of terms) {
      const feeSchedule = await prisma.feeSchedule.create({
        data: {
          name: `${cls.name} - ${term}`,
          classId: cls.id,
          term,
          dueDate: `2024-${String(terms.indexOf(term) * 3 + 9).padStart(2, '0')}-01`,
          amount: 2267 // Total divided by 3
        }
      });
      feeSchedules.push(feeSchedule);
    }
  }

  // Create invoices
  console.log('📜 Creating invoices...');
  const invoices = [];
  const invoiceStatuses = ['PENDING', 'PAID', 'OVERDUE', 'PARTIAL'];
  
  for (const student of students.slice(0, 50)) {
    for (let term = 1; term <= 2; term++) {
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNo: `INV${new Date().getFullYear()}${String(invoices.length + 1).padStart(4, '0')}`,
          studentId: student.id,
          period: `Term ${term} 2024`,
          amount: 2267,
          dueDate: `2024-${String(term * 3 + 6).padStart(2, '0')}-01`,
          status: invoiceStatuses[Math.floor(Math.random() * invoiceStatuses.length)],
          items: {
            tuition: 1667,
            lab: 167,
            library: 100,
            sports: 133,
            activities: 200
          }
        }
      });
      invoices.push(invoice);
    }
  }

  // Create payments
  console.log('💳 Creating payments...');
  const paymentMethods = ['CASH', 'CARD', 'BANK_TRANSFER', 'CHECK'];
  
  for (const invoice of invoices.filter(inv => ['PAID', 'PARTIAL'].includes(inv.status))) {
    const amount = invoice.status === 'PAID' ? invoice.amount : invoice.amount / 2;
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount,
        paymentDate: new Date().toISOString().split('T')[0],
        method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        referenceNo: `PAY${String(Math.floor(Math.random() * 100000)).padStart(6, '0')}`,
        status: 'COMPLETED'
      }
    });
  }

  // Display summary
  console.log('\n✅ Complete seed finished successfully!');
  console.log('\n📊 Database Summary:');
  console.log(`  - Classes: ${classes.length}`);
  console.log(`  - Sections: ${sections.length}`);
  console.log(`  - Staff: ${staff.length}`);
  console.log(`  - Teachers: ${teachers.length}`);
  console.log(`  - Students: ${students.length}`);
  console.log(`  - Guardians: ${guardians.length}`);
  console.log(`  - Enrollments: ${enrollments.length}`);
  console.log(`  - Applications: ${applications.length}`);
  console.log(`  - Attendance Records: ${await prisma.attendanceRecord.count()}`);
  console.log(`  - Subjects: ${subjectList.length}`);
  console.log(`  - Exams: ${exams.length}`);
  console.log(`  - Marks Entries: ${await prisma.marksEntry.count()}`);
  console.log(`  - Fee Structures: ${feeStructures.length}`);
  console.log(`  - Fee Schedules: ${feeSchedules.length}`);
  console.log(`  - Invoices: ${invoices.length}`);
  console.log(`  - Payments: ${await prisma.payment.count()}`);
}

async function cleanDatabase() {
  // Delete in reverse order of dependencies
  await prisma.payment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.feeSchedule.deleteMany({});
  await prisma.feeComponent.deleteMany({});
  await prisma.feeStructure.deleteMany({});
  await prisma.marksEntry.deleteMany({});
  await prisma.examSession.deleteMany({});
  await prisma.exam.deleteMany({});
  await prisma.attendanceRecord.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.guardian.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.staff.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.section.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.tenant.deleteMany({});
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });