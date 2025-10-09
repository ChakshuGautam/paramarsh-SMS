import { IsArray, IsNotEmpty, ArrayMinSize, ValidateNested, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class ClassItem {
  @IsNotEmpty()
  @IsString()
  grade: string;

  @IsNotEmpty()
  @IsString()
  section: string;

  @IsNotEmpty()
  @IsNumber()
  capacity: number;
}

export class ClassesConfigDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1, { message: 'Classes array cannot be empty' })
  @ValidateNested({ each: true })
  @Type(() => ClassItem)
  classes: ClassItem[];
}
