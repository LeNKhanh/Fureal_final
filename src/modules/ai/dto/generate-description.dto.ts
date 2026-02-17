import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class GenerateDescriptionDto {
  @ApiProperty({
    description: 'Tên sản phẩm',
    example: 'Giường ngủ gỗ sồi hiện đại',
  })
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  @IsString({ message: 'Tên sản phẩm phải là chuỗi ký tự' })
  @MaxLength(200, { message: 'Tên sản phẩm không được quá 200 ký tự' })
  productName: string;

  @ApiProperty({
    description: 'Danh mục sản phẩm',
    example: 'Giường',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Danh mục phải là chuỗi ký tự' })
  category?: string;

  @ApiProperty({
    description: 'Chất liệu',
    example: 'Gỗ sồi tự nhiên',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Chất liệu phải là chuỗi ký tự' })
  material?: string;

  @ApiProperty({
    description: 'Kích thước',
    example: '1.8m x 2m',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Kích thước phải là chuỗi ký tự' })
  dimensions?: string;

  @ApiProperty({
    description: 'Màu sắc',
    example: 'Nâu gỗ tự nhiên',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Màu sắc phải là chuỗi ký tự' })
  color?: string;

  @ApiProperty({
    description: 'Đặc điểm nổi bật',
    example: 'Thiết kế tối giản, bền đẹp',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Đặc điểm phải là chuỗi ký tự' })
  features?: string;
}
