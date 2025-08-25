<<<<<<< HEAD
import { DEFAULT_BRANCH_ID } from '../../common/constants';
=======
>>>>>>> origin/main
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpStatus,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { PeriodsService } from './periods.service';
import { CreatePeriodDto } from './dto/create-period.dto';
import { UpdatePeriodDto } from './dto/update-period.dto';

<<<<<<< HEAD
@Controller('timetable/periods')
=======
@Controller('api/v1/timetable/periods')
>>>>>>> origin/main
export class PeriodsController {
  constructor(private readonly periodsService: PeriodsService) {}

  @Get()
  async findAll(
    @Query() query: any,
<<<<<<< HEAD
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    const { page = 1, perPage = 10, pageSize = 10, sort, filter } = query;
    const effectivePerPage = perPage || pageSize;
    
    const result = await this.periodsService.findAll({
      page: +page,
      perPage: +effectivePerPage,
=======
    @Headers('x-branch-id') branchId = 'branch1',
  ) {
    const { page = 1, pageSize = 10, sort, filter } = query;
    
    const result = await this.periodsService.findAll({
      page: +page,
      pageSize: +pageSize,
>>>>>>> origin/main
      sort,
      filter: filter ? JSON.parse(filter) : {},
      branchId,
    });

    return { data: result.data, total: result.total };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
<<<<<<< HEAD
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
=======
    @Headers('x-branch-id') branchId = 'branch1',
>>>>>>> origin/main
  ) {
    const result = await this.periodsService.findOne(id, branchId);
    return { data: result };
  }

  @Post()
  async create(
    @Body() createPeriodDto: CreatePeriodDto,
<<<<<<< HEAD
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
=======
    @Headers('x-branch-id') branchId = 'branch1',
>>>>>>> origin/main
  ) {
    // Validate that if it's not a break period, subjectId and teacherId are required
    if (!createPeriodDto.isBreak) {
      if (!createPeriodDto.subjectId) {
        throw new BadRequestException('subjectId is required for non-break periods');
      }
      if (!createPeriodDto.teacherId) {
        throw new BadRequestException('teacherId is required for non-break periods');
      }
    }

    const result = await this.periodsService.create({ 
      ...createPeriodDto, 
      branchId,
    });
    return { data: result };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePeriodDto: UpdatePeriodDto,
<<<<<<< HEAD
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    const result = await this.periodsService.update(id, { ...updatePeriodDto, branchId });
=======
    @Headers('x-branch-id') branchId = 'branch1',
  ) {
    const result = await this.periodsService.update(id, updatePeriodDto, branchId);
>>>>>>> origin/main
    return { data: result };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
<<<<<<< HEAD
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
=======
    @Headers('x-branch-id') branchId = 'branch1',
>>>>>>> origin/main
  ) {
    const result = await this.periodsService.remove(id, branchId);
    return { data: result };
  }
}