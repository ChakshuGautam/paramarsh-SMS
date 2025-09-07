import { DEFAULT_BRANCH_ID } from '../../common/constants';
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { ListDocs, CreateDocs, UpdateDocs, DeleteDocs } from '../../common/swagger.decorators';

@ApiTags('Templates')
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all templates',
    description: 'Retrieves all message templates with optional filtering by channel and pagination'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: '1' })
  @ApiQuery({ name: 'perPage', required: false, description: 'Number of records per page', example: '25' })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort field and direction', example: 'name' })
  @ApiQuery({ name: 'filter', required: false, description: 'Filter JSON', example: '{}' })
  @ApiQuery({ name: 'ids', required: false, description: 'Specific IDs to fetch', example: 'id1,id2' })
  @ListDocs('List of message templates')
  async findAll(
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('sort') sort?: string,
    @Query('filter') filterStr?: string,
    @Query('ids') idsStr?: string,
    @Query('include') include?: string,
  ) {
    let filter = {};
    if (filterStr) {
      try {
        filter = JSON.parse(filterStr);
      } catch (error) {
        filter = {};
      }
    }
    const ids = idsStr ? idsStr.split(',') : undefined;

    if (ids) {
      return this.templatesService.getMany(ids);
    }

    return this.templatesService.getList({
      page: parseInt(page || '1'),
      perPage: parseInt(perPage || '25'),
      sort,
      filter,
    });
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get template by ID',
    description: 'Retrieves detailed information about a specific message template'
  })
  @ApiParam({ name: 'id', description: 'Template ID', example: 'template-123' })
  @ListDocs('Template details')
  findOne(
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
    @Param('id') id: string,
    @Query('include') include?: string,
  ) {
    if (include) {
      return this.templatesService.getOneWithIncludes(id, include);
    }
    return this.templatesService.getOne(id);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create message template',
    description: 'Creates a reusable message template for SMS, email, push notifications, or WhatsApp'
  })
  @CreateDocs('Template created successfully')
  create(
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
    @Body() createTemplateDto: CreateTemplateDto,
  ) {
    return this.templatesService.create(createTemplateDto);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update template',
    description: 'Updates an existing message template with new content or settings'
  })
  @ApiParam({ name: 'id', description: 'Template ID', example: 'template-123' })
  @UpdateDocs('Template updated successfully')
  update(
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    return this.templatesService.update(id, updateTemplateDto);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Patch template',
    description: 'Partially updates an existing message template'
  })
  @ApiParam({ name: 'id', description: 'Template ID', example: 'template-123' })
  @UpdateDocs('Template updated successfully')
  patch(
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
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
  remove(
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
    @Param('id') id: string,
  ) {
    return this.templatesService.delete(id);
  }
}