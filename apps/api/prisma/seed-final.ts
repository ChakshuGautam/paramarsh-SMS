import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function finalSeed() {
  console.log('🚀 Final seed - Creating essential data...');

  const branchId = 'branch1';

  try {
    // 1. Create Tenant (skip if exists)
    let tenant;
    try {
      tenant = await prisma.tenant.create({
        data: {
          id: branchId,
          name: 'Delhi Public School - Main Branch',
          subdomain: 'dps-main'
        }
      });
      console.log('✅ Created tenant');
    } catch (error) {
      tenant = await prisma.tenant.findUnique({ where: { id: branchId } });
      console.log('✅ Tenant already exists');
    }

    // 2. Create Academic Year
    let academicYear;
    try {
      academicYear = await prisma.academicYear.create({
        data: {
          name: '2024-2025',
          startDate: '2024-04-01',
          endDate: '2025-03-31',
          isActive: true,
          branchId: branchId
        }
      });
      console.log('✅ Created academic year');
    } catch (error) {
      academicYear = await prisma.academicYear.findFirst({ 
        where: { branchId, name: '2024-2025' }
      });
      console.log('✅ Academic year already exists');
    }

    if (!academicYear) {
      console.log('❌ Could not create or find academic year');
      return;
    }

    // 3. Create Classes
    const classData = [
      { name: 'Class 1', gradeLevel: 3 },
      { name: 'Class 2', gradeLevel: 4 },
      { name: 'Class 3', gradeLevel: 5 }
    ];

    const classes = [];
    for (const cls of classData) {
      try {
        const createdClass = await prisma.class.create({
          data: {
            branchId: branchId,
            name: cls.name,
            gradeLevel: cls.gradeLevel
          }
        });
        classes.push(createdClass);
      } catch (error) {
        const existingClass = await prisma.class.findFirst({
          where: { branchId, name: cls.name }
        });
        if (existingClass) classes.push(existingClass);
      }
    }
    console.log(`✅ Created/found ${classes.length} classes`);

    // 4. Create Students (10 per class)
    const students = [];
    let admissionNumber = 2024001;

    for (const cls of classes) {
      for (let i = 0; i < 100; i++) { // 100 students per class
        try {
          const student = await prisma.student.create({
            data: {
              branchId: branchId,
              admissionNo: `2024/${String(admissionNumber++).padStart(4, '0')}`,
              firstName: `Student${i + 1}`,
              lastName: `Class${cls.gradeLevel}`,
              dob: `${2015 + cls.gradeLevel!}-06-15`,
              gender: i % 2 === 0 ? 'male' : 'female',
              classId: cls.id,
              status: 'active'
            }
          });
          students.push(student);
        } catch (error) {
          // Skip if exists
        }
      }
    }
    console.log(`✅ Created ${students.length} students`);

    // 5. Create Simple Exams
    const exams = [];
    const examData = [
      { name: 'Mid Term', month: '07' },
      { name: 'Final Exam', month: '03' }
    ];

    for (const examInfo of examData) {
      try {
        const exam = await prisma.exam.create({
          data: {
            branchId: branchId,
            name: examInfo.name,
            academicYearId: academicYear.id,
            startDate: `2024-${examInfo.month}-15`,
            endDate: `2024-${examInfo.month}-25`,
            examType: examInfo.name.replace(' ', '_').toUpperCase(),
            maxMarks: 100,
            minPassingMarks: 35
          }
        });
        exams.push(exam);
      } catch (error) {
        const existingExam = await prisma.exam.findFirst({
          where: { branchId, name: examInfo.name }
        });
        if (existingExam) exams.push(existingExam);
      }
    }
    console.log(`✅ Created ${exams.length} exams`);

    // 6. Create Basic Invoices (2 per student = 600 total)
    const invoices = [];
    for (let i = 0; i < Math.min(students.length, 100); i++) {
      const student = students[i];
      
      // Create 6 invoices per student
      for (let month = 4; month <= 9; month++) {
        try {
          const invoice = await prisma.invoice.create({
            data: {
              branchId: branchId,
              studentId: student.id,
              period: `2024-${month.toString().padStart(2, '0')}`,
              amount: 10000,
              dueDate: `2024-${month.toString().padStart(2, '0')}-10`,
              status: 'PENDING'
            }
          });
          invoices.push(invoice);
        } catch (error) {
          // Skip if exists
        }
      }
    }
    console.log(`✅ Created ${invoices.length} invoices`);

    // 7. Create Basic Payments (70% of invoices)
    const paymentCount = Math.floor(invoices.length * 0.7);
    let paymentsCreated = 0;

    for (let i = 0; i < paymentCount && i < invoices.length; i++) {
      const invoice = invoices[i];
      try {
        await prisma.payment.create({
          data: {
            branchId: branchId,
            invoiceId: invoice.id,
            amount: invoice.amount,
            method: 'UPI',
            gateway: 'PhonePe',
            reference: `UPI${Date.now()}${i}`,
            status: 'SUCCESS'
          }
        });

        // Update invoice status
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: 'PAID' }
        });

        paymentsCreated++;
      } catch (error) {
        // Skip if exists
      }
    }
    console.log(`✅ Created ${paymentsCreated} payments`);

    // 8. Create Basic Attendance (last 30 days for first 50 students)
    const today = new Date();
    const startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    let attendanceCount = 0;

    for (let i = 0; i < Math.min(students.length, 50); i++) {
      const student = students[i];
      
      for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
        if (d.getDay() !== 0) { // Skip Sundays
          try {
            await prisma.attendanceRecord.create({
              data: {
                branchId: branchId,
                studentId: student.id,
                date: d.toISOString().split('T')[0],
                status: Math.random() > 0.1 ? 'present' : 'absent'
              }
            });
            attendanceCount++;
          } catch (error) {
            // Skip if exists
          }
        }
      }
    }
    console.log(`✅ Created ${attendanceCount} attendance records`);

    // Final validation
    const finalCounts = {
      students: await prisma.student.count({ where: { branchId } }),
      invoices: await prisma.invoice.count({ where: { branchId } }),
      payments: await prisma.payment.count({ where: { branchId } }),
      exams: await prisma.exam.count({ where: { branchId } }),
      attendance: await prisma.attendanceRecord.count({ where: { branchId } })
    };

    console.log('\n🎉 Final seed completed successfully!');
    console.log('📊 Final Summary:');
    console.log(`   👨‍🎓 Students: ${finalCounts.students}`);
    console.log(`   🧾 Invoices: ${finalCounts.invoices}`);
    console.log(`   💳 Payments: ${finalCounts.payments}`);
    console.log(`   📝 Exams: ${finalCounts.exams}`);
    console.log(`   📅 Attendance Records: ${finalCounts.attendance}`);

    return finalCounts;

  } catch (error) {
    console.error('❌ Final seed failed:', error);
    throw error;
  }
}

finalSeed()
  .catch((e) => {
    console.error('❌ Final seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });