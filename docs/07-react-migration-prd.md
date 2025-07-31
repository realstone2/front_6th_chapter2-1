# React 마이그레이션 PRD
## 📋 제품 요구사항 정의서 (Product Requirements Document)

### 🎯 프로젝트 개요

#### 프로젝트명
**Hanghae 쇼핑몰 React 마이그레이션 프로젝트**

#### 비전 (Vision)
기존 Vanilla TypeScript로 구현된 쇼핑몰을 React 기반으로 마이그레이션하여 코드 가독성, 유지보수성, 테스트 용이성을 향상시킨다.

#### 미션 (Mission)
- **현대적 프론트엔드 아키텍처** 도입으로 개발 생산성 향상
- **컴포넌트 기반 개발**로 재사용성 극대화
- **React Testing Library** 기반 견고한 테스트 환경 구축
- **기존 기능 100% 동일성** 보장

---

## 📊 현황 분석

### 기존 시스템 분석

#### 🟢 강점 (Strengths)
- **잘 구조화된 코드**: 컴포넌트 기반으로 모듈화 완료
- **명확한 상태 관리**: 도메인별 상태 분리 (Cart, Product, UI, Points)
- **순수 함수 중심**: 비즈니스 로직과 UI 분리
- **포괄적인 테스트**: 8개 주요 기능군, 50+ 테스트 케이스
- **타입 안정성**: TypeScript 적용으로 런타임 에러 최소화

#### 🔴 현재 제약사항 (Limitations)
- **수동 DOM 조작**: 직접적인 DOM 조작으로 인한 복잡성
- **이벤트 관리 복잡성**: 수동 이벤트 리스너 등록/해제
- **상태 동기화 이슈**: 다양한 상태 간 수동 동기화
- **테스트 복잡성**: DOM 기반 테스트의 셋업 복잡도

#### 💡 기회 (Opportunities)
- **React 생태계**: 풍부한 라이브러리와 도구
- **개발자 경험**: Hot reload, 디버깅 도구
- **성능 최적화**: Virtual DOM, 메모이제이션
- **팀 확장성**: React 개발자 풀 확보

---

## 🎯 비즈니스 목표

### 주요 목표 (Primary Goals)

#### 1. 기능 완전성 (Feature Parity) - 100%
- 기존 모든 기능 동일하게 구현
- 비즈니스 로직 정확성 보장
- 사용자 경험 일관성 유지

#### 2. 코드 품질 향상 (Code Quality)
- **가독성**: 컴포넌트 기반 명확한 구조
- **유지보수성**: 관심사 분리, 단일 책임 원칙
- **재사용성**: 범용 컴포넌트 라이브러리 구축

#### 3. 개발 생산성 (Developer Productivity)
- **개발 속도**: 컴포넌트 재사용으로 개발 시간 단축
- **디버깅 효율성**: React DevTools 활용
- **팀 협업**: 표준화된 React 패턴

#### 4. 테스트 신뢰성 (Test Reliability)
- **테스트 안정성**: React Testing Library 기반
- **커버리지**: 기존 테스트 100% 마이그레이션
- **유지보수**: 컴포넌트 단위 독립적 테스트

---

## 🏗️ 기술적 요구사항

### 핵심 기술 스택

#### 프레임워크 & 라이브러리
```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "jotai": "^2.6.0"
}
```

#### 개발 도구
```json
{
  "vite": "^7.0.5",
  "@vitejs/plugin-react": "^4.0.0",
  "typescript": "^5.8.3"
}
```

#### 테스팅
```json
{
  "@testing-library/react": "^16.3.0",
  "@testing-library/user-event": "^14.6.1",
  "@testing-library/jest-dom": "^6.6.3",
  "vitest": "^3.2.4"
}
```

#### 스타일링
```json
{
  "tailwindcss": "기존 설정 유지"
}
```

### 아키텍처 설계

#### 1. MVVM 패턴 적용 (Jotai 기반)
**Model-View-ViewModel 아키텍처로 React 컴포넌트 구조화**

```typescript
// Model: Jotai atom으로 데이터 상태 관리
import { atom } from 'jotai';

// Product Model Atoms
export const productsAtom = atom<ProductModel[]>([]);
export const selectedProductAtom = atom<ProductModel | null>(null);
export const productStockAtom = atom((get) => {
  const products = get(productsAtom);
  return products.reduce((acc, product) => acc + product.stock, 0);
});

// Cart Model Atoms
export const cartItemsAtom = atom<CartItemModel[]>([]);
export const cartTotalPriceAtom = atom((get) => {
  const items = get(cartItemsAtom);
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
});
export const cartTotalDiscountAtom = atom((get) => {
  const items = get(cartItemsAtom);
  return items.reduce((total, item) => total + (item.discount || 0), 0);
});

// Order Model Atoms
export const orderSummaryAtom = atom((get) => {
  const totalPrice = get(cartTotalPriceAtom);
  const totalDiscount = get(cartTotalDiscountAtom);
  return {
    subtotal: totalPrice,
    discount: totalDiscount,
    total: totalPrice - totalDiscount
  };
});

// Points Model Atoms
export const pointsAtom = atom(0);
export const pointsEarnedAtom = atom((get) => {
  const orderSummary = get(orderSummaryAtom);
  return Math.floor(orderSummary.total * 0.001); // 0.1%
});
```

```typescript
// ViewModel: Jotai atom을 조작하는 커스텀 훅
import { useAtom, useAtomValue } from 'jotai';

const useProductViewModel = () => {
  const [products, setProducts] = useAtom(productsAtom);
  const [selectedProduct, setSelectedProduct] = useAtom(selectedProductAtom);
  const totalStock = useAtomValue(productStockAtom);
  
  const addToCart = useCallback((product: ProductModel, quantity: number) => {
    // 비즈니스 로직 처리 후 atom 업데이트
  }, []);
  
  const calculateDiscount = useCallback((product: ProductModel, quantity: number) => {
    // 할인 계산 로직
  }, []);
  
  return {
    products,
    selectedProduct,
    totalStock,
    addToCart,
    calculateDiscount,
    setSelectedProduct
  };
};

const useCartViewModel = () => {
  const [cartItems, setCartItems] = useAtom(cartItemsAtom);
  const totalPrice = useAtomValue(cartTotalPriceAtom);
  const totalDiscount = useAtomValue(cartTotalDiscountAtom);
  
  const addItem = useCallback((product: ProductModel, quantity: number) => {
    // 장바구니 추가 로직
  }, []);
  
  const removeItem = useCallback((productId: string) => {
    // 장바구니 제거 로직
  }, []);
  
  return {
    cartItems,
    totalPrice,
    totalDiscount,
    addItem,
    removeItem
  };
};

// View: ViewModel 훅을 사용하는 UI 컴포넌트
const ProductView = () => {
  const productViewModel = useProductViewModel();
  
  return (
    <div>
      {/* ViewModel에서 제공하는 상태와 함수 사용 */}
      <select onChange={(e) => productViewModel.setSelectedProduct(/* ... */)}>
        {productViewModel.products.map(product => (
          <option key={product.id} value={product.id}>{product.name}</option>
        ))}
      </select>
      <button onClick={() => productViewModel.addToCart(/* ... */)}>
        장바구니 추가
      </button>
    </div>
  );
};
```

#### 2. MVVM 구조 설계 (Jotai 기반)
```
src/
  models/              # Model: Jotai atoms 및 데이터 타입
    atoms/             # Jotai atom 정의
      productAtoms.ts
      cartAtoms.ts
      orderAtoms.ts
      pointsAtoms.ts
      discountAtoms.ts
    types/             # TypeScript 타입 정의
      ProductModel.ts
      CartModel.ts
      OrderModel.ts
      PointsModel.ts
  viewmodels/          # ViewModel: Jotai atom을 조작하는 커스텀 훅
    useProductViewModel.ts
    useCartViewModel.ts
    useOrderViewModel.ts
    useDiscountViewModel.ts
    usePointsViewModel.ts
  views/               # View: UI 컴포넌트 (ViewModel 훅 사용)
    components/
      ProductView.tsx
      CartView.tsx
      OrderView.tsx
      PointsView.tsx
  providers/           # Jotai Provider 설정
    AppProvider.tsx
```

#### 3. 상태 관리 전략 (Jotai 기반 MVVM)
```typescript
// Jotai atom 기반 상태 관리 (Model 역할)
import { atom } from 'jotai';

// 도메인별 atom 분리
const productAtoms = {
  products: atom<ProductModel[]>([]),
  selectedProduct: atom<ProductModel | null>(null),
  productStock: atom((get) => {
    const products = get(productAtoms.products);
    return products.reduce((acc, product) => acc + product.stock, 0);
  })
};

const cartAtoms = {
  items: atom<CartItemModel[]>([]),
  totalPrice: atom((get) => {
    const items = get(cartAtoms.items);
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }),
  totalDiscount: atom((get) => {
    const items = get(cartAtoms.items);
    return items.reduce((total, item) => total + (item.discount || 0), 0);
  })
};

const orderAtoms = {
  summary: atom((get) => {
    const totalPrice = get(cartAtoms.totalPrice);
    const totalDiscount = get(cartAtoms.totalDiscount);
    return {
      subtotal: totalPrice,
      discount: totalDiscount,
      total: totalPrice - totalDiscount
    };
  })
};

const pointsAtoms = {
  current: atom(0),
  earned: atom((get) => {
    const orderSummary = get(orderAtoms.summary);
    return Math.floor(orderSummary.total * 0.001);
  })
};

// Jotai Provider 설정 (ViewModel 제공)
const AppProvider = ({ children }) => {
  return (
    <Provider>
      {children}
    </Provider>
  );
};
```

#### 2. 컴포넌트 구조
```
src/
  components/
    common/           # 공통 컴포넌트
    layout/           # 레이아웃 컴포넌트
    cart/             # 장바구니 관련
    product/          # 상품 관련
    order/            # 주문 관련
    ui/               # UI 컴포넌트
  contexts/           # React Context
  hooks/              # 커스텀 훅
  types/              # TypeScript 타입
  utils/              # 유틸리티 함수
  __tests__/          # 테스트 파일
```

#### 3. MVVM 기반 커스텀 훅 설계 (Jotai ViewModel)
```typescript
// ViewModel 역할을 하는 커스텀 훅들 (Jotai atom 조작)
import { useAtom, useAtomValue } from 'jotai';

const useProductViewModel = () => {
  const [products, setProducts] = useAtom(productsAtom);
  const [selectedProduct, setSelectedProduct] = useAtom(selectedProductAtom);
  const totalStock = useAtomValue(productStockAtom);
  
  const addToCart = useCallback((product: ProductModel, quantity: number) => {
    // 비즈니스 로직 처리 후 atom 업데이트
    setProducts(prev => [...prev, product]);
  }, [setProducts]);
  
  const calculateDiscount = useCallback((product: ProductModel, quantity: number) => {
    // 할인 계산 로직
    if (quantity >= 10) {
      return product.price * quantity * 0.1; // 10% 할인
    }
    return 0;
  }, []);
  
  return {
    products,
    selectedProduct,
    totalStock,
    addToCart,
    calculateDiscount,
    setSelectedProduct
  };
};

const useCartViewModel = () => {
  const [cartItems, setCartItems] = useAtom(cartItemsAtom);
  const totalPrice = useAtomValue(cartTotalPriceAtom);
  const totalDiscount = useAtomValue(cartTotalDiscountAtom);
  
  const addItem = useCallback((product: ProductModel, quantity: number) => {
    // 장바구니 추가 로직
    setCartItems(prev => [...prev, { ...product, quantity }]);
  }, [setCartItems]);
  
  const removeItem = useCallback((productId: string) => {
    // 장바구니 제거 로직
    setCartItems(prev => prev.filter(item => item.id !== productId));
  }, [setCartItems]);
  
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    // 수량 업데이트 로직
    setCartItems(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity } : item
    ));
  }, [setCartItems]);
  
  return {
    cartItems,
    totalPrice,
    totalDiscount,
    addItem,
    removeItem,
    updateQuantity
  };
};

const useDiscountViewModel = () => {
  const [discountRules] = useAtom(discountRulesAtom);
  
  const calculateIndividualDiscount = useCallback((product: ProductModel, quantity: number) => {
    // 개별 상품 할인 계산
    const rule = discountRules.find(r => r.productId === product.id);
    if (rule && quantity >= rule.minQuantity) {
      return product.price * quantity * rule.discountRate;
    }
    return 0;
  }, [discountRules]);
  
  const calculateBulkDiscount = useCallback((totalQuantity: number) => {
    // 대량 구매 할인 계산
    if (totalQuantity >= 30) {
      return 0.25; // 25% 할인
    }
    return 0;
  }, []);
  
  const calculateSpecialDiscount = useCallback((date: Date) => {
    // 특별 할인 계산 (화요일, 번개세일 등)
    const isTuesday = date.getDay() === 2;
    return isTuesday ? 0.1 : 0; // 화요일 10% 할인
  }, []);
  
  return {
    calculateIndividualDiscount,
    calculateBulkDiscount,
    calculateSpecialDiscount
  };
};

const usePointsViewModel = () => {
  const [points, setPoints] = useAtom(pointsAtom);
  const earnedPoints = useAtomValue(pointsEarnedAtom);
  
  const calculateBasicPoints = useCallback((finalPrice: number) => {
    // 기본 포인트 계산 (0.1%)
    return Math.floor(finalPrice * 0.001);
  }, []);
  
  const calculateBonusPoints = useCallback((cartItems: CartItemModel[]) => {
    // 추가 포인트 계산 (세트 구매, 대량구매 등)
    let bonus = 0;
    
    // 키보드+마우스 세트
    const hasKeyboard = cartItems.some(item => item.id === 'p1');
    const hasMouse = cartItems.some(item => item.id === 'p2');
    if (hasKeyboard && hasMouse) bonus += 50;
    
    // 대량구매 보너스
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQuantity >= 30) bonus += 100;
    else if (totalQuantity >= 20) bonus += 50;
    else if (totalQuantity >= 10) bonus += 20;
    
    return bonus;
  }, []);
  
  const addPoints = useCallback((amount: number) => {
    setPoints(prev => prev + amount);
  }, [setPoints]);
  
  return {
    points,
    earnedPoints,
    calculateBasicPoints,
    calculateBonusPoints,
    addPoints
  };
};
```

