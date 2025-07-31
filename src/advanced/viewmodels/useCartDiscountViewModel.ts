/**
 * ========================================
 * Cart Discount ViewModel (MVVM - ViewModel)
 * ========================================
 *
 * 장바구니 할인 계산 로직을 담당하는 ViewModel입니다.
 * 기존 src/basic/features/cart/discountUtils.ts의 로직을 React 훅으로 변환합니다.
 */

import { useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { CartItemModel } from '../features/cart/model/CartModel';
import { ProductModel } from '../features/product/model/ProductModel';

// 비즈니스 룰 상수들 (기존 constants와 동일)
const BUSINESS_RULES = {
  INDIVIDUAL_DISCOUNT_THRESHOLD: 10,
  BULK_PURCHASE_THRESHOLD: 30,
  TUESDAY_SPECIAL_DISCOUNT: 0.1,
};

const DISCOUNT_RATES = {
  KEYBOARD: 0.1, // 10%
  MOUSE: 0.15, // 15%
  MONITOR_ARM: 0.2, // 20%
  LAPTOP_CASE: 0, // 0% (할인 없음)
  SPEAKER: 0.25, // 25%
};

const PRODUCT_IDS = {
  KEYBOARD: 'p1',
  MOUSE: 'p2',
  MONITOR_ARM: 'p3',
  LAPTOP_CASE: 'p4',
  SPEAKER: 'p5',
};

/**
 * 장바구니 할인 계산 ViewModel 훅
 *
 * 기존 discountUtils.ts의 함수들을 React 훅으로 제공합니다.
 */
export const useCartDiscountViewModel = () => {
  /**
   * 개별 상품 할인 계산
   * 기존 calculateIndividualDiscount 함수와 동일한 로직
   */
  const calculateIndividualDiscount = useCallback(
    (product: ProductModel, quantity: number): number => {
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
    },
    []
  );

  /**
   * 대량구매 할인 계산
   * 기존 calculateBulkDiscount 함수와 동일한 로직
   */
  const calculateBulkDiscount = useCallback((totalQuantity: number): number => {
    return totalQuantity >= BUSINESS_RULES.BULK_PURCHASE_THRESHOLD ? 0.25 : 0;
  }, []);

  /**
   * 화요일 특별 할인 계산
   * 기존 calculateTuesdayDiscount 함수와 동일한 로직
   */
  const calculateTuesdayDiscount = useCallback((isTuesday: boolean): number => {
    return isTuesday ? BUSINESS_RULES.TUESDAY_SPECIAL_DISCOUNT : 0;
  }, []);

  /**
   * 번개세일 할인 적용
   * 기존 applyLightningSale 함수와 동일한 로직
   */
  const applyLightningSale = useCallback(
    (product: ProductModel): ProductModel => ({
      ...product,
      val: Math.round((product.originalVal * 80) / 100),
      onSale: true,
    }),
    []
  );

  /**
   * 추천할인 적용
   * 기존 applySuggestedSale 함수와 동일한 로직
   */
  const applySuggestedSale = useCallback(
    (product: ProductModel): ProductModel => ({
      ...product,
      val: Math.round((product.val * 95) / 100),
      suggestSale: true,
    }),
    []
  );

  /**
   * 할인 해제
   * 기존 removeSale 함수와 동일한 로직
   */
  const removeSale = useCallback(
    (product: ProductModel): ProductModel => ({
      ...product,
      val: product.originalVal,
      onSale: false,
      suggestSale: false,
    }),
    []
  );

  /**
   * 장바구니 아이템별 할인 계산
   * 개별 할인과 대량구매 할인 중 더 유리한 것을 선택
   */
  const calculateItemDiscount = useCallback(
    (
      item: CartItemModel,
      totalQuantity: number
    ): {
      discountRate: number;
      discountAmount: number;
      discountType: string;
    } => {
      const individualDiscountRate = calculateIndividualDiscount(
        item.product,
        item.quantity
      );
      const bulkDiscountRate = calculateBulkDiscount(totalQuantity);

      // 대량구매 할인이 더 유리한 경우
      if (bulkDiscountRate > individualDiscountRate) {
        const discountAmount =
          item.product.val * item.quantity * bulkDiscountRate;
        return {
          discountRate: bulkDiscountRate,
          discountAmount,
          discountType: 'bulk',
        };
      }

      // 개별 할인이 더 유리한 경우
      const discountAmount =
        item.product.val * item.quantity * individualDiscountRate;
      return {
        discountRate: individualDiscountRate,
        discountAmount,
        discountType: 'individual',
      };
    },
    [calculateIndividualDiscount, calculateBulkDiscount]
  );

  /**
   * 현재 날짜가 화요일인지 확인
   */
  const isTuesday = useCallback((): boolean => {
    return new Date().getDay() === 2;
  }, []);

  return {
    // 할인 계산 함수들
    calculateIndividualDiscount,
    calculateBulkDiscount,
    calculateTuesdayDiscount,
    calculateItemDiscount,

    // 특별 할인 적용 함수들
    applyLightningSale,
    applySuggestedSale,
    removeSale,

    // 유틸리티 함수들
    isTuesday,

    // 상수들
    BUSINESS_RULES,
    DISCOUNT_RATES,
    PRODUCT_IDS,
  };
};
