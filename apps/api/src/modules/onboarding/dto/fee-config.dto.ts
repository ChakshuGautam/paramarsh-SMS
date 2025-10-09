import { IsArray, IsNotEmpty, ArrayMinSize, ValidateNested, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class FeeStructure {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  frequency: string;
}

export class FeeConfigDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1, { message: 'Structures array cannot be empty' })
  @ValidateNested({ each: true })
  @Type(() => FeeStructure)
  structures: FeeStructure[];
}