#### 4. Jotai 기반 MVVM 패턴의 장점
**관심사 분리 (Separation of Concerns):**
- **Model**: Jotai atom으로 데이터 상태 관리 (중앙 집중식 상태)
- **View**: UI 렌더링만 담당 (ViewModel 훅 사용)
- **ViewModel**: Jotai atom을 조작하는 커스텀 훅 (비즈니스 로직)

**Jotai의 장점:**
- **원자적 상태 관리**: 각 atom이 독립적으로 관리되어 성능 최적화
- **자동 리렌더링**: 의존하는 atom이 변경될 때만 컴포넌트 리렌더링
- **타입 안전성**: TypeScript와 완벽한 통합
- **개발자 도구**: Jotai DevTools로 상태 변화 추적 가능

**테스트 용이성:**
- ViewModel은 Jotai atom을 모킹하여 테스트 가능
- View는 ViewModel 훅을 모킹하여 독립적 테스트
- Model은 순수 함수로 단위 테스트 용이

**재사용성:**
- ViewModel 훅은 여러 View에서 재사용 가능
- Jotai atom은 다른 프로젝트에서도 재사용 가능
- View는 다른 ViewModel 훅과 조합 가능

**유지보수성:**
- 비즈니스 로직 변경 시 ViewModel 훅만 수정
- UI 변경 시 View만 수정
- 데이터 구조 변경 시 Jotai atom만 수정

---

## 📋 기능 요구사항

### 🛒 핵심 기능 (Core Features)

#### 1. 상품 관리 시스템
**필수 요구사항:**
- [ ] 5개 상품 정보 표시 (이름, 가격, 재고)
- [ ] 품절 상품 선택 불가 처리
- [ ] 재고 부족 경고 시스템 (5개 미만)
- [ ] 실시간 재고 업데이트

**테스트 기준:**
```typescript
describe('상품 관리', () => {
  it('5개 상품이 올바른 정보로 표시되어야 함', () => {
    // 기존 테스트와 동일한 검증 로직
  });
  
  it('품절 상품은 선택 불가', () => {
    // p4 상품 품절 처리 검증
  });
});
```

#### 2. 장바구니 시스템
**필수 요구사항:**
- [ ] 상품 추가/제거 기능
- [ ] 수량 증감 기능 (+/- 버튼)
- [ ] 재고 한도 내 수량 제한
- [ ] 실시간 총액 계산
- [ ] 장바구니 아이템 카드 형식 표시

**UI 요구사항:**
- [ ] 첫 번째 아이템: `first:pt-0` 클래스
- [ ] 마지막 아이템: `last:border-b-0` 클래스
- [ ] 상품 이미지 영역: `.bg-gradient-black`
- [ ] 수량 조절 버튼: `data-change="1"`, `data-change="-1"`

#### 3. 할인 정책 시스템
**개별 상품 할인:**
- [ ] 상품1 (키보드): 10개 이상 → 10% 할인
- [ ] 상품2 (마우스): 10개 이상 → 15% 할인  
- [ ] 상품3 (모니터암): 10개 이상 → 20% 할인
- [ ] 상품5 (스피커): 10개 이상 → 25% 할인

**전체 수량 할인:**
- [ ] 30개 이상 구매 시 25% 할인 (개별 할인 무시)

**특별 할인:**
- [ ] 화요일 10% 추가 할인 (다른 할인과 중복 적용)
- [ ] 번개세일 20% 할인 (타이머 기반)
- [ ] 추천할인 5% 할인 (타이머 기반)

#### 4. 포인트 적립 시스템
**기본 적립:**
- [ ] 최종 결제 금액의 0.1% 포인트 적립

**추가 적립:**
- [ ] 화요일 구매 시 기본 포인트 2배
- [ ] 키보드+마우스 세트 구매 시 +50p
- [ ] 풀세트(키보드+마우스+모니터암) 구매 시 +100p
- [ ] 대량구매 보너스: 10개+ (+20p), 20개+ (+50p), 30개+ (+100p)

#### 5. UI/UX 요구사항
**레이아웃:**
- [ ] 헤더: "🛒 Hanghae Online Store" + "Shopping Cart"
- [ ] 좌측: 상품 선택 및 장바구니
- [ ] 우측: 주문 요약 및 포인트
- [ ] 도움말 버튼: `.fixed.top-4.right-4`

**도움말 모달:**
- [ ] 슬라이드 패널 형식
- [ ] 배경 클릭으로 닫기
- [ ] `.fixed.inset-0` (배경), `.fixed.right-0.top-0` (패널)

---

## 🧪 테스트 요구사항

### 테스트 마이그레이션 전략

#### 1. 기존 테스트 100% 호환성
**현재 테스트 구조 유지:**
```typescript
// 기존 헬퍼 함수들을 React Testing Library로 변환
const addItemsToCart = (user, selector, button, productId, count) => {
  // userEvent 기반으로 변환
};

const expectProductInfo = (option, product) => {
  // screen.getByRole 등으로 변환
};

const getCartItemQuantity = (container, productId) => {
  // within()을 사용한 범위 지정 쿼리로 변환
};
```

#### 2. 테스트 카테고리별 마이그레이션
**8개 주요 테스트 그룹:**
1. **상품 정보 테스트** (2.1 상품 목록, 2.2 재고 관리)
2. **할인 정책 테스트** (3.1 개별 할인, 3.2 전체 할인, 3.3 특별 할인)
3. **포인트 시스템 테스트** (4.1 기본 적립, 4.2 추가 적립)
4. **UI/UX 테스트** (5.1 레이아웃, 5.2-5.5 각 영역)
5. **기능 요구사항 테스트** (6.1-6.5 모든 기능)
6. **예외 처리 테스트** (8.1-8.3 예외 상황)
7. **복잡한 통합 시나리오**
8. **성능 및 접근성 테스트** (신규 추가)

#### 3. React 테스트 패턴
```typescript
describe('React 컴포넌트 테스트', () => {
  beforeEach(() => {
    render(
      <AppProviders>
        <App />
      </AppProviders>
    );
  });

  it('상품 추가 기능', async () => {
    const user = userEvent.setup();
    const selector = screen.getByRole('combobox');
    const addButton = screen.getByRole('button', { name: /add to cart/i });
    
    await user.selectOptions(selector, 'p1');
    await user.click(addButton);
    
    expect(screen.getByText('버그 없애는 키보드')).toBeInTheDocument();
  });
});
```

#### 4. 테스트 우선순위
**P0 (최우선):**
- 기본 CRUD 기능 (상품 추가/제거/수량 변경)
- 할인 계산 로직
- 포인트 계산 로직

**P1 (높음):**
- UI 렌더링 테스트
- 사용자 인터랙션 테스트
- 예외 처리 테스트

**P2 (중간):**
- 복잡한 시나리오 테스트
- 성능 테스트
- 접근성 테스트

---

## 📈 성공 지표 (Success Metrics)

### 정량적 지표

#### 1. 기능 완전성
- [ ] **테스트 통과율**: 100% (기존 50+ 테스트 케이스)
- [ ] **기능 동등성**: 모든 기능 정확히 동일하게 작동
- [ ] **버그 발생률**: 0% (기존 대비 버그 증가 없음)

#### 2. 코드 품질
- [ ] **타입 커버리지**: 90% 이상
- [ ] **컴포넌트 재사용률**: 80% 이상
- [ ] **코드 중복도**: 10% 이하

#### 3. 개발 생산성
- [ ] **빌드 시간**: 기존 대비 20% 단축
- [ ] **Hot Reload**: 1초 이내
- [ ] **테스트 실행 시간**: 기존 대비 30% 단축

#### 4. 성능 지표
- [ ] **초기 로딩 시간**: 2초 이내
- [ ] **번들 크기**: 500KB 이하
- [ ] **런타임 성능**: 기존과 동일 또는 향상

### 정성적 지표

#### 1. 개발자 경험 (DX)
- [ ] React DevTools를 통한 디버깅 용이성
- [ ] 컴포넌트 기반 개발로 인한 생산성 향상
- [ ] TypeScript 자동완성 및 타입 안전성

#### 2. 코드 가독성
- [ ] 컴포넌트 단위의 명확한 책임 분리
- [ ] 비즈니스 로직과 UI 로직의 분리
- [ ] 일관된 코딩 스타일과 패턴

---

## 📅 프로젝트 로드맵

### Phase 0: 긴급 준비 작업 (Day 1 - 반나절)

#### 🔥 최우선 작업
- [ ] **의존성 설치**: react-dom, @types, @vitejs/plugin-react
- [ ] **Vite 설정 수정**: React 플러그인 추가
- [ ] **HTML 엔트리 수정**: React 루트 요소 추가
- [ ] **최소 React 앱 생성**: Hello World 컴포넌트
- [ ] **실행 테스트**: `npm run start:advanced` 동작 확인

#### 성공 조건
```typescript
// src/advanced/main.advanced.tsx
function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <h1>React 마이그레이션 완료!</h1>
      <p>Phase 0 성공적으로 실행 중</p>
    </div>
  );
}
```

### Phase 1: View 우선 컴포넌트 마이그레이션 (Day 1-3)

#### 1.1 View 우선 개발 전략 (View-First Development)
**전략 개요:**
기존 HTML 구조를 React 컴포넌트로 먼저 변환하여 UI 레이아웃을 완성한 후, 단계적으로 비즈니스 로직을 추가하는 방식

**장점:**
- **빠른 시각적 피드백**: UI 구조를 먼저 확인하여 레이아웃 이슈 조기 발견
- **점진적 복잡성 관리**: 단순한 View부터 시작하여 복잡도 단계적 증가
- **팀 협업 효율성**: 디자이너와 개발자 간 UI 검증 가능
- **테스트 용이성**: View 컴포넌트부터 독립적 테스트 가능

#### 1.2 View 우선 개발 순서
**1단계: 기본 레이아웃 컴포넌트 (View Only)**
```typescript
// 기존 HTML 구조를 React 컴포넌트로 직접 변환
const App: React.FC = () => {
  return (
    <div id="app" className="min-h-screen bg-gray-100 flex flex-col">
      <Header itemCount={0} /> {/* TODO: 상태 관리 추가 */}
      <GridContainer />
      <ManualSection />
    </div>
  );
};

const Header: React.FC<{ itemCount: number }> = ({ itemCount }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold">🛒 Hanghae Online Store</h1>
        <div className="text-sm text-gray-600">Shopping Cart ({itemCount})</div>
      </div>
    </header>
  );
};
```

**2단계: 기능별 View 컴포넌트 (View + TODO 주석)**
```typescript
// 장바구니 View 컴포넌트 (상태 관리 로직은 TODO로 표시)
const CartDisplay: React.FC = () => {
  // TODO: 장바구니 아이템 상태 관리 및 이벤트 처리는 다음 Phase에서 구현
  
  return (
    <div id="cart-items">
      <div className="text-gray-500 text-center py-8">
        장바구니가 비어있습니다
      </div>
    </div>
  );
};

// 주문 요약 View 컴포넌트 (계산 로직은 TODO로 표시)
const OrderSummary: React.FC = () => {
  // TODO: 주문 상태 관리 및 계산 로직은 다음 Phase에서 구현
  
  return (
    <div className="bg-black text-white p-8 flex flex-col">
      <h2 className="text-xs font-medium mb-5 tracking-extra-wide uppercase">
        Order Summary
      </h2>
      {/* TODO: 동적 데이터 표시 영역 */}
    </div>
  );
};
```

**3단계: 이벤트 핸들러 준비 (View + 이벤트 함수)**
```typescript
// 도움말 모달 View 컴포넌트 (이벤트 핸들러 준비)
const ManualColumn: React.FC = () => {
  const handleClose = () => {
    // TODO: 모달 닫기 로직은 다음 Phase에서 구현
    console.log('Manual column close clicked');
  };

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl">
      <button onClick={handleClose}>
        <svg>...</svg>
      </button>
      {/* 도움말 내용 */}
    </div>
  );
};
```

#### 1.3 View 우선 개발의 실제 적용 사례
**완료된 View 컴포넌트들:**
- ✅ **App.tsx**: 메인 앱 레이아웃 (View 완료, 상태 관리 TODO)
- ✅ **Header.tsx**: 헤더 컴포넌트 (View 완료, 아이템 카운트 TODO)
- ✅ **GridContainer.tsx**: 좌우 레이아웃 구조 (View 완료)
- ✅ **LeftColumn.tsx**: 좌측 컬럼 레이아웃 (View 완료)
- ✅ **CartDisplay.tsx**: 장바구니 표시 영역 (View 완료, 상태 관리 TODO)
- ✅ **AddToCartButton.tsx**: 장바구니 추가 버튼 (View 완료, 이벤트 TODO)
- ✅ **SelectorContainer.tsx**: 상품 선택 컨테이너 (View 완료, 상태 TODO)
- ✅ **StockInformation.tsx**: 재고 정보 표시 (View 완료, 동적 데이터 TODO)
- ✅ **OrderSummary.tsx**: 주문 요약 (View 완료, 계산 로직 TODO)
- ✅ **ManualColumn.tsx**: 도움말 패널 (View 완료, 닫기 이벤트 TODO)
- ✅ **ManualOverlay.tsx**: 도움말 배경 (View 완료, 클릭 이벤트 TODO)
- ✅ **ManualToggle.tsx**: 도움말 토글 버튼 (View 완료, 토글 이벤트 TODO)
- ✅ **ProductSelector.tsx**: 상품 선택 드롭다운 (View 완료, 선택 이벤트 TODO)
- ✅ **ManualSection.tsx**: 도움말 섹션 (View 완료, 토글 이벤트 TODO)

**View 우선 개발의 실제 구현 특징:**
- **기존 HTML 구조 보존**: 기존 HTML의 className, id, 구조를 그대로 React 컴포넌트로 변환
- **TODO 주석 체계**: 모든 비즈니스 로직에 TODO 주석으로 다음 Phase 구현 계획 명시
- **이벤트 핸들러 준비**: onClick, onChange 등 이벤트 함수 구조를 미리 준비
- **TypeScript 타입 정의**: 모든 컴포넌트에 적절한 타입 정의 적용
- **컴포넌트 분리**: 기능별로 적절한 컴포넌트 분리로 재사용성 확보

#### 1.4 View 우선 개발의 다음 단계
**Phase 2에서 추가할 내용:**
- [ ] **Jotai Provider 구조**: 상태 관리 시스템 구축
- [ ] **ViewModel 훅**: 비즈니스 로직을 담당하는 커스텀 훅
- [ ] **Model Atoms**: Jotai atom으로 데이터 상태 관리
- [ ] **이벤트 핸들러**: View 컴포넌트의 TODO 주석을 실제 로직으로 교체
- [ ] **상태 연결**: View와 ViewModel 간의 상태 동기화

**View 우선 개발의 성공 지표:**
- ✅ **UI 레이아웃 완성**: 기존 HTML과 동일한 React 컴포넌트 구조
- ✅ **컴포넌트 분리**: 기능별로 적절한 컴포넌트 분리 완료
- ✅ **TODO 주석 체계**: 모든 비즈니스 로직에 다음 Phase 계획 명시
- ✅ **이벤트 핸들러 준비**: onClick, onChange 등 이벤트 함수 구조 준비
- ✅ **TypeScript 타입**: 모든 컴포넌트에 적절한 타입 정의
- ✅ **재사용성**: 범용 컴포넌트로 분리하여 재사용 가능

#### 1.5 MVVM 기반 Jotai Provider 구조 구축
```typescript
// src/advanced/providers/AppProvider.tsx (Jotai Provider)
import { Provider } from 'jotai';

const AppProvider = ({ children }) => {
  return (
    <Provider>
      {children}
    </Provider>
  );
};

// View 컴포넌트에서 ViewModel 훅 사용 예시
const ProductView = () => {
  const productViewModel = useProductViewModel();
  
  return (
    <div>
      <select onChange={(e) => productViewModel.setSelectedProduct(/* ... */)}>
        {productViewModel.products.map(product => (
          <option key={product.id} value={product.id}>{product.name}</option>
        ))}
      </select>
      <button onClick={() => productViewModel.addToCart(/* ... */)}>
        장바구니 추가
      </button>
    </div>
  );
};

// View 컴포넌트에서 여러 ViewModel 훅 조합 사용 예시
const CartView = () => {
  const cartViewModel = useCartViewModel();
  const discountViewModel = useDiscountViewModel();
  const pointsViewModel = usePointsViewModel();
  
  return (
    <div>
      {cartViewModel.cartItems.map(item => (
        <CartItem 
          key={item.id} 
          item={item}
          onRemove={() => cartViewModel.removeItem(item.id)}
          onUpdateQuantity={(quantity) => cartViewModel.updateQuantity(item.id, quantity)}
        />
      ))}
      <div>총 가격: {cartViewModel.totalPrice}</div>
      <div>할인: {cartViewModel.totalDiscount}</div>
      <div>적립 포인트: {pointsViewModel.earnedPoints}</div>
    </div>
  );
};
```

#### 1.3 기본 테스트 환경 구축
```typescript
// src/advanced/__tests__/setup.ts
import { render } from '@testing-library/react';
import { AppProvider } from '../contexts/AppContext';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: AppProvider });
};
```

### Phase 2: ViewModel 및 상태 관리 구축 (Day 4-6)

#### 2.1 View 우선 개발에서 ViewModel로의 전환
**전략 개요:**
Phase 1에서 완성한 View 컴포넌트들에 ViewModel 훅을 연결하여 비즈니스 로직을 추가하는 단계

**전환 과정:**
1. **Jotai Provider 설정**: 상태 관리 시스템 구축
2. **Model Atoms 생성**: 데이터 상태를 Jotai atom으로 관리
3. **ViewModel 훅 구현**: 비즈니스 로직을 담당하는 커스텀 훅
4. **View-ViewModel 연결**: View 컴포넌트에서 ViewModel 훅 사용
5. **TODO 주석 교체**: Phase 1의 TODO 주석을 실제 로직으로 교체

**View 우선 개발의 성과:**
- ✅ **14개 View 컴포넌트 완료**: 모든 UI 컴포넌트가 View로 구현됨
- ✅ **기존 HTML 구조 보존**: className, id, 구조를 그대로 React로 변환
- ✅ **TODO 주석 체계**: 모든 비즈니스 로직에 다음 Phase 구현 계획 명시
- ✅ **이벤트 핸들러 준비**: onClick, onChange 등 이벤트 함수 구조 준비
- ✅ **TypeScript 타입**: 모든 컴포넌트에 적절한 타입 정의 적용
- ✅ **컴포넌트 분리**: 기능별로 적절한 컴포넌트 분리로 재사용성 확보

#### 2.2 MVVM 기반 상품 관련 컴포넌트
**View (UI 컴포넌트):**
- [ ] **ProductSelector**: 드롭다운 선택기 (View)
- [ ] **StockInformation**: 재고 상태 표시 (View)
- [ ] **AddToCartButton**: 장바구니 추가 버튼 (View)

**ViewModel (비즈니스 로직):**
- [ ] **useProductViewModel**: 상품 상태 관리 및 비즈니스 로직
- [ ] **useStockViewModel**: 재고 관리 로직
- [ ] **useProductSelectionViewModel**: 상품 선택 로직

**Model (데이터 구조):**
- [ ] **ProductModel**: 상품 데이터 구조
- [ ] **StockModel**: 재고 데이터 구조

#### 2.2 MVVM 기반 장바구니 관련 컴포넌트
**View (UI 컴포넌트):**
- [ ] **CartDisplay**: 장바구니 전체 영역 (View)
- [ ] **CartItem**: 개별 장바구니 아이템 (View)
- [ ] **QuantityControls**: 수량 증감 버튼 (View)

**ViewModel (비즈니스 로직):**
- [ ] **useCartViewModel**: 장바구니 상태 관리
- [ ] **useQuantityViewModel**: 수량 조절 로직
- [ ] **useCartCalculationViewModel**: 장바구니 계산 로직

**Model (데이터 구조):**
- [ ] **CartModel**: 장바구니 데이터 구조
- [ ] **CartItemModel**: 장바구니 아이템 데이터 구조

#### 2.3 MVVM 기반 주문 관련 컴포넌트
**View (UI 컴포넌트):**
- [ ] **OrderSummary**: 주문 요약 (View)
- [ ] **PriceDisplay**: 가격 표시 (View)
- [ ] **DiscountInfo**: 할인 정보 (View)

**ViewModel (비즈니스 로직):**
- [ ] **useOrderViewModel**: 주문 상태 관리
- [ ] **usePriceViewModel**: 가격 계산 로직
- [ ] **useDiscountViewModel**: 할인 계산 로직

**Model (데이터 구조):**
- [ ] **OrderModel**: 주문 데이터 구조
- [ ] **PriceModel**: 가격 데이터 구조
- [ ] **DiscountModel**: 할인 데이터 구조

### Phase 3: 비즈니스 로직 마이그레이션 (Day 7-9)

