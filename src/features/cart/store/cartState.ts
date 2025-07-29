/**
 * ========================================
 * 장바구니 도메인 전역 상태 관리 (useReducer 스타일)
 * ========================================
 *
 * React의 useReducer처럼 단일 함수로 모든 상태 관리를 처리합니다.
 * 나중에 React로 마이그레이션 시 useReducer로 쉽게 변환할 수 있습니다.
 */

import { Product } from '../../product/productUtils.ts';

/**
 * 장바구니 아이템 타입 정의
 */
interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * 장바구니 도메인 상태 인터페이스
 */
interface CartState {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  subtotal: number;
  finalTotal: number;
  itemDiscounts: Array<{
    productId: string;
    discountAmount: number;
    discountType: string;
  }>;
}

/**
 * 장바구니 액션 타입들
 */
type CartAction =
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | {
      type: 'UPDATE_ITEM_QUANTITY';
      payload: { productId: string; quantity: number };
    }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'SET_TOTAL_AMOUNT'; payload: number }
  | { type: 'SET_ITEM_COUNT'; payload: number }
  | { type: 'SET_SUBTOTAL'; payload: number }
  | { type: 'SET_FINAL_TOTAL'; payload: number }
  | {
      type: 'SET_ITEM_DISCOUNTS';
      payload: Array<{
        productId: string;
        discountAmount: number;
        discountType: string;
      }>;
    }
  | { type: 'CLEAR_CART' }
  | { type: 'CALCULATE_CART_TOTALS' };

/**
 * 전역 상태 (useReducer 스타일)
 */
let cartState: CartState = {
  items: [],
  totalAmount: 0,
  itemCount: 0,
  subtotal: 0,
  finalTotal: 0,
  itemDiscounts: [],
};

/**
 * 장바구니 리듀서 (useReducer 스타일)
 */
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };

    case 'ADD_ITEM':
      const existingItem = state.items.find(
        item => item.product.id === action.payload.product.id
      );
      if (existingItem) {
        // 기존 아이템이 있으면 수량 증가
        return {
          ...state,
          items: state.items.map(item =>
            item.product.id === action.payload.product.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      } else {
        // 새 아이템 추가
        return {
          ...state,
          items: [...state.items, action.payload],
        };
      }

    case 'UPDATE_ITEM_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.product.id === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.product.id !== action.payload),
      };

    case 'SET_TOTAL_AMOUNT':
      return { ...state, totalAmount: action.payload };

    case 'SET_ITEM_COUNT':
      return { ...state, itemCount: action.payload };

    case 'SET_SUBTOTAL':
      return { ...state, subtotal: action.payload };

    case 'SET_FINAL_TOTAL':
      return { ...state, finalTotal: action.payload };

    case 'SET_ITEM_DISCOUNTS':
      return { ...state, itemDiscounts: action.payload };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalAmount: 0,
        itemCount: 0,
        subtotal: 0,
        finalTotal: 0,
        itemDiscounts: [],
      };

    case 'CALCULATE_CART_TOTALS':
      const newItemCount = state.items.reduce(
        (total, item) => total + item.quantity,
        0
      );
      const newSubtotal = state.items.reduce(
        (total, item) => total + item.product.val * item.quantity,
        0
      );
      const newTotalAmount = newSubtotal; // 기본값, 할인 로직은 별도로 계산

      return {
        ...state,
        itemCount: newItemCount,
        subtotal: newSubtotal,
        totalAmount: newTotalAmount,
      };

    default:
      return state;
  }
}

/**
 * 디스패치 함수 (useReducer 스타일)
 */
function dispatch(action: CartAction): void {
  cartState = cartReducer(cartState, action);
}

/**
 * 상태 조회 함수 (useReducer 스타일)
 */
function getState(): CartState {
  return { ...cartState };
}

/**
 * ========================================
 * 장바구니 상태 관리 (useReducer 스타일)
 * ========================================
 *
 * useReducer처럼 { getState, dispatch } 형태로 export합니다.
 */
export const useCartState = () => {
  return {
    getState,
    dispatch,
  };
};
