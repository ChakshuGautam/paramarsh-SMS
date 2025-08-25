import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function createMinimalSeedData() {
  console.log('🎯 Creating minimal seed data for testing...');

  const branchId = 'branch1';

  try {
    // 1. Create Tenant
    const tenant = await prisma.tenant.create({
      data: {
        id: branchId,
        name: 'Delhi Public School - Main Branch',
        subdomain: 'dps-main'
      }
    });
    console.log('✅ Created tenant');

    // 2. Create Academic Year
    const academicYear = await prisma.academicYear.create({
      data: {
        name: '2024-2025',
        startDate: '2024-04-01',
        endDate: '2025-03-31',
        isActive: true,
        branchId: branchId
      }
    });
    console.log('✅ Created academic year');

    // 3. Create Classes
    const classData = [
      { name: 'Class 1', gradeLevel: 3 },
      { name: 'Class 2', gradeLevel: 4 },
      { name: 'Class 3', gradeLevel: 5 },
      { name: 'Class 4', gradeLevel: 6 },
      { name: 'Class 5', gradeLevel: 7 }
    ];

    const classes = [];
    for (const cls of classData) {
      const createdClass = await prisma.class.create({
        data: {
          branchId: branchId,
          name: cls.name,
          gradeLevel: cls.gradeLevel
        }
      });
      classes.push(createdClass);
    }
    console.log(`✅ Created ${classes.length} classes`);

    // 4. Create Sections
    const sections = [];
    for (const cls of classes) {
      const section = await prisma.section.create({
        data: {
          branchId: branchId,
          name: `${cls.name} - A`,
          classId: cls.id,
          capacity: 40
        }
      });
      sections.push(section);
    }
    console.log(`✅ Created ${sections.length} sections`);

    // 5. Create Students (50 per class = 250 total)
    const indianFirstNames = ['Aarav', 'Arjun', 'Saanvi', 'Aadhya', 'Vivaan', 'Diya', 'Ishaan', 'Kavya'];
    const indianLastNames = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Patel', 'Khan', 'Reddy', 'Nair'];
    
    const students = [];
    let admissionNumber = 2024001;

    for (const section of sections) {
      const cls = classes.find(c => c.id === section.classId)!;
      
      for (let i = 0; i < 50; i++) {
        const firstName = faker.helpers.arrayElement(indianFirstNames);
        const lastName = faker.helpers.arrayElement(indianLastNames);
        const birthYear = new Date().getFullYear() - (cls.gradeLevel + 3);

        const student = await prisma.student.create({
          data: {
            branchId: branchId,
            admissionNo: `2024/${String(admissionNumber++).padStart(4, '0')}`,
            rollNumber: String(i + 1).padStart(2, '0'),
            firstName: firstName,
            lastName: lastName,
            dob: `${birthYear}-${faker.number.int({min: 1, max: 12}).toString().padStart(2, '0')}-${faker.number.int({min: 1, max: 28}).toString().padStart(2, '0')}`,
            gender: faker.datatype.boolean() ? 'male' : 'female',
            classId: cls.id,
            sectionId: section.id,
            status: 'active'
          }
        });
        students.push(student);
      }
    }
    console.log(`✅ Created ${students.length} students`);

    // 6. Create Guardians
    const guardians = [];
    for (const student of students) {
      // Create father
      const father = await prisma.guardian.create({
        data: {
          branchId: branchId,
          name: `${faker.helpers.arrayElement(indianFirstNames)} ${student.lastName}`,
          email: `${student.firstName.toLowerCase()}.father@gmail.com`,
          phoneNumber: `+91-9${faker.number.int({min: 100000000, max: 999999999})}`,
          address: `${faker.number.int({min: 1, max: 999})} MG Road, Delhi`,
          occupation: faker.helpers.arrayElement(['Software Engineer', 'Doctor', 'Teacher', 'Business Owner'])
        }
      });
      
      await prisma.studentGuardian.create({
        data: {
          studentId: student.id,
          guardianId: father.id,
          relation: 'father',
          isPrimary: true
        }
      });
      
      guardians.push(father);
    }
    console.log(`✅ Created ${guardians.length} guardians`);

    // 7. Create Subjects
    const subjectNames = ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies'];
    const subjects = [];
    
    for (const name of subjectNames) {
      const subject = await prisma.subject.create({
        data: {
          branchId: branchId,
          name: name,
          code: name.substring(0, 3).toUpperCase(),
          description: `${name} curriculum`
        }
      });
      subjects.push(subject);
    }
    console.log(`✅ Created ${subjects.length} subjects`);

    // 8. Create Fee Structures and Components
    for (const cls of classes) {
      const feeStructure = await prisma.feeStructure.create({
        data: {
          branchId: branchId,
          gradeId: cls.id
        }
      });
      
      await prisma.feeComponent.create({
        data: {
          branchId: branchId,
          feeStructureId: feeStructure.id,
          name: 'Monthly Fee',
          amount: 8000 + (cls.gradeLevel * 500), // Increasing fee by grade
          type: 'MONTHLY'
        }
      });
    }
    console.log('✅ Created fee structures');

    // 9. Create Invoices (3 months per student = 750 total)
    const invoices = [];
    for (const student of students) {
      const studentClass = classes.find(c => c.id === student.classId)!;
      const monthlyAmount = 8000 + (studentClass.gradeLevel * 500);
      
      for (let month = 4; month <= 6; month++) { // Apr, May, Jun 2024
        const monthName = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][month];
        
        const invoice = await prisma.invoice.create({
          data: {
            branchId: branchId,
            studentId: student.id,
            period: `${monthName} 2024`,
            amount: monthlyAmount,
            dueDate: `2024-${String(month).padStart(2, '0')}-10`,
            status: 'PENDING'
          }
        });
        invoices.push(invoice);
      }
    }
    console.log(`✅ Created ${invoices.length} invoices`);

    // 10. Create Payments (70% of invoices)
    const paymentCount = Math.floor(invoices.length * 0.7);
    const payments = [];
    
    for (let i = 0; i < paymentCount; i++) {
      const invoice = invoices[i];
      const paymentMethods = ['UPI', 'NEFT', 'CASH', 'CHEQUE'];
      const method = faker.helpers.arrayElement(paymentMethods);
      const uniqueRef = `${method}${Date.now()}${i}`;
      
      const payment = await prisma.payment.create({
        data: {
          branchId: branchId,
          invoiceId: invoice.id,
          amount: invoice.amount,
          method: method,
          gateway: method === 'UPI' ? 'PhonePe' : method === 'NEFT' ? 'Bank Transfer' : 
                  method === 'CASH' ? 'Cash Counter' : 'Bank Cheque',
          reference: uniqueRef,
          status: 'SUCCESS'
        }
      });
      
      // Update invoice status
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'PAID' }
      });
      
      payments.push(payment);
    }
    console.log(`✅ Created ${payments.length} payments`);

    // 11. Create Exams
    const examTypes = [
      { name: 'Unit Test 1', month: 5 },
      { name: 'Mid Term', month: 7 },
      { name: 'Final Exam', month: 10 }
    ];

    const exams = [];
    for (const examType of examTypes) {
      const exam = await prisma.exam.create({
        data: {
          branchId: branchId,
          name: examType.name,
          academicYearId: academicYear.id,
          startDate: `2024-${String(examType.month).padStart(2, '0')}-15`,
          endDate: `2024-${String(examType.month).padStart(2, '0')}-25`,
          examType: examType.name.toUpperCase().replace(' ', '_'),
          weightagePercent: 100,
          maxMarks: 100,
          minPassingMarks: 35
        }
      });
      exams.push(exam);
    }
    console.log(`✅ Created ${exams.length} exams`);

    // 12. Create Exam Sessions
    const examSessions = [];
    for (const exam of exams) {
      for (const cls of classes) {
        for (const subject of subjects) {
          const examSession = await prisma.examSession.create({
            data: {
              branchId: branchId,
              examId: exam.id,
              subjectId: subject.id,
              schedule: `${exam.startDate} 09:00-12:00`
            }
          });
          examSessions.push({ ...examSession, classId: cls.id });
        }
      }
    }
    console.log(`✅ Created ${examSessions.length} exam sessions`);

    // 13. Create Marks (1 per student per exam session = ~3750 marks)
    let marksCount = 0;
    for (const student of students) {
      const studentClass = classes.find(c => c.id === student.classId)!;
      const relevantSessions = examSessions.filter(es => es.classId === studentClass.id);
      
      for (const session of relevantSessions) {
        // Generate realistic marks distribution
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
            branchId: branchId,
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

    // 14. Create Attendance (last 30 days)
    const today = new Date();
    const startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    let attendanceCount = 0;
    for (const student of students) {
      for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
        if (d.getDay() !== 0) { // Skip Sundays
          const isPresent = Math.random() > 0.1; // 90% attendance rate
          
          await prisma.attendanceRecord.create({
            data: {
              branchId: branchId,
              studentId: student.id,
              date: d.toISOString().split('T')[0],
              status: isPresent ? 'present' : (Math.random() > 0.7 ? 'absent' : 'late'),
              reason: !isPresent ? (Math.random() > 0.5 ? 'Sick' : 'Family emergency') : undefined
            }
          });
          attendanceCount++;
        }
      }
    }
    console.log(`✅ Created ${attendanceCount} attendance records`);

    // Final Summary
    console.log('\n🎉 Minimal seed data creation completed successfully!');
    console.log('📊 Summary:');
    console.log(`   👨‍🎓 Students: ${students.length}`);
    console.log(`   👨‍👩‍👦‍👦 Guardians: ${guardians.length}`);
    console.log(`   📚 Classes: ${classes.length}`);
    console.log(`   📖 Subjects: ${subjects.length}`);
    console.log(`   🧾 Invoices: ${invoices.length}`);
    console.log(`   💳 Payments: ${payments.length}`);
    console.log(`   📝 Exams: ${exams.length}`);
    console.log(`   📋 Exam Sessions: ${examSessions.length}`);
    console.log(`   📊 Marks Entries: ${marksCount}`);
    console.log(`   📅 Attendance Records: ${attendanceCount}`);

  } catch (error) {
    console.error('❌ Error creating seed data:', error);
    throw error;
  }
}

createMinimalSeedData()
  .catch((e) => {
    console.error('❌ Minimal seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });