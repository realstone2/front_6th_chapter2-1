/**
 * ========================================
 * Cart ViewModel 테스트
 * ========================================
 *
 * 장바구니 ViewModel의 기본 기능을 테스트합니다.
 */

import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'jotai';
import { useCartViewModel } from '../viewmodels/useCartViewModel';
import { useCartDiscountViewModel } from '../viewmodels/useCartDiscountViewModel';
import { useCartCalculationViewModel } from '../viewmodels/useCartCalculationViewModel';
import {
  createProduct,
  PRODUCT_IDS,
} from '../features/product/model/ProductModel';

// Jotai Provider로 훅을 래핑하는 함수
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
);

describe('Cart ViewModel Tests', () => {
  describe('useCartViewModel', () => {
    it('초기 상태가 올바르게 설정되어야 함', () => {
      const { result } = renderHook(() => useCartViewModel(), { wrapper });

      expect(result.current.items).toEqual([]);
      expect(result.current.itemCount).toBe(0);
      expect(result.current.totalAmount).toBe(0);
      expect(result.current.subtotal).toBe(0);
      expect(result.current.finalTotal).toBe(0);
    });

    it('장바구니에 아이템을 추가할 수 있어야 함', () => {
      const { result } = renderHook(() => useCartViewModel(), { wrapper });
      const testProduct = createProduct(
        PRODUCT_IDS.KEYBOARD,
        '테스트 키보드',
        10000,
        50
      );

      act(() => {
        result.current.addItem(testProduct, 2);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].product.id).toBe(PRODUCT_IDS.KEYBOARD);
      expect(result.current.items[0].quantity).toBe(2);
    });

    it('동일한 상품을 추가하면 수량이 증가해야 함', () => {
      const { result } = renderHook(() => useCartViewModel(), { wrapper });
      const testProduct = createProduct(
        PRODUCT_IDS.KEYBOARD,
        '테스트 키보드',
        10000,
        50
      );

      act(() => {
        result.current.addItem(testProduct, 2);
        result.current.addItem(testProduct, 3);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(5);
    });

    it('아이템 수량을 업데이트할 수 있어야 함', () => {
      const { result } = renderHook(() => useCartViewModel(), { wrapper });
      const testProduct = createProduct(
        PRODUCT_IDS.KEYBOARD,
        '테스트 키보드',
        10000,
        50
      );

      act(() => {
        result.current.addItem(testProduct, 2);
        result.current.updateItemQuantity(PRODUCT_IDS.KEYBOARD, 5);
      });

      expect(result.current.items[0].quantity).toBe(5);
    });

    it('아이템을 제거할 수 있어야 함', () => {
      const { result } = renderHook(() => useCartViewModel(), { wrapper });
      const testProduct = createProduct(
        PRODUCT_IDS.KEYBOARD,
        '테스트 키보드',
        10000,
        50
      );

      act(() => {
        result.current.addItem(testProduct, 2);
        result.current.removeItem(PRODUCT_IDS.KEYBOARD);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('장바구니를 비울 수 있어야 함', () => {
      const { result } = renderHook(() => useCartViewModel(), { wrapper });
      const testProduct = createProduct(
        PRODUCT_IDS.KEYBOARD,
        '테스트 키보드',
        10000,
        50
      );

      act(() => {
        result.current.addItem(testProduct, 2);
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.itemCount).toBe(0);
      expect(result.current.totalAmount).toBe(0);
    });

    it('총계를 계산할 수 있어야 함', () => {
      const { result } = renderHook(() => useCartViewModel(), { wrapper });
      const testProduct = createProduct(
        PRODUCT_IDS.KEYBOARD,
        '테스트 키보드',
        10000,
        50
      );

      act(() => {
        result.current.addItem(testProduct, 2);
        result.current.calculateTotals();
      });

      expect(result.current.itemCount).toBe(2);
      expect(result.current.subtotal).toBe(20000);
      expect(result.current.totalAmount).toBe(20000);
    });
  });

  describe('useCartDiscountViewModel', () => {
    it('개별 상품 할인을 올바르게 계산해야 함', () => {
      const { result } = renderHook(() => useCartDiscountViewModel(), {
        wrapper,
      });
      const keyboardProduct = createProduct(
        PRODUCT_IDS.KEYBOARD,
        '키보드',
        10000,
        50
      );

      // 10개 미만: 할인 없음
      expect(
        result.current.calculateIndividualDiscount(keyboardProduct, 5)
      ).toBe(0);

      // 10개 이상: 10% 할인
      expect(
        result.current.calculateIndividualDiscount(keyboardProduct, 10)
      ).toBe(0.1);
    });

    it('대량구매 할인을 올바르게 계산해야 함', () => {
      const { result } = renderHook(() => useCartDiscountViewModel(), {
        wrapper,
      });

      // 30개 미만: 할인 없음
      expect(result.current.calculateBulkDiscount(20)).toBe(0);

      // 30개 이상: 25% 할인
      expect(result.current.calculateBulkDiscount(30)).toBe(0.25);
    });

    it('화요일 할인을 올바르게 계산해야 함', () => {
      const { result } = renderHook(() => useCartDiscountViewModel(), {
        wrapper,
      });

      expect(result.current.calculateTuesdayDiscount(false)).toBe(0);
      expect(result.current.calculateTuesdayDiscount(true)).toBe(0.1);
    });
  });

  describe('useCartCalculationViewModel', () => {
    it('장바구니가 비어있는지 올바르게 확인해야 함', () => {
      const { result } = renderHook(() => useCartCalculationViewModel(), {
        wrapper,
      });

      expect(result.current.isEmpty([])).toBe(true);

      const testProduct = createProduct(
        PRODUCT_IDS.KEYBOARD,
        '키보드',
        10000,
        50
      );
      const cartItems = [{ product: testProduct, quantity: 1 }];
      expect(result.current.isEmpty(cartItems)).toBe(false);
    });

    it('특정 상품이 장바구니에 있는지 올바르게 확인해야 함', () => {
      const { result } = renderHook(() => useCartCalculationViewModel(), {
        wrapper,
      });
      const testProduct = createProduct(
        PRODUCT_IDS.KEYBOARD,
        '키보드',
        10000,
        50
      );
      const cartItems = [{ product: testProduct, quantity: 1 }];

      expect(result.current.hasProduct(cartItems, PRODUCT_IDS.KEYBOARD)).toBe(
        true
      );
      expect(result.current.hasProduct(cartItems, PRODUCT_IDS.MOUSE)).toBe(
        false
      );
    });

    it('특정 상품의 수량을 올바르게 조회해야 함', () => {
      const { result } = renderHook(() => useCartCalculationViewModel(), {
        wrapper,
      });
      const testProduct = createProduct(
        PRODUCT_IDS.KEYBOARD,
        '키보드',
        10000,
        50
      );
      const cartItems = [{ product: testProduct, quantity: 5 }];

      expect(
        result.current.getProductQuantity(cartItems, PRODUCT_IDS.KEYBOARD)
      ).toBe(5);
      expect(
        result.current.getProductQuantity(cartItems, PRODUCT_IDS.MOUSE)
      ).toBe(0);
    });
  });
});

describe('Cart Integration Tests', () => {
  it('장바구니 추가부터 계산까지 전체 플로우가 작동해야 함', () => {
    const { result: cartResult } = renderHook(() => useCartViewModel(), {
      wrapper,
    });
    const { result: calcResult } = renderHook(
      () => useCartCalculationViewModel(),
      { wrapper }
    );

    const keyboardProduct = createProduct(
      PRODUCT_IDS.KEYBOARD,
      '키보드',
      10000,
      50
    );
    const mouseProduct = createProduct(PRODUCT_IDS.MOUSE, '마우스', 20000, 30);

    act(() => {
      // 키보드 10개 추가 (개별 할인 적용)
      cartResult.current.addItem(keyboardProduct, 10);
      // 마우스 5개 추가 (할인 없음)
      cartResult.current.addItem(mouseProduct, 5);
      cartResult.current.calculateTotals();
    });

    // 장바구니 상태 확인
    expect(cartResult.current.items).toHaveLength(2);
    expect(cartResult.current.itemCount).toBe(15);
    expect(cartResult.current.subtotal).toBe(200000); // 100,000 + 100,000

    // 계산 결과 확인
    const totals = calcResult.current.calculateCartTotals(
      cartResult.current.items
    );
    expect(totals.totalQuantity).toBe(15);
    expect(totals.subtotal).toBe(200000);
    expect(totals.totalDiscount).toBeGreaterThan(0); // 키보드 10% 할인 적용
    expect(totals.finalTotal).toBeLessThan(200000);
  });
});