#### 3.1 MVVM 기반 Jotai ViewModel 구현
```typescript
// 기존 유틸리티 함수들을 Jotai ViewModel 훅으로 변환
const useCartViewModel = () => {
  // cartCalculationUtils.ts 로직을 Jotai ViewModel로 변환
  const [cartItems, setCartItems] = useAtom(cartItemsAtom);
  const totalPrice = useAtomValue(cartTotalPriceAtom);
  const totalDiscount = useAtomValue(cartTotalDiscountAtom);
  
  const addToCart = useCallback((product: ProductModel, quantity: number) => {
    // 기존 cartCalculationUtils.ts 로직을 Jotai atom으로 변환
    setCartItems(prev => [...prev, { ...product, quantity }]);
  }, [setCartItems]);
  
  const calculateTotal = useCallback(() => {
    // 기존 계산 로직을 Jotai derived atom으로 처리
    return totalPrice - totalDiscount;
  }, [totalPrice, totalDiscount]);
  
  return {
    cartItems,
    totalPrice,
    totalDiscount,
    addToCart,
    calculateTotal,
    // ... 기타 ViewModel 메서드들
  };
};

const useDiscountViewModel = () => {
  // discountUtils.ts 로직을 Jotai ViewModel로 변환
  const [discountRules] = useAtom(discountRulesAtom);
  
  const calculateIndividualDiscount = useCallback((product: ProductModel, quantity: number) => {
    // 기존 discountUtils.ts 로직을 Jotai atom으로 변환
    const rule = discountRules.find(r => r.productId === product.id);
    if (rule && quantity >= rule.minQuantity) {
      return product.price * quantity * rule.discountRate;
    }
    return 0;
  }, [discountRules]);
  
  const calculateBulkDiscount = useCallback((totalQuantity: number) => {
    // 대량 구매 할인 로직을 Jotai atom으로 처리
    if (totalQuantity >= 30) {
      return 0.25; // 25% 할인
    }
    return 0;
  }, []);
  
  return {
    calculateIndividualDiscount,
    calculateBulkDiscount,
    // ... 기타 할인 관련 ViewModel 메서드들
  };
};

const usePointsViewModel = () => {
  // pointsUtils.ts 로직을 Jotai ViewModel로 변환
  const [points, setPoints] = useAtom(pointsAtom);
  const earnedPoints = useAtomValue(pointsEarnedAtom);
  
  const calculateBasicPoints = useCallback((finalPrice: number) => {
    // 기본 포인트 계산 로직을 Jotai atom으로 변환
    return Math.floor(finalPrice * 0.001);
  }, []);
  
  const calculateBonusPoints = useCallback((cartItems: CartItemModel[]) => {
    // 추가 포인트 계산 로직을 Jotai atom으로 변환
    let bonus = 0;
    
    // 키보드+마우스 세트
    const hasKeyboard = cartItems.some(item => item.id === 'p1');
    const hasMouse = cartItems.some(item => item.id === 'p2');
    if (hasKeyboard && hasMouse) bonus += 50;
    
    // 대량구매 보너스
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQuantity >= 30) bonus += 100;
    else if (totalQuantity >= 20) bonus += 50;
    else if (totalQuantity >= 10) bonus += 20;
    
    return bonus;
  }, []);
  
  const addPoints = useCallback((amount: number) => {
    setPoints(prev => prev + amount);
  }, [setPoints]);
  
  return {
    points,
    earnedPoints,
    calculateBasicPoints,
    calculateBonusPoints,
    addPoints,
    // ... 기타 포인트 관련 ViewModel 메서드들
  };
};
```

#### 3.2 MVVM 기반 Jotai 이벤트 처리 시스템 변환
**View 레벨 이벤트 처리:**
- [ ] **DOM 이벤트 리스너** → React 이벤트 핸들러 (View)
- [ ] **이벤트 위임** → 컴포넌트별 이벤트 처리 (View)
- [ ] **ViewModel 훅 사용** → View에서 ViewModel 훅의 함수 호출

**ViewModel 레벨 비즈니스 로직:**
- [ ] **eventManager.ts** → Jotai ViewModel 메서드로 변환
- [ ] **상태 동기화** → Jotai atom 기반 상태 관리
- [ ] **복잡한 이벤트 로직** → ViewModel에서 처리 후 Jotai atom 업데이트

**Model 레벨 데이터 처리:**
- [ ] **데이터 변환 로직** → Jotai atom으로 표준화
- [ ] **타입 안전성** → TypeScript + Jotai atom 타입 정의
- [ ] **파생 상태** → Jotai derived atom으로 자동 계산

### Phase 4: 고급 기능 및 최적화 (Day 10-12)

#### 4.1 타이머 기반 특별 할인
- [ ] **번개세일**: useEffect + setTimeout
- [ ] **추천할인**: 타이머 기반 추천 로직
- [ ] **화요일 할인**: Date 객체 활용

#### 4.2 성능 최적화
```typescript
// 메모이제이션 적용
const CartItem = React.memo(({ item }) => {
  // 컴포넌트 렌더링 최적화
});

const useCartCalculation = useMemo(() => {
  // 복잡한 계산 로직 메모이제이션
}, [cartItems, discounts]);
```

#### 4.3 UI/UX 향상
- [ ] **도움말 모달**: React Portal 활용
- [ ] **애니메이션**: CSS 트랜지션
- [ ] **접근성**: ARIA 속성, 키보드 네비게이션

---

## 🔄 테스트 전략

### 마이그레이션 중 테스트 접근법

#### 1. 점진적 테스트 마이그레이션
```typescript
// 기존 테스트를 React Testing Library로 단계적 변환
describe('장바구니 기능', () => {
  // Phase 1: 기본 렌더링 테스트
  it('should render cart component', () => {
    render(<Cart />);
    expect(screen.getByTestId('cart')).toBeInTheDocument();
  });

  // Phase 2: 인터랙션 테스트
  it('should add item to cart', async () => {
    const user = userEvent.setup();
    // 기존 addItemsToCart 로직을 userEvent로 변환
  });

  // Phase 3: 복잡한 시나리오 테스트
  it('should handle tuesday discount + bulk purchase', () => {
    // 기존 복합 시나리오 테스트 마이그레이션
  });
});
```

#### 2. 회귀 테스트 보장
```typescript
// 기존 테스트 결과와 비교
const legacyTestResults = {
  "상품1: 10개 이상 구매 시 10% 할인": "₩90,000",
  "화요일 + 풀세트 + 대량구매": "₩405,000",
  // ... 모든 기존 테스트 결과
};

describe('회귀 테스트', () => {
  Object.entries(legacyTestResults).forEach(([testName, expectedResult]) => {
    it(`should match legacy result: ${testName}`, () => {
      // React 버전에서 동일한 결과 확인
    });
  });
});
```

#### 3. 테스트 디버깅 전략
```typescript
// React Testing Library 디버깅 도구 활용
import { screen, debug } from '@testing-library/react';

it('debug failing test', () => {
  render(<App />);
  screen.debug(); // DOM 구조 출력
  
  // 쿼리 실패 시 제안 받기
  screen.getByRole('button'); // 실패 시 사용 가능한 role 목록 제공
});
```

---

## ⚠️ 리스크 관리

### 기술적 리스크

#### 1. 상태 관리 복잡성 (중간 위험도)
**위험:** React Context의 불필요한 리렌더링
**완화 방안:**
- Context 분리 (Cart, Product, UI, Points별)
- useMemo, useCallback 적극 활용
- 성능 모니터링 도구 사용

