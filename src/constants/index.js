// 상품 ID 상수
export const PRODUCT_IDS = {
  KEYBOARD: 'p1',
  MOUSE: 'p2',
  MONITOR_ARM: 'p3',
  LAPTOP_POUCH: 'p4',
  SPEAKER: 'p5',
};

// 할인율 상수
export const DISCOUNT_RATES = {
  // 대량구매 할인
  BULK_30_PLUS: 0.25,

  // 특별 할인
  TUESDAY_SPECIAL: 0.1,
  LIGHTNING_SALE: 0.2,
  RECOMMENDED_SALE: 0.05,

  // 개별 상품 할인 (10개 이상 구매 시)
  INDIVIDUAL: {
    [PRODUCT_IDS.KEYBOARD]: 0.1, // 키보드 10%
    [PRODUCT_IDS.MOUSE]: 0.15, // 마우스 15%
    [PRODUCT_IDS.MONITOR_ARM]: 0.2, // 모니터암 20%
    [PRODUCT_IDS.LAPTOP_POUCH]: 0.05, // 노트북 파우치 5%
    [PRODUCT_IDS.SPEAKER]: 0.25, // 스피커 25%
  },
};

// 재고 임계값 상수
export const STOCK_THRESHOLDS = {
  LOW_STOCK: 5, // 재고 부족 기준
  OUT_OF_STOCK: 0, // 품절 기준
  TOTAL_LOW_STOCK: 50, // 전체 재고 부족 기준 (드롭다운 색상 변경)
};

// 수량 기준 상수
export const QUANTITY_THRESHOLDS = {
  INDIVIDUAL_DISCOUNT: 10, // 개별 할인 적용 기준
  BULK_DISCOUNT: 30, // 대량구매 할인 적용 기준
  BONUS_POINTS_TIER_1: 10, // 보너스 포인트 1단계
  BONUS_POINTS_TIER_2: 20, // 보너스 포인트 2단계
  BONUS_POINTS_TIER_3: 30, // 보너스 포인트 3단계
};

// 포인트 관련 상수
export const POINTS = {
  BASE_RATE: 0.001, // 기본 적립율 (0.1%)
  TUESDAY_MULTIPLIER: 2, // 화요일 배수
  COMBO_KEYBOARD_MOUSE: 50, // 키보드+마우스 세트 보너스
  FULL_SET_BONUS: 100, // 풀세트 보너스
  BULK_BONUS: {
    TIER_1: 20, // 10개 이상
    TIER_2: 50, // 20개 이상
    TIER_3: 100, // 30개 이상
  },
};

// 타이밍 관련 상수
export const TIMING = {
  LIGHTNING_SALE_INTERVAL: 30000, // 번개세일 간격 (30초)
  RECOMMENDED_SALE_INTERVAL: 60000, // 추천할인 간격 (60초)
  LIGHTNING_SALE_DELAY: 10000, // 번개세일 시작 지연 (최대 10초)
  RECOMMENDED_SALE_DELAY: 20000, // 추천할인 시작 지연 (최대 20초)
};

// 요일 상수
export const DAYS = {
  TUESDAY: 2,
};

// 상품 초기 데이터
export const INITIAL_PRODUCTS = [
  {
    id: PRODUCT_IDS.KEYBOARD,
    name: '버그 없애는 키보드',
    price: 10000,
    originalPrice: 10000,
    stock: 50,
    onSale: false,
    suggestSale: false,
  },
  {
    id: PRODUCT_IDS.MOUSE,
    name: '생산성 폭발 마우스',
    price: 20000,
    originalPrice: 20000,
    stock: 30,
    onSale: false,
    suggestSale: false,
  },
  {
    id: PRODUCT_IDS.MONITOR_ARM,
    name: '거북목 탈출 모니터암',
    price: 30000,
    originalPrice: 30000,
    stock: 20,
    onSale: false,
    suggestSale: false,
  },
  {
    id: PRODUCT_IDS.LAPTOP_POUCH,
    name: '에러 방지 노트북 파우치',
    price: 15000,
    originalPrice: 15000,
    stock: 0,
    onSale: false,
    suggestSale: false,
  },
  {
    id: PRODUCT_IDS.SPEAKER,
    name: '코딩할 때 듣는 Lo-Fi 스피커',
    price: 25000,
    originalPrice: 25000,
    stock: 10,
    onSale: false,
    suggestSale: false,
  },
];

// CSS 클래스 상수
export const CSS_CLASSES = {
  SALE_COLORS: {
    LIGHTNING: 'text-red-500',
    RECOMMENDED: 'text-blue-500',
    SUPER_SALE: 'text-purple-600',
  },
  ICONS: {
    LIGHTNING: '⚡',
    RECOMMENDED: '💝',
    SUPER_SALE: '⚡💝',
  },
};
