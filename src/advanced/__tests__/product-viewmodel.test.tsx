/**
 * ========================================
 * Product ViewModel 테스트 (MVVM - ViewModel)
 * ========================================
 *
 * Product ViewModel과 Stock ViewModel의 기능을 테스트합니다.
 * 기존 basic 테스트의 상품 관련 로직을 React Testing Library로 변환합니다.
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'jotai';
import {
  useProductViewModel,
  useProductItemViewModel,
} from '../viewmodels/useProductViewModel';
import {
  useStockViewModel,
  useStockItemViewModel,
} from '../viewmodels/useStockViewModel';
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

describe('Product ViewModel', () => {
  describe('useProductViewModel', () => {
    it('초기 상태가 올바르게 설정되어야 함', () => {
      const { result } = renderHookWithProvider(useProductViewModel);

      expect(result.current.products).toHaveLength(5);
      expect(result.current.lastSelected).toBeNull();
      expect(result.current.lightningSaleTimer).toBeNull();
      expect(result.current.suggestSaleTimer).toBeNull();
    });

    it('마지막 선택된 상품을 설정할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useProductViewModel);

      act(() => {
        result.current.setLastSelected(PRODUCT_IDS.KEYBOARD);
      });

      expect(result.current.lastSelected).toBe(PRODUCT_IDS.KEYBOARD);
    });

    it('상품을 업데이트할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useProductViewModel);
      const originalProduct = result.current.products.find(
        p => p.id === PRODUCT_IDS.KEYBOARD
      );

      act(() => {
        result.current.updateProduct({
          ...originalProduct!,
          name: '업데이트된 키보드',
          val: 15000,
        });
      });

      const updatedProduct = result.current.products.find(
        p => p.id === PRODUCT_IDS.KEYBOARD
      );
      expect(updatedProduct?.name).toBe('업데이트된 키보드');
      expect(updatedProduct?.val).toBe(15000);
    });

    it('번개세일 할인을 적용할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useProductViewModel);
      const originalProduct = result.current.products.find(
        p => p.id === PRODUCT_IDS.KEYBOARD
      );
      const originalPrice = originalProduct!.val;

      act(() => {
        result.current.applyLightningSale(PRODUCT_IDS.KEYBOARD, 20); // 20% 할인
      });

      const updatedProduct = result.current.products.find(
        p => p.id === PRODUCT_IDS.KEYBOARD
      );
      expect(updatedProduct?.onSale).toBe(true);
      expect(updatedProduct?.val).toBe(Math.round(originalPrice * 0.8)); // 20% 할인
    });

    it('추천세일 할인을 적용할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useProductViewModel);
      const originalProduct = result.current.products.find(
        p => p.id === PRODUCT_IDS.KEYBOARD
      );
      const originalPrice = originalProduct!.val;

      act(() => {
        result.current.applySuggestedSale(PRODUCT_IDS.KEYBOARD, 10); // 10% 할인
      });

      const updatedProduct = result.current.products.find(
        p => p.id === PRODUCT_IDS.KEYBOARD
      );
      expect(updatedProduct?.suggestSale).toBe(true);
      expect(updatedProduct?.val).toBe(Math.round(originalPrice * 0.9)); // 10% 할인
    });

    it('재고를 감소시킬 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useProductViewModel);
      const originalProduct = result.current.products.find(
        p => p.id === PRODUCT_IDS.KEYBOARD
      );
      const originalStock = originalProduct!.q;

      act(() => {
        result.current.decreaseStock(PRODUCT_IDS.KEYBOARD, 5);
      });

      const updatedProduct = result.current.products.find(
        p => p.id === PRODUCT_IDS.KEYBOARD
      );
      expect(updatedProduct?.q).toBe(originalStock - 5);
    });

    it('재고를 증가시킬 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useProductViewModel);
      const originalProduct = result.current.products.find(
        p => p.id === PRODUCT_IDS.KEYBOARD
      );
      const originalStock = originalProduct!.q;

      act(() => {
        result.current.increaseStock(PRODUCT_IDS.KEYBOARD, 10);
      });

      const updatedProduct = result.current.products.find(
        p => p.id === PRODUCT_IDS.KEYBOARD
      );
      expect(updatedProduct?.q).toBe(originalStock + 10);
    });

    it('상품 할인을 제거할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useProductViewModel);
      const originalProduct = result.current.products.find(
        p => p.id === PRODUCT_IDS.KEYBOARD
      );
      const originalPrice = originalProduct!.originalVal;

      // 먼저 할인 적용
      act(() => {
        result.current.applyLightningSale(PRODUCT_IDS.KEYBOARD, 20);
      });

      // 할인 제거
      act(() => {
        result.current.removeProductDiscount(PRODUCT_IDS.KEYBOARD);
      });

      const updatedProduct = result.current.products.find(
        p => p.id === PRODUCT_IDS.KEYBOARD
      );
      expect(updatedProduct?.val).toBe(originalPrice);
      expect(updatedProduct?.onSale).toBe(false);
      expect(updatedProduct?.suggestSale).toBe(false);
    });

    it('모든 할인을 제거할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useProductViewModel);

      // 여러 상품에 할인 적용
      act(() => {
        result.current.applyLightningSale(PRODUCT_IDS.KEYBOARD, 20);
        result.current.applySuggestedSale(PRODUCT_IDS.MOUSE, 15);
      });

      // 모든 할인 제거
      act(() => {
        result.current.removeAllDiscounts();
      });

      result.current.products.forEach(product => {
        expect(product.onSale).toBe(false);
        expect(product.suggestSale).toBe(false);
        expect(product.val).toBe(product.originalVal);
      });
    });
  });

  describe('useProductItemViewModel', () => {
    it('특정 상품의 정보를 제공해야 함', () => {
      const { result } = renderHookWithProvider(() =>
        useProductItemViewModel(PRODUCT_IDS.KEYBOARD)
      );

      expect(result.current.product?.id).toBe(PRODUCT_IDS.KEYBOARD);
      expect(result.current.product?.name).toBe('버그 없애는 키보드');
      expect(result.current.stock).toBe(50);
      expect(result.current.price).toBe(10000);
      expect(result.current.originalPrice).toBe(10000);
    });

    it('재고 상태를 올바르게 판단해야 함', () => {
      const { result } = renderHookWithProvider(() =>
        useProductItemViewModel(PRODUCT_IDS.KEYBOARD)
      );

      expect(result.current.isOutOfStock).toBe(false);
      expect(result.current.isLowStock).toBe(false);
      expect(result.current.isOnSale).toBe(false);
      expect(result.current.isSuggestedSale).toBe(false);
    });

    it('품절 상품의 상태를 올바르게 판단해야 함', () => {
      const { result } = renderHookWithProvider(() =>
        useProductItemViewModel(PRODUCT_IDS.LAPTOP_CASE)
      );

      expect(result.current.isOutOfStock).toBe(true);
      expect(result.current.isLowStock).toBe(false);
    });

    it('재고 부족 상품의 상태를 올바르게 판단해야 함', () => {
      const { result } = renderHookWithProvider(() =>
        useProductItemViewModel(PRODUCT_IDS.SPEAKER)
      );

      expect(result.current.isOutOfStock).toBe(false);
      expect(result.current.isLowStock).toBe(false); // 재고 10개 (5개 미만이 아님)
    });

    it('상품 정보를 업데이트할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(() =>
        useProductItemViewModel(PRODUCT_IDS.KEYBOARD)
      );

      act(() => {
        result.current.updateProductItem({ name: '새로운 키보드' });
      });

      expect(result.current.product?.name).toBe('새로운 키보드');
    });

    it('재고를 감소시킬 수 있어야 함', () => {
      const { result } = renderHookWithProvider(() =>
        useProductItemViewModel(PRODUCT_IDS.KEYBOARD)
      );
      const originalStock = result.current.stock;

      act(() => {
        result.current.decreaseProductStock(5);
      });

      expect(result.current.stock).toBe(originalStock - 5);
    });

    it('재고를 증가시킬 수 있어야 함', () => {
      const { result } = renderHookWithProvider(() =>
        useProductItemViewModel(PRODUCT_IDS.KEYBOARD)
      );
      const originalStock = result.current.stock;

      act(() => {
        result.current.increaseProductStock(10);
      });

      expect(result.current.stock).toBe(originalStock + 10);
    });
  });
});

describe('Stock ViewModel', () => {
  describe('useStockViewModel', () => {
    it('재고가 있는 상품만 필터링해야 함', () => {
      const { result } = renderHookWithProvider(useStockViewModel);

      const availableProducts = result.current.availableProducts;
      expect(availableProducts.length).toBe(4); // LAPTOP_CASE 제외
      expect(availableProducts.every(p => p.q > 0)).toBe(true);
    });

    it('재고 부족 상품을 필터링해야 함', () => {
      const { result } = renderHookWithProvider(useStockViewModel);

      const lowStockProducts = result.current.lowStockProducts;
      expect(lowStockProducts.length).toBe(0); // 재고 10개는 5개 미만이 아님
      expect(lowStockProducts.every(p => p.q > 0 && p.q < 5)).toBe(true);
    });

    it('품절 상품을 필터링해야 함', () => {
      const { result } = renderHookWithProvider(useStockViewModel);

      const outOfStockProducts = result.current.outOfStockProducts;
      expect(outOfStockProducts.length).toBe(1); // LAPTOP_CASE만
      expect(outOfStockProducts.every(p => p.q === 0)).toBe(true);
    });

    it('특정 상품을 찾을 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useStockViewModel);

      const product = result.current.findProduct(PRODUCT_IDS.KEYBOARD);
      expect(product?.id).toBe(PRODUCT_IDS.KEYBOARD);
      expect(product?.name).toBe('버그 없애는 키보드');
    });

    it('재고 확인을 할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useStockViewModel);

      expect(
        result.current.checkStockAvailability(PRODUCT_IDS.KEYBOARD, 10)
      ).toBe(true);
      expect(
        result.current.checkStockAvailability(PRODUCT_IDS.KEYBOARD, 100)
      ).toBe(false);
      expect(
        result.current.checkStockAvailability(PRODUCT_IDS.LAPTOP_CASE, 1)
      ).toBe(false);
    });

    it('재고를 감소시킬 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useStockViewModel);

      expect(result.current.decreaseProductStock(PRODUCT_IDS.KEYBOARD, 5)).toBe(
        true
      );
      expect(
        result.current.decreaseProductStock(PRODUCT_IDS.KEYBOARD, 100)
      ).toBe(false);
    });

    it('재고를 증가시킬 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useStockViewModel);

      expect(
        result.current.increaseProductStock(PRODUCT_IDS.KEYBOARD, 10)
      ).toBe(true);
    });

    it('재고 경고 상태를 확인할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useStockViewModel);

      expect(result.current.isLowStock(PRODUCT_IDS.SPEAKER)).toBe(false); // 재고 10개는 5개 미만이 아님
      expect(result.current.isLowStock(PRODUCT_IDS.KEYBOARD)).toBe(false);
    });

    it('품절 상태를 확인할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useStockViewModel);

      expect(result.current.isOutOfStock(PRODUCT_IDS.LAPTOP_CASE)).toBe(true);
      expect(result.current.isOutOfStock(PRODUCT_IDS.KEYBOARD)).toBe(false);
    });

    it('총 재고 수량을 계산할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useStockViewModel);

      const totalStock = result.current.getTotalStock();
      expect(totalStock).toBe(110); // 50 + 30 + 20 + 0 + 10
    });

    it('재고 통계를 제공해야 함', () => {
      const { result } = renderHookWithProvider(useStockViewModel);

      const summary = result.current.stockSummary;
      expect(summary.totalProducts).toBe(5);
      expect(summary.availableProducts).toBe(4);
      expect(summary.lowStockProducts).toBe(0);
      expect(summary.outOfStockProducts).toBe(1);
      expect(summary.totalStock).toBe(110);
    });
  });

  describe('useStockItemViewModel', () => {
    it('특정 상품의 재고 정보를 제공해야 함', () => {
      const { result } = renderHookWithProvider(() =>
        useStockItemViewModel(PRODUCT_IDS.KEYBOARD)
      );

      expect(result.current.product?.id).toBe(PRODUCT_IDS.KEYBOARD);
      expect(result.current.stock).toBe(50);
      expect(result.current.isAvailable).toBe(true);
      expect(result.current.isLowStock).toBe(false);
      expect(result.current.isOutOfStock).toBe(false);
    });

    it('품절 상품의 재고 정보를 제공해야 함', () => {
      const { result } = renderHookWithProvider(() =>
        useStockItemViewModel(PRODUCT_IDS.LAPTOP_CASE)
      );

      expect(result.current.stock).toBe(0);
      expect(result.current.isAvailable).toBe(false);
      expect(result.current.isOutOfStock).toBe(true);
    });

    it('재고 부족 상품의 재고 정보를 제공해야 함', () => {
      const { result } = renderHookWithProvider(() =>
        useStockItemViewModel(PRODUCT_IDS.SPEAKER)
      );

      expect(result.current.stock).toBe(10);
      expect(result.current.isAvailable).toBe(true);
      expect(result.current.isLowStock).toBe(false); // 재고 10개는 5개 미만이 아님
    });

    it('구매 가능 여부를 확인할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(() =>
        useStockItemViewModel(PRODUCT_IDS.KEYBOARD)
      );

      expect(result.current.canPurchase(10)).toBe(true);
      expect(result.current.canPurchase(100)).toBe(false);
    });

    it('재고를 감소시킬 수 있어야 함', () => {
      const { result } = renderHookWithProvider(() =>
        useStockItemViewModel(PRODUCT_IDS.KEYBOARD)
      );
      const originalStock = result.current.stock;

      act(() => {
        expect(result.current.decreaseStock(5)).toBe(true);
      });
      expect(result.current.stock).toBe(originalStock - 5);
    });

    it('재고를 증가시킬 수 있어야 함', () => {
      const { result } = renderHookWithProvider(() =>
        useStockItemViewModel(PRODUCT_IDS.KEYBOARD)
      );
      const originalStock = result.current.stock;

      act(() => {
        expect(result.current.increaseStock(10)).toBe(true);
      });
      expect(result.current.stock).toBe(originalStock + 10);
    });
  });
});

describe('Product Integration', () => {
  it('Product와 Stock ViewModel이 동일한 상태를 공유해야 함', () => {
    const { result } = renderHook(
      () => ({
        productViewModel: useProductViewModel(),
        stockViewModel: useStockViewModel(),
      }),
      { wrapper }
    );

    // 초기 상태 확인
    expect(result.current.productViewModel.products).toEqual(
      result.current.stockViewModel.products
    );

    // 재고 변경 후 상태 동기화 확인
    act(() => {
      result.current.productViewModel.decreaseStock(PRODUCT_IDS.KEYBOARD, 10);
    });

    const productStock = result.current.productViewModel.products.find(
      p => p.id === PRODUCT_IDS.KEYBOARD
    )?.q;
    const stockStock = result.current.stockViewModel.products.find(
      p => p.id === PRODUCT_IDS.KEYBOARD
    )?.q;
    expect(productStock).toBe(stockStock);
  });
});
