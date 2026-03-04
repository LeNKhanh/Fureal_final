import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNumber,
  IsIn,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateModel3DDto {
  @ApiProperty({ example: 'Modern Sofa 3D' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'High-quality 3D model of a modern sofa' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'https://r2.fureal.store/models/sofa.glb', description: 'URL tới file 3D trên R2' })
  @IsString()
  modelUrl: string;

  @ApiPropertyOptional({ example: 'https://r2.fureal.store/thumbnails/sofa.jpg' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: 'furniture', description: 'furniture | decor | lighting | bath | other' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: ['sofa', 'living room', 'modern'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: 'modern-sofa.glb' })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({ example: 2048576 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  fileSize?: number;

  @ApiPropertyOptional({ example: 'glb', enum: ['glb', 'gltf', 'obj', 'fbx'] })
  @IsOptional()
  @IsIn(['glb', 'gltf', 'obj', 'fbx'])
  fileFormat?: string;

  @ApiPropertyOptional({ example: 5990000, description: 'Giá bán (VNĐ)' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
