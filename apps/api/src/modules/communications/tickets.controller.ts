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
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ListDocs, CreateDocs, UpdateDocs, DeleteDocs } from '../../common/swagger.decorators';

@ApiTags('Helpdesk Tickets')
@Controller('comms/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create ticket',
    description: 'Creates a new helpdesk ticket for student, guardian, or staff member'
  })
  @CreateDocs('Ticket created successfully')
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all tickets',
    description: 'Retrieves all helpdesk tickets with optional filtering by status, assignee, priority, and category'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: '1' })
  @ApiQuery({ name: 'perPage', required: false, description: 'Number of records per page', example: '20' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by ticket status', example: 'open' })
  @ApiQuery({ name: 'assigneeId', required: false, description: 'Filter by assigned staff member ID', example: 'staff-456' })
  @ApiQuery({ name: 'priority', required: false, description: 'Filter by priority level', example: 'high' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by ticket category', example: 'technical' })
  @ApiQuery({ name: 'filter', required: false, description: 'Filter JSON string' })
  @ListDocs('List of helpdesk tickets')
  findAll(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('status') status?: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('priority') priority?: string,
    @Query('category') category?: string,
    @Query('filter') filterStr?: string,
  ) {
    const where: any = {};
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    
    // Parse additional filter
    if (filterStr) {
      try {
        const additionalFilter = JSON.parse(filterStr);
        Object.assign(where, additionalFilter);
      } catch (error) {
        // Ignore invalid JSON
      }
    }

    return this.ticketsService.getList({
      page: page ? parseInt(page) : 1,
      perPage: perPage ? parseInt(perPage) : 20,
      filter: where,
    });
  }

  @Get('overdue')
  @ApiOperation({ 
    summary: 'Get overdue tickets',
    description: 'Retrieves all tickets that have exceeded their SLA due date'
  })
  @ListDocs('List of overdue tickets')
  getOverdue() {
    return this.ticketsService.getOverdueTickets();
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get ticket statistics',
    description: 'Retrieves statistics about tickets including counts by status, priority, and category'
  })
  @ListDocs('Ticket statistics and metrics')
  getStats() {
    return this.ticketsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get ticket by ID',
    description: 'Retrieves detailed information about a specific ticket including messages and attachments'
  })
  @ApiParam({ name: 'id', description: 'Ticket ID', example: 'ticket-123' })
  @ListDocs('Ticket details with messages and attachments')
  findOne(@Param('id') id: string) {
    return this.ticketsService.getOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update ticket',
    description: 'Updates ticket details such as status, priority, assignee, or other fields'
  })
  @ApiParam({ name: 'id', description: 'Ticket ID', example: 'ticket-123' })
  @UpdateDocs('Ticket updated successfully')
  update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
  ) {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete ticket',
    description: 'Permanently removes a ticket from the system (only for authorized users)'
  })
  @ApiParam({ name: 'id', description: 'Ticket ID', example: 'ticket-123' })
  @DeleteDocs('Ticket deleted successfully')
  remove(@Param('id') id: string) {
    return this.ticketsService.delete(id);
  }

  @Post(':id/reply')
  @ApiOperation({ 
    summary: 'Add message to ticket',
    description: 'Adds a reply message to the ticket conversation'
  })
  @ApiParam({ name: 'id', description: 'Ticket ID', example: 'ticket-123' })
  @ApiBody({
    description: 'Message content and author information',
    schema: {
      type: 'object',
      properties: {
        authorId: { type: 'string', example: 'staff-456', description: 'ID of the message author' },
        authorType: { type: 'string', example: 'staff', enum: ['staff', 'requester'], description: 'Type of author' },
        content: { type: 'string', example: 'Thank you for your report. We are investigating this issue.', description: 'Message content' },
        internal: { type: 'boolean', example: false, description: 'Whether this is an internal note not visible to requester' }
      },
      required: ['authorId', 'authorType', 'content']
    }
  })
  @CreateDocs('Message added to ticket successfully')
  addMessage(
    @Param('id') id: string,
    @Body() messageDto: {
      authorId: string;
      authorType: string;
      content: string;
      internal?: boolean;
    },
  ) {
    return this.ticketsService.addMessage(id, messageDto);
  }

  @Post(':id/attachments')
  @ApiOperation({ 
    summary: 'Add attachment to ticket',
    description: 'Attaches a file to the ticket for additional context or evidence'
  })
  @ApiParam({ name: 'id', description: 'Ticket ID', example: 'ticket-123' })
  @ApiBody({
    description: 'Attachment file information',
    schema: {
      type: 'object',
      properties: {
        fileName: { type: 'string', example: 'screenshot.png', description: 'Name of the attached file' },
        fileUrl: { type: 'string', example: 'https://storage.example.com/files/screenshot.png', description: 'URL where the file is stored' },
        fileSize: { type: 'number', example: 1024000, description: 'File size in bytes' },
        mimeType: { type: 'string', example: 'image/png', description: 'MIME type of the file' }
      },
      required: ['fileName', 'fileUrl']
    }
  })
  @CreateDocs('Attachment added to ticket successfully')
  addAttachment(
    @Param('id') id: string,
    @Body() attachmentDto: {
      fileName: string;
      fileUrl: string;
      fileSize?: number;
      mimeType?: string;
    },
  ) {
    return this.ticketsService.addAttachment(id, attachmentDto);
  }

  @Post(':id/assign')
  @ApiOperation({ 
    summary: 'Assign ticket to staff member',
    description: 'Assigns the ticket to a specific staff member for handling'
  })
  @ApiParam({ name: 'id', description: 'Ticket ID', example: 'ticket-123' })
  @ApiBody({
    description: 'Staff member to assign ticket to',
    schema: {
      type: 'object',
      properties: {
        assigneeId: { type: 'string', example: 'staff-456', description: 'ID of the staff member to assign' }
      },
      required: ['assigneeId']
    }
  })
  @UpdateDocs('Ticket assigned successfully')
  assign(
    @Param('id') id: string,
    @Body() assignDto: { assigneeId: string },
  ) {
    return this.ticketsService.assign(id, assignDto.assigneeId);
  }
}