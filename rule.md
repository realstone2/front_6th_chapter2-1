# React 마이그레이션 전 리팩토링 계획

## 🎯 목표
현재 명령형(Imperative) 코드를 선언형(Declarative) 코드와 고차함수(Higher-Order Functions)를 활용한 함수형 프로그래밍으로 리팩토링하여 React 마이그레이션을 위한 기반을 마련합니다.

## 📋 현재 코드 분석

### 🔍 주요 문제점들
1. **전역 상태 변수 의존성** - let 변수들로 상태 관리
2. **명령형 DOM 조작** - 직접적인 DOM 조작과 부수 효과
3. **중첩된 for 루프** - 복잡한 반복문과 조건문
4. **함수형 프로그래밍 부족** - map, filter, reduce 등 고차함수 미사용
5. **부수 효과(Side Effects)** - 함수 내에서 외부 상태 변경
6. **테스트 어려움** - 순수 함수가 아닌 함수들

## 🚀 단계별 리팩토링 계획

### Phase 1: 데이터 구조 및 순수 함수 분리 (1-2주)

#### 1.1 상품 데이터 관리 개선
```typescript
// 현재: 전역 변수 productList
let productList;

// 목표: 순수 함수로 데이터 변환
const createProduct = (id: string, name: string, price: number, stock: number) => ({
  id,
  name,
  val: price,
  originalVal: price,
  q: stock,
  onSale: false,
  suggestSale: false,
});

const initializeProducts = () => [
  createProduct(PRODUCT_IDS.KEYBOARD, '버그 없애는 키보드', 10000, 50),
  createProduct(PRODUCT_IDS.MOUSE, '생산성 폭발 마우스', 20000, 30),
  // ...
];
```

#### 1.2 할인 계산 로직 순수 함수화
```typescript
// 현재: handleCalculateCartStuff() 내부의 복잡한 로직
// 목표: 순수 함수들로 분리
const calculateIndividualDiscount = (product: Product, quantity: number) => {
  if (quantity < BUSINESS_RULES.INDIVIDUAL_DISCOUNT_THRESHOLD) return 0;
  return DISCOUNT_RATES[product.id] || 0;
};

const calculateBulkDiscount = (totalQuantity: number) => {
  return totalQuantity >= BUSINESS_RULES.BULK_PURCHASE_THRESHOLD ? 0.25 : 0;
};

const calculateTuesdayDiscount = (isTuesday: boolean) => {
  return isTuesday ? BUSINESS_RULES.TUESDAY_SPECIAL_DISCOUNT : 0;
};
```

#### 1.3 포인트 계산 로직 순수 함수화
```typescript
const calculateBasePoints = (totalAmount: number) => 
  Math.floor(totalAmount / 1000);

const calculateSetBonus = (cartItems: CartItem[]) => {
  const hasKeyboard = cartItems.some(item => item.id === PRODUCT_IDS.KEYBOARD);
  const hasMouse = cartItems.some(item => item.id === PRODUCT_IDS.MOUSE);
  const hasMonitorArm = cartItems.some(item => item.id === PRODUCT_IDS.MONITOR_ARM);
  
  if (hasKeyboard && hasMouse && hasMonitorArm) return 100;
  if (hasKeyboard && hasMouse) return 50;
  return 0;
};
```

### Phase 2: 고차함수 활용한 데이터 처리 (1주)

#### 2.1 상품 목록 처리 개선
```typescript
// 현재: for 루프로 재고 계산
let totalStock = 0;
for (let idx = 0; idx < productList.length; idx++) {
  totalStock = totalStock + productList[idx].q;
}

// 목표: reduce 사용
const calculateTotalStock = (products: Product[]) => 
  products.reduce((total, product) => total + product.q, 0);

// 현재: for 루프로 재고 부족 상품 찾기
const lowStockItems = [];
for (idx = 0; idx < productList.length; idx++) {
  if (productList[idx].q < BUSINESS_RULES.LOW_STOCK_THRESHOLD && productList[idx].q > 0) {
    lowStockItems.push(productList[idx].name);
  }
}

// 목표: filter 사용
const getLowStockItems = (products: Product[]) => 
  products
    .filter(product => product.q < BUSINESS_RULES.LOW_STOCK_THRESHOLD && product.q > 0)
    .map(product => product.name);
```

#### 2.2 장바구니 아이템 처리 개선
```typescript
// 현재: for 루프로 장바구니 계산
for (let i = 0; i < cartItems.length; i++) {
  // 복잡한 계산 로직...
}

// 목표: map과 reduce 사용
const calculateCartTotals = (cartItems: CartItem[], products: Product[]) => {
  return cartItems.map(cartItem => {
    const product = products.find(p => p.id === cartItem.id);
    const quantity = parseInt(cartItem.querySelector('.quantity-number').textContent);
    return {
      product,
      quantity,
      subtotal: product.val * quantity,
      discount: calculateIndividualDiscount(product, quantity)
    };
  }).reduce((acc, item) => ({
    totalQuantity: acc.totalQuantity + item.quantity,
    subtotal: acc.subtotal + item.subtotal,
    totalDiscount: acc.totalDiscount + (item.subtotal * item.discount)
  }), { totalQuantity: 0, subtotal: 0, totalDiscount: 0 });
};
```

### Phase 3: 상태 관리 개선 (1주)

#### 3.1 상태 업데이트 함수들 생성
```typescript
// 현재: 전역 변수 직접 수정
totalAmount = 0;
itemCount = 0;

// 목표: 불변 상태 업데이트
const updateCartState = (currentState: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...currentState,
        items: [...currentState.items, action.payload],
        totalAmount: calculateNewTotal(currentState.items, action.payload),
        itemCount: currentState.itemCount + 1
      };
    case 'UPDATE_QUANTITY':
      return {
        ...currentState,
        items: currentState.items.map(item => 
          item.id === action.payload.id 
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    default:
      return currentState;
  }
};
```

#### 3.2 이벤트 핸들러 순수 함수화
```typescript
// 현재: 부수 효과가 있는 이벤트 핸들러
addToCartButton.addEventListener('click', function () {
  // DOM 조작과 상태 변경이 섞여있음
});

// 목표: 순수 함수로 분리
const handleAddToCart = (selectedProductId: string, currentState: AppState) => {
  const product = currentState.products.find(p => p.id === selectedProductId);
  if (!product || product.q <= 0) return currentState;
  
  return updateCartState(currentState, {
    type: 'ADD_ITEM',
    payload: { ...product, quantity: 1 }
  });
};
```

### Phase 4: UI 업데이트 로직 개선 (1주)

#### 4.1 선언형 UI 업데이트
```typescript
// 현재: 명령형 DOM 조작
productSelector.innerHTML = '';
for (let i = 0; i < productList.length; i++) {
  const opt = document.createElement('option');
  // 복잡한 옵션 생성 로직...
}

// 목표: 선언형 UI 생성
const createProductOptions = (products: Product[]) => 
  products.map(product => ({
    value: product.id,
    text: formatProductOptionText(product),
    disabled: product.q === 0,
    className: getProductOptionClassName(product)
  }));

const renderProductSelector = (options: ProductOption[]) => {
  return options.map(option => 
    `<option value="${option.value}" ${option.disabled ? 'disabled' : ''} class="${option.className}">
      ${option.text}
    </option>`
  ).join('');
};
```

#### 4.2 가상 DOM 패턴 도입
```typescript
// 현재: 직접 DOM 조작
const updatePricesInCart = () => {
  const cartItems = cartDisplay.children;
  for (let i = 0; i < cartItems.length; i++) {
    // 직접 DOM 요소 수정...
  }
};

// 목표: 가상 DOM 패턴
const createVirtualCart = (cartItems: CartItem[], products: Product[]) => 
  cartItems.map(cartItem => {
    const product = products.find(p => p.id === cartItem.id);
    return {
      id: cartItem.id,
      name: formatProductName(product),
      price: formatProductPrice(product),
      quantity: getCartItemQuantity(cartItem)
    };
  });

const diffAndUpdateCart = (oldCart: VirtualCartItem[], newCart: VirtualCartItem[]) => {
  // 변경된 아이템만 업데이트
  newCart.forEach((item, index) => {
    if (JSON.stringify(item) !== JSON.stringify(oldCart[index])) {
      updateCartItemElement(item);
    }
  });
};
```

### Phase 5: 타이머 및 이벤트 관리 개선 (1주)

#### 5.1 타이머 로직 순수 함수화
```typescript
// 현재: 부수 효과가 있는 타이머
setInterval(function () {
  const luckyIdx = Math.floor(Math.random() * productList.length);
  const luckyItem = productList[luckyIdx];
  if (luckyItem.q > 0 && !luckyItem.onSale) {
    luckyItem.val = Math.round((luckyItem.originalVal * 80) / 100);
    luckyItem.onSale = true;
    // 부수 효과...
  }
}, TIMER_INTERVALS.LIGHTNING_SALE_INTERVAL);

// 목표: 순수 함수로 분리
const selectRandomProduct = (products: Product[]) => {
  const availableProducts = products.filter(p => p.q > 0 && !p.onSale);
  if (availableProducts.length === 0) return null;
  return availableProducts[Math.floor(Math.random() * availableProducts.length)];
};

const applyLightningSale = (product: Product): Product => ({
  ...product,
  val: Math.round((product.originalVal * 80) / 100),
  onSale: true
});

const createLightningSaleTimer = (products: Product[], onSaleApplied: (product: Product) => void) => {
  return setInterval(() => {
    const selectedProduct = selectRandomProduct(products);
    if (selectedProduct) {
      const updatedProduct = applyLightningSale(selectedProduct);
      onSaleApplied(updatedProduct);
    }
  }, TIMER_INTERVALS.LIGHTNING_SALE_INTERVAL);
};
```

### Phase 6: 테스트 가능한 구조로 개선 (1주)

#### 6.1 순수 함수 테스트 작성
```typescript
// 테스트 가능한 순수 함수들
describe('Cart Calculations', () => {
  test('calculateIndividualDiscount should return correct discount rate', () => {
    const product = { id: PRODUCT_IDS.KEYBOARD, val: 10000 };
    const quantity = 10;
    expect(calculateIndividualDiscount(product, quantity)).toBe(0.1);
  });
  
  test('calculateBulkDiscount should apply 25% discount for 30+ items', () => {
    expect(calculateBulkDiscount(30)).toBe(0.25);
    expect(calculateBulkDiscount(29)).toBe(0);
  });
});
```

#### 6.2 모킹 가능한 구조
```typescript
// 현재: 전역 변수에 직접 의존
const handleCalculateCartStuff = () => {
  // productList, cartDisplay 등 전역 변수 사용
};

// 목표: 의존성 주입
const handleCalculateCartStuff = (
  products: Product[], 
  cartItems: CartItem[], 
  updateUI: (result: CalculationResult) => void
) => {
  const result = calculateCartTotals(cartItems, products);
  updateUI(result);
};
```

## 🎯 최종 목표

### React 마이그레이션 준비 완료 상태
1. **순수 함수들** - 부수 효과 없는 계산 로직
2. **불변 상태 관리** - 상태 업데이트 시 새 객체 생성
3. **선언형 UI** - 데이터 기반 UI 렌더링
4. **고차함수 활용** - map, filter, reduce 등 함수형 프로그래밍
5. **테스트 가능한 구조** - 모든 비즈니스 로직이 테스트 가능
6. **의존성 주입** - 외부 의존성을 주입받는 구조

### 예상 소요 시간
- **총 6-7주** (각 Phase당 1주)
- **단계별 진행** - 각 Phase 완료 후 테스트 통과 확인
- **점진적 리팩토링** - 기존 기능 유지하면서 개선

### 성공 지표
1. **테스트 커버리지 90% 이상**
2. **순수 함수 비율 80% 이상**
3. **고차함수 사용률 70% 이상**
4. **전역 변수 의존도 50% 이하**
5. **React 마이그레이션 시 코드 재사용률 80% 이상**

## 📝 다음 단계

1. **Phase 1부터 시작** - 데이터 구조 및 순수 함수 분리
2. **각 Phase 완료 후 테스트 실행** - 기존 기능 유지 확인
3. **단계별 코드 리뷰** - 리팩토링 품질 검증
4. **React 마이그레이션 준비 완료** - 모든 Phase 완료 후
