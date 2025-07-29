/**
 * ========================================
 * 상품 도메인 전역 상태 관리 (useReducer 스타일)
 * ========================================
 *
 * React의 useReducer처럼 단일 함수로 모든 상태 관리를 처리합니다.
 * 나중에 React로 마이그레이션 시 useReducer로 쉽게 변환할 수 있습니다.
 */

import { initializeProducts, Product } from '../productUtils.ts';

/**
 * 상품 도메인 상태 인터페이스
 */
interface ProductState {
  products: Product[];
  lastSelected: string | null;
  lightningSaleTimer: number | null;
  suggestSaleTimer: number | null;
}

/**
 * 상품 액션 타입들
 */
type ProductAction =
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_LAST_SELECTED'; payload: string | null }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | {
      type: 'APPLY_LIGHTNING_SALE';
      payload: { productId: string; discountRate: number };
    }
  | {
      type: 'APPLY_SUGGESTED_SALE';
      payload: { productId: string; discountRate: number };
    }
  | { type: 'SET_LIGHTNING_SALE_TIMER'; payload: number | null }
  | { type: 'SET_SUGGEST_SALE_TIMER'; payload: number | null }
  | { type: 'DECREASE_STOCK'; payload: { productId: string; quantity: number } }
  | { type: 'INCREASE_STOCK'; payload: { productId: string; quantity: number } }
  | { type: 'REMOVE_PRODUCT_DISCOUNT'; payload: string }
  | { type: 'REMOVE_ALL_DISCOUNTS' };

/**
 * 전역 상태 (useReducer 스타일)
 */
let productState: ProductState = {
  products: initializeProducts(),
  lastSelected: null,
  lightningSaleTimer: null,
  suggestSaleTimer: null,
};

/**
 * 상품 리듀서 (useReducer 스타일)
 */
function productReducer(
  state: ProductState,
  action: ProductAction
): ProductState {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };

    case 'SET_LAST_SELECTED':
      return { ...state, lastSelected: action.payload };

    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
      };

    case 'APPLY_LIGHTNING_SALE':
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.productId
            ? {
                ...product,
                val: Math.round(
                  (product.originalVal * (100 - action.payload.discountRate)) /
                    100
                ),
                onSale: true,
              }
            : product
        ),
      };

    case 'APPLY_SUGGESTED_SALE':
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.productId
            ? {
                ...product,
                val: Math.round(
                  (product.val * (100 - action.payload.discountRate)) / 100
                ),
                suggestSale: true,
              }
            : product
        ),
      };

    case 'SET_LIGHTNING_SALE_TIMER':
      return { ...state, lightningSaleTimer: action.payload };

    case 'SET_SUGGEST_SALE_TIMER':
      return { ...state, suggestSaleTimer: action.payload };

    case 'DECREASE_STOCK':
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.productId &&
          product.q >= action.payload.quantity
            ? { ...product, q: product.q - action.payload.quantity }
            : product
        ),
      };

    case 'INCREASE_STOCK':
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.productId
            ? { ...product, q: product.q + action.payload.quantity }
            : product
        ),
      };

    case 'REMOVE_PRODUCT_DISCOUNT':
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload
            ? {
                ...product,
                val: product.originalVal,
                onSale: false,
                suggestSale: false,
              }
            : product
        ),
      };

    case 'REMOVE_ALL_DISCOUNTS':
      return {
        ...state,
        products: state.products.map(product => ({
          ...product,
          val: product.originalVal,
          onSale: false,
          suggestSale: false,
        })),
      };

    default:
      return state;
  }
}

/**
 * 디스패치 함수 (useReducer 스타일)
 */
function dispatch(action: ProductAction): void {
  productState = productReducer(productState, action);
}

/**
 * 상태 조회 함수 (useReducer 스타일)
 */
function getState(): ProductState {
  return { ...productState };
}

/**
 * ========================================
 * 상품 상태 관리 (useReducer 스타일)
 * ========================================
 *
 * useReducer처럼 { getState, dispatch } 형태로 export합니다.
 */
export const useProductState = () => {
  return {
    getState,
    dispatch,
  };
};
