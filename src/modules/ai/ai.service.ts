import { Injectable, Logger, BadRequestException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProductsService } from '../products/products.service';
import {
  FengShuiAdviceDto,
  ProductRecommendationDto,
  ChatDto,
  GenerateDescriptionDto,
} from './dto';
import { Product } from '../products/entities/product.entity';
import {
  parseBirthDate,
  createFengShuiProfile,
  formatFengShuiProfileForAI,
  FengShuiElement,
} from '../../common/utils/feng-shui.util';

@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);
  private apiKey: string;
  private readonly API_ENDPOINT =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  
  // IN-MEMORY CACHE: Lưu top products để tránh query DB mỗi lần
  private productCache: Product[] = [];
  private cacheLoadedAt: Date = null;
  private readonly CACHE_TTL_HOURS = 6; // Refresh cache mỗi 6 giờ

  constructor(
    private configService: ConfigService,
    private productsService: ProductsService,
  ) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!this.apiKey) {
      this.logger.warn('GEMINI_API_KEY not configured. AI features will be disabled.');
      return;
    }

    this.logger.log('Google Gemini AI initialized successfully (REST API mode)');
  }

  /**
   * Load products into memory cache khi khởi động
   */
  async onModuleInit() {
    await this.refreshProductCache();
  }

  /**
   * Refresh product cache từ database
   */
  private async refreshProductCache(): Promise<void> {
    try {
      this.logger.log('[CACHE] Loading products into memory...');
      
      const result = await this.productsService.findAll({
        isActive: true,
        page: 1,
        limit: 50, // Load 50 sản phẩm phổ biến nhất
      });
      
      this.productCache = result.data || [];
      this.cacheLoadedAt = new Date();
      
      this.logger.log(`[CACHE] Loaded ${this.productCache.length} products at ${this.cacheLoadedAt.toISOString()}`);
    } catch (error) {
      this.logger.error('[CACHE] Error loading products:', error);
      this.productCache = [];
    }
  }

  /**
   * Check if cache needs refresh (mỗi 6 giờ)
   */
  private shouldRefreshCache(): boolean {
    if (!this.cacheLoadedAt) return true;
    
    const hoursSinceLoad = (Date.now() - this.cacheLoadedAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceLoad >= this.CACHE_TTL_HOURS;
  }

  /**
   * Filter products từ in-memory cache thay vì query DB
   */
  private filterFromCache(context: {
    menh?: string;
    huong?: string;
    productType?: string;
  }): Product[] {
    if (this.shouldRefreshCache()) {
      this.logger.log('[CACHE] Cache expired, will refresh in background...');
      // Refresh async, không block request hiện tại
      this.refreshProductCache().catch(err => 
        this.logger.error('[CACHE] Background refresh failed:', err)
      );
    }

    let filtered = [...this.productCache];

    // Filter theo mệnh
    if (context.menh) {
      filtered = filtered.filter(p => p.menh?.includes(context.menh));
      this.logger.log(`[CACHE] After menh filter: ${filtered.length} products`);
    }

    // Filter theo hướng
    if (context.huong) {
      const haveHuong = filtered.filter(p => p.huong?.includes(context.huong));
      if (haveHuong.length > 0) {
        filtered = haveHuong;
        this.logger.log(`[CACHE] After huong filter: ${filtered.length} products`);
      }
    }

    // Filter theo loại sản phẩm
    if (context.productType) {
      const searchTerm = context.productType.toLowerCase().trim();
      const searchWords = searchTerm.split(' ').filter(w => w.length > 0);
      
      const matched = filtered.filter(p => {
        const productName = (p.name || '').toLowerCase().replace(/\s+/g, ' ').trim();
        return searchWords.every(word => productName.includes(word));
      });
      
      if (matched.length > 0) {
        filtered = matched;
        this.logger.log(`[CACHE] After productType filter: ${filtered.length} products`);
      }
    }

    return filtered.slice(0, 15); // Giới hạn 15 kết quả
  }

  /**
   * Call Gemini API trực tiếp bằng REST với retry logic
   */
  private async callGeminiAPI(prompt: string, retries = 0): Promise<string> {
    try {
      const response = await fetch(`${this.API_ENDPOINT}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle rate limit error (429)
        if (response.status === 429) {
          const retryDelay = errorData.error?.details?.find(
            (d: any) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
          )?.retryDelay;
          
          const quotaInfo = errorData.error?.details?.find(
            (d: any) => d['@type'] === 'type.googleapis.com/google.rpc.QuotaFailure'
          )?.violations?.[0];
          
          this.logger.warn(
            `Rate limit exceeded. Quota: ${quotaInfo?.quotaValue || 'unknown'} requests. ` +
            `Retry suggested in: ${retryDelay || '60s'}`
          );
          
          // Retry once after delay if this is first attempt
          if (retries === 0 && retryDelay) {
            const delaySeconds = parseInt(retryDelay.replace('s', '')) || 25;
            if (delaySeconds <= 30) { // Only retry if delay is reasonable
              this.logger.log(`Retrying after ${delaySeconds}s...`);
              await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
              return this.callGeminiAPI(prompt, retries + 1);
            }
          }
          
          throw new BadRequestException(
            'Đã vượt quá giới hạn số lần sử dụng AI (20 lần/ngày). ' +
            'Vui lòng thử lại sau 24 giờ hoặc liên hệ quản trị viên để nâng cấp.'
          );
        }
        
        this.logger.error('Gemini API Error:', errorData);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // Re-throw BadRequestException with custom message
      }
      this.logger.error('Error calling Gemini API:', error);
      throw error;
    }
  }

  /**
   * Tư vấn phong thủy với RAG - Lấy thông tin từ database
   */
  async getFengShuiAdvice(dto: FengShuiAdviceDto): Promise<string> {
    this.ensureModelInitialized();

    try {
      // RAG: Query database để lấy sản phẩm phù hợp
      const relevantProducts = await this.productsService.findAll({
        menh: dto.menh,
        huong: dto.huong,
        isActive: true,
        page: 1,
        limit: 10,
      });

      // Tạo context từ database
      const productContext = this.buildProductContext(relevantProducts.data);

      // Prompt Engineering với thông tin chi tiết hơn
      const prompt = `
Bạn là CHUYÊN GIA TƯ VẤN PHONG THỦY NỘI THẤT hàng đầu tại Việt Nam với 20 năm kinh nghiệm.

-------------------------------------------
THÔNG TIN KHÁCH HÀNG CHI TIẾT:
-------------------------------------------
- Mệnh: ${dto.menh} (Thuộc ngũ hành: Kim - Mộc - Thủy - Hỏa - Thổ)
- Hướng nhà: ${dto.huong} (Theo bát trạch phong thủy)
${dto.roomType ? `- Loại phòng: ${dto.roomType}` : ''}
${dto.question ? `- Thắc mắc: ${dto.question}` : ''}

-------------------------------------------
KIẾN THỨC PHONG THỦY CHUYÊN SÂU:
-------------------------------------------

NGŨ HÀNH TƯƠNG SINH:
- Kim sinh Thủy
- Thủy sinh Mộc
- Mộc sinh Hỏa
- Hỏa sinh Thổ
- Thổ sinh Kim

NGŨ HÀNH TƯƠNG KHẮC:
- Kim khắc Mộc
- Mộc khắc Thổ
- Thổ khắc Thủy
- Thủy khắc Hỏa
- Hỏa khắc Kim

MÀU SẮC THEO MỆNH ${dto.menh}:
${this.getColorAdviceByElement(dto.menh)}

HƯỚNG NHÀ ${dto.huong}:
${this.getDirectionAdvice(dto.huong)}

-------------------------------------------
SẢN PHẨM PHÙ HỢP TRONG HỆ THỐNG:
-------------------------------------------
${productContext}

-------------------------------------------
YÊU CẦU TƯ VẤN CHI TIẾT:
-------------------------------------------
1. PHÂN TÍCH MỆNH ${dto.menh}:
   - Giải thích đặc điểm và ý nghĩa của mệnh ${dto.menh}
   - Những yếu tố hỗ trợ mệnh (mệnh tương sinh)
   - Những yếu tố nên tránh (mệnh tương khắc)

2. PHÂN TÍCH HƯỚNG NHÀ ${dto.huong}:
   - Ý nghĩa của hướng ${dto.huong} theo phong thủy
   - Lợi ích và ảnh hưởng đến gia chủ
   - Cách tối ưu hóa hướng này với mệnh ${dto.menh}

3. TƯ VẤN NỘI THẤT CỤ THỂ:
   - Gợi ý màu sắc chủ đạo (dựa trên mệnh và hướng)
   - Chất liệu phù hợp (gỗ, kim loại, thủy tinh, đá...)
   - Cách bố trí nội thất theo nguyên lý Bát Trạch
   - Vị trí đặt các món đồ quan trọng (giường, bàn làm việc, sofa...)

4. GỢI Ý SẢN PHẨM từ danh sách trên:
   - Chọn 3-5 sản phẩm phù hợp nhất
   - Giải thích tại sao từng sản phẩm phù hợp với mệnh ${dto.menh}
   - Hướng dẫn cách kết hợp các sản phẩm

5. LƯU Ý PHONG THỦY QUAN TRỌNG:
   - Những điều cần tránh tuyệt đối
   - Những vật phẩm mang lại may mắn
   - Thời điểm tốt để bài trí/thay đổi nội thất

${dto.question ? `6. TRẢ LỜI CÂU HỎI: ${dto.question}\n` : ''}

-------------------------------------------
NGUỒN THAM KHẢO VÀ LIÊN KẾT:
-------------------------------------------
Sau khi tư vấn, BẮT BUỘC đưa ra các nguồn tham khảo:

Nguồn tham khảo phong thủy uy tín:
- Hiệp hội Phong Thủy Việt Nam: https://phongthuy.vn
- Trung tâm Nghiên cứu Phong Thủy Á Đông: https://phongthuyadong.com
- Sách "Phong Thủy Ứng Dụng" - GS.TS Vương Văn Minh
- Trang phong thủy Fureal: https://fureal.com/feng-shui

Chuyên gia tư vấn:
Nếu cần tư vấn chuyên sâu hơn, quý khách có thể liên hệ:
- Hotline: 1900-xxxx
- Email: fengshui@fureal.com

-------------------------------------------

ĐỊNH DẠNG TRẢ LỜI:
- Dùng văn bản thuần để format
- Phân đoạn rõ ràng với tiêu đề
- Sử dụng dấu gạch đầu dòng (-) và số thứ tự (1, 2, 3)
- Độ dài: 500-800 từ
- Ngôn ngữ: Tiếng Việt chuyên nghiệp, dễ hiểu
- TUYỆT ĐỐI KHÔNG sử dụng emoji hoặc ký tự đặc biệt
- TUYỆT ĐỐI KHÔNG sử dụng markdown như dấu sao (*), hai dấu sao (**), dấu gạch dưới (_)
- Kết thúc bằng phần "NGUỒN THAM KHẢO" với các link cụ thể
`;

      return await this.callGeminiAPI(prompt);
    } catch (error) {
      this.logger.error('Error generating feng shui advice:', error);
      throw new BadRequestException('Không thể tạo tư vấn phong thủy. Vui lòng thử lại.');
    }
  }

  /**
   * Helper: Get color advice by element
   */
  private getColorAdviceByElement(element: string): string {
    const colorMap = {
      'Kim': '- Màu chủ đạo: Trắng, vàng kim, bạc, xám kim loại\n- Màu hỗ trợ: Nâu, vàng đất (Thổ sinh Kim)\n- Màu nên tránh: Đỏ, hồng (Hỏa khắc Kim)',
      'Mộc': '- Màu chủ đạo: Xanh lá, xanh lục, xanh ngọc\n- Màu hỗ trợ: Đen, xanh navy (Thủy sinh Mộc)\n- Màu nên tránh: Trắng, xám kim loại (Kim khắc Mộc)',
      'Thủy': '- Màu chủ đạo: Đen, xanh navy, xanh dương\n- Màu hỗ trợ: Trắng, bạc (Kim sinh Thủy)\n- Màu nên tránh: Vàng, nâu đất (Thổ khắc Thủy)',
      'Hỏa': '- Màu chủ đạo: Đỏ, hồng, cam, tím\n- Màu hỗ trợ: Xanh lá (Mộc sinh Hỏa)\n- Màu nên tránh: Đen, xanh navy (Thủy khắc Hỏa)',
      'Thổ': '- Màu chủ đạo: Vàng, nâu, be, cam đất\n- Màu hỗ trợ: Đỏ, hồng (Hỏa sinh Thổ)\n- Màu nên tránh: Xanh lá cây (Mộc khắc Thổ)'
    };
    return colorMap[element] || 'Chưa có thông tin màu sắc cho mệnh này.';
  }

  /**
   * Helper: Get direction advice
   */
  private getDirectionAdvice(direction: string): string {
    const directionMap = {
      'Đông': 'Hướng Đông thuộc mệnh Mộc - Hướng của sự phát triển, tuổi trẻ, khởi đầu mới. Phù hợp cho phòng làm việc, phòng học.',
      'Tây': 'Hướng Tây thuộc mệnh Kim - Hướng của sự trưởng thành, ổn định. Phù hợp cho phòng khách, phòng ăn.',
      'Nam': 'Hướng Nam thuộc mệnh Hỏa - Hướng của danh vọng, thành công. Phù hợp cho phòng khách, phòng tiếp khách.',
      'Bắc': 'Hướng Bắc thuộc mệnh Thủy - Hướng của sự nghiệp, tri thức. Phù hợp cho phòng làm việc, phòng đọc sách.',
      'Đông Bắc': 'Hướng Đông Bắc - Hướng của tri thức, học vấn. Rất tốt cho phòng học, phòng thờ.',
      'Tây Bắc': 'Hướng Tây Bắc - Hướng của người đứng đầu, quyền lực. Phù hợp cho phòng làm việc của chủ nhà.',
      'Đông Nam': 'Hướng Đông Nam - Hướng của tài lộc, phú quý. Rất tốt cho phòng khách, nơi tiếp khách.',
      'Tây Nam': 'Hướng Tây Nam - Hướng của gia đình, tình yêu. Phù hợp cho phòng ngủ, phòng ăn gia đình.'
    };
    return directionMap[direction] || 'Hướng nhà ảnh hưởng đến phong thủy tổng thể của ngôi nhà.';
  }

  /**
   * Gợi ý sản phẩm với RAG - Kết hợp AI và database
   */
  async getProductRecommendations(dto: ProductRecommendationDto): Promise<{
    recommendations: Product[];
    aiExplanation: string;
  }> {
    this.ensureModelInitialized();

    try {
      // OPTIMIZATION: Query 1 lần duy nhất với limit hợp lý
      const filters: any = {
        menh: dto.menh,
        huong: dto.huong,
        isActive: true,
        inStock: true,
        page: 1,
        limit: 20, // Giảm từ 50 → 20 để query nhanh hơn
      };

      if (dto.maxBudget) {
        filters.maxPrice = dto.maxBudget;
      }

      if (dto.roomType) {
        const spaceMap: any = {
          'phòng khách': 'Phòng khách',
          'phòng ngủ': 'Phòng ngủ',
          'phòng làm việc': 'Phòng làm việc',
          'phòng ăn': 'Phòng ăn',
          'bếp': 'Nhà bếp',
        };
        filters.space = spaceMap[dto.roomType.toLowerCase()] || dto.roomType;
      }

      const productsResult = await this.productsService.findAll(filters);
      let allProducts = productsResult.data;

      // Lọc theo productType nếu có
      if (dto.productType) {
        const typeKeyword = dto.productType.toLowerCase();
        const filtered = allProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(typeKeyword) ||
            p.category?.name.toLowerCase().includes(typeKeyword) ||
            p.description?.toLowerCase().includes(typeKeyword),
        );
        if (filtered.length > 0) {
          allProducts = filtered;
        }
      }

      // OPTIMIZATION: Scoring nhanh
      const scoredProducts = allProducts.map((product) => {
        let score = 0;
        if (product.menh?.includes(dto.menh)) score += 10;
        if (product.huong?.includes(dto.huong)) score += 10;
        if (dto.roomType && product.space) {
          const match = product.space.toLowerCase().includes(dto.roomType.toLowerCase());
          if (match) score += 5;
        }
        if (product.brand) score += 3;
        if (product.images?.length > 0) score += 2;
        if (product.stock < 5) score -= 5;
        return { product, score };
      });

      scoredProducts.sort((a, b) => b.score - a.score);

      // OPTIMIZATION: Chỉ lấy top 5 thay vì 10
      const topProducts = scoredProducts.slice(0, 5).map(sp => sp.product);

      if (topProducts.length === 0) {
        return {
          recommendations: [],
          aiExplanation: `Rất tiếc, hiện tại chúng tôi chưa có sản phẩm phù hợp với mệnh ${dto.menh} và hướng ${dto.huong}${dto.maxBudget ? ` trong khoảng giá ${dto.maxBudget.toLocaleString('vi-VN')} VNĐ` : ''}. Vui lòng thử lại với điều kiện khác!`,
        };
      }

      // OPTIMIZATION: Context ngắn gọn hơn
      const productContext = this.buildCompactProductContext(topProducts);

      // Build customer info
      const customerInfo = [
        `- Mệnh: ${dto.menh}`,
        `- Hướng: ${dto.huong}`,
      ];
      
      if (dto.maxBudget) {
        customerInfo.push(`- Ngân sách: ${dto.maxBudget.toLocaleString('vi-VN')} VNĐ`);
      }
      if (dto.productType) customerInfo.push(`- Quan tâm: ${dto.productType}`);
      if (dto.roomType) customerInfo.push(`- Không gian: ${dto.roomType}`);
      if (dto.additionalRequirements) customerInfo.push(`- Yêu cầu: ${dto.additionalRequirements}`);

      // OPTIMIZATION: Prompt ngắn gọn hơn
      const prompt = `
Bạn là chuyên gia tư vấn nội thất phong thủy của Fureal.

KHÁCH HÀNG:
${customerInfo.join('\n')}

SẢN PHẨM (${topProducts.length} sản phẩm):
${productContext}

YÊU CẦU: Viết ngắn gọn, giới thiệu 3-5 sản phẩm phù hợp nhất.

FORMAT (KHÔNG dùng emoji):

PHONG THỦY:
[1-2 câu giải thích tại sao mệnh ${dto.menh} + hướng ${dto.huong} phù hợp]

KHUYẾN NGHỊ:

1. [Tên sản phẩm]
Giá: [X]đ | Phong thủy: [Tại sao phù hợp] | Ưu điểm: [1-2 điểm mạnh]

2. [Tên sản phẩm]
Giá: [X]đ | Phong thủy: [Tại sao phù hợp] | Ưu điểm: [1-2 điểm mạnh]

[Tương tự cho 1-3 sản phẩm nữa]

GỢI Ý: [1-2 câu tư vấn thêm về bố trí/kết hợp]

Độ dài: 150-250 từ. Viết tiếng Việt, ngắn gọn, rõ ràng.
TUYỆT ĐỐI KHÔNG dùng emoji.
TUYỆT ĐỐI KHÔNG sử dụng markdown như dấu sao (*), hai dấu sao (**), dấu gạch dưới (_).
Chỉ dùng văn bản thuần.
`;

      const result = await this.callGeminiAPI(prompt);

      return {
        recommendations: topProducts,
        aiExplanation: result,
      };
    } catch (error) {
      this.logger.error('Error generating product recommendations:', error);
      throw new BadRequestException('Không thể tạo gợi ý sản phẩm. Vui lòng thử lại.');
    }
  }

  /**
   * Chatbot hỗ trợ khách hàng - Context-aware với conversation history và database sản phẩm thực tế
   */
  async chat(dto: ChatDto): Promise<string> {
    this.ensureModelInitialized();

    try {
      // BƯỚC 1: Phân tích ngữ cảnh để phát hiện mệnh, hướng, loại sản phẩm
      const fullConversation = [
        ...(dto.conversationHistory || []),
        { role: 'user', content: dto.message }
      ];
      
      const contextInfo = this.extractProductContext(fullConversation);
      this.logger.log(`[CHAT] Context extracted: ${JSON.stringify(contextInfo)}`);
      
      // BƯỚC 2: Sử dụng IN-MEMORY CACHE thay vì query DB - Giảm từ 1500ms → 5ms
      let productContext = '';
      let relevantProducts = [];
      let hasNoMatchingProducts = false;  // Flag để biết có sản phẩm hay không
      
      if (contextInfo.menh || contextInfo.huong || contextInfo.productType) {
        // TỐI ƯU: Lấy từ cache thay vì DB query
        relevantProducts = this.filterFromCache(contextInfo);
        this.logger.log(`[CHAT] Cache returned ${relevantProducts.length} products`);
        
        if (relevantProducts.length > 0) {
          // SỬ DỤNG MINIMAL FORMAT: Tên|Giá|Mệnh|Hướng|Link_ảnh
          productContext = this.buildMinimalProductContext(relevantProducts.slice(0, 8));
        } else if (contextInfo.productType) {
          // Nếu user hỏi loại sản phẩm cụ thể nhưng không tìm thấy
          hasNoMatchingProducts = true;
          productContext = `KHÔNG TÌM THẤY sản phẩm loại "${contextInfo.productType}" trong hệ thống.\n\nCác sản phẩm khác có sẵn:`;
          relevantProducts = this.productCache.slice(0, 5);
          productContext += '\n' + this.buildCompactProductContext(relevantProducts);
        }
      }
      
      // Nếu không có yêu cầu cụ thể, lấy từ cache mẫu
      if (!productContext) {
        relevantProducts = this.productCache.slice(0, 5);
        productContext = this.buildCompactProductContext(relevantProducts);
        this.logger.log(`[CHAT] Using ${relevantProducts.length} sample products from cache`);
      }

      // BƯỚC 3: Xây dựng lịch sử hội thoại
      let conversationHistory = '';
      if (dto.conversationHistory && dto.conversationHistory.length > 0) {
        const recent = dto.conversationHistory.slice(-4);
        conversationHistory = '\nHỘI THOẠI TRƯỚC:\n' + 
          recent.map(msg => `${msg.role === 'user' ? 'Khách' : 'Bot'}: ${msg.content}`).join('\n') + 
          '\n';
      }

      
      // BƯỚC 4: Build ENHANCED PROMPT với thông tin phong thủy chi tiết
      const hasSpecificProducts = relevantProducts.length > 0 && (contextInfo.menh || contextInfo.huong || contextInfo.productType);
      
      // Thông tin phong thủy chi tiết từ ngày sinh (RÚT GỌN để không làm prompt quá dài)
      let detailedFengShuiInfo = '';
      if (contextInfo.fengShuiProfile) {
        const profile = contextInfo.fengShuiProfile;
        detailedFengShuiInfo = `
- Phân tích: ${formatFengShuiProfileForAI(profile)}
- Màu sắc phù hợp: ${this.getColorAdviceByElement(profile.element).substring(0, 200)}...
- Lời khuyên độ tuổi: ${this.getAgeGroupAdvice(profile.ageGroup).substring(0, 150)}...`;
      }
      
      const prompt = `
Bạn là TRỢ LÝ PHONG THỦY NỘI THẤT FUREAL - Chuyên gia tư vấn thông minh.
${conversationHistory}

-----------------------------------
SẢN PHẨM CÓ SẴN TRONG HỆ THỐNG (ĐỌC KỸ - ƯU TIÊN CAO)
-----------------------------------
${productContext}

QUY TẮC BẮT BUỘC KHI GIỚI THIỆU SẢN PHẨM:
1. CHỈ được giới thiệu sản phẩm CÓ TRONG DANH SÁCH TRÊN
2. TUYỆT ĐỐI KHÔNG tự tạo tên sản phẩm mới
3. TUYỆT ĐỐI KHÔNG tự nghĩ ra giá
4. TUYỆT ĐỐI KHÔNG tự tạo link ảnh
5. Nếu KHÔNG CÓ sản phẩm phù hợp trong danh sách → nói rõ "Hiện chưa có sản phẩm ... trong hệ thống"
6. Mỗi sản phẩm giới thiệu PHẢI có: Tên (từ danh sách), Giá (từ danh sách), Link ảnh (từ danh sách)

-----------------------------------
THÔNG TIN KHÁCH HÀNG
-----------------------------------
${contextInfo.menh ? `- Mệnh: ${contextInfo.menh}` : ''}
${contextInfo.huong ? `- Hướng nhà: ${contextInfo.huong}` : ''}
${contextInfo.productType ? `- Quan tâm: ${contextInfo.productType}` : ''}
${contextInfo.birthYear ? `- Năm sinh: ${contextInfo.birthYear} (${2026 - contextInfo.birthYear} tuổi)` : ''}
${detailedFengShuiInfo}

-----------------------------------
CÂU HỎI: "${dto.message}"
-----------------------------------

${hasSpecificProducts ? `
YÊU CẦU TRẢ LỜI:

1. PHÂN TÍCH PHONG THỦY:
   ${contextInfo.menh ? `- Giải thích ngắn gọn về mệnh ${contextInfo.menh}\n   - Màu sắc và yếu tố phù hợp` : ''}
   ${contextInfo.birthYear ? `- Ý nghĩa của năm sinh ${contextInfo.birthYear}` : ''}

2. GỢI Ý SẢN PHẨM (3-5 sản phẩm từ danh sách trên):
   BẮT BUỘC phải hiển thị đầy đủ thông tin sau cho mỗi sản phẩm:

   - Tên sản phẩm (đưa ra tên cụ thể từ danh sách)
   - Giá: (hiển thị giá thực tế từ danh sách)
   - Tại sao phù hợp: (giải thích ngắn gọn liên quan đến mệnh/hướng)
   - Hình ảnh: (BẮT BUỘC đưa ra link ảnh THỰC TẾ từ danh sách, VD: https://example.com/image.jpg)

   Ví dụ format:
   
   Giường ngủ gỗ sồi đỏ
   - Giá: 5,500,000đ
   - Tại sao phù hợp: Mệnh Mộc, màu đỏ nhạt, chất liệu gỗ tự nhiên phù hợp
   - Hình ảnh: https://storage.example.com/products/giuong-go-soi-do.jpg

3. LỜI KHUYÊN BỐ TRÍ:
   - Vị trí đặt sản phẩm trong nhà
   - Cách kết hợp với nội thất hiện có

4. NGUỒN THAM KHẢO:
   Để tìm hiểu thêm về phong thủy và mệnh ${contextInfo.menh || 'của bạn'}:
   
   Tài liệu tham khảo:
   - Hiệp hội Phong Thủy Việt Nam: https://phongthuy.vn/cach-xac-dinh-menh
   - Cẩm nang phong thủy Fureal: https://fureal.com/feng-shui-guide
   
   Liên hệ chuyên gia:
   - Hotline tư vấn miễn phí: 1900-xxxx
   - Email: fengshui@fureal.com

Độ dài: 200-300 từ.
TUYỆT ĐỐI KHÔNG sử dụng emoji.
TUYỆT ĐỐI KHÔNG sử dụng markdown như dấu sao (*), hai dấu sao (**), dấu gạch dưới (_).
Chỉ dùng văn bản thuần với dấu gạch đầu dòng (-) và số (1, 2, 3).
BẮT BUỘC phải đưa ra link hình ảnh THỰC TẾ cho mỗi sản phẩm.
` : `
YÊU CẦU TRẢ LỜI:

1. Giải thích cần thêm thông tin gì (năm sinh, mệnh, loại sản phẩm)
2. Giới thiệu 2-3 sản phẩm mẫu từ danh sách với:
   - Tên sản phẩm cụ thể (từ danh sách)
   - Giá thực tế
   - Đặc điểm phong thủy
   - BẮT BUỘC: Link hình ảnh THỰC TẾ (VD: https://storage.example.com/image.jpg)
3. Hướng dẫn cách xác định mệnh qua năm sinh
4. NGUỒN THAM KHẢO:
   - Cách xác định mệnh: https://phongthuy.vn/cach-xac-dinh-menh
   - Tư vấn online: https://fureal.com/chat
   - Hotline: 1900-xxxx

Độ dài: 150-200 từ, thân thiện.
TUYỆT ĐỐI KHÔNG sử dụng emoji.
TUYỆT ĐỐI KHÔNG sử dụng markdown như dấu sao (*), hai dấu sao (**), dấu gạch dưới (_).
Chỉ dùng văn bản thuần với dấu gạch đầu dòng (-) và số (1, 2, 3).
BẮT BUỘC phải đưa ra link hình ảnh THỰC TẾ cho mỗi sản phẩm.
`}
`;

      return await this.callGeminiAPI(prompt);
    } catch (error) {
      this.logger.error('Error in chat:', error);
      
      // Re-throw if it's already a BadRequestException (from rate limiting)
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException('Không thể xử lý tin nhắn. Vui lòng thử lại.');
    }
  }

  /**
   * Helper: Get age group specific advice
   */
  private getAgeGroupAdvice(ageGroup: string): string {
    const adviceMap = {
      'Thanh niên': 'Độ tuổi năng động, nên chọn màu sắc tươi sáng, thiết kế hiện đại, không gian mở giúp tăng sự sáng tạo và năng lượng.',
      'Trung niên': 'Độ tuổi ổn định sự nghiệp, nên chọn thiết kế sang trọng, màu sắc trầm ổn, chú trọng vào chất liệu cao cấp và bố trí hợp phong thủy.',
      'Trung niên muộn': 'Độ tuổi quan tâm sức khỏe và gia đình, nên ưu tiên không gian thoáng mát, màu sắc nhẹ nhàng, vật liệu thân thiện môi trường.',
      'Cao niên': 'Độ tuổi cần sự bình an và thư thái, nên chọn đồ nội thất an toàn, màu sắc dễ chịu, không gian đơn giản dễ di chuyển.'
    };
    return adviceMap[ageGroup] || 'Chọn nội thất phù hợp với lứa tuổi và sở thích cá nhân.';
  }

  /**
   * Helper: Get birth year specific advice
   */
  private getBirthYearAdvice(birthYear: number): string {
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    
    // Can Chi cycle advice (simplified)
    const yearMod12 = birthYear % 12;
    const zodiacAnimals = ['Thân (Khỉ)', 'Dậu (Gà)', 'Tuất (Chó)', 'Hợi (Lợn)', 'Tý (Chuột)', 'Sửu (Trâu)', 
                           'Dần (Hổ)', 'Mão (Mèo)', 'Thìn (Rồng)', 'Tỵ (Rắn)', 'Ngọ (Ngựa)', 'Mùi (Dê)'];
    const zodiac = zodiacAnimals[yearMod12];
    
    return `Tuổi ${zodiac} - ${age} tuổi năm 2026. Nên chú ý hướng nhà và bố trí theo nguyên lý Bát Trạch để tăng vận may.`;
  }

  /**
   * Trích xuất thông tin mệnh, hướng, loại sản phẩm, ngày sinh từ hội thoại
   */
  private extractProductContext(conversation: any[]): {
    menh?: string;
    huong?: string;
    productType?: string;
    birthYear?: number;
    fengShuiProfile?: any;
  } {
    const fullText = conversation.map(m => m.content).join(' ').toLowerCase();
    
    // PHÁT HIỆN NGÀY SINH
    let birthYear: number | undefined;
    let fengShuiProfile: any = undefined;
    
    const birthInfo = parseBirthDate(fullText);
    if (birthInfo) {
      birthYear = birthInfo.year;
      fengShuiProfile = createFengShuiProfile(birthYear);
      this.logger.log(
        `[DETECT] BirthYear: ${birthYear}, Element: ${fengShuiProfile.element}, Age: ${fengShuiProfile.ageGroup}`,
      );
    }
    
    // Phát hiện MỆNH
    const menhKeywords = {
      'Kim': ['mệnh kim', 'menh kim', 'kim mệnh'],
      'Mộc': ['mệnh mộc', 'menh moc', 'mộc mệnh', 'moc menh'],
      'Thủy': ['mệnh thủy', 'menh thuy', 'thủy mệnh', 'thuy menh'],
      'Hỏa': ['mệnh hỏa', 'menh hoa', 'hỏa mệnh', 'hoa menh'],
      'Thổ': ['mệnh thổ', 'menh tho', 'thổ mệnh', 'tho menh'],
    };
    
    let menh: string | undefined;
    for (const [menhName, keywords] of Object.entries(menhKeywords)) {
      if (keywords.some(kw => fullText.includes(kw))) {
        menh = menhName;
        break;
      }
    }

    // Phát hiện HƯỚNG
    const huongKeywords = {
      'Đông': ['hướng đông', 'huong dong', 'phía đông', 'phia dong'],
      'Tây': ['hướng tây', 'huong tay', 'phía tây', 'phia tay'],
      'Nam': ['hướng nam', 'huong nam', 'phía nam', 'phia nam'],
      'Bắc': ['hướng bắc', 'huong bac', 'phía bắc', 'phia bac'],
      'Đông Bắc': ['đông bắc', 'dong bac'],
      'Tây Bắc': ['tây bắc', 'tay bac'],
      'Đông Nam': ['đông nam', 'dong nam'],
      'Tây Nam': ['tây nam', 'tay nam'],
    };
    
    let huong: string | undefined;
    for (const [huongName, keywords] of Object.entries(huongKeywords)) {
      if (keywords.some(kw => fullText.includes(kw))) {
        huong = huongName;
        break;
      }
    }

    // Phát hiện LOẠI SẢN PHẨM - Ưu tiên từ cụ thể trước, chung sau
    const productKeywords = {
      'giường tầng': ['giường tầng', 'giuong tang', 'giường 2 tầng', 'giuong 2 tang'],
      'giường cho bé': ['giường cho bé', 'giuong cho be', 'giường trẻ em', 'giuong tre em', 'giường bé', 'giuong be'],
      'kệ sách': ['kệ sách', 'ke sach', 'kệ sach', 'ke sách'],
      'bàn làm việc': ['bàn làm việc', 'ban lam viec', 'bàn văn phòng', 'bàn học', 'ban hoc'],
      'ghế sofa': ['ghế sofa', 'ghe sofa', 'sofa'],
      'giường': ['giường', 'giuong', 'giường ngủ', 'giuong ngu'],
      'tủ áo': ['tủ áo', 'tu ao'],
      'bàn ăn': ['bàn ăn', 'ban an'],
      'kệ tivi': ['kệ tivi', 'ke tivi'],
      'kệ rượu': ['kệ rượu', 'ke ruou'],
      'kệ': ['kệ', 'ke', 'kệ trang trí'],
      'ghế': ['ghế', 'ghe', 'ghế ngồi', 'ghế văn phòng'],
      'tủ': ['tủ', 'tu', 'tủ kệ'],
      'tranh': ['tranh', 'tranh sơn thủy', 'tranh phong thủy'],
      'rèm': ['rèm', 'rem', 'rèm vải', 'rem vai', 'rèm cửa'],
    };
    
    let productType: string | undefined;
    // Duyệt theo thứ tự - từ cụ thể đến chung
    for (const [type, keywords] of Object.entries(productKeywords)) {
      if (keywords.some(kw => fullText.includes(kw))) {
        productType = type;
        this.logger.log(
          `[DETECT] ProductType: "${productType}" from text: "${fullText.substring(0, 100)}..."`,
        );
        break;
      }
    }
    
    // Nếu có feng shui profile (từ ngày sinh), override mệnh
    if (fengShuiProfile) {
      menh = fengShuiProfile.element;
    }

    return { menh, huong, productType, birthYear, fengShuiProfile };
  }

  /**
   * Generate mô tả sản phẩm tự động cho Admin/Manager
   */
  async generateProductDescription(dto: GenerateDescriptionDto): Promise<string> {
    this.ensureModelInitialized();

    try {
      const prompt = `
Bạn là copywriter chuyên nghiệp viết mô tả sản phẩm nội thất.

THÔNG TIN SẢN PHẨM:
- Tên: ${dto.productName}
${dto.category ? `- Danh mục: ${dto.category}` : ''}
${dto.material ? `- Chất liệu: ${dto.material}` : ''}
${dto.dimensions ? `- Kích thước: ${dto.dimensions}` : ''}
${dto.color ? `- Màu sắc: ${dto.color}` : ''}
${dto.features ? `- Đặc điểm: ${dto.features}` : ''}

YÊU CẦU:
Viết mô tả sản phẩm hấp dẫn với cấu trúc:
1. Giới thiệu tổng quan (2-3 câu)
2. Đặc điểm nổi bật (3-4 điểm, dùng bullet points)
3. Công dụng và lợi ích
4. Khuyến khích mua hàng (CTA)

Phong cách: Sang trọng, chuyên nghiệp, SEO-friendly
Độ dài: 150-250 từ
Ngôn ngữ: Tiếng Việt
`;

      return await this.callGeminiAPI(prompt);
    } catch (error) {
      this.logger.error('Error generating product description:', error);
      throw new BadRequestException('Không thể tạo mô tả sản phẩm. Vui lòng thử lại.');
    }
  }

  /**
   * Helper: Build product context cho prompt (simple version)
   */
  private buildSimpleProductContext(products: Product[]): string {
    if (!products || products.length === 0) {
      return 'Chưa có sản phẩm nào.';
    }

    return products
      .slice(0, 5)
      .map((p) => `- ${p.name} (${p.price.toLocaleString('vi-VN')} VNĐ)`)
      .join('\n');
  }

  /**
   * Helper: Build MINIMAL context - Tối ưu tối đa cho speed
   * Format: Tên|Giá|Mệnh|Hướng|Link_ảnh
   */
  private buildMinimalProductContext(products: Product[]): string {
    if (!products || products.length === 0) {
      return 'Không có sản phẩm.';
    }

    return products
      .map((p) => {
        const imageUrl = p.images && p.images.length > 0 ? p.images[0].imageUrl : 'N/A';
        return `${p.name}|${p.price}đ|${p.menh || 'N/A'}|${p.huong || 'N/A'}|${imageUrl}`;
      })
      .join('\n');
  }

  /**
   * Helper: Build compact context - Tối ưu cho speed
   */
  private buildCompactProductContext(products: Product[]): string {
    if (!products || products.length === 0) {
      return 'Không có sản phẩm.';
    }

    return products
      .map(
        (p, i) => {
          const imageUrl = p.images && p.images.length > 0 ? p.images[0].imageUrl : 'Chưa có ảnh';
          return `${i + 1}. ${p.name} (ID: ${p.id})
   Giá: ${p.price.toLocaleString('vi-VN')}đ | Mệnh: ${p.menh || 'N/A'} | Hướng: ${p.huong || 'N/A'}
   Danh mục: ${p.category?.name || 'Khác'}${p.color ? ` | Màu: ${p.color}` : ''}${p.material ? ` | Chất liệu: ${p.material}` : ''}
   Hình ảnh: ${imageUrl}`;
        },
      )
      .join('\n\n');
  }

  /**
   * Helper: Build product context cho prompt (basic info)
   */
  private buildProductContext(products: Product[]): string {
    if (!products || products.length === 0) {
      return 'Không tìm thấy sản phẩm phù hợp trong hệ thống.';
    }

    return products
      .map(
        (p, index) => `
${index + 1}. ${p.name}
   - Giá: ${p.price.toLocaleString('vi-VN')} VNĐ
   - Mệnh phù hợp: ${p.menh || 'Chưa cập nhật'}
   - Hướng phù hợp: ${p.huong || 'Chưa cập nhật'}
   - Danh mục: ${p.category?.name || 'Khác'}
`,
      )
      .join('\n');
  }

  /**
   * Helper: Build detailed product context
   */
  private buildDetailedProductContext(products: Product[]): string {
    if (!products || products.length === 0) {
      return 'Không tìm thấy sản phẩm phù hợp.';
    }

    return products
      .map(
        (p, index) => `
SẢN PHẨM ${index + 1}: ${p.name}
- ID: ${p.id}
- Giá: ${p.price.toLocaleString('vi-VN')} VNĐ
- Danh mục: ${p.category?.name || 'Khác'}
- Màu sắc: ${p.color || 'Không rõ'}
- Chất liệu: ${p.material || 'Không rõ'}
- Kích thước: ${p.width && p.height && p.depth ? `${p.width}x${p.height}x${p.depth} cm` : 'Không rõ'}
- Thương hiệu: ${p.brand || 'Không rõ'}
- Không gian phù hợp: ${p.space || 'Không rõ'}
- Mệnh phù hợp: ${p.menh || 'Chưa phân loại'}
- Hướng phù hợp: ${p.huong || 'Chưa phân loại'}
- Tồn kho: ${p.stock} sản phẩm
${p.description ? `- Mô tả: ${p.description.substring(0, 200)}...` : ''}
`,
      )
      .join('\n---\n');
  }

  /**
   * Check if API key is configured
   */
  private ensureModelInitialized(): void {
    if (!this.apiKey) {
      throw new BadRequestException(
        'AI service chưa được cấu hình. Vui lòng thêm GEMINI_API_KEY vào environment variables.',
      );
    }
  }
}
