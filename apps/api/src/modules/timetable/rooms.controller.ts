<<<<<<< HEAD
import { DEFAULT_BRANCH_ID } from '../../common/constants';
=======
>>>>>>> origin/main
import {
  Controller,
  Get,
  Post,
  Body,
<<<<<<< HEAD
  Put,
  Param,
  Delete,
  Query,
  Headers,
=======
  Patch,
  Param,
  Delete,
  Query,
>>>>>>> origin/main
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ListDocs, CreateDocs, UpdateDocs, DeleteDocs } from '../../common/swagger.decorators';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new room',
    description: 'Creates a new room with code, name, capacity, and facility details'
  })
  @CreateDocs('Room created successfully')
<<<<<<< HEAD
  async create(
    @Body() createRoomDto: CreateRoomDto,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.roomsService.create({ ...createRoomDto, branchId });
=======
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
>>>>>>> origin/main
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all rooms',
<<<<<<< HEAD
    description: 'Retrieves a list of all rooms with React Admin format support'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'perPage', required: false, description: 'Items per page', example: 25 })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Page size (alias for perPage)', example: 25 })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort field and direction', example: 'name' })
  @ApiQuery({ name: 'ids', required: false, description: 'Comma-separated list of IDs for getMany operation' })
  @ApiQuery({ name: 'filter', required: false, description: 'Filter object as JSON string' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @ListDocs('List of rooms')
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
      return this.roomsService.getMany(idArray, branchId);
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
    
    return this.roomsService.getList({
      page: page ? Number(page) : 1,
      perPage: perPage ? Number(perPage) : (pageSize ? Number(pageSize) : 25),
      sort,
      filter,
      q, // Pass search query separately
      branchId,
=======
    description: 'Retrieves a list of all rooms with optional filtering by type, building, capacity, and status'
  })
  @ApiQuery({ name: 'type', required: false, description: 'Room type filter', example: 'classroom' })
  @ApiQuery({ name: 'building', required: false, description: 'Building name filter', example: 'Academic Block A' })
  @ApiQuery({ name: 'minCapacity', required: false, description: 'Minimum capacity filter', example: '30' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Active status filter', example: 'true' })
  @ListDocs('List of rooms')
  findAll(
    @Query('type') type?: string,
    @Query('building') building?: string,
    @Query('minCapacity') minCapacity?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.roomsService.findAll({
      type,
      building,
      minCapacity: minCapacity ? parseInt(minCapacity, 10) : undefined,
      isActive: isActive === 'true',
>>>>>>> origin/main
    });
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get room by ID',
    description: 'Retrieves detailed information about a specific room'
  })
  @ApiParam({ name: 'id', description: 'Room ID', example: 'room-123' })
  @ListDocs('Room details')
<<<<<<< HEAD
  async getOne(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.roomsService.getOne(id, branchId);
=======
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
>>>>>>> origin/main
  }

  @Get(':id/availability')
  @ApiOperation({ 
    summary: 'Check room availability',
    description: 'Checks if a room is available for a specific time slot and date'
  })
  @ApiParam({ name: 'id', description: 'Room ID', example: 'room-123' })
<<<<<<< HEAD
  @ApiQuery({ name: 'dayOfWeek', description: 'Day of week (1-6)', example: '1' })
  @ApiQuery({ name: 'periodNumber', description: 'Period number', example: '1' })
  @ApiQuery({ name: 'academicYearId', description: 'Academic year ID', example: 'year-123' })
=======
  @ApiQuery({ name: 'timeSlotId', description: 'Time slot ID', example: 'timeslot-456' })
>>>>>>> origin/main
  @ApiQuery({ name: 'date', required: false, description: 'Date to check (ISO format)', example: '2024-01-15' })
  @ListDocs('Room availability status')
  checkAvailability(
    @Param('id') id: string,
<<<<<<< HEAD
    @Query('dayOfWeek') dayOfWeek: string,
    @Query('periodNumber') periodNumber: string,
    @Query('academicYearId') academicYearId: string,
=======
    @Query('timeSlotId') timeSlotId: string,
>>>>>>> origin/main
    @Query('date') date?: string,
  ) {
    return this.roomsService.checkAvailability(
      id,
<<<<<<< HEAD
      Number(dayOfWeek),
      Number(periodNumber),
      academicYearId,
=======
      timeSlotId,
>>>>>>> origin/main
      date ? new Date(date) : undefined,
    );
  }

  @Get(':id/utilization')
  @ApiOperation({ 
    summary: 'Get room utilization',
<<<<<<< HEAD
    description: 'Retrieves room usage statistics for a given academic year'
  })
  @ApiParam({ name: 'id', description: 'Room ID', example: 'room-123' })
  @ApiQuery({ name: 'academicYearId', description: 'Academic year ID', example: 'year-123' })
  @ListDocs('Room utilization statistics')
  getUtilization(
    @Param('id') id: string,
    @Query('academicYearId') academicYearId: string,
  ) {
    return this.roomsService.getRoomUtilization(
      id,
      academicYearId,
    );
  }

  @Put(':id')
=======
    description: 'Retrieves room usage statistics for a given date range'
  })
  @ApiParam({ name: 'id', description: 'Room ID', example: 'room-123' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO format)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO format)', example: '2024-01-31' })
  @ListDocs('Room utilization statistics')
  getUtilization(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.roomsService.getRoomUtilization(
      id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Patch(':id')
>>>>>>> origin/main
  @ApiOperation({ 
    summary: 'Update room',
    description: 'Updates an existing room with new information'
  })
  @ApiParam({ name: 'id', description: 'Room ID', example: 'room-123' })
  @UpdateDocs('Room updated successfully')
<<<<<<< HEAD
  async update(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    // Verify entity exists in this branch before updating
    await this.roomsService.getOne(id, branchId);
    return this.roomsService.update(id, { ...updateRoomDto, branchId });
=======
  update(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomsService.update(id, updateRoomDto);
>>>>>>> origin/main
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete room',
    description: 'Removes a room from the system (if not currently assigned in timetables)'
  })
  @ApiParam({ name: 'id', description: 'Room ID', example: 'room-123' })
  @DeleteDocs('Room deleted successfully')
<<<<<<< HEAD
  async remove(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    // Verify entity exists in this branch before deleting
    await this.roomsService.getOne(id, branchId);
=======
  remove(@Param('id') id: string) {
>>>>>>> origin/main
    return this.roomsService.remove(id);
  }

  @Post(':id/constraints')
  @ApiOperation({ 
    summary: 'Add room constraint',
    description: 'Adds a scheduling constraint to a room (e.g., availability restrictions, special requirements)'
  })
  @ApiParam({ name: 'id', description: 'Room ID', example: 'room-123' })
  @CreateDocs('Constraint added successfully')
  addConstraint(
    @Param('id') id: string,
    @Body() constraint: {
      type: string;
      value: string;
      priority?: number;
    },
  ) {
    return this.roomsService.addConstraint(id, constraint);
  }
}