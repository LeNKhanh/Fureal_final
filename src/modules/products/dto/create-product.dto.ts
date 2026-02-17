import { IsString, IsNumber, IsOptional, IsInt, IsBoolean, Min, IsArray, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ProductImageDto {
  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsUrl()
  imageUrl: string;

  @ApiPropertyOptional({ example: true, description: 'Đánh dấu ảnh chính hiển thị' })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Modern Sofa' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Comfortable modern sofa' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 299.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'IKEA' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: 'White' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 120, description: 'Width in cm' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @ApiPropertyOptional({ example: 80, description: 'Height in cm' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @ApiPropertyOptional({ example: 60, description: 'Depth/Length in cm' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  depth?: number;

  @ApiPropertyOptional({ example: 25.5, description: 'Weight in kg' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ example: 'Oak Wood, Fabric' })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({ example: 'livingroom', enum: ['livingroom', 'bedroom', 'dining', 'office', 'outdoor'] })
  @IsOptional()
  @IsString()
  space?: string;

  @ApiPropertyOptional({ example: 'Mộc', enum: ['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ'], description: 'Ngũ hành phong thủy' })
  @IsOptional()
  @IsString()
  menh?: string;

  @ApiPropertyOptional({ example: 'Đông, Đông Nam', description: 'Hướng phù hợp theo phong thủy' })
  @IsOptional()
  @IsString()
  huong?: string;

  @ApiPropertyOptional({ 
    type: [ProductImageDto],
    description: 'Danh sách ảnh sản phẩm (có thể nhiều ảnh)',
    example: [
      { imageUrl: 'https://example.com/image1.jpg', isPrimary: true },
      { imageUrl: 'https://example.com/image2.jpg', isPrimary: false }
    ]
  })
  @IsOptional()
  @IsArray()
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];
}
