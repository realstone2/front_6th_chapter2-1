/**
 * ========================================
 * 상수 정의 (Constants)
 * ========================================
 */

/**
 * 상품 ID 상수들
 * 각 상품의 고유 식별자를 정의합니다.
 */
const PRODUCT_IDS = {
  KEYBOARD: 'p1',
  MOUSE: 'p2',
  MONITOR_ARM: 'p3',
  LAPTOP_CASE: 'p4',
  SPEAKER: 'p5',
};

/**
 * 할인율 상수들
 * 각 상품별 개별 할인율을 정의합니다.
 * 10개 이상 구매 시 적용되는 할인율입니다.
 */
const DISCOUNT_RATES = {
  KEYBOARD: 0.1, // 10%
  MOUSE: 0.15, // 15%
  MONITOR_ARM: 0.2, // 20%
  LAPTOP_CASE: 0.05, // 5%
  SPEAKER: 0.25, // 25%
};

/**
 * 비즈니스 규칙 상수들
 * 애플리케이션의 핵심 비즈니스 로직을 정의합니다.
 */
const BUSINESS_RULES = {
  BULK_PURCHASE_THRESHOLD: 30, // 대량구매 기준 수량
  INDIVIDUAL_DISCOUNT_THRESHOLD: 10, // 개별 상품 할인 시작 수량
  LOW_STOCK_THRESHOLD: 5, // 재고 부족 기준
  POINTS_PER_1000_WON: 1, // 1000원당 적립 포인트
  TUESDAY_DAY_OF_WEEK: 2, // 화요일 (0=일요일, 1=월요일, ...)
  LIGHTNING_SALE_DISCOUNT: 0.2, // 번개세일 할인율 (20%)
  SUGGESTED_SALE_DISCOUNT: 0.05, // 추천할인 할인율 (5%)
  TUESDAY_SPECIAL_DISCOUNT: 0.1, // 화요일 특별 할인율 (10%)
};

/**
 * 타이머 상수들
 * 자동 할인 이벤트의 타이밍을 정의합니다.
 */
const TIMER_INTERVALS = {
  LIGHTNING_SALE_DELAY: 10000, // 번개세일 시작 지연시간 (10초)
  LIGHTNING_SALE_INTERVAL: 30000, // 번개세일 반복 간격 (30초)
  SUGGESTED_SALE_DELAY: 20000, // 추천할인 시작 지연시간 (20초)
  SUGGESTED_SALE_INTERVAL: 60000, // 추천할인 반복 간격 (60초)
};

/**
 * ========================================
 * 전역 상태 변수 (Global State Variables)
 * ========================================
 *
 * 애플리케이션의 전역 상태를 관리하는 변수들입니다.
 * 향후 Store 패턴으로 마이그레이션 예정입니다.
 */

// 상품 관련 상태
let productList; // 상품 목록 데이터
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

import { Header } from '../features/header/Header.ts';
import { OrderSummary } from '../features/order/OrderSummary.ts';
import { ManualToggle } from '../features/help/ManualToggle.ts';
import { ManualColumn } from '../features/help/ManualColumn.ts';
import { AddToCartButton } from '../features/cart/AddToCartButton.ts';
import {
  CartItemSummary,
  SubtotalSummary,
  BulkDiscountSummary,
  IndividualDiscountSummary,
  TuesdayDiscountSummary,
  ShippingSummary,
} from '../features/order/SummaryDetails.ts';
import { DiscountInfo } from '../features/order/DiscountInfo.ts';
import { LoyaltyPoints } from '../features/points/LoyaltyPoints.ts';
import { PriceDisplay } from '../features/cart/PriceDisplay.ts';

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
  lastSelected = null;

  // ========================================
  // 2. 상품 데이터 초기화 (Product Data Initialization)
  // ========================================

  productList = [
    {
      id: PRODUCT_IDS.KEYBOARD,
      name: '버그 없애는 키보드',
      val: 10000,
      originalVal: 10000,
      q: 50,
      onSale: false,
      suggestSale: false,
    },
    {
      id: PRODUCT_IDS.MOUSE,
      name: '생산성 폭발 마우스',
      val: 20000,
      originalVal: 20000,
      q: 30,
      onSale: false,
      suggestSale: false,
    },
    {
      id: PRODUCT_IDS.MONITOR_ARM,
      name: '거북목 탈출 모니터암',
      val: 30000,
      originalVal: 30000,
      q: 20,
      onSale: false,
      suggestSale: false,
    },
    {
      id: PRODUCT_IDS.LAPTOP_CASE,
      name: '에러 방지 노트북 파우치',
      val: 15000,
      originalVal: 15000,
      q: 0,
      onSale: false,
      suggestSale: false,
    },
    {
      id: PRODUCT_IDS.SPEAKER,
      name: `코딩할 때 듣는 Lo-Fi 스피커`,
      val: 25000,
      originalVal: 25000,
      q: 10,
      onSale: false,
      suggestSale: false,
    },
  ];

  // ========================================
  // 3. DOM 구조 생성 (DOM Structure Creation)
  // ========================================

  // 3.1 루트 요소 및 헤더 생성
  const root = document.getElementById('app');
  const header = document.createElement('div');
  header.className = 'mb-8';
  header.innerHTML = Header({ itemCount: 0 });

  // 3.2 상품 선택 영역 생성
  productSelector = document.createElement('select');
  productSelector.id = 'product-select';

  const gridContainer = document.createElement('div');
  const leftColumn = document.createElement('div');
  leftColumn['className'] =
    'bg-white border border-gray-200 p-8 overflow-y-auto';

  const selectorContainer = document.createElement('div');
  selectorContainer.className = 'mb-6 pb-6 border-b border-gray-200';
  productSelector.className =
    'w-full p-3 border border-gray-300 rounded-lg text-base mb-3';
  gridContainer.className =
    'grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden';

  // 3.3 버튼 및 재고 정보 영역 생성
  addToCartButton = document.createElement('button');
  stockInformation = document.createElement('div');
  addToCartButton.id = 'add-to-cart';
  stockInformation.id = 'stock-status';
  stockInformation.className = 'text-xs text-red-500 mt-3 whitespace-pre-line';
  addToCartButton.innerHTML = AddToCartButton();
  addToCartButton.className =
    'w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all';

  // 3.4 선택 영역 조립
  selectorContainer.appendChild(productSelector);
  selectorContainer.appendChild(addToCartButton);
  selectorContainer.appendChild(stockInformation);
  leftColumn.appendChild(selectorContainer);

  // 3.5 장바구니 표시 영역 생성
  cartDisplay = document.createElement('div');
  leftColumn.appendChild(cartDisplay);
  cartDisplay.id = 'cart-items';

  // 3.6 주문 요약 영역 생성
  const rightColumn = document.createElement('div');
  rightColumn.className = 'bg-black text-white p-8 flex flex-col';
  rightColumn.innerHTML = OrderSummary();
  summaryElement = rightColumn.querySelector('#cart-total');
  const manualToggle = document.createElement('button');
  manualToggle.onclick = function () {
    manualOverlay.classList.toggle('hidden');
    manualColumn.classList.toggle('translate-x-full');
  };
  manualToggle.className =
    'fixed top-4 right-4 bg-black text-white p-3 rounded-full hover:bg-gray-900 transition-colors z-50';
  manualToggle.innerHTML = ManualToggle();
  const manualOverlay = document.createElement('div');
  manualOverlay.className =
    'fixed inset-0 bg-black/50 z-40 hidden transition-opacity duration-300';
  manualOverlay.onclick = function (e) {
    if (e.target === manualOverlay) {
      manualOverlay.classList.add('hidden');
      manualColumn.classList.add('translate-x-full');
    }
  };
  const manualColumn = document.createElement('div');
  manualColumn.className =
    'fixed right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto z-50 transform translate-x-full transition-transform duration-300';
  manualColumn.innerHTML = ManualColumn();
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
      const luckyIdx = Math.floor(Math.random() * productList.length);
      const luckyItem = productList[luckyIdx];
      if (luckyItem.q > 0 && !luckyItem.onSale) {
        luckyItem.val = Math.round((luckyItem.originalVal * 80) / 100);
        luckyItem.onSale = true;
        alert('⚡번개세일! ' + luckyItem.name + '이(가) 20% 할인 중입니다!');
        onUpdateSelectOptions();
        doUpdatePricesInCart();
      }
    }, TIMER_INTERVALS.LIGHTNING_SALE_INTERVAL);
  }, lightningDelay);
  setTimeout(function () {
    setInterval(function () {
      if (lastSelected) {
        let suggest = null;

        for (let k = 0; k < productList.length; k++) {
          if (productList[k].id !== lastSelected) {
            if (productList[k].q > 0) {
              if (!productList[k].suggestSale) {
                suggest = productList[k];
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

          suggest.val = Math.round((suggest.val * (100 - 5)) / 100);
          suggest.suggestSale = true;
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
  let totalStock;
  let opt;
  let discountText;

  // 드롭다운 초기화
  productSelector.innerHTML = '';
  totalStock = 0;

  // 전체 재고 계산
  for (let idx = 0; idx < productList.length; idx++) {
    const _p = productList[idx];
    totalStock = totalStock + _p.q;
  }

  // 각 상품에 대한 옵션 생성
  for (let i = 0; i < productList.length; i++) {
    (function () {
      const item = productList[i];
      opt = document.createElement('option');
      opt.value = item.id;
      discountText = '';

      // 할인 상태 표시 텍스트 생성
      if (item.onSale) discountText += ' ⚡SALE';
      if (item.suggestSale) discountText += ' 💝추천';

      // 품절 상태 처리
      if (item.q === 0) {
        opt.textContent =
          item.name + ' - ' + item.val + '원 (품절)' + discountText;
        opt.disabled = true;
        opt.className = 'text-gray-400';
      } else {
        // 할인 상태에 따른 옵션 텍스트 및 스타일 설정
        if (item.onSale && item.suggestSale) {
          // 번개세일 + 추천할인 중복 적용
          opt.textContent =
            '⚡💝' +
            item.name +
            ' - ' +
            item.originalVal +
            '원 → ' +
            item.val +
            '원 (25% SUPER SALE!)';
          opt.className = 'text-purple-600 font-bold';
        } else if (item.onSale) {
          // 번개세일만 적용
          opt.textContent =
            '⚡' +
            item.name +
            ' - ' +
            item.originalVal +
            '원 → ' +
            item.val +
            '원 (20% SALE!)';
          opt.className = 'text-red-500 font-bold';
        } else if (item.suggestSale) {
          // 추천할인만 적용
          opt.textContent =
            '💝' +
            item.name +
            ' - ' +
            item.originalVal +
            '원 → ' +
            item.val +
            '원 (5% 추천할인!)';
          opt.className = 'text-blue-500 font-bold';
        } else {
          // 할인 없음
          opt.textContent = item.name + ' - ' + item.val + '원' + discountText;
        }
      }
      productSelector.appendChild(opt);
    })();
  }

  // 재고 부족 시 드롭다운 테두리 색상 변경
  if (totalStock < 50) {
    productSelector.style.borderColor = 'orange';
  } else {
    productSelector.style.borderColor = '';
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
  let subTot;
  const itemDiscounts = [];
  const lowStockItems = [];
  let idx;
  let savedAmount;
  let points;

  // 상태 초기화
  totalAmount = 0;
  itemCount = 0;
  const cartItems = cartDisplay.children;
  subTot = 0;

  // 재고 부족 상품 확인
  for (idx = 0; idx < productList.length; idx++) {
    if (
      productList[idx].q < BUSINESS_RULES.LOW_STOCK_THRESHOLD &&
      productList[idx].q > 0
    ) {
      lowStockItems.push(productList[idx].name);
    }
  }
  for (let i = 0; i < cartItems.length; i++) {
    (function () {
      let curItem;
      for (let j = 0; j < productList.length; j++) {
        if (productList[j].id === cartItems[i].id) {
          curItem = productList[j];
          break;
        }
      }
      const qtyElem = cartItems[i].querySelector('.quantity-number');
      const q = parseInt(qtyElem.textContent);
      const itemTot = curItem.val * q;
      let disc = 0;
      itemCount += q;
      subTot += itemTot;
      const itemDiv = cartItems[i];
      const priceElems = itemDiv.querySelectorAll('.text-lg, .text-xs');
      priceElems.forEach(function (elem) {
        if (elem.classList.contains('text-lg')) {
          elem.style.fontWeight =
            q >= BUSINESS_RULES.INDIVIDUAL_DISCOUNT_THRESHOLD
              ? 'bold'
              : 'normal';
        }
      });
      if (q >= BUSINESS_RULES.INDIVIDUAL_DISCOUNT_THRESHOLD) {
        if (curItem.id === PRODUCT_IDS.KEYBOARD) {
          disc = DISCOUNT_RATES.KEYBOARD;
        } else {
          if (curItem.id === PRODUCT_IDS.MOUSE) {
            disc = DISCOUNT_RATES.MOUSE;
          } else {
            if (curItem.id === PRODUCT_IDS.MONITOR_ARM) {
              disc = DISCOUNT_RATES.MONITOR_ARM;
            } else {
              if (curItem.id === PRODUCT_IDS.LAPTOP_CASE) {
                disc = DISCOUNT_RATES.LAPTOP_CASE;
              } else {
                if (curItem.id === PRODUCT_IDS.SPEAKER) {
                  disc = DISCOUNT_RATES.SPEAKER;
                }
              }
            }
          }
        }
        if (disc > 0) {
          itemDiscounts.push({ name: curItem.name, discount: disc * 100 });
        }
      }
      totalAmount += itemTot * (1 - disc);
    })();
  }
  let discRate = 0;
  const originalTotal = subTot;
  if (itemCount >= BUSINESS_RULES.BULK_PURCHASE_THRESHOLD) {
    totalAmount = (subTot * 75) / 100;
    discRate = 25 / 100;
  } else {
    discRate = (subTot - totalAmount) / subTot;
  }

  const today = new Date();
  const isTuesday = today.getDay() === BUSINESS_RULES.TUESDAY_DAY_OF_WEEK;
  const tuesdaySpecial = document.getElementById('tuesday-special');
  if (isTuesday) {
    if (totalAmount > 0) {
      totalAmount = (totalAmount * 90) / 100;

      discRate = 1 - totalAmount / originalTotal;
      tuesdaySpecial.classList.remove('hidden');
    } else {
      tuesdaySpecial.classList.add('hidden');
    }
  } else {
    tuesdaySpecial.classList.add('hidden');
  }
  document.getElementById('item-count').textContent =
    '🛍️ ' + itemCount + ' items in cart';
  const summaryDetails = document.getElementById('summary-details');
  summaryDetails.innerHTML = '';
  if (subTot > 0) {
    for (let i = 0; i < cartItems.length; i++) {
      let curItem;
      for (let j = 0; j < productList.length; j++) {
        if (productList[j].id === cartItems[i].id) {
          curItem = productList[j];
          break;
        }
      }
      const qtyElem = cartItems[i].querySelector('.quantity-number');
      const q = parseInt(qtyElem.textContent);
      const itemTotal = curItem.val * q;
      summaryDetails.innerHTML += CartItemSummary({
        item: curItem,
        quantity: q,
      });
    }

    summaryDetails.innerHTML += SubtotalSummary({ subTotal: subTot });

    if (itemCount >= BUSINESS_RULES.BULK_PURCHASE_THRESHOLD) {
      summaryDetails.innerHTML += BulkDiscountSummary();
    } else if (itemDiscounts.length > 0) {
      summaryDetails.innerHTML += IndividualDiscountSummary({ itemDiscounts });
    }
    if (isTuesday) {
      if (totalAmount > 0) {
        summaryDetails.innerHTML += TuesdayDiscountSummary();
      }
    }
    summaryDetails.innerHTML += ShippingSummary();
  }
  const totalDiv = summaryElement.querySelector('.text-2xl');
  if (totalDiv) {
    totalDiv.textContent = '₩' + Math.round(totalAmount).toLocaleString();
  }
  const loyaltyPointsDiv = document.getElementById('loyalty-points');
  if (loyaltyPointsDiv) {
    points = Math.floor(totalAmount / 1000);
    if (points > 0) {
      loyaltyPointsDiv.textContent = '적립 포인트: ' + points + 'p';
      loyaltyPointsDiv.style.display = 'block';
    } else {
      loyaltyPointsDiv.textContent = '적립 포인트: 0p';
      loyaltyPointsDiv.style.display = 'block';
    }
  }
  const discountInfoDiv = document.getElementById('discount-info');
  discountInfoDiv.innerHTML = '';

  if (discRate > 0 && totalAmount > 0) {
    savedAmount = originalTotal - totalAmount;
    discountInfoDiv.innerHTML = DiscountInfo({ discRate, savedAmount });
  }
  const itemCountElement = document.getElementById('item-count');
  if (itemCountElement) {
    const previousCount = parseInt(
      itemCountElement.textContent.match(/\d+/) || 0
    );
    itemCountElement.textContent = '🛍️ ' + itemCount + ' items in cart';
    if (previousCount !== itemCount) {
      itemCountElement.setAttribute('data-changed', 'true');
    }
  }
  let stockMsg = '';

  for (let stockIdx = 0; stockIdx < productList.length; stockIdx++) {
    const item = productList[stockIdx];
    if (item.q < BUSINESS_RULES.LOW_STOCK_THRESHOLD) {
      if (item.q > 0) {
        stockMsg =
          stockMsg + item.name + ': 재고 부족 (' + item.q + '개 남음)\n';
      } else {
        stockMsg = stockMsg + item.name + ': 품절\n';
      }
    }
  }
  stockInformation.textContent = stockMsg;

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
  for (const node of nodes) {
    let product = null;

    for (let pIdx = 0; pIdx < productList.length; pIdx++) {
      if (productList[pIdx].id === node.id) {
        product = productList[pIdx];
        break;
      }
    }
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
    ptsTag.innerHTML = LoyaltyPoints({ bonusPoints, pointsDetail });
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
  let sum;
  let i;
  let currentProduct;
  sum = 0;

  for (i = 0; i < productList.length; i++) {
    currentProduct = productList[i];
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
  productList.forEach(function (item) {
    if (item.q < BUSINESS_RULES.LOW_STOCK_THRESHOLD) {
      if (item.q > 0) {
        infoMsg = infoMsg + item.name + ': 재고 부족 (' + item.q + '개 남음)\n';
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
    let product = null;

    // 해당 상품 정보 찾기
    for (let productIdx = 0; productIdx < productList.length; productIdx++) {
      if (productList[productIdx].id === itemId) {
        product = productList[productIdx];
        break;
      }
    }

    if (product) {
      const priceDiv = cartItems[i].querySelector('.text-lg');
      const nameDiv = cartItems[i].querySelector('h3');

      // 할인 상태에 따른 UI 업데이트
      priceDiv.innerHTML = PriceDisplay({ product });

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

  let hasItem = false;
  for (let idx = 0; idx < productList.length; idx++) {
    if (productList[idx].id === selItem) {
      hasItem = true;
      break;
    }
  }
  if (!selItem || !hasItem) {
    return;
  }
  let itemToAdd = null;
  for (let j = 0; j < productList.length; j++) {
    if (productList[j].id === selItem) {
      itemToAdd = productList[j];
      break;
    }
  }
  if (itemToAdd && itemToAdd.q > 0) {
    const item = document.getElementById(itemToAdd['id']);
    if (item) {
      const qtyElem = item.querySelector('.quantity-number');
      const newQty = parseInt(qtyElem['textContent']) + 1;
      if (newQty <= itemToAdd.q + parseInt(qtyElem.textContent)) {
        qtyElem.textContent = newQty;
        itemToAdd['q']--;
      } else {
        alert('재고가 부족합니다.');
      }
    } else {
      const newItem = document.createElement('div');
      newItem.id = itemToAdd.id;
      newItem.className =
        'grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0';
      newItem.innerHTML = `
        <div class="w-20 h-20 bg-gradient-black relative overflow-hidden">
          <div class="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
        </div>
        <div>
          <h3 class="text-base font-normal mb-1 tracking-tight">${itemToAdd.onSale && itemToAdd.suggestSale ? '⚡💝' : itemToAdd.onSale ? '⚡' : itemToAdd.suggestSale ? '💝' : ''}${itemToAdd.name}</h3>
          <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
          <p class="text-xs text-black mb-3">${itemToAdd.onSale || itemToAdd.suggestSale ? '<span class="line-through text-gray-400">₩' + itemToAdd.originalVal.toLocaleString() + '</span> <span class="' + (itemToAdd.onSale && itemToAdd.suggestSale ? 'text-purple-600' : itemToAdd.onSale ? 'text-red-500' : 'text-blue-500') + '">₩' + itemToAdd.val.toLocaleString() + '</span>' : '₩' + itemToAdd.val.toLocaleString()}</p>
          <div class="flex items-center gap-4">
            <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${itemToAdd.id}" data-change="-1">−</button>
            <span class="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums">1</span>
            <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${itemToAdd.id}" data-change="1">+</button>
          </div>
        </div>
        <div class="text-right">
          <div class="text-lg mb-2 tracking-tight tabular-nums">${itemToAdd.onSale || itemToAdd.suggestSale ? '<span class="line-through text-gray-400">₩' + itemToAdd.originalVal.toLocaleString() + '</span> <span class="' + (itemToAdd.onSale && itemToAdd.suggestSale ? 'text-purple-600' : itemToAdd.onSale ? 'text-red-500' : 'text-blue-500') + '">₩' + itemToAdd.val.toLocaleString() + '</span>' : '₩' + itemToAdd.val.toLocaleString()}</div>
          <a class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black" data-product-id="${itemToAdd.id}">Remove</a>
        </div>
      `;
      cartDisplay.appendChild(newItem);
      itemToAdd.q--;
    }
    handleCalculateCartStuff();
    lastSelected = selItem;
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
    let prod = null;

    for (let prdIdx = 0; prdIdx < productList.length; prdIdx++) {
      if (productList[prdIdx].id === prodId) {
        prod = productList[prdIdx];
        break;
      }
    }
    if (tgt.classList.contains('quantity-change')) {
      const qtyChange = parseInt(tgt.dataset.change);
      const qtyElem = itemElem.querySelector('.quantity-number');
      const currentQty = parseInt(qtyElem.textContent);
      const newQty = currentQty + qtyChange;
      if (newQty > 0 && newQty <= prod.q + currentQty) {
        qtyElem.textContent = newQty;
        prod.q -= qtyChange;
      } else if (newQty <= 0) {
        prod.q += currentQty;
        itemElem.remove();
      } else {
        alert('재고가 부족합니다.');
      }
    } else if (tgt.classList.contains('remove-item')) {
      const qtyElem = itemElem.querySelector('.quantity-number');
      const remQty = parseInt(qtyElem.textContent);
      prod.q += remQty;
      itemElem.remove();
    }
    if (prod && prod.q < BUSINESS_RULES.LOW_STOCK_THRESHOLD) {
      // Handle low stock scenario if needed
    }
    handleCalculateCartStuff();
    onUpdateSelectOptions();
  }
});
