/**
 * StudentSeeder Entity
 * Generates student data with authentic Indian names and proper relationships
 */

import { BaseSeeder } from '../core/BaseSeeder';
import { SeedContext, SeedResult } from '../core/interfaces';
import { PrismaClient } from '@prisma/client';

// Indian names database (matching old seed)
const INDIAN_NAMES = {
  male: {
    first: [
      'Aarav', 'Arjun', 'Vivaan', 'Aditya', 'Ishaan', 'Pranav', 'Reyansh', 'Krishna', 'Sai', 'Arnav',
      'Ayaan', 'Atharva', 'Aryan', 'Kabir', 'Avinash', 'Rohan', 'Rudra', 'Vedant', 'Yash', 'Dhruv',
      'Kartik', 'Gaurav', 'Harsh', 'Mihir', 'Nikhil', 'Parth', 'Rishi', 'Samarth', 'Tanish', 'Utkarsh',
      'Varun', 'Viraj', 'Abhishek', 'Akash', 'Aman', 'Ankit', 'Ashwin', 'Dev', 'Karthik', 'Manish',
      'Neeraj', 'Piyush', 'Rahul', 'Rajat', 'Sanjay', 'Shivam', 'Siddharth', 'Surya', 'Tarun', 'Vishal'
    ],
    last: [
      'Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Reddy', 'Rao', 'Patel', 'Shah', 'Mehta',
      'Joshi', 'Desai', 'Nair', 'Menon', 'Pillai', 'Iyer', 'Iyengar', 'Choudhury', 'Banerjee', 'Mukherjee',
      'Das', 'Bose', 'Roy', 'Ghosh', 'Chatterjee', 'Khan', 'Ahmed', 'Syed', 'Ali', 'Fernandes',
      'D\'Souza', 'Rodrigues', 'Pereira', 'Naidu', 'Raju', 'Yadav', 'Pandey', 'Mishra', 'Tiwari', 'Dubey',
      'Shukla', 'Agarwal', 'Jain', 'Singhal', 'Goyal', 'Mittal', 'Malhotra', 'Kapoor', 'Chopra', 'Arora'
    ]
  },
  female: {
    first: [
      'Aadhya', 'Saanvi', 'Aarohi', 'Ananya', 'Diya', 'Ishani', 'Kavya', 'Navya', 'Pari', 'Sara',
      'Aanya', 'Aisha', 'Akshara', 'Anvi', 'Avani', 'Bhavya', 'Charvi', 'Darshana', 'Eesha', 'Gauri',
      'Ira', 'Jiya', 'Kiara', 'Lavanya', 'Mahika', 'Nandini', 'Oviya', 'Palak', 'Rhea', 'Samaira',
      'Tanvi', 'Uma', 'Vanya', 'Yashasvi', 'Zara', 'Aditi', 'Anjali', 'Deepika', 'Divya', 'Gayatri',
      'Kavita', 'Meera', 'Neha', 'Pooja', 'Priya', 'Rashmi', 'Shweta', 'Sneha', 'Srishti', 'Swati'
    ],
    last: [] // Will be same as male
  }
};

// Initialize female last names
INDIAN_NAMES.female.last = [...INDIAN_NAMES.male.last];

export class StudentSeeder extends BaseSeeder {
  public entityName = 'students';
  public dependencies = ['tenants', 'classes'];
  public priority = 25; // After classes
  
  private globalAdmissionCounter = 1;
  private readonly studentsPerSectionRange = { min: 30, max: 40 }; // Match old seed

