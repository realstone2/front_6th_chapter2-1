/**
 * ========================================
 * Order Model Types, Data & Atoms (MVVM - Model)
 * ========================================
 *
 * 주문 도메인의 데이터 타입, 초기 데이터, Jotai atoms를 정의합니다.
 * 기존 src/basic/features/order/orderSummaryHandlers.ts와 관련 컴포넌트들을 기반으로 구성합니다.
 */

import { atom } from 'jotai';
import { CartItemModel, CartDiscountInfo } from './CartModel';

/**
 * 할인 정보 모델 인터페이스
 * 기존 discountUtils.ts의 DiscountInfo 인터페이스와 동일
 */
export interface DiscountInfo {
  /** 개별 상품 할인율 */
  individualDiscount: number;

  /** 대량구매 할인율 */
  bulkDiscount: number;

  /** 화요일 할인율 */
  tuesdayDiscount: number;

  /** 총 할인율 */
  totalDiscount: number;

  /** 절약 금액 */
  savedAmount: number;

  /** 원래 총액 */
  originalTotal: number;

  /** 최종 총액 */
  finalTotal: number;
}

/**
 * 주문 요약 정보 모델 인터페이스
 * 기존 OrderSummaryComponent.ts의 OrderSummaryProps와 유사
 */
export interface OrderSummary {
  /** 장바구니 아이템 목록 */
  cartItems: CartItemModel[];

  /** 소계 (할인 적용 전) */
  subTotal: number;

  /** 총 금액 (할인 적용 후) */
  totalAmount: number;

  /** 전체 아이템 수량 */
  itemCount: number;

  /** 아이템별 할인 정보 */
  itemDiscounts: Array<{ name: string; discount: number }>;

  /** 화요일 할인 적용 여부 */
  isTuesday: boolean;

  /** 대량구매 할인 적용 여부 */
  hasBulkDiscount: boolean;

  /** 배송비 */
  shippingCost: number;
}

/**
 * 할인 적용 상태 모델 인터페이스
 */
export interface DiscountStatus {
  /** 개별 상품 할인 적용 여부 */
  hasIndividualDiscount: boolean;

  /** 대량구매 할인 적용 여부 */
  hasBulkDiscount: boolean;

  /** 화요일 할인 적용 여부 */
  hasTuesdayDiscount: boolean;

  /** 번개세일 할인 적용 여부 */
  hasLightningSale: boolean;

  /** 추천세일 할인 적용 여부 */
  hasSuggestSale: boolean;
}

/**
 * 주문 상태 모델 인터페이스
 */
export interface OrderState {
  /** 주문 요약 정보 */
  summary: OrderSummary;

  /** 할인 적용 상태 */
  discountStatus: DiscountStatus;

  /** 할인 정보 */
  discountInfo: DiscountInfo;

  /** 적용된 할인 목록 */
  appliedDiscounts: CartDiscountInfo[];

  /** 주문 준비 상태 */
  isReady: boolean;
}

// ========================================
// 초기 데이터
// ========================================

/**
 * 초기 할인 정보
 */
export const initialDiscountInfo: DiscountInfo = {
  individualDiscount: 0,
  bulkDiscount: 0,
  tuesdayDiscount: 0,
  totalDiscount: 0,
  savedAmount: 0,
  originalTotal: 0,
  finalTotal: 0,
};

/**
 * 초기 주문 요약 정보
 */
export const initialOrderSummary: OrderSummary = {
  cartItems: [],
  subTotal: 0,
  totalAmount: 0,
  itemCount: 0,
  itemDiscounts: [],
  isTuesday: false,
  hasBulkDiscount: false,
  shippingCost: 0, // 무료배송
};

/**
 * 초기 할인 적용 상태
 */
export const initialDiscountStatus: DiscountStatus = {
  hasIndividualDiscount: false,
  hasBulkDiscount: false,
  hasTuesdayDiscount: false,
  hasLightningSale: false,
  hasSuggestSale: false,
};

/**
 * 초기 주문 상태
 */
export const initialOrderState: OrderState = {
  summary: initialOrderSummary,
  discountStatus: initialDiscountStatus,
  discountInfo: initialDiscountInfo,
  appliedDiscounts: [],
  isReady: false,
};

// ========================================
// Jotai Atoms
// ========================================

/**
 * 주문 상태 atom
 * 기존 orderState와 동일한 구조로 주문 전체 상태를 관리합니다.
 */
export const orderStateAtom = atom<OrderState>(initialOrderState);
