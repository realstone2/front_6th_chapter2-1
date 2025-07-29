import {
  BUSINESS_RULES,
  DISCOUNT_RATES,
  PRODUCT_IDS,
} from '../../constants/index.ts';
import { Product } from '../product/productUtils.ts';

/**
 * 개별 상품 할인 계산
 * @param product 상품 정보
 * @param quantity 수량
 * @returns 할인율 (0-1)
 */
export const calculateIndividualDiscount = (
  product: Product,
  quantity: number
): number => {
  if (quantity < BUSINESS_RULES.INDIVIDUAL_DISCOUNT_THRESHOLD) {
    return 0;
  }

  switch (product.id) {
    case PRODUCT_IDS.KEYBOARD:
      return DISCOUNT_RATES.KEYBOARD;
    case PRODUCT_IDS.MOUSE:
      return DISCOUNT_RATES.MOUSE;
    case PRODUCT_IDS.MONITOR_ARM:
      return DISCOUNT_RATES.MONITOR_ARM;
    case PRODUCT_IDS.LAPTOP_CASE:
      return DISCOUNT_RATES.LAPTOP_CASE;
    case PRODUCT_IDS.SPEAKER:
      return DISCOUNT_RATES.SPEAKER;
    default:
      return 0;
  }
};

/**
 * 대량구매 할인 계산
 * @param totalQuantity 총 수량
 * @returns 할인율 (0-1)
 */
export const calculateBulkDiscount = (totalQuantity: number): number => {
  return totalQuantity >= BUSINESS_RULES.BULK_PURCHASE_THRESHOLD ? 0.25 : 0;
};

/**
 * 화요일 특별 할인 계산
 * @param isTuesday 화요일 여부
 * @returns 할인율 (0-1)
 */
export const calculateTuesdayDiscount = (isTuesday: boolean): number => {
  return isTuesday ? BUSINESS_RULES.TUESDAY_SPECIAL_DISCOUNT : 0;
};

/**
 * 번개세일 할인 적용
 * @param product 상품 정보
 * @returns 할인이 적용된 상품
 */
export const applyLightningSale = (product: Product): Product => ({
  ...product,
  val: Math.round((product.originalVal * 80) / 100),
  onSale: true,
});

/**
 * 추천할인 적용
 * @param product 상품 정보
 * @returns 할인이 적용된 상품
 */
export const applySuggestedSale = (product: Product): Product => ({
  ...product,
  val: Math.round((product.val * 95) / 100),
  suggestSale: true,
});

/**
 * 할인 해제
 * @param product 상품 정보
 * @returns 할인이 해제된 상품
 */
export const removeDiscounts = (product: Product): Product => ({
  ...product,
  val: product.originalVal,
  onSale: false,
  suggestSale: false,
});

/**
 * 총 할인율 계산 (개별 + 대량 + 화요일)
 * @param individualDiscount 개별 할인율
 * @param bulkDiscount 대량구매 할인율
 * @param tuesdayDiscount 화요일 할인율
 * @returns 총 할인율 (최대 1.0)
 */
export const calculateTotalDiscount = (
  individualDiscount: number,
  bulkDiscount: number,
  tuesdayDiscount: number
): number => {
  // 대량구매 할인이 있으면 개별 할인 무시
  const baseDiscount = bulkDiscount > 0 ? bulkDiscount : individualDiscount;

  // 화요일 할인은 다른 할인과 중복 적용
  const totalDiscount = baseDiscount + tuesdayDiscount;

  // 최대 100% 할인까지만
  return Math.min(totalDiscount, 1.0);
};

/**
 * 할인 정보 객체 생성
 */
export interface DiscountInfo {
  individualDiscount: number;
  bulkDiscount: number;
  tuesdayDiscount: number;
  totalDiscount: number;
  savedAmount: number;
  originalTotal: number;
  finalTotal: number;
}

/**
 * 상품별 할인 정보 계산
 * @param products 상품 목록
 * @param quantities 수량 정보 (상품ID -> 수량)
 * @param isTuesday 화요일 여부
 * @returns 할인 정보
 */
export const calculateDiscountInfo = (
  products: Product[],
  quantities: Record<string, number>,
  isTuesday: boolean
): DiscountInfo => {
  let originalTotal = 0;
  let individualDiscountTotal = 0;
  let totalQuantity = 0;

  // 각 상품별 계산
  products.forEach(product => {
    const quantity = quantities[product.id] || 0;
    const itemTotal = product.val * quantity;
    originalTotal += itemTotal;
    totalQuantity += quantity;

    const individualDiscount = calculateIndividualDiscount(product, quantity);
    individualDiscountTotal += itemTotal * individualDiscount;
  });

  const bulkDiscount = calculateBulkDiscount(totalQuantity);
  const tuesdayDiscount = calculateTuesdayDiscount(isTuesday);

  // 대량구매 할인이 있으면 개별 할인 무시
  const effectiveIndividualDiscount =
    bulkDiscount > 0 ? 0 : individualDiscountTotal / originalTotal;

  const totalDiscount = calculateTotalDiscount(
    effectiveIndividualDiscount,
    bulkDiscount,
    tuesdayDiscount
  );

  const finalTotal = originalTotal * (1 - totalDiscount);
  const savedAmount = originalTotal - finalTotal;

  return {
    individualDiscount: effectiveIndividualDiscount,
    bulkDiscount,
    tuesdayDiscount,
    totalDiscount,
    savedAmount,
    originalTotal,
    finalTotal,
  };
};
