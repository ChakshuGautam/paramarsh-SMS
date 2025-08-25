import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ========== COMPREHENSIVE TIMETABLE SEED DATA ==========
// Generates realistic timetable data for Indian schools with proper period numbering

// ========== INDIAN SCHOOL ROOM TYPES ==========
const ROOM_TYPES = {
  classroom: {
    type: 'classroom',
    facilities: ['whiteboard', 'projector', 'speakers', 'air_conditioner'],
    capacity: 40
  },
  lab: {
    type: 'lab',
    facilities: ['lab_equipment', 'safety_equipment', 'chemical_storage', 'ventilation'],
    capacity: 30
  },
  auditorium: {
    type: 'auditorium', 
    facilities: ['stage', 'sound_system', 'lighting', 'seating', 'air_conditioner'],
    capacity: 300
  },
  sports: {
    type: 'sports',
    facilities: ['sports_equipment', 'changing_rooms', 'first_aid'],
    capacity: 50
  },
  library: {
    type: 'library',
    facilities: ['books', 'computers', 'reading_tables', 'air_conditioner'], 
    capacity: 60
  },
  staff_room: {
    type: 'staff_room',
    facilities: ['desks', 'computers', 'printer', 'tea_coffee', 'lockers'],
    capacity: 20
  }
};

// Indian school room naming conventions
const INDIAN_ROOM_NAMES = {
  classrooms: [
    'Ganga Hall', 'Yamuna Hall', 'Saraswati Hall', 'Kaveri Hall', 'Narmada Hall',
    'Krishna Hall', 'Rama Hall', 'Arjuna Hall', 'Bhima Hall', 'Nakula Hall',
    'Vivekananda Hall', 'Tagore Hall', 'Gandhi Hall', 'Nehru Hall', 'Bose Hall',
    'Kalam Hall', 'Raman Hall', 'Chandrasekar Hall', 'Ramanujan Hall', 'Aryabhata Hall'
  ],
  labs: [
    'Einstein Physics Lab', 'Mendeleev Chemistry Lab', 'Darwin Biology Lab', 'Turing Computer Lab',
    'Fleming Biology Lab', 'Curie Physics Lab', 'Tesla Electronics Lab', 'Faraday Physics Lab'
  ],
  special: [
    'Kalidas Auditorium', 'Thyagaraja Music Hall', 'Bharatanatyam Dance Hall', 
    'Gandhi Sports Complex', 'Saraswati Library', 'Vidyasagar Reading Hall'
  ]
};

// ========== INDIAN SCHOOL PERIODS WITH UNIQUE NUMBERING ==========
const INDIAN_SCHOOL_PERIODS = [
  // Monday to Friday schedule - each period has unique number
  { period: 1, startTime: '08:00', endTime: '08:40', type: 'regular', name: 'Period 1' },
  { period: 2, startTime: '08:40', endTime: '09:20', type: 'regular', name: 'Period 2' },
  { period: 3, startTime: '09:20', endTime: '10:00', type: 'regular', name: 'Period 3' },
  { period: 4, startTime: '10:00', endTime: '10:40', type: 'regular', name: 'Period 4' },
  { period: 5, startTime: '10:40', endTime: '11:00', type: 'break', name: 'Tea Break' }, // Fixed: unique period number
  { period: 6, startTime: '11:00', endTime: '11:40', type: 'regular', name: 'Period 5' },
  { period: 7, startTime: '11:40', endTime: '12:20', type: 'regular', name: 'Period 6' },
  { period: 8, startTime: '12:20', endTime: '13:00', type: 'regular', name: 'Period 7' },
  { period: 9, startTime: '13:00', endTime: '13:40', type: 'break', name: 'Lunch Break' }, // Fixed: unique period number
  { period: 10, startTime: '13:40', endTime: '14:20', type: 'regular', name: 'Period 8' },
  { period: 11, startTime: '14:20', endTime: '15:00', type: 'regular', name: 'Period 9' },
  { period: 12, startTime: '15:00', endTime: '15:30', type: 'regular', name: 'Period 10' }
];

