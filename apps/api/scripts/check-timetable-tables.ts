import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTimetableTables() {
  console.log('🔍 CHECKING TIMETABLE TABLES STATUS');
  console.log('=====================================');

  try {
    // Check table counts
    const timeSlots = await prisma.timeSlot.count();
    const rooms = await prisma.room.count();
    const timetablePeriods = await prisma.timetablePeriod.count();
    const substitutions = await prisma.substitution.count();

    console.log('\n📊 CURRENT TABLE COUNTS:');
    console.log(`⏰ TimeSlots: ${timeSlots}`);
    console.log(`🏫 Rooms: ${rooms}`);
    console.log(`📅 TimetablePeriods: ${timetablePeriods}`);
    console.log(`🔄 Substitutions: ${substitutions}`);

    // Check sample records
    if (timeSlots > 0) {
      const sampleTimeSlot = await prisma.timeSlot.findFirst();
      console.log('\n⏰ Sample TimeSlot:', {
        branchId: sampleTimeSlot?.branchId,
        dayOfWeek: sampleTimeSlot?.dayOfWeek,
        slotType: sampleTimeSlot?.slotType,
        startTime: sampleTimeSlot?.startTime
      });
    }

    if (rooms > 0) {
      const sampleRoom = await prisma.room.findFirst();
      console.log('\n🏫 Sample Room:', {
        branchId: sampleRoom?.branchId,
        name: sampleRoom?.name,
        type: sampleRoom?.type,
        capacity: sampleRoom?.capacity
      });
    }

    if (timetablePeriods > 0) {
      const samplePeriod = await prisma.timetablePeriod.findFirst({
        include: {
          section: true,
          subject: true,
          teacher: true
        }
      });
      console.log('\n📅 Sample TimetablePeriod:', {
        branchId: samplePeriod?.branchId,
        sectionName: samplePeriod?.section?.name,
        subjectName: samplePeriod?.subject?.name,
        teacherName: samplePeriod?.teacher ? 'Present' : 'Missing'
      });
    }

    // Expected counts for validation
    const branches = await prisma.tenant.count();
    const sections = await prisma.section.count();
    
    const expectedTimeSlots = branches * 80; // ~80 slots per branch (6 days × 13 slots)
    const expectedRooms = branches * 50; // ~50 rooms per branch
    const expectedPeriods = sections * 30; // ~30 periods per section
    const expectedSubstitutions = branches * 20; // ~20 substitutions per branch

    console.log('\n🎯 VALIDATION AGAINST EXPECTED VALUES:');
    console.log(`⏰ TimeSlots: ${timeSlots}/${expectedTimeSlots} (${timeSlots >= expectedTimeSlots * 0.5 ? '✅' : '❌'})`);
    console.log(`🏫 Rooms: ${rooms}/${expectedRooms} (${rooms >= expectedRooms * 0.3 ? '✅' : '❌'})`);
    console.log(`📅 TimetablePeriods: ${timetablePeriods}/${expectedPeriods} (${timetablePeriods >= expectedPeriods * 0.1 ? '✅' : '❌'})`);
    console.log(`🔄 Substitutions: ${substitutions}/${expectedSubstitutions} (${substitutions >= expectedSubstitutions * 0.1 ? '✅' : '❌'})`);

    // Summary
    const issues = [];
    if (timeSlots === 0) issues.push('TimeSlots missing');
    if (rooms === 0) issues.push('Rooms missing');
    if (timetablePeriods === 0) issues.push('TimetablePeriods missing');
    if (substitutions === 0) issues.push('Substitutions missing');

    console.log('\n🚨 ISSUES FOUND:');
    if (issues.length === 0) {
      console.log('✅ No critical issues found!');
    } else {
      console.log(`❌ ${issues.length} critical issues:`);
      issues.forEach(issue => console.log(`   - ${issue}`));
    }

    console.log('\n📋 ANALYSIS:');
    if (timeSlots > 0 && rooms === 0 && timetablePeriods === 0) {
      console.log('🔍 BUG CONFIRMED: TimeSlot data exists but Room/TimetablePeriod data missing');
      console.log('💡 This indicates the seed process is deleting data after TimeSlot creation');
      console.log('🔧 Fix: Modify seed.ts to preserve existing timetable data');
    } else if (timeSlots === 0) {
      console.log('🔍 No timetable data found - need to run full seed');
    } else {
      console.log('🔍 Mixed results - manual investigation needed');
    }

  } catch (error) {
    console.error('❌ Error checking timetable tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTimetableTables();