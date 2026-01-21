import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  IsPhoneNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @MaxLength(150)
  receiverName: string;

  @ApiProperty({ example: '0912345678' })
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: '123 Đường ABC, Quận 1' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'TP. Hồ Chí Minh' })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