const SATURDAY_PERIODS = [
  // Saturday shorter schedule - unique period numbers
  { period: 1, startTime: '08:00', endTime: '08:35', type: 'regular', name: 'Period 1' },
  { period: 2, startTime: '08:35', endTime: '09:10', type: 'regular', name: 'Period 2' },
  { period: 3, startTime: '09:10', endTime: '09:45', type: 'regular', name: 'Period 3' },
  { period: 4, startTime: '09:45', endTime: '10:20', type: 'regular', name: 'Period 4' },
  { period: 5, startTime: '10:20', endTime: '10:35', type: 'break', name: 'Short Break' }, // Fixed: unique period number
  { period: 6, startTime: '10:35', endTime: '11:10', type: 'regular', name: 'Period 5' },
  { period: 7, startTime: '11:10', endTime: '11:45', type: 'regular', name: 'Period 6' },
  { period: 8, startTime: '11:45', endTime: '12:20', type: 'regular', name: 'Period 7' }
];

// ========== SUBJECT DISTRIBUTION BY GRADE ==========
function getSubjectsForGrade(gradeLevel: number): string[] {
  if (gradeLevel <= 2) { // Nursery, LKG, UKG
    return ['English', 'Hindi', 'Mathematics', 'General Knowledge', 'Drawing', 'Rhymes'];
  } else if (gradeLevel <= 5) { // Primary
    return ['English', 'Hindi', 'Mathematics', 'EVS', 'Computer Science', 'Art', 'Physical Education'];
  } else if (gradeLevel <= 8) { // Middle
    return ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Computer Science', 'Physical Education', 'Art'];
  } else if (gradeLevel <= 10) { // Secondary
    return ['English', 'Hindi', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Social Science', 'Computer Science', 'Physical Education'];
  } else { // Senior Secondary
    return ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Economics', 'Physical Education'];
  }
}

// ========== UTILITY FUNCTIONS ==========
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// ========== ROOM GENERATION ==========
async function generateRooms(branchId: string) {
  console.log('🏫 Generating school rooms...');
  
  const rooms = [];
  let roomCounter = 1;
  
  // Generate classrooms (40 rooms)
  for (let floor = 1; floor <= 4; floor++) {
    for (let room = 1; room <= 10; room++) {
      const roomName = getRandomElement(INDIAN_ROOM_NAMES.classrooms);
      const roomCode = `C${floor}${room.toString().padStart(2, '0')}`;
      
      try {
        const newRoom = await prisma.room.create({
          data: {
            branchId,
            code: roomCode,
            name: `${roomName} - ${roomCode}`,
            building: `Academic Block ${String.fromCharCode(64 + floor)}`, // A, B, C, D
            floor: `Floor ${floor}`,
            capacity: ROOM_TYPES.classroom.capacity,
            type: ROOM_TYPES.classroom.type,
            facilities: JSON.stringify(ROOM_TYPES.classroom.facilities),
            isActive: true
          }
        });
        rooms.push(newRoom);
        roomCounter++;
      } catch (error) {
        // Skip if room already exists
      }
    }
  }
  
  // Generate labs (12 labs) 
  for (let i = 1; i <= 12; i++) {
    const labName = getRandomElement(INDIAN_ROOM_NAMES.labs);
    const labCode = `LAB${i.toString().padStart(2, '0')}`;
    
    try {
      const newLab = await prisma.room.create({
        data: {
          branchId,
          code: labCode,
          name: labName,
          building: 'Science Block',
          floor: i <= 6 ? 'Floor 1' : 'Floor 2',
          capacity: ROOM_TYPES.lab.capacity,
          type: ROOM_TYPES.lab.type,
          facilities: JSON.stringify(ROOM_TYPES.lab.facilities),
          isActive: true
        }
      });
      rooms.push(newLab);
      roomCounter++;
    } catch (error) {
      // Skip if room already exists
    }
  }
  
  // Generate special rooms
  const specialRooms = [
    { code: 'AUD01', name: 'Kalidas Auditorium', type: 'auditorium' },
    { code: 'GYM01', name: 'Gandhi Sports Complex', type: 'sports' },
    { code: 'LIB01', name: 'Saraswati Library', type: 'library' },
    { code: 'STAFF01', name: 'Main Staff Room', type: 'staff_room' },
    { code: 'STAFF02', name: 'Senior Secondary Staff Room', type: 'staff_room' }
  ];
  
  for (const specialRoom of specialRooms) {
    try {
      const newRoom = await prisma.room.create({
        data: {
          branchId,
          code: specialRoom.code,
          name: specialRoom.name,
          building: specialRoom.type === 'sports' ? 'Sports Complex' : 'Main Block',
          floor: 'Ground Floor',
          capacity: ROOM_TYPES[specialRoom.type as keyof typeof ROOM_TYPES].capacity,
          type: specialRoom.type,
          facilities: JSON.stringify(ROOM_TYPES[specialRoom.type as keyof typeof ROOM_TYPES].facilities),
          isActive: true
        }
      });
      rooms.push(newRoom);
      roomCounter++;
    } catch (error) {
      // Skip if room already exists
    }
  }
  
  console.log(`✅ Generated ${rooms.length} rooms`);
  return rooms;
}

// ========== TIMETABLE PERIOD GENERATION ==========
async function generateTimetablePeriods(
  branchId: string, 
  rooms: any[], 
  subjects: any[], 
  teachers: any[], 
  sections: any[], 
  academicYearId: string
) {
  console.log('📅 Generating timetable periods...');
  
  // Check if periods already exist
  const existingPeriods = await prisma.timetablePeriod.count({
    where: { branchId }
  });
  
  if (existingPeriods > 0) {
    console.log(`⚠️  Found ${existingPeriods} existing timetable periods. Skipping generation.`);
    return;
  }
  
  const timetablePeriods = [];
  const classrooms = rooms.filter(r => r.type === 'classroom');
  const labs = rooms.filter(r => r.type === 'lab');
  
  // Generate periods for each section
  for (const section of sections) {
    const sectionClass = await prisma.class.findUnique({
      where: { id: section.classId }
    });
    
    if (!sectionClass) continue;
    
    const gradeLevel = sectionClass.gradeLevel || 0;
    const gradeSubjects = getSubjectsForGrade(gradeLevel);
    const sectionSubjects = subjects.filter(s => gradeSubjects.includes(s.name));
    
    // Generate weekly schedule (Monday to Saturday)
    for (let dayOfWeek = 1; dayOfWeek <= 6; dayOfWeek++) {
      const periods = dayOfWeek === 6 ? SATURDAY_PERIODS : INDIAN_SCHOOL_PERIODS;
      
      for (const periodInfo of periods) {
        if (periodInfo.type === 'break') {
          // Create break periods with unique period numbers
          try {
            const period = await prisma.timetablePeriod.create({
              data: {
                branchId,
                sectionId: section.id,
                dayOfWeek,
                periodNumber: periodInfo.period, // Now unique for each break
                startTime: periodInfo.startTime,
                endTime: periodInfo.endTime,
                isBreak: true,
                breakType: periodInfo.name?.includes('Lunch') ? 'LUNCH' : 'SHORT',
                academicYearId
              }
            });
            timetablePeriods.push(period);
          } catch (error) {
            console.log(`⚠️ Skipping duplicate period: Section ${section.name}, Day ${dayOfWeek}, Period ${periodInfo.period}`);
          }
        } else {
          // Assign subject and teacher for regular periods
          let assignedSubject = null;
          let assignedTeacher = null;
          let assignedRoom = null;
          
          // Randomly assign subjects ensuring variety
          if (sectionSubjects.length > 0) {
            assignedSubject = getRandomElement(sectionSubjects);
            
            // Find teacher for this subject
            const subjectTeachers = teachers.filter(t => 
              t.specializations && t.specializations.includes(assignedSubject.name)
            );
            
            if (subjectTeachers.length > 0) {
              assignedTeacher = getRandomElement(subjectTeachers);
            } else {
              // Fallback to any teacher
              assignedTeacher = getRandomElement(teachers);
            }
            
            // Assign appropriate room
            if (['Physics', 'Chemistry', 'Biology', 'Computer Science'].includes(assignedSubject.name)) {
              assignedRoom = getRandomElement(labs);
            } else if (assignedSubject.name === 'Physical Education') {
              assignedRoom = rooms.find(r => r.type === 'sports');
            } else {
              assignedRoom = getRandomElement(classrooms);
            }
          }
          
          try {
            const period = await prisma.timetablePeriod.create({
              data: {
                branchId,
                sectionId: section.id,
                dayOfWeek,
                periodNumber: periodInfo.period,
                startTime: periodInfo.startTime,
                endTime: periodInfo.endTime,
                subjectId: assignedSubject?.id || null,
                teacherId: assignedTeacher?.id || null,
                roomId: assignedRoom?.id || null,
                isBreak: false,
                academicYearId
              }
            });
            timetablePeriods.push(period);
          } catch (error) {
            console.log(`⚠️ Skipping duplicate period: Section ${section.name}, Day ${dayOfWeek}, Period ${periodInfo.period}`);
          }
        }
      }
    }
  }
  
  console.log(`✅ Generated ${timetablePeriods.length} timetable periods`);
  return timetablePeriods;
}

// ========== SUBSTITUTION GENERATION ==========
async function generateSubstitutions(branchId: string, timetablePeriods: any[], teachers: any[]) {
  console.log('🔄 Generating substitutions...');
  
  if (!timetablePeriods || timetablePeriods.length === 0) {
    // Get existing periods
    timetablePeriods = await prisma.timetablePeriod.findMany({
      where: { branchId, isBreak: false }
    });
  }
  
  const substitutions = [];
  const reasons = [
    'Sick Leave',
    'Personal Emergency', 
    'Professional Development',
    'Medical Appointment',
    'Family Emergency',
    'Training Program',
    'Official Meeting',
    'Jury Duty'
  ];
  
  // Generate 50 substitution records for realistic demo data
  for (let i = 0; i < 50; i++) {
    const period = getRandomElement(timetablePeriods);
    const substituteTeacher = getRandomElement(teachers);
    
    // Create random date within last 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    try {
      const substitution = await prisma.substitution.create({
        data: {
          branchId,
          periodId: period.id,
          substituteTeacherId: substituteTeacher.id,
          date: date,
          reason: getRandomElement(reasons),
          status: Math.random() > 0.1 ? 'approved' : 'pending', // 90% approved
          approvedAt: Math.random() > 0.1 ? new Date() : null
        }
      });
      substitutions.push(substitution);
    } catch (error) {
      // Skip duplicates (same period, same date)
      continue;
    }
  }
  
  console.log(`✅ Generated ${substitutions.length} substitution records`);
  return substitutions;
}

