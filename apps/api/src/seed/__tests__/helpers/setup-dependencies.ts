import { PrismaClient } from '@prisma/client';
import { SeedContext } from '../../core/interfaces';

/**
 * Helper to set up common test dependencies
 */
export async function setupBasicDependencies(
  prisma: PrismaClient,
  context: SeedContext,
  branchId: string
) {
  // Create Academic Year
  const academicYear = await prisma.academicYear.create({
    data: {
      id: `${branchId}-ay-2024`,
      branchId,
      name: '2024-25',
      startDate: '2024-04-01',
      endDate: '2025-03-31',
      isActive: true
    }
  });

  // Create Tenant
  const tenant = await prisma.tenant.create({
    data: {
      id: branchId,
      branchId,
      name: 'Test School',
      subdomain: 'test'
    }
  });

  // Store in context
  context.createdEntities.set('academicYears', [academicYear]);
  context.createdEntities.set('tenants', [tenant]);

  return { academicYear, tenant };
}

/**
 * Helper to set up classes with sections
 */
export async function setupClassesWithSections(
  prisma: PrismaClient,
  context: SeedContext,
  branchId: string,
  count: number = 3
) {
  const classes = [];
  const sections = [];

  for (let i = 1; i <= count; i++) {
    const classData = await prisma.class.create({
      data: {
        id: `${branchId}-class-${i}`,
        branchId,
        name: `Class ${i}`,
        gradeLevel: i
      }
    });
    classes.push(classData);

    // Create sections for each class
    const sectionNames = ['A', 'B'];
    for (const sectionName of sectionNames) {
      const section = await prisma.section.create({
        data: {
          id: `${branchId}-class-${i}-section-${sectionName}`,
          branchId,
          classId: classData.id,
          name: sectionName,
          capacity: 40
        }
      });
      sections.push(section);
    }
  }

  // Store in context
  context.createdEntities.set('classes', classes);
  context.createdEntities.set('sections', sections);

  return { classes, sections };
}

/**
 * Helper to set up subjects
 */
export async function setupSubjects(
  prisma: PrismaClient,
  context: SeedContext,
  branchId: string
) {
  const subjects = [];
  const subjectNames = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies'];

  for (const name of subjectNames) {
    const subject = await prisma.subject.create({
      data: {
        id: `${branchId}-subject-${name.toLowerCase().replace(' ', '-')}`,
        branchId,
        name,
        code: name.substring(0, 3).toUpperCase(),
        credits: 100
      }
    });
    subjects.push(subject);
  }

  // Store in context
  context.createdEntities.set('subjects', subjects);

  return subjects;
}

/**
 * Helper to set up teachers
 */
export async function setupTeachers(
  prisma: PrismaClient,
  context: SeedContext,
  branchId: string,
  count: number = 5
) {
  const teachers = [];

  for (let i = 1; i <= count; i++) {
    const teacher = await prisma.teacher.create({
      data: {
        id: `${branchId}-teacher-${i}`,
        branchId,
        employeeCode: `TCH${String(i).padStart(3, '0')}`,
        firstName: `Teacher${i}`,
        lastName: `Test`,
        email: `teacher${i}@test.edu`,
        phone: `+9198765432${String(i).padStart(2, '0')}`,
        address: `Address ${i}`,
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        qualification: 'M.Ed',
        experience: i + 2,
        department: 'Academic',
        position: 'Teacher',
        joinDate: '2020-01-01',
        isActive: true
      }
    });
    teachers.push(teacher);
  }

  // Store in context
  context.createdEntities.set('teachers', teachers);

  return teachers;
}