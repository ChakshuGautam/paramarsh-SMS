import { OnboardingService } from './onboarding.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('OnboardingService', () => {
  let service: OnboardingService;
  let prisma: jest.Mocked<PrismaService>;

  // Mock data
  const mockUserId = 'user-123';
  const mockOnboardingState = {
    id: 'state-123',
    userId: mockUserId,
    currentStep: 1,
    completedSteps: null,
    schoolName: null,
    schoolType: null,
    location: null,
    academicYear: null,
    logoUrl: null,
    brandColor: null,
    dashboardTourCompleted: false,
    rolesConfigured: false,
    classesConfigured: false,
    classesData: null,
    timetableGenerated: false,
    timetableData: null,
    attendanceConfigured: false,
    feesConfigured: false,
    feesData: null,
    reportsViewed: false,
    branchId: null,
    completed: false,
    startedAt: new Date(),
    lastUpdatedAt: new Date(),
    completedAt: null,
  };

  const mockSchoolSetupDto = {
    schoolName: 'Test International School',
    schoolType: 'private',
    location: 'Mumbai, Maharashtra',
    academicYear: '2024-25',
    logoUrl: 'https://example.com/logo.png',
    brandColor: '#3B82F6',
  };

  beforeEach(() => {
    // Create mock PrismaService
    prisma = {
      onboardingState: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;

    service = new OnboardingService(prisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrCreateState', () => {
    it('should create new state if it does not exist', async () => {
      const newState = {
        ...mockOnboardingState,
        currentStep: 1,
        completedSteps: '[]',
      };

      prisma.onboardingState.findFirst.mockResolvedValue(null);
      prisma.onboardingState.create.mockResolvedValue(newState);

      const result = await service.getOrCreateState(mockUserId);

      expect(prisma.onboardingState.findFirst).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
      expect(prisma.onboardingState.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          currentStep: 1,
          completedSteps: '[]',
        },
      });
      expect(result).toEqual(newState);
      expect(result.currentStep).toBe(1);
      expect(result.completedSteps).toBe('[]');
    });

    it('should return existing state if already exists', async () => {
      const existingState = {
        ...mockOnboardingState,
        currentStep: 3,
        completedSteps: '[1,2]',
      };

      prisma.onboardingState.findFirst.mockResolvedValue(existingState);

      const result = await service.getOrCreateState(mockUserId);

      expect(prisma.onboardingState.findFirst).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
      expect(prisma.onboardingState.create).not.toHaveBeenCalled();
      expect(result).toEqual(existingState);
      expect(result.currentStep).toBe(3);
    });

    it('should initialize with step 1 and empty completed steps array', async () => {
      const newState = {
        ...mockOnboardingState,
        currentStep: 1,
        completedSteps: '[]',
      };

      prisma.onboardingState.findFirst.mockResolvedValue(null);
      prisma.onboardingState.create.mockResolvedValue(newState);

      const result = await service.getOrCreateState(mockUserId);

      expect(result.currentStep).toBe(1);
      expect(result.completedSteps).toBe('[]');
      expect(result.completed).toBe(false);
    });

    it('should throw error if user ID is missing', async () => {
      await expect(service.getOrCreateState('')).rejects.toThrow();
    });

    it('should throw error if user ID is null or undefined', async () => {
      await expect(service.getOrCreateState(null as any)).rejects.toThrow();
      await expect(service.getOrCreateState(undefined as any)).rejects.toThrow();
    });
  });

  describe('setupSchool', () => {
    it('should update onboarding state with school info', async () => {
      const existingState = { ...mockOnboardingState };
      const updatedState = {
        ...existingState,
        schoolName: mockSchoolSetupDto.schoolName,
        schoolType: mockSchoolSetupDto.schoolType,
        location: mockSchoolSetupDto.location,
        academicYear: mockSchoolSetupDto.academicYear,
        logoUrl: mockSchoolSetupDto.logoUrl,
        brandColor: mockSchoolSetupDto.brandColor,
        currentStep: 2,
        completedSteps: '[1]',
      };

      prisma.onboardingState.findFirst.mockResolvedValue(existingState);
      prisma.onboardingState.update.mockResolvedValue(updatedState);

      const result = await service.setupSchool(mockUserId, mockSchoolSetupDto);

      expect(prisma.onboardingState.update).toHaveBeenCalledWith({
        where: { id: existingState.id },
        data: expect.objectContaining({
          schoolName: mockSchoolSetupDto.schoolName,
          schoolType: mockSchoolSetupDto.schoolType,
          location: mockSchoolSetupDto.location,
          academicYear: mockSchoolSetupDto.academicYear,
          logoUrl: mockSchoolSetupDto.logoUrl,
          brandColor: mockSchoolSetupDto.brandColor,
        }),
      });
      expect(result.schoolName).toBe(mockSchoolSetupDto.schoolName);
    });

    it('should mark step 1 as complete', async () => {
      const existingState = { ...mockOnboardingState, completedSteps: '[]' };
      const updatedState = {
        ...existingState,
        ...mockSchoolSetupDto,
        currentStep: 2,
        completedSteps: '[1]',
      };

      prisma.onboardingState.findFirst.mockResolvedValue(existingState);
      prisma.onboardingState.update.mockResolvedValue(updatedState);

      const result = await service.setupSchool(mockUserId, mockSchoolSetupDto);

      expect(prisma.onboardingState.update).toHaveBeenCalledWith({
        where: { id: existingState.id },
        data: expect.objectContaining({
          completedSteps: expect.stringContaining('1'),
        }),
      });
      expect(result.completedSteps).toContain('1');
    });

    it('should update currentStep to 2', async () => {
      const existingState = { ...mockOnboardingState };
      const updatedState = {
        ...existingState,
        ...mockSchoolSetupDto,
        currentStep: 2,
        completedSteps: '[1]',
      };

      prisma.onboardingState.findFirst.mockResolvedValue(existingState);
      prisma.onboardingState.update.mockResolvedValue(updatedState);

      const result = await service.setupSchool(mockUserId, mockSchoolSetupDto);

      expect(prisma.onboardingState.update).toHaveBeenCalledWith({
        where: { id: existingState.id },
        data: expect.objectContaining({
          currentStep: 2,
        }),
      });
      expect(result.currentStep).toBe(2);
    });

    it('should validate required fields - schoolName', async () => {
      const invalidDto = { ...mockSchoolSetupDto, schoolName: '' };

      await expect(service.setupSchool(mockUserId, invalidDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should validate required fields - schoolType', async () => {
      const invalidDto = { ...mockSchoolSetupDto, schoolType: '' };

      await expect(service.setupSchool(mockUserId, invalidDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should validate required fields - location', async () => {
      const invalidDto = { ...mockSchoolSetupDto, location: '' };

      await expect(service.setupSchool(mockUserId, invalidDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should validate required fields - academicYear', async () => {
      const invalidDto = { ...mockSchoolSetupDto, academicYear: '' };

      await expect(service.setupSchool(mockUserId, invalidDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should handle optional fields (logoUrl and brandColor)', async () => {
      const minimalDto = {
        schoolName: mockSchoolSetupDto.schoolName,
        schoolType: mockSchoolSetupDto.schoolType,
        location: mockSchoolSetupDto.location,
        academicYear: mockSchoolSetupDto.academicYear,
      };

      const existingState = { ...mockOnboardingState };
      const updatedState = {
        ...existingState,
        ...minimalDto,
        currentStep: 2,
        completedSteps: '[1]',
      };

      prisma.onboardingState.findFirst.mockResolvedValue(existingState);
      prisma.onboardingState.update.mockResolvedValue(updatedState);

      const result = await service.setupSchool(mockUserId, minimalDto);

      expect(result.schoolName).toBe(minimalDto.schoolName);
      expect(result.currentStep).toBe(2);
    });

    it('should throw error if onboarding state does not exist', async () => {
      prisma.onboardingState.findFirst.mockResolvedValue(null);
      prisma.onboardingState.create.mockRejectedValue(new Error('Creation failed'));

      await expect(service.setupSchool(mockUserId, mockSchoolSetupDto)).rejects.toThrow();
    });
  });

  describe('completeDashboardTour', () => {
    it('should mark dashboardTourCompleted as true', async () => {
      const existingState = {
        ...mockOnboardingState,
        currentStep: 2,
        completedSteps: '[1]',
      };
      const updatedState = {
        ...existingState,
        dashboardTourCompleted: true,
        currentStep: 3,
        completedSteps: '[1,2]',
      };

      prisma.onboardingState.findFirst.mockResolvedValue(existingState);
      prisma.onboardingState.update.mockResolvedValue(updatedState);

      const result = await service.completeDashboardTour(mockUserId);

      expect(prisma.onboardingState.update).toHaveBeenCalledWith({
        where: { id: existingState.id },
        data: expect.objectContaining({
          dashboardTourCompleted: true,
        }),
      });
      expect(result.dashboardTourCompleted).toBe(true);
    });

    it('should mark step 2 as complete', async () => {
      const existingState = {
        ...mockOnboardingState,
        currentStep: 2,
        completedSteps: '[1]',
      };
      const updatedState = {
        ...existingState,
        dashboardTourCompleted: true,
        currentStep: 3,
        completedSteps: '[1,2]',
      };

      prisma.onboardingState.findFirst.mockResolvedValue(existingState);
      prisma.onboardingState.update.mockResolvedValue(updatedState);

      const result = await service.completeDashboardTour(mockUserId);

      expect(result.completedSteps).toContain('2');
    });

    it('should update currentStep to 3', async () => {
      const existingState = {
        ...mockOnboardingState,
        currentStep: 2,
        completedSteps: '[1]',
      };
      const updatedState = {
        ...existingState,
        dashboardTourCompleted: true,
        currentStep: 3,
        completedSteps: '[1,2]',
      };

      prisma.onboardingState.findFirst.mockResolvedValue(existingState);
      prisma.onboardingState.update.mockResolvedValue(updatedState);

      const result = await service.completeDashboardTour(mockUserId);

      expect(result.currentStep).toBe(3);
    });

    it('should throw error if onboarding state not found', async () => {
      prisma.onboardingState.findFirst.mockResolvedValue(null);

      await expect(service.completeDashboardTour(mockUserId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('configureUserRoles', () => {
    it('should mark rolesConfigured as true', async () => {
      const existingState = {
        ...mockOnboardingState,
        currentStep: 3,
        completedSteps: '[1,2]',
      };
      const updatedState = {
        ...existingState,
        rolesConfigured: true,
        currentStep: 4,
        completedSteps: '[1,2,3]',
      };

      prisma.onboardingState.findFirst.mockResolvedValue(existingState);
      prisma.onboardingState.update.mockResolvedValue(updatedState);

      const result = await service.configureUserRoles(mockUserId);

      expect(prisma.onboardingState.update).toHaveBeenCalledWith({
        where: { id: existingState.id },
        data: expect.objectContaining({
          rolesConfigured: true,
        }),
      });
      expect(result.rolesConfigured).toBe(true);
    });

    it('should mark step 3 as complete', async () => {
      const existingState = {
        ...mockOnboardingState,
        currentStep: 3,
        completedSteps: '[1,2]',
      };
      const updatedState = {
        ...existingState,
        rolesConfigured: true,
        currentStep: 4,
        completedSteps: '[1,2,3]',
      };

      prisma.onboardingState.findFirst.mockResolvedValue(existingState);
      prisma.onboardingState.update.mockResolvedValue(updatedState);

      const result = await service.configureUserRoles(mockUserId);

      expect(result.completedSteps).toContain('3');
    });

    it('should update currentStep to 4', async () => {
      const existingState = {
        ...mockOnboardingState,
        currentStep: 3,
        completedSteps: '[1,2]',
      };
      const updatedState = {
        ...existingState,
        rolesConfigured: true,
        currentStep: 4,
        completedSteps: '[1,2,3]',
      };

      prisma.onboardingState.findFirst.mockResolvedValue(existingState);
      prisma.onboardingState.update.mockResolvedValue(updatedState);

      const result = await service.configureUserRoles(mockUserId);

      expect(result.currentStep).toBe(4);
    });

    it('should throw error if onboarding state not found', async () => {
      prisma.onboardingState.findFirst.mockResolvedValue(null);

      await expect(service.configureUserRoles(mockUserId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('configureClasses', () => {
    const classesData = {
      classes: [
        { grade: 'Nursery', section: 'A', capacity: 30 },
        { grade: 'LKG', section: 'A', capacity: 35 },
        { grade: 'Class 1', section: 'A', capacity: 40 },
      ],
    };

    it('should save classesData as JSON', async () => {
      const existingState = {
        ...mockOnboardingState,
        currentStep: 4,
        completedSteps: '[1,2,3]',
      };
      const updatedState = {
        ...existingState,
        classesData: JSON.stringify(classesData),
        classesConfigured: true,
        currentStep: 5,
        completedSteps: '[1,2,3,4]',
      };

      prisma.onboardingState.findFirst.mockResolvedValue(existingState);
      prisma.onboardingState.update.mockResolvedValue(updatedState);

      const result = await service.configureClasses(mockUserId, classesData);

      expect(prisma.onboardingState.update).toHaveBeenCalledWith({
        where: { id: existingState.id },
        data: expect.objectContaining({
          classesData: expect.any(String),
        }),
      });
      expect(result.classesData).toBe(JSON.stringify(classesData));
    });

    it('should mark classesConfigured as true', async () => {
      const existingState = {
        ...mockOnboardingState,
        currentStep: 4,
        completedSteps: '[1,2,3]',
      };
      const updatedState = {
        ...existingState,
        classesData: JSON.stringify(classesData),
        classesConfigured: true,
        currentStep: 5,
        completedSteps: '[1,2,3,4]',
      };

      prisma.onboardingState.findFirst.mockResolvedValue(existingState);
      prisma.onboardingState.update.mockResolvedValue(updatedState);

      const result = await service.configureClasses(mockUserId, classesData);

      expect(result.classesConfigured).toBe(true);
    });

    it('should mark step 4 as complete', async () => {
      const existingState = {
        ...mockOnboardingState,
        currentStep: 4,
        completedSteps: '[1,2,3]',
      };
      const updatedState = {
        ...existingState,
        classesData: JSON.stringify(classesData),
        classesConfigured: true,
        currentStep: 5,
        completedSteps: '[1,2,3,4]',
      };

      prisma.onboardingState.findFirst.mockResolvedValue(existingState);
      prisma.onboardingState.update.mockResolvedValue(updatedState);

      const result = await service.configureClasses(mockUserId, classesData);

      expect(result.completedSteps).toContain('4');
    });

    it('should update currentStep to 5', async () => {
      const existingState = {
        ...mockOnboardingState,
        currentStep: 4,
        completedSteps: '[1,2,3]',
      };
      const updatedState = {
        ...existingState,
        classesData: JSON.stringify(classesData),
        classesConfigured: true,
        currentStep: 5,
        completedSteps: '[1,2,3,4]',
      };

      prisma.onboardingState.findFirst.mockResolvedValue(existingState);
      prisma.onboardingState.update.mockResolvedValue(updatedState);

      const result = await service.configureClasses(mockUserId, classesData);

      expect(result.currentStep).toBe(5);
    });

    it('should handle empty classes array', async () => {
      const emptyClassesData = { classes: [] };

      const existingState = {
        ...mockOnboardingState,
        currentStep: 4,
        completedSteps: '[1,2,3]',
      };

      prisma.onboardingState.findFirst.mockResolvedValue(existingState);

      await expect(service.configureClasses(mockUserId, emptyClassesData)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should validate classes data structure', async () => {
      const invalidClassesData = {
        classes: [
          { grade: '', section: 'A', capacity: 30 }, // Invalid: empty grade
        ],
      };

      const existingState = {
        ...mockOnboardingState,
        currentStep: 4,
        completedSteps: '[1,2,3]',
      };

      prisma.onboardingState.findFirst.mockResolvedValue(existingState);

      await expect(
        service.configureClasses(mockUserId, invalidClassesData)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if onboarding state not found', async () => {
      prisma.onboardingState.findFirst.mockResolvedValue(null);

      await expect(service.configureClasses(mockUserId, classesData)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('generateTimetable', () => {
    const timetableConfig = {
      workingHours: {
        start: '09:00',
        end: '15:00',
      },
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      periodsPerDay: 6,
      breakTimes: [
        { start: '10:30', end: '10:45', name: 'Short Break' },
        { start: '12:30', end: '13:15', name: 'Lunch Break' },
      ],
    };

    it('should save timetableData as JSON', async () => {
      const existingState = {
        ...mockOnboardingState,
        currentStep: 5,
        completedSteps: '[1,2,3,4]',
      };
      const updatedState = {
        ...existingState,
        timetableData: JSON.stringify(timetableConfig),
        timetableGenerated: true,
        currentStep: 6,
        completedSteps: '[1,2,3,4,5]',
      };

      prisma.onboardingState.findFirst.mockResolvedValue(existingState);
      prisma.onboardingState.update.mockResolvedValue(updatedState);

      const result = await service.generateTimetable(mockUserId, timetableConfig);

      expect(prisma.onboardingState.update).toHaveBeenCalledWith({
        where: { id: existingState.id },
        data: expect.objectContaining({
          timetableData: expect.any(String),
        }),
      });
      expect(result.timetableData).toBe(JSON.stringify(timetableConfig));
    });

    it('should mark timetableGenerated as true', async () => {
      const existingState = {
        ...mockOnboardingState,
        currentStep: 5,
        completedSteps: '[1,2,3,4]',
      };
      const updatedState = {
        ...existingState,
        timetableData: JSON.stringify(timetableConfig),
        timetableGenerated: true,
        currentStep: 6,
        completedSteps: '[1,2,3,4,5]',
      };

      prisma.onboardingState.findFirst.mockResolvedValue(existingState);
      prisma.onboardingState.update.mockResolvedValue(updatedState);

      const result = await service.generateTimetable(mockUserId, timetableConfig);

      expect(result.timetableGenerated).toBe(true);
    });

    it('should mark step 5 as complete', async () => {
      const existingState = {
        ...mockOnboardingState,
        currentStep: 5,
        completedSteps: '[1,2,3,4]',
      };
      const updatedState = {
        ...existingState,
        timetableData: JSON.stringify(timetableConfig),
        timetableGenerated: true,
        currentStep: 6,
        completedSteps: '[1,2,3,4,5]',
      };

      prisma.onboardingState.findFirst.mockResolvedValue(existingState);
      prisma.onboardingState.update.mockResolvedValue(updatedState);

      const result = await service.generateTimetable(mockUserId, timetableConfig);

      expect(result.completedSteps).toContain('5');
    });

    it('should update currentStep to 6', async () => {
      const existingState = {
        ...mockOnboardingState,
        currentStep: 5,
        completedSteps: '[1,2,3,4]',
      };
      const updatedState = {
        ...existingState,
        timetableData: JSON.stringify(timetableConfig),
        timetableGenerated: true,
        currentStep: 6,
        completedSteps: '[1,2,3,4,5]',
      };

      prisma.onboardingState.findFirst.mockResolvedValue(existingState);
      prisma.onboardingState.update.mockResolvedValue(updatedState);

      const result = await service.generateTimetable(mockUserId, timetableConfig);

      expect(result.currentStep).toBe(6);
    });

    it('should validate timetable config structure', async () => {
      const invalidConfig = {
        workingHours: {
          start: 'invalid-time', // Invalid format
          end: '15:00',
        },
        workingDays: [],
      };

      const existingState = {
        ...mockOnboardingState,
        currentStep: 5,
        completedSteps: '[1,2,3,4]',
      };

      prisma.onboardingState.findFirst.mockResolvedValue(existingState);

      await expect(
        service.generateTimetable(mockUserId, invalidConfig)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if onboarding state not found', async () => {
      prisma.onboardingState.findFirst.mockResolvedValue(null);

      await expect(
        service.generateTimetable(mockUserId, timetableConfig)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Error Cases', () => {
    describe('User Not Found', () => {
      it('should throw NotFoundException when user does not exist for setupSchool', async () => {
        prisma.onboardingState.findFirst.mockResolvedValue(null);
        prisma.onboardingState.create.mockRejectedValue(
          new Error('User not found in system')
        );

        await expect(
          service.setupSchool(mockUserId, mockSchoolSetupDto)
        ).rejects.toThrow();
      });

      it('should throw NotFoundException when user does not exist for completeDashboardTour', async () => {
        prisma.onboardingState.findFirst.mockResolvedValue(null);

        await expect(service.completeDashboardTour(mockUserId)).rejects.toThrow(
          NotFoundException
        );
      });
    });

    describe('Invalid Data Provided', () => {
      it('should throw BadRequestException for null schoolName', async () => {
        const invalidDto = { ...mockSchoolSetupDto, schoolName: null as any };

        await expect(service.setupSchool(mockUserId, invalidDto)).rejects.toThrow(
          BadRequestException
        );
      });

      it('should throw BadRequestException for invalid academicYear format', async () => {
        const invalidDto = { ...mockSchoolSetupDto, academicYear: '2024' }; // Invalid format

        await expect(service.setupSchool(mockUserId, invalidDto)).rejects.toThrow(
          BadRequestException
        );
      });

      it('should throw BadRequestException for invalid schoolType', async () => {
        const invalidDto = { ...mockSchoolSetupDto, schoolType: 'invalid-type' };

        await expect(service.setupSchool(mockUserId, invalidDto)).rejects.toThrow(
          BadRequestException
        );
      });

      it('should throw BadRequestException for malformed classesData', async () => {
        const invalidData = {
          classes: 'not-an-array', // Should be an array
        };

        const existingState = {
          ...mockOnboardingState,
          currentStep: 4,
          completedSteps: '[1,2,3]',
        };

        prisma.onboardingState.findFirst.mockResolvedValue(existingState);

        await expect(
          service.configureClasses(mockUserId, invalidData as any)
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('Database Errors', () => {
      it('should handle database connection errors gracefully', async () => {
        const dbError = new Error('Database connection failed');
        prisma.onboardingState.findFirst.mockRejectedValue(dbError);

        await expect(service.getOrCreateState(mockUserId)).rejects.toThrow(
          'Database connection failed'
        );
      });

      it('should handle Prisma unique constraint violations', async () => {
        const constraintError = new Error('Unique constraint violation');
        (constraintError as any).code = 'P2002';

        const existingState = { ...mockOnboardingState };
        prisma.onboardingState.findFirst.mockResolvedValue(existingState);
        prisma.onboardingState.update.mockRejectedValue(constraintError);

        await expect(
          service.setupSchool(mockUserId, mockSchoolSetupDto)
        ).rejects.toThrow();
      });

      it('should handle database timeout errors', async () => {
        const timeoutError = new Error('Query timeout');
        prisma.onboardingState.findFirst.mockRejectedValue(timeoutError);

        await expect(service.getOrCreateState(mockUserId)).rejects.toThrow('Query timeout');
      });

      it('should rollback on partial update failures', async () => {
        const existingState = { ...mockOnboardingState };
        prisma.onboardingState.findFirst.mockResolvedValue(existingState);
        prisma.onboardingState.update.mockRejectedValue(new Error('Update failed'));

        await expect(
          service.setupSchool(mockUserId, mockSchoolSetupDto)
        ).rejects.toThrow('Update failed');

        // Verify state was not partially updated
        expect(prisma.onboardingState.update).toHaveBeenCalledTimes(1);
      });
    });

    describe('Concurrent Operations', () => {
      it('should handle concurrent updates to the same onboarding state', async () => {
        const existingState = { ...mockOnboardingState };

        prisma.onboardingState.findFirst.mockResolvedValue(existingState);
        prisma.onboardingState.update
          .mockResolvedValueOnce({
            ...existingState,
            currentStep: 2,
            completedSteps: '[1]',
          })
          .mockResolvedValueOnce({
            ...existingState,
            currentStep: 3,
            completedSteps: '[1,2]',
          });

        // Simulate concurrent operations
        const [result1, result2] = await Promise.all([
          service.setupSchool(mockUserId, mockSchoolSetupDto),
          service.completeDashboardTour(mockUserId),
        ]);

        expect(result1).toBeDefined();
        expect(result2).toBeDefined();
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty userId', async () => {
        await expect(service.getOrCreateState('')).rejects.toThrow();
      });

      it('should handle very long schoolName (>500 chars)', async () => {
        const longName = 'a'.repeat(501);
        const invalidDto = { ...mockSchoolSetupDto, schoolName: longName };

        await expect(service.setupSchool(mockUserId, invalidDto)).rejects.toThrow(
          BadRequestException
        );
      });

      it('should handle special characters in location', async () => {
        const specialDto = {
          ...mockSchoolSetupDto,
          location: "Mumbai, Maharashtra (India) - Region: West #1 & Zone: Central <Test>",
        };

        const existingState = { ...mockOnboardingState };
        const updatedState = {
          ...existingState,
          ...specialDto,
          currentStep: 2,
          completedSteps: '[1]',
        };

        prisma.onboardingState.findFirst.mockResolvedValue(existingState);
        prisma.onboardingState.update.mockResolvedValue(updatedState);

        const result = await service.setupSchool(mockUserId, specialDto);

        expect(result.location).toBe(specialDto.location);
      });

      it('should handle null values in optional fields', async () => {
        const dtoWithNulls = {
          ...mockSchoolSetupDto,
          logoUrl: null as any,
          brandColor: null as any,
        };

        const existingState = { ...mockOnboardingState };
        const updatedState = {
          ...existingState,
          schoolName: dtoWithNulls.schoolName,
          schoolType: dtoWithNulls.schoolType,
          location: dtoWithNulls.location,
          academicYear: dtoWithNulls.academicYear,
          logoUrl: null,
          brandColor: null,
          currentStep: 2,
          completedSteps: '[1]',
        };

        prisma.onboardingState.findFirst.mockResolvedValue(existingState);
        prisma.onboardingState.update.mockResolvedValue(updatedState);

        const result = await service.setupSchool(mockUserId, dtoWithNulls);

        expect(result.logoUrl).toBeNull();
        expect(result.brandColor).toBeNull();
      });
    });
  });
});
