안녕하세요.
main.basic.js 코드를 리팩토링할 것입니다.

# 더티코드 개선 과제 개발 계획

## 📋 현재 상황 분석

### 1. 과제 개요

- **목표**: `/src/basic/main.basic.js`의 더티코드를 클린코드로 리팩토링
- **제약사항**:
  - 바닐라 JavaScript만 사용
  - 기존 기능과 동일한 동작 보장
  - 테스트 코드 모두 통과
  - React + TypeScript 고도화를 염두에 둔 구조 설계

### 2. 현재 코드 상태

- **파일**: `src/basic/main.basic.js` (763줄)
- **주요 문제점**:
  - 전역 변수 남용 (`prodList`, `totalAmt`, `itemCnt` 등)
  - 과도하게 긴 함수들 (`handleCalculateCartStuff` - 200+ 줄)
  - 중복 코드 다수 (포인트 계산, 재고 체크 등)
  - 매직 넘버/문자열 하드코딩
  - 비즈니스 로직과 UI 로직 혼재
  - 일관성 없는 네이밍
  - 에러 처리 부재

### 3. 기존 구조 활용

- **Component 클래스**: `src/app/component.js` - UI 컴포넌트 기반 구조
- **Store 시스템**: `src/app/store/` - 상태 관리 인프라
  - `createStore.ts` - Redux 스타일 스토어
  - `createObserver.ts` - 옵저버 패턴
  - `createStorage.ts` - 로컬 스토리지 관리
  - `shallowEquals.ts` - 얕은 비교 유틸리티
- **Feature 폴더 구조**: `src/features/` - 도메인별 분리
  - `cart/`, `product/`, `order/`, `header/`, `help/`

### 4. 테스트 요구사항

- **테스트 파일**: `src/basic/__tests__/basic.test.js` (674줄)
- **테스트 범위**: 상품 정보, 할인 정책, 포인트 시스템, UI/UX, 기능 요구사항, 예외 처리
- **통과해야 할 테스트**: 50+ 개의 상세 테스트 케이스

## 🎯 개발적 리팩토링 전략

### Phase 1: 상수 및 설정 분리 (1일)

```javascript
// src/constants/index.js
export const PRODUCT_IDS = {
  KEYBOARD: "p1",
  MOUSE: "p2",
  MONITOR_ARM: "p3",
  LAPTOP_POUCH: "p4",
  SPEAKER: "p5",
};

export const DISCOUNT_RATES = {
  BULK_30_PLUS: 0.25,
  TUESDAY_SPECIAL: 0.1,
  LIGHTNING_SALE: 0.2,
  RECOMMENDED_SALE: 0.05,
  INDIVIDUAL: {
    [PRODUCT_IDS.KEYBOARD]: 0.1,
    [PRODUCT_IDS.MOUSE]: 0.15,
    [PRODUCT_IDS.MONITOR_ARM]: 0.2,
    [PRODUCT_IDS.LAPTOP_POUCH]: 0.05,
    [PRODUCT_IDS.SPEAKER]: 0.25,
  },
};

export const STOCK_THRESHOLDS = {
  LOW_STOCK: 5,
  OUT_OF_STOCK: 0,
  TOTAL_LOW_STOCK: 50,
};

export const TIMING = {
  LIGHTNING_SALE_INTERVAL: 30000,
  RECOMMENDED_SALE_INTERVAL: 60000,
  LIGHTNING_SALE_DELAY: 10000,
  RECOMMENDED_SALE_DELAY: 20000,
};
```

### Phase 2: Store 시스템 구현 (2일)

#### ProductStore 구현

