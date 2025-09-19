/**
 * Teacher Seeder - Indian school teacher data generation
 * Following V3-IMPLEMENTATION-SPEC.md and TDD methodology
 */

import { PrismaSeeder } from '../core/PrismaSeeder';
import { SeedContext, SeedResult } from '../core/interfaces';
import { BRANCH_CONFIGS, BranchId } from '../data/indian-data-constants';

export class TeacherSeeder extends PrismaSeeder {
  readonly entityName = 'teachers';
  readonly dependencies = ['tenants', 'subjects'];
  readonly priority = 20; // After subjects
  
  constructor() {
    super(50); // Smaller batch size due to nested transactions
  }

  async seed(context: SeedContext): Promise<SeedResult> {
    const teachersData = this.generateTeachers(context);
    
    context.logger.info(`Starting teachers seeding for ${context.branchId}`, {
      count: teachersData.length,
      branchId: context.branchId
    });

    return this.createMany(
      context,
      teachersData,
      async (batch) => {
        const createdTeachers = [];
        
        for (const teacherData of batch) {
          // First create the Staff record
          const staff = await context.prisma.staff.create({
            data: {
              id: teacherData.staffId,
              branchId: context.branchId,
              firstName: teacherData.firstName,
              lastName: teacherData.lastName,
              email: teacherData.email,
              phone: teacherData.phone,
              designation: 'Teacher',
              department: teacherData.department,
              employmentType: 'Full-time',
              joinDate: teacherData.hireDate,
              status: 'Active'
            }
          });

          // Then create the Teacher record
          const teacher = await context.prisma.teacher.create({
            data: {
              id: teacherData.id,
              branchId: context.branchId,
              staffId: staff.id,
              subjects: teacherData.subjects,
              qualifications: teacherData.qualification,
              experienceYears: teacherData.experienceYears
            }
          });

          createdTeachers.push(teacher);
        }
        
        return createdTeachers;
      }
    );
  }

  protected async getRecordCount(context: SeedContext): Promise<number> {
    return context.prisma.teacher.count({
      where: { branchId: context.branchId }
    });
  }

  async cleanup(context: SeedContext): Promise<void> {
    // Delete teachers first (due to foreign key)
    await context.prisma.teacher.deleteMany({
      where: { branchId: context.branchId }
    });
    // Then delete staff
    await context.prisma.staff.deleteMany({
      where: { branchId: context.branchId }
    });
    context.logger.info(`Cleaned up teachers and staff for branch ${context.branchId}`);
  }

  estimateRecordCount(branchId: string): number {
    const settings = this.getBranchSettings(branchId);
    return settings.teacherCount || 30;
  }

  /**
   * Generate teachers based on branch configuration
   */
  private generateTeachers(context: SeedContext) {
    const subjects = context.createdEntities.get('subjects') || [];
    if (subjects.length === 0) {
      context.logger.warn('No subjects found, creating minimal teachers');
    }

    const settings = this.getBranchSettings(context.branchId);
    const teacherCount = settings.teacherCount || 30;
    const teachers = [];

    // Ensure we have enough teachers for all subjects
    const teachersPerSubject = Math.max(2, Math.ceil(teacherCount / Math.max(subjects.length, 1)));
    
    for (let i = 0; i < teacherCount; i++) {
      const teacher = this.generateTeacherData(
        context.branchId,
        i,
        subjects[i % Math.max(subjects.length, 1)]
      );
      teachers.push(teacher);
    }

    return teachers;
  }

  /**
   * Generate individual teacher data with Indian context
   */
  private generateTeacherData(branchId: string, index: number, subject: any) {
    const firstName = this.getRandomFirstName(index);
    const lastName = this.getRandomLastName(index);
    // Add timestamp to ensure uniqueness across multiple test runs
    const timestamp = Date.now().toString(36).slice(-4);
    const staffId = `${branchId}-staff-${index + 1}-${timestamp}`;
    const teacherId = `${branchId}-teacher-${index + 1}-${timestamp}`;
    const email = this.generateEmail(firstName, lastName);
    const phone = this.generateIndianPhone(index);
    const qualification = this.getRandomQualification(subject?.name);
    const hireDate = this.generateHireDate(index);
    const experienceYears = this.calculateExperienceYears(hireDate);
    const department = this.getDepartmentFromSubject(subject?.name);

    return {
      id: teacherId,
      staffId: staffId,
      firstName: firstName,
      lastName: lastName,
      name: `${firstName} ${lastName}`,
      employeeId: this.generateEmployeeId(branchId, index),
      email: email,
      phone: phone,
      subjects: subject?.name || null,
      subjectId: subject?.id || null,
      qualification: qualification,
      hireDate: hireDate,
      experienceYears: experienceYears,
      department: department
    };
  }

  /**
   * Generate unique employee ID
   */
  private generateEmployeeId(branchId: string, index: number): string {
    // Format: EMP-XXXX
    const baseNumber = 1000 + index;
    return `EMP-${baseNumber}`;
  }

