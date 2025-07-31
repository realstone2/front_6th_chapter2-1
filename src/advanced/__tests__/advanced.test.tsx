/**
 * ========================================
 * React 마이그레이션 통합 테스트 (MVVM - ViewModel 기반)
 * ========================================
 *
 * 기존 basic 테스트의 모든 기능을 React Testing Library로 변환합니다.
 * ViewModel 기반으로 테스트하여 안정성을 확보합니다.
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'jotai';
import { useCartViewModel } from '../viewmodels/useCartViewModel';
import { useOrderViewModel } from '../viewmodels/useOrderViewModel';
import { useProductViewModel } from '../viewmodels/useProductViewModel';
import { usePointsViewModel } from '../viewmodels/usePointsViewModel';
import { useUIViewModel } from '../viewmodels/useUIViewModel';
import { useStockViewModel } from '../viewmodels/useStockViewModel';
import { PRODUCT_IDS } from '../features/product/model/ProductModel';

/**
 * 테스트용 Provider 래퍼
 */
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
);

const renderHookWithProvider = <T,>(hook: () => T) => {
  return renderHook(hook, { wrapper });
};

/**
 * 여러 ViewModel을 하나의 Provider에서 렌더링하는 헬퍼
 */
const renderMultipleHooks = <T extends Record<string, any>>(hooks: T) => {
  const Component = () => {
    const results: any = {};
    Object.keys(hooks).forEach(key => {
      results[key] = hooks[key]();
    });
    return null;
  };

  const { result } = renderHook(
    () => {
      const results: any = {};
      Object.keys(hooks).forEach(key => {
        results[key] = hooks[key]();
      });
      return results;
    },
    { wrapper }
  );

  return result;
};