```javascript
// src/features/product/productStore.js
import { createStore } from "../../app/store/createStore";
import { PRODUCT_IDS } from "../../constants";

const initialState = {
  products: [
    {
      id: PRODUCT_IDS.KEYBOARD,
      name: "버그 없애는 키보드",
      price: 10000,
      originalPrice: 10000,
      stock: 50,
      onSale: false,
      suggestSale: false,
    },
    {
      id: PRODUCT_IDS.MOUSE,
      name: "생산성 폭발 마우스",
      price: 20000,
      originalPrice: 20000,
      stock: 30,
      onSale: false,
      suggestSale: false,
    },
    {
      id: PRODUCT_IDS.MONITOR_ARM,
      name: "거북목 탈출 모니터암",
      price: 30000,
      originalPrice: 30000,
      stock: 20,
      onSale: false,
      suggestSale: false,
    },
    {
      id: PRODUCT_IDS.LAPTOP_POUCH,
      name: "에러 방지 노트북 파우치",
      price: 15000,
      originalPrice: 15000,
      stock: 0,
      onSale: false,
      suggestSale: false,
    },
    {
      id: PRODUCT_IDS.SPEAKER,
      name: "코딩할 때 듣는 Lo-Fi 스피커",
      price: 25000,
      originalPrice: 25000,
      stock: 10,
      onSale: false,
      suggestSale: false,
    },
  ],
};

const productReducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_STOCK":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.productId
            ? { ...p, stock: Math.max(0, p.stock - action.payload.quantity) }
            : p
        ),
      };
    case "RESTORE_STOCK":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.productId
            ? { ...p, stock: p.stock + action.payload.quantity }
            : p
        ),
      };
    case "APPLY_LIGHTNING_SALE":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.productId
            ? { ...p, price: Math.round(p.originalPrice * 0.8), onSale: true }
            : p
        ),
      };
    case "APPLY_RECOMMENDED_SALE":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.productId
            ? {
                ...p,
                price: Math.round(p.originalPrice * 0.95),
                suggestSale: true,
              }
            : p
        ),
      };
    default:
      return state;
  }
};

export const productStore = createStore(productReducer, initialState);
```

#### CartStore 구현

```javascript
// src/features/cart/cartStore.js
import { createStore } from "../../app/store/createStore";
import { DISCOUNT_RATES } from "../../constants";

const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
  discountRate: 0,
  savedAmount: 0,
  subtotal: 0,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEM":
      return addItemToCart(state, action.payload);
    case "REMOVE_ITEM":
      return removeItemFromCart(state, action.payload);
    case "UPDATE_QUANTITY":
      return updateItemQuantity(state, action.payload);
    case "CALCULATE_TOTAL":
      return calculateCartTotal(state);
    case "CLEAR_CART":
      return { ...initialState };
    default:
      return state;
  }
};

function addItemToCart(state, { productId, quantity = 1 }) {
  const existingItem = state.items.find((item) => item.productId === productId);

  if (existingItem) {
    return {
      ...state,
      items: state.items.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ),
    };
  } else {
    return {
      ...state,
      items: [...state.items, { productId, quantity }],
    };
  }
}

function removeItemFromCart(state, { productId }) {
  return {
    ...state,
    items: state.items.filter((item) => item.productId !== productId),
  };
}

function updateItemQuantity(state, { productId, change }) {
  return {
    ...state,
    items: state.items
      .map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      )
      .filter((item) => item.quantity > 0),
  };
}

export const cartStore = createStore(cartReducer, initialState);
```

### Phase 3: 이벤트 위임 패턴 구현 (1일)

#### EventManager 구현

