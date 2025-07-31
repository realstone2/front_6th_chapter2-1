import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'jotai';
import { useOrderViewModel } from '../viewmodels/useOrderViewModel';
import { useCartViewModel } from '../viewmodels/useCartViewModel';
import { usePointsViewModel } from '../viewmodels/usePointsViewModel';
import { ProductModel } from '../features/product/model/ProductModel';
import { describe, expect, it } from 'vitest';

// 테스트용 래퍼 컴포넌트
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
);

// 테스트용 상품 데이터
const createTestProduct = (
  id: string,
  name: string,
  price: number,
  stock: number
): ProductModel => ({
  id,
  name,
  val: price,
  originalVal: price,
  q: stock,
  onSale: false,
  suggestSale: false,
});

describe('useOrderViewModel', () => {
  describe('디버깅 테스트', () => {
    it('Cart와 Order ViewModel이 같은 Provider를 사용하는지 확인', () => {
      const { result } = renderHook(
        () => ({
          cartViewModel: useCartViewModel(),
          orderViewModel: useOrderViewModel(),
        }),
        {
          wrapper: TestWrapper,
        }
      );

      const testProduct = createTestProduct(
        'p1',
        '버그 없애는 키보드',
        10000,
        50
      );

      act(() => {
        result.current.cartViewModel.addItem(testProduct, 5);
      });

      console.log('Cart items after add:', result.current.cartViewModel.items);
      console.log(
        'Order isEmpty before update:',
        result.current.orderViewModel.isEmpty
      );

      act(() => {
        result.current.orderViewModel.updateOrderState();
      });

      console.log(
        'Order isEmpty after update:',
        result.current.orderViewModel.isEmpty
      );
      console.log(
        'Order cartItemSummaries:',
        result.current.orderViewModel.cartItemSummaries
      );

      expect(result.current.cartViewModel.items).toHaveLength(1);
      expect(result.current.orderViewModel.isEmpty).toBe(false);
    });
  });

  describe('기본 기능 테스트', () => {
    it('초기 상태가 올바르게 설정되어야 함', () => {
      const { result } = renderHook(() => useOrderViewModel(), {
        wrapper: TestWrapper,
      });

      expect(result.current.isEmpty).toBe(true);
      expect(result.current.totalQuantity).toBe(0);
      expect(result.current.finalTotal).toBe(0);
      expect(result.current.discountRate).toBe(0);
      expect(result.current.savedAmount).toBe(0);
    });

    it('장바구니에 아이템 추가 시 주문 요약이 업데이트되어야 함', () => {
      const { result } = renderHook(
        () => ({
          cartViewModel: useCartViewModel(),
          orderViewModel: useOrderViewModel(),
        }),
        {
          wrapper: TestWrapper,
        }
      );

      // 테스트용 상품 생성
      const testProduct = createTestProduct(
        'p1',
        '버그 없애는 키보드',
        10000,
        50
      );

      // 장바구니에 직접 아이템 추가
      act(() => {
        result.current.cartViewModel.addItem(testProduct, 5);
      });

      // 주문 상태 업데이트
      act(() => {
        result.current.orderViewModel.updateOrderState();
      });

      expect(result.current.orderViewModel.isEmpty).toBe(false);
      expect(result.current.orderViewModel.totalQuantity).toBe(5);
      expect(result.current.orderViewModel.finalTotal).toBe(50000); // 10000 * 5
    });
  });

  describe('할인 계산 테스트', () => {
    it('개별 상품 할인이 올바르게 계산되어야 함', () => {
      const { result } = renderHook(
        () => ({
          cartViewModel: useCartViewModel(),
          orderViewModel: useOrderViewModel(),
        }),
        {
          wrapper: TestWrapper,
        }
      );

      // 키보드 10개 추가 (10% 할인 적용)
      const testProduct = createTestProduct(
        'p1',
        '버그 없애는 키보드',
        10000,
        50
      );

      act(() => {
        result.current.cartViewModel.addItem(testProduct, 10);
        result.current.orderViewModel.updateOrderState();
      });

      expect(result.current.orderViewModel.summary.itemDiscounts).toHaveLength(
        1
      );
      expect(result.current.orderViewModel.summary.itemDiscounts[0].name).toBe(
        '버그 없애는 키보드'
      );
      expect(
        result.current.orderViewModel.summary.itemDiscounts[0].discount
      ).toBe(10);
    });

    it('대량구매 할인이 올바르게 계산되어야 함', () => {
      const { result } = renderHook(
        () => ({
          cartViewModel: useCartViewModel(),
          orderViewModel: useOrderViewModel(),
        }),
        {
          wrapper: TestWrapper,
        }
      );

      // 총 30개 이상 추가 (25% 할인 적용)
      const testProduct = createTestProduct(
        'p1',
        '버그 없애는 키보드',
        10000,
        50
      );

      act(() => {
        result.current.cartViewModel.addItem(testProduct, 30);
        result.current.orderViewModel.updateOrderState();
      });

      expect(result.current.orderViewModel.summary.hasBulkDiscount).toBe(true);
      expect(result.current.orderViewModel.summary.itemDiscounts).toHaveLength(
        0
      ); // 개별 할인 무시
    });

    it('화요일 할인이 올바르게 계산되어야 함', () => {
      const { result } = renderHook(
        () => ({
          cartViewModel: useCartViewModel(),
          orderViewModel: useOrderViewModel(),
        }),
        {
          wrapper: TestWrapper,
        }
      );

      // 화요일인지 확인하는 로직을 모킹
      const originalGetDay = Date.prototype.getDay;
      Date.prototype.getDay = () => 2; // 화요일

      const testProduct = createTestProduct(
        'p1',
        '버그 없애는 키보드',
        10000,
        50
      );

      act(() => {
        result.current.cartViewModel.addItem(testProduct, 5);
        result.current.orderViewModel.updateOrderState();
      });

      expect(result.current.orderViewModel.summary.isTuesday).toBe(true);

      // 원래 함수 복원
      Date.prototype.getDay = originalGetDay;
    });
  });

  describe('복합 할인 테스트', () => {
    it('개별 할인 + 화요일 할인이 중복 적용되어야 함', () => {
      const { result } = renderHook(
        () => ({
          cartViewModel: useCartViewModel(),
          orderViewModel: useOrderViewModel(),
        }),
        {
          wrapper: TestWrapper,
        }
      );

      // 화요일 모킹
      const originalGetDay = Date.prototype.getDay;
      Date.prototype.getDay = () => 2;

      const testProduct = createTestProduct(
        'p1',
        '버그 없애는 키보드',
        10000,
        50
      );

      act(() => {
        result.current.cartViewModel.addItem(testProduct, 10); // 10% 개별 할인
        result.current.orderViewModel.updateOrderState();
      });

      // 개별 할인 10% + 화요일 할인 10% = 총 19% 할인
      expect(result.current.orderViewModel.summary.itemDiscounts).toHaveLength(
        1
      );
      expect(result.current.orderViewModel.summary.isTuesday).toBe(true);

      Date.prototype.getDay = originalGetDay;
    });

    it('대량구매 할인 시 개별 할인이 무시되어야 함', () => {
      const { result } = renderHook(
        () => ({
          cartViewModel: useCartViewModel(),
          orderViewModel: useOrderViewModel(),
        }),
        {
          wrapper: TestWrapper,
        }
      );

      const testProduct = createTestProduct(
        'p1',
        '버그 없애는 키보드',
        10000,
        50
      );

      act(() => {
        result.current.cartViewModel.addItem(testProduct, 30); // 25% 대량구매 할인
        result.current.orderViewModel.updateOrderState();
      });

      expect(result.current.orderViewModel.summary.hasBulkDiscount).toBe(true);
      expect(result.current.orderViewModel.summary.itemDiscounts).toHaveLength(
        0
      );
    });
  });

  describe('할인 정보 테스트', () => {
    it('할인 정보가 올바르게 계산되어야 함', () => {
      const { result } = renderHook(
        () => ({
          cartViewModel: useCartViewModel(),
          orderViewModel: useOrderViewModel(),
        }),
        {
          wrapper: TestWrapper,
        }
      );

      const testProduct = createTestProduct(
        'p1',
        '버그 없애는 키보드',
        10000,
        50
      );

      act(() => {
        result.current.cartViewModel.addItem(testProduct, 10); // 10% 할인
        result.current.orderViewModel.updateOrderState();
      });

      expect(result.current.orderViewModel.discountInfo).not.toBeNull();
      expect(result.current.orderViewModel.discountRate).toBeGreaterThan(0);
      expect(result.current.orderViewModel.savedAmount).toBeGreaterThan(0);
    });

    it('장바구니가 비어있으면 할인 정보가 null이어야 함', () => {
      const { result: orderViewModel } = renderHook(() => useOrderViewModel(), {
        wrapper: TestWrapper,
      });

      act(() => {
        orderViewModel.current.updateOrderState();
      });

      expect(orderViewModel.current.discountInfo).toBeNull();
      expect(orderViewModel.current.discountRate).toBe(0);
      expect(orderViewModel.current.savedAmount).toBe(0);
    });
  });

  describe('장바구니 아이템 요약 테스트', () => {
    it('장바구니 아이템 요약이 올바르게 계산되어야 함', () => {
      const { result } = renderHook(
        () => ({
          cartViewModel: useCartViewModel(),
          orderViewModel: useOrderViewModel(),
        }),
        {
          wrapper: TestWrapper,
        }
      );

      const testProduct = createTestProduct(
        'p1',
        '버그 없애는 키보드',
        10000,
        50
      );

      act(() => {
        result.current.cartViewModel.addItem(testProduct, 3);
        result.current.orderViewModel.updateOrderState();
      });

      expect(result.current.orderViewModel.cartItemSummaries).toHaveLength(1);
      expect(result.current.orderViewModel.cartItemSummaries[0].quantity).toBe(
        3
      );
      expect(result.current.orderViewModel.cartItemSummaries[0].itemTotal).toBe(
        30000
      ); // 10000 * 3
    });

    it('여러 상품이 있을 때 모든 아이템이 요약에 포함되어야 함', () => {
      const { result } = renderHook(
        () => ({
          cartViewModel: useCartViewModel(),
          orderViewModel: useOrderViewModel(),
        }),
        {
          wrapper: TestWrapper,
        }
      );

      const testProduct1 = createTestProduct(
        'p1',
        '버그 없애는 키보드',
        10000,
        50
      );
      const testProduct2 = createTestProduct(
        'p2',
        '생산성 폭발 마우스',
        20000,
        30
      );

      act(() => {
        result.current.cartViewModel.addItem(testProduct1, 2);
        result.current.cartViewModel.addItem(testProduct2, 1);
        result.current.orderViewModel.updateOrderState();
      });

      expect(result.current.orderViewModel.cartItemSummaries).toHaveLength(2);
      expect(result.current.orderViewModel.totalQuantity).toBe(3);
    });
  });

  describe('Order Integration 테스트', () => {
    it('전체 주문 플로우가 올바르게 작동해야 함', () => {
      const { result } = renderHook(
        () => ({
          cartViewModel: useCartViewModel(),
          orderViewModel: useOrderViewModel(),
        }),
        {
          wrapper: TestWrapper,
        }
      );

      const testProduct = createTestProduct(
        'p1',
        '버그 없애는 키보드',
        10000,
        50
      );

      // 1. 장바구니에 추가
      act(() => {
        result.current.cartViewModel.addItem(testProduct, 15); // 10개 이상으로 개별 할인 적용
      });

      // 2. 주문 상태 업데이트
      act(() => {
        result.current.orderViewModel.updateOrderState();
      });

      // 3. 검증
      expect(result.current.orderViewModel.isEmpty).toBe(false);
      expect(result.current.orderViewModel.totalQuantity).toBe(15);
      expect(result.current.orderViewModel.summary.subtotal).toBe(150000); // 10000 * 15
      expect(result.current.orderViewModel.summary.itemDiscounts).toHaveLength(
        1
      );
      expect(result.current.orderViewModel.discountInfo).not.toBeNull();
      expect(result.current.orderViewModel.finalTotal).toBeLessThan(
        result.current.orderViewModel.summary.subtotal
      );
    });

    it('Order ViewModel이 Points ViewModel과 연동되어야 함', () => {
      const { result } = renderHook(
        () => ({
          cartViewModel: useCartViewModel(),
          orderViewModel: useOrderViewModel(),
          pointsViewModel: usePointsViewModel(),
        }),
        {
          wrapper: TestWrapper,
        }
      );

      const testProduct = createTestProduct(
        'p1',
        '버그 없애는 키보드',
        10000,
        50
      );

      // 1. 장바구니에 추가
      act(() => {
        result.current.cartViewModel.addItem(testProduct, 2);
      });

      // 2. 주문 상태 업데이트 (포인트 계산도 함께 실행됨)
      act(() => {
        result.current.orderViewModel.updateOrderState();
      });

      // 3. 포인트가 계산되었는지 확인
      expect(
        result.current.pointsViewModel.currentPoints.total
      ).toBeGreaterThan(0);
      expect(
        result.current.pointsViewModel.currentPoints.calculation
      ).not.toBeNull();
      expect(
        result.current.pointsViewModel.currentPoints.lastCalculated
      ).not.toBeNull();
    });
  });
});
