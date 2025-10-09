import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { DemoDataService } from './demo-data.service';
import { ClerkAuthGuard } from '../../auth/clerk-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { SchoolSetupDto } from './dto/school-setup.dto';
import { ClassesConfigDto } from './dto/classes-config.dto';
import { TimetableConfigDto } from './dto/timetable-config.dto';
import { FeeConfigDto } from './dto/fee-config.dto';

@ApiTags('Onboarding')
@Controller('onboarding')
@UseGuards(ClerkAuthGuard)
export class OnboardingController {
  constructor(
    private readonly onboardingService: OnboardingService,
    private readonly demoDataService: DemoDataService,
  ) {}

  @Get('state')
  @ApiOperation({ summary: 'Get or create onboarding state for current user' })
  @ApiResponse({ status: 200, description: 'Returns onboarding state' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getState(@CurrentUser() user: any) {
    if (!user?.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    const state = await this.onboardingService.getOrCreateState(user.id);
    return { data: state };
  }

  @Post('school-setup')
  @ApiOperation({ summary: 'Setup school information (Step 1)' })
  @ApiResponse({ status: 200, description: 'School setup completed' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async setupSchool(
    @CurrentUser() user: any,
    @Body() data: SchoolSetupDto,
  ) {
    if (!user?.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    const state = await this.onboardingService.setupSchool(user.id, data);
    return { data: state };
  }

  @Post('dashboard-tour')
  @ApiOperation({ summary: 'Complete dashboard tour and generate demo data (Step 2)' })
  @ApiResponse({ status: 200, description: 'Dashboard tour completed with demo data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async completeDashboardTour(@CurrentUser() user: any) {
    if (!user?.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Complete the dashboard tour step
    const state = await this.onboardingService.completeDashboardTour(user.id);

    // Generate temporary branchId for demo data (will be replaced on completion)
    const tempBranchId = `demo-${state.id}`;

    // Generate demo data for dashboard preview
    const demoResult = await this.demoDataService.generateDemoData(
      state.id,
      tempBranchId,
    );

    return {
      data: state,
      demoDataSummary: demoResult.summary,
    };
  }

  @Post('user-roles')
  @ApiOperation({ summary: 'Configure user roles (Step 3)' })
  @ApiResponse({ status: 200, description: 'User roles configured' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async configureUserRoles(@CurrentUser() user: any) {
    if (!user?.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    const state = await this.onboardingService.configureUserRoles(user.id);
    return { data: state };
  }

  @Post('classes')
  @ApiOperation({ summary: 'Configure classes and curriculum (Step 4)' })
  @ApiResponse({ status: 200, description: 'Classes configured' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async configureClasses(
    @CurrentUser() user: any,
    @Body() data: ClassesConfigDto,
  ) {
    if (!user?.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    const state = await this.onboardingService.configureClasses(user.id, data);
    return { data: state };
  }

  @Post('timetable')
  @ApiOperation({ summary: 'Generate timetable configuration (Step 5)' })
  @ApiResponse({ status: 200, description: 'Timetable configured' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generateTimetable(
    @CurrentUser() user: any,
    @Body() data: TimetableConfigDto,
  ) {
    if (!user?.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    const state = await this.onboardingService.generateTimetable(user.id, data);
    return { data: state };
  }

  @Post('attendance')
  @ApiOperation({ summary: 'Configure attendance (Step 6)' })
  @ApiResponse({ status: 200, description: 'Attendance configured' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async configureAttendance(@CurrentUser() user: any) {
    if (!user?.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    const state = await this.onboardingService.configureAttendance(user.id);
    return { data: state };
  }

  @Post('fees')
  @ApiOperation({ summary: 'Configure fee structures (Step 7)' })
  @ApiResponse({ status: 200, description: 'Fee structures configured' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async configureFees(
    @CurrentUser() user: any,
    @Body() data: FeeConfigDto,
  ) {
    if (!user?.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    const state = await this.onboardingService.configureFees(user.id, data);
    return { data: state };
  }

  @Post('reports')
  @ApiOperation({ summary: 'View reports (Step 8)' })
  @ApiResponse({ status: 200, description: 'Reports viewed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async viewReports(@CurrentUser() user: any) {
    if (!user?.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    const state = await this.onboardingService.viewReports(user.id);
    return { data: state };
  }

  @Post('complete')
  @ApiOperation({ summary: 'Complete onboarding (Step 9)' })
  @ApiResponse({ status: 200, description: 'Onboarding completed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async completeOnboarding(@CurrentUser() user: any) {
    if (!user?.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Complete onboarding (creates branch)
    const state = await this.onboardingService.completeOnboarding(user.id);

    // Cleanup demo data
    await this.demoDataService.cleanupDemoData(state.id);

    return {
      data: state,
      message: 'Onboarding completed',
    };
  }
}