```javascript
// src/app/eventManager.js
import { cartStore } from "../features/cart/cartStore";
import { productStore } from "../features/product/productStore";

export class EventManager {
  constructor() {
    this.delegatedEvents = new Map();
    this.setupEventDelegation();
  }

  setupEventDelegation() {
    // 단일 이벤트 리스너로 모든 이벤트 처리
    document.addEventListener("click", (event) => {
      this.handleDelegatedClick(event);
    });

    document.addEventListener("change", (event) => {
      this.handleDelegatedChange(event);
    });
  }

  handleDelegatedClick(event) {
    const target = event.target;

    // 수량 변경 버튼
    if (target.classList.contains("quantity-change")) {
      this.handleQuantityChange(target);
      return;
    }

    // 상품 제거 버튼
    if (target.classList.contains("remove-item")) {
      this.handleRemoveItem(target);
      return;
    }

    // Add to Cart 버튼
    if (target.id === "add-to-cart") {
      this.handleAddToCart();
      return;
    }

    // 도움말 토글 버튼
    if (target.closest(".fixed.top-4.right-4")) {
      this.handleHelpToggle();
      return;
    }

    // 모달 배경 클릭
    if (
      target.classList.contains("fixed") &&
      target.classList.contains("inset-0")
    ) {
      this.handleModalBackgroundClick();
      return;
    }
  }

  handleDelegatedChange(event) {
    const target = event.target;

    // 상품 선택 드롭다운
    if (target.id === "product-select") {
      this.handleProductSelection(target);
      return;
    }
  }

  handleQuantityChange(target) {
    const productId = target.dataset.productId;
    const change = parseInt(target.dataset.change);

    cartStore.dispatch({
      type: "UPDATE_QUANTITY",
      payload: { productId, change },
    });
  }

  handleRemoveItem(target) {
    const productId = target.dataset.productId;

    cartStore.dispatch({
      type: "REMOVE_ITEM",
      payload: { productId },
    });
  }

  handleAddToCart() {
    const productSelect = document.getElementById("product-select");
    const selectedProductId = productSelect.value;

    if (selectedProductId) {
      cartStore.dispatch({
        type: "ADD_ITEM",
        payload: { productId: selectedProductId, quantity: 1 },
      });
    }
  }

  handleProductSelection(target) {
    // 상품 선택 시 재고 정보 업데이트
    this.updateStockInfo();
  }

  handleHelpToggle() {
    const modal = document.querySelector(".fixed.inset-0");
    const slidePanel = document.querySelector(".fixed.right-0.top-0");

    modal.classList.toggle("hidden");
    slidePanel.classList.toggle("translate-x-full");
  }

  handleModalBackgroundClick() {
    const modal = document.querySelector(".fixed.inset-0");
    const slidePanel = document.querySelector(".fixed.right-0.top-0");

    modal.classList.add("hidden");
    slidePanel.classList.add("translate-x-full");
  }

  updateStockInfo() {
    // 재고 정보 업데이트 로직
  }
}
```

### Phase 4: 비즈니스 로직 분리 (2일)

#### DiscountCalculator 구현

```javascript
// src/features/cart/discountCalculator.js
import { DISCOUNT_RATES } from "../../constants";

export class DiscountCalculator {
  static calculateIndividualDiscount(productId, quantity) {
    if (quantity < 10) return 0;

    const discountRate = DISCOUNT_RATES.INDIVIDUAL[productId] || 0;
    return discountRate;
  }

  static calculateBulkDiscount(totalQuantity) {
    return totalQuantity >= 30 ? DISCOUNT_RATES.BULK_30_PLUS : 0;
  }

  static calculateTuesdayDiscount() {
    const today = new Date();
    return today.getDay() === 2 ? DISCOUNT_RATES.TUESDAY_SPECIAL : 0;
  }

  static calculateTotalDiscount(items, totalQuantity) {
    const individualDiscounts = items.map((item) =>
      this.calculateIndividualDiscount(item.productId, item.quantity)
    );

    const bulkDiscount = this.calculateBulkDiscount(totalQuantity);
    const tuesdayDiscount = this.calculateTuesdayDiscount();

    // 할인 우선순위: 대량구매 > 개별할인 > 화요일할인
    const maxIndividualDiscount = Math.max(...individualDiscounts, 0);
    const primaryDiscount = Math.max(bulkDiscount, maxIndividualDiscount);

    return primaryDiscount + tuesdayDiscount;
  }
}
```

#### PointCalculator 구현

```javascript
// src/features/cart/pointCalculator.js
import { PRODUCT_IDS } from "../../constants";

export class PointCalculator {
  static calculateBasePoints(totalAmount) {
    return Math.floor(totalAmount / 1000);
  }

  static calculateBonusPoints(items, totalQuantity, basePoints) {
    let bonusPoints = 0;

    // 화요일 2배
    if (new Date().getDay() === 2) {
      bonusPoints += basePoints;
    }

    // 키보드+마우스 세트
    const hasKeyboard = items.some(
      (item) => item.productId === PRODUCT_IDS.KEYBOARD
    );
    const hasMouse = items.some((item) => item.productId === PRODUCT_IDS.MOUSE);
    if (hasKeyboard && hasMouse) {
      bonusPoints += 50;
    }

    // 풀세트 (키보드+마우스+모니터암)
    const hasMonitorArm = items.some(
      (item) => item.productId === PRODUCT_IDS.MONITOR_ARM
    );
    if (hasKeyboard && hasMouse && hasMonitorArm) {
      bonusPoints += 100;
    }

    // 수량별 보너스
    if (totalQuantity >= 30) {
      bonusPoints += 100;
    } else if (totalQuantity >= 20) {
      bonusPoints += 50;
    } else if (totalQuantity >= 10) {
      bonusPoints += 20;
    }

    return bonusPoints;
  }

  static getPointsDetail(items, totalQuantity, basePoints) {
    const details = [];

    if (basePoints > 0) {
      details.push(`기본: ${basePoints}p`);
    }

    if (new Date().getDay() === 2 && basePoints > 0) {
      details.push("화요일 2배");
    }

    const hasKeyboard = items.some(
      (item) => item.productId === PRODUCT_IDS.KEYBOARD
    );
    const hasMouse = items.some((item) => item.productId === PRODUCT_IDS.MOUSE);
    const hasMonitorArm = items.some(
      (item) => item.productId === PRODUCT_IDS.MONITOR_ARM
    );

    if (hasKeyboard && hasMouse) {
      details.push("키보드+마우스 세트 +50p");
    }

    if (hasKeyboard && hasMouse && hasMonitorArm) {
      details.push("풀세트 구매 +100p");
    }

    if (totalQuantity >= 30) {
      details.push("대량구매(30개+) +100p");
    } else if (totalQuantity >= 20) {
      details.push("대량구매(20개+) +50p");
    } else if (totalQuantity >= 10) {
      details.push("대량구매(10개+) +20p");
    }

    return details;
  }
}
```

### Phase 5: UI 컴포넌트 분리 (2일)

#### CartComponent 구현

