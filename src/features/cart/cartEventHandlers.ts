/**
 * ========================================
 * 장바구니 관련 이벤트 핸들러 (순수 함수)
 * ========================================
 *
 * 장바구니와 관련된 이벤트 핸들러들을 순수 함수로 분리합니다.
 * 이벤트 매니저와 함께 사용하여 부수 효과를 최소화합니다.
 */

import { useProductState } from '../product/store/productState.ts';
import { useCartState } from './store/cartState.ts';
import { useUIState } from '../ui/store/uiState.ts';
import { usePointsState } from '../points/store/pointsState.ts';
import { BUSINESS_RULES } from '../../constants/index.ts';
import { calculateCart } from './cartCalculationUtils.ts';
import { calculateStockStatus } from '../stock/stockUtils.ts';

import {
  CartItemSummary,
  SubtotalSummary,
  BulkDiscountSummary,
  IndividualDiscountSummary,
  TuesdayDiscountSummary,
  ShippingSummary,
} from '../order/SummaryDetails.ts';
import { DiscountInfo } from '../order/DiscountInfo.ts';
import { LoyaltyPoints } from '../points/LoyaltyPoints.ts';

/**
 * 장바구니 계산 및 UI 업데이트 함수
 *
 * 장바구니의 총액, 할인, 포인트를 계산하고 관련 UI를 업데이트합니다.
 * 개별 상품 할인, 대량구매 할인, 화요일 특별 할인을 모두 적용합니다.
 */
