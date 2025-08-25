import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ========== ATTENDANCE DATA GENERATION FOR PARAMARSH SMS ==========
// Generates comprehensive attendance data including:
// - Timetable periods (weekly schedule)
// - Attendance sessions (daily sessions)
// - Student period attendance (individual records)
// - Teacher attendance (daily records)

const BRANCH_ID = 'dps-main'; // Delhi Public School - Main Campus

// Indian school timetable structure
const SCHOOL_SCHEDULE = {
  workingDays: [1, 2, 3, 4, 5, 6], // Monday to Saturday
  periods: [
    { periodNumber: 1, startTime: '08:00', endTime: '08:40' },
    { periodNumber: 2, startTime: '08:40', endTime: '09:20' },
    { periodNumber: 3, startTime: '09:20', endTime: '10:00' },
    { periodNumber: 4, startTime: '10:00', endTime: '10:40' },
    { periodNumber: 5, startTime: '10:40', endTime: '11:00', isBreak: true, breakType: 'SHORT' }, // Break
    { periodNumber: 6, startTime: '11:00', endTime: '11:40' },
    { periodNumber: 7, startTime: '11:40', endTime: '12:20' },
    { periodNumber: 8, startTime: '12:20', endTime: '13:00' },
    { periodNumber: 9, startTime: '13:00', endTime: '13:30', isBreak: true, breakType: 'LUNCH' }, // Lunch
    { periodNumber: 10, startTime: '13:30', endTime: '14:10' },
    { periodNumber: 11, startTime: '14:10', endTime: '14:50' },
    { periodNumber: 12, startTime: '14:50', endTime: '15:30' }
  ]
};

// Generate date range for attendance (last 30 days)
function generateDateRange(days: number): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Only include working days (Monday to Saturday)
    if (SCHOOL_SCHEDULE.workingDays.includes(date.getDay())) {
      dates.push(date);
    }
  }
  
  return dates;
}

