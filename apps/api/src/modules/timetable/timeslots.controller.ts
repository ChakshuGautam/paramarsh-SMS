import { DEFAULT_BRANCH_ID } from '../../common/constants';
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Query,
  Delete,
  Headers,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TimetableService } from './timetable.service';

@ApiTags('Time Slots')
@Controller('timeslots')
export class TimeslotsController {
  constructor(private readonly timetableService: TimetableService) {}

  @Get()
  async getList(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sort') sort?: string,
    @Query('ids') ids?: string | string[],
    @Query() query?: Record<string, any>,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    // Handle getMany case (when ids are provided)
    if (ids) {
      const idArray = Array.isArray(ids) ? ids : (typeof ids === 'string' ? ids.split(',') : [ids]);
      return this.timetableService.getManyTimeSlots(idArray, branchId);
    }
    
    // Extract known params from query to get filters
    const { 
      page: _p, 
      perPage: _pp, 
      pageSize: _ps, 
      sort: _s, 
      filter: filterStr, 
      q, // Extract search query
      ids: _ids, 
      ...restQuery 
    } = query || {};
    
    // Parse filter if it's a JSON string
    let filter = {};
    if (filterStr) {
      try {
        filter = typeof filterStr === 'string' ? JSON.parse(filterStr) : filterStr;
      } catch (e) {
        filter = {};
      }
    }
    
    // Merge any remaining query params as filters
    filter = { ...filter, ...restQuery };
    
    return this.timetableService.getTimeSlotsList({
      page: page ? Number(page) : 1,
      perPage: perPage ? Number(perPage) : (pageSize ? Number(pageSize) : 25),
      sort,
      filter,
      q, // Pass search query separately
      branchId,
    });
  }

  @Get(':id')
  async getOne(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.timetableService.getOneTimeSlot(id, branchId);
  }

  @Post()
  async create(
    @Body() data: any,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.timetableService.createTimeSlot({ ...data, branchId });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: any,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    // Verify entity exists in this branch before updating
    await this.timetableService.getOneTimeSlot(id, branchId);
    return this.timetableService.updateTimeSlot(id, { ...data, branchId });
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    // Verify entity exists in this branch before deleting
    await this.timetableService.getOneTimeSlot(id, branchId);
    return this.timetableService.deleteTimeSlot(id);
  }
}