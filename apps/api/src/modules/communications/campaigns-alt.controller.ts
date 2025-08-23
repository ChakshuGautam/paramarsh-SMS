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
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { ListDocs, CreateDocs, UpdateDocs, DeleteDocs } from '../../common/swagger.decorators';

/**
 * Alternative campaigns controller for /campaigns route (used by tests)
 */
@ApiTags('Campaigns (Alternative)')
@Controller('campaigns')
export class CampaignsAltController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all campaigns',
    description: 'Retrieves all communication campaigns with optional filtering and pagination'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: '1' })
  @ApiQuery({ name: 'perPage', required: false, description: 'Number of records per page', example: '25' })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort field and order', example: 'name' })
  @ApiQuery({ name: 'filter', required: false, description: 'Filter criteria as JSON string' })
  @ApiQuery({ name: 'ids', required: false, description: 'Comma-separated list of IDs for getMany' })
  @ListDocs('List of campaigns')
  async findAll(
    @Query('ids') ids?: string | string[],
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('sort') sort?: string,
    @Query('filter') filterStr?: string,
    @Headers('x-branch-id') branchId = 'branch1',
  ) {
    // Handle getMany case (when ids are provided)
    if (ids) {
      const idArray = Array.isArray(ids) ? ids : (typeof ids === 'string' ? ids.split(',') : [ids]);
      return this.campaignsService.getMany(idArray);
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
    
    return this.campaignsService.getList({
      page: currentPage,
      perPage: itemsPerPage,
      sort,
      filter,
    });
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get campaign by ID',
    description: 'Retrieves detailed information about a specific campaign'
  })
  @ApiParam({ name: 'id', description: 'Campaign ID', example: 'campaign-123' })
  @ListDocs('Campaign details')
  async findOne(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = 'branch1',
  ) {
    return this.campaignsService.getOne(id);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create campaign',
    description: 'Creates a new communication campaign with template, audience, and scheduling details'
  })
  @CreateDocs('Campaign created successfully')
  async create(
    @Body() createCampaignDto: CreateCampaignDto,
    @Headers('x-branch-id') branchId = 'branch1',
  ) {
    return this.campaignsService.create(createCampaignDto);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update campaign',
    description: 'Updates an existing campaign with new details or status'
  })
  @ApiParam({ name: 'id', description: 'Campaign ID', example: 'campaign-123' })
  @UpdateDocs('Campaign updated successfully')
  async update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
    @Headers('x-branch-id') branchId = 'branch1',
  ) {
    return this.campaignsService.update(id, updateCampaignDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete campaign',
    description: 'Removes a campaign from the system (if not currently running)'
  })
  @ApiParam({ name: 'id', description: 'Campaign ID', example: 'campaign-123' })
  @DeleteDocs('Campaign deleted successfully')
  async remove(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = 'branch1',
  ) {
    return this.campaignsService.delete(id);
  }
}