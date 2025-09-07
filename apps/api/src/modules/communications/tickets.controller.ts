import { DEFAULT_BRANCH_ID } from '../../common/constants';
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ListDocs, CreateDocs, UpdateDocs, DeleteDocs } from '../../common/swagger.decorators';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all tickets',
    description: 'Retrieves all helpdesk tickets with optional filtering and pagination'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: '1' })
  @ApiQuery({ name: 'perPage', required: false, description: 'Number of records per page', example: '25' })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort field and order', example: 'createdAt' })
  @ApiQuery({ name: 'filter', required: false, description: 'Filter criteria as JSON string' })
  @ApiQuery({ name: 'ids', required: false, description: 'Comma-separated list of IDs for getMany' })
  @ListDocs('List of helpdesk tickets')
  async findAll(
    @Query('ids') ids?: string | string[],
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('sort') sort?: string,
    @Query('filter') filterStr?: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    // Handle getMany case (when ids are provided)
    if (ids) {
      const idArray = Array.isArray(ids) ? ids : (typeof ids === 'string' ? ids.split(',') : [ids]);
      return this.ticketsService.getMany(idArray);
    }
    
    // Parse filter if it's a JSON string
    let filter = {};
    if (filterStr) {
      try {
        filter = typeof filterStr === 'string' ? JSON.parse(filterStr) : filterStr;
      } catch (e) {
        // If parsing fails, treat as empty filter
        filter = {};
      }
    }
    
    const currentPage = page ? Number(page) : 1;
    const itemsPerPage = perPage ? Number(perPage) : 25;
    const skip = (currentPage - 1) * itemsPerPage;
    
    // Build sort order
    let orderBy = {};
    if (sort) {
      const isDesc = sort.startsWith('-');
      const field = isDesc ? sort.substring(1) : sort;
      orderBy = { [field]: isDesc ? 'desc' : 'asc' };
    }
    
    return this.ticketsService.getList({
      page: currentPage,
      perPage: itemsPerPage,
      sort,
      filter,
    });
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get ticket by ID',
    description: 'Retrieves detailed information about a specific ticket'
  })
  @ApiParam({ name: 'id', description: 'Ticket ID', example: 'ticket-123' })
  @ListDocs('Ticket details')
  async findOne(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.ticketsService.getOne(id);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create ticket',
    description: 'Creates a new helpdesk ticket'
  })
  @CreateDocs('Ticket created successfully')
  async create(
    @Body() createTicketDto: CreateTicketDto,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.ticketsService.create(createTicketDto);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update ticket',
    description: 'Updates an existing ticket'
  })
  @ApiParam({ name: 'id', description: 'Ticket ID', example: 'ticket-123' })
  @UpdateDocs('Ticket updated successfully')
  async update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete ticket',
    description: 'Removes a ticket from the system'
  })
  @ApiParam({ name: 'id', description: 'Ticket ID', example: 'ticket-123' })
  @DeleteDocs('Ticket deleted successfully')
  async remove(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.ticketsService.delete(id);
  }
}