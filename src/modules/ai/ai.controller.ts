import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AiService } from './ai.service';
import {
  FengShuiAdviceDto,
  ProductRecommendationDto,
  ChatDto,
  GenerateDescriptionDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('AI - Tính năng AI & Tư vấn')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Public()
  @Post('feng-shui-advice')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Tư vấn phong thủy (Public)',
    description:
      'Nhận tư vấn phong thủy dựa trên mệnh và hướng nhà. API sử dụng Google Gemini AI kết hợp với database sản phẩm (RAG).',
  })
  @ApiBody({ type: FengShuiAdviceDto })
  @ApiResponse({
    status: 200,
    description: 'Tư vấn phong thủy thành công',
    schema: {
      type: 'object',
      properties: {
        advice: {
          type: 'string',
          example:
            'Với mệnh Mộc và hướng nhà Đông Nam, bạn rất phù hợp với các sản phẩm làm từ gỗ tự nhiên...',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc AI service chưa được cấu hình',
  })
  async getFengShuiAdvice(@Body() dto: FengShuiAdviceDto) {
    const advice = await this.aiService.getFengShuiAdvice(dto);
    return {
      advice,
      metadata: {
        menh: dto.menh,
        huong: dto.huong,
        roomType: dto.roomType,
      },
    };
  }

  @Public()
  @Post('product-recommendations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Gợi ý sản phẩm thông minh (Public)',
    description:
      'Nhận gợi ý sản phẩm phù hợp dựa trên mệnh, hướng nhà, và yêu cầu cá nhân. Kết hợp AI và database (RAG).',
  })
  @ApiBody({ type: ProductRecommendationDto })
  @ApiResponse({
    status: 200,
    description: 'Gợi ý sản phẩm thành công',
    schema: {
      type: 'object',
      properties: {
        recommendations: {
          type: 'array',
          description: 'Danh sách sản phẩm được gợi ý',
        },
        aiExplanation: {
          type: 'string',
          description: 'Giải thích chi tiết từ AI',
          example: 'Dựa trên mệnh Mộc của bạn, tôi khuyến nghị 5 sản phẩm sau đây...',
        },
        metadata: {
          type: 'object',
          description: 'Thông tin truy vấn',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ',
  })
  async getProductRecommendations(@Body() dto: ProductRecommendationDto) {
    const result = await this.aiService.getProductRecommendations(dto);
    return {
      ...result,
      metadata: {
        menh: dto.menh,
        huong: dto.huong,
        productType: dto.productType,
        totalRecommendations: result.recommendations.length,
      },
    };
  }

  @Public()
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Chatbot hỗ trợ khách hàng (Public)',
    description:
      'Trò chuyện với AI chatbot để được tư vấn về sản phẩm, phong thủy. Hỗ trợ conversation history để duy trì ngữ cảnh hội thoại.',
  })
  @ApiBody({ type: ChatDto })
  @ApiResponse({
    status: 200,
    description: 'Phản hồi từ chatbot',
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          example: 'assistant',
          description: 'Vai trò của message (để frontend dễ xử lý)',
        },
        content: {
          type: 'string',
          example: 'Xin chào! Tôi có thể giúp gì cho bạn về nội thất phong thủy?',
          description: 'Nội dung phản hồi',
        },
        timestamp: {
          type: 'string',
          example: '2026-02-11T10:30:00.000Z',
          description: 'Thời gian phản hồi',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Tin nhắn không hợp lệ',
  })
  async chat(@Body() dto: ChatDto) {
    const content = await this.aiService.chat(dto);
    return {
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @ApiBearerAuth()
  @Post('generate-description')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Tạo mô tả sản phẩm tự động (ADMIN/MANAGER)',
    description:
      'Sử dụng AI để tự động tạo mô tả sản phẩm chuyên nghiệp. Chỉ dành cho Admin và Manager.',
  })
  @ApiBody({ type: GenerateDescriptionDto })
  @ApiResponse({
    status: 200,
    description: 'Tạo mô tả thành công',
    schema: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          example: 'Giường ngủ gỗ sồi hiện đại là lựa chọn hoàn hảo cho phòng ngủ sang trọng...',
        },
        productName: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập (chỉ ADMIN/MANAGER)',
  })
  async generateDescription(@Body() dto: GenerateDescriptionDto) {
    const description = await this.aiService.generateProductDescription(dto);
    return {
      description,
      productName: dto.productName,
      generatedAt: new Date().toISOString(),
    };
  }

  @Public()
  @Get('health')
  @ApiOperation({
    summary: 'Kiểm tra trạng thái AI service',
    description: 'Kiểm tra xem AI service có hoạt động không',
  })
  @ApiResponse({
    status: 200,
    description: 'AI service hoạt động bình thường',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        model: { type: 'string', example: 'gemini-2.5-flash' },
        message: { type: 'string' },
      },
    },
  })
  async healthCheck() {
    return {
      status: 'healthy',
      model: 'gemini-2.5-flash',
      provider: 'Google Generative AI',
      message: 'AI service is running (REST API v1beta)',
      timestamp: new Date().toISOString(),
    };
  }
}