#### 2. 테스트 호환성 (높은 위험도)
**위험:** 기존 테스트 결과와 불일치
**완화 방안:**
- 단계별 테스트 마이그레이션
- 기존 테스트 결과 벤치마크 유지
- 실시간 회귀 테스트 실행

#### 3. 번들 크기 증가 (낮은 위험도)
**위험:** React 라이브러리로 인한 크기 증가
**완화 방안:**
- Tree shaking 최적화
- 코드 스플리팅 적용
- 번들 분석기로 모니터링

### 일정 리스크

#### 1. 복잡한 타이머 로직 (중간 위험도)
**위험:** 번개세일, 추천할인 구현 복잡성
**완화 방안:**
- 기존 로직 최대한 활용
- useEffect + cleanup 패턴 적용
- 충분한 테스트 시간 확보

#### 2. 예상치 못한 버그 (높은 위험도)
**위험:** 마이그레이션 과정에서 숨어있는 버그 발견
**완화 방안:**
- 충분한 QA 시간 확보
- 단계별 검증 체크포인트
- 롤백 계획 수립

---

## 📋 체크리스트

### Phase 0 완료 체크리스트
- [ ] React 19.1.1 및 필수 의존성 설치 완료
- [ ] Vite 설정에 React 플러그인 추가
- [ ] index.advanced.html에 React 루트 엘리먼트 추가
- [ ] 기본 React 앱 실행 확인 (`npm run start:advanced`)
- [ ] TypeScript 설정 검증
- [ ] 에러 없이 "Hello World" 화면 표시

### Phase 1 완료 체크리스트
- [x] ✅ **View 우선 개발 전략 적용**: 모든 UI 컴포넌트를 View로 먼저 구현
- [x] ✅ **기본 레이아웃 컴포넌트**: App, Header, GridContainer, LeftColumn 완료
- [x] ✅ **기능별 View 컴포넌트**: Cart, Order, Help, Product 관련 View 완료
- [x] ✅ **TODO 주석 체계**: 모든 View 컴포넌트에 다음 Phase 구현 계획 명시
- [x] ✅ **UI 레이아웃 완성**: 기존 HTML 구조와 동일한 React 컴포넌트 구조
- [x] ✅ **이벤트 핸들러 준비**: onClick, onChange 등 이벤트 함수 구조 준비
- [x] ✅ **컴포넌트 분리**: 기능별로 적절한 컴포넌트 분리 완료
- [x] ✅ **TypeScript 타입**: 모든 컴포넌트에 적절한 타입 정의
- [x] ✅ **기존 HTML 구조 보존**: className, id, 구조를 그대로 React로 변환
- [x] ✅ **재사용성 확보**: 범용 컴포넌트로 분리하여 재사용 가능

### Phase 2 완료 체크리스트
- [ ] **Jotai Provider 구조**: 상태 관리 시스템 구축 완료
- [ ] **Model Atoms**: 모든 도메인별 Jotai atom 생성 완료
- [ ] **ViewModel 훅**: 비즈니스 로직을 담당하는 커스텀 훅 구현 완료
- [ ] **View-ViewModel 연결**: Phase 1의 View 컴포넌트에 ViewModel 훅 연결 완료
- [ ] **TODO 주석 교체**: Phase 1의 TODO 주석을 실제 로직으로 교체 완료
- [ ] **상태 동기화**: View와 ViewModel 간의 상태 동기화 완료
- [ ] **이벤트 핸들러**: 모든 View 컴포넌트의 이벤트 핸들러 구현 완료
- [ ] **기본 CRUD 기능**: 장바구니 추가/제거/수량 변경 기능 동작

### Phase 3 완료 체크리스트
- [ ] 모든 비즈니스 로직 React 훅으로 변환
- [ ] 복잡한 할인 정책 정확히 구현
- [ ] 포인트 시스템 완전 구현
- [ ] 이벤트 처리 시스템 완전 변환
- [ ] 상태 동기화 이슈 해결

### Phase 4 완료 체크리스트
- [ ] 번개세일, 추천할인 타이머 기능 구현
- [ ] 도움말 모달 React 버전 구현
- [ ] 성능 최적화 적용 (메모이제이션)
- [ ] 접근성 개선사항 적용
- [ ] 모든 기존 테스트 통과

### 최종 완료 체크리스트
- [ ] **기능 동등성**: 기존 50+ 테스트 케이스 100% 통과
- [ ] **성능**: 기존 대비 성능 저하 없음
- [ ] **코드 품질**: ESLint, Prettier 규칙 준수
- [ ] **타입 안전성**: TypeScript 에러 0개
- [ ] **문서화**: 컴포넌트별 사용법 문서 작성
- [ ] **배포 준비**: 프로덕션 빌드 성공

---

## 📚 참고 자료

### 기존 시스템 문서
- [06-react-migration-plan.md](./06-react-migration-plan.md) - 상세 마이그레이션 계획
- [basic.test.js](../src/basic/__tests__/basic.test.js) - 기존 테스트 명세
- [main.basic.ts](../src/basic/main.basic.ts) - 기존 구현체

### React 마이그레이션 가이드
- [React 19 공식 문서](https://react.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Vite React 플러그인](https://vitejs.dev/guide/features.html#jsx)

### 코드 품질 기준
- [04-practical-clean-code-guide.md](./04-practical-clean-code-guide.md) - 클린코드 가이드
- [02-dirty-code-analysis.md](./02-dirty-code-analysis.md) - 기존 코드 분석

---

## 🎯 결론

이 PRD는 기존 Vanilla TypeScript 쇼핑몰을 React로 안전하고 체계적으로 마이그레이션하기 위한 종합적인 계획입니다. 

**핵심 성공 요인:**
1. **기존 테스트 100% 호환성** - 50+ 테스트 케이스 모두 통과
2. **점진적 마이그레이션** - 4단계로 나누어 리스크 최소화  
3. **기존 아키텍처 활용** - 잘 구조화된 기존 코드 최대한 활용
4. **현대적 개발 경험** - React 생태계의 장점 극대화

12일의 개발 기간 동안 이 PRD를 바탕으로 안전하고 성공적인 React 마이그레이션을 진행할 수 있습니다.

*다음 단계는 Phase 0의 긴급 준비 작업을 시작하는 것입니다! 🚀*
