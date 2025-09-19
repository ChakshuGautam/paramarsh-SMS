/**
 * GuardianSeeder Entity
 * Generates guardian data with relationships to students
 * Following Indian family structures and naming conventions
 */

import { BaseSeeder } from '../core/BaseSeeder';
import { SeedContext, SeedResult } from '../core/interfaces';

// Indian names for guardians
const GUARDIAN_NAMES = {
  male: {
    first: [
      'Rajesh', 'Suresh', 'Ramesh', 'Mahesh', 'Ganesh', 'Naresh', 'Dinesh', 'Mukesh', 'Rakesh', 'Lokesh',
      'Anil', 'Sunil', 'Sanjay', 'Vijay', 'Ajay', 'Manoj', 'Pankaj', 'Neeraj', 'Dheeraj', 'Rajeev',
      'Ashok', 'Vinod', 'Pramod', 'Subhash', 'Prakash', 'Ravi', 'Shiv', 'Krishna', 'Mohan', 'Sohan',
      'Arun', 'Varun', 'Kiran', 'Charan', 'Karan', 'Arjun', 'Bharat', 'Chandra', 'Deepak', 'Govind'
    ],
    last: [] // Will use student last names for family consistency
  },
  female: {
    first: [
      'Sunita', 'Anita', 'Kavita', 'Savita', 'Mamta', 'Neeta', 'Geeta', 'Seeta', 'Rita', 'Meera',
      'Rekha', 'Sudha', 'Radha', 'Usha', 'Asha', 'Nisha', 'Disha', 'Trisha', 'Isha', 'Megha',
      'Pooja', 'Priya', 'Divya', 'Shreya', 'Jaya', 'Vijaya', 'Kalpana', 'Archana', 'Vandana', 'Sadhana',
      'Shobha', 'Usha', 'Pushpa', 'Kamla', 'Vimla', 'Sheela', 'Leela', 'Komal', 'Kamal', 'Nirmal'
    ],
    last: [] // Will use student last names for family consistency
  }
};

// Guardian relationships
const RELATIONSHIPS = ['father', 'mother', 'guardian', 'grandfather', 'grandmother', 'uncle', 'aunt'];

export class GuardianSeeder extends BaseSeeder {
  public entityName = 'guardians';
  public dependencies = ['students'];
  public priority = 30; // After students
  
  private phoneCounter = 9000000000; // Starting phone number

  async seedEntity(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    const guardians: any[] = [];
    const studentGuardians: any[] = [];
    const errors: string[] = [];

    try {
      // Check if guardians already exist for this branch
      const existingGuardians = await context.prisma.guardian.findMany({
        where: { branchId: context.branchId }
      });
      
      if (existingGuardians.length > 0) {
        // Guardians already exist, return them
        context.createdEntities.set('guardians', existingGuardians);
        return {
          success: true,
          entityName: this.entityName,
          metrics: {
            totalRecords: existingGuardians.length,
            successCount: existingGuardians.length,
            errorCount: 0,
            duration: Date.now() - startTime
          }
        };
      }

      // Get students from context
      const students = context.createdEntities.get('students') || [];

      if (students.length === 0) {
        return {
          success: false,
          entityName: this.entityName,
          metrics: {
            totalRecords: 0,
            successCount: 0,
            errorCount: 1,
            duration: Date.now() - startTime
          },
          errors: ['Missing dependency: students']
        };
      }

      // Group students by last name (family grouping)
      const familyGroups = this.groupStudentsByFamily(students);
      
      // Create guardians for each family
      for (const [lastName, familyStudents] of Object.entries(familyGroups)) {
        try {
          // Determine family structure (1-2 guardians per family)
          const guardianCount = Math.random() > 0.3 ? 2 : 1; // 70% have both parents
          
          for (let i = 0; i < guardianCount; i++) {
            const guardian = await this.createGuardian(
              context,
              lastName,
              i === 0 ? 'father' : 'mother',
              familyStudents as any[]
            );
            
            if (guardian) {
              guardians.push(guardian);
              
              // Create relationships with all students in family
              for (const student of familyStudents as any[]) {
                const relationship = await this.createStudentGuardianRelation(
                  context,
                  student,
                  guardian,
                  i === 0 ? 'father' : 'mother'
                );
                if (relationship) {
                  studentGuardians.push(relationship);
                }
              }
            }
          }
        } catch (error) {
          errors.push(`Failed to create guardians for family ${lastName}: ${error}`);
        }
      }

      // Store created entities in context
      context.createdEntities.set('guardians', guardians);
      context.createdEntities.set('studentGuardians', studentGuardians);

      return {
        success: errors.length === 0,
        entityName: this.entityName,
        metrics: {
          totalRecords: guardians.length + studentGuardians.length,
          successCount: guardians.length,
          errorCount: errors.length,
          duration: Date.now() - startTime
        },
        data: guardians,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      return {
        success: false,
        entityName: this.entityName,
        metrics: {
          totalRecords: 0,
          successCount: 0,
          errorCount: 1,
          duration: Date.now() - startTime
        },
        errors: [new Error(`Critical error in GuardianSeeder: ${error}`)]
      };
    }
  }

  private groupStudentsByFamily(students: any[]): Record<string, any[]> {
    const families: Record<string, any[]> = {};
    
    for (const student of students) {
      const lastName = student.lastName || 'Unknown';
      if (!families[lastName]) {
        families[lastName] = [];
      }
      families[lastName].push(student);
    }
    
    return families;
  }

  private async createGuardian(
    context: SeedContext,
    lastName: string,
    relationship: string,
    familyStudents: any[]
  ): Promise<any> {
    const gender = relationship === 'mother' ? 'female' : 'male';
    const firstName = this.getRandomFirstName(gender);
    const fullName = `${firstName} ${lastName}`;
    const email = this.generateEmail(firstName, lastName);
    const phone = this.generatePhoneNumber();
    
    // Get address from first student's data (same family address)
    const primaryStudent = familyStudents[0];
    
    const guardian = await context.prisma.guardian.create({
      data: {
        branchId: context.branchId,
        name: fullName,
        email: email,
        phoneNumber: phone,
        alternatePhoneNumber: Math.random() > 0.5 ? this.generatePhoneNumber() : null,
        occupation: this.getRandomOccupation(),
        address: this.generateAddress(context.branchId)
      }
    });

    return guardian;
  }

  private async createStudentGuardianRelation(
    context: SeedContext,
    student: any,
    guardian: any,
    relationship: string
  ): Promise<any> {
    try {
      const relation = await context.prisma.studentGuardian.create({
        data: {
          studentId: student.id,
          guardianId: guardian.id,
          relation: relationship,
          isPrimary: relationship === 'father' || relationship === 'mother',
          canPickup: true,
          emergencyContact: relationship === 'father' || relationship === 'mother'
        }
      });
      return relation;
    } catch (error) {
      // Handle potential duplicate relationships
      console.warn(`Relationship already exists for student ${student.id} and guardian ${guardian.id}`);
      return null;
    }
  }

  private getRandomFirstName(gender: 'male' | 'female'): string {
    const names = GUARDIAN_NAMES[gender].first;
    return names[Math.floor(Math.random() * names.length)];
  }

  private generateEmail(firstName: string, lastName: string): string {
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'rediffmail.com', 'hotmail.com'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const number = Math.floor(Math.random() * 999);
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${number}@${domain}`;
  }

  private generatePhoneNumber(): string {
    // Indian phone numbers: +91 9XXXXXXXXX
    this.phoneCounter++;
    return `+91${this.phoneCounter}`;
  }

  private getRandomOccupation(): string {
    const occupations = [
      'Engineer', 'Doctor', 'Teacher', 'Business Owner', 'Government Employee',
      'Lawyer', 'Accountant', 'Bank Manager', 'Software Developer', 'Architect',
      'Dentist', 'Pharmacist', 'Professor', 'Consultant', 'Entrepreneur',
      'Civil Servant', 'Police Officer', 'Armed Forces', 'Scientist', 'Designer'
    ];
    return occupations[Math.floor(Math.random() * occupations.length)];
  }

  private generateAddress(branchId: string): string {
    // Generate realistic Indian addresses based on branch location
    const addresses = {
      'dps-main': [
        'Sector 15, Noida, UP 201301',
        'Sector 62, Noida, UP 201309',
        'Greater Noida, UP 201310',
        'Vasundhara, Ghaziabad, UP 201012',
        'Indirapuram, Ghaziabad, UP 201014'
      ],
      'kvs-central': [
        'Dwarka, New Delhi 110075',
        'Rohini, New Delhi 110085',
        'Pitampura, New Delhi 110034',
        'Janakpuri, New Delhi 110058',
        'Paschim Vihar, New Delhi 110063'
      ],
      default: [
        'MG Road, Bangalore 560001',
        'Koramangala, Bangalore 560034',
        'Whitefield, Bangalore 560066',
        'HSR Layout, Bangalore 560102',
        'Jayanagar, Bangalore 560041'
      ]
    };

    const branchAddresses = addresses[branchId] || addresses.default;
    const baseAddress = branchAddresses[Math.floor(Math.random() * branchAddresses.length)];
    const houseNumber = Math.floor(Math.random() * 999) + 1;
    
    return `${houseNumber}, ${baseAddress}`;
  }
}