// Get subject assignment for different class levels
function getSubjectsForClass(className: string, subjects: any[]): any[] {
  const coreSubjects = subjects.filter(s => s.name === 'English' || s.name === 'Hindi' || s.name === 'Mathematics');
  
  if (className.includes('Nursery') || className.includes('LKG') || className.includes('UKG')) {
    return subjects.filter(s => ['English', 'Hindi', 'Art & Craft', 'Music', 'Physical Education'].includes(s.name));
  }
  
  if (className.includes('Class 1') || className.includes('Class 2') || className.includes('Class 3')) {
    return subjects.filter(s => ['English', 'Hindi', 'Mathematics', 'Science', 'Art & Craft', 'Physical Education'].includes(s.name));
  }
  
  if (className.includes('Class 4') || className.includes('Class 5')) {
    return subjects.filter(s => ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Computer Science', 'Physical Education'].includes(s.name));
  }
  
  if (className.includes('Class 6') || className.includes('Class 7') || className.includes('Class 8')) {
    return subjects.filter(s => ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Computer Science', 'Art & Craft', 'Physical Education'].includes(s.name));
  }
  
  if (className.includes('Class 9') || className.includes('Class 10')) {
    return subjects.filter(s => ['English', 'Hindi', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Social Studies', 'Computer Science', 'Physical Education'].includes(s.name));
  }
  
  // Class 11 and 12 - more specialized
  return subjects.filter(s => ['English', 'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science', 'Physical Education'].includes(s.name));
}

async function generateTimetablePeriods() {
  console.log('📅 Generating timetable periods...');
  
  const academicYear = await prisma.academicYear.findFirst({
    where: { branchId: BRANCH_ID, isActive: true }
  });
  
  if (!academicYear) {
    throw new Error('No active academic year found for branch ' + BRANCH_ID);
  }
  
  const sections = await prisma.section.findMany({
    where: { branchId: BRANCH_ID },
    include: {
      class: true,
      homeroomTeacher: true
    }
  });
  
  const subjects = await prisma.subject.findMany({
    where: { branchId: BRANCH_ID }
  });
  
  const teachers = await prisma.teacher.findMany({
    where: { branchId: BRANCH_ID }
  });
  
  console.log(`Found ${sections.length} sections, ${subjects.length} subjects, ${teachers.length} teachers`);
  
  let periodsCreated = 0;
  
  for (const section of sections) {
    const classSubjects = getSubjectsForClass(section.class.name, subjects);
    console.log(`Creating timetable for ${section.class.name} ${section.name} with ${classSubjects.length} subjects`);
    
    for (const dayOfWeek of SCHOOL_SCHEDULE.workingDays) {
      const regularPeriods = SCHOOL_SCHEDULE.periods.filter(p => !p.isBreak);
      const teachingPeriods = regularPeriods.slice(0, 8); // 8 teaching periods per day
      
      let subjectIndex = 0;
      
      for (let i = 0; i < teachingPeriods.length; i++) {
        const period = teachingPeriods[i];
        const subject = classSubjects[subjectIndex % classSubjects.length];
        const teacher = teachers[Math.floor(Math.random() * teachers.length)];
        
        try {
          await prisma.timetablePeriod.create({
            data: {
              branchId: BRANCH_ID,
              sectionId: section.id,
              dayOfWeek: dayOfWeek,
              periodNumber: period.periodNumber,
              startTime: period.startTime,
              endTime: period.endTime,
              subjectId: subject.id,
              teacherId: teacher.id,
              isBreak: false,
              academicYearId: academicYear.id
            }
          });
          periodsCreated++;
        } catch (error) {
          console.log(`Warning: Could not create period for ${section.class.name} ${section.name} day ${dayOfWeek} period ${period.periodNumber}`);
        }
        
        subjectIndex++;
      }
      
      // Add break periods
      const breakPeriods = SCHOOL_SCHEDULE.periods.filter(p => p.isBreak);
      for (const breakPeriod of breakPeriods) {
        try {
          await prisma.timetablePeriod.create({
            data: {
              branchId: BRANCH_ID,
              sectionId: section.id,
              dayOfWeek: dayOfWeek,
              periodNumber: breakPeriod.periodNumber,
              startTime: breakPeriod.startTime,
              endTime: breakPeriod.endTime,
              isBreak: true,
              breakType: breakPeriod.breakType,
              academicYearId: academicYear.id
            }
          });
          periodsCreated++;
        } catch (error) {
          console.log(`Warning: Could not create break period for ${section.class.name} ${section.name}`);
        }
      }
    }
  }
  
  console.log(`✅ Created ${periodsCreated} timetable periods`);
}

async function generateAttendanceSessions() {
  console.log('📋 Generating attendance sessions...');
  
  const dates = generateDateRange(30); // Last 30 working days
  console.log(`Generating attendance sessions for ${dates.length} working days`);
  
  const timetablePeriods = await prisma.timetablePeriod.findMany({
    where: {
      branchId: BRANCH_ID,
      isBreak: false // Only teaching periods, not break periods
    },
    include: {
      section: { include: { class: true } },
      subject: true,
      teacher: true
    }
  });
  
  console.log(`Found ${timetablePeriods.length} timetable periods to create sessions for`);
  
  let sessionsCreated = 0;
  
  for (const date of dates) {
    const dayOfWeek = date.getDay();
    
    // Get periods for this day of week
    const dayPeriods = timetablePeriods.filter(p => p.dayOfWeek === dayOfWeek);
    
    for (const period of dayPeriods) {
      // Create session start and end times
      const sessionDate = new Date(date);
      const [startHour, startMin] = period.startTime.split(':').map(Number);
      const [endHour, endMin] = period.endTime.split(':').map(Number);
      
      const startTime = new Date(sessionDate);
      startTime.setHours(startHour, startMin, 0);
      
      const endTime = new Date(sessionDate);
      endTime.setHours(endHour, endMin, 0);
      
      // Randomly assign substitute teacher (10% chance)
      const actualTeacher = Math.random() < 0.1 
        ? await prisma.teacher.findFirst({ where: { branchId: BRANCH_ID, id: { not: period.teacherId } } })
        : null;
      
      try {
        await prisma.attendanceSession.create({
          data: {
            branchId: BRANCH_ID,
            date: sessionDate,
            periodId: period.id,
            sectionId: period.sectionId,
            subjectId: period.subjectId!,
            assignedTeacherId: period.teacherId!,
            actualTeacherId: actualTeacher?.id || period.teacherId!,
            startTime: startTime,
            endTime: endTime,
            status: 'completed' // Mark as completed for historical data
          }
        });
        sessionsCreated++;
      } catch (error) {
        console.log(`Warning: Could not create session for period ${period.id} on ${date.toISOString().split('T')[0]}`);
      }
    }
  }
  
  console.log(`✅ Created ${sessionsCreated} attendance sessions`);
}

async function generateStudentPeriodAttendance() {
  console.log('👥 Generating student period attendance...');
  
  const sessions = await prisma.attendanceSession.findMany({
    where: { branchId: BRANCH_ID },
    include: {
      section: true
    }
  });
  
  console.log(`Found ${sessions.length} sessions to generate attendance for`);
  
  // Get active students for each section
  const sectionStudents = new Map();
  for (const session of sessions) {
    if (!sectionStudents.has(session.sectionId)) {
      const students = await prisma.student.findMany({
        where: {
          branchId: BRANCH_ID,
          sectionId: session.sectionId,
          status: 'active'
        }
      });
      sectionStudents.set(session.sectionId, students);
    }
  }
  
  let attendanceRecordsCreated = 0;
  
  for (const session of sessions) {
    const students = sectionStudents.get(session.sectionId) || [];
    
    for (const student of students) {
      // Generate realistic attendance patterns
      const random = Math.random();
      let status = 'present';
      let minutesLate = null;
      let reason = null;
      
      if (random < 0.05) { // 5% absent
        status = 'absent';
        reason = ['Sick', 'Family function', 'Medical appointment', 'Personal work'][Math.floor(Math.random() * 4)];
      } else if (random < 0.08) { // 3% late
        status = 'late';
        minutesLate = Math.floor(Math.random() * 30) + 5; // 5-35 minutes late
        reason = 'Traffic delay';
      } else if (random < 0.10) { // 2% excused
        status = 'excused';
        reason = 'School activity';
      } else if (random < 0.105) { // 0.5% medical
        status = 'medical';
        reason = 'Sick leave';
      }
      
      try {
        await prisma.studentPeriodAttendance.create({
          data: {
            sessionId: session.id,
            studentId: student.id,
            status: status,
            minutesLate: minutesLate,
            reason: reason,
            markedAt: session.startTime || new Date(),
            markedBy: session.actualTeacherId
          }
        });
        attendanceRecordsCreated++;
      } catch (error) {
        // Skip duplicates
      }
    }
  }
  
  console.log(`✅ Created ${attendanceRecordsCreated} student attendance records`);
}

async function generateTeacherAttendance() {
  console.log('👨‍🏫 Generating teacher attendance...');
  
  const teachers = await prisma.teacher.findMany({
    where: { branchId: BRANCH_ID }
  });
  
  const dates = generateDateRange(30);
  console.log(`Generating teacher attendance for ${teachers.length} teachers over ${dates.length} days`);
  
  let teacherAttendanceCreated = 0;
  
  for (const teacher of teachers) {
    for (const date of dates) {
      const dateStr = date.toISOString().split('T')[0];
      
      // Generate realistic teacher attendance
      const random = Math.random();
      let status = 'PRESENT';
      let checkIn = '08:00';
      let checkOut = '15:30';
      let leaveType = null;
      let remarks = null;
      
      if (random < 0.02) { // 2% absent
        status = 'ABSENT';
        checkIn = null;
        checkOut = null;
        remarks = 'Sick leave';
      } else if (random < 0.04) { // 2% on leave
        status = 'ON_LEAVE';
        leaveType = ['CASUAL', 'SICK', 'EARNED'][Math.floor(Math.random() * 3)];
        checkIn = null;
        checkOut = null;
      } else if (random < 0.08) { // 4% late
        status = 'LATE';
        const lateMinutes = Math.floor(Math.random() * 60) + 10; // 10-70 minutes late
        const lateHour = Math.floor(lateMinutes / 60);
        const lateMins = lateMinutes % 60;
        checkIn = `${8 + lateHour}:${String(lateMins).padStart(2, '0')}`;
        remarks = 'Traffic/Personal reason';
      } else if (random < 0.12) { // 4% half day
        status = 'HALF_DAY';
        if (Math.random() < 0.5) {
          checkIn = '08:00';
          checkOut = '11:30';
          remarks = 'Half day - morning';
        } else {
          checkIn = '11:30';
          checkOut = '15:30';
          remarks = 'Half day - afternoon';
        }
      }
      
      try {
        await prisma.teacherAttendance.create({
          data: {
            branchId: BRANCH_ID,
            teacherId: teacher.id,
            date: dateStr,
            checkIn: checkIn,
            checkOut: checkOut,
            status: status,
            leaveType: leaveType,
            remarks: remarks
          }
        });
        teacherAttendanceCreated++;
      } catch (error) {
        // Skip duplicates
      }
    }
  }
  
  console.log(`✅ Created ${teacherAttendanceCreated} teacher attendance records`);
}

async function validateAttendanceData() {
  console.log('🔍 Validating generated attendance data...');
  
  const stats = {
    timetablePeriods: await prisma.timetablePeriod.count({ where: { branchId: BRANCH_ID } }),
    attendanceSessions: await prisma.attendanceSession.count({ where: { branchId: BRANCH_ID } }),
    studentAttendance: await prisma.studentPeriodAttendance.count(),
    teacherAttendance: await prisma.teacherAttendance.count({ where: { branchId: BRANCH_ID } }),
    students: await prisma.student.count({ where: { branchId: BRANCH_ID, status: 'active' } }),
    teachers: await prisma.teacher.count({ where: { branchId: BRANCH_ID } })
  };
  
  console.log('📊 ATTENDANCE DATA SUMMARY:');
  console.log('='.repeat(40));
  console.log(`🗓️  Timetable Periods: ${stats.timetablePeriods.toLocaleString()}`);
  console.log(`📋 Attendance Sessions: ${stats.attendanceSessions.toLocaleString()}`);
  console.log(`👥 Student Attendance Records: ${stats.studentAttendance.toLocaleString()}`);
  console.log(`👨‍🏫 Teacher Attendance Records: ${stats.teacherAttendance.toLocaleString()}`);
  console.log(`👨‍🎓 Active Students: ${stats.students.toLocaleString()}`);
  console.log(`👩‍🏫 Teachers: ${stats.teachers.toLocaleString()}`);
  
  // Calculate attendance rates
  const attendanceRates = await prisma.studentPeriodAttendance.groupBy({
    by: ['status'],
    _count: { status: true }
  });
  
  console.log('\n📈 STUDENT ATTENDANCE DISTRIBUTION:');
  console.log('='.repeat(40));
  for (const rate of attendanceRates) {
    const percentage = ((rate._count.status / stats.studentAttendance) * 100).toFixed(1);
    console.log(`${rate.status.toUpperCase()}: ${rate._count.status.toLocaleString()} (${percentage}%)`);
  }
  
  const teacherAttendanceRates = await prisma.teacherAttendance.groupBy({
    where: { branchId: BRANCH_ID },
    by: ['status'],
    _count: { status: true }
  });
  
  console.log('\n👨‍🏫 TEACHER ATTENDANCE DISTRIBUTION:');
  console.log('='.repeat(40));
  for (const rate of teacherAttendanceRates) {
    const percentage = ((rate._count.status / stats.teacherAttendance) * 100).toFixed(1);
    console.log(`${rate.status}: ${rate._count.status.toLocaleString()} (${percentage}%)`);
  }
  
  console.log('\n✅ VALIDATION COMPLETE!');
  console.log('🎯 Attendance data is ready for API testing');
}

async function main() {
  console.log('🎯 ATTENDANCE DATA GENERATION FOR PARAMARSH SMS');
  console.log('='.repeat(60));
  console.log(`🏫 Target Branch: ${BRANCH_ID}`);
  console.log(`📅 Period: Last 30 working days`);
  console.log(`⏰ School Hours: 8:00 AM - 3:30 PM (Indian schedule)`);
  
  try {
    // Step 1: Generate timetable periods (weekly schedule)
    await generateTimetablePeriods();
    
    // Step 2: Generate attendance sessions (daily sessions)
    await generateAttendanceSessions();
    
    // Step 3: Generate student attendance records
    await generateStudentPeriodAttendance();
    
    // Step 4: Generate teacher attendance records
    await generateTeacherAttendance();
    
    // Step 5: Validate the generated data
    await validateAttendanceData();
    
    console.log('\n🎉 ATTENDANCE DATA GENERATION COMPLETED SUCCESSFULLY!');
    console.log('✨ The attendance endpoints should now return comprehensive data');
    
  } catch (error) {
    console.error('❌ Error generating attendance data:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });