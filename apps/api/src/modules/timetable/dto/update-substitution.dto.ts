import { PartialType } from '@nestjs/swagger';
import { CreateSubstitutionDto } from './create-substitution.dto';

export class UpdateSubstitutionDto extends PartialType(CreateSubstitutionDto) {}