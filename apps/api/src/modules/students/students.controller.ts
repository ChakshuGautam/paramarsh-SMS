import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from '../../common/base-crud.controller';
import { StudentsService } from './students.service';

@ApiTags('Students')
@Controller('students')
export class StudentsController extends BaseCrudController<any> {
  constructor(service: StudentsService) {
    super(service);
  }
}