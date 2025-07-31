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
  "@types/react-dom": "^18.2.0"
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

#### 1. 상태 관리 전략
```typescript
// React Context API + useReducer 패턴
interface AppState {
  cart: CartState;
  product: ProductState;
  ui: UIState;
  points: PointsState;
}

// 도메인별 Context 분리
const CartContext = createContext<CartContextValue>();
const ProductContext = createContext<ProductContextValue>();
const UIContext = createContext<UIContextValue>();
const PointsContext = createContext<PointsContextValue>();
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

#### 3. 커스텀 훅 설계
```typescript
// 비즈니스 로직을 커스텀 훅으로 추상화
const useCart = () => {
  // 장바구니 상태 관리
};

const useProduct = () => {
  // 상품 상태 관리
};

const useDiscount = () => {
  // 할인 계산 로직
};

const usePoints = () => {
  // 포인트 계산 로직
};
```

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

### Phase 1: 기본 컴포넌트 마이그레이션 (Day 1-3)

#### 1.1 레이아웃 컴포넌트 변환
- [ ] **App 컴포넌트**: `src/basic/features/layout/App.ts` → React
- [ ] **Header 컴포넌트**: `src/basic/features/header/Header.ts` → React
- [ ] **GridContainer**: 좌우 레이아웃 구조

#### 1.2 Context 기반 상태 관리 구축
```typescript
// src/advanced/contexts/AppContext.tsx
const AppProvider = ({ children }) => {
  return (
    <CartProvider>
      <ProductProvider>
        <UIProvider>
          <PointsProvider>
            {children}
          </PointsProvider>
        </UIProvider>
      </ProductProvider>
    </CartProvider>
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

### Phase 2: 핵심 기능 컴포넌트 (Day 4-6)

#### 2.1 상품 관련 컴포넌트
- [ ] **ProductSelector**: 드롭다운 선택기
- [ ] **StockInformation**: 재고 상태 표시
- [ ] **AddToCartButton**: 장바구니 추가 버튼

#### 2.2 장바구니 관련 컴포넌트
- [ ] **CartDisplay**: 장바구니 전체 영역
- [ ] **CartItem**: 개별 장바구니 아이템
- [ ] **QuantityControls**: 수량 증감 버튼

#### 2.3 주문 관련 컴포넌트
- [ ] **OrderSummary**: 주문 요약
- [ ] **PriceDisplay**: 가격 표시
- [ ] **DiscountInfo**: 할인 정보

### Phase 3: 비즈니스 로직 마이그레이션 (Day 7-9)

#### 3.1 커스텀 훅 구현
```typescript
// 기존 유틸리티 함수들을 React 훅으로 변환
const useCart = () => {
  // cartCalculationUtils.ts 로직 활용
};

const useDiscount = () => {
  // discountUtils.ts 로직 활용
};

const usePoints = () => {
  // pointsUtils.ts 로직 활용
};
```

#### 3.2 이벤트 처리 시스템 변환
- [ ] **DOM 이벤트 리스너** → React 이벤트 핸들러
- [ ] **eventManager.ts** → 컴포넌트별 이벤트 처리
- [ ] **상태 동기화** → React 상태 관리

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
- [ ] App, Header, GridContainer 컴포넌트 변환
- [ ] Context Provider 구조 구축
- [ ] 기본 상태 관리 시스템 동작
- [ ] 간단한 렌더링 테스트 통과
- [ ] 기존 UI와 동일한 레이아웃 구현

### Phase 2 완료 체크리스트
- [ ] 모든 핵심 컴포넌트 변환 완료
- [ ] 장바구니 추가/제거 기능 동작
- [ ] 수량 증감 기능 동작
- [ ] 기본 할인 정책 적용
- [ ] 포인트 계산 시스템 동작

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