describe('React 마이그레이션 통합 테스트', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    // 화요일 할인을 비활성화하기 위해 월요일로 날짜 설정
    const monday = new Date('2024-10-14'); // 월요일
    vi.setSystemTime(monday);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // 1. Cart ViewModel 테스트
  describe('1. Cart ViewModel', () => {
    describe('1.1 장바구니 기본 기능', () => {
      it('초기 상태가 올바르게 설정되어야 함', () => {
        const { result } = renderHookWithProvider(useCartViewModel);

        expect(result.current.cartState.items).toHaveLength(0);
        expect(result.current.cartState.itemCount).toBe(0);
        expect(result.current.cartState.totalAmount).toBe(0);
      });

      it('상품을 장바구니에 추가할 수 있어야 함', () => {
        const { result } = renderHookWithProvider(useCartViewModel);
        const { result: productResult } =
          renderHookWithProvider(useProductViewModel);
        const keyboard = productResult.current.products.find(
          p => p.id === PRODUCT_IDS.KEYBOARD
        );

        act(() => {
          result.current.addItem(keyboard!, 2);
        });

        expect(result.current.cartState.items).toHaveLength(1);
        expect(result.current.cartState.itemCount).toBe(2);
        expect(result.current.cartState.totalAmount).toBe(20000); // 10000 * 2
      });

      it('동일한 상품을 추가하면 수량이 증가해야 함', () => {
        const { result } = renderHookWithProvider(useCartViewModel);
        const { result: productResult } =
          renderHookWithProvider(useProductViewModel);
        const keyboard = productResult.current.products.find(
          p => p.id === PRODUCT_IDS.KEYBOARD
        );

        act(() => {
          result.current.addItem(keyboard!, 1);
          result.current.addItem(keyboard!, 1);
        });

        expect(result.current.cartState.items).toHaveLength(1);
        expect(result.current.cartState.itemCount).toBe(2);
      });

      it('장바구니에서 상품을 제거할 수 있어야 함', () => {
        const { result } = renderHookWithProvider(useCartViewModel);
        const { result: productResult } =
          renderHookWithProvider(useProductViewModel);
        const keyboard = productResult.current.products.find(
          p => p.id === PRODUCT_IDS.KEYBOARD
        );

        act(() => {
          result.current.addItem(keyboard!, 2);
        });

        act(() => {
          result.current.removeItem(PRODUCT_IDS.KEYBOARD);
        });

        expect(result.current.cartState.items).toHaveLength(0);
        expect(result.current.cartState.itemCount).toBe(0);
      });

      it('상품 수량을 업데이트할 수 있어야 함', () => {
        const { result } = renderHookWithProvider(useCartViewModel);
        const { result: productResult } =
          renderHookWithProvider(useProductViewModel);
        const keyboard = productResult.current.products.find(
          p => p.id === PRODUCT_IDS.KEYBOARD
        );

        act(() => {
          result.current.addItem(keyboard!, 1);
        });

        act(() => {
          result.current.updateItemQuantity(PRODUCT_IDS.KEYBOARD, 5);
        });

        expect(result.current.cartState.itemCount).toBe(5);
      });
    });

    describe('1.2 재고 제한', () => {
      it('재고를 초과하여 추가할 수 없어야 함', () => {
        const { result } = renderHookWithProvider(useCartViewModel);
        const { result: productResult } =
          renderHookWithProvider(useProductViewModel);
        const speaker = productResult.current.products.find(
          p => p.id === PRODUCT_IDS.SPEAKER
        );

        act(() => {
          result.current.addItem(speaker!, 15); // 재고 10개 초과
        });

        expect(result.current.cartState.itemCount).toBe(10); // 재고 한도만큼만 추가
      });

      it('품절 상품을 추가할 수 없어야 함', () => {
        const { result } = renderHookWithProvider(useCartViewModel);
        const { result: productResult } =
          renderHookWithProvider(useProductViewModel);
        const laptopCase = productResult.current.products.find(
          p => p.id === PRODUCT_IDS.LAPTOP_CASE
        );

        act(() => {
          result.current.addItem(laptopCase!, 1);
        });

        expect(result.current.cartState.items).toHaveLength(0);
      });
    });
  });

  // 2. Order ViewModel 테스트
  describe('2. Order ViewModel', () => {
    describe('2.1 주문 계산', () => {
      it('기본 주문 계산이 올바르게 되어야 함', () => {
        const { result } = renderHookWithProvider(useOrderViewModel);

        expect(result.current.orderState.summary.subtotal).toBe(0);
        expect(result.current.orderState.summary.totalDiscount).toBe(0);
        expect(result.current.orderState.summary.finalTotal).toBe(0);
      });

      it('상품 추가 시 주문 계산이 업데이트되어야 함', () => {
        const result = renderMultipleHooks({
          cart: useCartViewModel,
          order: useOrderViewModel,
          product: useProductViewModel,
        });

        const keyboard = result.current.product.products.find(
          p => p.id === PRODUCT_IDS.KEYBOARD
        );

        act(() => {
          result.current.cart.addItem(keyboard!, 2);
        });

        expect(result.current.order.orderState.summary.subtotal).toBe(20000);
        expect(result.current.order.orderState.summary.finalTotal).toBe(20000);
      });
    });

    describe('2.2 할인 정책', () => {
      it('개별 상품 할인이 적용되어야 함', () => {
        const result = renderMultipleHooks({
          cart: useCartViewModel,
          order: useOrderViewModel,
          product: useProductViewModel,
        });

        const keyboard = result.current.product.products.find(
          p => p.id === PRODUCT_IDS.KEYBOARD
        );

        act(() => {
          result.current.cart.addItem(keyboard!, 10); // 10개 이상 구매 시 10% 할인
        });

        expect(result.current.order.orderState.summary.subtotal).toBe(100000);
        expect(result.current.order.orderState.summary.totalDiscount).toBe(
          10000
        ); // 10% 할인
        expect(result.current.order.orderState.summary.finalTotal).toBe(90000);
      });

      it('전체 수량 할인이 적용되어야 함', () => {
        const result = renderMultipleHooks({
          cart: useCartViewModel,
          order: useOrderViewModel,
          product: useProductViewModel,
        });

        const keyboard = result.current.product.products.find(
          p => p.id === PRODUCT_IDS.KEYBOARD
        );
        const mouse = result.current.product.products.find(
          p => p.id === PRODUCT_IDS.MOUSE
        );

        act(() => {
          result.current.cart.addItem(keyboard!, 15);
          result.current.cart.addItem(mouse!, 15); // 총 30개
        });

        expect(result.current.order.orderState.summary.finalTotal).toBe(337500); // 25% 할인 적용
      });
    });
  });

  // 3. Product ViewModel 테스트
  describe('3. Product ViewModel', () => {
    describe('3.1 상품 정보', () => {
      it('5개 상품이 올바른 정보로 표시되어야 함', () => {
        const { result } = renderHookWithProvider(useProductViewModel);

        expect(result.current.products).toHaveLength(5);

        const keyboard = result.current.products.find(
          p => p.id === PRODUCT_IDS.KEYBOARD
        );
        expect(keyboard?.name).toBe('버그 없애는 키보드');
        expect(keyboard?.val).toBe(10000);
        expect(keyboard?.q).toBe(50);
      });

      it('상품 선택이 올바르게 작동해야 함', () => {
        const { result } = renderHookWithProvider(useProductViewModel);

        act(() => {
          result.current.setLastSelected(PRODUCT_IDS.KEYBOARD);
        });

        expect(result.current.lastSelected).toBe(PRODUCT_IDS.KEYBOARD);
      });
    });
  });

  // 4. Points ViewModel 테스트
  describe('4. Points ViewModel', () => {
    describe('4.1 포인트 계산', () => {
      it('기본 포인트 적립이 올바르게 계산되어야 함', () => {
        const result = renderMultipleHooks({
          cart: useCartViewModel,
          points: usePointsViewModel,
          product: useProductViewModel,
        });

        const keyboard = result.current.product.products.find(
          p => p.id === PRODUCT_IDS.KEYBOARD
        );

        act(() => {
          result.current.cart.addItem(keyboard!, 9); // 90000원
        });

        // 포인트 계산을 직접 호출
        act(() => {
          result.current.points.calculateAndUpdatePoints(
            90000, // 90000원
            result.current.cart.cartState.items
          );
        });

        expect(result.current.points.currentPoints.total).toBe(90); // 90000원의 0.1%
      });

      it('포인트 표시 상태가 올바르게 관리되어야 함', () => {
        const result = renderMultipleHooks({
          cart: useCartViewModel,
          points: usePointsViewModel,
          product: useProductViewModel,
        });

        const keyboard = result.current.product.products.find(
          p => p.id === PRODUCT_IDS.KEYBOARD
        );

        act(() => {
          result.current.cart.addItem(keyboard!, 1);
        });

        // 포인트 계산을 직접 호출하여 표시 상태 업데이트
        act(() => {
          result.current.points.calculateAndUpdatePoints(
            10000,
            result.current.cart.cartState.items
          );
        });

        expect(result.current.points.display.isVisible).toBe(true);
      });
    });
  });

  // 5. UI ViewModel 테스트
  describe('5. UI ViewModel', () => {
    describe('5.1 UI 상태 관리', () => {
      it('헤더 상태가 올바르게 관리되어야 함', () => {
        const { result } = renderHookWithProvider(useUIViewModel);

        expect(result.current.header.isVisible).toBe(true);
        expect(result.current.header.itemCount).toBe(0);
      });

      it('모달 상태가 올바르게 관리되어야 함', () => {
        const { result } = renderHookWithProvider(useUIViewModel);

        expect(result.current.modal.isManualOpen).toBe(false);
        expect(result.current.modal.isOverlayVisible).toBe(false);
      });
    });
  });

  // 6. Stock ViewModel 테스트
  describe('6. Stock ViewModel', () => {
    describe('6.1 재고 관리', () => {
      it('재고 상태가 올바르게 판단되어야 함', () => {
        const { result } = renderHookWithProvider(useStockViewModel);

        expect(result.current.isOutOfStock(PRODUCT_IDS.LAPTOP_CASE)).toBe(true);
        expect(result.current.isOutOfStock(PRODUCT_IDS.KEYBOARD)).toBe(false);
      });

      it('재고 감소가 올바르게 작동해야 함', () => {
        const { result } = renderHookWithProvider(useStockViewModel);

        act(() => {
          result.current.decreaseProductStock(PRODUCT_IDS.KEYBOARD, 5);
        });

        const product = result.current.findProduct(PRODUCT_IDS.KEYBOARD);
        expect(product?.q).toBe(45); // 50 - 5
      });
    });
  });

  // 7. 통합 테스트
  describe('7. 통합 테스트', () => {
    it('상품 추가 시 모든 ViewModel이 동기화되어야 함', () => {
      const result = renderMultipleHooks({
        cart: useCartViewModel,
        order: useOrderViewModel,
        points: usePointsViewModel,
        ui: useUIViewModel,
        product: useProductViewModel,
      });

      const keyboard = result.current.product.products.find(
        p => p.id === PRODUCT_IDS.KEYBOARD
      );

      act(() => {
        result.current.cart.addItem(keyboard!, 2);
      });

      // Cart 상태 확인
      expect(result.current.cart.cartState.itemCount).toBe(2);
      expect(result.current.cart.cartState.totalAmount).toBe(20000);

      // Order 상태 확인
      expect(result.current.order.orderState.summary.subtotal).toBe(20000);
      expect(result.current.order.orderState.summary.finalTotal).toBe(20000);

      // Points 상태 확인
      expect(result.current.points.currentPoints.total).toBe(20); // 20000원의 0.1%

      // UI 상태 확인
      expect(result.current.ui.header.itemCount).toBe(2);
    });

    it('재고 제한이 모든 ViewModel에 반영되어야 함', () => {
      const result = renderMultipleHooks({
        cart: useCartViewModel,
        stock: useStockViewModel,
        product: useProductViewModel,
      });

      const speaker = result.current.product.products.find(
        p => p.id === PRODUCT_IDS.SPEAKER
      );

      // 초기 재고 확인
      const initialStock = result.current.stock.findProduct(
        PRODUCT_IDS.SPEAKER
      )?.q;
      expect(initialStock).toBe(10);

      act(() => {
        result.current.cart.addItem(speaker!, 15); // 재고 10개 초과
      });

      expect(result.current.cart.cartState.itemCount).toBe(10); // 재고 한도

      // 재고 감소를 직접 수행
      act(() => {
        result.current.stock.decreaseProductStock(PRODUCT_IDS.SPEAKER, 10);
      });

      // 재고가 실제로 감소했는지 확인
      const updatedStock = result.current.stock.findProduct(
        PRODUCT_IDS.SPEAKER
      );
      expect(updatedStock?.q).toBe(0); // 재고 소진
    });
  });
});