  /**
   * Generate school email address
   */
  private generateEmail(firstName: string, lastName: string): string {
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@school.edu.in`;
  }

  /**
   * Generate Indian mobile phone number
   */
  private generateIndianPhone(index: number): string {
    // Indian mobile numbers start with 6-9
    const prefixes = ['6', '7', '8', '9'];
    const prefix = prefixes[index % 4];
    const number = 1000000000 + (index * 12345) % 9000000000;
    return `+91${prefix}${number.toString().slice(1, 10)}`;
  }

  /**
   * Get random Indian first name
   */
  private getRandomFirstName(index: number): string {
    const firstNames = [
      'Rajesh', 'Priya', 'Amit', 'Sunita', 'Vijay', 'Kavita', 'Suresh', 'Anita',
      'Manoj', 'Pooja', 'Arun', 'Neha', 'Sanjay', 'Rekha', 'Deepak', 'Meera',
      'Rakesh', 'Shweta', 'Ashok', 'Jyoti', 'Ravi', 'Asha', 'Nitin', 'Seema',
      'Anil', 'Rita', 'Mukesh', 'Nisha', 'Pankaj', 'Geeta', 'Vinod', 'Madhuri',
      'Sunil', 'Vandana', 'Rajiv', 'Swati', 'Alok', 'Sarita', 'Gaurav', 'Rashmi'
    ];
    return firstNames[index % firstNames.length];
  }

  /**
   * Get random Indian last name
   */
  private getRandomLastName(index: number): string {
    const lastNames = [
      'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Reddy', 'Iyer',
      'Nair', 'Rao', 'Mishra', 'Joshi', 'Agarwal', 'Mehta', 'Shah', 'Pandey',
      'Desai', 'Kulkarni', 'Malhotra', 'Kapoor', 'Chowdhury', 'Das', 'Bose', 'Sen',
      'Pillai', 'Menon', 'Srivastava', 'Saxena', 'Tandon', 'Khanna', 'Chopra', 'Bhatia'
    ];
    return lastNames[Math.floor(index * 1.3) % lastNames.length];
  }

  /**
   * Get appropriate qualification based on subject
   */
  private getRandomQualification(subjectName?: string): string {
    const qualifications: Record<string, string[]> = {
      'Mathematics': ['M.Sc B.Ed', 'B.Sc B.Ed', 'M.Tech', 'PhD'],
      'Physics': ['M.Sc B.Ed', 'B.Sc B.Ed', 'M.Tech', 'PhD'],
      'Chemistry': ['M.Sc B.Ed', 'B.Sc B.Ed', 'PhD'],
      'Biology': ['M.Sc B.Ed', 'B.Sc B.Ed', 'PhD'],
      'English': ['MA B.Ed', 'BA B.Ed', 'M.Ed', 'PhD'],
      'Hindi': ['MA B.Ed', 'BA B.Ed', 'M.Ed'],
      'History': ['MA B.Ed', 'BA B.Ed', 'M.Ed'],
      'Geography': ['MA B.Ed', 'BA B.Ed', 'M.Ed'],
      'Computer Science': ['B.Tech B.Ed', 'M.Tech', 'MCA B.Ed'],
      'Physical Education': ['B.Ed', 'M.Ed', 'B.P.Ed'],
      'Art': ['BA B.Ed', 'M.Ed', 'BFA'],
      'default': ['B.Ed', 'M.Ed', 'B.Sc B.Ed', 'BA B.Ed']
    };

    const subjectQualifications = qualifications[subjectName || 'default'] || qualifications.default;
    return subjectQualifications[Math.floor(Math.random() * subjectQualifications.length)];
  }

  /**
   * Generate hire date within last 20 years
   */
  private generateHireDate(index: number): string {
    const currentYear = new Date().getFullYear();
    const yearsAgo = Math.floor(index / 3) % 20; // Distribute over 20 years
    const year = currentYear - yearsAgo;
    const month = (index % 12) + 1;
    const day = ((index * 7) % 28) + 1;
    
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  /**
   * Calculate experience years from hire date
   */
  private calculateExperienceYears(hireDate: string): number {
    const currentYear = new Date().getFullYear();
    const hireYear = parseInt(hireDate.split('-')[0]);
    return currentYear - hireYear;
  }

  /**
   * Get department from subject name
   */
  private getDepartmentFromSubject(subjectName?: string): string {
    const departmentMap: Record<string, string> = {
      'Mathematics': 'Mathematics',
      'Physics': 'Science',
      'Chemistry': 'Science',
      'Biology': 'Science',
      'Science': 'Science',
      'English': 'Languages',
      'Hindi': 'Languages',
      'Sanskrit': 'Languages',
      'History': 'Social Studies',
      'Geography': 'Social Studies',
      'Civics': 'Social Studies',
      'Social Studies': 'Social Studies',
      'Computer Science': 'Computer Science',
      'Physical Education': 'Sports',
      'Art': 'Arts',
      'Music': 'Arts'
    };

    return departmentMap[subjectName || ''] || 'General';
  }
}