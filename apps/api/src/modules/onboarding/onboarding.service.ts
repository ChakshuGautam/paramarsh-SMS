import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OnboardingState } from '@prisma/client';

interface SchoolSetupDto {
  schoolName: string;
  schoolType: string;
  location: string;
  academicYear: string;
  logoUrl?: string;
  brandColor?: string;
}

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get or create onboarding state for a user
   */
  async getOrCreateState(userId: string): Promise<OnboardingState> {
    // Validate userId
    if (!userId || userId.trim() === '') {
      throw new BadRequestException('User ID is required');
    }

    // Check if state exists
    const existingState = await this.prisma.onboardingState.findFirst({
      where: { userId },
    });

    if (existingState) {
      return existingState;
    }

    // Create new state with defaults
    const newState = await this.prisma.onboardingState.create({
      data: {
        userId,
        currentStep: 1,
        completedSteps: '[]',
      },
    });

    return newState;
  }

  /**
   * Setup school information (Step 1)
   */
  async setupSchool(userId: string, data: SchoolSetupDto): Promise<OnboardingState> {
    // Validate required fields
    this.validateSchoolSetupDto(data);

    // Get existing state or throw error
    const state = await this.prisma.onboardingState.findFirst({
      where: { userId },
    });

    if (!state) {
      throw new NotFoundException('Onboarding state not found');
    }

    // Parse current completed steps
    const completedSteps = state.completedSteps ? JSON.parse(state.completedSteps) : [];

    // Add step 1 if not already completed
    if (!completedSteps.includes(1)) {
      completedSteps.push(1);
    }

    // Update state with school info
    const updatedState = await this.prisma.onboardingState.update({
      where: { id: state.id },
      data: {
        schoolName: data.schoolName,
        schoolType: data.schoolType,
        location: data.location,
        academicYear: data.academicYear,
        logoUrl: data.logoUrl || null,
        brandColor: data.brandColor || null,
        currentStep: 2,
        completedSteps: JSON.stringify(completedSteps),
      },
    });

    return updatedState;
  }

  /**
   * Complete dashboard tour (Step 2)
   */
  async completeDashboardTour(userId: string): Promise<OnboardingState> {
    // Get existing state or throw error
    const state = await this.prisma.onboardingState.findFirst({
      where: { userId },
    });

    if (!state) {
      throw new NotFoundException('Onboarding state not found');
    }

    // Parse current completed steps
    const completedSteps = state.completedSteps ? JSON.parse(state.completedSteps) : [];

    // Add step 2 if not already completed
    if (!completedSteps.includes(2)) {
      completedSteps.push(2);
    }

    // Update state
    const updatedState = await this.prisma.onboardingState.update({
      where: { id: state.id },
      data: {
        dashboardTourCompleted: true,
        currentStep: 3,
        completedSteps: JSON.stringify(completedSteps),
      },
    });

    return updatedState;
  }

  /**
   * Configure user roles (Step 3)
   */
  async configureUserRoles(userId: string): Promise<OnboardingState> {
    // Get existing state or throw error
    const state = await this.prisma.onboardingState.findFirst({
      where: { userId },
    });

    if (!state) {
      throw new NotFoundException('Onboarding state not found');
    }

    // Parse current completed steps
    const completedSteps = state.completedSteps ? JSON.parse(state.completedSteps) : [];

    // Add step 3 if not already completed
    if (!completedSteps.includes(3)) {
      completedSteps.push(3);
    }

    // Update state
    const updatedState = await this.prisma.onboardingState.update({
      where: { id: state.id },
      data: {
        rolesConfigured: true,
        currentStep: 4,
        completedSteps: JSON.stringify(completedSteps),
      },
    });

    return updatedState;
  }

  /**
   * Configure classes and curriculum (Step 4)
   */
  async configureClasses(userId: string, classesData: any): Promise<OnboardingState> {
    // Get existing state or throw error
    const state = await this.prisma.onboardingState.findFirst({
      where: { userId },
    });

    if (!state) {
      throw new NotFoundException('Onboarding state not found');
    }

    // Validate classesData structure
    this.validateClassesData(classesData);

    // Parse current completed steps
    const completedSteps = state.completedSteps ? JSON.parse(state.completedSteps) : [];

    // Add step 4 if not already completed
    if (!completedSteps.includes(4)) {
      completedSteps.push(4);
    }

    // Update state
    const updatedState = await this.prisma.onboardingState.update({
      where: { id: state.id },
      data: {
        classesData: JSON.stringify(classesData),
        classesConfigured: true,
        currentStep: 5,
        completedSteps: JSON.stringify(completedSteps),
      },
    });

    return updatedState;
  }

  /**
   * Generate timetable configuration (Step 5)
   */
  async generateTimetable(userId: string, timetableConfig: any): Promise<OnboardingState> {
    // Get existing state or throw error
    const state = await this.prisma.onboardingState.findFirst({
      where: { userId },
    });

    if (!state) {
      throw new NotFoundException('Onboarding state not found');
    }

    // Validate timetableConfig structure
    this.validateTimetableConfig(timetableConfig);

    // Parse current completed steps
    const completedSteps = state.completedSteps ? JSON.parse(state.completedSteps) : [];

    // Add step 5 if not already completed
    if (!completedSteps.includes(5)) {
      completedSteps.push(5);
    }

    // Update state
    const updatedState = await this.prisma.onboardingState.update({
      where: { id: state.id },
      data: {
        timetableData: JSON.stringify(timetableConfig),
        timetableGenerated: true,
        currentStep: 6,
        completedSteps: JSON.stringify(completedSteps),
      },
    });

    return updatedState;
  }

  /**
   * Validate school setup DTO
   */
  private validateSchoolSetupDto(data: SchoolSetupDto): void {
    // Check required fields
    if (!data.schoolName || data.schoolName.trim() === '') {
      throw new BadRequestException('School name is required');
    }

    if (!data.schoolType || data.schoolType.trim() === '') {
      throw new BadRequestException('School type is required');
    }

    if (!data.location || data.location.trim() === '') {
      throw new BadRequestException('Location is required');
    }

    if (!data.academicYear || data.academicYear.trim() === '') {
      throw new BadRequestException('Academic year is required');
    }

    // Validate school name length
    if (data.schoolName.length > 500) {
      throw new BadRequestException('School name must not exceed 500 characters');
    }

    // Validate academic year format (should be like "2024-25" or "2024-2025")
    const academicYearPattern = /^\d{4}[-/](\d{2}|\d{4})$/;
    if (!academicYearPattern.test(data.academicYear)) {
      throw new BadRequestException('Academic year must be in format YYYY-YY or YYYY-YYYY');
    }

    // Validate school type (common types)
    const validSchoolTypes = ['private', 'public', 'government', 'aided', 'international'];
    if (!validSchoolTypes.includes(data.schoolType.toLowerCase())) {
      throw new BadRequestException(`School type must be one of: ${validSchoolTypes.join(', ')}`);
    }

    // Validate null values for required fields
    if (data.schoolName === null || data.schoolType === null ||
        data.location === null || data.academicYear === null) {
      throw new BadRequestException('Required fields cannot be null');
    }
  }

  /**
   * Validate classes data structure
   */
  private validateClassesData(classesData: any): void {
    if (!classesData || typeof classesData !== 'object') {
      throw new BadRequestException('Classes data must be an object');
    }

    if (!classesData.classes) {
      throw new BadRequestException('Classes data must contain a "classes" array');
    }

    if (!Array.isArray(classesData.classes)) {
      throw new BadRequestException('Classes must be an array');
    }

    if (classesData.classes.length === 0) {
      throw new BadRequestException('Classes array cannot be empty');
    }

    // Validate each class entry
    for (const classEntry of classesData.classes) {
      if (!classEntry.grade || classEntry.grade.trim() === '') {
        throw new BadRequestException('Each class must have a non-empty grade');
      }
      if (!classEntry.section || classEntry.section.trim() === '') {
        throw new BadRequestException('Each class must have a non-empty section');
      }
      if (classEntry.capacity === undefined || classEntry.capacity === null) {
        throw new BadRequestException('Each class must have a capacity');
      }
    }
  }

  /**
   * Configure attendance (Step 6)
   */
  async configureAttendance(userId: string): Promise<OnboardingState> {
    // Get existing state or throw error
    const state = await this.prisma.onboardingState.findFirst({
      where: { userId },
    });

    if (!state) {
      throw new NotFoundException('Onboarding state not found');
    }

    // Parse current completed steps
    const completedSteps = state.completedSteps ? JSON.parse(state.completedSteps) : [];

    // Add step 6 if not already completed
    if (!completedSteps.includes(6)) {
      completedSteps.push(6);
    }

    // Update state
    const updatedState = await this.prisma.onboardingState.update({
      where: { id: state.id },
      data: {
        attendanceConfigured: true,
        currentStep: 7,
        completedSteps: JSON.stringify(completedSteps),
      },
    });

    return updatedState;
  }

  /**
   * Configure fee structures (Step 7)
   */
  async configureFees(userId: string, feeData: any): Promise<OnboardingState> {
    // Get existing state or throw error
    const state = await this.prisma.onboardingState.findFirst({
      where: { userId },
    });

    if (!state) {
      throw new NotFoundException('Onboarding state not found');
    }

    // Validate feeData structure
    this.validateFeeData(feeData);

    // Parse current completed steps
    const completedSteps = state.completedSteps ? JSON.parse(state.completedSteps) : [];

    // Add step 7 if not already completed
    if (!completedSteps.includes(7)) {
      completedSteps.push(7);
    }

    // Update state
    const updatedState = await this.prisma.onboardingState.update({
      where: { id: state.id },
      data: {
        feesData: JSON.stringify(feeData),
        feesConfigured: true,
        currentStep: 8,
        completedSteps: JSON.stringify(completedSteps),
      },
    });

    return updatedState;
  }

  /**
   * View reports (Step 8)
   */
  async viewReports(userId: string): Promise<OnboardingState> {
    // Get existing state or throw error
    const state = await this.prisma.onboardingState.findFirst({
      where: { userId },
    });

    if (!state) {
      throw new NotFoundException('Onboarding state not found');
    }

    // Parse current completed steps
    const completedSteps = state.completedSteps ? JSON.parse(state.completedSteps) : [];

    // Add step 8 if not already completed
    if (!completedSteps.includes(8)) {
      completedSteps.push(8);
    }

    // Update state
    const updatedState = await this.prisma.onboardingState.update({
      where: { id: state.id },
      data: {
        reportsViewed: true,
        currentStep: 9,
        completedSteps: JSON.stringify(completedSteps),
      },
    });

    return updatedState;
  }

  /**
   * Complete onboarding (Step 9)
   */
  async completeOnboarding(userId: string): Promise<OnboardingState> {
    // Get existing state or throw error
    const state = await this.prisma.onboardingState.findFirst({
      where: { userId },
    });

    if (!state) {
      throw new NotFoundException('Onboarding state not found');
    }

    // Parse current completed steps
    const completedSteps = state.completedSteps ? JSON.parse(state.completedSteps) : [];

    // Add step 9 if not already completed
    if (!completedSteps.includes(9)) {
      completedSteps.push(9);
    }

    // Generate unique branchId from school name (slug format)
    const branchId = this.generateBranchId(state.schoolName || 'school');

    // Create new branch for the school
    await this.prisma.branch.create({
      data: {
        id: branchId,
        name: state.schoolName || 'New School',
        location: state.location || undefined,
        onboardingCompleted: true,
      },
    });

    // Update state to mark as completed with branchId
    const updatedState = await this.prisma.onboardingState.update({
      where: { id: state.id },
      data: {
        branchId,
        completed: true,
        completedAt: new Date(),
        completedSteps: JSON.stringify(completedSteps),
      },
    });

    return updatedState;
  }

  /**
   * Generate a unique branch ID from school name (slug format)
   */
  private generateBranchId(schoolName: string): string {
    // Convert to lowercase, replace spaces with hyphens, remove special chars
    let slug = schoolName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Remove consecutive hyphens

    // Add timestamp to ensure uniqueness
    const timestamp = Date.now().toString(36);
    return `${slug}-${timestamp}`;
  }

  /**
   * Validate timetable config structure
   */
  private validateTimetableConfig(timetableConfig: any): void {
    if (!timetableConfig || typeof timetableConfig !== 'object') {
      throw new BadRequestException('Timetable config must be an object');
    }

    // Validate workingHours
    if (!timetableConfig.workingHours) {
      throw new BadRequestException('Timetable config must contain workingHours');
    }

    if (!timetableConfig.workingHours.start || !timetableConfig.workingHours.end) {
      throw new BadRequestException('Working hours must have start and end times');
    }

    // Validate time format (HH:MM)
    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timePattern.test(timetableConfig.workingHours.start)) {
      throw new BadRequestException('Working hours start time must be in HH:MM format');
    }
    if (!timePattern.test(timetableConfig.workingHours.end)) {
      throw new BadRequestException('Working hours end time must be in HH:MM format');
    }

    // Validate workingDays
    if (!timetableConfig.workingDays || !Array.isArray(timetableConfig.workingDays)) {
      throw new BadRequestException('Timetable config must contain workingDays array');
    }

    if (timetableConfig.workingDays.length === 0) {
      throw new BadRequestException('Working days array cannot be empty');
    }
  }

  /**
   * Validate fee data structure
   */
  private validateFeeData(feeData: any): void {
    if (!feeData || typeof feeData !== 'object') {
      throw new BadRequestException('Fee data must be an object');
    }

    if (!feeData.structures) {
      throw new BadRequestException('Fee data must contain a "structures" array');
    }

    if (!Array.isArray(feeData.structures)) {
      throw new BadRequestException('Structures must be an array');
    }

    if (feeData.structures.length === 0) {
      throw new BadRequestException('Structures array cannot be empty');
    }

    // Validate each fee structure
    for (const structure of feeData.structures) {
      if (!structure.name || structure.name.trim() === '') {
        throw new BadRequestException('Each fee structure must have a non-empty name');
      }
      if (structure.amount === undefined || structure.amount === null) {
        throw new BadRequestException('Each fee structure must have an amount');
      }
      if (!structure.frequency || structure.frequency.trim() === '') {
        throw new BadRequestException('Each fee structure must have a frequency');
      }
    }
  }
}
