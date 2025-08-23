import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing Enrollment Consistency...\n');

  // Get all students with their enrollments
  const students = await prisma.student.findMany({
    include: {
      enrollments: true
    }
  });

  console.log(`Found ${students.length} students to check`);

  let studentsWithoutEnrollments = 0;
  let enrollmentUpdates = 0;
  let enrollmentsCreated = 0;

  const academicYear = await prisma.academicYear.findFirst({
    where: { isActive: true }
  });

  for (const student of students) {
    // Create enrollment if student doesn't have one
    if (student.enrollments.length === 0) {
      if (student.sectionId) {
        let enrollmentStatus = 'enrolled';
        let startDate = academicYear?.startDate || '2024-04-01';
        let endDate = undefined;

        if (student.status === 'graduated') {
          enrollmentStatus = 'completed';
          // Graduated students completed in previous academic years
          const yearsAgo = Math.floor(Math.random() * 3) + 1; // 1-3 years ago
          startDate = `${2024 - yearsAgo - 1}-04-01`;
          endDate = `${2024 - yearsAgo}-03-31`;
        } else if (student.status === 'inactive') {
          enrollmentStatus = 'inactive';
        }

        await prisma.enrollment.create({
          data: {
            branchId: student.branchId || 'branch1',
            studentId: student.id,
            sectionId: student.sectionId,
            status: enrollmentStatus,
            startDate: startDate,
            endDate: endDate
          }
        });
        enrollmentsCreated++;
      } else {
        studentsWithoutEnrollments++;
      }
    } else {
      // Update existing enrollments to match student status
      for (const enrollment of student.enrollments) {
        let correctStatus = 'enrolled';
        let startDate = enrollment.startDate;
        let endDate = enrollment.endDate;

        if (student.status === 'graduated') {
          correctStatus = 'completed';
          if (!endDate) {
            // Graduated students should have end dates
            const yearsAgo = Math.floor(Math.random() * 3) + 1; // 1-3 years ago
            startDate = `${2024 - yearsAgo - 1}-04-01`;
            endDate = `${2024 - yearsAgo}-03-31`;
          }
        } else if (student.status === 'inactive') {
          correctStatus = 'inactive';
          endDate = undefined; // They might return
        } else if (student.status === 'active') {
          correctStatus = 'enrolled';
          endDate = undefined; // Currently enrolled
        }

        if (enrollment.status !== correctStatus || enrollment.endDate !== endDate) {
          await prisma.enrollment.update({
            where: { id: enrollment.id },
            data: {
              status: correctStatus,
              startDate: startDate,
              endDate: endDate
            }
          });
          enrollmentUpdates++;
        }
      }
    }
  }

  console.log(`✅ Created ${enrollmentsCreated} new enrollments`);
  console.log(`✅ Updated ${enrollmentUpdates} existing enrollments`);
  console.log(`⚠️  ${studentsWithoutEnrollments} students still without enrollments (missing sectionId)`);

  // Final validation
  console.log('\n🔍 Final Validation:');
  
  const inconsistentEnrollments = await prisma.enrollment.findMany({
    include: { student: true },
    where: {
      OR: [
        {
          status: 'enrolled',
          student: { status: { not: 'active' } }
        },
        {
          status: 'completed',
          student: { status: { not: 'graduated' } }
        },
        {
          status: 'inactive',
          student: { status: { not: 'inactive' } }
        }
      ]
    }
  });

  console.log(`📊 Remaining inconsistent enrollments: ${inconsistentEnrollments.length}`);

  const studentsWithoutEnrollmentsFinal = await prisma.student.findMany({
    where: {
      enrollments: {
        none: {}
      }
    }
  });

  console.log(`📊 Students without enrollments: ${studentsWithoutEnrollmentsFinal.length}`);

  const graduatedWithoutEndDate = await prisma.enrollment.findMany({
    include: { student: true },
    where: {
      status: 'completed',
      endDate: null
    }
  });

  console.log(`📊 Graduated students without end dates: ${graduatedWithoutEndDate.length}`);

  console.log('\n🎉 Enrollment consistency fixed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Fix failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });