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
  create(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignsService.create(createCampaignDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all campaigns',
    description: 'Retrieves all communication campaigns with optional filtering and pagination'
  })
  @ApiQuery({ name: 'skip', required: false, description: 'Number of records to skip', example: '0' })
  @ApiQuery({ name: 'take', required: false, description: 'Number of records to take', example: '20' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by campaign status', example: 'running' })
  @ListDocs('List of campaigns')
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string,
  ) {
    return this.campaignsService.findAll({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      where: status ? { status } : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get campaign by ID',
    description: 'Retrieves detailed information about a specific campaign'
  })
  @ApiParam({ name: 'id', description: 'Campaign ID', example: 'campaign-123' })
  @ListDocs('Campaign details')
  findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update campaign',
    description: 'Updates an existing campaign with new details or status'
  })
  @ApiParam({ name: 'id', description: 'Campaign ID', example: 'campaign-123' })
  @UpdateDocs('Campaign updated successfully')
  update(
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
  remove(@Param('id') id: string) {
    return this.campaignsService.remove(id);
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