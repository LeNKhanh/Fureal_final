/**
 * File: src/common/utils/feng-shui.util.ts
 * Purpose: Utility functions for Feng Shui calculations based on birth date and age
 */

export enum FengShuiElement {
  KIM = 'Kim',
  MOC = 'Mộc',
  THUY = 'Thủy',
  HOA = 'Hỏa',
  THO = 'Thổ',
}

export enum Direction {
  DONG = 'Đông',
  TAY = 'Tây',
  NAM = 'Nam',
  BAC = 'Bắc',
  DONG_BAC = 'Đông Bắc',
  DONG_NAM = 'Đông Nam',
  TAY_BAC = 'Tây Bắc',
  TAY_NAM = 'Tây Nam',
}

interface FengShuiProfile {
  element: FengShuiElement;
  luckyColors: string[];
  unluckyColors: string[];
  luckyDirections: Direction[];
  compatibleElements: FengShuiElement[];
  incompatibleElements: FengShuiElement[];
  recommendations: string[];
  ageGroup: string;
  ageRecommendations: string[];
}

/**
 * Tính mệnh Ngũ Hành theo năm sinh (Âm Lịch Nạp Âm)
 * Based on 60-year cycle (Can Chi)
 */
export function calculateElementByYear(year: number): FengShuiElement {
  const napAmTable: { [key: number]: FengShuiElement } = {
    0: FengShuiElement.KIM,
    1: FengShuiElement.KIM,
    2: FengShuiElement.THUY,
    3: FengShuiElement.THUY,
    4: FengShuiElement.HOA,
    5: FengShuiElement.HOA,
    6: FengShuiElement.THO,
    7: FengShuiElement.THO,
    8: FengShuiElement.MOC,
    9: FengShuiElement.MOC,
  };

  const lastDigit = year % 10;
  return napAmTable[lastDigit];
}

/**
 * Lấy nhóm tuổi
 */
function getAgeGroup(age: number): string {
  if (age < 25) return 'Thanh niên';
  if (age < 40) return 'Trưởng thành';
  if (age < 60) return 'Trung niên';
  return 'Cao niên';
}

/**
 * Lấy gợi ý theo độ tuổi
 */
function getAgeRecommendations(age: number): string[] {
  if (age < 25) {
    return [
      'Nên chọn nội thất màu sắc tươi sáng, trẻ trung',
      'Ưu tiên không gian học tập, làm việc',
      'Thiết kế phòng ngủ đơn giản, thoáng đãng',
      'Bàn làm việc nên đặt hướng tốt để tập trung',
    ];
  }
  if (age < 40) {
    return [
      'Cân bằng giữa không gian làm việc và nghỉ ngơi',
      'Nội thất phòng khách hợp phong thủy để đón tài lộc',
      'Phòng ngủ ấm cúng, hỗ trợ sức khỏe và hôn nhân',
      'Khu vực làm việc tại nhà nên bố trí hợp lý',
    ];
  }
  if (age < 60) {
    return [
      'Ưu tiên sức khỏe: giường ngủ hướng tốt, thoáng mát',
      'Không gian yên tĩnh để thư giãn',
      'Nội thất chất lượng cao, bền vững',
      'Bố trí phòng thờ, bàn thờ hợp phong thủy',
    ];
  }
  return [
    'Không gian thoáng đãng, dễ di chuyển',
    'Giường ngủ cao cấp, tốt cho sức khỏe',
    'Ghế nghỉ thoải mái, ergonomic',
    'Ánh sáng đầy đủ, tự nhiên',
  ];
}

/**
 * Lấy thông tin chi tiết về mệnh Ngũ Hành
 */
