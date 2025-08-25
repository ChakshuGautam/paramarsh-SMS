import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Quick seed script to add missing critical data
async function quickSeed() {
  console.log('🚀 Quick seed - Adding missing critical data...');

  // Check if we have students first
  const studentCount = await prisma.student.count();
  const students = await prisma.student.findMany({ take: 100 }); // Get first 100 students
  
  if (studentCount === 0) {
    console.log('❌ No students found. Please run the full seed first.');
    return;
  }
  
  console.log(`✅ Found ${studentCount} students, proceeding with missing data...`);

  // Create Academic Year if not exists
  let academicYear = await prisma.academicYear.findFirst();
  if (!academicYear) {
    academicYear = await prisma.academicYear.create({
      data: {
        name: '2024-2025',
        startDate: '2024-04-01',
        endDate: '2025-03-31',
        isActive: true,
        branchId: 'branch1'
      }
    });
  }

  // Create Exams
  console.log('📝 Creating exams...');
  const examTypes = [
    { name: 'Unit Test 1', month: 5, weightage: 10 },
    { name: 'Mid Term', month: 7, weightage: 30 },
    { name: 'Unit Test 2', month: 9, weightage: 10 },
    { name: 'Final Exam', month: 2, weightage: 50 }
  ];

  const exams = [];
  for (const examType of examTypes) {
    const exam = await prisma.exam.create({
      data: {
        branchId: 'branch1',
        name: examType.name,
        academicYearId: academicYear.id,
        startDate: `2024-${String(examType.month).padStart(2, '0')}-15`,
        endDate: `2024-${String(examType.month).padStart(2, '0')}-25`,
        examType: examType.name.toUpperCase().replace(' ', '_'),
        weightagePercent: examType.weightage,
        maxMarks: 100,
        minPassingMarks: 35
      }
    });
    exams.push(exam);
  }
  console.log(`✅ Created ${exams.length} exams`);

  // Create Exam Sessions
  console.log('📋 Creating exam sessions...');
  let sessionCount = 0;
  const classes = await prisma.class.findMany();
  
  // Create simple subjects if they don't exist
  const subjects = ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies'];
  const createdSubjects = [];
  
  for (const subjectName of subjects) {
    const subject = await prisma.subject.create({
      data: {
        branchId: 'branch1',
        name: subjectName,
        code: subjectName.substring(0, 3).toUpperCase(),
        description: `${subjectName} curriculum`
      }
    });
    createdSubjects.push(subject);
  }

  for (const exam of exams) {
    for (const cls of classes.slice(3)) { // Skip nursery classes
      for (const subject of createdSubjects) {
        await prisma.examSession.create({
          data: {
            branchId: 'branch1',
            examId: exam.id,
            subjectId: subject.id,
            schedule: `2024-${String(exam.startDate!.split('-')[1])}-${faker.number.int({ min: 15, max: 25 })} 09:00-12:00`
          }
        });
        sessionCount++;
      }
    }
  }
  console.log(`✅ Created ${sessionCount} exam sessions`);

  // Create Marks
  console.log('📊 Creating marks...');
  const examSessions = await prisma.examSession.findMany({
    include: { exam: true, subject: true }
  });
  
  let marksCount = 0;
  for (const student of students) {
    const studentClass = await prisma.class.findUnique({
      where: { id: student.classId! }
    });
    
    if (!studentClass || studentClass.gradeLevel! < 3) continue;
    
    for (const session of examSessions) {
      // Generate realistic marks
      const rand = Math.random();
      let marks = 0;
      if (rand < 0.15) marks = faker.number.int({ min: 90, max: 100 }); // Excellent
      else if (rand < 0.40) marks = faker.number.int({ min: 75, max: 89 }); // Good  
      else if (rand < 0.75) marks = faker.number.int({ min: 60, max: 74 }); // Average
      else if (rand < 0.95) marks = faker.number.int({ min: 40, max: 59 }); // Below average
      else marks = faker.number.int({ min: 20, max: 39 }); // Failing
      
      const grade = marks >= 90 ? 'A+' : marks >= 80 ? 'A' : marks >= 70 ? 'B+' : 
                   marks >= 60 ? 'B' : marks >= 50 ? 'C+' : marks >= 40 ? 'C' : 
                   marks >= 35 ? 'D' : 'F';
      
      await prisma.marksEntry.create({
        data: {
          branchId: 'branch1',
          studentId: student.id,
          examSessionId: session.id,
          marksObtained: marks,
          maxMarks: 100,
          grade: grade
        }
      });
      marksCount++;
    }
  }
  console.log(`✅ Created ${marksCount} marks entries`);

  // Create Fee Structures and Invoices
  console.log('💰 Creating fee structures and invoices...');
  let invoiceCount = 0;
  
  for (const cls of classes) {
    // Create fee structure for each class
    const feeStructure = await prisma.feeStructure.create({
      data: {
        branchId: 'branch1',
        gradeId: cls.id
      }
    });
    
    // Create fee components
    const monthlyFee = cls.gradeLevel! <= 7 ? 8000 : cls.gradeLevel! <= 10 ? 12000 : 15000;
    
    await prisma.feeComponent.create({
      data: {
        branchId: 'branch1',
        feeStructureId: feeStructure.id,
        name: 'Monthly Fee',
        amount: monthlyFee,
        type: 'MONTHLY'
      }
    });
  }
  
  // Create invoices for all students
  const allStudents = await prisma.student.findMany({
    include: { class: true }
  });
  
  for (const student of allStudents) {
    if (!student.class) continue;
    
    const monthlyAmount = student.class.gradeLevel! <= 7 ? 8000 : 
                         student.class.gradeLevel! <= 10 ? 12000 : 15000;
    
    // Create invoices for 6 months
    for (let month = 4; month <= 9; month++) {
      const monthName = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'][month];
      
      const invoice = await prisma.invoice.create({
        data: {
          branchId: 'branch1',
          studentId: student.id,
          period: `${monthName} 2024`,
          amount: monthlyAmount,
          dueDate: `2024-${String(month).padStart(2, '0')}-10`,
          status: 'PENDING'
        }
      });
      invoiceCount++;
      
      // Create payments for 70% of invoices
      if (Math.random() < 0.7) {
        const paymentMethods = ['UPI', 'NEFT', 'CASH', 'CHEQUE'];
        const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        
        await prisma.payment.create({
          data: {
            branchId: 'branch1',
            invoiceId: invoice.id,
            amount: monthlyAmount,
            method: method,
            gateway: method === 'UPI' ? 'PhonePe' : method === 'NEFT' ? 'Bank Transfer' : 
                    method === 'CASH' ? 'Cash Counter' : 'Bank Cheque',
            reference: `TXN${faker.number.int({ min: 100000000, max: 999999999 })}`,
            status: 'SUCCESS'
          }
        });
        
        // Update invoice status
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: 'PAID' }
        });
      }
    }
  }
  
  console.log(`✅ Created ${invoiceCount} invoices`);

  // Create Attendance Records
  console.log('📅 Creating attendance records...');
  const today = new Date();
  const startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
  
  let attendanceCount = 0;
  for (const student of allStudents) {
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 0) { // Skip Sundays
        const isPresent = Math.random() > 0.12; // 88% attendance rate
        
        await prisma.attendanceRecord.create({
          data: {
            branchId: 'branch1',
            studentId: student.id,
            date: d.toISOString().split('T')[0],
            status: isPresent ? 'present' : Math.random() > 0.7 ? 'absent' : 'late',
            reason: !isPresent ? (Math.random() > 0.5 ? 'Sick' : 'Family emergency') : undefined
          }
        });
        attendanceCount++;
      }
    }
  }
  
  console.log(`✅ Created ${attendanceCount} attendance records`);

  console.log('🎉 Quick seed completed successfully!');
  
  // Final count
  const counts = {
    students: await prisma.student.count(),
    exams: await prisma.exam.count(),
    examSessions: await prisma.examSession.count(),
    marks: await prisma.marksEntry.count(),
    invoices: await prisma.invoice.count(),
    payments: await prisma.payment.count(),
    attendance: await prisma.attendanceRecord.count()
  };
  
  console.log('📊 Final Data Summary:');
  console.log(`   👨‍🎓 Students: ${counts.students}`);
  console.log(`   📝 Exams: ${counts.exams}`);
  console.log(`   📋 Exam Sessions: ${counts.examSessions}`);
  console.log(`   📊 Marks Entries: ${counts.marks}`);
  console.log(`   🧾 Invoices: ${counts.invoices}`);
  console.log(`   💳 Payments: ${counts.payments}`);
  console.log(`   📅 Attendance Records: ${counts.attendance}`);
}

quickSeed()
  .catch((e) => {
    console.error('❌ Quick seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });