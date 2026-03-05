import { IsString, IsOptional, IsBoolean, IsNumber, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePartnerDto {
  @ApiProperty({ example: 'BOSCH' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ required: false, example: 'https://bosch.com' })
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiProperty({ required: false, example: 'https://cdn.example.com/bosch-logo.png' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
