/**
 * ========================================
 * Order Model Types, Data & Atoms (MVVM - Model)
 * ========================================
 *
 * 주문 도메인의 데이터 타입, 초기 데이터, Jotai atoms를 정의합니다.
 * 기존 src/basic/features/order/orderSummaryHandlers.ts와 관련 컴포넌트들을 기반으로 구성합니다.
 */

import { atom } from 'jotai';
import { CartItemModel } from '../../cart/model/CartModel';
import { ProductModel } from '../../product/model/ProductModel';

// Order 관련 타입 정의
export interface OrderSummaryModel {
  subtotal: number;
  totalDiscount: number;
  finalTotal: number;
  totalQuantity: number;
  itemDiscounts: Array<{ name: string; discount: number }>;
  isTuesday: boolean;
  hasBulkDiscount: boolean;
}

export interface DiscountInfoModel {
  discRate: number;
  savedAmount: number;
}

export interface CartItemSummaryModel {
  item: CartItemModel;
  quantity: number;
  itemTotal: number;
}

export interface OrderState {
  summary: OrderSummaryModel;
  discountInfo: DiscountInfoModel | null;
  cartItemSummaries: CartItemSummaryModel[];
}

// 초기 상태
const initialOrderState: OrderState = {
  summary: {
    subtotal: 0,
    totalDiscount: 0,
    finalTotal: 0,
    totalQuantity: 0,
    itemDiscounts: [],
    isTuesday: false,
    hasBulkDiscount: false,
  },
  discountInfo: null,
  cartItemSummaries: [],
};

// Jotai atom
export const orderStateAtom = atom<OrderState>(initialOrderState);
