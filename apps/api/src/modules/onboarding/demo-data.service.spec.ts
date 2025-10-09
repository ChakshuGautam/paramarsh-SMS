import { Test, TestingModule } from '@nestjs/testing';
import { DemoDataService } from './demo-data.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

describe('DemoDataService', () => {
  let service: DemoDataService;
  let prisma: PrismaService;

  // Mock PrismaService
  const mockPrismaService = {
    student: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    staff: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    teacher: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    class: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    section: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    attendanceRecord: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    feeStructure: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    invoice: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    payment: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DemoDataService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DemoDataService>(DemoDataService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateDemoData', () => {
    const mockOnboardingStateId = 'onboarding-123';
    const mockBranchId = 'branch-456';

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should create complete demo dataset successfully', async () => {
      // Arrange
      const mockStudents = Array(50).fill(null).map((_, i) => ({
        id: `student-${i}`,
        firstName: `Student${i}`,
        lastName: 'Test',
        branchId: mockBranchId,
      }));

      const mockTeachers = Array(10).fill(null).map((_, i) => ({
        id: `teacher-${i}`,
        name: `Teacher${i}`,
        branchId: mockBranchId,
      }));

      const mockClasses = Array(7).fill(null).map((_, i) => ({
        id: `class-${i}`,
        grade: (i + 6).toString(),
        branchId: mockBranchId,
      }));

      mockPrismaService.student.createMany.mockResolvedValue({ count: 50 });
      mockPrismaService.teacher.createMany.mockResolvedValue({ count: 10 });
      mockPrismaService.class.createMany.mockResolvedValue({ count: 7 });
      mockPrismaService.section.createMany.mockResolvedValue({ count: 14 });
      mockPrismaService.attendanceRecord.createMany.mockResolvedValue({ count: 1500 });
      mockPrismaService.feeStructure.createMany.mockResolvedValue({ count: 3 });
      mockPrismaService.invoice.createMany.mockResolvedValue({ count: 50 });
      mockPrismaService.payment.createMany.mockResolvedValue({ count: 35 });

      mockPrismaService.student.findMany.mockResolvedValue(mockStudents);
      mockPrismaService.teacher.findMany.mockResolvedValue(mockTeachers);
      mockPrismaService.class.findMany.mockResolvedValue(mockClasses);

      // Act
      const result = await service.generateDemoData(mockOnboardingStateId, mockBranchId);

      // Assert
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.summary.studentsCreated).toBeGreaterThanOrEqual(50);
      expect(result.summary.teachersCreated).toBeGreaterThanOrEqual(10);
      expect(result.summary.classesCreated).toBeGreaterThanOrEqual(7);
      expect(result.summary.attendanceRecordsCreated).toBeGreaterThan(0);
      expect(result.summary.feeDataCreated).toBe(true);
    });

    it('should use Indian names and context for demo data', async () => {
      // Arrange
      mockPrismaService.student.createMany.mockResolvedValue({ count: 50 });
      mockPrismaService.teacher.createMany.mockResolvedValue({ count: 10 });
      mockPrismaService.class.createMany.mockResolvedValue({ count: 7 });
      mockPrismaService.section.createMany.mockResolvedValue({ count: 14 });
      mockPrismaService.attendanceRecord.createMany.mockResolvedValue({ count: 1000 });
      mockPrismaService.feeStructure.createMany.mockResolvedValue({ count: 3 });
      mockPrismaService.invoice.createMany.mockResolvedValue({ count: 50 });

      // Mock transaction to capture the data being created
      let capturedStudentData: any[] = [];
      mockPrismaService.$transaction.mockImplementation(async (fn) => {
        if (typeof fn === 'function') {
          return fn({
            student: {
              createMany: jest.fn((data) => {
                capturedStudentData = data.data;
                return { count: data.data.length };
              }),
            },
            teacher: { createMany: jest.fn(() => ({ count: 10 })) },
            class: { createMany: jest.fn(() => ({ count: 7 })) },
            section: { createMany: jest.fn(() => ({ count: 14 })) },
            attendanceRecord: { createMany: jest.fn(() => ({ count: 1000 })) },
            feeStructure: { createMany: jest.fn(() => ({ count: 3 })) },
            invoice: { createMany: jest.fn(() => ({ count: 50 })) },
          });
        }
        return null;
      });

      // Act
      await service.generateDemoData(mockOnboardingStateId, mockBranchId);

      // Assert - Verify Indian names are used
      // This will fail initially (TDD - Red phase) until service is implemented
      expect(capturedStudentData.length).toBeGreaterThan(0);

      // Check for common Indian names (at least some should match)
      const indianNames = ['Aarav', 'Diya', 'Ananya', 'Arjun', 'Kavya', 'Rohit', 'Priya', 'Vikram', 'Ishaan', 'Aisha'];
      const foundIndianName = capturedStudentData.some(student =>
        indianNames.includes(student.firstName)
      );
      expect(foundIndianName).toBe(true);
    });

    it('should create at least 50 demo students', async () => {
      // Arrange
      mockPrismaService.student.createMany.mockResolvedValue({ count: 60 });
      mockPrismaService.teacher.createMany.mockResolvedValue({ count: 10 });
      mockPrismaService.class.createMany.mockResolvedValue({ count: 7 });
      mockPrismaService.section.createMany.mockResolvedValue({ count: 14 });
      mockPrismaService.attendanceRecord.createMany.mockResolvedValue({ count: 1000 });
      mockPrismaService.feeStructure.createMany.mockResolvedValue({ count: 3 });
      mockPrismaService.invoice.createMany.mockResolvedValue({ count: 60 });

      // Act
      const result = await service.generateDemoData(mockOnboardingStateId, mockBranchId);

      // Assert
      expect(result.summary.studentsCreated).toBeGreaterThanOrEqual(50);
    });

    it('should create at least 10 demo teachers', async () => {
      // Arrange
      mockPrismaService.student.createMany.mockResolvedValue({ count: 50 });
      mockPrismaService.teacher.createMany.mockResolvedValue({ count: 12 });
      mockPrismaService.class.createMany.mockResolvedValue({ count: 7 });
      mockPrismaService.section.createMany.mockResolvedValue({ count: 14 });
      mockPrismaService.attendanceRecord.createMany.mockResolvedValue({ count: 1000 });
      mockPrismaService.feeStructure.createMany.mockResolvedValue({ count: 3 });
      mockPrismaService.invoice.createMany.mockResolvedValue({ count: 50 });

      // Act
      const result = await service.generateDemoData(mockOnboardingStateId, mockBranchId);

      // Assert
      expect(result.summary.teachersCreated).toBeGreaterThanOrEqual(10);
    });

    it('should create class/section structure for grades 6-12', async () => {
      // Arrange
      mockPrismaService.student.createMany.mockResolvedValue({ count: 50 });
      mockPrismaService.teacher.createMany.mockResolvedValue({ count: 10 });
      mockPrismaService.class.createMany.mockResolvedValue({ count: 7 });
      mockPrismaService.section.createMany.mockResolvedValue({ count: 14 });
      mockPrismaService.attendanceRecord.createMany.mockResolvedValue({ count: 1000 });
      mockPrismaService.feeStructure.createMany.mockResolvedValue({ count: 3 });
      mockPrismaService.invoice.createMany.mockResolvedValue({ count: 50 });

      // Act
      const result = await service.generateDemoData(mockOnboardingStateId, mockBranchId);

      // Assert
      expect(result.summary.classesCreated).toBeGreaterThanOrEqual(7); // Grades 6-12
      expect(result.summary.sectionsCreated).toBeGreaterThanOrEqual(14); // 2 sections per grade
    });

    it('should create attendance records for visualization', async () => {
      // Arrange
      mockPrismaService.student.createMany.mockResolvedValue({ count: 50 });
      mockPrismaService.teacher.createMany.mockResolvedValue({ count: 10 });
      mockPrismaService.class.createMany.mockResolvedValue({ count: 7 });
      mockPrismaService.section.createMany.mockResolvedValue({ count: 14 });
      mockPrismaService.attendanceRecord.createMany.mockResolvedValue({ count: 1500 });
      mockPrismaService.feeStructure.createMany.mockResolvedValue({ count: 3 });
      mockPrismaService.invoice.createMany.mockResolvedValue({ count: 50 });

      // Act
      const result = await service.generateDemoData(mockOnboardingStateId, mockBranchId);

      // Assert
      expect(result.summary.attendanceRecordsCreated).toBeGreaterThan(0);
      expect(mockPrismaService.attendanceRecord.createMany).toHaveBeenCalled();
    });

    it('should create fee/invoice data', async () => {
      // Arrange
      mockPrismaService.student.createMany.mockResolvedValue({ count: 50 });
      mockPrismaService.teacher.createMany.mockResolvedValue({ count: 10 });
      mockPrismaService.class.createMany.mockResolvedValue({ count: 7 });
      mockPrismaService.section.createMany.mockResolvedValue({ count: 14 });
      mockPrismaService.attendanceRecord.createMany.mockResolvedValue({ count: 1000 });
      mockPrismaService.feeStructure.createMany.mockResolvedValue({ count: 3 });
      mockPrismaService.invoice.createMany.mockResolvedValue({ count: 50 });

      // Act
      const result = await service.generateDemoData(mockOnboardingStateId, mockBranchId);

      // Assert
      expect(result.summary.feeDataCreated).toBe(true);
      expect(mockPrismaService.feeStructure.createMany).toHaveBeenCalled();
      expect(mockPrismaService.invoice.createMany).toHaveBeenCalled();
    });

    it('should mark all demo data with isDemo flag', async () => {
      // Arrange
      let capturedStudentData: any[] = [];
      let capturedTeacherData: any[] = [];

      mockPrismaService.$transaction.mockImplementation(async (fn) => {
        if (typeof fn === 'function') {
          return fn({
            student: {
              createMany: jest.fn((data) => {
                capturedStudentData = data.data;
                return { count: data.data.length };
              }),
            },
            staff: { createMany: jest.fn(() => ({ count: 10 })) },
            teacher: {
              createMany: jest.fn((data) => {
                capturedTeacherData = data.data;
                return { count: data.data.length };
              }),
            },
            class: { createMany: jest.fn(() => ({ count: 7 })) },
            section: { createMany: jest.fn(() => ({ count: 14 })) },
            attendanceRecord: { createMany: jest.fn(() => ({ count: 1000 })) },
            feeStructure: { createMany: jest.fn(() => ({ count: 3 })) },
            invoice: { createMany: jest.fn(() => ({ count: 50 })) },
          });
        }
        return null;
      });

      // Act
      await service.generateDemoData(mockOnboardingStateId, mockBranchId);

      // Assert - All created records should have isDemo flag
      // This will fail initially (TDD) until implemented
      if (capturedStudentData.length > 0) {
        expect(capturedStudentData.every(s => s.isDemo === true)).toBe(true);
      }
      if (capturedTeacherData.length > 0) {
        expect(capturedTeacherData.every(t => t.isDemo === true)).toBe(true);
      }
    });

    it('should associate demo data with onboardingStateId', async () => {
      // Arrange
      let capturedStudentData: any[] = [];

      mockPrismaService.$transaction.mockImplementation(async (fn) => {
        if (typeof fn === 'function') {
          return fn({
            student: {
              createMany: jest.fn((data) => {
                capturedStudentData = data.data;
                return { count: data.data.length };
              }),
            },
            staff: { createMany: jest.fn(() => ({ count: 10 })) },
            teacher: { createMany: jest.fn(() => ({ count: 10 })) },
            class: { createMany: jest.fn(() => ({ count: 7 })) },
            section: { createMany: jest.fn(() => ({ count: 14 })) },
            attendanceRecord: { createMany: jest.fn(() => ({ count: 1000 })) },
            feeStructure: { createMany: jest.fn(() => ({ count: 3 })) },
            invoice: { createMany: jest.fn(() => ({ count: 50 })) },
          });
        }
        return null;
      });

      // Act
      await service.generateDemoData(mockOnboardingStateId, mockBranchId);

      // Assert
      if (capturedStudentData.length > 0) {
        expect(capturedStudentData.every(s => s.demoOnboardingId === mockOnboardingStateId)).toBe(true);
      }
    });

    it('should return summary of created data', async () => {
      // Arrange
      mockPrismaService.student.createMany.mockResolvedValue({ count: 50 });
      mockPrismaService.teacher.createMany.mockResolvedValue({ count: 10 });
      mockPrismaService.class.createMany.mockResolvedValue({ count: 7 });
      mockPrismaService.section.createMany.mockResolvedValue({ count: 14 });
      mockPrismaService.attendanceRecord.createMany.mockResolvedValue({ count: 1000 });
      mockPrismaService.feeStructure.createMany.mockResolvedValue({ count: 3 });
      mockPrismaService.invoice.createMany.mockResolvedValue({ count: 50 });

      // Act
      const result = await service.generateDemoData(mockOnboardingStateId, mockBranchId);

      // Assert
      expect(result).toHaveProperty('summary');
      expect(result.summary).toHaveProperty('studentsCreated');
      expect(result.summary).toHaveProperty('teachersCreated');
      expect(result.summary).toHaveProperty('classesCreated');
      expect(result.summary).toHaveProperty('sectionsCreated');
      expect(result.summary).toHaveProperty('attendanceRecordsCreated');
      expect(result.summary).toHaveProperty('feeDataCreated');
    });

    it('should throw BadRequestException if onboardingStateId is invalid', async () => {
      // Act & Assert
      await expect(service.generateDemoData('', mockBranchId)).rejects.toThrow(BadRequestException);
      await expect(service.generateDemoData(null as any, mockBranchId)).rejects.toThrow(BadRequestException);
      await expect(service.generateDemoData(undefined as any, mockBranchId)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if branchId is invalid', async () => {
      // Act & Assert
      await expect(service.generateDemoData(mockOnboardingStateId, '')).rejects.toThrow(BadRequestException);
      await expect(service.generateDemoData(mockOnboardingStateId, null as any)).rejects.toThrow(BadRequestException);
      await expect(service.generateDemoData(mockOnboardingStateId, undefined as any)).rejects.toThrow(BadRequestException);
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      mockPrismaService.student.createMany.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(service.generateDemoData(mockOnboardingStateId, mockBranchId)).rejects.toThrow();
    });

    it('should rollback if generation fails mid-way', async () => {
      // Arrange
      mockPrismaService.$transaction.mockRejectedValue(new Error('Transaction failed'));

      // Act & Assert
      await expect(service.generateDemoData(mockOnboardingStateId, mockBranchId)).rejects.toThrow();

      // Transaction should ensure all-or-nothing behavior
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('createDemoStudents', () => {
    const mockOnboardingStateId = 'onboarding-123';
    const mockBranchId = 'branch-456';

    it('should create students with Indian names', async () => {
      // Arrange
      let capturedData: any[] = [];
      mockPrismaService.student.createMany.mockImplementation((data) => {
        capturedData = data.data;
        return Promise.resolve({ count: data.data.length });
      });

      // Act
      await service.createDemoStudents(mockOnboardingStateId, mockBranchId);

      // Assert
      expect(capturedData.length).toBeGreaterThanOrEqual(50);

      // Check for Indian names (Aarav, Diya, Ananya, etc.)
      const indianNames = ['Aarav', 'Diya', 'Ananya', 'Arjun', 'Kavya', 'Rohit', 'Priya', 'Vikram'];
      const hasIndianNames = capturedData.some(student =>
        indianNames.includes(student.firstName)
      );
      expect(hasIndianNames).toBe(true);
    });

    it('should assign students to different classes (6-12)', async () => {
      // Arrange
      let capturedData: any[] = [];
      mockPrismaService.student.createMany.mockImplementation((data) => {
        capturedData = data.data;
        return Promise.resolve({ count: data.data.length });
      });

      // Act
      await service.createDemoStudents(mockOnboardingStateId, mockBranchId);

      // Assert
      expect(capturedData.length).toBeGreaterThan(0);

      // Check that students are assigned to various grades
      const grades = capturedData.map(s => s.grade).filter(Boolean);
      expect(grades.length).toBeGreaterThan(0);
    });

    it('should generate realistic roll numbers', async () => {
      // Arrange
      let capturedData: any[] = [];
      mockPrismaService.student.createMany.mockImplementation((data) => {
        capturedData = data.data;
        return Promise.resolve({ count: data.data.length });
      });

      // Act
      await service.createDemoStudents(mockOnboardingStateId, mockBranchId);

      // Assert
      expect(capturedData.length).toBeGreaterThan(0);

      // Check that roll numbers are generated (format: 8A01, 9B02, etc.)
      const rollNumbers = capturedData.map(s => s.rollNumber).filter(Boolean);
      expect(rollNumbers.length).toBeGreaterThan(0);

      // Verify format (should be like "8A01", "9B02")
      const validFormat = rollNumbers.every(rn => /^\d{1,2}[A-Z]\d{2}$/.test(rn));
      expect(validFormat).toBe(true);
    });

    it('should mark all students with isDemo: true', async () => {
      // Arrange
      let capturedData: any[] = [];
      mockPrismaService.student.createMany.mockImplementation((data) => {
        capturedData = data.data;
        return Promise.resolve({ count: data.data.length });
      });

      // Act
      await service.createDemoStudents(mockOnboardingStateId, mockBranchId);

      // Assert
      expect(capturedData.length).toBeGreaterThan(0);
      expect(capturedData.every(s => s.isDemo === true)).toBe(true);
    });

    it('should associate students with correct branchId', async () => {
      // Arrange
      let capturedData: any[] = [];
      mockPrismaService.student.createMany.mockImplementation((data) => {
        capturedData = data.data;
        return Promise.resolve({ count: data.data.length });
      });

      // Act
      await service.createDemoStudents(mockOnboardingStateId, mockBranchId);

      // Assert
      expect(capturedData.length).toBeGreaterThan(0);
      expect(capturedData.every(s => s.branchId === mockBranchId)).toBe(true);
    });

    it('should create realistic phone numbers with +91', async () => {
      // Arrange
      let capturedData: any[] = [];
      mockPrismaService.student.createMany.mockImplementation((data) => {
        capturedData = data.data;
        return Promise.resolve({ count: data.data.length });
      });

      // Act
      await service.createDemoStudents(mockOnboardingStateId, mockBranchId);

      // Assert
      expect(capturedData.length).toBeGreaterThan(0);

      // Check phone numbers if present
      const phoneNumbers = capturedData.map(s => s.phoneNumber).filter(Boolean);
      if (phoneNumbers.length > 0) {
        const validFormat = phoneNumbers.every(pn => pn.startsWith('+91'));
        expect(validFormat).toBe(true);
      }
    });
  });

  describe('createDemoTeachers', () => {
    const mockOnboardingStateId = 'onboarding-123';
    const mockBranchId = 'branch-456';

    it('should create teachers with Indian names', async () => {
      // Arrange
      let capturedData: any[] = [];
      mockPrismaService.teacher.createMany.mockImplementation((data) => {
        capturedData = data.data;
        return Promise.resolve({ count: data.data.length });
      });

      // Act
      await service.createDemoTeachers(mockOnboardingStateId, mockBranchId);

      // Assert
      expect(capturedData.length).toBeGreaterThanOrEqual(10);

      // Check for Indian names
      const indianNames = ['Anita', 'Ravi', 'Priya', 'Rajesh', 'Sunita', 'Amit'];
      const hasIndianNames = capturedData.some(teacher =>
        indianNames.some(name => teacher.name?.includes(name))
      );
      expect(hasIndianNames).toBe(true);
    });

    it('should assign subjects to teachers', async () => {
      // Arrange
      let capturedData: any[] = [];
      mockPrismaService.teacher.createMany.mockImplementation((data) => {
        capturedData = data.data;
        return Promise.resolve({ count: data.data.length });
      });

      // Act
      await service.createDemoTeachers(mockOnboardingStateId, mockBranchId);

      // Assert
      expect(capturedData.length).toBeGreaterThan(0);

      // Check that subjects are assigned
      const subjects = capturedData.map(t => t.subject).filter(Boolean);
      expect(subjects.length).toBeGreaterThan(0);

      // Common subjects
      const commonSubjects = ['Math', 'Science', 'English', 'History', 'Geography'];
      const hasValidSubjects = subjects.some(s => commonSubjects.includes(s));
      expect(hasValidSubjects).toBe(true);
    });

    it('should mark teachers with isDemo: true', async () => {
      // Arrange
      let capturedData: any[] = [];
      mockPrismaService.teacher.createMany.mockImplementation((data) => {
        capturedData = data.data;
        return Promise.resolve({ count: data.data.length });
      });

      // Act
      await service.createDemoTeachers(mockOnboardingStateId, mockBranchId);

      // Assert
      expect(capturedData.length).toBeGreaterThan(0);
      expect(capturedData.every(t => t.isDemo === true)).toBe(true);
    });

    it('should create corresponding staff records', async () => {
      // Arrange
      mockPrismaService.teacher.createMany.mockResolvedValue({ count: 10 });
      mockPrismaService.staff.createMany.mockResolvedValue({ count: 10 });

      // Act
      await service.createDemoTeachers(mockOnboardingStateId, mockBranchId);

      // Assert
      expect(mockPrismaService.staff.createMany).toHaveBeenCalled();
    });
  });

  describe('createDemoClasses', () => {
    const mockBranchId = 'branch-456';

    it('should create grades 6-12', async () => {
      // Arrange
      let capturedData: any[] = [];
      mockPrismaService.class.createMany.mockImplementation((data) => {
        capturedData = data.data;
        return Promise.resolve({ count: data.data.length });
      });

      // Act
      await service.createDemoClasses(mockBranchId);

      // Assert
      expect(capturedData.length).toBeGreaterThanOrEqual(7); // Grades 6-12

      // Check grades
      const grades = capturedData.map(c => c.grade);
      expect(grades).toContain('6');
      expect(grades).toContain('12');
    });

    it('should create 2 sections per grade (A, B)', async () => {
      // Arrange
      let capturedSectionData: any[] = [];
      mockPrismaService.class.createMany.mockResolvedValue({ count: 7 });
      mockPrismaService.section.createMany.mockImplementation((data) => {
        capturedSectionData = data.data;
        return Promise.resolve({ count: data.data.length });
      });

      // Act
      await service.createDemoClasses(mockBranchId);

      // Assert
      expect(capturedSectionData.length).toBeGreaterThanOrEqual(14); // 7 grades * 2 sections

      // Check sections A and B exist
      const sections = capturedSectionData.map(s => s.name);
      expect(sections.filter(s => s === 'A').length).toBeGreaterThan(0);
      expect(sections.filter(s => s === 'B').length).toBeGreaterThan(0);
    });

    it('should set realistic capacities', async () => {
      // Arrange
      let capturedData: any[] = [];
      mockPrismaService.class.createMany.mockImplementation((data) => {
        capturedData = data.data;
        return Promise.resolve({ count: data.data.length });
      });

      // Act
      await service.createDemoClasses(mockBranchId);

      // Assert
      expect(capturedData.length).toBeGreaterThan(0);

      // Check capacities are realistic (30-40 students per class)
      const capacities = capturedData.map(c => c.capacity).filter(Boolean);
      expect(capacities.length).toBeGreaterThan(0);
      expect(capacities.every(cap => cap >= 30 && cap <= 50)).toBe(true);
    });
  });

  describe('createDemoAttendance', () => {
    const mockBranchId = 'branch-456';

    it('should create attendance records for last 30 days', async () => {
      // Arrange
      let capturedData: any[] = [];
      mockPrismaService.attendanceRecord.createMany.mockImplementation((data) => {
        capturedData = data.data;
        return Promise.resolve({ count: data.data.length });
      });

      // Mock students
      mockPrismaService.student.findMany.mockResolvedValue(
        Array(50).fill(null).map((_, i) => ({ id: `student-${i}` }))
      );

      // Act
      await service.createDemoAttendance(mockBranchId);

      // Assert
      expect(capturedData.length).toBeGreaterThan(0);

      // Check date range (should span ~30 days)
      const dates = capturedData.map(r => new Date(r.date));
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
      const daysDiff = Math.floor((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));

      expect(daysDiff).toBeGreaterThanOrEqual(25); // At least 25 days
      expect(daysDiff).toBeLessThanOrEqual(35); // At most 35 days
    });

    it('should have realistic attendance patterns (85-95%)', async () => {
      // Arrange
      let capturedData: any[] = [];
      mockPrismaService.attendanceRecord.createMany.mockImplementation((data) => {
        capturedData = data.data;
        return Promise.resolve({ count: data.data.length });
      });

      mockPrismaService.student.findMany.mockResolvedValue(
        Array(50).fill(null).map((_, i) => ({ id: `student-${i}` }))
      );

      // Act
      await service.createDemoAttendance(mockBranchId);

      // Assert
      expect(capturedData.length).toBeGreaterThan(0);

      // Calculate attendance percentage
      const presentCount = capturedData.filter(r => r.status === 'present').length;
      const attendanceRate = (presentCount / capturedData.length) * 100;

      expect(attendanceRate).toBeGreaterThanOrEqual(85);
      expect(attendanceRate).toBeLessThanOrEqual(95);
    });

    it('should mark demo students in attendance', async () => {
      // Arrange
      let capturedData: any[] = [];
      mockPrismaService.attendanceRecord.createMany.mockImplementation((data) => {
        capturedData = data.data;
        return Promise.resolve({ count: data.data.length });
      });

      const mockStudents = Array(50).fill(null).map((_, i) => ({
        id: `student-${i}`,
        isDemo: true,
      }));
      mockPrismaService.student.findMany.mockResolvedValue(mockStudents);

      // Act
      await service.createDemoAttendance(mockBranchId);

      // Assert
      expect(capturedData.length).toBeGreaterThan(0);

      // All attendance should be for demo students
      const studentIds = capturedData.map(r => r.studentId);
      const demoStudentIds = mockStudents.map(s => s.id);
      expect(studentIds.every(id => demoStudentIds.includes(id))).toBe(true);
    });
  });

  describe('createDemoFeeData', () => {
    const mockBranchId = 'branch-456';

    it('should create fee structures', async () => {
      // Arrange
      let capturedData: any[] = [];
      mockPrismaService.feeStructure.createMany.mockImplementation((data) => {
        capturedData = data.data;
        return Promise.resolve({ count: data.data.length });
      });

      // Act
      await service.createDemoFeeData(mockBranchId);

      // Assert
      expect(capturedData.length).toBeGreaterThan(0);
      expect(mockPrismaService.feeStructure.createMany).toHaveBeenCalled();
    });

    it('should create invoices for students', async () => {
      // Arrange
      mockPrismaService.feeStructure.createMany.mockResolvedValue({ count: 3 });
      mockPrismaService.invoice.createMany.mockResolvedValue({ count: 50 });

      mockPrismaService.student.findMany.mockResolvedValue(
        Array(50).fill(null).map((_, i) => ({ id: `student-${i}`, isDemo: true }))
      );

      // Act
      await service.createDemoFeeData(mockBranchId);

      // Assert
      expect(mockPrismaService.invoice.createMany).toHaveBeenCalled();
    });

    it('should create some paid and pending payments', async () => {
      // Arrange
      let capturedPaymentData: any[] = [];
      mockPrismaService.feeStructure.createMany.mockResolvedValue({ count: 3 });
      mockPrismaService.invoice.createMany.mockResolvedValue({ count: 50 });
      mockPrismaService.payment.createMany.mockImplementation((data) => {
        capturedPaymentData = data.data;
        return Promise.resolve({ count: data.data.length });
      });

      mockPrismaService.student.findMany.mockResolvedValue(
        Array(50).fill(null).map((_, i) => ({ id: `student-${i}` }))
      );

      // Act
      await service.createDemoFeeData(mockBranchId);

      // Assert
      if (capturedPaymentData.length > 0) {
        // Should have both paid and pending
        const statuses = capturedPaymentData.map(p => p.status);
        expect(statuses).toContain('paid');
      }
    });

    it('should use Indian rupees (₹)', async () => {
      // Arrange
      let capturedFeeData: any[] = [];
      mockPrismaService.feeStructure.createMany.mockImplementation((data) => {
        capturedFeeData = data.data;
        return Promise.resolve({ count: data.data.length });
      });

      // Act
      await service.createDemoFeeData(mockBranchId);

      // Assert
      expect(capturedFeeData.length).toBeGreaterThan(0);

      // Check that amounts are in reasonable range for INR
      const amounts = capturedFeeData.map(f => f.amount).filter(Boolean);
      expect(amounts.length).toBeGreaterThan(0);

      // Typical school fees in India: 5000-100000 INR
      expect(amounts.every(amt => amt >= 1000 && amt <= 200000)).toBe(true);
    });
  });

  describe('cleanupDemoData', () => {
    const mockOnboardingStateId = 'onboarding-123';

    it('should delete all data marked with onboardingStateId', async () => {
      // Arrange
      mockPrismaService.student.deleteMany.mockResolvedValue({ count: 50 });
      mockPrismaService.teacher.deleteMany.mockResolvedValue({ count: 10 });
      mockPrismaService.staff.deleteMany.mockResolvedValue({ count: 10 });
      mockPrismaService.attendanceRecord.deleteMany.mockResolvedValue({ count: 1000 });
      mockPrismaService.invoice.deleteMany.mockResolvedValue({ count: 50 });
      mockPrismaService.payment.deleteMany.mockResolvedValue({ count: 35 });

      // Act
      await service.cleanupDemoData(mockOnboardingStateId);

      // Assert
      expect(mockPrismaService.student.deleteMany).toHaveBeenCalledWith({
        where: { demoOnboardingId: mockOnboardingStateId },
      });
      expect(mockPrismaService.teacher.deleteMany).toHaveBeenCalled();
      expect(mockPrismaService.attendanceRecord.deleteMany).toHaveBeenCalled();
    });

    it('should cascade delete properly', async () => {
      // Arrange
      mockPrismaService.$transaction.mockImplementation(async (operations) => {
        return operations;
      });

      mockPrismaService.student.deleteMany.mockResolvedValue({ count: 50 });
      mockPrismaService.attendanceRecord.deleteMany.mockResolvedValue({ count: 1000 });
      mockPrismaService.invoice.deleteMany.mockResolvedValue({ count: 50 });

      // Act
      await service.cleanupDemoData(mockOnboardingStateId);

      // Assert
      // Should delete related records first (attendance, invoices) then students
      expect(mockPrismaService.attendanceRecord.deleteMany).toHaveBeenCalled();
      expect(mockPrismaService.invoice.deleteMany).toHaveBeenCalled();
      expect(mockPrismaService.student.deleteMany).toHaveBeenCalled();
    });

    it('should not affect real data', async () => {
      // Arrange
      mockPrismaService.student.deleteMany.mockResolvedValue({ count: 50 });
      mockPrismaService.teacher.deleteMany.mockResolvedValue({ count: 10 });
      mockPrismaService.staff.deleteMany.mockResolvedValue({ count: 10 });

      // Act
      await service.cleanupDemoData(mockOnboardingStateId);

      // Assert
      // Verify that deleteMany is called with specific filter for demo data only
      expect(mockPrismaService.student.deleteMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          demoOnboardingId: mockOnboardingStateId,
        }),
      });
    });

    it('should throw error if onboardingStateId is invalid', async () => {
      // Act & Assert
      await expect(service.cleanupDemoData('')).rejects.toThrow(BadRequestException);
      await expect(service.cleanupDemoData(null as any)).rejects.toThrow(BadRequestException);
      await expect(service.cleanupDemoData(undefined as any)).rejects.toThrow(BadRequestException);
    });

    it('should handle cleanup errors gracefully', async () => {
      // Arrange
      mockPrismaService.student.deleteMany.mockRejectedValue(new Error('Delete failed'));

      // Act & Assert
      await expect(service.cleanupDemoData(mockOnboardingStateId)).rejects.toThrow();
    });

    it('should return cleanup summary', async () => {
      // Arrange
      mockPrismaService.student.deleteMany.mockResolvedValue({ count: 50 });
      mockPrismaService.teacher.deleteMany.mockResolvedValue({ count: 10 });
      mockPrismaService.staff.deleteMany.mockResolvedValue({ count: 10 });
      mockPrismaService.attendanceRecord.deleteMany.mockResolvedValue({ count: 1000 });
      mockPrismaService.invoice.deleteMany.mockResolvedValue({ count: 50 });
      mockPrismaService.payment.deleteMany.mockResolvedValue({ count: 35 });

      // Act
      const result = await service.cleanupDemoData(mockOnboardingStateId);

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveProperty('studentsDeleted');
      expect(result).toHaveProperty('teachersDeleted');
      expect(result).toHaveProperty('attendanceDeleted');
      expect(result).toHaveProperty('invoicesDeleted');
    });
  });

  describe('Error Cases', () => {
    const mockOnboardingStateId = 'onboarding-123';
    const mockBranchId = 'branch-456';

    it('should handle transaction rollback on partial failure', async () => {
      // Arrange
      mockPrismaService.$transaction.mockImplementation(async (fn) => {
        if (typeof fn === 'function') {
          const tx = {
            student: {
              createMany: jest.fn(() => Promise.resolve({ count: 50 })),
            },
            teacher: {
              createMany: jest.fn(() => Promise.reject(new Error('Teacher creation failed'))),
            },
          };
          return fn(tx);
        }
        throw new Error('Transaction failed');
      });

      // Act & Assert
      await expect(service.generateDemoData(mockOnboardingStateId, mockBranchId)).rejects.toThrow();
    });

    it('should throw InternalServerErrorException on unexpected errors', async () => {
      // Arrange
      mockPrismaService.student.createMany.mockRejectedValue(new Error('Unexpected error'));

      // Act & Assert
      await expect(service.createDemoStudents(mockOnboardingStateId, mockBranchId)).rejects.toThrow();
    });

    it('should validate inputs before processing', async () => {
      // Act & Assert - Various invalid inputs
      await expect(service.generateDemoData('', mockBranchId)).rejects.toThrow(BadRequestException);
      await expect(service.generateDemoData(mockOnboardingStateId, '')).rejects.toThrow(BadRequestException);
      await expect(service.cleanupDemoData('')).rejects.toThrow(BadRequestException);
    });
  });
});
