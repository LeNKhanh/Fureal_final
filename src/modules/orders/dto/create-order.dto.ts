import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiPropertyOptional({ example: 'uuid-of-address', description: 'Use saved address by ID' })
  @IsOptional()
  @IsString()
  addressId?: string;

  // Inline address fields (used when addressId is not provided)
  @ApiPropertyOptional({ example: 'Nguyễn Văn A' })
  @IsOptional()
  @IsString()
  receiverName?: string;

  @ApiPropertyOptional({ example: '0912345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '123 Đường ABC, Quận 1' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'TP. Hồ Chí Minh' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'COD', enum: ['COD', 'BANK_TRANSFER'] })
  @IsOptional()
  @IsString()
  @IsIn(['COD', 'BANK_TRANSFER'])
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 'Giao sau 17h' })
  @IsOptional()
  @IsString()
  notes?: string;
}
