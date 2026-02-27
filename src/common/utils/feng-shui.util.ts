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

// ──────────────────────────────────────────────────────────────
// CAN CHI & NẠP ÂM – 60-year cycle starting from Giáp Tý (1924)
// ──────────────────────────────────────────────────────────────

const CAN = ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'];
const CHI = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];

/** 60 Nạp âm entries indexed from position 0 (Giáp Tý = 1924) */
const NAP_AM_60: { name: string; element: FengShuiElement }[] = [
  { name: 'Hải Trung Kim',    element: FengShuiElement.KIM  }, // 0  Giáp Tý
  { name: 'Hải Trung Kim',    element: FengShuiElement.KIM  }, // 1  Ất Sửu
  { name: 'Lư Trung Hỏa',    element: FengShuiElement.HOA  }, // 2  Bính Dần
  { name: 'Lư Trung Hỏa',    element: FengShuiElement.HOA  }, // 3  Đinh Mão
  { name: 'Đại Lâm Mộc',     element: FengShuiElement.MOC  }, // 4  Mậu Thìn
  { name: 'Đại Lâm Mộc',     element: FengShuiElement.MOC  }, // 5  Kỷ Tỵ
  { name: 'Lộ Bàng Thổ',     element: FengShuiElement.THO  }, // 6  Canh Ngọ
  { name: 'Lộ Bàng Thổ',     element: FengShuiElement.THO  }, // 7  Tân Mùi
  { name: 'Kiếm Phong Kim',   element: FengShuiElement.KIM  }, // 8  Nhâm Thân
  { name: 'Kiếm Phong Kim',   element: FengShuiElement.KIM  }, // 9  Quý Dậu
  { name: 'Sơn Đầu Hỏa',     element: FengShuiElement.HOA  }, // 10 Giáp Tuất
  { name: 'Sơn Đầu Hỏa',     element: FengShuiElement.HOA  }, // 11 Ất Hợi
  { name: 'Giản Hạ Thủy',    element: FengShuiElement.THUY }, // 12 Bính Tý
  { name: 'Giản Hạ Thủy',    element: FengShuiElement.THUY }, // 13 Đinh Sửu
  { name: 'Thành Đầu Thổ',   element: FengShuiElement.THO  }, // 14 Mậu Dần
  { name: 'Thành Đầu Thổ',   element: FengShuiElement.THO  }, // 15 Kỷ Mão
  { name: 'Bạch Lạp Kim',    element: FengShuiElement.KIM  }, // 16 Canh Thìn
  { name: 'Bạch Lạp Kim',    element: FengShuiElement.KIM  }, // 17 Tân Tỵ
  { name: 'Dương Liễu Mộc',  element: FengShuiElement.MOC  }, // 18 Nhâm Ngọ
  { name: 'Dương Liễu Mộc',  element: FengShuiElement.MOC  }, // 19 Quý Mùi
  { name: 'Tuyền Trung Thủy',element: FengShuiElement.THUY }, // 20 Giáp Thân
  { name: 'Tuyền Trung Thủy',element: FengShuiElement.THUY }, // 21 Ất Dậu
  { name: 'Ốc Thượng Thổ',   element: FengShuiElement.THO  }, // 22 Bính Tuất
  { name: 'Ốc Thượng Thổ',   element: FengShuiElement.THO  }, // 23 Đinh Hợi
  { name: 'Tích Lịch Hỏa',   element: FengShuiElement.HOA  }, // 24 Mậu Tý
  { name: 'Tích Lịch Hỏa',   element: FengShuiElement.HOA  }, // 25 Kỷ Sửu
  { name: 'Tùng Bách Mộc',   element: FengShuiElement.MOC  }, // 26 Canh Dần
  { name: 'Tùng Bách Mộc',   element: FengShuiElement.MOC  }, // 27 Tân Mão
  { name: 'Trường Lưu Thủy', element: FengShuiElement.THUY }, // 28 Nhâm Thìn
  { name: 'Trường Lưu Thủy', element: FengShuiElement.THUY }, // 29 Quý Tỵ
  { name: 'Sa Trung Kim',     element: FengShuiElement.KIM  }, // 30 Giáp Ngọ
  { name: 'Sa Trung Kim',     element: FengShuiElement.KIM  }, // 31 Ất Mùi
  { name: 'Sơn Hạ Hỏa',      element: FengShuiElement.HOA  }, // 32 Bính Thân
  { name: 'Sơn Hạ Hỏa',      element: FengShuiElement.HOA  }, // 33 Đinh Dậu
  { name: 'Bình Địa Mộc',    element: FengShuiElement.MOC  }, // 34 Mậu Tuất
  { name: 'Bình Địa Mộc',    element: FengShuiElement.MOC  }, // 35 Kỷ Hợi
  { name: 'Bích Thượng Thổ', element: FengShuiElement.THO  }, // 36 Canh Tý
  { name: 'Bích Thượng Thổ', element: FengShuiElement.THO  }, // 37 Tân Sửu
  { name: 'Kim Bạch Kim',     element: FengShuiElement.KIM  }, // 38 Nhâm Dần
  { name: 'Kim Bạch Kim',     element: FengShuiElement.KIM  }, // 39 Quý Mão
  { name: 'Phúc Đăng Hỏa',   element: FengShuiElement.HOA  }, // 40 Giáp Thìn
  { name: 'Phúc Đăng Hỏa',   element: FengShuiElement.HOA  }, // 41 Ất Tỵ
  { name: 'Thiên Hà Thủy',   element: FengShuiElement.THUY }, // 42 Bính Ngọ
  { name: 'Thiên Hà Thủy',   element: FengShuiElement.THUY }, // 43 Đinh Mùi
  { name: 'Đại Trạch Thổ',   element: FengShuiElement.THO  }, // 44 Mậu Thân
  { name: 'Đại Trạch Thổ',   element: FengShuiElement.THO  }, // 45 Kỷ Dậu
  { name: 'Thoa Xuyến Kim',  element: FengShuiElement.KIM  }, // 46 Canh Tuất
  { name: 'Thoa Xuyến Kim',  element: FengShuiElement.KIM  }, // 47 Tân Hợi
  { name: 'Tang Đố Mộc',     element: FengShuiElement.MOC  }, // 48 Nhâm Tý
  { name: 'Tang Đố Mộc',     element: FengShuiElement.MOC  }, // 49 Quý Sửu
  { name: 'Đại Khê Thủy',    element: FengShuiElement.THUY }, // 50 Giáp Dần
  { name: 'Đại Khê Thủy',    element: FengShuiElement.THUY }, // 51 Ất Mão
  { name: 'Sa Trung Thổ',    element: FengShuiElement.THO  }, // 52 Bính Thìn
  { name: 'Sa Trung Thổ',    element: FengShuiElement.THO  }, // 53 Đinh Tỵ
  { name: 'Thiên Thượng Hỏa',element: FengShuiElement.HOA  }, // 54 Mậu Ngọ
  { name: 'Thiên Thượng Hỏa',element: FengShuiElement.HOA  }, // 55 Kỷ Mùi
  { name: 'Thạch Lựu Mộc',   element: FengShuiElement.MOC  }, // 56 Canh Thân
  { name: 'Thạch Lựu Mộc',   element: FengShuiElement.MOC  }, // 57 Tân Dậu
  { name: 'Đại Hải Thủy',    element: FengShuiElement.THUY }, // 58 Nhâm Tuất
  { name: 'Đại Hải Thủy',    element: FengShuiElement.THUY }, // 59 Quý Hợi
];

