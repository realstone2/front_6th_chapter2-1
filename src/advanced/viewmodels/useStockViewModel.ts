/**
 * ========================================
 * Stock ViewModel (MVVM - ViewModel)
 * ========================================
 *
 * 재고 도메인의 비즈니스 로직과 상태 관리를 담당하는 ViewModel입니다.
 * 기존 src/basic/features/product/productUtils.ts의 재고 관련 로직들을
 * Jotai 기반 훅으로 변환합니다.
 */

import { useCallback } from 'react';
import { useProductViewModel } from './useProductViewModel';
import { type ProductModel } from '../features/product/model/ProductModel';

/**
 * 재고 ViewModel 훅
 *
 * 재고 관리에 특화된 비즈니스 로직을 제공합니다.
 * useProductViewModel을 기반으로 재고 관련 기능을 확장합니다.
 */
export const useStockViewModel = () => {
  const { products, decreaseStock, increaseStock, updateProduct } =
    useProductViewModel();

  /**
   * 재고가 있는 상품만 필터링
   * 기존 productUtils.ts의 getAvailableProducts와 동일한 로직
   */
  const getAvailableProducts = useCallback((): ProductModel[] => {
    return products.filter(product => product.q > 0);
  }, [products]);

  /**
   * 재고 부족 상품 필터링 (5개 미만)
   * 기존 로직에서 재고 경고 시스템을 위한 함수
   */
  const getLowStockProducts = useCallback((): ProductModel[] => {
    return products.filter(product => product.q > 0 && product.q < 5);
  }, [products]);

  /**
   * 품절 상품 필터링
   * 기존 로직에서 품절 상품 처리를 위한 함수
   */
  const getOutOfStockProducts = useCallback((): ProductModel[] => {
    return products.filter(product => product.q === 0);
  }, [products]);

  /**
   * 특정 상품의 재고 확인
   * 기존 productUtils.ts의 findProduct와 유사한 로직
   */
  const findProduct = useCallback(
    (productId: string): ProductModel | undefined => {
      return products.find(product => product.id === productId);
    },
    [products]
  );

  /**
   * 상품 재고 확인 (구매 가능 여부)
   * 장바구니 추가 시 재고 체크를 위한 함수
   */
  const checkStockAvailability = useCallback(
    (productId: string, quantity: number): boolean => {
      const product = findProduct(productId);
      return product ? product.q >= quantity : false;
    },
    [findProduct]
  );

  /**
   * 재고 감소 (구매 시)
   * 기존 productState.ts의 'DECREASE_STOCK' 액션과 동일한 로직
   */
  const decreaseProductStock = useCallback(
    (productId: string, quantity: number): boolean => {
      const product = findProduct(productId);
      if (product && product.q >= quantity) {
        decreaseStock(productId, quantity);
        return true;
      }
      return false;
    },
    [findProduct, decreaseStock]
  );

  /**
   * 재고 증가 (반품 시)
   * 기존 productState.ts의 'INCREASE_STOCK' 액션과 동일한 로직
   */
  const increaseProductStock = useCallback(
    (productId: string, quantity: number): boolean => {
      const product = findProduct(productId);
      if (product) {
        increaseStock(productId, quantity);
        return true;
      }
      return false;
    },
    [findProduct, increaseStock]
  );

  /**
   * 재고 경고 상태 확인
   * 재고가 5개 미만인지 확인하는 함수
   */
  const isLowStock = useCallback(
    (productId: string): boolean => {
      const product = findProduct(productId);
      return product ? product.q > 0 && product.q < 5 : false;
    },
    [findProduct]
  );

  /**
   * 품절 상태 확인
   * 재고가 0개인지 확인하는 함수
   */
  const isOutOfStock = useCallback(
    (productId: string): boolean => {
      const product = findProduct(productId);
      return product ? product.q === 0 : true;
    },
    [findProduct]
  );

  /**
   * 총 재고 수량 계산
   * 전체 상품의 재고 합계를 계산하는 함수
   */
  const getTotalStock = useCallback((): number => {
    return products.reduce((total, product) => total + product.q, 0);
  }, [products]);

  /**
   * 재고가 있는 상품 수 계산
   * 구매 가능한 상품의 개수를 계산하는 함수
   */
  const getAvailableProductCount = useCallback((): number => {
    return getAvailableProducts().length;
  }, [getAvailableProducts]);

  /**
   * 재고 부족 상품 수 계산
   * 재고 경고가 필요한 상품의 개수를 계산하는 함수
   */
  const getLowStockProductCount = useCallback((): number => {
    return getLowStockProducts().length;
  }, [getLowStockProducts]);

  /**
   * 품절 상품 수 계산
   * 구매 불가능한 상품의 개수를 계산하는 함수
   */
  const getOutOfStockProductCount = useCallback((): number => {
    return getOutOfStockProducts().length;
  }, [getOutOfStockProducts]);

  /**
   * 재고 상태 요약 정보
   * 재고 관련 통계 정보를 제공하는 함수
   */
  const getStockSummary = useCallback(() => {
    return {
      totalProducts: products.length,
      availableProducts: getAvailableProductCount(),
      lowStockProducts: getLowStockProductCount(),
      outOfStockProducts: getOutOfStockProductCount(),
      totalStock: getTotalStock(),
    };
  }, [
    products.length,
    getAvailableProductCount,
    getLowStockProductCount,
    getOutOfStockProductCount,
    getTotalStock,
  ]);

  // ViewModel에서 제공하는 상태와 함수들 반환
  return {
    // 상태 (읽기 전용)
    products,
    availableProducts: getAvailableProducts(),
    lowStockProducts: getLowStockProducts(),
    outOfStockProducts: getOutOfStockProducts(),
    stockSummary: getStockSummary(),

    // 유틸리티 함수들
    findProduct,
    checkStockAvailability,
    isLowStock,
    isOutOfStock,
    getTotalStock,
    getAvailableProductCount,
    getLowStockProductCount,
    getOutOfStockProductCount,
    getStockSummary,

    // 액션 함수들
    decreaseProductStock,
    increaseProductStock,
  };
};

/**
 * 개별 상품의 재고를 위한 ViewModel 훅
 *
 * 특정 상품의 재고 상태와 조작 함수를 제공합니다.
 */
export const useStockItemViewModel = (productId: string) => {
  const {
    findProduct,
    checkStockAvailability,
    isLowStock,
    isOutOfStock,
    decreaseProductStock,
    increaseProductStock,
  } = useStockViewModel();

  const product = findProduct(productId);
  const stock = product?.q || 0;
  const isAvailable = stock > 0;
  const isLowStockItem = isLowStock(productId);
  const isOutOfStockItem = isOutOfStock(productId);

  const decreaseStock = useCallback(
    (quantity: number): boolean => {
      return decreaseProductStock(productId, quantity);
    },
    [productId, decreaseProductStock]
  );

  const increaseStock = useCallback(
    (quantity: number): boolean => {
      return increaseProductStock(productId, quantity);
    },
    [productId, increaseProductStock]
  );

  const canPurchase = useCallback(
    (quantity: number): boolean => {
      return checkStockAvailability(productId, quantity);
    },
    [productId, checkStockAvailability]
  );

  return {
    product,
    stock,
    isAvailable,
    isLowStock: isLowStockItem,
    isOutOfStock: isOutOfStockItem,
    decreaseStock,
    increaseStock,
    canPurchase,
  };
};
