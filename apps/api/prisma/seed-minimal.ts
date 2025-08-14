import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting minimal seed with additional data...');

  // Create some exams
  console.log('📊 Creating exams...');
  const exams = [];
  const classes = await prisma.class.findMany();
  
  for (const cls of classes.slice(0, 3)) {
    const exam = await prisma.exam.create({
      data: {
        name: `${cls.name} Mid-Term Exam`,
        startDate: '2024-10-01',
        endDate: '2024-10-05'
      }
    });
    exams.push(exam);
  }

  // Create exam sessions
  console.log('📝 Creating exam sessions...');
  const subjects = await prisma.subject.findMany();
  const sessions = [];
  
  for (const exam of exams) {
    for (const subject of subjects.slice(0, 3)) {
      const session = await prisma.examSession.create({
        data: {
          examId: exam.id,
          subjectId: subject.id,
          schedule: '09:00 AM - 12:00 PM'
        }
      });
      sessions.push(session);
    }
  }

  // Create marks entries
  console.log('✏️ Creating marks...');
  const students = await prisma.student.findMany({ take: 20 });
  
  for (const session of sessions.slice(0, 5)) {
    for (const student of students.slice(0, 10)) {
      await prisma.marksEntry.create({
        data: {
          studentId: student.id,
          sessionId: session.id,
          rawMarks: Math.floor(Math.random() * 60) + 40,
          grade: ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
        }
      });
    }
  }

  // Create fee structures with schedules
  console.log('💰 Creating fee structures and schedules...');
  for (const cls of classes.slice(0, 3)) {
    const feeStructure = await prisma.feeStructure.create({
      data: {
        gradeId: cls.id,
        schedules: {
          create: {
            classId: cls.id,
            recurrence: 'quarterly',
            dueDayOfMonth: 1,
            startDate: '2024-09-01',
            endDate: '2025-06-30',
            status: 'active'
          }
        }
      }
    });
  }

  // Create invoices
  console.log('📜 Creating invoices...');
  for (const student of students.slice(0, 10)) {
    await prisma.invoice.create({
      data: {
        studentId: student.id,
        period: 'Term 1 2024',
        amount: 5000,
        dueDate: '2024-09-15',
        status: ['PENDING', 'PAID'][Math.floor(Math.random() * 2)]
      }
    });
  }

  // Create payments
  console.log('💳 Creating payments...');
  const paidInvoices = await prisma.invoice.findMany({
    where: { status: 'PAID' },
    take: 5
  });
  
  for (const invoice of paidInvoices) {
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: invoice.amount || 5000,
        gateway: 'STRIPE',
        method: 'CARD',
        reference: `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`,
        status: 'COMPLETED'
      }
    });
  }

  // Create enrollments for students without them
  console.log('📋 Creating enrollments...');
  const studentsWithoutEnrollment = await prisma.student.findMany({
    where: {
      enrollments: {
        none: {}
      }
    },
    take: 20
  });

  for (const student of studentsWithoutEnrollment) {
    await prisma.enrollment.create({
      data: {
        studentId: student.id,
        sectionId: student.sectionId,
        startDate: '2024-09-01',
        status: 'ACTIVE'
      }
    });
  }

  // Create attendance records
  console.log('✅ Creating attendance records...');
  const today = new Date();
  const statuses = ['PRESENT', 'ABSENT', 'LATE'];
  
  for (let day = 0; day < 5; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() - day);
    const dateStr = date.toISOString().split('T')[0];
    
    for (const student of students.slice(0, 10)) {
      await prisma.attendanceRecord.create({
        data: {
          studentId: student.id,
          date: dateStr,
          status: statuses[Math.floor(Math.random() * statuses.length)]
        }
      });
    }
  }

  console.log('✅ Minimal seed completed!');
  
  // Display counts
  console.log('\n📊 Database Summary:');
  console.log(`  - Exams: ${await prisma.exam.count()}`);
  console.log(`  - Exam Sessions: ${await prisma.examSession.count()}`);
  console.log(`  - Marks Entries: ${await prisma.marksEntry.count()}`);
  console.log(`  - Fee Structures: ${await prisma.feeStructure.count()}`);
  console.log(`  - Fee Schedules: ${await prisma.feeSchedule.count()}`);
  console.log(`  - Invoices: ${await prisma.invoice.count()}`);
  console.log(`  - Payments: ${await prisma.payment.count()}`);
  console.log(`  - Enrollments: ${await prisma.enrollment.count()}`);
  console.log(`  - Attendance Records: ${await prisma.attendanceRecord.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });