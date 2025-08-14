import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from '../../common/base-crud.controller';
import { TeachersService } from './teachers.service';

@ApiTags('Teachers')
@Controller('hr/teachers')
export class TeachersController extends BaseCrudController<any> {
  constructor(service: TeachersService) {
    super(service);
  }
}