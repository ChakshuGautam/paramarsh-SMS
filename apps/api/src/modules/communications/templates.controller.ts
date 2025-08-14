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
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { ListDocs, CreateDocs, UpdateDocs, DeleteDocs } from '../../common/swagger.decorators';

@ApiTags('Communication Templates')
@Controller('comms/templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create message template',
    description: 'Creates a reusable message template for SMS, email, push notifications, or WhatsApp'
  })
  @CreateDocs('Template created successfully')
  create(@Body() createTemplateDto: CreateTemplateDto) {
    return this.templatesService.create(createTemplateDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all templates',
    description: 'Retrieves all message templates with optional filtering by channel and pagination'
  })
  @ApiQuery({ name: 'skip', required: false, description: 'Number of records to skip', example: '0' })
  @ApiQuery({ name: 'take', required: false, description: 'Number of records to take', example: '20' })
  @ApiQuery({ name: 'channel', required: false, description: 'Filter by communication channel', example: 'sms' })
  @ListDocs('List of message templates')
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('channel') channel?: string,
  ) {
    return this.templatesService.findAll({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      where: channel ? { channel } : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get template by ID',
    description: 'Retrieves detailed information about a specific message template'
  })
  @ApiParam({ name: 'id', description: 'Template ID', example: 'template-123' })
  @ListDocs('Template details')
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update template',
    description: 'Updates an existing message template with new content or settings'
  })
  @ApiParam({ name: 'id', description: 'Template ID', example: 'template-123' })
  @UpdateDocs('Template updated successfully')
  update(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    return this.templatesService.update(id, updateTemplateDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete template',
    description: 'Removes a message template from the system (if not used in active campaigns)'
  })
  @ApiParam({ name: 'id', description: 'Template ID', example: 'template-123' })
  @DeleteDocs('Template deleted successfully')
  remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }

  @Post(':id/preview')
  @ApiOperation({ 
    summary: 'Preview template',
    description: 'Generates a preview of the template with provided variable values'
  })
  @ApiParam({ name: 'id', description: 'Template ID', example: 'template-123' })
  @ApiBody({
    description: 'Variables to substitute in template',
    schema: {
      type: 'object',
      example: {
        parent_name: 'John Doe',
        amount: '5000',
        due_date: '2024-01-31'
      }
    }
  })
  @ListDocs('Template preview with substituted variables')
  async preview(
    @Param('id') id: string,
    @Body() variables: Record<string, any>,
  ) {
    const template = await this.templatesService.findOne(id);
    if (!template) {
      throw new Error('Template not found');
    }
    const rendered = await this.templatesService.renderTemplate(
      template,
      variables,
    );
    return { preview: rendered };
  }
}