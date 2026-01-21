import { ApiProperty } from '@nestjs/swagger';

export class GoogleAuthDto {
  @ApiProperty({ example: 'google' })
  provider: string;

  @ApiProperty({ example: '1234567890' })
  providerId: string;

  @ApiProperty({ example: 'user@gmail.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  fullName: string;

  @ApiProperty({ example: 'https://lh3.googleusercontent.com/...' })
  picture?: string;

  accessToken: string;
}
