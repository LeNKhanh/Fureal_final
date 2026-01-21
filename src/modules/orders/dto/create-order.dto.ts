import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiPropertyOptional({ example: 'uuid-of-address' })
  @IsOptional()
  @IsString()
  addressId?: string;
}
