import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum Menh {
  KIM = 'Kim',
  MOC = 'Mộc',
  THUY = 'Thủy',
  HOA = 'Hỏa',
  THO = 'Thổ',
}

export enum Huong {
  DONG = 'Đông',
  TAY = 'Tây',
  NAM = 'Nam',
  BAC = 'Bắc',
  DONG_NAM = 'Đông Nam',
  DONG_BAC = 'Đông Bắc',
  TAY_NAM = 'Tây Nam',
  TAY_BAC = 'Tây Bắc',
}

export class FengShuiAdviceDto {
  @ApiProperty({
    description: 'Mệnh của người dùng',
    enum: Menh,
    example: Menh.MOC,
  })
  @IsEnum(Menh, { message: 'Mệnh phải là một trong: Kim, Mộc, Thủy, Hỏa, Thổ' })
  menh: Menh;

  @ApiProperty({
    description: 'Hướng nhà hoặc hướng cần tư vấn',
    enum: Huong,
    example: Huong.DONG_NAM,
  })
  @IsEnum(Huong, {
    message: 'Hướng phải là một trong: Đông, Tây, Nam, Bắc, Đông Nam, Đông Bắc, Tây Nam, Tây Bắc',
  })
  huong: Huong;

  @ApiProperty({
    description: 'Loại phòng cần tư vấn (phòng khách, phòng ngủ, v.v.)',
    example: 'phòng ngủ',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Loại phòng phải là chuỗi ký tự' })
  roomType?: string;

  @ApiProperty({
    description: 'Câu hỏi cụ thể về phong thủy',
    example: 'Tôi nên đặt giường hướng nào?',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Câu hỏi phải là chuỗi ký tự' })
  question?: string;
}