/** Lạc thư number → Cung name */
const CUNG_NAMES: Record<number, string> = {
  1: 'Khảm', 2: 'Khôn', 3: 'Chấn', 4: 'Tốn',
  6: 'Càn',  7: 'Đoài', 8: 'Cấn',  9: 'Ly',
};

/** Đông/Tây tứ mệnh lookup */
const EAST_CUNG = new Set(['Khảm', 'Ly', 'Chấn', 'Tốn']);

// ──────────────────────────────────────────────────────────────
// Public helper exports
// ──────────────────────────────────────────────────────────────

/** Return Can Chi string for a year, e.g. 1990 → 'Canh Ngọ' */
export function getCanChi(year: number): string {
  const canIdx = ((year - 4) % 10 + 10) % 10;
  const chiIdx = ((year - 4) % 12 + 12) % 12;
  return `${CAN[canIdx]} ${CHI[chiIdx]}`;
}

/** Return Nạp âm for a year using the verified 60-year cycle table */
export function getNapAm(year: number): { name: string; element: FengShuiElement } {
  const pos = ((year - 1924) % 60 + 60) % 60;
  return NAP_AM_60[pos];
}

/**
 * Calculate Cung mệnh (Bát trạch) using verified anchor formula.
 * Nam:  cycle descends 9→8→7→6→5(Khôn)→4→3→2→1→9 … anchor: 1990=Khảm(1)
 * Nữ:   cycle ascends 1→2→3→4→5(Cấn)→6→7→8→9→1 … anchor: 1990=Cấn(8)
 */
