/**
 * ========================================
 * Product ViewModel (MVVM - ViewModel)
 * ========================================
 *
 * 상품 도메인의 비즈니스 로직과 상태 관리를 담당하는 ViewModel입니다.
 * 기존 src/basic/features/product/의 로직들을 Jotai 기반 훅으로 변환합니다.
 */

import { useAtom } from 'jotai';
import { useCallback, useEffect, useRef } from 'react';
import {
  productStateAtom,
  type ProductModel,
} from '../features/product/model/ProductModel';

// 타이머 간격 상수들 (기존 constants와 동일)
const TIMER_INTERVALS = {
  LIGHTNING_SALE_DELAY: 30000, // 30초 (번개세일 시작 지연)
  LIGHTNING_SALE_INTERVAL: 30000, // 30초 (번개세일 간격)
  SUGGESTED_SALE_DELAY: 60000, // 60초 (추천세일 시작 지연)
  SUGGESTED_SALE_INTERVAL: 60000, // 60초 (추천세일 간격)
};

/**
 * 상품 ViewModel 훅
 *
 * 기존 productState.ts의 useProductState 함수를 대체하여
 * React + Jotai 기반으로 상품 상태와 비즈니스 로직을 제공합니다.
 */
export const useProductViewModel = () => {
  const [productState, setProductState] = useAtom(productStateAtom);
  const lightningSaleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const suggestedSaleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lightningSaleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const suggestedSaleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 상품 목록 설정
   * 기존 productState.ts의 'SET_PRODUCTS' 액션과 동일한 로직
   */
  const setProducts = useCallback(
    (products: ProductModel[]) => {
      setProductState(prevState => ({
        ...prevState,
        products,
      }));
    },
    [setProductState]
  );

  /**
   * 마지막 선택된 상품 설정
   * 기존 productState.ts의 'SET_LAST_SELECTED' 액션과 동일한 로직
   */
  const setLastSelected = useCallback(
    (productId: string | null) => {
      setProductState(prevState => ({
        ...prevState,
        lastSelected: productId,
      }));
    },
    [setProductState]
  );

  /**
   * 상품 업데이트
   * 기존 productState.ts의 'UPDATE_PRODUCT' 액션과 동일한 로직
   */
  const updateProduct = useCallback(
    (updatedProduct: ProductModel) => {
      setProductState(prevState => ({
        ...prevState,
        products: prevState.products.map(product =>
          product.id === updatedProduct.id ? updatedProduct : product
        ),
      }));
    },
    [setProductState]
  );

  /**
   * 번개세일 할인 적용
   * 기존 productState.ts의 'APPLY_LIGHTNING_SALE' 액션과 동일한 로직
   */
  const applyLightningSale = useCallback(
    (productId: string, discountRate: number) => {
      setProductState(prevState => ({
        ...prevState,
        products: prevState.products.map(product =>
          product.id === productId
            ? {
                ...product,
                val: Math.round(
                  (product.originalVal * (100 - discountRate)) / 100
                ),
                onSale: true,
              }
            : product
        ),
      }));
    },
    [setProductState]
  );

  /**
   * 추천세일 할인 적용
   * 기존 productState.ts의 'APPLY_SUGGESTED_SALE' 액션과 동일한 로직
   */
  const applySuggestedSale = useCallback(
    (productId: string, discountRate: number) => {
      setProductState(prevState => ({
        ...prevState,
        products: prevState.products.map(product =>
          product.id === productId
            ? {
                ...product,
                val: Math.round((product.val * (100 - discountRate)) / 100),
                suggestSale: true,
              }
            : product
        ),
      }));
    },
    [setProductState]
  );

  /**
   * 번개세일 타이머 설정
   * 기존 productState.ts의 'SET_LIGHTNING_SALE_TIMER' 액션과 동일한 로직
   */
  const setLightningSaleTimer = useCallback(
    (timerId: number | null) => {
      setProductState(prevState => ({
        ...prevState,
        lightningSaleTimer: timerId,
      }));
    },
    [setProductState]
  );

  /**
   * 추천세일 타이머 설정
   * 기존 productState.ts의 'SET_SUGGEST_SALE_TIMER' 액션과 동일한 로직
   */
  const setSuggestSaleTimer = useCallback(
    (timerId: number | null) => {
      setProductState(prevState => ({
        ...prevState,
        suggestSaleTimer: timerId,
      }));
    },
    [setProductState]
  );

  /**
   * 재고 감소
   * 기존 productState.ts의 'DECREASE_STOCK' 액션과 동일한 로직
   */
  const decreaseStock = useCallback(
    (productId: string, quantity: number) => {
      setProductState(prevState => ({
        ...prevState,
        products: prevState.products.map(product =>
          product.id === productId && product.q >= quantity
            ? { ...product, q: product.q - quantity }
            : product
        ),
      }));
    },
    [setProductState]
  );

  /**
   * 재고 증가
   * 기존 productState.ts의 'INCREASE_STOCK' 액션과 동일한 로직
   */
  const increaseStock = useCallback(
    (productId: string, quantity: number) => {
      setProductState(prevState => ({
        ...prevState,
        products: prevState.products.map(product =>
          product.id === productId
            ? { ...product, q: product.q + quantity }
            : product
        ),
      }));
    },
    [setProductState]
  );

  /**
   * 상품 할인 제거
   * 기존 productState.ts의 'REMOVE_PRODUCT_DISCOUNT' 액션과 동일한 로직
   */
  const removeProductDiscount = useCallback(
    (productId: string) => {
      setProductState(prevState => ({
        ...prevState,
        products: prevState.products.map(product =>
          product.id === productId
            ? {
                ...product,
                val: product.originalVal,
                onSale: false,
                suggestSale: false,
              }
            : product
        ),
      }));
    },
    [setProductState]
  );

  /**
   * 모든 할인 제거
   * 기존 productState.ts의 'REMOVE_ALL_DISCOUNTS' 액션과 동일한 로직
   */
  const removeAllDiscounts = useCallback(() => {
    setProductState(prevState => ({
      ...prevState,
      products: prevState.products.map(product => ({
        ...product,
        val: product.originalVal,
        onSale: false,
        suggestSale: false,
      })),
    }));
  }, [setProductState]);

  /**
   * 번개세일 타이머 핸들러
   * 기존 productTimerHandlers.ts의 handleLightningSale과 동일한 로직
   */
  const handleLightningSale = useCallback(() => {
    const products = productState.products;
    const availableProducts = products.filter(p => p.q > 0 && !p.onSale);

    if (availableProducts.length === 0) return;

    const luckyIdx = Math.floor(Math.random() * availableProducts.length);
    const luckyItem = availableProducts[luckyIdx];

    // 번개세일 적용 (20% 할인)
    const updatedProduct: ProductModel = {
      ...luckyItem,
      val: Math.round((luckyItem.originalVal * 80) / 100),
      onSale: true,
    };

    updateProduct(updatedProduct);
    alert('⚡번개세일! ' + luckyItem.name + '이(가) 20% 할인 중입니다!');
  }, [productState.products, updateProduct]);

  /**
   * 추천세일 타이머 핸들러
   * 기존 productTimerHandlers.ts의 handleSuggestedSale과 동일한 로직
   */
  const handleSuggestedSale = useCallback(() => {
    const { lastSelected, products } = productState;

    if (!lastSelected) return;

    // 마지막 선택된 상품과 다른 상품 중에서 추천
    const suggestableProducts = products.filter(
      p => p.id !== lastSelected && p.q > 0 && !p.suggestSale
    );

    if (suggestableProducts.length === 0) return;

    const suggest = suggestableProducts[0]; // 첫 번째 후보 상품

    alert(
      '💝 ' + suggest.name + '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!'
    );

    // 추천세일 적용 (5% 할인)
    const updatedProduct: ProductModel = {
      ...suggest,
      val: Math.round((suggest.val * 95) / 100),
      suggestSale: true,
    };

    updateProduct(updatedProduct);
  }, [productState, updateProduct]);

  /**
   * 번개세일 타이머 시작
   * 기존 productTimerHandlers.ts의 startLightningSaleTimer와 동일한 로직
   */
  const startLightningSaleTimer = useCallback(() => {
    // 기존 타이머 정리
    if (lightningSaleTimerRef.current) {
      clearTimeout(lightningSaleTimerRef.current);
    }
    if (lightningSaleIntervalRef.current) {
      clearInterval(lightningSaleIntervalRef.current);
    }

    const lightningDelay = Math.random() * TIMER_INTERVALS.LIGHTNING_SALE_DELAY;

    lightningSaleTimerRef.current = setTimeout(() => {
      lightningSaleIntervalRef.current = setInterval(
        handleLightningSale,
        TIMER_INTERVALS.LIGHTNING_SALE_INTERVAL
      );
    }, lightningDelay);

    // 타이머 ID를 상태에 저장
    setProductState(prev => ({
      ...prev,
      lightningSaleTimer: lightningSaleTimerRef.current as any,
    }));
  }, [handleLightningSale, setProductState]);

  /**
   * 추천세일 타이머 시작
   * 기존 productTimerHandlers.ts의 startSuggestedSaleTimer와 동일한 로직
   */
  const startSuggestedSaleTimer = useCallback(() => {
    // 기존 타이머 정리
    if (suggestedSaleTimerRef.current) {
      clearTimeout(suggestedSaleTimerRef.current);
    }
    if (suggestedSaleIntervalRef.current) {
      clearInterval(suggestedSaleIntervalRef.current);
    }

    const suggestedSaleDelay =
      Math.random() * TIMER_INTERVALS.SUGGESTED_SALE_DELAY;

    suggestedSaleTimerRef.current = setTimeout(() => {
      suggestedSaleIntervalRef.current = setInterval(
        handleSuggestedSale,
        TIMER_INTERVALS.SUGGESTED_SALE_INTERVAL
      );
    }, suggestedSaleDelay);

    // 타이머 ID를 상태에 저장
    setProductState(prev => ({
      ...prev,
      suggestSaleTimer: suggestedSaleTimerRef.current as any,
    }));
  }, [handleSuggestedSale, setProductState]);

  /**
   * 모든 타이머 정리
   */
  const clearAllTimers = useCallback(() => {
    if (lightningSaleTimerRef.current) {
      clearTimeout(lightningSaleTimerRef.current);
      lightningSaleTimerRef.current = null;
    }
    if (suggestedSaleTimerRef.current) {
      clearTimeout(suggestedSaleTimerRef.current);
      suggestedSaleTimerRef.current = null;
    }
    if (lightningSaleIntervalRef.current) {
      clearInterval(lightningSaleIntervalRef.current);
      lightningSaleIntervalRef.current = null;
    }
    if (suggestedSaleIntervalRef.current) {
      clearInterval(suggestedSaleIntervalRef.current);
      suggestedSaleIntervalRef.current = null;
    }

    setProductState(prev => ({
      ...prev,
      lightningSaleTimer: null,
      suggestSaleTimer: null,
    }));
  }, [setProductState]);

  /**
   * 컴포넌트 언마운트 시 타이머 정리
   */
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // ViewModel에서 제공하는 상태와 함수들 반환
  return {
    // 상태 (읽기 전용)
    productState,
    products: productState.products,
    lastSelected: productState.lastSelected,
    lightningSaleTimer: productState.lightningSaleTimer,
    suggestSaleTimer: productState.suggestSaleTimer,

    // 액션 함수들
    setProducts,
    setLastSelected,
    updateProduct,
    applyLightningSale,
    applySuggestedSale,
    setLightningSaleTimer,
    setSuggestSaleTimer,
    decreaseStock,
    increaseStock,
    removeProductDiscount,
    removeAllDiscounts,

    // 타이머 관련 함수들 (새로 추가)
    startLightningSaleTimer,
    startSuggestedSaleTimer,
    clearAllTimers,
    handleLightningSale,
    handleSuggestedSale,

    // 상수들
    TIMER_INTERVALS,
  };
};

