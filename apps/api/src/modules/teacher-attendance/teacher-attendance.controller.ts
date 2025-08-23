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

@Controller('api/v1/teacher-attendance')
export class TeacherAttendanceController {
  constructor(private readonly service: TeacherAttendanceService) {}

  @Get()
  async findAll(
    @Query() query: any,
    @Headers('x-branch-id') branchId = 'branch1'
  ) {
    const { page = 1, pageSize = 10, sort, filter, id } = query;

    // Handle getMany case (when specific IDs are requested)
    if (id) {
      const ids = Array.isArray(id) ? id : [id];
      const result = await this.service.getMany(ids);
      
      // Filter by branchId for multi-tenant isolation
      const filteredData = result.data.filter((item: any) => item.branchId === branchId);
      return { data: filteredData };
    }

    const result = await this.service.findAll({
      page: +page,
      pageSize: +pageSize,
      sort: sort ? JSON.parse(sort) : undefined,
      filter: filter ? JSON.parse(filter) : {},
      branchId
    });
    return { data: result.data, total: result.total };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = 'branch1'
  ) {
    const result = await this.service.findOne(id, branchId);
    return { data: result };
  }

  @Post()
  async create(
    @Body() data: CreateTeacherAttendanceDto,
    @Headers('x-branch-id') branchId = 'branch1'
  ) {
    const result = await this.service.create({ ...data, branchId });
    return { data: result };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateTeacherAttendanceDto,
    @Headers('x-branch-id') branchId = 'branch1'
  ) {
    const result = await this.service.update(id, data, branchId);
    return { data: result };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = 'branch1'
  ) {
    const result = await this.service.remove(id, branchId);
    return { data: result };
  }
}