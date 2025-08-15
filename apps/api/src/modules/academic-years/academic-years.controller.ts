import { Controller, Get, Post, Patch, Delete, Param, Query, Body } from '@nestjs/common';
import { AcademicYearsService } from './academic-years.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

@Controller('academicYears')
export class AcademicYearsController {
  constructor(private readonly academicYearsService: AcademicYearsService) {}

  @Get()
  async list(@Query() query: any) {
    return this.academicYearsService.list(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.academicYearsService.findOne(id);
  }

  @Post()
  async create(@Body() createAcademicYearDto: CreateAcademicYearDto) {
    return this.academicYearsService.create(createAcademicYearDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateAcademicYearDto: UpdateAcademicYearDto) {
    return this.academicYearsService.update(id, updateAcademicYearDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.academicYearsService.remove(id);
  }
}