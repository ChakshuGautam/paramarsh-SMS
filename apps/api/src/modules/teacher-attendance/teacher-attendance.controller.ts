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
} from '@nestjs/common';
import { TeacherAttendanceService } from './teacher-attendance.service';
import { CreateTeacherAttendanceDto, UpdateTeacherAttendanceDto } from './dto/teacher-attendance.dto';

<<<<<<< HEAD
@Controller('teacher-attendance')
=======
@Controller('api/v1/teacher-attendance')
>>>>>>> origin/main
export class TeacherAttendanceController {
  constructor(private readonly service: TeacherAttendanceService) {}

  @Get()
  async findAll(
    @Query() query: any,
<<<<<<< HEAD
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID
  ) {
    const { page = 1, perPage = 10, pageSize = 10, sort, filter, id } = query;
=======
    @Headers('x-branch-id') branchId = 'branch1'
  ) {
    const { page = 1, pageSize = 10, sort, filter, id } = query;
>>>>>>> origin/main

    // Handle getMany case (when specific IDs are requested)
    if (id) {
      const ids = Array.isArray(id) ? id : [id];
      const result = await this.service.getMany(ids);
      
      // Filter by branchId for multi-tenant isolation
      const filteredData = result.data.filter((item: any) => item.branchId === branchId);
      return { data: filteredData };
    }

<<<<<<< HEAD
    const effectivePerPage = perPage || pageSize;
    const result = await this.service.findAll({
      page: +page,
      perPage: +effectivePerPage,
      sort: sort,
=======
    const result = await this.service.findAll({
      page: +page,
      pageSize: +pageSize,
      sort: sort ? JSON.parse(sort) : undefined,
>>>>>>> origin/main
      filter: filter ? JSON.parse(filter) : {},
      branchId
    });
    return { data: result.data, total: result.total };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
<<<<<<< HEAD
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID
=======
    @Headers('x-branch-id') branchId = 'branch1'
>>>>>>> origin/main
  ) {
    const result = await this.service.findOne(id, branchId);
    return { data: result };
  }

  @Post()
  async create(
    @Body() data: CreateTeacherAttendanceDto,
<<<<<<< HEAD
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID
=======
    @Headers('x-branch-id') branchId = 'branch1'
>>>>>>> origin/main
  ) {
    const result = await this.service.create({ ...data, branchId });
    return { data: result };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateTeacherAttendanceDto,
<<<<<<< HEAD
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID
  ) {
    const result = await this.service.update(id, { ...data, branchId });
=======
    @Headers('x-branch-id') branchId = 'branch1'
  ) {
    const result = await this.service.update(id, data, branchId);
>>>>>>> origin/main
    return { data: result };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
<<<<<<< HEAD
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID
=======
    @Headers('x-branch-id') branchId = 'branch1'
>>>>>>> origin/main
  ) {
    const result = await this.service.remove(id, branchId);
    return { data: result };
  }
}