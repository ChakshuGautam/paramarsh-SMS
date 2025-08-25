import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ========== TIMETABLE MODULE SEED DATA ==========
// Generates comprehensive timetable data for Indian schools
// Including rooms, time slots, and substitution records

// ========== INDIAN SCHOOL ROOM TYPES AND NAMES ==========
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
    // Traditional Indian naming
    'Ganga Hall', 'Yamuna Hall', 'Saraswati Hall', 'Kaveri Hall', 'Narmada Hall',
    'Krishna Hall', 'Rama Hall', 'Arjuna Hall', 'Bhima Hall', 'Nakula Hall',
    'Vivekananda Hall', 'Tagore Hall', 'Gandhi Hall', 'Nehru Hall', 'Bose Hall',
    'Kalam Hall', 'Raman Hall', 'Chandrasekar Hall', 'Ramanujan Hall', 'Aryabhata Hall',
    
    // Subject-specific classrooms
    'Hindi Bhavan', 'English Corner', 'Ganit Kaksha', 'Vigyan Kendra', 'Samaj Vigyan Kendra',
    'Kala Kendra', 'Sangeet Kaksha', 'Yog Kaksha', 'Khel Kendra', 'Pustkalaya',
    
    // Building-wise naming
    'Academic Block A-101', 'Academic Block A-102', 'Academic Block A-103',
    'Academic Block B-201', 'Academic Block B-202', 'Academic Block B-203',
    'Primary Block P-101', 'Primary Block P-102', 'Primary Block P-103'
  ],
  
  labs: [
    'Physics Laboratory', 'Chemistry Laboratory', 'Biology Laboratory',
    'Computer Laboratory', 'Language Laboratory', 'Mathematics Laboratory',
    'Science Laboratory', 'Composite Laboratory', 'Digital Laboratory',
    'SUPW Laboratory', 'Art & Craft Laboratory', 'Home Science Laboratory'
  ],
  
  special_rooms: [
    'Principal Office', 'Vice Principal Office', 'Staff Room',
    'Teachers Lounge', 'Conference Room', 'Medical Room',
    'Counselor Room', 'Admission Office', 'Accounts Office',
    'Library', 'Reading Room', 'Audio Visual Room',
    'Music Room', 'Dance Room', 'Art Room',
    'Auditorium', 'Assembly Hall', 'Prayer Hall',
    'Indoor Sports Hall', 'Gymnasium', 'Yoga Room',
    'Cafeteria', 'Kitchen', 'Store Room',
    'Security Room', 'Maintenance Room', 'Generator Room'
  ]
};

// Indian school building structure
const BUILDINGS = [
  { name: 'Main Building', code: 'MAIN', floors: ['Ground', 'First', 'Second'] },
  { name: 'Academic Block A', code: 'ACA', floors: ['Ground', 'First', 'Second'] },
  { name: 'Academic Block B', code: 'ACB', floors: ['Ground', 'First'] },
  { name: 'Primary Wing', code: 'PRIM', floors: ['Ground', 'First'] },
  { name: 'Administrative Block', code: 'ADMIN', floors: ['Ground'] },
  { name: 'Sports Complex', code: 'SPORTS', floors: ['Ground'] }
];

// ========== INDIAN SCHOOL TIME SCHEDULE ==========
// Standard Indian school timings: 8:00 AM to 3:30 PM
const INDIAN_SCHOOL_PERIODS = [
  // Monday to Friday schedule
  { period: 1, startTime: '08:00', endTime: '08:40', type: 'regular' },
  { period: 2, startTime: '08:40', endTime: '09:20', type: 'regular' },
  { period: 3, startTime: '09:20', endTime: '10:00', type: 'regular' },
  { period: 4, startTime: '10:00', endTime: '10:40', type: 'regular' },
  { period: 0, startTime: '10:40', endTime: '11:00', type: 'break', name: 'Tea Break' },
  { period: 5, startTime: '11:00', endTime: '11:40', type: 'regular' },
  { period: 6, startTime: '11:40', endTime: '12:20', type: 'regular' },
  { period: 7, startTime: '12:20', endTime: '13:00', type: 'regular' },
  { period: 0, startTime: '13:00', endTime: '13:40', type: 'break', name: 'Lunch Break' },
  { period: 8, startTime: '13:40', endTime: '14:20', type: 'regular' },
  { period: 9, startTime: '14:20', endTime: '15:00', type: 'regular' },
  { period: 10, startTime: '15:00', endTime: '15:30', type: 'regular' }
];

