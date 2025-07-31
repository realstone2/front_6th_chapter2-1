/**
 * ========================================
 * Product ViewModel (MVVM - ViewModel)
 * ========================================
 *
 * 상품 도메인의 비즈니스 로직과 상태 관리를 담당하는 ViewModel입니다.
 * 기존 src/basic/features/product/의 로직들을 Jotai 기반 훅으로 변환합니다.
 */

import { useAtom } from 'jotai';
import { useCallback } from 'react';
import {
  productStateAtom,
  type ProductModel,
} from '../features/product/model/ProductModel';

/**
 * 상품 ViewModel 훅
 *
 * 기존 productState.ts의 useProductState 함수를 대체하여
 * React + Jotai 기반으로 상품 상태와 비즈니스 로직을 제공합니다.
 */
export const useProductViewModel = () => {
  const [productState, setProductState] = useAtom(productStateAtom);

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
