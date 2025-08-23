import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Continuation script to add missing exam, marks, and attendance data
async function continueSeed() {
  console.log('🔄 Continuing seed - Adding missing exam, marks, and attendance data...');

  const branchId = 'branch1';

  // Check existing data
  const students = await prisma.student.findMany({ where: { branchId } });
  const classes = await prisma.class.findMany({ where: { branchId } });
  const academicYear = await prisma.academicYear.findFirst({ where: { branchId } });
  
  if (!academicYear) {
    console.log('❌ No academic year found. Cannot proceed.');
    return;
  }

  console.log(`📊 Found: ${students.length} students, ${classes.length} classes`);

  // Create subjects if they don't exist
  console.log('📖 Creating subjects...');
  const subjectNames = ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Computer Science', 'Physical Education', 'Art'];
  const subjects = [];
  
  for (const name of subjectNames) {
    try {
      const subject = await prisma.subject.create({
        data: {
          branchId,
          name,
          code: name.substring(0, 3).toUpperCase(),
          description: `${name} curriculum`,
          credits: faker.number.int({ min: 2, max: 5 })
        }
      });
      subjects.push(subject);
    } catch (error) {
      // Subject might already exist
      const existingSubject = await prisma.subject.findFirst({
        where: { branchId, name }
      });
      if (existingSubject) subjects.push(existingSubject);
    }
  }
  
  console.log(`✅ Created/found ${subjects.length} subjects`);

  // Create exams
  console.log('📝 Creating exams...');
  const examTypes = [
    { name: 'Unit Test 1', month: 5, weightage: 10, examTypeCode: 'UNIT_TEST_1' },
    { name: 'Mid Term Examination', month: 7, weightage: 30, examTypeCode: 'MID_TERM' },
    { name: 'Unit Test 2', month: 9, weightage: 10, examTypeCode: 'UNIT_TEST_2' },
    { name: 'Annual Examination', month: 2, weightage: 50, examTypeCode: 'ANNUAL' }
  ];

  const exams = [];
  for (const examType of examTypes) {
    try {
      const exam = await prisma.exam.create({
        data: {
          branchId,
          name: examType.name,
          academicYearId: academicYear.id,
          startDate: `2024-${String(examType.month).padStart(2, '0')}-15`,
          endDate: `2024-${String(examType.month).padStart(2, '0')}-25`,
          examType: examType.examTypeCode,
          weightagePercent: examType.weightage,
          maxMarks: 100,
          minPassingMarks: 35
        }
      });
      exams.push(exam);
    } catch (error) {
      console.log(`⚠️ Exam ${examType.name} might already exist, skipping...`);
    }
  }
  
  console.log(`✅ Created ${exams.length} exams`);

  // Create exam sessions
  console.log('📋 Creating exam sessions...');
  const examSessions = [];
  
  for (const exam of exams) {
    for (const cls of classes.slice(3)) { // Skip nursery classes
      const relevantSubjects = subjects.filter(subj => {
        // Match subjects to class levels
        if (cls.gradeLevel! <= 7) { // Primary classes
          return ['English', 'Hindi', 'Mathematics', 'Science', 'Computer Science'].includes(subj.name!);
        } else if (cls.gradeLevel! <= 10) { // Middle classes
          return ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Computer Science'].includes(subj.name!);
        } else { // Secondary classes
          return ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Physical Education'].includes(subj.name!);
        }
      });
      
      for (const subject of relevantSubjects) {
        try {
          const examSession = await prisma.examSession.create({
            data: {
              branchId,
              examId: exam.id,
              subjectId: subject.id,
              schedule: `2024-${String(exam.startDate!.split('-')[1])}-${faker.number.int({ min: 15, max: 25 })} 09:00-12:00`
            }
          });
          examSessions.push({ ...examSession, classId: cls.id, gradeLevel: cls.gradeLevel });
        } catch (error) {
          // Session might already exist
        }
      }
    }
  }
  
  console.log(`✅ Created ${examSessions.length} exam sessions`);

  // Create marks with realistic Indian grade distribution
  console.log('📊 Creating marks entries...');
  
  function generateRealisticMarks(): number {
    const rand = Math.random();
    if (rand < 0.15) return faker.number.int({ min: 90, max: 100 }); // Excellent (15%)
    else if (rand < 0.40) return faker.number.int({ min: 75, max: 89 }); // Good (25%)
    else if (rand < 0.75) return faker.number.int({ min: 60, max: 74 }); // Average (35%)
    else if (rand < 0.95) return faker.number.int({ min: 40, max: 59 }); // Below average (20%)
    else return faker.number.int({ min: 20, max: 39 }); // Failing (5%)
  }
  
  let marksCount = 0;
  for (const student of students) {
    const studentClass = classes.find(c => c.id === student.classId);
    if (!studentClass || studentClass.gradeLevel! < 3) continue; // Skip nursery classes
    
    // Get exam sessions for this student's class
    const studentExamSessions = examSessions.filter(es => es.classId === studentClass.id);
    
    for (const examSession of studentExamSessions) {
      const marks = generateRealisticMarks();
      const grade = marks >= 90 ? 'A+' : marks >= 80 ? 'A' : marks >= 70 ? 'B+' : 
                   marks >= 60 ? 'B' : marks >= 50 ? 'C+' : marks >= 40 ? 'C' : 
                   marks >= 35 ? 'D' : 'F';
      
      try {
        await prisma.marksEntry.create({
          data: {
            branchId,
            studentId: student.id,
            examSessionId: examSession.id,
            marksObtained: marks,
            maxMarks: 100,
            grade: grade,
            remarks: marks < 35 ? 'Needs improvement' : marks >= 90 ? 'Excellent performance' : 
                    marks >= 75 ? 'Good work' : 'Satisfactory'
          }
        });
        marksCount++;
        
        // Progress logging
        if (marksCount % 1000 === 0) {
          console.log(`   📈 Generated ${marksCount} marks entries...`);
        }
      } catch (error) {
        // Mark might already exist
      }
    }
  }
  
  console.log(`✅ Generated ${marksCount} marks entries`);

  // Create attendance records for last 60 days
  console.log('📅 Creating attendance records...');
  
  const today = new Date();
  const attendanceStartDate = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
  
  let attendanceCount = 0;
  const attendanceStats = { present: 0, absent: 0, late: 0 };
  
  // Indian school holidays
  const holidays = [
    '2024-08-15', // Independence Day
    '2024-07-17', // Muharram
    '2024-06-17', // Eid
    '2024-05-23', // Buddha Purnima
    '2024-05-01', // Labour Day
  ];
  
  for (const student of students) {
    const studentClass = classes.find(c => c.id === student.classId);
    if (!studentClass) continue;
    
    // Different attendance patterns based on grade level
    let absenteeRate = 0.08; // Base 8% absence rate
    if (studentClass.gradeLevel! <= 2) absenteeRate = 0.12; // Nursery kids more absent
    else if (studentClass.gradeLevel! >= 11) absenteeRate = 0.06; // Senior students more regular
    
    const lateRate = 0.05; // 5% late rate
    
    for (let d = new Date(attendanceStartDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      
      // Skip Sundays and holidays
      if (d.getDay() === 0 || holidays.includes(dateStr)) {
        continue;
      }
      
      let status = 'present';
      let reason = undefined;
      
      const attendanceRand = Math.random();
      
      if (attendanceRand < absenteeRate) {
        status = 'absent';
        reason = faker.helpers.arrayElement([
          'Sick/Fever',
          'Family function',
          'Medical appointment',
          'Out of station',
          'Weather/Transport issues',
          'Festival celebration'
        ]);
        attendanceStats.absent++;
      } else if (attendanceRand < absenteeRate + lateRate) {
        status = 'late';
        reason = faker.helpers.arrayElement([
          'Traffic jam',
          'Bus delay',
          'Overslept',
          'Medical checkup',
          'Family emergency'
        ]);
        attendanceStats.late++;
      } else {
        status = 'present';
        attendanceStats.present++;
      }
      
      try {
        await prisma.attendanceRecord.create({
          data: {
            branchId,
            studentId: student.id,
            date: dateStr,
            status: status,
            reason: reason
          }
        });
        attendanceCount++;
        
        // Progress logging
        if (attendanceCount % 5000 === 0) {
          console.log(`   📊 Generated ${attendanceCount} attendance records...`);
        }
      } catch (error) {
        // Attendance record might already exist for this date/student
      }
    }
  }
  
  console.log(`✅ Generated ${attendanceCount} attendance records`);
  console.log('   📈 Attendance Distribution:');
  console.log(`      ✅ Present: ${attendanceStats.present} (${((attendanceStats.present/attendanceCount)*100).toFixed(1)}%)`);
  console.log(`      ❌ Absent: ${attendanceStats.absent} (${((attendanceStats.absent/attendanceCount)*100).toFixed(1)}%)`);
  console.log(`      ⏰ Late: ${attendanceStats.late} (${((attendanceStats.late/attendanceCount)*100).toFixed(1)}%)`);

  console.log('🎉 Continuation seed completed successfully!');
  
  // Final validation
  const finalCounts = {
    students: await prisma.student.count({ where: { branchId } }),
    exams: await prisma.exam.count({ where: { branchId } }),
    examSessions: await prisma.examSession.count({ where: { branchId } }),
    marks: await prisma.marksEntry.count({ where: { branchId } }),
    invoices: await prisma.invoice.count({ where: { branchId } }),
    payments: await prisma.payment.count({ where: { branchId } }),
    attendance: await prisma.attendanceRecord.count({ where: { branchId } })
  };
  
  console.log('📊 Final Data Summary:');
  console.log(`   👨‍🎓 Students: ${finalCounts.students}`);
  console.log(`   📝 Exams: ${finalCounts.exams}`);
  console.log(`   📋 Exam Sessions: ${finalCounts.examSessions}`);
  console.log(`   📊 Marks Entries: ${finalCounts.marks}`);
  console.log(`   🧾 Invoices: ${finalCounts.invoices}`);
  console.log(`   💳 Payments: ${finalCounts.payments}`);
  console.log(`   📅 Attendance Records: ${finalCounts.attendance}`);
}

continueSeed()
  .catch((e) => {
    console.error('❌ Continuation seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });