/**
 * ========================================
 * 전역 상태 변수 (Global State Variables)
 * ========================================
 *
 * 애플리케이션의 전역 상태를 관리하는 변수들입니다.
 * 향후 Store 패턴으로 마이그레이션 예정입니다.
 */

// 상품 관련 상태

let lastSelected; // 마지막 선택된 상품 ID

// 장바구니 관련 상태
let totalAmount = 0; // 장바구니 총 금액
let itemCount; // 장바구니 아이템 총 개수
let cartDisplay; // 장바구니 UI 요소

// UI 요소 참조
let productSelector; // 상품 선택 드롭다운
let addToCartButton; // 장바구니 추가 버튼
let stockInformation; // 재고 정보 표시 영역
let summaryElement; // 주문 요약 정보 요소

// 포인트 관련 상태
let bonusPoints = 0; // 보너스 포인트

import {
  BUSINESS_RULES,
  PRODUCT_IDS,
  TIMER_INTERVALS,
} from '../constants/index.ts';
import { AddToCartButton } from '../features/cart/AddToCartButton.ts';
import { calculateCart } from '../features/cart/cartCalculationUtils.ts';
import { CartDisplay } from '../features/cart/CartDisplay.ts';
import { CartItem } from '../features/cart/CartItem.ts';
import { PriceDisplay } from '../features/cart/PriceDisplay.ts';
import { ProductSelector } from '../features/cart/ProductSelector.ts';
import { SelectorContainer } from '../features/cart/SelectorContainer.ts';
import { StockInformation } from '../features/cart/StockInformation.ts';
import { Header } from '../features/header/Header.ts';
import { ManualColumn } from '../features/help/ManualColumn.ts';
import { ManualOverlay } from '../features/help/ManualOverlay.ts';
import { ManualToggle } from '../features/help/ManualToggle.ts';
import { GridContainer } from '../features/layout/GridContainer.ts';
import { LeftColumn } from '../features/layout/LeftColumn.ts';
import { DiscountInfo } from '../features/order/DiscountInfo.ts';
import { OrderSummary } from '../features/order/OrderSummary.ts';
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
import {
  calculateStockStatus,
  calculateTotalStock,
} from '../features/stock/stockUtils.ts';

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

  totalAmount = 0;
  itemCount = 0;

  // ========================================
  // 2. 상품 데이터 초기화 (Product Data Initialization)
  // ========================================

  // ========================================
  // 3. DOM 구조 생성 (DOM Structure Creation)
  // ========================================

  // 3.1 루트 요소 및 헤더 생성
  const root = document.getElementById('app');
  const header = Header({ itemCount: 0 });

  // 3.2 상품 선택 영역 생성
  productSelector = ProductSelector();

  const gridContainer = GridContainer();
  const leftColumn = LeftColumn();

  const selectorContainer = SelectorContainer();
  productSelector.className =
    'w-full p-3 border border-gray-300 rounded-lg text-base mb-3';

  // 3.3 버튼 및 재고 정보 영역 생성
  addToCartButton = AddToCartButton();
  addToCartButton.id = 'add-to-cart';
  stockInformation = StockInformation();

  // 3.4 선택 영역 조립
  selectorContainer.appendChild(productSelector);
  selectorContainer.appendChild(addToCartButton);
  selectorContainer.appendChild(stockInformation);
  leftColumn.appendChild(selectorContainer);

  // 3.5 장바구니 표시 영역 생성
  cartDisplay = CartDisplay();
  leftColumn.appendChild(cartDisplay);

  // 3.6 주문 요약 영역 생성
  const rightColumn = OrderSummary();
  summaryElement = rightColumn.querySelector('#cart-total');
  const manualToggle = ManualToggle();
  manualToggle.onclick = function () {
    manualOverlay.classList.toggle('hidden');
    manualColumn.classList.toggle('translate-x-full');
  };
  const manualOverlay = ManualOverlay();
  manualOverlay.onclick = function (e) {
    if (e.target === manualOverlay) {
      manualOverlay.classList.add('hidden');
      manualColumn.classList.add('translate-x-full');
    }
  };
  const manualColumn = ManualColumn();
  gridContainer.appendChild(leftColumn);
  gridContainer.appendChild(rightColumn);
  manualOverlay.appendChild(manualColumn);
  root.appendChild(header);
  root.appendChild(gridContainer);
  root.appendChild(manualToggle);
  root.appendChild(manualOverlay);

  onUpdateSelectOptions();
  handleCalculateCartStuff();
  const lightningDelay = Math.random() * TIMER_INTERVALS.LIGHTNING_SALE_DELAY;
  setTimeout(() => {
    setInterval(function () {
      const { getState, dispatch } = useProductState();
      const products = getState().products;
      const luckyIdx = Math.floor(Math.random() * products.length);
      const luckyItem = products[luckyIdx];
      if (luckyItem.q > 0 && !luckyItem.onSale) {
        // 상품 도메인 상태에서 번개세일 적용
        const updatedProduct = {
          ...luckyItem,
          val: Math.round((luckyItem.originalVal * 80) / 100),
          onSale: true,
        };
        dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
        alert('⚡번개세일! ' + luckyItem.name + '이(가) 20% 할인 중입니다!');
        onUpdateSelectOptions();
        doUpdatePricesInCart();
      }
    }, TIMER_INTERVALS.LIGHTNING_SALE_INTERVAL);
  }, lightningDelay);
  setTimeout(function () {
    setInterval(function () {
      const { getState, dispatch } = useProductState();
      const state = getState();
      const lastSelected = state.lastSelected;
      if (lastSelected) {
        let suggest = null;
        const products = state.products;

        for (let k = 0; k < products.length; k++) {
          if (products[k].id !== lastSelected) {
            if (products[k].q > 0) {
              if (!products[k].suggestSale) {
                suggest = products[k];
                break;
              }
            }
          }
        }
        if (suggest) {
          alert(
            '💝 ' +
              suggest.name +
              '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!'
          );

          // 상품 도메인 상태에서 추천세일 적용
          const updatedProduct = {
            ...suggest,
            val: Math.round((suggest.val * (100 - 5)) / 100),
            suggestSale: true,
          };
          dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
          onUpdateSelectOptions();
          doUpdatePricesInCart();
        }
      }
    }, TIMER_INTERVALS.SUGGESTED_SALE_INTERVAL);
  }, Math.random() * TIMER_INTERVALS.SUGGESTED_SALE_DELAY);
}

/**
 * ========================================
 * 상품 관련 함수들 (Product Related Functions)
 * ========================================
 */

/**
 * 상품 선택 옵션 업데이트
 *
 * 상품 목록을 기반으로 드롭다운 옵션을 생성하고 업데이트합니다.
 * 할인 상태, 품절 상태에 따라 옵션 텍스트와 스타일을 변경합니다.
 */
function onUpdateSelectOptions() {
  // 드롭다운 초기화
  productSelector.innerHTML = '';

  // 상품 도메인 상태에서 상품 목록 가져오기
  const state = useProductState().getState();
  const products = state.products;

  // 전체 재고 계산
  const totalStock = calculateTotalStock(products);

  // 상품 옵션 생성 및 렌더링
  const productOptions = createProductOptions(products);
  const optionsHTML = renderProductOptions(productOptions);
  productSelector.innerHTML = optionsHTML;

  // 재고 부족 시 드롭다운 테두리 색상 변경
  const borderColor = getDropdownBorderColor(totalStock);
  productSelector.style.borderColor = borderColor;

  // 마지막 선택된 상품이 있으면 선택
  const lastSelected = state.lastSelected;
  if (lastSelected) {
    productSelector.value = lastSelected;
  }
}
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
  // 상태 초기화
  totalAmount = 0;
  itemCount = 0;
  const cartItems = cartDisplay.children;

  // 장바구니 계산
  const { cartItemCalculations, cartTotals } = calculateCart(
    cartItems,
    useProductState().getState().products
  );

  // 전역 상태 업데이트
  itemCount = cartTotals.totalQuantity;
  let finalTotal = cartTotals.finalTotal;

  // 대량구매 할인 적용
  if (itemCount >= BUSINESS_RULES.BULK_PURCHASE_THRESHOLD) {
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

  totalAmount = finalTotal;

  // UI 업데이트
  document.getElementById('item-count').textContent =
    '🛍️ ' + itemCount + ' items in cart';

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
    if (itemCount >= BUSINESS_RULES.BULK_PURCHASE_THRESHOLD) {
      summaryDetails.innerHTML += BulkDiscountSummary();
    } else if (cartTotals.itemDiscounts.length > 0) {
      summaryDetails.innerHTML += IndividualDiscountSummary({
        itemDiscounts: cartTotals.itemDiscounts,
      });
    }

    if (isTuesday && totalAmount > 0) {
      summaryDetails.appendChild(TuesdayDiscountSummary());
    }

    summaryDetails.appendChild(ShippingSummary());
  }

  // 총액 표시
  const totalDiv = summaryElement.querySelector('.text-2xl');
  if (totalDiv) {
    totalDiv.textContent = '₩' + Math.round(totalAmount).toLocaleString();
  }

  // 포인트 표시
  const loyaltyPointsDiv = document.getElementById('loyalty-points');
  if (loyaltyPointsDiv) {
    const points = Math.floor(totalAmount / 1000);
    loyaltyPointsDiv.textContent =
      points > 0 ? `적립 포인트: ${points}p` : '적립 포인트: 0p';
    loyaltyPointsDiv.style.display = 'block';
  }

  // 할인 정보 표시
  const discountInfoDiv = document.getElementById('discount-info');
  discountInfoDiv.innerHTML = '';

  const discRate =
    cartTotals.subtotal > 0
      ? (cartTotals.subtotal - totalAmount) / cartTotals.subtotal
      : 0;
  if (discRate > 0 && totalAmount > 0) {
    const savedAmount = cartTotals.subtotal - totalAmount;
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
    itemCountElement.textContent = '🛍️ ' + itemCount + ' items in cart';
    if (previousCount !== itemCount) {
      itemCountElement.setAttribute('data-changed', 'true');
    }
  }

  // 재고 정보 업데이트
  const stockStatus = calculateStockStatus(
    useProductState().getState().products
  );
  stockInformation.textContent = stockStatus.stockMessage;

  handleStockInfoUpdate();
  doRenderBonusPoints();
}
/**
 * ========================================
 * 포인트 관련 함수들 (Points Related Functions)
 * ========================================
 */

