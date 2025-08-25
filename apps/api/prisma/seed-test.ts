import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Starting test database seed...');

  // Clean existing test data in the correct order to avoid foreign key constraints
  console.log('🧹 Cleaning existing test data...');
  
  // Delete only test-branch data
  await prisma.message.deleteMany({ where: { branchId: 'test-branch' } });
  await prisma.campaign.deleteMany({ where: { branchId: 'test-branch' } });
  await prisma.template.deleteMany({ where: { branchId: 'test-branch' } });
  await prisma.preference.deleteMany({ where: { branchId: 'test-branch' } });
  await prisma.ticketMessage.deleteMany({ where: { ticket: { branchId: 'test-branch' } } });
  await prisma.ticketAttachment.deleteMany({ where: { ticket: { branchId: 'test-branch' } } });
  await prisma.ticket.deleteMany({ where: { branchId: 'test-branch' } });
  await prisma.payment.deleteMany({ where: { invoice: { student: { branchId: 'test-branch' } } } });
  await prisma.invoice.deleteMany({ where: { student: { branchId: 'test-branch' } } });
  await prisma.enrollment.deleteMany({ where: { branchId: 'test-branch' } });
  await prisma.studentGuardian.deleteMany({ where: { student: { branchId: 'test-branch' } } });
  await prisma.guardian.deleteMany({ where: { branchId: 'test-branch' } });
  await prisma.student.deleteMany({ where: { branchId: 'test-branch' } });
  await prisma.teacher.deleteMany({ where: { branchId: 'test-branch' } });
  await prisma.staff.deleteMany({ where: { branchId: 'test-branch' } });
  await prisma.subject.deleteMany({ where: { branchId: 'test-branch' } });
  await prisma.section.deleteMany({ where: { branchId: 'test-branch' } });
  await prisma.class.deleteMany({ where: { branchId: 'test-branch' } });
  await prisma.academicYear.deleteMany({ where: { branchId: 'test-branch' } });
  
  // Check if test tenant exists, if not create it
  const existingTenant = await prisma.tenant.findUnique({
    where: { id: 'test-branch' }
  });

  if (!existingTenant) {
    await prisma.tenant.create({
      data: {
        id: 'test-branch',
        name: 'Test Branch School',
        subdomain: 'test'
      }
    });
    console.log('✅ Created test tenant');
  }

  // Create test academic year
  const academicYear = await prisma.academicYear.create({
    data: {
      name: '2024-2025',
      startDate: '2024-04-01T00:00:00.000Z',
      endDate: '2025-03-31T00:00:00.000Z',
      isActive: true,
      branchId: 'test-branch'
    }
  });
  console.log('✅ Created test academic year');

  // Create test classes
  const testClasses = [];
  for (let i = 1; i <= 10; i++) {
    const cls = await prisma.class.create({
      data: {
        name: `Class ${i}`,
        gradeLevel: i + 2,
        branchId: 'test-branch'
      }
    });
    testClasses.push(cls);
  }
  console.log('✅ Created test classes');

  // Create test sections
  const sections = [];
  for (const cls of testClasses.slice(0, 5)) {
    const section = await prisma.section.create({
      data: {
        name: 'A',
        classId: cls.id,
        capacity: 30,
        branchId: 'test-branch'
      }
    });
    sections.push(section);
  }
  console.log('✅ Created test sections');

  // Create test staff
  const testStaff = [];
  for (let i = 1; i <= 5; i++) {
    const staff = await prisma.staff.create({
      data: {
        firstName: `TestTeacher${i}`,
        lastName: `Staff${i}`,
        email: `testteacher${i}@test.edu`,
        phone: `+91-9000000${i}00`,
        designation: 'Teacher',
        department: 'Test Department',
        employmentType: 'Full-time',
        joinDate: '2024-01-01T00:00:00.000Z',
        status: 'active',
        branchId: 'test-branch'
      }
    });
    testStaff.push(staff);
  }
  console.log('✅ Created test staff');

  // Create test teachers
  for (const staff of testStaff) {
    await prisma.teacher.create({
      data: {
        staffId: staff.id,
        subjects: 'Test Subject',
        qualifications: 'Test Qualification',
        experienceYears: 5,
        branchId: 'test-branch'
      }
    });
  }
  console.log('✅ Created test teachers');

  // Create test subjects (use upsert to handle existing codes)
  const subjects = ['MATH', 'SCI', 'ENG', 'HINDI'];
  for (const code of subjects) {
    await prisma.subject.upsert({
      where: { code },
      update: {
        branchId: 'test-branch'
      },
      create: {
        code,
        name: code === 'MATH' ? 'Mathematics' : 
              code === 'SCI' ? 'Science' :
              code === 'ENG' ? 'English' : 'Hindi',
        credits: 4,
        isElective: false,
        branchId: 'test-branch'
      }
    });
  }
  console.log('✅ Created test subjects');

  // Create test guardians
  const testGuardians = [];
  for (let i = 1; i <= 10; i++) {
    const guardian = await prisma.guardian.create({
      data: {
        name: `Mr. TestGuardian${i}`,
        email: `testguardian${i}@gmail.com`,
        phoneNumber: `+91-90000001${i.toString().padStart(2, '0')}`,
        address: `Test Address ${i}, Test City`,
        occupation: 'Test Occupation',
        branchId: 'test-branch'
      }
    });
    testGuardians.push(guardian);
  }
  console.log('✅ Created test guardians');

  // Create test students
  const testStudents = [];
  for (let i = 1; i <= 20; i++) {
    const student = await prisma.student.create({
      data: {
        admissionNo: `ADM2025${i.toString().padStart(8, '0')}`,
        firstName: `TestStudent${i}`,
        lastName: `Surname${i}`,
        dob: '2010-01-01T00:00:00.000Z',
        gender: i % 2 === 0 ? 'female' : 'male',
        classId: testClasses[Math.floor(i / 3) % testClasses.length].id,
        sectionId: sections[i % sections.length]?.id || sections[0].id,
        rollNumber: i.toString(),
        status: 'active',
        branchId: 'test-branch'
      }
    });
    testStudents.push(student);

    // Link to guardian
    await prisma.studentGuardian.create({
      data: {
        studentId: student.id,
        guardianId: testGuardians[i % testGuardians.length].id,
        relation: 'father',
        isPrimary: true
      }
    });
  }
  console.log('✅ Created test students with guardian relationships');

  // Create test enrollments
  for (const student of testStudents) {
    await prisma.enrollment.create({
      data: {
        studentId: student.id,
        sectionId: student.sectionId,
        academicYearId: academicYear.id,
        startDate: '2024-04-01T00:00:00.000Z',
        status: 'enrolled',
        branchId: 'test-branch'
      }
    });
  }
  console.log('✅ Created test enrollments');

  // Create test invoices
  for (const student of testStudents.slice(0, 10)) {
    const invoice = await prisma.invoice.create({
      data: {
        studentId: student.id,
        period: 'Q1 2024-25',
        amount: 5000,
        dueDate: '2024-07-05T00:00:00.000Z',
        status: 'PAID',
        branchId: 'test-branch'
      }
    });

    // Create payment for paid invoices
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: 5000,
        gateway: 'RAZORPAY',
        method: 'UPI',
        reference: `TEST${Date.now()}`,
        status: 'COMPLETED'
      }
    });
  }
  console.log('✅ Created test invoices and payments');

  // Create test templates
  const templates = [
    {
      name: 'Welcome Message',
      channel: 'email' as const,
      content: 'Welcome to {{school_name}}, {{student_name}}!',
      variables: JSON.stringify(['school_name', 'student_name'])
    },
    {
      name: 'Fee Reminder',
      channel: 'sms' as const,
      content: 'Dear {{parent_name}}, fee of {{amount}} is due by {{due_date}}.',
      variables: JSON.stringify(['parent_name', 'amount', 'due_date'])
    }
  ];

  const createdTemplates = [];
  for (const template of templates) {
    const created = await prisma.template.create({
      data: {
        ...template,
        branchId: 'test-branch'
      }
    });
    createdTemplates.push(created);
  }
  console.log('✅ Created test templates');

  // Create test campaigns
  await prisma.campaign.create({
    data: {
      name: 'Test Campaign',
      templateId: createdTemplates[0].id,
      audienceQuery: JSON.stringify({ classes: ['Class 1'] }),
      schedule: '2024-12-01T00:00:00.000Z',
      status: 'scheduled',
      branchId: 'test-branch'
    }
  });
  console.log('✅ Created test campaign');

  // Create test tickets
  await prisma.ticket.create({
    data: {
      ownerType: 'guardian',
      ownerId: testGuardians[0].id,
      category: 'technical',
      priority: 'normal',
      status: 'open',
      subject: 'Test Support Ticket',
      description: 'This is a test ticket.',
      branchId: 'test-branch'
    }
  });
  console.log('✅ Created test ticket');

  console.log('🎉 Test database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding test database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });