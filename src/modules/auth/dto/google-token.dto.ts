import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleTokenDto {
  @ApiProperty({ example: '1234567890', description: 'Google provider user ID (profile.sub)' })
  @IsString()
  providerId: string;

  @ApiProperty({ example: 'user@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({ example: 'https://lh3.googleusercontent.com/...', required: false })
  @IsString()
  @IsOptional()
  picture?: string;
}
