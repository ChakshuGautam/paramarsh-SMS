<<<<<<< HEAD
import { DEFAULT_BRANCH_ID } from '../../common/constants';
=======
>>>>>>> origin/main
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { ListDocs, CreateDocs, UpdateDocs } from '../../common/swagger.decorators';

@ApiTags('Communication Messages')
@Controller('comms/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create message',
    description: 'Creates a new message to be sent via SMS, email, push notification, or WhatsApp'
  })
  @CreateDocs('Message created successfully')
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(createMessageDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all messages',
    description: 'Retrieves all messages with optional filtering by status and channel, with pagination support'
  })
  @ApiQuery({ name: 'skip', required: false, description: 'Number of records to skip', example: '0' })
  @ApiQuery({ name: 'take', required: false, description: 'Number of records to take', example: '20' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by message status', example: 'sent' })
  @ApiQuery({ name: 'channel', required: false, description: 'Filter by communication channel', example: 'sms' })
  @ListDocs('List of messages')
  findAll(
<<<<<<< HEAD
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('sort') sort?: string,
    @Query('filter') filterStr?: string,
    @Query('ids') idsStr?: string,
    @Query('status') status?: string,
    @Query('channel') channel?: string,
  ) {
    // Handle getMany case (when ids are provided)
    if (idsStr) {
      const ids = idsStr.split(',');
      return this.messagesService.getMany(ids);
    }

    // Parse filter if provided
    let filter: any = {};
    if (filterStr) {
      try {
        filter = JSON.parse(filterStr);
      } catch (error) {
        filter = {};
      }
    }

    // Add legacy query params to filter
    if (status) filter.status = status;
    if (channel) filter.channel = channel;

    return this.messagesService.getList({
      page: page ? parseInt(page) : 1,
      perPage: perPage ? parseInt(perPage) : 20,
      sort,
      filter,
=======
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string,
    @Query('channel') channel?: string,
  ) {
    return this.messagesService.findAll({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      where: {
        ...(status && { status }),
        ...(channel && { channel }),
      },
>>>>>>> origin/main
    });
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get message by ID',
    description: 'Retrieves detailed information about a specific message'
  })
  @ApiParam({ name: 'id', description: 'Message ID', example: 'message-123' })
  @ListDocs('Message details')
  findOne(@Param('id') id: string) {
<<<<<<< HEAD
    return this.messagesService.getOne(id);
=======
    return this.messagesService.findOne(id);
>>>>>>> origin/main
  }

  @Patch(':id/status')
  @ApiOperation({ 
    summary: 'Update message status',
    description: 'Updates message status with optional provider ID and error details'
  })
  @ApiParam({ name: 'id', description: 'Message ID', example: 'message-123' })
  @ApiBody({
    description: 'Status update data',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['pending', 'sent', 'delivered', 'failed'], example: 'delivered' },
        providerId: { type: 'string', description: 'Provider ID', example: 'provider-123' },
        error: { type: 'string', description: 'Error message if failed', example: 'Invalid phone number' }
      },
      required: ['status']
    }
  })
  @UpdateDocs('Message status updated successfully')
  updateStatus(
    @Param('id') id: string, 
    @Body() data: { status: string; providerId?: string; error?: string }
  ) {
    return this.messagesService.updateStatus(id, data.status, data.providerId, data.error);
  }

  @Post(':id/send')
  @ApiOperation({ 
    summary: 'Send message',
    description: 'Triggers the sending of a pending message immediately'
  })
  @ApiParam({ name: 'id', description: 'Message ID', example: 'message-123' })
  @UpdateDocs('Message sent successfully')
  send(@Param('id') id: string) {
    return this.messagesService.sendMessage(id);
  }


  @Post('retry-failed')
  @ApiOperation({ 
    summary: 'Retry failed messages',
    description: 'Retries all messages that previously failed to send'
  })
  @UpdateDocs('Failed messages retried successfully')
  async retryFailed() {
    const count = await this.messagesService.retryFailed();
    return { retriedCount: count };
  }
}