  async seedEntity(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    const students: any[] = [];
    const errors: string[] = [];

    try {
      // Check if students already exist for this branch
      const existingStudents = await context.prisma.student.findMany({
        where: { branchId: context.branchId }
      });
      
      if (existingStudents.length > 0) {
        // Students already exist, return them
        context.createdEntities.set('students', existingStudents);
        return {
          success: true,
          entityName: this.entityName,
          metrics: {
            startTime: new Date(startTime),
            endTime: new Date(),
            totalRecords: existingStudents.length,
            successCount: existingStudents.length,
            errorCount: 0,
            duration: Date.now() - startTime
          },
          data: [],
          errors: [],
          warnings: []
        };
      }

      // Get classes and sections from context
      const classes = context.createdEntities.get('classes') || [];
      const sections = context.createdEntities.get('sections') || [];

      // If sections not explicitly set but classes exist, they should have been created together
      if (sections.length === 0 && classes.length > 0) {
        // Classes were created, so sections should exist in DB
        const fetchedSections = await context.prisma.section.findMany({
          where: { branchId: context.branchId }
        });
        if (fetchedSections.length > 0) {
          context.createdEntities.set('sections', fetchedSections);
        }
      }
      
      const finalSections = context.createdEntities.get('sections') || [];
      
      if (finalSections.length === 0) {
        return {
          success: false,
          entityName: this.entityName,
          metrics: {
            startTime: new Date(startTime),
            endTime: new Date(),
            totalRecords: 0,
            successCount: 0,
            errorCount: 1,
            duration: Date.now() - startTime
          },
          errors: ['Missing dependency: classes']
        };
      }

      // Generate students for each section (matching old seed logic)
      for (const section of finalSections) {
        const cls = classes.find((c: any) => c.id === section.classId);
        if (!cls) continue;

        // Generate students for this section (30-40 students per section)
        const studentsInSection = this.getStudentsPerSection();
        
        for (let i = 0; i < studentsInSection; i++) {
          try {
            const student = await this.createStudent(
              context, 
              cls, 
              section, 
              i + 1 // Roll number
            );
            students.push(student);
          } catch (error) {
            errors.push(`Failed to create student ${i + 1} in section ${section.name}: ${error}`);
          }
        }
      }

      // Store created students in context for dependent seeders
      context.createdEntities.set('students', students);

      return {
        success: errors.length === 0,
        entityName: this.entityName,
        metrics: {
            startTime: new Date(startTime),
            endTime: new Date(),
          totalRecords: students.length,
          successCount: students.length,
          errorCount: errors.length,
          duration: Date.now() - startTime
        },
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      return {
        success: false,
        entityName: this.entityName,
        metrics: {
            startTime: new Date(startTime),
            endTime: new Date(),
          totalRecords: 0,
          successCount: 0,
          errorCount: 1,
          duration: Date.now() - startTime
        },
        errors: [new Error(`Critical error in StudentSeeder: ${error}`)]
      };
    }
  }

  private async createStudent(
    context: SeedContext,
    cls: any,
    section: any,
    rollNumber: number
  ): Promise<any> {
    const gender = this.getGender();
    const name = this.getRandomName(gender);
    const dob = this.getAgeAppropriateDOB(cls.gradeLevel || 1);
    const status = this.getRealisticStudentStatus(cls.gradeLevel || 1);

    const student = await context.prisma.student.create({
      data: {
        branchId: context.branchId,
        admissionNo: this.generateAdmissionNumber(),
        firstName: name.first,
        lastName: name.last,
        dob: dob,
        gender: gender,
        classId: cls.id,
        sectionId: section.id,
        rollNumber: String(rollNumber),
        status: status
      }
    });

    return student;
  }

  private getStudentsPerSection(): number {
    // Generate 30-40 students per section with some variance
    const base = this.studentsPerSectionRange.min;
    const variance = this.studentsPerSectionRange.max - this.studentsPerSectionRange.min;
    return base + Math.floor(Math.random() * (variance + 1));
  }

  private getGender(): 'male' | 'female' {
    // Slight male preference (52% male as per old seed)
    return Math.random() > 0.48 ? 'male' : 'female';
  }

  private getRandomName(gender: 'male' | 'female'): { first: string, last: string } {
    const firstNames = INDIAN_NAMES[gender].first;
    const lastNames = INDIAN_NAMES[gender].last;
    
    return {
      first: firstNames[Math.floor(Math.random() * firstNames.length)],
      last: lastNames[Math.floor(Math.random() * lastNames.length)]
    };
  }

  private generateAdmissionNumber(): string {
    // Format: CBSE20250001, CBSE20250002, etc.
    const year = new Date().getFullYear();
    const paddedNumber = String(this.globalAdmissionCounter).padStart(4, '0');
    this.globalAdmissionCounter++;
    return `CBSE${year}${paddedNumber}`;
  }

  private getAgeAppropriateDOB(gradeLevel: number): string {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - gradeLevel - 4; // Age = grade + 4 years
    
    // Random month and day
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1; // Safe for all months
    
    return `${birthYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  private getRealisticStudentStatus(gradeLevel: number): string {
    const rand = Math.random();
    
    if (gradeLevel >= 12) { // Class 10 and above
      if (rand < 0.45) return 'active';     // 45% active
      if (rand < 0.55) return 'inactive';   // 10% inactive
      return 'graduated';                   // 45% graduated
    } else if (gradeLevel >= 9) { // Class 7-9
      if (rand < 0.60) return 'active';     // 60% active
      if (rand < 0.70) return 'inactive';   // 10% inactive
      return 'graduated';                   // 30% graduated
    } else if (gradeLevel >= 5) { // Class 3-6
      if (rand < 0.75) return 'active';     // 75% active
      if (rand < 0.85) return 'inactive';   // 10% inactive
      return 'graduated';                   // 15% graduated
    } else { // Lower classes (Nursery-Class 2)
      if (rand < 0.85) return 'active';     // 85% active
      if (rand < 0.95) return 'inactive';   // 10% inactive
      return 'graduated';                   // 5% graduated
    }
  }
}