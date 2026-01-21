import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryGroupDto {
  @ApiProperty({ example: 'Furniture' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Furniture category group' })
  @IsOptional()
  @IsString()
  description?: string;
}
