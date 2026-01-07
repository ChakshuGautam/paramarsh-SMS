import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// TimeSlot seed data for Indian school schedule
// Follows the existing TimetablePeriod structure with TimeSlot template format

const INDIAN_SCHOOL_TIMESLOTS = {
  // Monday to Friday (dayOfWeek 1-5) - Full day schedule
  weekdays: [
    // Assembly for Monday morning (special slot)
    { dayOfWeek: 1, startTime: '07:50', endTime: '08:00', slotType: 'assembly', slotOrder: 0, name: 'Morning Assembly' },
    
    // Regular periods Monday-Friday
    { dayOfWeek: [1,2,3,4,5], startTime: '08:00', endTime: '08:40', slotType: 'regular', slotOrder: 1, name: 'Period 1' },
    { dayOfWeek: [1,2,3,4,5], startTime: '08:40', endTime: '09:20', slotType: 'regular', slotOrder: 2, name: 'Period 2' },
    { dayOfWeek: [1,2,3,4,5], startTime: '09:20', endTime: '10:00', slotType: 'regular', slotOrder: 3, name: 'Period 3' },
    { dayOfWeek: [1,2,3,4,5], startTime: '10:00', endTime: '10:40', slotType: 'regular', slotOrder: 4, name: 'Period 4' },
    
    // Short break (Tea Break)
    { dayOfWeek: [1,2,3,4,5], startTime: '10:40', endTime: '11:00', slotType: 'break', slotOrder: 5, name: 'Tea Break' },
    
    // Regular periods continue
    { dayOfWeek: [1,2,3,4,5], startTime: '11:00', endTime: '11:40', slotType: 'regular', slotOrder: 6, name: 'Period 5' },
    { dayOfWeek: [1,2,3,4,5], startTime: '11:40', endTime: '12:20', slotType: 'regular', slotOrder: 7, name: 'Period 6' },
    { dayOfWeek: [1,2,3,4,5], startTime: '12:20', endTime: '13:00', slotType: 'regular', slotOrder: 8, name: 'Period 7' },
    
    // Lunch break (40 minutes)
    { dayOfWeek: [1,2,3,4,5], startTime: '13:00', endTime: '13:40', slotType: 'break', slotOrder: 9, name: 'Lunch Break' },
    
    // Afternoon periods
    { dayOfWeek: [1,2,3,4,5], startTime: '13:40', endTime: '14:20', slotType: 'regular', slotOrder: 10, name: 'Period 8' },
    { dayOfWeek: [1,2,3,4,5], startTime: '14:20', endTime: '15:00', slotType: 'regular', slotOrder: 11, name: 'Period 9' },
    { dayOfWeek: [1,2,3,4,5], startTime: '15:00', endTime: '15:30', slotType: 'regular', slotOrder: 12, name: 'Period 10' }
  ],
  
  // Saturday (dayOfWeek 6) - Half day schedule (Indian schools typically have shorter Saturday classes)
  saturday: [
    // Saturday morning assembly
    { dayOfWeek: 6, startTime: '07:50', endTime: '08:00', slotType: 'assembly', slotOrder: 0, name: 'Saturday Assembly' },
    
    // Shorter periods on Saturday (35 minutes each)
    { dayOfWeek: 6, startTime: '08:00', endTime: '08:35', slotType: 'regular', slotOrder: 1, name: 'Period 1' },
    { dayOfWeek: 6, startTime: '08:35', endTime: '09:10', slotType: 'regular', slotOrder: 2, name: 'Period 2' },
    { dayOfWeek: 6, startTime: '09:10', endTime: '09:45', slotType: 'regular', slotOrder: 3, name: 'Period 3' },
    { dayOfWeek: 6, startTime: '09:45', endTime: '10:20', slotType: 'regular', slotOrder: 4, name: 'Period 4' },
    
    // Short break on Saturday
    { dayOfWeek: 6, startTime: '10:20', endTime: '10:35', slotType: 'break', slotOrder: 5, name: 'Break' },
    
    // Final periods on Saturday
    { dayOfWeek: 6, startTime: '10:35', endTime: '11:10', slotType: 'regular', slotOrder: 6, name: 'Period 5' },
    { dayOfWeek: 6, startTime: '11:10', endTime: '11:45', slotType: 'regular', slotOrder: 7, name: 'Period 6' },
    { dayOfWeek: 6, startTime: '11:45', endTime: '12:20', slotType: 'regular', slotOrder: 8, name: 'Period 7' }
  ]
};

// Flatten and expand the schedule to individual records
function expandTimeSlots(): any[] {
  const timeSlots: any[] = [];
  
  // Process weekday slots (expand arrays)
  INDIAN_SCHOOL_TIMESLOTS.weekdays.forEach(slot => {
    if (Array.isArray(slot.dayOfWeek)) {
      // Expand for each day of the week
      slot.dayOfWeek.forEach(day => {
        timeSlots.push({
          dayOfWeek: day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          slotType: slot.slotType,
          slotOrder: slot.slotOrder,
          name: slot.name
        });
      });
    } else {
      // Single day
      timeSlots.push(slot);
    }
  });
  
  // Process Saturday slots
  INDIAN_SCHOOL_TIMESLOTS.saturday.forEach(slot => {
    timeSlots.push(slot);
  });
  
  return timeSlots;
}

export async function seedTimeSlots(branchId: string = 'dps-main') {
  try {
    console.log(`🕒 Generating TimeSlot seed data for branch: ${branchId}`);
    
    const timeSlotData = expandTimeSlots();
    
    console.log(`Creating ${timeSlotData.length} TimeSlot records...`);
    
    const timeSlots = [];
    for (const slotData of timeSlotData) {
      const timeSlot = await prisma.timeSlot.create({
        data: {
          branchId: branchId,
          dayOfWeek: slotData.dayOfWeek,
          startTime: slotData.startTime,
          endTime: slotData.endTime,
          slotType: slotData.slotType,
          slotOrder: slotData.slotOrder
        }
      });
      timeSlots.push(timeSlot);
    }
    
    console.log(`✅ Successfully created ${timeSlots.length} TimeSlot records for ${branchId}`);
    
    // Generate summary report
    const summary = {
      totalSlots: timeSlots.length,
      byDay: {} as Record<string, number>,
      byType: {} as Record<string, number>
    };
    
    timeSlots.forEach(slot => {
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][slot.dayOfWeek];
      summary.byDay[dayName] = (summary.byDay[dayName] || 0) + 1;
      summary.byType[slot.slotType] = (summary.byType[slot.slotType] || 0) + 1;
    });
    
    console.log('📊 TimeSlot Summary:', JSON.stringify(summary, null, 2));
    
    return timeSlots;
  } catch (error) {
    console.error('❌ Error seeding TimeSlots:', error);
    throw error;
  }
}

// Main execution function
export async function main() {
  try {
    await seedTimeSlots('dps-main');
  } catch (error) {
    console.error('❌ TimeSlot seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}