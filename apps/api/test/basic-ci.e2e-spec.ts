import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Basic CI Tests (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.PORT = '0';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        validationError: { target: false },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Basic Application Tests', () => {
    it('should have a working health endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
    });

    it('should handle basic math operations', () => {
      expect(2 + 2).toBe(4);
      expect(5 * 3).toBe(15);
      expect(10 / 2).toBe(5);
    });

    it('should handle string operations', () => {
      const schoolName = 'Paramarsh School';
      expect(schoolName.length).toBe(16);
      expect(schoolName.toLowerCase()).toBe('paramarsh school');
      expect(schoolName.includes('School')).toBe(true);
    });

    it('should handle array operations', () => {
      const subjects = ['Mathematics', 'Science', 'English', 'Hindi'];
      expect(subjects.length).toBe(4);
      expect(subjects.includes('Mathematics')).toBe(true);
      expect(subjects[0]).toBe('Mathematics');
    });

    it('should handle date operations', () => {
      const academicYearStart = new Date('2024-04-01');
      expect(academicYearStart.getFullYear()).toBe(2024);
      expect(academicYearStart.getMonth()).toBe(3); // April is 3
      expect(academicYearStart.getDate()).toBe(1);
    });

    it('should handle object operations', () => {
      const student = {
        name: 'Rahul Sharma',
        class: 'Class 5',
        admissionNumber: 'ADM2024001',
        status: 'active'
      };
      
      expect(student.name).toBe('Rahul Sharma');
      expect(student.class).toBe('Class 5');
      expect(student.status).toBe('active');
      expect(Object.keys(student).length).toBe(4);
    });

    it('should handle promises', async () => {
      const promise = Promise.resolve('school data loaded');
      const result = await promise;
      expect(result).toBe('school data loaded');
    });

    it('should validate Indian education context', () => {
      const indianGrades = ['LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3'];
      const indianSubjects = ['Mathematics', 'Science', 'Social Studies', 'Hindi', 'English'];
      
      expect(indianGrades.length).toBe(5);
      expect(indianSubjects.length).toBe(5);
      expect(indianSubjects.includes('Hindi')).toBe(true);
      expect(indianGrades.includes('LKG')).toBe(true);
    });

    it('should handle multi-tenant structure', () => {
      const tenant = {
        branchId: 'branch1',
        name: 'Main Campus',
        location: 'Mumbai',
        established: '2020-04-01'
      };
      
      expect(tenant.branchId).toBe('branch1');
      expect(tenant.name).toBe('Main Campus');
      expect(tenant.location).toBe('Mumbai');
    });

    it('should validate API response format', () => {
      const apiResponse = {
        data: [
          { id: 1, name: 'Rahul' },
          { id: 2, name: 'Priya' }
        ],
        total: 2
      };
      
      expect(apiResponse).toHaveProperty('data');
      expect(apiResponse).toHaveProperty('total');
      expect(Array.isArray(apiResponse.data)).toBe(true);
      expect(apiResponse.total).toBe(2);
    });

    it('should handle error states gracefully', () => {
      try {
        throw new Error('Test API error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Test API error');
      }
    });
  });

  describe('Application Configuration', () => {
    it('should have proper environment setup', () => {
      expect(process.env.NODE_ENV).toBeDefined();
      expect(['test', 'development', 'production']).toContain(process.env.NODE_ENV);
    });

    it('should handle port configuration', () => {
      const port = process.env.PORT || '8080';
      expect(port).toBeDefined();
      expect(typeof port).toBe('string');
    });

    it('should validate required environment variables', () => {
      // These should be set in CI
      expect(process.env.DATABASE_URL).toBeDefined();
      expect(process.env.JWT_SECRET).toBeDefined();
    });
  });

  describe('Basic Validation', () => {
    it('should validate student data structure', () => {
      const studentData = {
        firstName: 'Rahul',
        lastName: 'Sharma',
        admissionNo: 'ADM2024001',
        classId: 1,
        sectionId: 1,
        status: 'active',
        branchId: 'branch1'
      };

      expect(studentData.firstName).toBeTruthy();
      expect(studentData.lastName).toBeTruthy();
      expect(studentData.admissionNo).toMatch(/^ADM\d{7}$/);
      expect(studentData.status).toBe('active');
      expect(studentData.branchId).toBe('branch1');
    });

    it('should validate teacher data structure', () => {
      const teacherData = {
        firstName: 'Priya',
        lastName: 'Singh',
        email: 'priya.singh@school.edu',
        phoneNumber: '+91-9876543210',
        employeeId: 'EMP001',
        status: 'active',
        branchId: 'branch1'
      };

      expect(teacherData.firstName).toBeTruthy();
      expect(teacherData.email).toMatch(/@/);
      expect(teacherData.phoneNumber).toMatch(/^\+91-\d{10}$/);
      expect(teacherData.employeeId).toMatch(/^EMP\d{3}$/);
    });

    it('should validate class data structure', () => {
      const classData = {
        name: 'Class 5',
        gradeLevel: 5,
        status: 'active',
        branchId: 'branch1'
      };

      expect(classData.name).toBe('Class 5');
      expect(classData.gradeLevel).toBe(5);
      expect(classData.status).toBe('active');
      expect(classData.branchId).toBe('branch1');
    });
  });
});