export function getCungMenh(year: number, gender: 'Nam' | 'Nữ' = 'Nam'): string {
  if (gender === 'Nam') {
    const raw = ((1990 - year) % 9 + 9) % 9; // always 0-8
    const num = raw + 1;                       // 1-9
    if (num === 5) return 'Khôn';              // male centre → Khôn
    return CUNG_NAMES[num] ?? 'Khôn';
  } else {
    const raw = ((year - 1990) % 9 + 9) % 9;
    const num = raw + 8;                       // shift so 1990→8 (Cấn)
    const adjusted = ((num - 1) % 9) + 1;     // keep in 1-9
    if (adjusted === 5) return 'Cấn';         // female centre → Cấn
    return CUNG_NAMES[adjusted] ?? 'Cấn';
  }
}

/** Đông/Tây tứ mệnh for a given Cung name */
export function getEastWestGroup(cung: string): string {
  return EAST_CUNG.has(cung) ? 'Đông tứ mệnh' : 'Tây tứ mệnh';
}

// ──────────────────────────────────────────────────────────────

interface FengShuiProfile {
  element: FengShuiElement;
  canChi: string;                         // e.g. 'Canh Ngọ'
  napAm: string;                          // e.g. 'Lộ Bàng Thổ'
  cungMenh: string;                       // e.g. 'Khảm'
  group: string;                          // 'Đông tứ mệnh' | 'Tây tứ mệnh'
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
 * Tính mệnh Ngũ Hành theo năm sinh (dùng bảng Nạp Âm 60 năm chính xác)
 */
export function calculateElementByYear(year: number): FengShuiElement {
  return getNapAm(year).element;
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
 * Tạo profile phong thủy đầy đủ từ năm sinh và giới tính
 */
export function createFengShuiProfile(
  birthYear: number,
  currentYear: number = new Date().getFullYear(),
  gender: 'Nam' | 'Nữ' = 'Nam',
): FengShuiProfile {
  const napAmData = getNapAm(birthYear);
  const element = napAmData.element;
  const canChi = getCanChi(birthYear);
  const napAm = napAmData.name;
  const cungMenh = getCungMenh(birthYear, gender);
  const group = getEastWestGroup(cungMenh);
  const age = currentYear - birthYear;
  const ageGroup = getAgeGroup(age);
  const ageRecommendations = getAgeRecommendations(age);
  const elementDetails = getElementDetails(element);

  return {
    ...elementDetails,
    canChi,
    napAm,
    cungMenh,
    group,
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
 * Format profile thành text cho AI (bao gồm đầy đủ Can Chi, Nạp âm, Cung mệnh, nhóm)
 */
export function formatFengShuiProfileForAI(profile: FengShuiProfile): string {
  return `
THÔNG TIN PHONG THỦY CHI TIẾT (Bát Trạch):
- Can Chi: ${profile.canChi}
- Ngũ hành bản mệnh: ${profile.element}
- Nạp âm (niên mệnh): ${profile.napAm}
- Cung mệnh (Bát trạch): ${profile.cungMenh}
- Nhóm: ${profile.group}
- Độ tuổi: ${profile.ageGroup}

MÀU SẮC:
- Màu hợp: ${profile.luckyColors.join(', ')}
- Màu kiêng: ${profile.unluckyColors.join(', ')}

HƯỚNG TỐT: ${profile.luckyDirections.join(', ')}

MỆNH TƯƠNG SINH: ${profile.compatibleElements.join(', ')}

GỢI Ý THEO MỆNH:
${profile.recommendations.map((r) => `- ${r}`).join('\n')}

GỢI Ý THEO ĐỘ TUỔI:
${profile.ageRecommendations.map((r) => `- ${r}`).join('\n')}
`;
}
