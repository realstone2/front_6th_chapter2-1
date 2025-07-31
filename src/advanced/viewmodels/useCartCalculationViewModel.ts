/**
 * ========================================
 * Cart Calculation ViewModel (MVVM - ViewModel)
 * ========================================
 *
 * 장바구니 계산 로직을 담당하는 ViewModel입니다.
 * 기존 src/basic/features/cart/cartCalculationUtils.ts의 로직을 React 훅으로 변환합니다.
 */

import { useCallback } from 'react';
import { CartItemModel } from '../features/cart/model/CartModel';
import { ProductModel } from '../features/product/model/ProductModel';
import { useCartDiscountViewModel } from './useCartDiscountViewModel';

/**
 * 장바구니 아이템 계산 결과 타입 정의
 * 기존 CartItemCalculation 인터페이스와 동일
 */
export interface CartItemCalculation {
  product: ProductModel;
  quantity: number;
  subtotal: number;
  discount: number;
  discountedTotal: number;
  discountType: string;
}

/**
 * 장바구니 총계 계산 결과 타입 정의
 * 기존 CartTotals 인터페이스와 동일
 */
export interface CartTotals {
  totalQuantity: number;
  subtotal: number;
  totalDiscount: number;
  finalTotal: number;
  itemDiscounts: Array<{
    name: string;
    discount: number;
    discountType: string;
  }>;
}

/**
 * 장바구니 계산 ViewModel 훅
 *
 * 기존 cartCalculationUtils.ts의 계산 로직들을 React 훅으로 제공합니다.
 */
export const useCartCalculationViewModel = () => {
  const discountViewModel = useCartDiscountViewModel();

  /**
   * 장바구니 아이템별 계산
   * 기존 calculateCartItems 함수와 동일한 로직
   */
  const calculateCartItems = useCallback(
    (cartItems: CartItemModel[]): CartItemCalculation[] => {
      const totalQuantity = cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      return cartItems.map(cartItem => {
        const { product, quantity } = cartItem;
        const subtotal = product.val * quantity;

        // 할인 계산
        const discountInfo = discountViewModel.calculateItemDiscount(
          cartItem,
          totalQuantity
        );
        const discount = discountInfo.discountAmount;
        const discountedTotal = subtotal - discount;

        return {
          product,
          quantity,
          subtotal,
          discount,
          discountedTotal,
          discountType: discountInfo.discountType,
        };
      });
    },
    [discountViewModel]
  );

  /**
   * 장바구니 총계 계산
   * 기존 calculateCartTotals 함수와 동일한 로직
   */
  const calculateCartTotals = useCallback(
    (cartItems: CartItemModel[]): CartTotals => {
      const calculatedItems = calculateCartItems(cartItems);

      const totalQuantity = calculatedItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const subtotal = calculatedItems.reduce(
        (sum, item) => sum + item.subtotal,
        0
      );
      const totalDiscount = calculatedItems.reduce(
        (sum, item) => sum + item.discount,
        0
      );

      // 화요일 추가 할인 적용
      const isTuesday = discountViewModel.isTuesday();
      const tuesdayDiscountRate =
        discountViewModel.calculateTuesdayDiscount(isTuesday);
      const tuesdayDiscount = (subtotal - totalDiscount) * tuesdayDiscountRate;

      const finalTotal = subtotal - totalDiscount - tuesdayDiscount;

      // 아이템별 할인 정보 생성
      const itemDiscounts = calculatedItems
        .filter(item => item.discount > 0)
        .map(item => ({
          name: item.product.name,
          discount: item.discount,
          discountType: item.discountType,
        }));

      // 화요일 할인이 있으면 추가
      if (tuesdayDiscount > 0) {
        itemDiscounts.push({
          name: '화요일 특별 할인',
          discount: tuesdayDiscount,
          discountType: 'tuesday',
        });
      }

      return {
        totalQuantity,
        subtotal,
        totalDiscount: totalDiscount + tuesdayDiscount,
        finalTotal,
        itemDiscounts,
      };
    },
    [calculateCartItems, discountViewModel]
  );

  /**
   * 개별 아이템의 최종 가격 계산
   */
  const calculateItemFinalPrice = useCallback(
    (item: CartItemModel, totalQuantity: number): number => {
      const subtotal = item.product.val * item.quantity;
      const discountInfo = discountViewModel.calculateItemDiscount(
        item,
        totalQuantity
      );
      return subtotal - discountInfo.discountAmount;
    },
    [discountViewModel]
  );

  /**
   * 장바구니가 비어있는지 확인
   */
  const isEmpty = useCallback((cartItems: CartItemModel[]): boolean => {
    return cartItems.length === 0;
  }, []);

  /**
   * 특정 상품이 장바구니에 있는지 확인
   */
  const hasProduct = useCallback(
    (cartItems: CartItemModel[], productId: string): boolean => {
      return cartItems.some(item => item.product.id === productId);
    },
    []
  );

  /**
   * 특정 상품의 수량 조회
   */
  const getProductQuantity = useCallback(
    (cartItems: CartItemModel[], productId: string): number => {
      const item = cartItems.find(item => item.product.id === productId);
      return item?.quantity || 0;
    },
    []
  );

  /**
   * 할인 혜택 요약 생성
   */
  const getDiscountSummary = useCallback(
    (cartItems: CartItemModel[]): string[] => {
      const totals = calculateCartTotals(cartItems);
      const summary: string[] = [];

      // 개별 할인 정보
      totals.itemDiscounts.forEach(discount => {
        if (discount.discountType === 'individual') {
          summary.push(
            `${discount.name}: 개별할인 ${discount.discount.toLocaleString()}원`
          );
        } else if (discount.discountType === 'bulk') {
          summary.push(
            `대량구매 할인: ${discount.discount.toLocaleString()}원`
          );
        } else if (discount.discountType === 'tuesday') {
          summary.push(
            `화요일 특별 할인: ${discount.discount.toLocaleString()}원`
          );
        }
      });

      return summary;
    },
    [calculateCartTotals]
  );

  return {
    // 계산 함수들
    calculateCartItems,
    calculateCartTotals,
    calculateItemFinalPrice,

    // 유틸리티 함수들
    isEmpty,
    hasProduct,
    getProductQuantity,
    getDiscountSummary,
  };
};
