import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useMemo, useEffect } from 'react';
import {
  orderStateAtom,
  OrderSummaryModel,
  DiscountInfoModel,
  CartItemSummaryModel,
} from '../features/order/model/OrderModel';
import { cartStateAtom } from '../features/cart/model/CartModel';
import { productStateAtom } from '../features/product/model/ProductModel';
import { pointsStateAtom } from '../features/points/model/PointsModel';

// 비즈니스 규칙 상수 (기존 constants에서 가져옴)
const BUSINESS_RULES = {
  BULK_PURCHASE_THRESHOLD: 30, // 대량구매 기준 수량
  TUESDAY_DAY_OF_WEEK: 2, // 화요일 (0=일요일, 1=월요일, ...)
} as const;

/**
 * Order ViewModel
 * 주문 요약 정보와 관련된 비즈니스 로직을 담당합니다.
 * 기존 orderSummaryHandlers.ts의 로직을 Jotai 기반으로 변환합니다.
 */
export const useOrderViewModel = () => {
  const [orderState, setOrderState] = useAtom(orderStateAtom);
  const cartState = useAtomValue(cartStateAtom);
  const productState = useAtomValue(productStateAtom);
  const pointsState = useAtomValue(pointsStateAtom);

  /**
   * 주문 요약 정보 계산
   * 장바구니 아이템을 기반으로 총액, 할인, 최종 금액을 계산합니다.
   */
  const calculateOrderSummary = useCallback((): OrderSummaryModel => {
    const cartItems = cartState.items;

    if (cartItems.length === 0) {
      return {
        subtotal: 0,
        totalDiscount: 0,
        finalTotal: 0,
        totalQuantity: 0,
        itemDiscounts: [],
        isTuesday: false,
        hasBulkDiscount: false,
      };
    }

    // 소계 계산
    const subtotal = cartItems.reduce((total, item) => {
      return total + item.product.val * item.quantity;
    }, 0);

    // 총 수량 계산
    const totalQuantity = cartItems.reduce((total, item) => {
      return total + item.quantity;
    }, 0);

    // 화요일 확인
    const today = new Date();
    const isTuesday = today.getDay() === BUSINESS_RULES.TUESDAY_DAY_OF_WEEK;

    // 개별 상품 할인 계산
    const itemDiscounts: Array<{ name: string; discount: number }> = [];
    let individualDiscountTotal = 0;

    cartItems.forEach(item => {
      const product = productState.products.find(p => p.id === item.product.id);
      if (!product) return;

      let discountRate = 0;
      if (item.quantity >= 10) {
        switch (item.product.id) {
          case 'p1': // 키보드
            discountRate = 0.1;
            break;
          case 'p2': // 마우스
            discountRate = 0.15;
            break;
          case 'p3': // 모니터암
            discountRate = 0.2;
            break;
          case 'p5': // 스피커
            discountRate = 0.25;
            break;
        }
      }

      if (discountRate > 0) {
        const discount = product.val * item.quantity * discountRate;
        individualDiscountTotal += discount;
        itemDiscounts.push({
          name: product.name,
          discount: Math.round(discountRate * 100),
        });
      }
    });

    // 대량구매 할인 계산
    let bulkDiscount = 0;
    let hasBulkDiscount = false;
    if (totalQuantity >= BUSINESS_RULES.BULK_PURCHASE_THRESHOLD) {
      bulkDiscount = subtotal * 0.25; // 25% 할인
      hasBulkDiscount = true;
    }

    // 화요일 할인 계산
    let tuesdayDiscount = 0;
    if (isTuesday && subtotal > 0) {
      tuesdayDiscount = subtotal * 0.1; // 10% 할인
    }

    // 최종 할인 계산
    let finalTotal = subtotal - individualDiscountTotal;

    // 대량구매 할인이 있으면 개별 할인 무시하고 대량구매 할인 적용
    if (hasBulkDiscount) {
      finalTotal = subtotal - bulkDiscount;
    }

    // 화요일 할인은 다른 할인과 중복 적용
    if (isTuesday) {
      finalTotal = finalTotal * 0.9; // 10% 할인
    }

    const totalDiscount = subtotal - finalTotal;

    return {
      subtotal,
      totalDiscount,
      finalTotal,
      totalQuantity,
      itemDiscounts: hasBulkDiscount ? [] : itemDiscounts,
      isTuesday,
      hasBulkDiscount,
    };
  }, [cartState.items, productState.products]);

  /**
   * 할인 정보 계산
   */
  const calculateDiscountInfo = useCallback(
    (summary: OrderSummaryModel): DiscountInfoModel | null => {
      if (summary.subtotal === 0 || summary.finalTotal === 0) {
        return null;
      }

      const discRate =
        summary.subtotal > 0
          ? (summary.subtotal - summary.finalTotal) / summary.subtotal
          : 0;

      const savedAmount = summary.subtotal - summary.finalTotal;

      return {
        discRate,
        savedAmount,
      };
    },
    []
  );

  /**
   * 장바구니 아이템 요약 계산
   */
  const calculateCartItemSummaries = useCallback((): CartItemSummaryModel[] => {
    return cartState.items.map(item => {
      const product = productState.products.find(p => p.id === item.product.id);
      const itemTotal = item.product.val * item.quantity;

      return {
        item,
        quantity: item.quantity,
        itemTotal,
      };
    });
  }, [cartState.items, productState.products]);

  /**
   * 주문 상태 업데이트
   * 모든 계산을 수행하고 주문 상태를 업데이트합니다.
   */
  const updateOrderState = useCallback(() => {
    const summary = calculateOrderSummary();
    const discountInfo = calculateDiscountInfo(summary);
    const cartItemSummaries = calculateCartItemSummaries();

    setOrderState({
      summary,
      discountInfo,
      cartItemSummaries,
    });
  }, [
    calculateOrderSummary,
    calculateDiscountInfo,
    calculateCartItemSummaries,
    setOrderState,
  ]);

  // Cart 상태가 변경될 때마다 자동으로 Order 상태 업데이트
  useEffect(() => {
    updateOrderState();
  }, [cartState.items, updateOrderState]);

  /**
   * 주문이 비어있는지 확인
   */
  const isEmpty = useMemo(() => {
    return cartState.items.length === 0;
  }, [cartState.items.length]);

  /**
   * 총 아이템 수량
   */
  const totalQuantity = useMemo(() => {
    return orderState.summary.totalQuantity;
  }, [orderState.summary.totalQuantity]);

  /**
   * 최종 총액
   */
  const finalTotal = useMemo(() => {
    return orderState.summary.finalTotal;
  }, [orderState.summary.finalTotal]);

  /**
   * 할인율
   */
  const discountRate = useMemo(() => {
    return orderState.discountInfo?.discRate || 0;
  }, [orderState.discountInfo]);

  /**
   * 절약 금액
   */
  const savedAmount = useMemo(() => {
    return orderState.discountInfo?.savedAmount || 0;
  }, [orderState.discountInfo]);

  return {
    // 상태
    orderState,
    summary: orderState.summary,
    discountInfo: orderState.discountInfo,
    cartItemSummaries: orderState.cartItemSummaries,

    // 계산된 값들
    isEmpty,
    totalQuantity,
    finalTotal,
    discountRate,
    savedAmount,

    // 메서드들
    updateOrderState,
    calculateOrderSummary,
    calculateDiscountInfo,
    calculateCartItemSummaries,
  };
};
