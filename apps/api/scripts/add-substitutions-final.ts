import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addSubstitutionsFinal() {
  console.log('🔄 FINAL SUBSTITUTION FIX');
  console.log('=========================');
  
  // Get data
  const branches = await prisma.tenant.findMany();
  const teachers = await prisma.teacher.findMany();
  const timetablePeriods = await prisma.timetablePeriod.findMany();
  
  let totalSubstitutions = 0;
  
  console.log(`📊 Found: ${branches.length} branches, ${teachers.length} teachers, ${timetablePeriods.length} periods`);
  
  for (const branch of branches) {
    const branchTeachers = teachers.filter(t => t.branchId === branch.id);
    const branchPeriods = timetablePeriods.filter(tp => tp.branchId === branch.id);
    
    if (branchTeachers.length < 2 || branchPeriods.length === 0) {
      console.log(`⚠️ Skipping ${branch.name} - insufficient data`);
      continue;
    }
    
    console.log(`🔄 Processing ${branch.name} (${branchTeachers.length} teachers, ${branchPeriods.length} periods)...`);
    
    let branchSubstitutions = 0;
    
    // Create 3 substitutions per branch
    for (let i = 0; i < 3; i++) {
      const daysAgo = Math.floor(Math.random() * 20) + 1; // 1-20 days ago
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - daysAgo);
      
      const substituteTeacher = branchTeachers[Math.floor(Math.random() * branchTeachers.length)];
      const period = branchPeriods[Math.floor(Math.random() * branchPeriods.length)];
      
      const reasons = [
        'Sick leave',
        'Personal emergency', 
        'Medical appointment',
        'Training program',
        'Family function'
      ];
      
      try {
        await prisma.substitution.create({
          data: {
            branchId: branch.id,
            periodId: period.id,
            substituteTeacherId: substituteTeacher.id,
            date: currentDate,
            reason: reasons[Math.floor(Math.random() * reasons.length)],
            status: 'approved'
          }
        });
        branchSubstitutions++;
        totalSubstitutions++;
      } catch (error) {
        console.log(`   ⚠️ Failed to create substitution: ${error.message}`);
      }
    }
    
    console.log(`✅ Added ${branchSubstitutions} substitutions for ${branch.name}`);
  }
  
  console.log(`\n🔄 TOTAL SUBSTITUTIONS ADDED: ${totalSubstitutions}`);
  
  // Final check
  const finalSubstitutions = await prisma.substitution.count();
  console.log(`🔄 Final substitution count: ${finalSubstitutions}`);
  
  if (finalSubstitutions > 0) {
    console.log('\n🎉 SUCCESS: Substitutions added successfully!');
  } else {
    console.log('\n❌ FAILURE: No substitutions were created');
  }
}

addSubstitutionsFinal()
  .catch((e) => {
    console.error('❌ Failed to add substitutions:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });