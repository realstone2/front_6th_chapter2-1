/**
 * ========================================
 * Cart Model Types, Data & Atoms (MVVM - Model)
 * ========================================
 *
 * 장바구니 도메인의 데이터 타입, 초기 데이터, Jotai atoms를 정의합니다.
 * 기존 src/basic/features/cart/store/cartState.ts를 기반으로 구성합니다.
 */

import { atom } from 'jotai';
import { ProductModel } from '../../product/model/ProductModel';

/**
 * 장바구니 아이템 모델 인터페이스
 * 기존 CartItem 인터페이스와 동일
 */
export interface CartItemModel {
  /** 상품 정보 */
  product: ProductModel;

  /** 구매 수량 */
  quantity: number;
}

/**
 * 장바구니 할인 정보 모델 인터페이스
 * 기존 cartState.ts의 itemDiscounts 타입과 동일
 */
export interface CartDiscountInfo {
  /** 상품 ID */
  productId: string;

  /** 할인 금액 */
  discountAmount: number;

  /** 할인 타입 (individual, bulk, tuesday 등) */
  discountType: string;
}

/**
 * 장바구니 상태 모델 인터페이스
 * 기존 CartState 인터페이스와 동일
 */
export interface CartState {
  /** 장바구니 아이템 목록 */
  items: CartItemModel[];

  /** 총 금액 */
  totalAmount: number;

  /** 전체 아이템 수량 */
  itemCount: number;

  /** 소계 (할인 적용 전) */
  subtotal: number;

  /** 최종 총액 (할인 적용 후) */
  finalTotal: number;

  /** 아이템별 할인 정보 목록 */
  itemDiscounts: CartDiscountInfo[];
}

// ========================================
// 초기 데이터
// ========================================

/**
 * 초기 장바구니 상태
 * 기존 cartState.ts의 초기 상태와 동일
 */
export const initialCartState: CartState = {
  items: [],
  totalAmount: 0,
  itemCount: 0,
  subtotal: 0,
  finalTotal: 0,
  itemDiscounts: [],
};

// ========================================
// Jotai Atoms
// ========================================

/**
 * 장바구니 상태 atom
 * 기존 cartState와 동일한 구조로 장바구니 전체 상태를 관리합니다.
 */
export const cartStateAtom = atom<CartState>(initialCartState);
