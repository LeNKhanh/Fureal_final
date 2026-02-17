import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Menh, Huong } from './feng-shui-advice.dto';

export class ProductRecommendationDto {
  @ApiProperty({
    description: 'Mệnh của người dùng',
    enum: Menh,
    example: Menh.MOC,
  })
  @IsEnum(Menh, { message: 'Mệnh phải là một trong: Kim, Mộc, Thủy, Hỏa, Thổ' })
  menh: Menh;

  @ApiProperty({
    description: 'Hướng nhà',
    enum: Huong,
    example: Huong.DONG_NAM,
  })
  @IsEnum(Huong, {
    message: 'Hướng phải là một trong: Đông, Tây, Nam, Bắc, Đông Nam, Đông Bắc, Tây Nam, Tây Bắc',
  })
  huong: Huong;

  @ApiProperty({
    description: 'Loại sản phẩm cần tìm (giường, sofa, bàn, v.v.)',
    example: 'giường',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Loại sản phẩm phải là chuỗi ký tự' })
  productType?: string;

  @ApiProperty({
    description: 'Loại phòng (phòng khách, phòng ngủ, v.v.)',
    example: 'phòng ngủ',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Loại phòng phải là chuỗi ký tự' })
  roomType?: string;

  @ApiProperty({
    description: 'Ngân sách tối đa (VNĐ)',
    example: 10000000,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Ngân sách phải là số' })
  @Min(0, { message: 'Ngân sách phải lớn hơn 0' })
  maxBudget?: number;

  @ApiProperty({
    description: 'Yêu cầu bổ sung',
    example: 'Tôi thích màu trắng, phong cách hiện đại',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Yêu cầu phải là chuỗi ký tự' })
  additionalRequirements?: string;
}