const SATURDAY_PERIODS = [
  // Saturday shorter schedule
  { period: 1, startTime: '08:00', endTime: '08:35', type: 'regular' },
  { period: 2, startTime: '08:35', endTime: '09:10', type: 'regular' },
  { period: 3, startTime: '09:10', endTime: '09:45', type: 'regular' },
  { period: 4, startTime: '09:45', endTime: '10:20', type: 'regular' },
  { period: 0, startTime: '10:20', endTime: '10:35', type: 'break', name: 'Short Break' },
  { period: 5, startTime: '10:35', endTime: '11:10', type: 'regular' },
  { period: 6, startTime: '11:10', endTime: '11:45', type: 'regular' },
  { period: 7, startTime: '11:45', endTime: '12:20', type: 'regular' }
];

// ========== SUBJECT DISTRIBUTION BY GRADE ==========
function getSubjectsForGrade(gradeLevel: number): string[] {
  // Indian CBSE curriculum subjects by grade
  if (gradeLevel <= 2) { // Nursery, LKG, UKG
    return ['English', 'Hindi', 'Mathematics', 'Science', 'Art & Craft', 'Music', 'Physical Education'];
  } else if (gradeLevel <= 7) { // Classes 1-5
    return ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Computer Science', 'Art & Craft', 'Physical Education'];
  } else if (gradeLevel <= 10) { // Classes 6-8
    return ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Sanskrit', 'Computer Science', 'Physical Education'];
  } else if (gradeLevel <= 12) { // Classes 9-10
    return ['English', 'Hindi', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Social Studies', 'Computer Science', 'Physical Education'];
  } else { // Classes 11-12
    return ['English', 'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science', 'Physical Education'];
  }
}

// ========== UTILITY FUNCTIONS ==========
function generateRoomCode(building: string, floor: string, roomNumber: number): string {
  const floorCode = floor === 'Ground' ? 'G' : floor === 'First' ? '1' : floor === 'Second' ? '2' : '3';
  return `${building}-${floorCode}${String(roomNumber).padStart(2, '0')}`;
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// ========== ROOM GENERATION ==========
async function generateRooms(branchId: string) {
  console.log('🏫 Generating school rooms...');
  
  const rooms = [];
  let roomCounter = 1;
  
  // Generate classrooms for each building and floor
  for (const building of BUILDINGS) {
    if (building.code === 'SPORTS' || building.code === 'ADMIN') continue; // Handle separately
    
    for (const floor of building.floors) {
      const roomsPerFloor = building.code === 'PRIM' ? 8 : 12; // Fewer rooms in primary wing
      
      for (let i = 1; i <= roomsPerFloor; i++) {
        const roomCode = generateRoomCode(building.code, floor, i);
        const roomName = INDIAN_ROOM_NAMES.classrooms[roomCounter % INDIAN_ROOM_NAMES.classrooms.length];
        
        const room = await prisma.room.create({
          data: {
            branchId,
            code: roomCode,
            name: roomName,
            building: building.name,
            floor: floor,
            type: 'classroom',
            capacity: 40,
            facilities: JSON.stringify(['whiteboard', 'projector', 'ceiling_fan', 'electrical_points']),
            isActive: true
          }
        });
        rooms.push(room);
        roomCounter++;
      }
    }
  }
  
  // Generate specialized rooms
  const specialRooms = [
    // Laboratories
    ...INDIAN_ROOM_NAMES.labs.map((name, index) => ({
      name,
      code: `LAB-${String(index + 1).padStart(2, '0')}`,
      type: 'lab',
      building: 'Academic Block A',
      floor: 'Second',
      capacity: 30,
      facilities: ['lab_benches', 'safety_equipment', 'storage_cabinets', 'ventilation', 'emergency_shower']
    })),
    
    // Administrative and special rooms
    { name: 'Principal Office', code: 'PRIN-01', type: 'office', building: 'Administrative Block', floor: 'Ground', capacity: 10, facilities: ['desk', 'computer', 'meeting_table', 'air_conditioner'] },
    { name: 'Vice Principal Office', code: 'VP-01', type: 'office', building: 'Administrative Block', floor: 'Ground', capacity: 8, facilities: ['desk', 'computer', 'air_conditioner'] },
    { name: 'Staff Room', code: 'STAFF-01', type: 'staff_room', building: 'Academic Block A', floor: 'Ground', capacity: 50, facilities: ['desks', 'computers', 'printer', 'tea_station', 'lockers'] },
    { name: 'Teachers Lounge', code: 'LOUNGE-01', type: 'staff_room', building: 'Academic Block B', floor: 'Ground', capacity: 20, facilities: ['sofas', 'refrigerator', 'microwave', 'magazines'] },
    
    // Library and reading
    { name: 'Central Library', code: 'LIB-01', type: 'library', building: 'Main Building', floor: 'First', capacity: 80, facilities: ['bookshelves', 'reading_tables', 'computers', 'air_conditioner', 'silence_zone'] },
    { name: 'Reading Room', code: 'READ-01', type: 'library', building: 'Main Building', floor: 'First', capacity: 60, facilities: ['study_tables', 'individual_lamps', 'reference_books'] },
    
    // Auditorium and assembly
    { name: 'Main Auditorium', code: 'AUD-01', type: 'auditorium', building: 'Main Building', floor: 'Ground', capacity: 500, facilities: ['stage', 'sound_system', 'lighting', 'air_conditioner', 'green_room'] },
    { name: 'Assembly Hall', code: 'HALL-01', type: 'auditorium', building: 'Academic Block A', floor: 'Ground', capacity: 300, facilities: ['podium', 'sound_system', 'seating'] },
    { name: 'Prayer Hall', code: 'PRAY-01', type: 'auditorium', building: 'Main Building', floor: 'Ground', capacity: 200, facilities: ['carpet', 'sound_system', 'ventilation'] },
    
    // Arts and music
    { name: 'Music Room', code: 'MUS-01', type: 'classroom', building: 'Academic Block B', floor: 'First', capacity: 25, facilities: ['piano', 'musical_instruments', 'sound_proofing', 'music_stands'] },
    { name: 'Dance Room', code: 'DANCE-01', type: 'classroom', building: 'Academic Block B', floor: 'First', capacity: 30, facilities: ['mirrors', 'dance_floor', 'sound_system', 'costumes_storage'] },
    { name: 'Art Room', code: 'ART-01', type: 'classroom', building: 'Academic Block B', floor: 'First', capacity: 25, facilities: ['easels', 'art_supplies', 'washbasin', 'display_boards'] },
    
    // Sports facilities
    { name: 'Indoor Sports Hall', code: 'SPORT-01', type: 'sports', building: 'Sports Complex', floor: 'Ground', capacity: 100, facilities: ['basketball_court', 'badminton_courts', 'table_tennis', 'sports_equipment'] },
    { name: 'Gymnasium', code: 'GYM-01', type: 'sports', building: 'Sports Complex', floor: 'Ground', capacity: 50, facilities: ['exercise_equipment', 'mats', 'weights', 'mirrors'] },
    { name: 'Yoga Room', code: 'YOGA-01', type: 'sports', building: 'Sports Complex', floor: 'Ground', capacity: 40, facilities: ['yoga_mats', 'meditation_space', 'sound_system', 'mirrors'] },
    
    // Support facilities
    { name: 'Medical Room', code: 'MED-01', type: 'office', building: 'Administrative Block', floor: 'Ground', capacity: 8, facilities: ['medical_bed', 'first_aid', 'medicines', 'stretcher'] },
    { name: 'Counselor Room', code: 'COUN-01', type: 'office', building: 'Administrative Block', floor: 'Ground', capacity: 6, facilities: ['comfortable_seating', 'confidential_space', 'books'] },
    { name: 'Cafeteria', code: 'CAF-01', type: 'cafeteria', building: 'Main Building', floor: 'Ground', capacity: 200, facilities: ['dining_tables', 'kitchen', 'serving_counter', 'water_dispensers'] }
  ];
  
  for (const roomData of specialRooms) {
    const room = await prisma.room.create({
      data: {
        branchId,
        code: roomData.code,
        name: roomData.name,
        building: roomData.building,
        floor: roomData.floor,
        type: roomData.type,
        capacity: roomData.capacity,
        facilities: JSON.stringify(roomData.facilities),
        isActive: true
      }
    });
    rooms.push(room);
  }
  
  console.log(`✅ Generated ${rooms.length} rooms`);
  return rooms;
}

// ========== TIMETABLE PERIOD GENERATION ==========
async function generateTimetablePeriods(branchId: string, rooms: any[], subjects: any[], teachers: any[], sections: any[], academicYearId: string) {
  console.log('📅 Generating timetable periods...');
  
  // Check if periods already exist
  const existingPeriods = await prisma.timetablePeriod.count({
    where: { branchId, academicYearId }
  });
  
  if (existingPeriods > 0) {
    console.log(`⚠️  Found ${existingPeriods} existing timetable periods. Skipping generation.`);
    return;
  }
  
  const timetablePeriods = [];
  const classrooms = rooms.filter(r => r.type === 'classroom');
  const labs = rooms.filter(r => r.type === 'lab');
  const specialRooms = rooms.filter(r => ['sports', 'auditorium'].includes(r.type));
  
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
          // Create break periods
          const period = await prisma.timetablePeriod.create({
            data: {
              branchId,
              sectionId: section.id,
              dayOfWeek,
              periodNumber: periodInfo.period || 0,
              startTime: periodInfo.startTime,
              endTime: periodInfo.endTime,
              isBreak: true,
              breakType: periodInfo.name?.includes('Lunch') ? 'LUNCH' : 'SHORT',
              academicYearId
            }
          });
          timetablePeriods.push(period);
        } else {
          // Assign subject and teacher for regular periods
          let assignedSubject = null;
          let assignedTeacher = null;
          let assignedRoom = null;
          
          // Special handling for specific periods and grades
          if (periodInfo.period === 1 && dayOfWeek === 1) {
            // Monday first period - Assembly
            assignedRoom = rooms.find(r => r.name === 'Assembly Hall') || rooms.find(r => r.type === 'auditorium');
          } else if (periodInfo.period === 10 && gradeLevel >= 8) {
            // Last period for higher grades - often sports/activities
            const sportsSubject = sectionSubjects.find(s => s.name === 'Physical Education');
            if (sportsSubject) {
              assignedSubject = sportsSubject;
              assignedRoom = getRandomElement(specialRooms.filter(r => r.type === 'sports'));
              assignedTeacher = getRandomElement(teachers);
            }
          } else {
            // Regular subject assignment
            assignedSubject = getRandomElement(sectionSubjects);
            
            // Room assignment based on subject
            if (assignedSubject?.name.includes('Laboratory') || assignedSubject?.name === 'Computer Science') {
              assignedRoom = getRandomElement(labs);
            } else if (assignedSubject?.name === 'Physical Education') {
              assignedRoom = getRandomElement(specialRooms.filter(r => r.type === 'sports'));
            } else {
              assignedRoom = getRandomElement(classrooms);
            }
            
            // Assign teacher (ideally subject specialist, but random for now)
            assignedTeacher = getRandomElement(teachers);
          }
          
          const period = await prisma.timetablePeriod.create({
            data: {
              branchId,
              sectionId: section.id,
              dayOfWeek,
              periodNumber: periodInfo.period,
              startTime: periodInfo.startTime,
              endTime: periodInfo.endTime,
              subjectId: assignedSubject?.id,
              teacherId: assignedTeacher?.id,
              roomId: assignedRoom?.id,
              isBreak: false,
              academicYearId
            }
          });
          timetablePeriods.push(period);
        }
      }
    }
  }
  
  console.log(`✅ Generated ${timetablePeriods.length} timetable periods`);
  return timetablePeriods;
}

