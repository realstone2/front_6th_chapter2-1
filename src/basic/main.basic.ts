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
import { handleCalculateCartStuff } from '../features/order/orderSummaryHandlers.ts';

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
// 요약 정보 관련 함수들은 orderSummaryHandlers.ts에서 처리됨
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
