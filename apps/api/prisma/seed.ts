import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data in the correct order to avoid foreign key constraints
  console.log('🧹 Cleaning existing data...');
  await prisma.message.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.template.deleteMany({});
  await prisma.preference.deleteMany({});
  await prisma.ticketMessage.deleteMany({});
  await prisma.ticketAttachment.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.studentPeriodAttendance.deleteMany({});
  await prisma.attendanceSession.deleteMany({});
  await prisma.timetablePeriod.deleteMany({});
  await prisma.timeSlot.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.marksEntry.deleteMany({});
  await prisma.examSession.deleteMany({});
  await prisma.exam.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.staff.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.feeSchedule.deleteMany({});
  await prisma.feeComponent.deleteMany({});
  await prisma.feeStructure.deleteMany({});
  await prisma.attendanceRecord.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.studentGuardian.deleteMany({});
  await prisma.guardian.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.section.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.academicYear.deleteMany({});
  await prisma.tenant.deleteMany({});
  await prisma.application.deleteMany({});

  // Create tenant/branch
  console.log('🏢 Creating tenant...');
  const tenant = await prisma.tenant.create({
    data: {
      id: 'branch1',
      name: 'Sunrise International School',
      subdomain: 'sunrise'
    }
  });

  // Create academic year
  console.log('📅 Creating academic year...');
  const academicYear = await prisma.academicYear.create({
    data: {
      name: '2024-2025',
      startDate: '2024-04-01',
      endDate: '2025-03-31',
      isActive: true,
      branchId: tenant.id
    }
  });

  // Create classes with proper grade levels
  console.log('📚 Creating classes...');
  const classes = [];
  const classData = [
    { name: 'Nursery', gradeLevel: 0 },
    { name: 'LKG', gradeLevel: 1 },
    { name: 'UKG', gradeLevel: 2 },
    { name: 'Class 1', gradeLevel: 3 },
    { name: 'Class 2', gradeLevel: 4 },
    { name: 'Class 3', gradeLevel: 5 },
    { name: 'Class 4', gradeLevel: 6 },
    { name: 'Class 5', gradeLevel: 7 },
    { name: 'Class 6', gradeLevel: 8 },
    { name: 'Class 7', gradeLevel: 9 },
    { name: 'Class 8', gradeLevel: 10 },
    { name: 'Class 9', gradeLevel: 11 },
    { name: 'Class 10', gradeLevel: 12 }
  ];

  for (const classInfo of classData) {
    const cls = await prisma.class.create({
      data: {
        branchId: tenant.id,
        name: classInfo.name,
        gradeLevel: classInfo.gradeLevel
      }
    });
    classes.push(cls);
  }

  // Create staff members
  console.log('👨‍💼 Creating staff members...');
  const staffMembers = [];
  const staffData = [
    // Administrative staff
    { firstName: 'John', lastName: 'Smith', designation: 'Principal', department: 'Administration', employmentType: 'Full-time', level: 'Administration' },
    { firstName: 'Sarah', lastName: 'Johnson', designation: 'Vice Principal', department: 'Administration', employmentType: 'Full-time', level: 'Administration' },
    { firstName: 'Mary', lastName: 'White', designation: 'Secretary', department: 'Administration', employmentType: 'Full-time', level: 'Administration' },
    { firstName: 'Amanda', lastName: 'Thomas', designation: 'Librarian', department: 'Library', employmentType: 'Full-time', level: 'Support' },
    { firstName: 'Daniel', lastName: 'Jackson', designation: 'IT Support', department: 'Technology', employmentType: 'Full-time', level: 'Support' },
    { firstName: 'Raman', lastName: 'Gupta', designation: 'Accountant', department: 'Finance', employmentType: 'Full-time', level: 'Support' },
    
    // Nursery Level Teachers (Nursery, LKG, UKG)
    { firstName: 'Priya', lastName: 'Sharma', designation: 'Head Teacher', department: 'Nursery', employmentType: 'Full-time', level: 'Nursery' },
    { firstName: 'Sunita', lastName: 'Patel', designation: 'Teacher', department: 'Nursery', employmentType: 'Full-time', level: 'Nursery' },
    { firstName: 'Kavita', lastName: 'Singh', designation: 'Teacher', department: 'Nursery', employmentType: 'Full-time', level: 'Nursery' },
    { firstName: 'Neeta', lastName: 'Agarwal', designation: 'Teacher', department: 'Nursery', employmentType: 'Full-time', level: 'Nursery' },
    { firstName: 'Manjula', lastName: 'Reddy', designation: 'Teacher', department: 'Nursery', employmentType: 'Full-time', level: 'Nursery' },
    { firstName: 'Shanti', lastName: 'Nair', designation: 'Teacher', department: 'Nursery', employmentType: 'Full-time', level: 'Nursery' },
    { firstName: 'Usha', lastName: 'Iyer', designation: 'Teacher', department: 'Nursery', employmentType: 'Full-time', level: 'Nursery' },
    { firstName: 'Geeta', lastName: 'Desai', designation: 'Teacher', department: 'Nursery', employmentType: 'Full-time', level: 'Nursery' },
    
    // Primary Level Teachers (Class 1-5)
    { firstName: 'Michael', lastName: 'Brown', designation: 'Head Teacher', department: 'Primary', employmentType: 'Full-time', level: 'Primary' },
    { firstName: 'Rajesh', lastName: 'Kumar', designation: 'Teacher', department: 'Primary', employmentType: 'Full-time', level: 'Primary' },
    { firstName: 'Amit', lastName: 'Gupta', designation: 'Teacher', department: 'Primary', employmentType: 'Full-time', level: 'Primary' },
    { firstName: 'Rekha', lastName: 'Joshi', designation: 'Teacher', department: 'Primary', employmentType: 'Full-time', level: 'Primary' },
    { firstName: 'Sunil', lastName: 'Mehta', designation: 'Teacher', department: 'Primary', employmentType: 'Full-time', level: 'Primary' },
    { firstName: 'Lata', lastName: 'Bhat', designation: 'Teacher', department: 'Primary', employmentType: 'Full-time', level: 'Primary' },
    { firstName: 'Vinod', lastName: 'Shetty', designation: 'Teacher', department: 'Primary', employmentType: 'Full-time', level: 'Primary' },
    { firstName: 'Sudha', lastName: 'Hegde', designation: 'Teacher', department: 'Primary', employmentType: 'Full-time', level: 'Primary' },
    { firstName: 'Anil', lastName: 'Rao', designation: 'Teacher', department: 'Primary', employmentType: 'Full-time', level: 'Primary' },
    { firstName: 'Sushma', lastName: 'Naidu', designation: 'Teacher', department: 'Primary', employmentType: 'Full-time', level: 'Primary' },
    
    // Secondary Level Teachers (Class 6-8) - Subject Specialists
    { firstName: 'Emily', lastName: 'Davis', designation: 'Teacher', department: 'Mathematics', employmentType: 'Full-time', level: 'Secondary' },
    { firstName: 'Vikram', lastName: 'Agarwal', designation: 'Teacher', department: 'Mathematics', employmentType: 'Full-time', level: 'Secondary' },
    { firstName: 'Sanjay', lastName: 'Pillai', designation: 'Teacher', department: 'Mathematics', employmentType: 'Full-time', level: 'Secondary' },
    { firstName: 'David', lastName: 'Wilson', designation: 'Teacher', department: 'Science', employmentType: 'Full-time', level: 'Secondary' },
    { firstName: 'Neha', lastName: 'Verma', designation: 'Teacher', department: 'Science', employmentType: 'Full-time', level: 'Secondary' },
    { firstName: 'Ravi', lastName: 'Reddy', designation: 'Teacher', department: 'Science', employmentType: 'Full-time', level: 'Secondary' },
    { firstName: 'Deepika', lastName: 'Jain', designation: 'Teacher', department: 'Science', employmentType: 'Full-time', level: 'Secondary' },
    { firstName: 'Lisa', lastName: 'Garcia', designation: 'Teacher', department: 'English', employmentType: 'Full-time', level: 'Secondary' },
    { firstName: 'Anita', lastName: 'Jain', designation: 'Teacher', department: 'English', employmentType: 'Full-time', level: 'Secondary' },
    { firstName: 'Pooja', lastName: 'Singh', designation: 'Teacher', department: 'English', employmentType: 'Full-time', level: 'Secondary' },
    { firstName: 'Robert', lastName: 'Martinez', designation: 'Teacher', department: 'Social Studies', employmentType: 'Full-time', level: 'Secondary' },
    { firstName: 'Suresh', lastName: 'Nair', designation: 'Teacher', department: 'Social Studies', employmentType: 'Full-time', level: 'Secondary' },
    { firstName: 'Meera', lastName: 'Iyer', designation: 'Teacher', department: 'Hindi', employmentType: 'Full-time', level: 'Secondary' },
    { firstName: 'Deepak', lastName: 'Desai', designation: 'Teacher', department: 'Hindi', employmentType: 'Full-time', level: 'Secondary' },
    
    // Senior Secondary Teachers (Class 9-10) - Advanced Subject Specialists
    { firstName: 'Arjun', lastName: 'Shetty', designation: 'Teacher', department: 'Physics', employmentType: 'Full-time', level: 'Senior Secondary' },
    { firstName: 'Ramesh', lastName: 'Kulkarni', designation: 'Teacher', department: 'Physics', employmentType: 'Full-time', level: 'Senior Secondary' },
    { firstName: 'Pooja', lastName: 'Hegde', designation: 'Teacher', department: 'Chemistry', employmentType: 'Full-time', level: 'Senior Secondary' },
    { firstName: 'Sudhir', lastName: 'Patil', designation: 'Teacher', department: 'Chemistry', employmentType: 'Full-time', level: 'Senior Secondary' },
    { firstName: 'Kiran', lastName: 'Rao', designation: 'Teacher', department: 'Biology', employmentType: 'Full-time', level: 'Senior Secondary' },
    { firstName: 'Sanya', lastName: 'Bhat', designation: 'Teacher', department: 'Biology', employmentType: 'Full-time', level: 'Senior Secondary' },
    { firstName: 'Sanjay', lastName: 'Naidu', designation: 'Teacher', department: 'Economics', employmentType: 'Full-time', level: 'Senior Secondary' },
    { firstName: 'Pradeep', lastName: 'Sharma', designation: 'Teacher', department: 'Commerce', employmentType: 'Full-time', level: 'Senior Secondary' },
    { firstName: 'Rajni', lastName: 'Gupta', designation: 'Teacher', department: 'History', employmentType: 'Full-time', level: 'Senior Secondary' },
    { firstName: 'Mahesh', lastName: 'Patel', designation: 'Teacher', department: 'Geography', employmentType: 'Full-time', level: 'Senior Secondary' },
    
    // Specialist Teachers (All Levels)
    { firstName: 'Jennifer', lastName: 'Anderson', designation: 'Teacher', department: 'Art', employmentType: 'Part-time', level: 'All Levels' },
    { firstName: 'William', lastName: 'Taylor', designation: 'PE Teacher', department: 'Physical Education', employmentType: 'Full-time', level: 'All Levels' },
    { firstName: 'Rahul', lastName: 'Pillai', designation: 'Teacher', department: 'Computer Science', employmentType: 'Full-time', level: 'All Levels' },
    { firstName: 'Sangita', lastName: 'Joshi', designation: 'Teacher', department: 'Music', employmentType: 'Part-time', level: 'All Levels' },
    { firstName: 'Prakash', lastName: 'Mehta', designation: 'Teacher', department: 'Art', employmentType: 'Part-time', level: 'All Levels' },
    { firstName: 'Asha', lastName: 'Reddy', designation: 'PE Teacher', department: 'Physical Education', employmentType: 'Full-time', level: 'All Levels' }
  ];

  for (let i = 0; i < staffData.length; i++) {
    const staffInfo = staffData[i];
    const staff = await prisma.staff.create({
      data: {
        branchId: tenant.id,
        firstName: staffInfo.firstName,
        lastName: staffInfo.lastName,
        email: `${staffInfo.firstName.toLowerCase()}.${staffInfo.lastName.toLowerCase()}@sunrise.edu`,
        phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        designation: staffInfo.designation,
        department: staffInfo.department,
        employmentType: staffInfo.employmentType,
        joinDate: '2023-08-01',
        status: 'active'
      }
    });
    staffMembers.push(staff);
  }

  // Create teachers from eligible staff
  console.log('👨‍🏫 Creating teachers...');
  const teachers = [];
  const teacherEligibleStaff = staffMembers.filter(s => 
    s.designation === 'Teacher' || s.designation === 'Head Teacher' || s.designation === 'PE Teacher'
  );

  // Define level-specific subject assignments and profiles
  const levelBasedTeacherProfiles = {
    'Nursery': {
      subjects: ['Pre-Math', 'Pre-Reading', 'Activity Time', 'Play & Learn'],
      qualifications: ['B.Ed (Early Childhood)', 'Diploma in Nursery Education', 'B.A + B.Ed'],
      experienceRange: [2, 8]
    },
    'Primary': {
      subjects: ['Mathematics', 'Science', 'English', 'Hindi', 'Environmental Studies', 'Social Studies'],
      qualifications: ['B.Ed + B.A', 'M.Ed + B.A', 'B.Ed + B.Sc', 'B.El.Ed'],
      experienceRange: [3, 15]
    },
    'Secondary': {
      subjectSpecializations: {
        'Mathematics': ['Mathematics', 'General Mathematics'],
        'Science': ['General Science', 'Environmental Science'],
        'English': ['English', 'English Literature'],
        'Social Studies': ['Social Studies', 'History', 'Geography', 'Civics'],
        'Hindi': ['Hindi', 'Hindi Literature']
      },
      qualifications: {
        'Mathematics': ['M.Sc Mathematics + B.Ed', 'B.Sc Mathematics + B.Ed'],
        'Science': ['M.Sc Physics/Chemistry/Biology + B.Ed', 'B.Sc + B.Ed'],
        'English': ['M.A English + B.Ed', 'B.A English + B.Ed'],
        'Social Studies': ['M.A History/Geography + B.Ed', 'B.A + B.Ed'],
        'Hindi': ['M.A Hindi + B.Ed', 'B.A Hindi + B.Ed']
      },
      experienceRange: [4, 18]
    },
    'Senior Secondary': {
      subjectSpecializations: {
        'Physics': ['Physics', 'Applied Physics'],
        'Chemistry': ['Chemistry', 'Organic Chemistry'],
        'Biology': ['Biology', 'Botany', 'Zoology'],
        'Economics': ['Economics', 'Business Studies'],
        'Commerce': ['Commerce', 'Accountancy', 'Business Studies'],
        'History': ['History', 'Political Science'],
        'Geography': ['Geography', 'Environmental Science']
      },
      qualifications: {
        'Physics': ['M.Sc Physics + B.Ed', 'M.Tech + B.Ed'],
        'Chemistry': ['M.Sc Chemistry + B.Ed', 'M.Tech + B.Ed'],
        'Biology': ['M.Sc Biology/Botany/Zoology + B.Ed', 'M.Sc + B.Ed'],
        'Economics': ['M.A Economics + B.Ed', 'M.Com + B.Ed'],
        'Commerce': ['M.Com + B.Ed', 'MBA + B.Ed'],
        'History': ['M.A History + B.Ed', 'M.A Political Science + B.Ed'],
        'Geography': ['M.A Geography + B.Ed', 'M.Sc Geography + B.Ed']
      },
      experienceRange: [5, 20]
    },
    'All Levels': {
      subjectSpecializations: {
        'Art': ['Art & Craft', 'Drawing', 'Painting'],
        'Physical Education': ['Physical Education', 'Sports', 'Yoga'],
        'Computer Science': ['Computer Science', 'Information Technology'],
        'Music': ['Music', 'Vocal Music', 'Instrumental Music']
      },
      qualifications: {
        'Art': ['BFA + Diploma in Education', 'MA Fine Arts'],
        'Physical Education': ['B.P.Ed', 'M.P.Ed', 'B.P.E.S'],
        'Computer Science': ['MCA + B.Ed', 'B.Tech CS + B.Ed', 'M.Sc CS + B.Ed'],
        'Music': ['Diploma in Music', 'Bachelor of Music', 'Sangeet Visharad']
      },
      experienceRange: [1, 12]
    }
  };

  for (const staff of teacherEligibleStaff) {
    const level = staff.department; // Using department as level since staff doesn't have level field
    const department = staff.department;
    
    let subjects: string[] = [];
    let qualifications = '';
    let experienceYears = 5;

    if (level === 'Nursery') {
      const profile = levelBasedTeacherProfiles['Nursery'];
      subjects = profile.subjects.slice(0, 2); // 2 subjects for nursery teachers
      qualifications = profile.qualifications[Math.floor(Math.random() * profile.qualifications.length)];
      experienceYears = Math.floor(Math.random() * (profile.experienceRange[1] - profile.experienceRange[0] + 1)) + profile.experienceRange[0];
    } 
    else if (level === 'Primary') {
      const profile = levelBasedTeacherProfiles['Primary'];
      subjects = profile.subjects.slice(0, 3); // 3 subjects for primary teachers
      qualifications = profile.qualifications[Math.floor(Math.random() * profile.qualifications.length)];
      experienceYears = Math.floor(Math.random() * (profile.experienceRange[1] - profile.experienceRange[0] + 1)) + profile.experienceRange[0];
    }
    else if (level === 'Secondary') {
      const profile = levelBasedTeacherProfiles['Secondary'];
      if (department && profile.subjectSpecializations[department as keyof typeof profile.subjectSpecializations]) {
        subjects = profile.subjectSpecializations[department as keyof typeof profile.subjectSpecializations];
        const deptQualifications = profile.qualifications[department as keyof typeof profile.qualifications];
        qualifications = deptQualifications[Math.floor(Math.random() * deptQualifications.length)];
      } else {
        subjects = [department || 'General'];
        qualifications = 'B.A + B.Ed';
      }
      experienceYears = Math.floor(Math.random() * (profile.experienceRange[1] - profile.experienceRange[0] + 1)) + profile.experienceRange[0];
    }
    else if (level === 'Senior Secondary') {
      const profile = levelBasedTeacherProfiles['Senior Secondary'];
      if (department && profile.subjectSpecializations[department as keyof typeof profile.subjectSpecializations]) {
        subjects = profile.subjectSpecializations[department as keyof typeof profile.subjectSpecializations];
        const deptQualifications = profile.qualifications[department as keyof typeof profile.qualifications];
        qualifications = deptQualifications[Math.floor(Math.random() * deptQualifications.length)];
      } else {
        subjects = [department || 'General'];
        qualifications = 'M.A + B.Ed';
      }
      experienceYears = Math.floor(Math.random() * (profile.experienceRange[1] - profile.experienceRange[0] + 1)) + profile.experienceRange[0];
    }
    else if (level === 'All Levels') {
      const profile = levelBasedTeacherProfiles['All Levels'];
      if (department && profile.subjectSpecializations[department as keyof typeof profile.subjectSpecializations]) {
        subjects = profile.subjectSpecializations[department as keyof typeof profile.subjectSpecializations];
        const deptQualifications = profile.qualifications[department as keyof typeof profile.qualifications];
        qualifications = deptQualifications[Math.floor(Math.random() * deptQualifications.length)];
      } else {
        subjects = [department || 'General'];
        qualifications = 'Diploma in ' + (department || 'Education');
      }
      experienceYears = Math.floor(Math.random() * (profile.experienceRange[1] - profile.experienceRange[0] + 1)) + profile.experienceRange[0];
    }
    
    const teacher = await prisma.teacher.create({
      data: {
        branchId: tenant.id,
        staffId: staff.id,
        subjects: subjects.join(', '),
        qualifications: qualifications,
        experienceYears: experienceYears
      }
    });
    teachers.push(teacher);
  }

  // Create subjects
  console.log('📖 Creating subjects...');
  const subjects = [];
  const subjectData = [
    { code: 'MATH', name: 'Mathematics', credits: 4, isElective: false },
    { code: 'SCI', name: 'Science', credits: 4, isElective: false },
    { code: 'ENG', name: 'English', credits: 4, isElective: false },
    { code: 'HINDI', name: 'Hindi', credits: 3, isElective: false },
    { code: 'SS', name: 'Social Studies', credits: 3, isElective: false },
    { code: 'PE', name: 'Physical Education', credits: 2, isElective: false },
    { code: 'ART', name: 'Art & Craft', credits: 2, isElective: true },
    { code: 'MUS', name: 'Music', credits: 2, isElective: true },
    { code: 'COMP', name: 'Computer Science', credits: 3, isElective: true },
    { code: 'PHY', name: 'Physics', credits: 4, isElective: false },
    { code: 'CHEM', name: 'Chemistry', credits: 4, isElective: false },
    { code: 'BIO', name: 'Biology', credits: 4, isElective: false },
    { code: 'HIST', name: 'History', credits: 3, isElective: false },
    { code: 'GEO', name: 'Geography', credits: 3, isElective: false },
    { code: 'ECO', name: 'Economics', credits: 3, isElective: true }
  ];

  for (const subjectInfo of subjectData) {
    const subject = await prisma.subject.create({
      data: {
        branchId: tenant.id,
        code: subjectInfo.code,
        name: subjectInfo.name,
        credits: subjectInfo.credits,
        isElective: subjectInfo.isElective
      }
    });
    subjects.push(subject);
  }

  // Create rooms
  console.log('🏠 Creating rooms...');
  const rooms = [];
  const roomData = [
    { code: 'R101', name: 'Room 101', building: 'Main Block', floor: '1', capacity: 35, type: 'classroom' },
    { code: 'R102', name: 'Room 102', building: 'Main Block', floor: '1', capacity: 35, type: 'classroom' },
    { code: 'R103', name: 'Room 103', building: 'Main Block', floor: '1', capacity: 35, type: 'classroom' },
    { code: 'R201', name: 'Room 201', building: 'Main Block', floor: '2', capacity: 40, type: 'classroom' },
    { code: 'R202', name: 'Room 202', building: 'Main Block', floor: '2', capacity: 40, type: 'classroom' },
    { code: 'R203', name: 'Room 203', building: 'Main Block', floor: '2', capacity: 40, type: 'classroom' },
    { code: 'LAB1', name: 'Science Lab 1', building: 'Science Block', floor: '1', capacity: 30, type: 'lab' },
    { code: 'LAB2', name: 'Computer Lab', building: 'Science Block', floor: '2', capacity: 30, type: 'lab' },
    { code: 'LAB3', name: 'Physics Lab', building: 'Science Block', floor: '2', capacity: 25, type: 'lab' },
    { code: 'LAB4', name: 'Chemistry Lab', building: 'Science Block', floor: '3', capacity: 25, type: 'lab' },
    { code: 'AUD', name: 'Main Auditorium', building: 'Main Block', floor: 'G', capacity: 200, type: 'auditorium' },
    { code: 'GYM', name: 'Gymnasium', building: 'Sports Block', floor: 'G', capacity: 50, type: 'sports' },
    { code: 'LIB', name: 'Library', building: 'Main Block', floor: '3', capacity: 100, type: 'library' }
  ];

  for (const roomInfo of roomData) {
    const room = await prisma.room.create({
      data: {
        branchId: tenant.id,
        code: roomInfo.code,
        name: roomInfo.name,
        building: roomInfo.building,
        floor: roomInfo.floor,
        capacity: roomInfo.capacity,
        type: roomInfo.type,
        facilities: JSON.stringify(['projector', 'whiteboard', 'air_conditioning'])
      }
    });
    rooms.push(room);
  }

  // Create time slots
  console.log('⏰ Creating time slots...');
  const timeSlots: any[] = [];
  const timeSlotData = [
    { dayOfWeek: 1, startTime: '08:00', endTime: '08:45', slotType: 'regular', slotOrder: 1 },
    { dayOfWeek: 1, startTime: '08:45', endTime: '09:30', slotType: 'regular', slotOrder: 2 },
    { dayOfWeek: 1, startTime: '09:30', endTime: '09:45', slotType: 'break', slotOrder: 3 },
    { dayOfWeek: 1, startTime: '09:45', endTime: '10:30', slotType: 'regular', slotOrder: 4 },
    { dayOfWeek: 1, startTime: '10:30', endTime: '11:15', slotType: 'regular', slotOrder: 5 },
    { dayOfWeek: 1, startTime: '11:15', endTime: '12:00', slotType: 'regular', slotOrder: 6 },
    { dayOfWeek: 1, startTime: '12:00', endTime: '12:45', slotType: 'break', slotOrder: 7 },
    { dayOfWeek: 1, startTime: '12:45', endTime: '13:30', slotType: 'regular', slotOrder: 8 },
    { dayOfWeek: 1, startTime: '13:30', endTime: '14:15', slotType: 'regular', slotOrder: 9 }
  ];

  // Create time slots for Monday to Friday (1-5)
  for (let day = 1; day <= 5; day++) {
    for (const slotInfo of timeSlotData) {
      const timeSlot = await prisma.timeSlot.create({
        data: {
          branchId: tenant.id,
          dayOfWeek: day,
          startTime: slotInfo.startTime,
          endTime: slotInfo.endTime,
          slotType: slotInfo.slotType,
          slotOrder: slotInfo.slotOrder
        }
      });
      timeSlots.push(timeSlot);
    }
  }

  // Create sections for each class with homeroom teachers
  console.log('📝 Creating sections...');
  const sections = [];
  for (let i = 0; i < classes.length; i++) {
    const cls = classes[i];
    const gradeLevel = cls.gradeLevel ?? 0; // Default to 0 if null
    const sectionNames = gradeLevel <= 7 ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D']; // More sections for higher classes
    
    for (const sectionName of sectionNames) {
      const section = await prisma.section.create({
        data: {
          branchId: tenant.id,
          name: sectionName,
          classId: cls.id,
          capacity: gradeLevel <= 5 ? 25 : 35, // Smaller capacity for lower grades
          homeroomTeacherId: teachers[Math.floor(Math.random() * teachers.length)]?.id // Assign random homeroom teacher
        }
      });
      sections.push(section);
    }
  }

  // Create students with realistic data
  console.log('👨‍👩‍👧‍👦 Creating students...');
  const students = [];
  const firstNames = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
    'Saanvi', 'Ananya', 'Diya', 'Aadhya', 'Kavya', 'Priya', 'Riya', 'Anika', 'Ishika', 'Khushi',
    'Rohan', 'Rahul', 'Amit', 'Vikram', 'Karan', 'Nikhil', 'Akash', 'Yash', 'Dev', 'Om',
    'Neha', 'Shreya', 'Pooja', 'Swati', 'Nidhi', 'Simran', 'Tanvi', 'Meera', 'Aditi', 'Sakshi'
  ];
  const lastNames = [
    'Sharma', 'Verma', 'Agarwal', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Shah', 'Jain', 'Mehta',
    'Reddy', 'Rao', 'Nair', 'Iyer', 'Desai', 'Pillai', 'Naidu', 'Bhat', 'Shetty', 'Hegde'
  ];
  
  let studentCount = 1;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const cls = classes.find(c => c.id === section.classId);
    const studentsPerSection = Math.floor(Math.random() * 10) + 20; // 20-30 students per section
    
    for (let j = 0; j < studentsPerSection; j++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const birthYear = new Date().getFullYear() - (cls?.gradeLevel || 1) - 5;
      
      const student = await prisma.student.create({
        data: {
          branchId: tenant.id,
          admissionNo: `ADM${new Date().getFullYear()}${String(studentCount).padStart(4, '0')}`,
          firstName: firstName,
          lastName: lastName,
          dob: `${birthYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          gender: Math.random() > 0.5 ? 'male' : 'female',
          classId: section.classId,
          sectionId: section.id,
          rollNumber: String(j + 1),
          status: Math.random() > 0.95 ? (Math.random() > 0.5 ? 'inactive' : 'graduated') : 'active'
        }
      });
      students.push(student);
      studentCount++;
    }
  }

  // Create guardians and relationships (many-to-many)
  console.log('👨‍👩‍👧‍👦 Creating guardians and relationships...');
  const guardians: any[] = [];
  const guardianRelations = ['father', 'mother', 'guardian', 'grandfather', 'grandmother', 'uncle', 'aunt'];
  
  // Track families for siblings
  const families = new Map<string, { father?: any, mother?: any }>();
  
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const familyKey = `${student.lastName}_${Math.floor(i / 3)}`; // Group students into families
    
    // Check if this family already exists (for siblings)
    if (families.has(familyKey) && Math.random() > 0.7) { // 30% chance of siblings
      const family = families.get(familyKey)!;
      
      // Link to existing family guardians
      if (family.father) {
        await prisma.studentGuardian.create({
          data: {
            studentId: student.id,
            guardianId: family.father.id,
            relation: 'father',
            isPrimary: true,
            canPickup: true,
            emergencyContact: true
          }
        });
      }
      
      if (family.mother) {
        await prisma.studentGuardian.create({
          data: {
            studentId: student.id,
            guardianId: family.mother.id,
            relation: 'mother',
            isPrimary: false,
            canPickup: true,
            emergencyContact: true
          }
        });
      }
    } else {
      // Create new family
      const family: { father?: any, mother?: any } = {};
      const guardianCount = Math.random() > 0.2 ? 2 : 1; // 80% have both parents
      
      for (let j = 0; j < guardianCount; j++) {
        const relation = j === 0 ? 'father' : 'mother';
        const guardian = await prisma.guardian.create({
          data: {
            branchId: tenant.id,
            name: `${relation === 'father' ? 'Mr.' : 'Mrs.'} ${student.lastName}`,
            email: `${relation}.${student.lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@gmail.com`,
            phoneNumber: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            alternatePhoneNumber: Math.random() > 0.5 ? `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}` : null,
            address: `${Math.floor(Math.random() * 999) + 1}, ${['MG Road', 'Park Street', 'Mall Road', 'Gandhi Nagar'][Math.floor(Math.random() * 4)]}, ${['Mumbai', 'Delhi', 'Bangalore', 'Chennai'][Math.floor(Math.random() * 4)]}`,
            occupation: ['Engineer', 'Doctor', 'Teacher', 'Business', 'Lawyer', 'Accountant', 'Architect'][Math.floor(Math.random() * 7)]
          }
        });
        
        // Store in family object
        if (relation === 'father') family.father = guardian;
        else family.mother = guardian;
        
        // Create relationship
        await prisma.studentGuardian.create({
          data: {
            studentId: student.id,
            guardianId: guardian.id,
            relation: relation,
            isPrimary: j === 0,
            canPickup: true,
            emergencyContact: true
          }
        });
        
        guardians.push(guardian);
      }
      
      // Store family for potential siblings
      families.set(familyKey, family);
    }
  }

  // Create enrollments for all students
  console.log('📋 Creating enrollments...');
  for (const student of students) {
    if (student.sectionId) {
      await prisma.enrollment.create({
        data: {
          branchId: tenant.id,
          studentId: student.id,
          sectionId: student.sectionId,
          status: student.status === 'active' ? 'enrolled' : 
                  student.status === 'graduated' ? 'completed' : 'inactive',
          startDate: academicYear.startDate,
          endDate: student.status !== 'active' ? academicYear.endDate : undefined
        }
      });
    }
  }

  // Create exams
  console.log('📊 Creating exams...');
  const exams = [];
  const examTypes = [
    { name: 'Unit Test 1', startDate: '2024-06-15', endDate: '2024-06-20' },
    { name: 'Mid-Term Exam', startDate: '2024-10-01', endDate: '2024-10-10' },
    { name: 'Unit Test 2', startDate: '2024-12-01', endDate: '2024-12-05' },
    { name: 'Final Exam', startDate: '2025-03-01', endDate: '2025-03-15' }
  ];
  
  for (const examType of examTypes) {
    for (const cls of classes) {
      const exam = await prisma.exam.create({
        data: {
          name: `${cls.name} - ${examType.name}`,
          startDate: examType.startDate,
          endDate: examType.endDate
        }
      });
      exams.push(exam);
    }
  }

  // Create exam sessions
  console.log('📝 Creating exam sessions...');
  const examSessions = [];
  const sessionTimings = [
    '09:00 AM - 12:00 PM',
    '09:00 AM - 11:00 AM',
    '02:00 PM - 05:00 PM',
    '02:00 PM - 04:00 PM'
  ];
  
  for (const exam of exams.slice(0, 20)) { // Create sessions for first 20 exams
    const relevantSubjects = subjects.slice(0, 5 + Math.floor(Math.random() * 5)); // 5-10 subjects per exam
    
    for (const subject of relevantSubjects) {
      const session = await prisma.examSession.create({
        data: {
          examId: exam.id,
          subjectId: subject.id,
          schedule: sessionTimings[Math.floor(Math.random() * sessionTimings.length)]
        }
      });
      examSessions.push(session);
    }
  }

  // Create marks entries
  console.log('✏️ Creating marks entries...');
  const activeStudents = students.filter(s => s.status === 'active');
  for (const session of examSessions.slice(0, 50)) { // Create marks for first 50 sessions
    const studentsToGrade = activeStudents.slice(0, 30); // Grade 30 students per session
    
    for (const student of studentsToGrade) {
      const rawMarks = Math.floor(Math.random() * 60) + 40; // 40-100 marks
      await prisma.marksEntry.create({
        data: {
          studentId: student.id,
          sessionId: session.id,
          rawMarks: rawMarks,
          grade: rawMarks >= 90 ? 'A+' :
                 rawMarks >= 80 ? 'A' :
                 rawMarks >= 70 ? 'B' :
                 rawMarks >= 60 ? 'C' :
                 rawMarks >= 50 ? 'D' : 'F'
        }
      });
    }
  }

  // Create fee structures and schedules
  console.log('💰 Creating fee structures and schedules...');
  for (const cls of classes) {
    const gradeLevel = cls.gradeLevel ?? 0; // Default to 0 if null
    const baseFee = 3000 + (gradeLevel * 500); // Higher classes have higher fees
    
    const feeStructure = await prisma.feeStructure.create({
      data: {
        gradeId: cls.id,
        schedules: {
          create: {
            classId: cls.id,
            recurrence: 'quarterly',
            dueDayOfMonth: 5,
            startDate: academicYear.startDate,
            endDate: academicYear.endDate,
            status: 'active'
          }
        }
      }
    });
    
    // Create fee components
    await prisma.feeComponent.create({
      data: {
        branchId: tenant.id,
        feeStructureId: feeStructure.id,
        type: 'TUITION',
        name: 'Tuition Fee',
        amount: baseFee
      }
    });
    
    await prisma.feeComponent.create({
      data: {
        branchId: tenant.id,
        feeStructureId: feeStructure.id,
        type: 'LAB',
        name: 'Lab Fee',
        amount: gradeLevel >= 8 ? 1000 : 500
      }
    });
    
    await prisma.feeComponent.create({
      data: {
        branchId: tenant.id,
        feeStructureId: feeStructure.id,
        type: 'TRANSPORT',
        name: 'Transport Fee',
        amount: 1500
      }
    });
  }

  // Create invoices for active students
  console.log('📜 Creating invoices...');
  const quarters = [
    { period: 'Q1 2024-25', dueDate: '2024-07-05' },
    { period: 'Q2 2024-25', dueDate: '2024-10-05' },
    { period: 'Q3 2024-25', dueDate: '2025-01-05' },
    { period: 'Q4 2024-25', dueDate: '2025-04-05' }
  ];
  
  let paymentCounter = 1;
  for (const student of activeStudents.slice(0, 100)) { // Create invoices for first 100 active students
    const cls = classes.find(c => c.id === student.classId);
    const baseFee = 3000 + ((cls?.gradeLevel || 0) * 500);
    
    for (const quarter of quarters.slice(0, 2)) { // Create invoices for first 2 quarters
      const invoice = await prisma.invoice.create({
        data: {
          studentId: student.id,
          period: quarter.period,
          amount: baseFee + 1500, // Base fee + other charges
          dueDate: quarter.dueDate,
          status: Math.random() > 0.3 ? 'PAID' : 'PENDING' // 70% paid
        }
      });
      
      // Create payment for paid invoices
      if (invoice.status === 'PAID') {
        await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            amount: invoice.amount || baseFee + 1500,
            gateway: ['STRIPE', 'RAZORPAY', 'CASH'][Math.floor(Math.random() * 3)],
            method: ['CARD', 'UPI', 'NETBANKING', 'CASH'][Math.floor(Math.random() * 4)],
            reference: `PAY2024${String(paymentCounter++).padStart(6, '0')}`,
            status: 'COMPLETED'
          }
        });
      }
    }
  }

  // Create attendance records
  console.log('✅ Creating attendance records...');
  const today = new Date();
  const statuses = ['PRESENT', 'ABSENT', 'LATE', 'HOLIDAY'];
  
  // Create attendance for last 30 days
  for (let day = 0; day < 30; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() - day);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const dateStr = date.toISOString().split('T')[0];
    
    // Create attendance for a sample of students
    for (const student of activeStudents.slice(0, 200)) {
      const status = Math.random() > 0.9 ? 'ABSENT' : 
                     Math.random() > 0.95 ? 'LATE' : 'PRESENT';
      
      await prisma.attendanceRecord.create({
        data: {
          studentId: student.id,
          date: dateStr,
          status: status
        }
      });
    }
  }

  // Create timetable periods
  console.log('📅 Creating timetable periods...');
  const regularTimeSlots = timeSlots.filter(ts => ts.slotType === 'regular');
  const timetablePeriods = [];
  
  for (const section of sections.slice(0, 20)) { // Create timetable for first 20 sections
    const cls = classes.find(c => c.id === section.classId);
    const gradeLevel = cls?.gradeLevel || 0;
    
    // Select subjects based on grade level
    const sectionSubjects = gradeLevel <= 5 ? 
      subjects.filter(s => ['MATH', 'SCI', 'ENG', 'HINDI', 'ART', 'PE'].includes(s.code)) :
      subjects.filter(s => !['ART', 'MUS'].includes(s.code)).slice(0, 8);
    
    // Create periods for each day
    for (let day = 1; day <= 5; day++) {
      const daySlots = regularTimeSlots.filter(ts => ts.dayOfWeek === day);
      
      for (let i = 0; i < daySlots.length && i < sectionSubjects.length; i++) {
        const slot = daySlots[i];
        const subject = sectionSubjects[i % sectionSubjects.length];
        const teacher = teachers[Math.floor(Math.random() * teachers.length)];
        const room = rooms.filter(r => r.type === 'classroom')[Math.floor(Math.random() * 6)];
        
        const period = await prisma.timetablePeriod.create({
          data: {
            sectionId: section.id,
            subjectId: subject.id,
            teacherId: teacher.id,
            roomId: room.id,
            timeSlotId: slot.id
          }
        });
        timetablePeriods.push(period);
      }
    }
  }

  // Create attendance sessions from timetable
  console.log('📋 Creating attendance sessions...');
  const attendanceSessions = [];
  
  // Create sessions for the last 30 days
  for (let day = 0; day < 30; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() - day);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const dayOfWeek = date.getDay();
    
    // Get relevant periods for this day
    const dayPeriods = timetablePeriods.filter(period => {
      const timeSlot = timeSlots.find(ts => ts.id === period.timeSlotId);
      return timeSlot?.dayOfWeek === dayOfWeek && timeSlot?.slotType === 'regular';
    });
    
    for (const period of dayPeriods) {
      const session = await prisma.attendanceSession.create({
        data: {
          branchId: tenant.id,
          date: new Date(date),
          periodId: period.id,
          sectionId: period.sectionId,
          subjectId: period.subjectId,
          assignedTeacherId: period.teacherId,
          status: 'completed'
        }
      });
      attendanceSessions.push(session);
    }
  }

  // Create student period attendance records for the sessions
  console.log('👥 Creating student period attendance...');
  for (const session of attendanceSessions.slice(0, 100)) { // Create attendance for first 100 sessions
    const section = sections.find(s => s.id === session.sectionId);
    const sectionStudents = students.filter(s => s.sectionId === section?.id && s.status === 'active');
    
    for (const student of sectionStudents.slice(0, 25)) { // Limit to 25 students per session
      const status = Math.random() > 0.9 ? 'absent' : 
                     Math.random() > 0.95 ? 'late' : 'present';
      
      await prisma.studentPeriodAttendance.create({
        data: {
          sessionId: session.id,
          studentId: student.id,
          status: status,
          minutesLate: status === 'late' ? Math.floor(Math.random() * 30) + 5 : null,
          markedAt: new Date(session.date),
          markedBy: session.assignedTeacherId
        }
      });
    }
  }

  // Create message templates
  console.log('📧 Creating message templates...');
  const templates = [];
  const templateData = [
    {
      name: 'Welcome Message',
      channel: 'email',
      content: 'Welcome to {{school_name}}! We are excited to have {{student_name}} join us for the academic year {{year}}.',
      variables: JSON.stringify(['school_name', 'student_name', 'year'])
    },
    {
      name: 'Fee Reminder',
      channel: 'sms',
      content: 'Dear {{parent_name}}, fee payment of ₹{{amount}} for {{student_name}} is due by {{due_date}}. Please pay to avoid late charges.',
      variables: JSON.stringify(['parent_name', 'amount', 'student_name', 'due_date'])
    },
    {
      name: 'Exam Notification',
      channel: 'email',
      content: 'Dear {{parent_name}}, {{exam_name}} for {{student_name}} ({{class}}) is scheduled from {{start_date}} to {{end_date}}. Please ensure regular attendance.',
      variables: JSON.stringify(['parent_name', 'exam_name', 'student_name', 'class', 'start_date', 'end_date'])
    },
    {
      name: 'Attendance Alert',
      channel: 'sms',
      content: 'Alert: {{student_name}} was marked {{status}} on {{date}}. Total absences this month: {{absent_count}}. Please contact school if this is an error.',
      variables: JSON.stringify(['student_name', 'status', 'date', 'absent_count'])
    },
    {
      name: 'Holiday Notification',
      channel: 'email',
      content: 'Dear Parents, school will remain closed on {{date}} on account of {{reason}}. Regular classes will resume from {{resume_date}}.',
      variables: JSON.stringify(['date', 'reason', 'resume_date'])
    },
    {
      name: 'Report Card Available',
      channel: 'email',
      content: 'Dear {{parent_name}}, the {{exam_name}} report card for {{student_name}} is now available on the parent portal. Overall grade: {{grade}}',
      variables: JSON.stringify(['parent_name', 'exam_name', 'student_name', 'grade'])
    }
  ];

  for (const templateInfo of templateData) {
    const template = await prisma.template.create({
      data: {
        branchId: tenant.id,
        name: templateInfo.name,
        channel: templateInfo.channel,
        content: templateInfo.content,
        variables: templateInfo.variables
      }
    });
    templates.push(template);
  }

  // Create campaigns
  console.log('📢 Creating campaigns...');
  const campaigns = [];
  const campaignData = [
    { name: 'Welcome Campaign 2024', templateIndex: 0, status: 'completed' },
    { name: 'Q1 Fee Reminder', templateIndex: 1, status: 'active' },
    { name: 'Mid-Term Exam Alert', templateIndex: 2, status: 'scheduled' },
    { name: 'Attendance Alert October', templateIndex: 3, status: 'active' },
    { name: 'Diwali Holiday Notice', templateIndex: 4, status: 'completed' }
  ];
  
  for (const campaignInfo of campaignData) {
    const campaign = await prisma.campaign.create({
      data: {
        branchId: tenant.id,
        name: campaignInfo.name,
        templateId: templates[campaignInfo.templateIndex].id,
        audienceQuery: JSON.stringify({ classes: classes.slice(0, 5).map(c => c.name) }),
        schedule: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
        status: campaignInfo.status
      }
    });
    campaigns.push(campaign);
  }

  // Create messages
  console.log('💬 Creating messages...');
  for (let i = 0; i < 100; i++) {
    const template = templates[Math.floor(Math.random() * templates.length)];
    const campaign = campaigns[Math.floor(Math.random() * campaigns.length)];
    const guardian = guardians[Math.floor(Math.random() * Math.min(guardians.length, 50))];
    
    if (!guardian) continue;
    
    await prisma.message.create({
      data: {
        branchId: tenant.id,
        channel: template.channel,
        to: template.channel === 'email' ? (guardian.email || 'test@example.com') : (guardian.phoneNumber || '+91-9999999999'),
        templateId: template.id,
        campaignId: campaign.id,
        payload: JSON.stringify({
          school_name: 'Sunrise International School',
          student_name: 'Student Name',
          parent_name: guardian.name,
          amount: '15000',
          due_date: '2024-10-05',
          year: '2024-25',
          class: 'Class 5',
          exam_name: 'Mid-Term Exam',
          start_date: '2024-10-01',
          end_date: '2024-10-10',
          date: '2024-09-28',
          status: 'Absent',
          absent_count: '3',
          reason: 'Diwali Festival',
          resume_date: '2024-11-05',
          grade: 'A'
        }),
        status: ['pending', 'sent', 'delivered', 'failed'][Math.floor(Math.random() * 4)],
        sentAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined
      }
    });
  }

  // Create communication preferences
  console.log('⚙️ Creating communication preferences...');
  for (const guardian of guardians.slice(0, 50)) {
    await prisma.preference.create({
      data: {
        branchId: tenant.id,
        ownerType: 'guardian',
        ownerId: guardian.id,
        channel: Math.random() > 0.5 ? 'email' : 'sms',
        consent: Math.random() > 0.1,
        quietHours: JSON.stringify({ start: '22:00', end: '08:00' })
      }
    });
  }

  // Create support tickets
  console.log('🎫 Creating support tickets...');
  const ticketCategories = ['academic', 'fees', 'technical', 'general', 'transport', 'discipline'];
  const ticketSubjects = [
    'Unable to access student portal',
    'Fee payment not reflecting',
    'Attendance discrepancy for my child',
    'Request for duplicate report card',
    'Transport route change request',
    'Parent-teacher meeting scheduling',
    'Uniform size exchange needed',
    'Medical leave application',
    'Request for transfer certificate',
    'Complaint about classroom facilities'
  ];

  for (let i = 0; i < 30; i++) {
    const guardian = guardians[Math.floor(Math.random() * Math.min(guardians.length, 50))];
    if (!guardian) continue;
    
    const subject = ticketSubjects[Math.floor(Math.random() * ticketSubjects.length)];
    
    const ticket = await prisma.ticket.create({
      data: {
        branchId: tenant.id,
        ownerType: 'guardian',
        ownerId: guardian.id,
        category: ticketCategories[Math.floor(Math.random() * ticketCategories.length)],
        priority: ['low', 'normal', 'high'][Math.floor(Math.random() * 3)],
        status: ['open', 'in_progress', 'resolved', 'closed'][Math.floor(Math.random() * 4)],
        assigneeId: staffMembers[Math.floor(Math.random() * staffMembers.length)].id,
        subject: subject,
        description: `Detailed description for: ${subject}. This ticket requires attention and resolution as per our SLA guidelines.`,
        slaDueAt: new Date(Date.now() + (Math.random() * 3 + 1) * 24 * 60 * 60 * 1000)
      }
    });

    // Add initial message
    await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        authorId: guardian.id,
        authorType: 'requester',
        content: `Initial request: ${subject}. Please help resolve this issue at the earliest.`
      }
    });

    // Add staff response for some tickets
    if (Math.random() > 0.4) {
      await prisma.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          authorId: staffMembers[0].id,
          authorType: 'staff',
          content: 'Thank you for reaching out. We are reviewing your request and will update you shortly.',
          internal: false
        }
      });
      
      // Add internal note for some
      if (Math.random() > 0.5) {
        await prisma.ticketMessage.create({
          data: {
            ticketId: ticket.id,
            authorId: staffMembers[1].id,
            authorType: 'staff',
            content: 'Internal note: Needs verification from accounts department.',
            internal: true
          }
        });
      }
    }
  }

  console.log('✅ Database seed completed successfully!');
  
  // Display comprehensive summary
  const summary = {
    tenants: await prisma.tenant.count(),
    academicYears: await prisma.academicYear.count(),
    classes: await prisma.class.count(),
    sections: await prisma.section.count(),
    students: await prisma.student.count(),
    guardians: await prisma.guardian.count(),
    studentGuardianRelations: await prisma.studentGuardian.count(),
    staff: await prisma.staff.count(),
    teachers: await prisma.teacher.count(),
    subjects: await prisma.subject.count(),
    rooms: await prisma.room.count(),
    timeSlots: await prisma.timeSlot.count(),
    timetablePeriods: await prisma.timetablePeriod.count(),
    attendanceSessions: await prisma.attendanceSession.count(),
    studentPeriodAttendance: await prisma.studentPeriodAttendance.count(),
    enrollments: await prisma.enrollment.count(),
    exams: await prisma.exam.count(),
    examSessions: await prisma.examSession.count(),
    marksEntries: await prisma.marksEntry.count(),
    feeStructures: await prisma.feeStructure.count(),
    feeSchedules: await prisma.feeSchedule.count(),
    feeComponents: await prisma.feeComponent.count(),
    invoices: await prisma.invoice.count(),
    payments: await prisma.payment.count(),
    attendanceRecords: await prisma.attendanceRecord.count(),
    templates: await prisma.template.count(),
    campaigns: await prisma.campaign.count(),
    messages: await prisma.message.count(),
    preferences: await prisma.preference.count(),
    tickets: await prisma.ticket.count(),
    ticketMessages: await prisma.ticketMessage.count()
  };
  
  console.log('\n📊 Database Summary:');
  Object.entries(summary).forEach(([key, value]) => {
    console.log(`  - ${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}: ${value}`);
  });
  
  // Show some relationship stats
  console.log('\n👨‍👩‍👧‍👦 Family Relationship Stats:');
  const guardiansWithMultipleChildren = await prisma.guardian.findMany({
    include: {
      students: true
    }
  });
  const multiChildGuardians = guardiansWithMultipleChildren.filter(g => g.students.length > 1);
  console.log(`  - Guardians with multiple children: ${multiChildGuardians.length}`);
  console.log(`  - Average children per guardian: ${(summary.studentGuardianRelations / summary.guardians).toFixed(2)}`);
  
  const studentsWithBothParents = await prisma.student.findMany({
    include: {
      guardians: true
    }
  });
  const twoParentStudents = studentsWithBothParents.filter(s => s.guardians.length >= 2);
  console.log(`  - Students with both parents: ${twoParentStudents.length}`);
  console.log(`  - Students with single parent: ${studentsWithBothParents.filter(s => s.guardians.length === 1).length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });