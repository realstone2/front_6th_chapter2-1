# React 마이그레이션 계획

## 🎯 핵심 우선순위: 즉시 실행해야 할 사항

### ⚡ 최우선 작업 (Day 1 필수)

#### 1. 환경 점검 및 준비 작업
- [ ] **기존 코드 분석 완료**: `src/basic/main.basic.ts` 구조 이해 (현재 advanced는 비어있음)
- [ ] **React 의존성 확인**: `package.json`에 React 19.1.1 이미 설치됨 ✅
- [ ] **누락된 의존성 즉시 설치**: react-dom, @types 패키지 추가 필요

#### 2. Vite 설정 즉시 수정
- [ ] **Vite React 플러그인 설정**: `vite.config.js`에 @vitejs/plugin-react 추가
- [ ] **index.advanced.html 수정**: React 루트 요소 추가
- [ ] **스크립트 태그 수정**: `.js` → `.tsx` 확장자 변경

#### 3. 최소 작동 React 앱 생성
- [ ] **`src/advanced/main.advanced.tsx` 생성**: Hello World React 컴포넌트
- [ ] **기본 React 앱 실행 확인**: `npm run start:advanced` 테스트
- [ ] **TypeScript 설정 검증**: React JSX 지원 확인

## 개요
기존 `src/basic/main.basic.ts`의 잘 구조화된 Vanilla TypeScript + DOM 조작 방식을 React 기반 애플리케이션으로 마이그레이션합니다.

## 현재 상태 분석
- **기존 구조**: Vanilla TypeScript + DOM 조작 (잘 모듈화됨)
- **상태 관리**: 커스텀 상태 관리 시스템 (useCartState, useProductState 등)
- **이벤트 처리**: DOM 이벤트 리스너 기반
- **컴포넌트**: 함수형 컴포넌트 (App, Header 등) - React와 유사한 구조
- **기반 코드**: `src/basic/` 디렉토리의 잘 정리된 코드 존재

## 🚨 중요 발견사항
- `src/advanced/main.advanced.ts`는 현재 **비어있음**
- `src/basic/main.basic.ts`가 실제 구현체이며 이미 React와 유사한 구조
- 기존 코드가 이미 컴포넌트 기반으로 잘 분리되어 있어 마이그레이션 유리

## 수정된 마이그레이션 전략

### 🎯 Phase 0: 긴급 준비 작업 (즉시 실행)

#### 0.1 즉시 실행 - 의존성 설치
```bash
# 필수 의존성 즉시 설치
npm install react-dom @types/react @types/react-dom @vitejs/plugin-react
```

#### 0.2 즉시 실행 - Vite 설정 수정
```javascript
// vite.config.js 수정
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 기존 설정 유지
})
```

#### 0.3 즉시 실행 - HTML 엔트리 수정
```html
<!-- index.advanced.html 수정 -->
<div id="app"></div>
<script type="module" src="./src/advanced/main.advanced.tsx"></script>
```

#### 0.4 즉시 실행 - 최소 React 앱 생성
```tsx
// src/advanced/main.advanced.tsx 생성
import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <h1>React Migration - Phase 0 완료!</h1>
      <p>기본 React 앱이 성공적으로 실행되고 있습니다.</p>
    </div>
  );
}

const container = document.getElementById('app');
const root = createRoot(container!);
root.render(<App />);
```

### Phase 1: 기본 컴포넌트 마이그레이션 (1-2일)

#### 1.1 기존 컴포넌트 분석 및 React 변환
**기존 코드 활용 우선순위:**
1. **App 컴포넌트**: `src/basic/features/layout/App.ts` → React 컴포넌트
2. **Header 컴포넌트**: `src/basic/features/header/Header.ts` → React 컴포넌트  
3. **GridContainer**: `src/basic/features/layout/GridContainer.ts` → React 컴포넌트

#### 1.2 상태 관리 시스템 분석
**활용할 기존 상태 관리 구조:**
- `src/basic/features/cart/store/cartState.ts`
- `src/basic/features/product/store/productState.ts`
- `src/basic/features/ui/store/uiState.ts`
- `src/basic/features/points/store/pointsState.ts`

**변환 방향:** 기존 커스텀 상태 → React Context API + useReducer

### Phase 2: 핵심 기능 컴포넌트 마이그레이션 (2-3일)

#### 2.1 장바구니 관련 컴포넌트 우선 변환
**기존 코드 기반 변환:**
- `src/basic/features/cart/CartDisplay.ts` → React 컴포넌트
- `src/basic/features/cart/CartItem.ts` → React 컴포넌트
- `src/basic/features/cart/AddToCartButton.ts` → React 컴포넌트

#### 2.2 상품 관련 컴포넌트 변환
**기존 코드 기반 변환:**
- `src/basic/features/product/ProductSelector.ts` → React 컴포넌트
- `src/basic/features/stock/StockInformation.ts` → React 컴포넌트

#### 2.3 주문 요약 컴포넌트 변환
**기존 코드 기반 변환:**
- `src/basic/features/order/OrderSummary.ts` → React 컴포넌트
- `src/basic/features/points/LoyaltyPoints.ts` → React 컴포넌트

### Phase 3: 상태 관리 및 비즈니스 로직 마이그레이션 (2-3일)

#### 3.1 React Context 기반 상태 관리 구현
```tsx
// src/advanced/contexts/CartContext.tsx
// 기존 cartState.ts 로직을 React Context로 변환

// src/advanced/contexts/ProductContext.tsx  
// 기존 productState.ts 로직을 React Context로 변환
```

#### 3.2 비즈니스 로직 React 훅으로 변환
**활용할 기존 유틸리티:**
- `src/basic/features/cart/cartCalculationUtils.ts` → useCart 훅
- `src/basic/features/product/productUtils.ts` → useProduct 훅
- `src/basic/features/points/pointsUtils.ts` → usePoints 훅

#### 3.3 이벤트 처리 시스템 변환
**기존 이벤트 관리 활용:**
- `src/basic/features/events/eventManager.ts` → React 이벤트 핸들러로 변환

### Phase 4: 고급 기능 및 최적화 (1-2일)

#### 4.1 타이머 및 특별 할인 기능
**기존 코드 활용:**
- `src/basic/features/sale/` 디렉토리 컴포넌트들
- 화요일 할인, 번개세일, 추천할인 로직 React로 변환

#### 4.2 UI/UX 컴포넌트
**기존 코드 활용:**
- `src/basic/features/help/` 디렉토리 → 도움말 모달 React 컴포넌트로 변환

#### 4.3 성능 최적화
- `useMemo`, `useCallback`을 활용한 리렌더링 최적화
- React.memo를 활용한 컴포넌트 메모이제이션

## 기술 스택 (수정됨)

### 확정된 의존성
```json
{
  "react": "^19.1.1", // ✅ 이미 설치됨
  "react-dom": "^19.1.1", // 추가 필요
  "@types/react": "^18.2.0", // 추가 필요
  "@types/react-dom": "^18.2.0", // 추가 필요
  "@vitejs/plugin-react": "^4.0.0" // 추가 필요
}
```

### 기존 도구 유지
- Vite (이미 설정됨)
- TypeScript (이미 설정됨)
- Tailwind CSS (이미 설정됨)
- Vitest (테스팅 도구 이미 설정됨)

## 수정된 마이그레이션 우선순위

### 🔥 긴급 우선순위 (즉시 실행)
1. **Phase 0 완료**: 기본 React 환경 구축 및 동작 확인
2. **의존성 설치**: 누락된 React 관련 패키지 설치
3. **Vite 설정**: React 플러그인 추가
4. **최소 앱 실행**: Hello World React 앱 동작 확인

### 높은 우선순위 (Day 1-3)
1. **App 컴포넌트 변환**: 기존 `src/basic/features/layout/App.ts` 활용
2. **핵심 상태 관리**: Cart, Product 상태를 React Context로 변환
3. **기본 컴포넌트**: Header, GridContainer, CartDisplay 변환
4. **기본 이벤트**: 장바구니 추가/제거 기능 React로 변환

### 중간 우선순위 (Day 4-6)
1. **고급 기능**: 할인 정책, 포인트 시스템
2. **특별 기능**: 타이머 기반 할인, 도움말 모달
3. **성능 최적화**: 메모이제이션, 리렌더링 최적화
4. **테스트 코드**: React Testing Library로 테스트 변환

### 낮은 우선순위 (Day 7+)
1. **코드 스플리팅**: 동적 임포트, 지연 로딩
2. **고급 애니메이션**: React 상태 기반 애니메이션
3. **추가 최적화**: Suspense, Error Boundary 등

## 예상 소요 시간 (수정됨)
- **Phase 0 (긴급)**: 반나절 (의존성 설치 및 기본 앱 실행)
- **Phase 1-2**: 3-4일 (핵심 컴포넌트 변환)
- **Phase 3**: 2-3일 (상태 관리 및 비즈니스 로직)
- **Phase 4**: 1-2일 (고급 기능 및 최적화)
- **총 예상 시간**: 7-10일 (기존 계획 대비 단축)

## 리스크 및 고려사항

### 기술적 장점 (기존 코드 활용)
1. **잘 구조화된 기존 코드**: 이미 컴포넌트 기반으로 분리됨
2. **명확한 상태 관리**: 도메인별로 상태가 분리되어 있음
3. **비즈니스 로직 분리**: 유틸리티 함수들이 잘 정리됨

### 주의사항
1. **기존 코드 보존**: `src/basic/` 디렉토리는 참조용으로 유지
2. **점진적 변환**: 한 번에 모든 것을 변환하지 않고 단계별 진행
3. **기능 검증**: 각 단계마다 기능이 정상 동작하는지 확인

## 즉시 실행할 첫 단계

### 🚀 오늘 당장 해야 할 일 (30분 내 완료)

1. **의존성 설치**:
```bash
npm install react-dom @types/react @types/react-dom @vitejs/plugin-react
```

2. **Vite 설정 수정** (`vite.config.js`)
3. **HTML 파일 수정** (`index.advanced.html`)  
4. **최소 React 앱 생성** (`src/advanced/main.advanced.tsx`)
5. **실행 테스트**: `npm run start:advanced`

### 성공 조건
- React 앱이 브라우저에서 정상 실행됨
- 콘솔에 에러가 없음
- "React Migration - Phase 0 완료!" 메시지가 화면에 표시됨

**이 단계가 완료되면 본격적인 컴포넌트 마이그레이션을 시작할 수 있습니다.** 