// ========== MAIN SEED FUNCTION ==========
async function seedTimetableData(branchId: string = 'dps-main') {
  console.log(`🌱 Starting timetable seed for branch: ${branchId}`);
  
  try {
    // Get existing data
    const academicYear = await prisma.academicYear.findFirst({
      where: { branchId, isActive: true }
    });
    
    if (!academicYear) {
      throw new Error(`No active academic year found for branch ${branchId}`);
    }
    
    const subjects = await prisma.subject.findMany({
      where: { branchId }
    });
    
    const teachers = await prisma.teacher.findMany({
      where: { branchId }
    });
    
    const sections = await prisma.section.findMany({
      where: { branchId },
      include: { class: true }
    });
    
    console.log(`📊 Found: ${subjects.length} subjects, ${teachers.length} teachers, ${sections.length} sections`);
    
    // 1. Generate rooms
    const rooms = await generateRooms(branchId);
    
    // 2. Generate timetable periods
    const timetablePeriods = await generateTimetablePeriods(
      branchId, 
      rooms, 
      subjects, 
      teachers, 
      sections, 
      academicYear.id
    );
    
    // 3. Generate substitutions
    const substitutions = await generateSubstitutions(branchId, timetablePeriods || [], teachers);
    
    // Generate summary
    console.log('\n📋 TIMETABLE SEED SUMMARY');
    console.log('='.repeat(40));
    console.log(`🏫 Branch: ${branchId}`);
    console.log(`🚪 Rooms: ${rooms.length}`);
    console.log(`📅 Timetable Periods: ${timetablePeriods?.length || 'existing'}`);
    console.log(`🔄 Substitutions: ${substitutions.length}`);
    console.log('\n✅ Timetable seed completed successfully!');
    
    return {
      branchId,
      rooms: rooms.length,
      periods: timetablePeriods?.length || 0,
      substitutions: substitutions.length
    };
    
  } catch (error) {
    console.error('❌ Timetable seed failed:', error);
    throw error;
  }
}

// ========== EXECUTION ==========
async function main() {
  console.log('🚀 PARAMARSH SMS - COMPREHENSIVE TIMETABLE SEED');
  console.log('=' .repeat(50));
  
  try {
    const branchId = process.argv[2] || 'dps-main';
    const result = await seedTimetableData(branchId);
    
    console.log('\n🎉 All timetable data generated successfully!');
    console.log(`📚 Ready for timetable module testing and demos`);
    
  } catch (error) {
    console.error('💥 Seed execution failed:', error);
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}

export { seedTimetableData };