/**
 * 보너스 포인트 계산 및 표시
 *
 * 구매 금액, 화요일 특별 이벤트, 세트 구매 등을 고려하여
 * 적립 포인트를 계산하고 UI에 표시합니다.
 */
const doRenderBonusPoints = function () {
  let finalPoints;
  const pointsDetail = [];

  let hasKeyboard;
  let hasMouse;
  let hasMonitorArm;

  // 장바구니가 비어있으면 포인트 표시 숨김
  if (cartDisplay.children.length === 0) {
    document.getElementById('loyalty-points').style.display = 'none';
    return;
  }

  // 기본 포인트 계산 (1000원당 1포인트)
  const basePoints = Math.floor(totalAmount / 1000);
  finalPoints = 0;

  if (basePoints > 0) {
    finalPoints = basePoints;
    pointsDetail.push('기본: ' + basePoints + 'p');
  }

  // 화요일 특별 이벤트 (2배 포인트)
  if (new Date().getDay() === BUSINESS_RULES.TUESDAY_DAY_OF_WEEK) {
    if (basePoints > 0) {
      finalPoints = basePoints * 2;
      pointsDetail.push('화요일 2배');
    }
  }

  // 세트 구매 확인
  hasKeyboard = false;
  hasMouse = false;
  hasMonitorArm = false;
  const nodes = cartDisplay.children;

  // 장바구니에 있는 상품들 확인
  const { getState } = useProductState();
  const state = getState();
  for (const node of nodes) {
    // 상품 도메인 상태에서 상품 정보 찾기
    const product = state.products.find(p => p.id === node.id);
    if (!product) continue;

    // 세트 구성 상품 확인
    if (product.id === PRODUCT_IDS.KEYBOARD) {
      hasKeyboard = true;
    } else if (product.id === PRODUCT_IDS.MOUSE) {
      hasMouse = true;
    } else if (product.id === PRODUCT_IDS.MONITOR_ARM) {
      hasMonitorArm = true;
    }
  }

  // 키보드+마우스 세트 보너스
  if (hasKeyboard && hasMouse) {
    finalPoints = finalPoints + 50;
    pointsDetail.push('키보드+마우스 세트 +50p');
  }

  // 풀세트 보너스 (키보드+마우스+모니터암)
  if (hasKeyboard && hasMouse && hasMonitorArm) {
    finalPoints = finalPoints + 100;
    pointsDetail.push('풀세트 구매 +100p');
  }

  if (itemCount >= 30) {
    finalPoints = finalPoints + 100;
    pointsDetail.push('대량구매(30개+) +100p');
  } else {
    if (itemCount >= 20) {
      finalPoints = finalPoints + 50;
      pointsDetail.push('대량구매(20개+) +50p');
    } else {
      if (itemCount >= 10) {
        finalPoints = finalPoints + 20;
        pointsDetail.push('대량구매(10개+) +20p');
      }
    }
  }
  bonusPoints = finalPoints;
  const ptsTag = document.getElementById('loyalty-points');
  if (ptsTag) {
    ptsTag.innerHTML = '';
    ptsTag.appendChild(LoyaltyPoints({ bonusPoints, pointsDetail }));
    ptsTag.style.display = 'block';
  }
};
/**
 * ========================================
 * 재고 관련 함수들 (Stock Related Functions)
 * ========================================
 */

/**
 * 전체 재고 수량 계산
 *
 * 모든 상품의 재고 수량을 합산하여 반환합니다.
 * @returns {number} 전체 재고 수량
 */
function onGetStockTotal() {
  let sum = 0;
  const products = useProductState().getState().products;

  for (let i = 0; i < products.length; i++) {
    const currentProduct = products[i];
    sum += currentProduct.q;
  }
  return sum;
}

/**
 * 재고 정보 업데이트
 *
 * 재고 부족 또는 품절 상태인 상품들의 정보를 수집하고
 * UI에 표시합니다.
 */
const handleStockInfoUpdate = function () {
  let infoMsg;
  infoMsg = '';
  const totalStock = onGetStockTotal();

  // 전체 재고 부족 시나리오 처리 (향후 확장 예정)
  if (totalStock < 30) {
    // Handle low stock scenario if needed
  }

  // 각 상품의 재고 상태 확인
  useProductState()
    .getState()
    .products.forEach(function (item) {
      if (item.q < BUSINESS_RULES.LOW_STOCK_THRESHOLD) {
        if (item.q > 0) {
          infoMsg =
            infoMsg + item.name + ': 재고 부족 (' + item.q + '개 남음)\n';
        } else {
          infoMsg = infoMsg + item.name + ': 품절\n';
        }
      }
    });

  // 재고 정보 UI 업데이트
  stockInformation.textContent = infoMsg;
};
/**
 * ========================================
 * UI 업데이트 함수들 (UI Update Functions)
 * ========================================
 */

/**
 * 장바구니 내 상품 가격 업데이트
 *
 * 할인 상태에 따라 장바구니에 표시된 상품들의
 * 가격과 이름을 업데이트합니다.
 */
function doUpdatePricesInCart() {
  const cartItems = cartDisplay.children;

  for (let i = 0; i < cartItems.length; i++) {
    const itemId = cartItems[i].id;
    // 상품 도메인 상태에서 상품 정보 찾기
    const product = getProductById(itemId);

    if (product) {
      const priceDiv = cartItems[i].querySelector('.text-lg');
      const nameDiv = cartItems[i].querySelector('h3');

      // 할인 상태에 따른 UI 업데이트
      priceDiv.innerHTML = '';
      priceDiv.appendChild(PriceDisplay({ product }));

      if (product.onSale && product.suggestSale) {
        nameDiv.textContent = '⚡💝' + product.name;
      } else if (product.onSale) {
        nameDiv.textContent = '⚡' + product.name;
      } else if (product.suggestSale) {
        nameDiv.textContent = '💝' + product.name;
      } else {
        nameDiv.textContent = product.name;
      }
    }
  }

  // 가격 변경 후 장바구니 재계산
  handleCalculateCartStuff();
}
/**
 * ========================================
 * 애플리케이션 실행 및 이벤트 리스너 등록
 * ========================================
 */

