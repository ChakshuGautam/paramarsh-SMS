import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
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
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all rooms',
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
    });
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get room by ID',
    description: 'Retrieves detailed information about a specific room'
  })
  @ApiParam({ name: 'id', description: 'Room ID', example: 'room-123' })
  @ListDocs('Room details')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Get(':id/availability')
  @ApiOperation({ 
    summary: 'Check room availability',
    description: 'Checks if a room is available for a specific time slot and date'
  })
  @ApiParam({ name: 'id', description: 'Room ID', example: 'room-123' })
  @ApiQuery({ name: 'timeSlotId', description: 'Time slot ID', example: 'timeslot-456' })
  @ApiQuery({ name: 'date', required: false, description: 'Date to check (ISO format)', example: '2024-01-15' })
  @ListDocs('Room availability status')
  checkAvailability(
    @Param('id') id: string,
    @Query('timeSlotId') timeSlotId: string,
    @Query('date') date?: string,
  ) {
    return this.roomsService.checkAvailability(
      id,
      timeSlotId,
      date ? new Date(date) : undefined,
    );
  }

  @Get(':id/utilization')
  @ApiOperation({ 
    summary: 'Get room utilization',
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
  @ApiOperation({ 
    summary: 'Update room',
    description: 'Updates an existing room with new information'
  })
  @ApiParam({ name: 'id', description: 'Room ID', example: 'room-123' })
  @UpdateDocs('Room updated successfully')
  update(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomsService.update(id, updateRoomDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete room',
    description: 'Removes a room from the system (if not currently assigned in timetables)'
  })
  @ApiParam({ name: 'id', description: 'Room ID', example: 'room-123' })
  @DeleteDocs('Room deleted successfully')
  remove(@Param('id') id: string) {
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