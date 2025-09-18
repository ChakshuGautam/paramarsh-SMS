import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BranchesService } from './branches.service';

@ApiTags('Branches')
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all branches' })
  @ApiQuery({ name: 'ids', required: false, type: [String], description: 'Get specific branches by IDs' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns list of branches in React Admin format',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' }
            }
          }
        },
        total: { type: 'number' }
      }
    }
  })
  async getList(
    @Query('ids') ids?: string | string[]
  ) {
    // Handle getMany case (when ids are provided)
    if (ids) {
      const idArray = Array.isArray(ids) ? ids : (typeof ids === 'string' ? ids.split(',') : [ids]);
      return this.branchesService.getMany(idArray);
    }
    
    // Return all branches
    return this.branchesService.getList();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single branch by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns single branch in React Admin format',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  async getOne(@Param('id') id: string) {
    return this.branchesService.getOne(id);
  }
}