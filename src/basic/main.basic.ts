import { useCartState } from './features/cart/store/cartState';
import { useProductState } from './features/product/store/productState';
import { useUIState } from './features/ui/store/uiState';
import { usePointsState } from './features/points/store/pointsState';
import { initializeProducts } from './features/product/productUtils';
import { setupEventListeners } from './features/events/eventManager';
import { App } from './features/layout/App';
import { handleCalculateCartStuff } from './features/order/orderSummaryHandlers';
import { onUpdateSelectOptions } from './features/product/productEventHandlers';

/**
 * ========================================
 * 애플리케이션 초기화 (Application Initialization)
 * ========================================
 *
 * 애플리케이션의 메인 진입점입니다.
 * DOM 구조 생성, 이벤트 리스너 등록, 타이머 설정을 담당합니다.
 */
function main() {
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

  if (root) {
    root.appendChild(app);
  }

  onUpdateSelectOptions();
  handleCalculateCartStuff();
}

main();
