import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryGroupDto {
  @ApiPropertyOptional({ example: 'Furniture' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated furniture category group' })
  @IsOptional()
  @IsString()
  description?: string;
}
