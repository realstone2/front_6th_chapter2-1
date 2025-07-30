/**
 * ========================================
 * 전역 상태 변수 (Global State Variables)
 * ========================================
 *
 * 애플리케이션의 전역 상태를 관리하는 변수들입니다.
 * 향후 Store 패턴으로 마이그레이션 예정입니다.
 */

// 상품 관련 상태

let cartDisplay; // 장바구니 UI 요소

// UI 요소 참조
// productSelector는 ProductSelector 컴포넌트에서 처리됨
let addToCartButton; // 장바구니 추가 버튼
// stockInformation은 StockInformation 컴포넌트에서 처리됨
let summaryElement; // 주문 요약 정보 요소

// 포인트 관련 상태
let bonusPoints = 0; // 보너스 포인트

import {
  BUSINESS_RULES,
  PRODUCT_IDS,
  TIMER_INTERVALS,
} from '../constants/index.ts';
import { App } from '../features/layout/App.ts';
import { calculateCart } from '../features/cart/cartCalculationUtils.ts';
import { CartItem } from '../features/cart/CartItem.ts';
import { PriceDisplay } from '../features/cart/PriceDisplay.ts';
import { DiscountInfo } from '../features/order/DiscountInfo.ts';
import {
  BulkDiscountSummary,
  CartItemSummary,
  IndividualDiscountSummary,
  ShippingSummary,
  SubtotalSummary,
  TuesdayDiscountSummary,
} from '../features/order/SummaryDetails.ts';
import { LoyaltyPoints } from '../features/points/LoyaltyPoints.ts';
import {
  createProductOptions,
  getDropdownBorderColor,
  renderProductOptions,
} from '../features/product/productOptionUtils.ts';
import { initializeProducts } from '../features/product/productUtils.ts';
import { useProductState } from '../features/product/store/productState.ts';
import { useCartState } from '../features/cart/store/cartState.ts';
import { useUIState } from '../features/ui/store/uiState.ts';
import { usePointsState } from '../features/points/store/pointsState.ts';
import {
  calculateStockStatus,
  calculateTotalStock,
} from '../features/stock/stockUtils.ts';
import { setupEventListeners } from '../features/events/eventManager.ts';
import { onUpdateSelectOptions } from '../features/product/productEventHandlers.ts';
import { handleStockInfoUpdate } from '../features/stock/stockEventHandlers.ts';
import { doUpdatePricesInCart } from '../features/cart/cartPriceHandlers.ts';

/**
 * ========================================
 * 애플리케이션 초기화 (Application Initialization)
 * ========================================
 *
 * 애플리케이션의 메인 진입점입니다.
 * DOM 구조 생성, 이벤트 리스너 등록, 타이머 설정을 담당합니다.
 */
function main() {
  // ========================================
  // 1. 상태 초기화 (State Initialization)
  // ========================================

  // ========================================
  // 2. 상품 데이터 초기화 (Product Data Initialization)
  // ========================================

  // 상품 도메인 상태 초기화
  const { dispatch: productDispatch } = useProductState();
  productDispatch({ type: 'SET_PRODUCTS', payload: initializeProducts() });

  // 장바구니 도메인 상태 초기화
  const { dispatch: cartDispatch } = useCartState();
  cartDispatch({ type: 'CLEAR_CART' });

  // UI 도메인 상태 초기화
  const { dispatch: uiDispatch } = useUIState();
  uiDispatch({ type: 'RESET_UI_STATE' });

  // 포인트 도메인 상태 초기화
  const { dispatch: pointsDispatch } = usePointsState();
  pointsDispatch({ type: 'RESET_POINTS_STATE' });

  // ========================================
  // 3. DOM 구조 생성 (DOM Structure Creation)
  // ========================================

  // 3.1 루트 요소 및 앱 컴포넌트 생성
  const root = document.getElementById('app');
  const app = App();

  setupEventListeners(app);

  // 3.2 필요한 DOM 요소 참조 설정
  // productSelector는 ProductSelector 컴포넌트에서 처리됨
  addToCartButton = app.querySelector('#add-to-cart');
  // stockInformation은 StockInformation 컴포넌트에서 처리됨
  cartDisplay = app.querySelector('#cart-items');
  summaryElement = app.querySelector('#cart-total');

  // 3.4 앱을 루트에 추가
  if (root) {
    root.appendChild(app);
  }

  onUpdateSelectOptions();
  handleCalculateCartStuff();
  // 타이머 이벤트는 ProductSelector 컴포넌트에서 처리됨
}

// 상품 선택 옵션 업데이트는 ProductSelector 컴포넌트에서 처리됨
/**
 * ========================================
 * 장바구니 관련 함수들 (Cart Related Functions)
 * ========================================
 */

/**
 * 장바구니 계산 및 UI 업데이트
 *
 * 장바구니의 총액, 할인, 포인트를 계산하고 관련 UI를 업데이트합니다.
 * 개별 상품 할인, 대량구매 할인, 화요일 특별 할인을 모두 적용합니다.
 */
function handleCalculateCartStuff() {
  // 장바구니 상태 가져오기
  const { getState: getCartState, dispatch: cartDispatch } = useCartState();
  const cartState = getCartState();

  // 상품 상태 가져오기
  const { getState: getProductState } = useProductState();
  const productState = getProductState();

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
    tuesdaySpecial.classList.remove('hidden');
  } else {
    tuesdaySpecial.classList.add('hidden');
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

  document.getElementById('item-count').textContent =
    '🛍️ ' + updatedCartState.itemCount + ' items in cart';

  // 요약 상세 정보 업데이트
  const summaryDetails = document.getElementById('summary-details');
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
    if (updatedCartState.itemCount >= BUSINESS_RULES.BULK_PURCHASE_THRESHOLD) {
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

  // 총액 표시
  const totalDiv = summaryElement.querySelector('.text-2xl');
  if (totalDiv) {
    totalDiv.textContent =
      '₩' + Math.round(updatedCartState.finalTotal).toLocaleString();
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
    const productId = item.id;
    const quantityElem = item.querySelector('.quantity-number');
    const quantity = quantityElem ? parseInt(quantityElem.textContent) : 0;
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

  // 아이템 카운트 업데이트
  const itemCountElement = document.getElementById('item-count');
  if (itemCountElement) {
    const previousCount = parseInt(
      itemCountElement.textContent.match(/\d+/) || '0'
    );
    itemCountElement.textContent =
      '🛍️ ' + updatedCartState.itemCount + ' items in cart';
    if (previousCount !== updatedCartState.itemCount) {
      itemCountElement.setAttribute('data-changed', 'true');
    }
  }

  // 재고 정보 업데이트
  handleStockInfoUpdate();
}
/**
 * ========================================
 * 재고 관련 함수들 (Stock Related Functions)
 * ========================================
 */
// 재고 관련 함수들은 stockEventHandlers.ts에서 처리됨
// 가격 업데이트 관련 함수들은 cartPriceHandlers.ts에서 처리됨
/**
 * ========================================
 * 애플리케이션 실행 및 이벤트 리스너 등록
 * ========================================
 */

// 애플리케이션 초기화 실행
main();
// 장바구니 추가 버튼 이벤트는 AddToCartButton 컴포넌트에서 처리됨

// 장바구니 아이템 클릭 이벤트는 CartDisplay 컴포넌트에서 처리됨