// ========== SUBSTITUTION GENERATION ==========
async function generateSubstitutions(branchId: string, timetablePeriods: any[], teachers: any[]) {
  console.log('🔄 Generating substitution records...');
  
  const substitutions = [];
  const substitutionCount = Math.min(50, Math.floor(timetablePeriods.length * 0.02)); // 2% substitution rate
  
  // Generate substitutions for the last 30 days
  for (let i = 0; i < substitutionCount; i++) {
    const randomPeriod = getRandomElement(timetablePeriods.filter(p => !p.isBreak && p.teacherId));
    const substituteTeacher = getRandomElement(teachers.filter(t => t.id !== randomPeriod.teacherId));
    
    // Generate random date within last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const substitutionDate = new Date();
    substitutionDate.setDate(substitutionDate.getDate() - daysAgo);
    
    // Skip weekends
    if (substitutionDate.getDay() === 0) continue;
    
    const reasons = [
      'Teacher on sick leave',
      'Teacher attending workshop',
      'Personal emergency',
      'Medical appointment',
      'Family function',
      'Official duty',
      'Training program',
      'Academic meeting'
    ];
    
    try {
      const substitution = await prisma.substitution.create({
        data: {
          branchId,
          periodId: randomPeriod.id,
          substituteTeacherId: substituteTeacher.id,
          date: substitutionDate,
          reason: getRandomElement(reasons),
          status: Math.random() > 0.1 ? 'approved' : 'pending', // 90% approved
          approvedAt: Math.random() > 0.1 ? new Date() : null
        }
      });
      substitutions.push(substitution);
    } catch (error) {
      // Skip duplicates
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
  console.log('🚀 PARAMARSH SMS - TIMETABLE MODULE SEED');
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

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Fatal error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedTimetableData };