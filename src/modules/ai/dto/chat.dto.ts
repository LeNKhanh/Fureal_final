import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ConversationMessage {
  @ApiProperty({
    description: 'Vai trò (user hoặc assistant)',
    example: 'user',
    enum: ['user', 'assistant'],
  })
  @IsString()
  @IsNotEmpty()
  role: 'user' | 'assistant';

  @ApiProperty({
    description: 'Nội dung tin nhắn',
    example: 'Mệnh Kim hợp với màu gì?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class ChatDto {
  @ApiProperty({
    description: 'Tin nhắn của người dùng',
    example: 'Tôi muốn tư vấn về cách bố trí phòng khách theo phong thủy',
    maxLength: 1000,
  })
  @IsNotEmpty({ message: 'Tin nhắn không được để trống' })
  @IsString({ message: 'Tin nhắn phải là chuỗi ký tự' })
  @MaxLength(1000, { message: 'Tin nhắn không được quá 1000 ký tự' })
  message: string;

  @ApiPropertyOptional({
    description: 'Lịch sử hội thoại (tối đa 10 tin nhắn gần nhất)',
    type: [ConversationMessage],
    example: [
      { role: 'user', content: 'Mệnh Kim hợp với màu gì?' },
      { role: 'assistant', content: 'Mệnh Kim hợp với màu trắng, vàng, bạc...' },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConversationMessage)
  conversationHistory?: ConversationMessage[];
}
