import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate realistic student status based on grade level and target distribution:
 * - 70% active (currently enrolled)
 * - 10% inactive (on leave, suspended, etc.)
 * - 20% graduated (for historical data)
 * 
 * Graduated students should be more likely in higher classes (Class 8-10)
 */
function getRealisticStudentStatus(gradeLevel: number): string {
  const rand = Math.random();
  
  // Higher classes (Class 8-10) have more graduated students
  if (gradeLevel >= 10) { // Class 8 and above
    if (rand < 0.50) return 'active';     // 50% active
    if (rand < 0.60) return 'inactive';   // 10% inactive
    return 'graduated';                   // 40% graduated
  } else if (gradeLevel >= 8) { // Class 6-7
    if (rand < 0.60) return 'active';     // 60% active
    if (rand < 0.70) return 'inactive';   // 10% inactive
    return 'graduated';                   // 30% graduated
  } else if (gradeLevel >= 5) { // Class 3-5
    if (rand < 0.75) return 'active';     // 75% active
    if (rand < 0.85) return 'inactive';   // 10% inactive
    return 'graduated';                   // 15% graduated
  } else { // Lower classes (Nursery-Class 2)
    if (rand < 0.85) return 'active';     // 85% active
    if (rand < 0.95) return 'inactive';   // 10% inactive
    return 'graduated';                   // 5% graduated
  }
}

async function main() {
  console.log('🔧 Fixing Student Status Distribution...\n');

  // Get all students
  const students = await prisma.student.findMany();
  
  // Get all classes and sections for reference
  const classes = await prisma.class.findMany();
  const sections = await prisma.section.findMany();
  
  // Create lookup maps
  const classMap = classes.reduce((acc, cls) => {
    acc[cls.id] = cls;
    return acc;
  }, {} as Record<string, any>);
  
  const sectionMap = sections.reduce((acc, section) => {
    acc[section.id] = section;
    return acc;
  }, {} as Record<string, any>);

  console.log(`Found ${students.length} students to update`);

  // Current status distribution
  const currentStatusCounts = students.reduce((acc, student) => {
    acc[student.status] = (acc[student.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n📊 Current Status Distribution:');
  Object.entries(currentStatusCounts).forEach(([status, count]) => {
    const percentage = ((count / students.length) * 100).toFixed(1);
    console.log(`  - ${status}: ${count} (${percentage}%)`);
  });

  let updatedCount = 0;
  const newStatusCounts = { active: 0, inactive: 0, graduated: 0 };

  // Update each student's status
  for (const student of students) {
    const section = sectionMap[student.sectionId];
    const cls = section ? classMap[section.classId] : null;
    const gradeLevel = cls?.gradeLevel || 1;
    const newStatus = getRealisticStudentStatus(gradeLevel);
    
    newStatusCounts[newStatus]++;

    if (student.status !== newStatus) {
      await prisma.student.update({
        where: { id: student.id },
        data: { status: newStatus }
      });
      updatedCount++;
    }
  }

  console.log(`\n✅ Updated ${updatedCount} students`);

  console.log('\n📊 New Status Distribution:');
  Object.entries(newStatusCounts).forEach(([status, count]) => {
    const percentage = ((count / students.length) * 100).toFixed(1);
    console.log(`  - ${status}: ${count} (${percentage}%)`);
  });

  // Update enrollments for consistency
  console.log('\n🔄 Updating enrollments for consistency...');
  
  const academicYear = await prisma.academicYear.findFirst({
    where: { isActive: true }
  });

  let enrollmentUpdates = 0;

  for (const student of students) {
    const section = sectionMap[student.sectionId];
    const cls = section ? classMap[section.classId] : null;
    const gradeLevel = cls?.gradeLevel || 1;
    const newStatus = getRealisticStudentStatus(gradeLevel);

    // Find existing enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: { studentId: student.id }
    });

    if (enrollment) {
      let enrollmentStatus = 'enrolled';
      let startDate = academicYear?.startDate || '2024-04-01';
      let endDate = undefined;

      if (newStatus === 'graduated') {
        enrollmentStatus = 'completed';
        // Graduated students completed in previous academic years
        const yearsAgo = Math.floor(Math.random() * 3) + 1; // 1-3 years ago
        startDate = `${2024 - yearsAgo - 1}-04-01`;
        endDate = `${2024 - yearsAgo}-03-31`;
      } else if (newStatus === 'inactive') {
        enrollmentStatus = 'inactive';
        // They might return
      }

      if (enrollment.status !== enrollmentStatus) {
        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: {
            status: enrollmentStatus,
            startDate: startDate,
            endDate: endDate
          }
        });
        enrollmentUpdates++;
      }
    }
  }

  console.log(`✅ Updated ${enrollmentUpdates} enrollments`);

  // Final validation
  console.log('\n🔍 Final Validation:');
  
  const updatedStudents = await prisma.student.findMany();
  const finalStatusCounts = updatedStudents.reduce((acc, student) => {
    acc[student.status] = (acc[student.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = updatedStudents.length;
  console.log('\n📊 Final Status Distribution:');
  Object.entries(finalStatusCounts).forEach(([status, count]) => {
    const percentage = ((count / total) * 100).toFixed(1);
    console.log(`  - ${status}: ${count} (${percentage}%)`);
  });

  // Check graduated students by grade level
  const graduatedByGrade = await prisma.student.findMany({
    where: { status: 'graduated' }
  });

  let higherGradeGraduated = 0;
  let lowerGradeGraduated = 0;

  graduatedByGrade.forEach(student => {
    const section = sectionMap[student.sectionId];
    const cls = section ? classMap[section.classId] : null;
    const gradeLevel = cls?.gradeLevel || 0;
    if (gradeLevel >= 8) {
      higherGradeGraduated++;
    } else {
      lowerGradeGraduated++;
    }
  });

  console.log('\n🎓 Graduated Students by Grade Level:');
  console.log(`  - Higher grades (8+): ${higherGradeGraduated}`);
  console.log(`  - Lower grades (<8): ${lowerGradeGraduated}`);

  // Use existing classes data
  const sortedClasses = classes.sort((a, b) => (b.gradeLevel || 0) - (a.gradeLevel || 0));

  console.log('\n📚 Classes with Graduated Students (for testing):');
  for (const cls of sortedClasses.slice(0, 5)) {
    const classSections = sections.filter(s => s.classId === cls.id);
    const graduatedInClass = await prisma.student.count({
      where: {
        sectionId: {
          in: classSections.map(s => s.id)
        },
        status: 'graduated'
      }
    });

    if (graduatedInClass > 0) {
      console.log(`  - ${cls.name} (Grade ${cls.gradeLevel}): ${graduatedInClass} graduated students`);
      console.log(`    Sample query: ?status=graduated&classId=${cls.id}`);
    }
  }

  console.log('\n🎉 Student status distribution fixed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Fix failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });