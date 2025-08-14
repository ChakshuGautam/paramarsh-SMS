import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting simple database seed...');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.student.deleteMany({});
  await prisma.guardian.deleteMany({});
  await prisma.section.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.tenant.deleteMany({});

  // Create tenant
  console.log('🏢 Creating tenant...');
  await prisma.tenant.create({
    data: {
      id: 'tenant_default',
      name: 'Default School',
      subdomain: 'default'
    }
  });

  // Create classes
  console.log('📚 Creating classes...');
  const classes = [];
  for (let i = 1; i <= 10; i++) {
    const cls = await prisma.class.create({
      data: {
        name: `Grade ${i}`,
        gradeLevel: i
      }
    });
    classes.push(cls);
  }

  // Create sections for each class
  console.log('📝 Creating sections...');
  const sections = [];
  for (const cls of classes) {
    for (const sectionName of ['A', 'B']) {
      const section = await prisma.section.create({
        data: {
          name: sectionName,
          classId: cls.id,
          capacity: 30
        }
      });
      sections.push(section);
    }
  }

  // Create students with guardians
  console.log('👨‍👩‍👧‍👦 Creating students and guardians...');
  let studentCount = 1;
  for (const section of sections.slice(0, 10)) { // Only first 10 sections
    for (let i = 0; i < 5; i++) { // 5 students per section
      const student = await prisma.student.create({
        data: {
          admissionNo: `ADM${String(studentCount++).padStart(4, '0')}`,
          firstName: `Student${studentCount}`,
          lastName: `LastName${studentCount}`,
          dob: '2010-01-01',
          gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
          classId: section.classId,
          sectionId: section.id
        }
      });

      // Create guardian for each student
      await prisma.guardian.create({
        data: {
          studentId: student.id,
          name: `Parent of ${student.firstName}`,
          relation: 'Parent',
          email: `parent${studentCount}@example.com`,
          phone: `555-${String(studentCount).padStart(4, '0')}`
        }
      });
    }
  }

  console.log('✅ Simple seed completed successfully!');
  
  // Display summary
  const studentTotal = await prisma.student.count();
  const classTotal = await prisma.class.count();
  const sectionTotal = await prisma.section.count();
  const guardianTotal = await prisma.guardian.count();
  
  console.log('\n📊 Database Summary:');
  console.log(`  - Classes: ${classTotal}`);
  console.log(`  - Sections: ${sectionTotal}`);
  console.log(`  - Students: ${studentTotal}`);
  console.log(`  - Guardians: ${guardianTotal}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });