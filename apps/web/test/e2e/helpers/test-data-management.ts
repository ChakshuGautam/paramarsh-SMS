import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Advanced Test Data Management System for Paramarsh SMS
 * 
 * Provides comprehensive test data management including:
 * - Multi-tenant test data isolation
 * - Fixture-based data generation
 * - Automatic cleanup mechanisms
 * - Data consistency validation
 * - Relationship management
 * - Performance-optimized data loading
 */

export interface TestDataFixture {
  id?: string;
  branch: string;
  entityType: string;
  data: any;
  dependencies?: string[];
  cleanupOrder?: number;
  persistent?: boolean; // Don't clean up
}

export interface TestDataGenerationOptions {
  count?: number;
  branch?: string;
  locale?: 'en' | 'hi' | 'mixed';
  relationships?: boolean;
  realistic?: boolean;
}

export interface TestDataCleanupOptions {
  entityTypes?: string[];
  branch?: string;
  keepPersistent?: boolean;
  dryRun?: boolean;
}

export class TestDataManager {
  private page: Page;
  private apiBaseUrl: string;
  private fixtures: Map<string, TestDataFixture> = new Map();
  private createdEntities: Map<string, string[]> = new Map(); // entityType -> ids[]
  private fixturesDir: string;

  constructor(page: Page, apiBaseUrl: string = 'http://localhost:3005/api/v1') {
    this.page = page;
    this.apiBaseUrl = apiBaseUrl;
    this.fixturesDir = path.join(process.cwd(), 'test/e2e/fixtures');
    
    // Ensure fixtures directory exists
    if (!fs.existsSync(this.fixturesDir)) {
      fs.mkdirSync(this.fixturesDir, { recursive: true });
    }

    this.loadFixtures();
  }

  /**
   * Load predefined fixtures from JSON files
   */
  private loadFixtures(): void {
    try {
      const fixtureFiles = fs.readdirSync(this.fixturesDir)
        .filter(file => file.endsWith('.json'));

      for (const file of fixtureFiles) {
        const fixturePath = path.join(this.fixturesDir, file);
        const fixtureData = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
        
        if (Array.isArray(fixtureData)) {
          fixtureData.forEach((fixture, index) => {
            const fixtureId = fixture.id || `${file}-${index}`;
            this.fixtures.set(fixtureId, fixture);
          });
        } else {
          const fixtureId = fixtureData.id || file.replace('.json', '');
          this.fixtures.set(fixtureId, fixtureData);
        }
      }

      console.log(`📦 Loaded ${this.fixtures.size} test data fixtures`);
    } catch (error) {
      console.warn(`⚠️ Could not load fixtures: ${error.message}`);
    }
  }

  /**
   * Generate realistic Indian test data
   */
  private generateIndianTestData(): {
    firstNames: string[];
    lastNames: string[];
    cities: string[];
    states: string[];
    occupations: string[];
  } {
    return {
      firstNames: [
        'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
        'Aadhya', 'Kavya', 'Ananya', 'Diya', 'Pihu', 'Myra', 'Sara', 'Aanya', 'Pari', 'Fatima',
        'Rajesh', 'Sunil', 'Manoj', 'Amit', 'Vinod', 'Ravi', 'Santosh', 'Ashok', 'Prakash', 'Deepak',
        'Priya', 'Neha', 'Pooja', 'Sunita', 'Kavita', 'Meera', 'Rekha', 'Sushma', 'Geeta', 'Nisha'
      ],
      lastNames: [
        'Kumar', 'Sharma', 'Singh', 'Gupta', 'Verma', 'Yadav', 'Mishra', 'Agarwal', 'Jain', 'Patel',
        'Shah', 'Joshi', 'Mehta', 'Desai', 'Modi', 'Nair', 'Menon', 'Pillai', 'Reddy', 'Rao',
        'Das', 'Roy', 'Ghosh', 'Banerjee', 'Chakraborty', 'Mukherjee', 'Chatterjee', 'Dutta', 'Sen', 'Bose'
      ],
      cities: [
        'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
        'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam',
        'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut'
      ],
      states: [
        'Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal', 'Gujarat',
        'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Bihar', 'Andhra Pradesh', 'Kerala',
        'Punjab', 'Haryana', 'Odisha', 'Jharkhand', 'Assam', 'Chhattisgarh', 'Uttarakhand'
      ],
      occupations: [
        'Software Engineer', 'Doctor', 'Teacher', 'Business Owner', 'Government Employee',
        'Bank Manager', 'Accountant', 'Lawyer', 'Engineer', 'Consultant', 'Sales Manager',
        'Marketing Executive', 'Project Manager', 'Data Analyst', 'Architect', 'Designer',
        'Pharmacist', 'Nurse', 'Police Officer', 'Army Officer', 'Civil Servant', 'Entrepreneur'
      ]
    };
  }

  /**
   * Generate guardian test data
   */
  generateGuardianData(options: TestDataGenerationOptions = {}): any {
    const data = this.generateIndianTestData();
    const timestamp = Date.now();
    const branch = options.branch || 'dps-main';
    
    const firstName = data.firstNames[Math.floor(Math.random() * data.firstNames.length)];
    const lastName = data.lastNames[Math.floor(Math.random() * data.lastNames.length)];
    const city = data.cities[Math.floor(Math.random() * data.cities.length)];
    const state = data.states[Math.floor(Math.random() * data.states.length)];
    const occupation = data.occupations[Math.floor(Math.random() * data.occupations.length)];

    return {
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${timestamp}@example.com`,
      phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      address: `${Math.floor(Math.random() * 999) + 1} MG Road, ${city}, ${state}, India`,
      occupation,
      relationship: 'Father',
      branchId: branch,
      status: 'active'
    };
  }

  /**
   * Generate student test data
   */
  generateStudentData(guardianId?: string, options: TestDataGenerationOptions = {}): any {
    const data = this.generateIndianTestData();
    const timestamp = Date.now();
    const branch = options.branch || 'dps-main';
    
    const firstName = data.firstNames[Math.floor(Math.random() * data.firstNames.length)];
    const lastName = data.lastNames[Math.floor(Math.random() * data.lastNames.length)];
    
    // Generate realistic date of birth (age 5-18)
    const age = Math.floor(Math.random() * 14) + 5; // 5 to 18 years
    const birthYear = new Date().getFullYear() - age;
    const birthMonth = Math.floor(Math.random() * 12) + 1;
    const birthDay = Math.floor(Math.random() * 28) + 1;
    const dateOfBirth = `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;

    return {
      admissionNo: `ADM${timestamp}${Math.floor(Math.random() * 1000)}`,
      firstName,
      lastName,
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
      dateOfBirth,
      bloodGroup: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'][Math.floor(Math.random() * 8)],
      religion: ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Other'][Math.floor(Math.random() * 5)],
      category: ['General', 'OBC', 'SC', 'ST'][Math.floor(Math.random() * 4)],
      guardianId: guardianId,
      branchId: branch,
      status: 'active'
    };
  }

  /**
   * Generate teacher test data
   */
  generateTeacherData(options: TestDataGenerationOptions = {}): any {
    const data = this.generateIndianTestData();
    const timestamp = Date.now();
    const branch = options.branch || 'dps-main';
    
    const firstName = data.firstNames[Math.floor(Math.random() * data.firstNames.length)];
    const lastName = data.lastNames[Math.floor(Math.random() * data.lastNames.length)];
    const city = data.cities[Math.floor(Math.random() * data.cities.length)];
    const state = data.states[Math.floor(Math.random() * data.states.length)];

    const subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];

    return {
      employeeId: `EMP${timestamp}${Math.floor(Math.random() * 1000)}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${timestamp}@school.edu.in`,
      phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      address: `${Math.floor(Math.random() * 999) + 1} Teachers Colony, ${city}, ${state}, India`,
      subject,
      qualification: ['B.Ed', 'M.Ed', 'Ph.D', 'B.A', 'M.A', 'B.Sc', 'M.Sc'][Math.floor(Math.random() * 7)],
      experience: Math.floor(Math.random() * 20) + 1,
      branchId: branch,
      status: 'active'
    };
  }

  /**
   * Generate enrollment test data
   */
  generateEnrollmentData(studentId: string, classId: string, sectionId: string, options: TestDataGenerationOptions = {}): any {
    const branch = options.branch || 'dps-main';
    const currentDate = new Date();
    const academicYear = `${currentDate.getFullYear()}-${(currentDate.getFullYear() + 1).toString().substr(-2)}`;

    return {
      studentId,
      classId,
      sectionId,
      academicYear,
      admissionDate: currentDate.toISOString().split('T')[0],
      branchId: branch,
      status: 'active'
    };
  }

  /**
   * Create test data with relationships
   */
  async createTestDataSet(
    entityType: string,
    count: number = 1,
    options: TestDataGenerationOptions = {}
  ): Promise<string[]> {
    console.log(`🏗️ Creating ${count} ${entityType} test records...`);
    
    const createdIds: string[] = [];
    const branch = options.branch || 'dps-main';

    for (let i = 0; i < count; i++) {
      try {
        let testData: any;
        let parentId: string | undefined;

        // Handle relationships
        if (entityType === 'students' && options.relationships) {
          // Create guardian first
          const guardianData = this.generateGuardianData(options);
          const guardian = await this.createEntity('guardians', guardianData, branch);
          parentId = guardian.id;
          testData = this.generateStudentData(parentId, options);
        } else {
          // Generate appropriate test data
          switch (entityType) {
            case 'guardians':
              testData = this.generateGuardianData(options);
              break;
            case 'students':
              testData = this.generateStudentData(undefined, options);
              break;
            case 'teachers':
              testData = this.generateTeacherData(options);
              break;
            default:
              throw new Error(`Unknown entity type: ${entityType}`);
          }
        }

        const entity = await this.createEntity(entityType, testData, branch);
        createdIds.push(entity.id);

        // Track for cleanup
        if (!this.createdEntities.has(entityType)) {
          this.createdEntities.set(entityType, []);
        }
        this.createdEntities.get(entityType)!.push(entity.id);

        console.log(`✅ Created ${entityType} ${i + 1}/${count}: ${entity.id}`);

      } catch (error) {
        console.error(`❌ Failed to create ${entityType} ${i + 1}: ${error.message}`);
      }
    }

    console.log(`🎯 Created ${createdIds.length}/${count} ${entityType} records`);
    return createdIds;
  }