function getElementDetails(element: FengShuiElement): Omit<FengShuiProfile, 'ageGroup' | 'ageRecommendations'> {
  const details: Record<FengShuiElement, Omit<FengShuiProfile, 'ageGroup' | 'ageRecommendations'>> = {
    [FengShuiElement.KIM]: {
      element: FengShuiElement.KIM,
      luckyColors: ['Trắng', 'Vàng kim', 'Bạc', 'Nâu nhạt'],
      unluckyColors: ['Đỏ', 'Hồng', 'Tím', 'Cam'],
      luckyDirections: [Direction.TAY, Direction.TAY_BAC, Direction.TAY_NAM],
      compatibleElements: [FengShuiElement.THO, FengShuiElement.THUY],
      incompatibleElements: [FengShuiElement.HOA, FengShuiElement.MOC],
      recommendations: [
        'Nên chọn nội thất màu trắng, vàng kim, bạc',
        'Ưu tiên chất liệu kim loại, gỗ sơn màu nhạt',
        'Đặt đồ nội thất hướng Tây, Tây Bắc',
        'Tránh màu đỏ, cam trong phòng chính',
        'Kết hợp với mệnh Thổ (màu vàng đất) để tăng cường',
      ],
    },
    [FengShuiElement.MOC]: {
      element: FengShuiElement.MOC,
      luckyColors: ['Xanh lá', 'Xanh lục', 'Nâu gỗ', 'Be'],
      unluckyColors: ['Trắng', 'Vàng kim', 'Bạc'],
      luckyDirections: [Direction.DONG, Direction.DONG_NAM, Direction.DONG_BAC],
      compatibleElements: [FengShuiElement.THUY, FengShuiElement.HOA],
      incompatibleElements: [FengShuiElement.KIM, FengShuiElement.THO],
      recommendations: [
        'Ưu tiên nội thất gỗ tự nhiên màu nâu, be',
        'Sử dụng màu xanh lá cây trong trang trí',
        'Đặt cây xanh trong phòng để tăng sinh khí',
        'Hướng Đông, Đông Nam là hướng tốt',
        'Tránh quá nhiều kim loại trắng bạc',
      ],
    },
    [FengShuiElement.THUY]: {
      element: FengShuiElement.THUY,
      luckyColors: ['Xanh dương', 'Đen', 'Xám đậm', 'Trắng'],
      unluckyColors: ['Vàng đất', 'Nâu đất', 'Cam đất'],
      luckyDirections: [Direction.BAC, Direction.DONG, Direction.DONG_NAM],
      compatibleElements: [FengShuiElement.KIM, FengShuiElement.MOC],
      incompatibleElements: [FengShuiElement.THO, FengShuiElement.HOA],
      recommendations: [
        'Chọn nội thất màu xanh dương, đen, trắng',
        'Đặt bể cá, tranh nước trong nhà',
        'Hướng Bắc là hướng tốt nhất',
        'Tránh màu vàng đất, nâu đất',
        'Kết hợp Kim sinh Thủy (màu trắng, bạc)',
      ],
    },
    [FengShuiElement.HOA]: {
      element: FengShuiElement.HOA,
      luckyColors: ['Đỏ', 'Tím', 'Hồng', 'Cam', 'Xanh lá'],
      unluckyColors: ['Đen', 'Xanh dương đậm', 'Xám'],
      luckyDirections: [Direction.NAM, Direction.DONG, Direction.DONG_NAM],
      compatibleElements: [FengShuiElement.MOC, FengShuiElement.THO],
      incompatibleElements: [FengShuiElement.THUY, FengShuiElement.KIM],
      recommendations: [
        'Sử dụng màu đỏ, tím, cam trong trang trí',
        'Nội thất gỗ tự nhiên màu ấm',
        'Đặt đồ nội thất hướng Nam',
        'Tránh màu đen, xanh dương đậm',
        'Thêm cây xanh (Mộc sinh Hỏa) để tăng vượng',
      ],
    },
    [FengShuiElement.THO]: {
      element: FengShuiElement.THO,
      luckyColors: ['Vàng đất', 'Nâu đất', 'Be', 'Đỏ gạch'],
      unluckyColors: ['Xanh lá', 'Xanh lục'],
      luckyDirections: [Direction.TAY_NAM, Direction.DONG_BAC, Direction.NAM],
      compatibleElements: [FengShuiElement.HOA, FengShuiElement.KIM],
      incompatibleElements: [FengShuiElement.MOC, FengShuiElement.THUY],
      recommendations: [
        'Chọn nội thất màu vàng đất, nâu, be',
        'Ưu tiên đồ gốm, sứ, đá tự nhiên',
        'Hướng Tây Nam, Đông Bắc là tốt',
        'Tránh màu xanh lá cây đậm',
        'Kết hợp màu đỏ (Hỏa sinh Thổ)',
      ],
    },
  };

  return details[element];
}

/**
 * Tạo profile phong thủy đầy đủ từ năm sinh
 */
export function createFengShuiProfile(birthYear: number, currentYear: number = new Date().getFullYear()): FengShuiProfile {
  const element = calculateElementByYear(birthYear);
  const age = currentYear - birthYear;
  const ageGroup = getAgeGroup(age);
  const ageRecommendations = getAgeRecommendations(age);
  const elementDetails = getElementDetails(element);

  return {
    ...elementDetails,
    ageGroup,
    ageRecommendations,
  };
}

/**
 * Parse ngày sinh từ text (hỗ trợ nhiều format)
 */
export function parseBirthDate(text: string): { year: number; month?: number; day?: number } | null {
  // Format: năm sinh YYYY, sinh năm YYYY, YYYY
  const yearOnlyMatch = text.match(/(?:năm sinh|sinh năm|năm)\s*(\d{4})|^(\d{4})$/i);
  if (yearOnlyMatch) {
    return { year: parseInt(yearOnlyMatch[1] || yearOnlyMatch[2]) };
  }

  // Format: DD/MM/YYYY, DD-MM-YYYY
  const fullDateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (fullDateMatch) {
    return {
      day: parseInt(fullDateMatch[1]),
      month: parseInt(fullDateMatch[2]),
      year: parseInt(fullDateMatch[3]),
    };
  }

  // Format: YYYY/MM/DD, YYYY-MM-DD
  const isoDateMatch = text.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (isoDateMatch) {
    return {
      year: parseInt(isoDateMatch[1]),
      month: parseInt(isoDateMatch[2]),
      day: parseInt(isoDateMatch[3]),
    };
  }

  return null;
}

/**
 * Format profile thành text cho AI
 */
export function formatFengShuiProfileForAI(profile: FengShuiProfile): string {
  return `
THÔNG TIN PHONG THỦY:
- Mệnh: ${profile.element}
- Độ tuổi: ${profile.ageGroup}

MÀU SẮC:
✓ Màu hợp: ${profile.luckyColors.join(', ')}
✗ Màu kiêng: ${profile.unluckyColors.join(', ')}

HƯỚNG TốT: ${profile.luckyDirections.join(', ')}

MỆNH TƯƠNG SINH: ${profile.compatibleElements.join(', ')}

GỢI Ý THEO MỆNH:
${profile.recommendations.map((r) => `- ${r}`).join('\n')}

GỢI Ý THEO ĐỘ TUỔI:
${profile.ageRecommendations.map((r) => `- ${r}`).join('\n')}
`;
}
