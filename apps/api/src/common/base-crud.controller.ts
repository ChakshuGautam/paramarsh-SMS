import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { BaseCrudService } from './base-crud.service';

/**
 * Base CRUD controller that follows React Admin's data provider expectations
 * 
 * React Admin Data Provider Methods:
 * 1. getList -> GET /resources?page=1&perPage=10&sort=name&filter={}
 * 2. getOne -> GET /resources/:id
 * 3. getMany -> GET /resources?ids[]=1&ids[]=2
 * 4. getManyReference -> GET /resources?target=value
 * 5. create -> POST /resources
 * 6. update -> PUT /resources/:id (full replacement)
 * 7. updateMany -> PUT /resources (with ids[] and data)
 * 8. delete -> DELETE /resources/:id
 * 9. deleteMany -> DELETE /resources (with ids[])
 */
export abstract class BaseCrudController<T> {
  constructor(protected readonly service: BaseCrudService<T>) {}

  /**
   * Get paginated list with filters and sorting
   * React Admin: getList & getManyReference
   */
  @Get()
  @ApiOperation({ summary: 'Get paginated list' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'perPage', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'ids', required: false, type: [String] })
  @ApiResponse({ status: 200, description: 'Returns { data: [], total: number }' })
  async getList(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('pageSize') pageSize?: string, // Support both perPage and pageSize
    @Query('sort') sort?: string,
    @Query('ids') ids?: string | string[],
    @Query() query?: Record<string, any>,
  ) {
    // Handle getMany case (when ids are provided)
    if (ids) {
      const idArray = Array.isArray(ids) ? ids : [ids];
      return this.service.getMany(idArray);
    }

    // Remove pagination params from query to get filters
    const { page: _p, perPage: _pp, pageSize: _ps, sort: _s, ...filter } = query || {};

    return this.service.getList({
      page: page ? Number(page) : 1,
      perPage: perPage ? Number(perPage) : (pageSize ? Number(pageSize) : 25),
      sort,
      filter,
    });
  }

  /**
   * Get single item by ID
   * React Admin: getOne
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get single item by ID' })
  @ApiResponse({ status: 200, description: 'Returns { data: object }' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async getOne(@Param('id') id: string) {
    return this.service.getOne(id);
  }

  /**
   * Create new item
   * React Admin: create
   */
  @Post()
  @ApiOperation({ summary: 'Create new item' })
  @ApiResponse({ status: 201, description: 'Returns { data: object }' })
  async create(@Body() data: any) {
    return this.service.create(data);
  }

  /**
   * Update item (full replacement)
   * React Admin: update
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update item (full replacement)' })
  @ApiResponse({ status: 200, description: 'Returns { data: object }' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  /**
   * Update item (partial update)
   * Additional to React Admin for flexibility
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update item (partial update)' })
  @ApiResponse({ status: 200, description: 'Returns { data: object }' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async patch(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  /**
   * Update many items
   * React Admin: updateMany
   */
  @Put()
  @ApiOperation({ summary: 'Update many items' })
  @ApiResponse({ status: 200, description: 'Returns { data: string[] }' })
  async updateMany(@Body() body: { ids: string[]; data: any }) {
    return this.service.updateMany(body.ids, body.data);
  }

  /**
   * Delete item
   * React Admin: delete
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete item' })
  @ApiResponse({ status: 200, description: 'Returns { data: object }' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  /**
   * Delete many items
   * React Admin: deleteMany
   */
  @Delete()
  @ApiOperation({ summary: 'Delete many items' })
  @ApiResponse({ status: 200, description: 'Returns { data: string[] }' })
  async deleteMany(@Body() body: { ids: string[] }) {
    return this.service.deleteMany(body.ids);
  }
}