```javascript
// src/features/cart/cartComponent.js
import { Component } from "../../app/component.js";
import { cartStore } from "./cartStore.js";
import { productStore } from "../product/productStore.js";

export class CartComponent extends Component {
  constructor(props) {
    super(props);
    this.cartStore = cartStore;
    this.productStore = productStore;
    this.subscribeToStore();
  }

  subscribeToStore() {
    this.cartStore.subscribe(() => {
      this.update();
    });
  }

  render() {
    const { items, total, itemCount } = this.cartStore.getState();

    return this.createCartElement(items, total, itemCount);
  }

  createCartElement(items, total, itemCount) {
    const cartContainer = document.createElement("div");
    cartContainer.id = "cart-items";

    items.forEach((item) => {
      const itemElement = this.createCartItemElement(item);
      cartContainer.appendChild(itemElement);
    });

    return cartContainer;
  }

  createCartItemElement(item) {
    const product = this.productStore
      .getState()
      .products.find((p) => p.id === item.productId);
    if (!product) return document.createElement("div");

    const itemDiv = document.createElement("div");
    itemDiv.id = item.productId;
    itemDiv.className =
      "grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0";

    itemDiv.innerHTML = `
      <div class="w-20 h-20 bg-gradient-black relative overflow-hidden">
        <div class="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
      </div>
      <div>
        <h3 class="text-base font-normal mb-1 tracking-tight">${this.getProductDisplayName(
          product
        )}</h3>
        <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
        <p class="text-xs text-black mb-3">${this.getProductPriceDisplay(
          product
        )}</p>
        <div class="flex items-center gap-4">
          <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${
            item.productId
          }" data-change="-1">−</button>
          <span class="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums">${
            item.quantity
          }</span>
          <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${
            item.productId
          }" data-change="1">+</button>
        </div>
      </div>
      <div class="text-right">
        <div class="text-lg mb-2 tracking-tight tabular-nums">${this.getProductPriceDisplay(
          product
        )}</div>
        <a class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black" data-product-id="${
          item.productId
        }">Remove</a>
      </div>
    `;

    return itemDiv;
  }

  getProductDisplayName(product) {
    let prefix = "";
    if (product.onSale && product.suggestSale) {
      prefix = "⚡💝";
    } else if (product.onSale) {
      prefix = "⚡";
    } else if (product.suggestSale) {
      prefix = "💝";
    }
    return prefix + product.name;
  }

  getProductPriceDisplay(product) {
    if (product.onSale || product.suggestSale) {
      const saleClass =
        product.onSale && product.suggestSale
          ? "text-purple-600"
          : product.onSale
          ? "text-red-500"
          : "text-blue-500";
      return `<span class="line-through text-gray-400">₩${product.originalPrice.toLocaleString()}</span> <span class="${saleClass}">₩${product.price.toLocaleString()}</span>`;
    }
    return `₩${product.price.toLocaleString()}`;
  }
}
```

#### OrderSummaryComponent 구현

```javascript
// src/features/order/orderSummaryComponent.js
import { Component } from "../../app/component.js";
import { cartStore } from "../cart/cartStore.js";
import { DiscountCalculator } from "../cart/discountCalculator.js";
import { PointCalculator } from "../cart/pointCalculator.js";

export class OrderSummaryComponent extends Component {
  constructor(props) {
    super(props);
    this.cartStore = cartStore;
    this.subscribeToStore();
  }

  subscribeToStore() {
    this.cartStore.subscribe(() => {
      this.update();
    });
  }

  render() {
    const { items, total, itemCount, discountRate, savedAmount } =
      this.cartStore.getState();

    return this.createOrderSummaryElement(
      items,
      total,
      itemCount,
      discountRate,
      savedAmount
    );
  }

  createOrderSummaryElement(
    items,
    total,
    itemCount,
    discountRate,
    savedAmount
  ) {
    const summaryDiv = document.createElement("div");
    summaryDiv.className = "bg-black text-white p-8 flex flex-col";

    const basePoints = PointCalculator.calculateBasePoints(total);
    const bonusPoints = PointCalculator.calculateBonusPoints(
      items,
      itemCount,
      basePoints
    );
    const totalPoints = basePoints + bonusPoints;
    const pointsDetail = PointCalculator.getPointsDetail(
      items,
      itemCount,
      basePoints
    );

    summaryDiv.innerHTML = `
      <h2 class="text-xs font-medium mb-5 tracking-extra-wide uppercase">Order Summary</h2>
      <div class="flex-1 flex flex-col">
        <div id="summary-details" class="space-y-3">${this.createSummaryDetails(
          items
        )}</div>
        <div class="mt-auto">
          ${this.createDiscountInfo(discountRate, savedAmount)}
          <div id="cart-total" class="pt-5 border-t border-white/10">
            <div class="flex justify-between items-baseline">
              <span class="text-sm uppercase tracking-wider">Total</span>
              <div class="text-2xl tracking-tight">₩${total.toLocaleString()}</div>
            </div>
            <div id="loyalty-points" class="text-xs text-blue-400 mt-2 text-right">적립 포인트: ${totalPoints}p</div>
          </div>
          ${this.createTuesdaySpecialBanner()}
        </div>
      </div>
      <button class="w-full py-4 bg-white text-black text-sm font-normal uppercase tracking-super-wide cursor-pointer mt-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30">
        Proceed to Checkout
      </button>
      <p class="mt-4 text-2xs text-white/60 text-center leading-relaxed">
        Free shipping on all orders.<br>
        <span id="points-notice">Earn loyalty points with purchase.</span>
      </p>
    `;

    return summaryDiv;
  }

  createSummaryDetails(items) {
    // 주문 요약 상세 정보 생성
  }

  createDiscountInfo(discountRate, savedAmount) {
    if (discountRate > 0) {
      return `
        <div id="discount-info" class="mb-4">
          <div class="bg-green-500/20 rounded-lg p-3">
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
              <span class="text-sm font-medium text-green-400">${(
                discountRate * 100
              ).toFixed(1)}%</span>
            </div>
            <div class="text-2xs text-gray-300">₩${Math.round(
              savedAmount
            ).toLocaleString()} 할인되었습니다</div>
          </div>
        </div>
      `;
    }
    return '<div id="discount-info" class="mb-4"></div>';
  }

  createTuesdaySpecialBanner() {
    const today = new Date();
    if (today.getDay() === 2) {
      return `
        <div id="tuesday-special" class="mt-4 p-3 bg-white/10 rounded-lg">
          <div class="flex items-center gap-2">
            <span class="text-2xs">🎉</span>
            <span class="text-xs uppercase tracking-wide">Tuesday Special 10% Applied</span>
          </div>
        </div>
      `;
    }
    return '<div id="tuesday-special" class="mt-4 p-3 bg-white/10 rounded-lg hidden"></div>';
  }
}
```