  /**
   * Create single entity via API
   */
  private async createEntity(entityType: string, data: any, branch: string): Promise<any> {
    const response = await this.page.request.post(`${this.apiBaseUrl}/${entityType}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Branch-Id': branch
      },
      data: data
    });

    if (!response.ok()) {
      const errorText = await response.text();
      throw new Error(`API error creating ${entityType}: ${response.status()} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Load fixture data
   */
  async loadFixture(fixtureId: string): Promise<any> {
    const fixture = this.fixtures.get(fixtureId);
    
    if (!fixture) {
      throw new Error(`Fixture not found: ${fixtureId}`);
    }

    console.log(`📦 Loading fixture: ${fixtureId}`);

    // Handle dependencies first
    if (fixture.dependencies) {
      for (const depId of fixture.dependencies) {
        await this.loadFixture(depId);
      }
    }

    // Create the fixture data
    const entity = await this.createEntity(
      fixture.entityType, 
      fixture.data, 
      fixture.branch
    );

    // Track for cleanup (unless persistent)
    if (!fixture.persistent) {
      if (!this.createdEntities.has(fixture.entityType)) {
        this.createdEntities.set(fixture.entityType, []);
      }
      this.createdEntities.get(fixture.entityType)!.push(entity.id);
    }

    console.log(`✅ Fixture loaded: ${fixtureId} -> ${entity.id}`);
    return entity;
  }

  /**
   * Validate data consistency
   */
  async validateDataConsistency(entityType: string, entityId: string, branch: string): Promise<boolean> {
    console.log(`🔍 Validating data consistency for ${entityType}:${entityId}`);

    try {
      const response = await this.page.request.get(`${this.apiBaseUrl}/${entityType}/${entityId}`, {
        headers: {
          'X-Branch-Id': branch
        }
      });

      if (!response.ok()) {
        console.error(`❌ Entity not found: ${entityType}:${entityId}`);
        return false;
      }

      const entity = await response.json();

      // Basic validation
      if (!entity.id || entity.branchId !== branch) {
        console.error(`❌ Data consistency error: ${entityType}:${entityId}`);
        return false;
      }

      console.log(`✅ Data consistency validated: ${entityType}:${entityId}`);
      return true;

    } catch (error) {
      console.error(`❌ Validation error: ${error.message}`);
      return false;
    }
  }

  /**
   * Clean up test data
   */
  async cleanup(options: TestDataCleanupOptions = {}): Promise<void> {
    console.log('🧹 Starting test data cleanup...');

    const entityTypes = options.entityTypes || Array.from(this.createdEntities.keys());
    const branch = options.branch || 'dps-main';

    // Define cleanup order (children before parents)
    const cleanupOrder = [
      'enrollments',
      'students', 
      'teachers',
      'guardians',
      'classes',
      'sections',
      'subjects'
    ];

    let totalCleaned = 0;

    for (const entityType of cleanupOrder) {
      if (!entityTypes.includes(entityType)) continue;

      const entityIds = this.createdEntities.get(entityType) || [];
      
      if (entityIds.length === 0) continue;

      console.log(`🗑️ Cleaning up ${entityIds.length} ${entityType} records...`);

      for (const entityId of entityIds) {
        try {
          if (options.dryRun) {
            console.log(`🔍 DRY RUN: Would delete ${entityType}:${entityId}`);
            continue;
          }

          const response = await this.page.request.delete(`${this.apiBaseUrl}/${entityType}/${entityId}`, {
            headers: {
              'X-Branch-Id': branch
            }
          });

          if (response.ok() || response.status() === 404) {
            console.log(`✅ Cleaned up ${entityType}:${entityId}`);
            totalCleaned++;
          } else {
            console.warn(`⚠️ Could not clean up ${entityType}:${entityId}: ${response.status()}`);
          }

        } catch (error) {
          console.warn(`⚠️ Cleanup error for ${entityType}:${entityId}: ${error.message}`);
        }
      }

      // Clear from tracking
      this.createdEntities.delete(entityType);
    }

    console.log(`✅ Cleanup completed: ${totalCleaned} records cleaned`);
  }

  /**
   * Save current state as fixture
   */
  async saveAsFixture(
    name: string, 
    entityType: string, 
    entityId: string, 
    branch: string
  ): Promise<void> {
    console.log(`💾 Saving fixture: ${name}`);

    try {
      const response = await this.page.request.get(`${this.apiBaseUrl}/${entityType}/${entityId}`, {
        headers: {
          'X-Branch-Id': branch
        }
      });

      if (!response.ok()) {
        throw new Error(`Entity not found: ${entityType}:${entityId}`);
      }

      const entityData = await response.json();

      const fixture: TestDataFixture = {
        id: name,
        branch,
        entityType,
        data: entityData,
        persistent: true
      };

      const fixturePath = path.join(this.fixturesDir, `${name}.json`);
      fs.writeFileSync(fixturePath, JSON.stringify(fixture, null, 2));

      console.log(`✅ Fixture saved: ${fixturePath}`);

    } catch (error) {
      console.error(`❌ Could not save fixture: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get data statistics
   */
  async getDataStatistics(branch: string): Promise<{ [entityType: string]: number }> {
    console.log(`📊 Getting data statistics for branch: ${branch}`);

    const stats: { [entityType: string]: number } = {};
    const entityTypes = ['students', 'guardians', 'teachers', 'enrollments', 'classes'];

    for (const entityType of entityTypes) {
      try {
        const response = await this.page.request.get(`${this.apiBaseUrl}/${entityType}`, {
          headers: {
            'X-Branch-Id': branch
          }
        });

        if (response.ok()) {
          const data = await response.json();
          stats[entityType] = data.total || data.data?.length || 0;
        } else {
          stats[entityType] = 0;
        }
      } catch (error) {
        console.warn(`⚠️ Could not get stats for ${entityType}: ${error.message}`);
        stats[entityType] = 0;
      }
    }

    console.log('📈 Data Statistics:');
    Object.entries(stats).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

    return stats;
  }
}

/**
 * Test data factory with predefined scenarios
 */
export class TestDataFactory {
  /**
   * Create complete school scenario
   */
  static async createSchoolScenario(
    page: Page, 
    branch: string = 'dps-main'
  ): Promise<{ 
    guardians: string[]; 
    students: string[]; 
    teachers: string[];
    enrollments: string[];
  }> {
    console.log('🏫 Creating complete school scenario...');

    const dataManager = new TestDataManager(page);

    // Create guardians (parents)
    const guardians = await dataManager.createTestDataSet('guardians', 5, { 
      branch, 
      realistic: true 
    });

    // Create students linked to guardians
    const students = await dataManager.createTestDataSet('students', 10, { 
      branch, 
      relationships: true,
      realistic: true 
    });

    // Create teachers
    const teachers = await dataManager.createTestDataSet('teachers', 3, { 
      branch, 
      realistic: true 
    });

    console.log('✅ School scenario created successfully');

    return {
      guardians,
      students,
      teachers,
      enrollments: [] // Would need class/section data first
    };
  }

  /**
   * Create minimal test data set
   */
  static async createMinimalTestData(
    page: Page, 
    branch: string = 'dps-main'
  ): Promise<{ guardianId: string; studentId: string }> {
    console.log('🔧 Creating minimal test data...');

    const dataManager = new TestDataManager(page);

    const guardians = await dataManager.createTestDataSet('guardians', 1, { branch });
    const students = await dataManager.createTestDataSet('students', 1, { branch });

    return {
      guardianId: guardians[0],
      studentId: students[0]
    };
  }
}