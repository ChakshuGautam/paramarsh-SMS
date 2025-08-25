<<<<<<< HEAD
import { DEFAULT_BRANCH_ID } from '../../common/constants';
=======
>>>>>>> origin/main
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { ListDocs, CreateDocs, UpdateDocs, DeleteDocs } from '../../common/swagger.decorators';

@ApiTags('Communication Campaigns')
@Controller('comms/campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create campaign',
    description: 'Creates a new communication campaign with template, audience, and scheduling details'
  })
  @CreateDocs('Campaign created successfully')
  async create(
<<<<<<< HEAD
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
=======
    @Headers('x-branch-id') branchId = 'branch1',
>>>>>>> origin/main
    @Body() createCampaignDto: CreateCampaignDto,
  ) {
    return this.campaignsService.create(createCampaignDto);
  }

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
<<<<<<< HEAD
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
=======
    @Headers('x-branch-id') branchId = 'branch1',
>>>>>>> origin/main
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
    const pageSize = perPage ? Number(perPage) : 25;
<<<<<<< HEAD
    const skip = (currentPage - 1) * pageSize;
=======
    const skip = (currentPage - 1) * perPage;
>>>>>>> origin/main
    
    // Build sort order
    let orderBy = {};
    if (sort) {
      const isDesc = sort.startsWith('-');
      const field = isDesc ? sort.substring(1) : sort;
      orderBy = { [field]: isDesc ? 'desc' : 'asc' };
    }
    
    return this.campaignsService.getList({
      page: currentPage,
      perPage: pageSize,
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
<<<<<<< HEAD
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
=======
    @Headers('x-branch-id') branchId = 'branch1',
>>>>>>> origin/main
    @Param('id') id: string,
    @Query('include') include?: string,
  ) {
    if (include) {
      return this.campaignsService.getOneWithIncludes(id, include);
    }
    return this.campaignsService.getOne(id);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Replace campaign',
    description: 'Completely replaces an existing campaign'
  })
  @ApiParam({ name: 'id', description: 'Campaign ID', example: 'campaign-123' })
  @UpdateDocs('Campaign replaced successfully')
  async replace(
<<<<<<< HEAD
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
=======
    @Headers('x-branch-id') branchId = 'branch1',
>>>>>>> origin/main
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    return this.campaignsService.update(id, updateCampaignDto);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update campaign',
    description: 'Updates an existing campaign with new details or status'
  })
  @ApiParam({ name: 'id', description: 'Campaign ID', example: 'campaign-123' })
  @UpdateDocs('Campaign updated successfully')
  async update(
<<<<<<< HEAD
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
=======
    @Headers('x-branch-id') branchId = 'branch1',
>>>>>>> origin/main
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
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
<<<<<<< HEAD
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
=======
    @Headers('x-branch-id') branchId = 'branch1',
>>>>>>> origin/main
    @Param('id') id: string,
  ) {
    return this.campaignsService.delete(id);
  }

  @Post(':id/execute')
  @ApiOperation({ 
    summary: 'Execute campaign',
    description: 'Triggers immediate execution of a scheduled or draft campaign'
  })
  @ApiParam({ name: 'id', description: 'Campaign ID', example: 'campaign-123' })
  @CreateDocs('Campaign execution started successfully')
  execute(@Param('id') id: string) {
    return this.campaignsService.execute(id);
  }

  @Get(':id/stats')
  @ApiOperation({ 
    summary: 'Get campaign statistics',
    description: 'Retrieves delivery statistics and analytics for a campaign'
  })
  @ApiParam({ name: 'id', description: 'Campaign ID', example: 'campaign-123' })
  @ListDocs('Campaign statistics and analytics')
  getStats(@Param('id') id: string) {
    return this.campaignsService.getStats(id);
  }
}