## 🚀 구현 우선순위

### 1. 상수 분리 (1일)

- [ ] `src/constants/index.js` 생성
- [ ] 매직 넘버를 의미 있는 상수로 추출
- [ ] 기존 코드에서 상수 사용하도록 수정

### 2. Store 시스템 구현 (2일)

- [ ] `src/features/product/productStore.js` 구현
- [ ] `src/features/cart/cartStore.js` 구현
- [ ] 기존 전역 변수들을 스토어로 이동

### 3. 이벤트 위임 패턴 (1일)

- [ ] `src/app/eventManager.js` 구현
- [ ] 단일 이벤트 리스너로 통합 관리
- [ ] 기존 이벤트 리스너 제거

### 4. 비즈니스 로직 분리 (2일)

- [ ] `src/features/cart/discountCalculator.js` 구현
- [ ] `src/features/cart/pointCalculator.js` 구현
- [ ] 계산 로직 모듈화

### 5. UI 컴포넌트 분리 (2일)

- [ ] `src/features/cart/cartComponent.js` 구현
- [ ] `src/features/order/orderSummaryComponent.js` 구현
- [ ] Component 클래스 활용

### 6. 테스트 통과 확인 (1일)

- [ ] 각 단계마다 테스트 실행
- [ ] 실패하는 테스트 수정
- [ ] 전체 기능 검증

## 📊 성공 지표

### 1. 코드 품질 지표

- [ ] 함수 평균 길이 20줄 이하
- [ ] 전역 변수 수 50% 이상 감소
- [ ] 중복 코드 80% 이상 제거
- [ ] 매직 넘버/문자열 90% 이상 상수화

### 2. 기능 지표

- [ ] 모든 테스트 케이스 통과
- [ ] 기존 기능 100% 동일 동작

### 3. 유지보수성 지표

- [ ] 새로운 기능 추가 시 기존 코드 변경 최소화
- [ ] 버그 수정 시 영향 범위 최소화
- [ ] 코드 가독성 향상
- [ ] 문서화 완성도

이 계획을 따라 단계적으로 진행하면서, 기존에 잘 설계된 구조를 최대한 활용하여 안전하고 체계적인 리팩토링을 진행하겠습니다.