export const handleCalculateCartStuff = () => {
  // 장바구니 상태 가져오기
  const { getState: getCartState, dispatch: cartDispatch } = useCartState();
  const cartState = getCartState();

  // 상품 상태 가져오기
  const { getState: getProductState } = useProductState();
  const productState = getProductState();

  const cartDisplay = document.querySelector('#cart-items') as HTMLElement;
  if (!cartDisplay) return;

  const cartItems = cartDisplay.children;

  // 장바구니 계산
  const { cartItemCalculations, cartTotals } = calculateCart(
    cartItems,
    productState.products
  );

  // 장바구니 상태 업데이트
  cartDispatch({ type: 'SET_ITEM_COUNT', payload: cartTotals.totalQuantity });
  cartDispatch({ type: 'SET_SUBTOTAL', payload: cartTotals.subtotal });

  let finalTotal = cartTotals.finalTotal;

  // 대량구매 할인 적용
  if (cartTotals.totalQuantity >= BUSINESS_RULES.BULK_PURCHASE_THRESHOLD) {
    finalTotal = cartTotals.subtotal * 0.75; // 25% 할인
  }

  // 화요일 할인 적용
  const today = new Date();
  const isTuesday = today.getDay() === BUSINESS_RULES.TUESDAY_DAY_OF_WEEK;
  const tuesdaySpecial = document.getElementById('tuesday-special');

  if (isTuesday && finalTotal > 0) {
    finalTotal = finalTotal * 0.9; // 10% 할인
    if (tuesdaySpecial) {
      tuesdaySpecial.classList.remove('hidden');
    }
  } else {
    if (tuesdaySpecial) {
      tuesdaySpecial.classList.add('hidden');
    }
  }

  // 장바구니 상태에서 최종 총액 업데이트
  cartDispatch({ type: 'SET_FINAL_TOTAL', payload: finalTotal });

  // UI 업데이트
  const updatedCartState = getCartState();
  const { dispatch: uiDispatch } = useUIState();

  // 헤더 아이템 카운트 업데이트
  uiDispatch({
    type: 'SET_HEADER_ITEM_COUNT',
    payload: updatedCartState.itemCount,
  });

  const headerItemCountElement = document.getElementById('item-count');
  if (headerItemCountElement) {
    headerItemCountElement.textContent =
      '🛍️ ' + updatedCartState.itemCount + ' items in cart';
  }

  // 요약 상세 정보 업데이트
  const summaryDetails = document.getElementById('summary-details');
  if (summaryDetails) {
    summaryDetails.innerHTML = '';

    if (cartTotals.subtotal > 0) {
      // 장바구니 아이템 요약
      cartItemCalculations.forEach(itemCalc => {
        summaryDetails.innerHTML += CartItemSummary({
          item: itemCalc.product,
          quantity: itemCalc.quantity,
        });
      });

      summaryDetails.innerHTML += SubtotalSummary({
        subTotal: cartTotals.subtotal,
      });

      // 할인 정보 표시
      if (
        updatedCartState.itemCount >= BUSINESS_RULES.BULK_PURCHASE_THRESHOLD
      ) {
        summaryDetails.innerHTML += BulkDiscountSummary();
      } else if (cartTotals.itemDiscounts.length > 0) {
        summaryDetails.innerHTML += IndividualDiscountSummary({
          itemDiscounts: cartTotals.itemDiscounts,
        });
      }

      if (isTuesday && updatedCartState.finalTotal > 0) {
        summaryDetails.appendChild(TuesdayDiscountSummary());
      }

      summaryDetails.appendChild(ShippingSummary());
    }
  }

  // 총액 표시
  const summaryElement = document.querySelector('#cart-total');
  if (summaryElement) {
    const totalDiv = summaryElement.querySelector('.text-2xl');
    if (totalDiv) {
      totalDiv.textContent =
        '₩' + Math.round(updatedCartState.finalTotal).toLocaleString();
    }
  }

  // 포인트 계산 및 표시
  const { dispatch: pointsDispatch, getState: getPointsState } =
    usePointsState();

  // 화요일 확인
  const todayForPoints = new Date();
  const isTuesdayForPoints =
    todayForPoints.getDay() === BUSINESS_RULES.TUESDAY_DAY_OF_WEEK;

  // 장바구니 아이템 정보 수집
  const cartItemsForPoints = Array.from(cartDisplay.children).map(item => {
    const productId = (item as HTMLElement).id;
    const quantityElem = (item as HTMLElement).querySelector(
      '.quantity-number'
    );
    const quantity = quantityElem
      ? parseInt(quantityElem.textContent || '0')
      : 0;
    return { id: productId, quantity };
  });

  // 포인트 계산
  pointsDispatch({
    type: 'CALCULATE_POINTS',
    payload: {
      totalAmount: updatedCartState.finalTotal,
      cartItems: cartItemsForPoints,
      isTuesday: isTuesdayForPoints,
    },
  });

  // 포인트 표시
  const loyaltyPointsDiv = document.getElementById('loyalty-points');
  if (loyaltyPointsDiv) {
    const pointsState = getPointsState();
    const totalPoints = pointsState.currentPoints.total;
    const calculation = pointsState.currentPoints.calculation;

    // 장바구니가 비어있으면 포인트 섹션 숨김
    if (cartDisplay.children.length === 0) {
      loyaltyPointsDiv.style.display = 'none';
      return;
    }

    if (totalPoints > 0 && calculation) {
      // 상세 정보 표시
      loyaltyPointsDiv.innerHTML = '';
      loyaltyPointsDiv.appendChild(
        LoyaltyPoints({
          bonusPoints: totalPoints,
          pointsDetail: calculation.details,
        })
      );
    } else {
      loyaltyPointsDiv.textContent = '적립 포인트: 0p';
    }
    loyaltyPointsDiv.style.display = 'block';
  }

  // 할인 정보 표시
  const discountInfoDiv = document.getElementById('discount-info');
  if (discountInfoDiv) {
    discountInfoDiv.innerHTML = '';

    const discRate =
      cartTotals.subtotal > 0
        ? (cartTotals.subtotal - updatedCartState.finalTotal) /
          cartTotals.subtotal
        : 0;
    if (discRate > 0 && updatedCartState.finalTotal > 0) {
      const savedAmount = cartTotals.subtotal - updatedCartState.finalTotal;
      const discountInfo = DiscountInfo({ discRate, savedAmount });
      const discountInfoContainer = document.querySelector('#discount-info');
      if (discountInfoContainer) {
        discountInfoContainer.innerHTML = '';
        discountInfoContainer.appendChild(discountInfo);
      }
    }
  }

  // 아이템 카운트 업데이트
  const itemCountElement = document.getElementById('item-count');
  if (itemCountElement) {
    const previousCount = parseInt(
      (itemCountElement.textContent?.match(/\d+/) || ['0'])[0]
    );
    itemCountElement.textContent =
      '🛍️ ' + updatedCartState.itemCount + ' items in cart';
    if (previousCount !== updatedCartState.itemCount) {
      itemCountElement.setAttribute('data-changed', 'true');
    }
  }

  // 재고 정보 업데이트
  const stockInformation = document.querySelector('#stock-status');
  if (stockInformation) {
    const stockStatus = calculateStockStatus(
      useProductState().getState().products
    );
    stockInformation.textContent = stockStatus.stockMessage;
  }
};
