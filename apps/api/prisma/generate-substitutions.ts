import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ========== SUBSTITUTION GENERATOR ==========
// Generates realistic substitution records for Indian schools

const SUBSTITUTION_REASONS = [
  'Teacher on sick leave',
  'Teacher attending CBSE workshop',
  'Personal emergency - family medical issue',
  'Medical appointment',
  'Attending daughter/son\'s wedding',
  'Official duty - board evaluation',
  'Training program - digital literacy',
  'Academic meeting with principal',
  'Parent-teacher conference preparation',
  'Doctor consultation',
  'Participating in cultural program',
  'Government office work',
  'Property registration work',
  'Sister\'s marriage ceremony',
  'Child\'s admission process',
  'Legal documentation work',
  'Bank work - home loan processing',
  'Attending relative\'s funeral',
  'Festival celebration at home',
  'Vehicle accident - insurance claim'
];

// ========== GENERATE SUBSTITUTIONS ==========
async function generateSubstitutions(branchId: string = 'dps-main', count: number = 100) {
  console.log(`🔄 Generating ${count} substitution records for ${branchId}...`);
  
  try {
    // Get all assignable periods (non-break periods with teachers)
    const timetablePeriods = await prisma.timetablePeriod.findMany({
      where: {
        branchId,
        isBreak: false,
        teacherId: { not: null }
      }
    });
    
    // Get all teachers for substitutes
    const teachers = await prisma.teacher.findMany({
      where: { branchId }
    });
    
    if (timetablePeriods.length === 0) {
      console.log('❌ No assignable periods found');
      return;
    }
    
    if (teachers.length === 0) {
      console.log('❌ No teachers found');
      return;
    }
    
    console.log(`📊 Found ${timetablePeriods.length} assignable periods and ${teachers.length} teachers`);
    
    const substitutions = [];
    const usedPeriodDates = new Set<string>(); // To avoid duplicates
    
    // Generate substitutions for the last 60 days
    for (let i = 0; i < count; i++) {
      const randomPeriod = timetablePeriods[Math.floor(Math.random() * timetablePeriods.length)];
      
      // Generate random date within last 60 days (excluding weekends)
      let substitutionDate: Date;
      let dateStr: string;
      let attempts = 0;
      
      do {
        const daysAgo = Math.floor(Math.random() * 60);
        substitutionDate = new Date();
        substitutionDate.setDate(substitutionDate.getDate() - daysAgo);
        dateStr = `${randomPeriod.id}_${substitutionDate.toISOString().split('T')[0]}`;
        attempts++;
      } while (
        (substitutionDate.getDay() === 0 || substitutionDate.getDay() === 6 || usedPeriodDates.has(dateStr)) && 
        attempts < 20
      );
      
      if (attempts >= 20) continue; // Skip if couldn't find unique date
      
      usedPeriodDates.add(dateStr);
      
      // Find substitute teacher (different from original teacher)
      const availableSubstitutes = teachers.filter(t => t.id !== randomPeriod.teacherId);
      if (availableSubstitutes.length === 0) continue;
      
      const substituteTeacher = availableSubstitutes[Math.floor(Math.random() * availableSubstitutes.length)];
      
      // Random reason
      const reason = SUBSTITUTION_REASONS[Math.floor(Math.random() * SUBSTITUTION_REASONS.length)];
      
      // Status and approval logic
      const isApproved = Math.random() > 0.15; // 85% approved
      const isPending = Math.random() > 0.9; // 10% still pending
      
      let status = 'approved';
      let approvedAt: Date | null = new Date();
      
      if (isPending) {
        status = 'pending';
        approvedAt = null;
      } else if (!isApproved) {
        status = 'rejected';
      }
      
      try {
        const substitution = await prisma.substitution.create({
          data: {
            branchId,
            periodId: randomPeriod.id,
            substituteTeacherId: substituteTeacher.id,
            date: substitutionDate,
            reason,
            status,
            approvedBy: status !== 'pending' ? 'PRINCIPAL001' : null,
            approvedAt
          }
        });
        substitutions.push(substitution);
      } catch (error) {
        // Skip duplicates or constraint violations
        console.log(`⚠️ Skipped substitution due to constraint: ${(error as Error).message.slice(0, 50)}...`);
        continue;
      }
    }
    
    console.log(`✅ Generated ${substitutions.length} substitution records`);
    
    // Generate summary statistics
    const statusCounts = {
      approved: substitutions.filter(s => s.status === 'approved').length,
      pending: substitutions.filter(s => s.status === 'pending').length,
      rejected: substitutions.filter(s => s.status === 'rejected').length
    };
    
    console.log('\n📊 SUBSTITUTION SUMMARY');
    console.log('='.repeat(30));
    console.log(`✅ Approved: ${statusCounts.approved}`);
    console.log(`⏳ Pending: ${statusCounts.pending}`);
    console.log(`❌ Rejected: ${statusCounts.rejected}`);
    
    // Show recent substitutions
    console.log('\n📅 RECENT SUBSTITUTIONS (Sample):');
    console.log('-'.repeat(50));
    const recent = substitutions.slice(0, 5);
    for (const sub of recent) {
      const period = timetablePeriods.find(p => p.id === sub.periodId);
      const teacher = teachers.find(t => t.id === sub.substituteTeacherId);
      console.log(`${sub.date.toISOString().split('T')[0]} | Period ${period?.periodNumber} | ${teacher ? 'Teacher assigned' : 'No teacher'} | ${sub.status.toUpperCase()}`);
    }
    
    return substitutions;
    
  } catch (error) {
    console.error('❌ Error generating substitutions:', error);
    throw error;
  }
}

// ========== MAIN EXECUTION ==========
async function main() {
  console.log('🚀 PARAMARSH SMS - SUBSTITUTION GENERATOR');
  console.log('='.repeat(45));
  
  try {
    const branchId = process.argv[2] || 'dps-main';
    const count = parseInt(process.argv[3]) || 100;
    
    const result = await generateSubstitutions(branchId, count);
    
    console.log('\n🎉 Substitution generation completed successfully!');
    console.log('📚 Ready for substitution testing and demos');
    
  } catch (error) {
    console.error('💥 Generation failed:', error);
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

export { generateSubstitutions };