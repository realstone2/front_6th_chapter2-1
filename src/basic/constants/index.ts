/**
 * ========================================
 * 상수 정의 (Constants)
 * ========================================
 */

/**
 * 상품 ID 상수들
 * 각 상품의 고유 식별자를 정의합니다.
 */
export const PRODUCT_IDS = {
  KEYBOARD: 'p1',
  MOUSE: 'p2',
  MONITOR_ARM: 'p3',
  LAPTOP_CASE: 'p4',
  SPEAKER: 'p5',
} as const;

/**
 * 할인율 상수들
 * 각 상품별 개별 할인율을 정의합니다.
 * 10개 이상 구매 시 적용되는 할인율입니다.
 */
export const DISCOUNT_RATES = {
  KEYBOARD: 0.1, // 10%
  MOUSE: 0.15, // 15%
  MONITOR_ARM: 0.2, // 20%
  LAPTOP_CASE: 0.05, // 5%
  SPEAKER: 0.25, // 25%
} as const;

/**
 * 비즈니스 규칙 상수들
 * 애플리케이션의 핵심 비즈니스 로직을 정의합니다.
 */
export const BUSINESS_RULES = {
  BULK_PURCHASE_THRESHOLD: 30, // 대량구매 기준 수량
  INDIVIDUAL_DISCOUNT_THRESHOLD: 10, // 개별 상품 할인 시작 수량
  LOW_STOCK_THRESHOLD: 5, // 재고 부족 기준
  POINTS_PER_1000_WON: 1, // 1000원당 적립 포인트
  TUESDAY_DAY_OF_WEEK: 2, // 화요일 (0=일요일, 1=월요일, ...)
  LIGHTNING_SALE_DISCOUNT: 0.2, // 번개세일 할인율 (20%)
  SUGGESTED_SALE_DISCOUNT: 0.05, // 추천할인 할인율 (5%)
  TUESDAY_SPECIAL_DISCOUNT: 0.1, // 화요일 특별 할인율 (10%)
} as const;

/**
 * 타이머 상수들
 * 자동 할인 이벤트의 타이밍을 정의합니다.
 */
export const TIMER_INTERVALS = {
  LIGHTNING_SALE_DELAY: 10000, // 번개세일 시작 지연시간 (10초)
  LIGHTNING_SALE_INTERVAL: 30000, // 번개세일 반복 간격 (30초)
  SUGGESTED_SALE_DELAY: 20000, // 추천할인 시작 지연시간 (20초)
  SUGGESTED_SALE_INTERVAL: 60000, // 추천할인 반복 간격 (60초)
} as const;