/**
 * 개별 상품을 위한 ViewModel 훅
 *
 * 특정 상품의 상태와 조작 함수를 제공합니다.
 */
export const useProductItemViewModel = (productId: string) => {
  const { products, updateProduct, decreaseStock, increaseStock } =
    useProductViewModel();

  const product = products.find(p => p.id === productId);

  const updateProductItem = useCallback(
    (updates: Partial<ProductModel>) => {
      if (product) {
        updateProduct({ ...product, ...updates });
      }
    },
    [product, updateProduct]
  );

  const decreaseProductStock = useCallback(
    (quantity: number) => {
      decreaseStock(productId, quantity);
    },
    [productId, decreaseStock]
  );

  const increaseProductStock = useCallback(
    (quantity: number) => {
      increaseStock(productId, quantity);
    },
    [productId, increaseStock]
  );

  const isOutOfStock = product?.q === 0;
  const isLowStock = product?.q !== undefined && product.q > 0 && product.q < 5;
  const isOnSale = product?.onSale || false;
  const isSuggestedSale = product?.suggestSale || false;

  return {
    product,
    updateProductItem,
    decreaseProductStock,
    increaseProductStock,
    isOutOfStock,
    isLowStock,
    isOnSale,
    isSuggestedSale,
    stock: product?.q || 0,
    price: product?.val || 0,
    originalPrice: product?.originalVal || 0,
  };
};