// 애플리케이션 초기화 실행
main();

/**
 * 장바구니 추가 버튼 이벤트 리스너
 *
 * 선택된 상품을 장바구니에 추가하고 관련 UI를 업데이트합니다.
 */
addToCartButton.addEventListener('click', function () {
  const selItem = productSelector.value;

  // 상품 도메인 상태에서 상품 확인
  const { getState, dispatch } = useProductState();
  const state = getState();
  const itemToAdd = state.products.find(p => p.id === selItem);

  if (!selItem || !itemToAdd) {
    return;
  }

  if (itemToAdd.q > 0) {
    const item = document.getElementById(itemToAdd.id);
    if (item) {
      const qtyElem = item.querySelector('.quantity-number');
      const newQty = parseInt(qtyElem.textContent) + 1;
      if (newQty <= itemToAdd.q + parseInt(qtyElem.textContent)) {
        qtyElem.textContent = newQty;
        // 상품 도메인 상태에서 재고 감소
        dispatch({
          type: 'DECREASE_STOCK',
          payload: { productId: itemToAdd.id, quantity: 1 },
        });
      } else {
        alert('재고가 부족합니다.');
      }
    } else {
      const newItem = CartItem({ item: itemToAdd });
      cartDisplay.appendChild(newItem);
      // 상품 도메인 상태에서 재고 감소
      dispatch({
        type: 'DECREASE_STOCK',
        payload: { productId: itemToAdd.id, quantity: 1 },
      });
    }
    handleCalculateCartStuff();
    // 상품 도메인 상태에서 마지막 선택된 상품 설정
    dispatch({ type: 'SET_LAST_SELECTED', payload: selItem });
  }
});

/**
 * 장바구니 아이템 클릭 이벤트 리스너
 *
 * 수량 변경 버튼과 삭제 버튼의 클릭 이벤트를 처리합니다.
 * 재고 관리와 UI 업데이트를 담당합니다.
 */
cartDisplay.addEventListener('click', function (event) {
  const tgt = event.target;
  if (
    tgt.classList.contains('quantity-change') ||
    tgt.classList.contains('remove-item')
  ) {
    const prodId = tgt.dataset.productId;
    const itemElem = document.getElementById(prodId);
    const { getState, dispatch } = useProductState();
    const state = getState();
    const prod = state.products.find(p => p.id === prodId);

    if (tgt.classList.contains('quantity-change')) {
      const qtyChange = parseInt(tgt.dataset.change);
      const qtyElem = itemElem.querySelector('.quantity-number');
      const currentQty = parseInt(qtyElem.textContent);
      const newQty = currentQty + qtyChange;
      if (newQty > 0 && newQty <= prod.q + currentQty) {
        qtyElem.textContent = newQty;
        // 상품 도메인 상태에서 재고 조정
        if (qtyChange > 0) {
          dispatch({
            type: 'DECREASE_STOCK',
            payload: { productId: prodId, quantity: qtyChange },
          });
        } else {
          dispatch({
            type: 'INCREASE_STOCK',
            payload: { productId: prodId, quantity: Math.abs(qtyChange) },
          });
        }
      } else if (newQty <= 0) {
        // 상품 도메인 상태에서 재고 복원
        dispatch({
          type: 'INCREASE_STOCK',
          payload: { productId: prodId, quantity: currentQty },
        });
        itemElem.remove();
      } else {
        alert('재고가 부족합니다.');
      }
    } else if (tgt.classList.contains('remove-item')) {
      const qtyElem = itemElem.querySelector('.quantity-number');
      const remQty = parseInt(qtyElem.textContent);
      // 상품 도메인 상태에서 재고 복원
      dispatch({
        type: 'INCREASE_STOCK',
        payload: { productId: prodId, quantity: remQty },
      });
      itemElem.remove();
    }
    if (prod && prod.q < BUSINESS_RULES.LOW_STOCK_THRESHOLD) {
      // Handle low stock scenario if needed
    }
    handleCalculateCartStuff();
    onUpdateSelectOptions();
  }
});
